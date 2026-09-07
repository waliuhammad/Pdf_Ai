"use client";

import React, { useState, useEffect, useRef, useCallback, JSX } from "react";
import { DownloadNotice } from "@/components/download-notice";
import { SecureNote, UploadCard } from "@/components/tools/upload-card";
import { FileText, Trash2, RotateCw, Download, Loader2, Layers } from "lucide-react";
import { errorName } from "@/lib/errors";
// Type-only, so it adds nothing to the bundle — the library itself still
// arrives through the dynamic import below.
import type * as PdfjsLib from "pdfjs-dist";
import { downloadBlob } from "@/lib/download";
import { useCancellableRun, wasCancelled } from "@/hooks/useCancellableRun";
// Given a rotated rectangle, returns the scale factor needed so its
// bounding box fits inside a target box (never scales up past 1).
function getFitScale(
  contentWidth: number,
  contentHeight: number,
  angleDeg: number,
  boxWidth: number,
  boxHeight: number
): number {
  if (!contentWidth || !contentHeight || !boxWidth || !boxHeight) return 1;
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const rotatedWidth = contentWidth * cos + contentHeight * sin;
  const rotatedHeight = contentWidth * sin + contentHeight * cos;
  if (rotatedWidth === 0 || rotatedHeight === 0) return 1;
  return Math.min(boxWidth / rotatedWidth, boxHeight / rotatedHeight, 1);
}

function normalizeDeg(v: number): number {
  return ((Math.round(v) % 360) + 360) % 360;
}

// Snaps to the nearest cardinal direction when close to one, so it's
// easy to land exactly on 0/90/180/270 while dragging freely everywhere
// else.
function applySnap(deg: number): number {
  const normalized = normalizeDeg(deg);
  const cardinals = [0, 90, 180, 270, 360];
  for (const c of cardinals) {
    if (Math.abs(normalized - c) <= 4) return normalizeDeg(c);
  }
  return normalized;
}

interface RotationCornerHandleProps {
  value: number;
  onChange: (deg: number) => void;
  frameRef: React.RefObject<HTMLDivElement | null>;
}

// Steps forward to the next of the 4 main directions (0/90/180/270),
// wrapping back to 0 after 270 — used for a plain click on the handle.
function nextCardinal(current: number): number {
  const c = normalizeDeg(current);
  if (c < 90) return 90;
  if (c < 180) return 180;
  if (c < 270) return 270;
  return 0;
}

// A circular handle with a curved rotate arrow, sitting in the empty
// corner of the preview frame rather than overlapping the page.
// - A plain click/tap steps through the 4 main directions (0° → 90° →
//   180° → 270° → 0°), for the common quick-rotate case.
// - Pressing and dragging instead rotates freely to any custom angle,
//   tracked as an incremental delta from the drag start so it stays
//   smooth no matter where on screen it starts.
function RotationCornerHandle({ value, onChange, frameRef }: RotationCornerHandleProps): JSX.Element {
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const startAngleRef = useRef(0);
  const startValueRef = useRef(0);
  const startPointRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  // Below this pixel distance, a press+release counts as a click (cycle
  // through cardinals) rather than a drag (free custom angle).
  const DRAG_THRESHOLD_PX = 6;

  const angleFromCenter = useCallback(
    (clientX: number, clientY: number): number | null => {
      const el = frameRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      // 0deg = straight up, positive = clockwise, matches CSS rotate().
      let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      return deg;
    },
    [frameRef]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const angle = angleFromCenter(e.clientX, e.clientY);
    if (angle === null) return;
    draggingRef.current = true;
    movedRef.current = false;
    setDragging(true);
    startAngleRef.current = angle;
    startValueRef.current = value;
    startPointRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    const dxPixels = e.clientX - startPointRef.current.x;
    const dyPixels = e.clientY - startPointRef.current.y;
    if (Math.hypot(dxPixels, dyPixels) > DRAG_THRESHOLD_PX) {
      movedRef.current = true;
    }
    if (!movedRef.current) return;
    const angle = angleFromCenter(e.clientX, e.clientY);
    if (angle === null) return;
    const delta = angle - startAngleRef.current;
    onChange(applySnap(startValueRef.current + delta));
  };
  const handlePointerUp = () => {
    draggingRef.current = false;
    setDragging(false);
    if (!movedRef.current) {
      // A genuine click (no meaningful drag) — step to the next main direction.
      onChange(nextCardinal(value));
    }
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title={`Click to step 0°/90°/180°/270° — drag for a custom angle (currently ${value}°)`}
      aria-label="Click to step through 0, 90, 180, 270 degrees, or drag to rotate to a custom angle"
      role="slider"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={value}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(normalizeDeg(value + step));
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(normalizeDeg(value - step));
        }
      }}
      className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none transition-all ${
        dragging
          ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 scale-110 shadow-lg"
          : "bg-card/95 backdrop-blur border-card text-fg shadow-md hover:scale-105 hover:border-slate-400 dark:hover:border-slate-500"
      }`}
    >
      <RotateCw
        className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none"
        style={{ transform: `rotate(${value}deg)`, transition: dragging ? "none" : "transform 0.2s ease-in-out" }}
      />
      {dragging && (
        <span className="absolute -top-8 right-0 text-[11px] font-bold font-mono px-2 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-md whitespace-nowrap pointer-events-none">
          {value}°
        </span>
      )}
    </button>
  );
}

export default function RotatePdfPage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const { begin, cancel } = useCancellableRun();
  const [pdfDoc, setPdfDoc] = useState<PdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [mode, setMode] = useState<"all" | "custom">("all");
  const [pageNumber, setPageNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [libLoading, setLibLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<typeof PdfjsLib | null>(null);
  const [pageSizes, setPageSizes] = useState<Record<number, { w: number; h: number }>>({});
  const [boxSize, setBoxSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  // The angle field is edited as free-form text so mid-typing states like
  // "36" (on the way to "360") never get force-normalized. It's kept in
  // sync with `rotation` whenever the field isn't focused, and only
  // parsed/clamped back into `rotation` on blur or Enter.
  const [angleInputValue, setAngleInputValue] = useState<string>("0");
  const [angleFieldFocused, setAngleFieldFocused] = useState<boolean>(false);

  // Shown, rather than mirrored into state by an effect. While the field has
  // focus it shows exactly what is being typed; the rest of the time it shows
  // whatever `rotation` is, so the rotate buttons and the per-page controls
  // move it without anything having to keep two values in step. The effect
  // that used to do that ran a second render after every rotation, and only
  // to copy a number that was already on hand.
  const angleShown = angleFieldFocused ? angleInputValue : String(rotation);

  const commitAngleInput = (): void => {
    const parsed = parseInt(angleInputValue, 10);
    const next = Number.isNaN(parsed) ? rotation : normalizeDeg(parsed);
    setRotation(next);
    setAngleInputValue(String(next));
  };

  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});
  const measuredFrameRef = useRef<HTMLDivElement | null>(null);

  // Measures the fixed-size preview frame so we know how much room a
  // rotated page has to work with, and keeps it current on resize.
  const frameRefCallback = useCallback((el: HTMLDivElement | null) => {
    measuredFrameRef.current = el;
    if (el) {
      const rect = el.getBoundingClientRect();
      setBoxSize({ w: rect.width, h: rect.height });
    }
  }, []);

  useEffect(() => {
    const el = measuredFrameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setBoxSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [numPages]);

  useEffect(() => {
    let isMounted = true;
    import("pdfjs-dist")
      .then((lib) => {
        if (!isMounted) return;
        if (typeof window !== "undefined") {
          lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.js`;
        }
        setPdfjsLib(lib);
        setLibLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load pdfjs:", err);
        if (isMounted) {
          setError("Failed to load PDF engine.");
          setLibLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange = async (fileList: FileList | null): Promise<void> => {
    if (fileList && fileList[0]) {
      const selectedFile = fileList[0];
      if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf")) {
        setFile(selectedFile);
        setRotation(0);
        setMode("all");
        setPageNumber("");
        setError(null);
        setPageSizes({});

        if (!pdfjsLib) {
          setError("PDF engine is still initializing. Please wait and re-upload.");
          return;
        }

        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            useWorkerFetch: false,
            isEvalSupported: false,
            disableFontFace: true,
          });

          const loadedPdf = await loadingTask.promise;

          if (!loadedPdf || loadedPdf.numPages === 0) {
            throw new Error("No pages found in this PDF.");
          }

          setPdfDoc(loadedPdf);
          setNumPages(loadedPdf.numPages);
        } catch (err) {
      if (wasCancelled(err)) return;
          console.error("PDF parse error:", err);

          if (errorName(err) === "PasswordException") {
            setError("This PDF is password-protected. Please provide an unprotected file.");
          } else {
            setError("Could not read PDF structure. Ensure the file is a valid, uncorrupted PDF.");
          }

          setPdfDoc(null);
          setNumPages(0);
        }
      } else {
        setError("Please upload a valid PDF document.");
      }
    }
  };

  const handleClearFile = (): void => {
    // Removing the file stops whatever it was being used for.
    cancel();
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setRotation(0);
    setMode("all");
    setPageNumber("");
    setError(null);
    setPageSizes({});
  };

  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    let isMounted = true;

    const renderPages = async (): Promise<void> => {
      const sizes: Record<number, { w: number; h: number }> = {};

      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await pdfDoc.getPage(i);
          const canvas = canvasRefs.current[i];
          if (!canvas || !isMounted) continue;

          const context = canvas.getContext("2d");
          if (!context) continue;

          const viewport = page.getViewport({ scale: 1.0 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          sizes[i] = { w: viewport.width, h: viewport.height };

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          const renderTask = page.render(renderContext);
          await renderTask.promise;
        } catch (err) {
      if (wasCancelled(err)) return;
          console.error(`Error rendering page ${i}:`, err);
        }
      }

      if (isMounted) setPageSizes(sizes);
    };

    renderPages();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, numPages]);

  const handleRotateAndDownload = async (): Promise<void> => {
    const signal = begin();
    if (!file) return;

    // Nothing to save at 0°: the file would come back byte-for-byte as it
    // went out, having spent one of the day's operations to do it.
    if (rotation === 0) {
      setError("Set a rotation angle before saving.");
      return;
    }

    let targetPage: number | null = null;
    if (mode === "custom") {
      const parsed = parseInt(pageNumber, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > numPages) {
        setError(`Please enter a valid page number between 1 and ${numPages}.`);
        return;
      }
      targetPage = parsed;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Whole document: every page gets the same angle. Specific page: only
      // the chosen page is rotated, everything else stays untouched.
      const angles: Record<number, number> = {};
      if (mode === "all") {
        for (let page = 1; page <= numPages; page++) {
          angles[page] = rotation;
        }
      } else if (targetPage !== null) {
        angles[targetPage] = rotation;
      }
      formData.append("rotations", JSON.stringify(angles));

      const res = await fetch("/api/rotate-pdf", {
        method: "POST",
        body: formData, signal });

      if (!res.ok) {
        let errorMessage = "Rotation failed.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch { }
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      downloadBlob(blob, `${file.name.replace(/\.[^/.]+$/, "")}_rotated.pdf`);
    } catch (err: unknown) {
      if (wasCancelled(err, signal)) return;
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during rotation.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
      {/* Header — same pattern as the other tool pages */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-card border border-card flex items-center justify-center mb-3 text-fg shadow-sm">
          <RotateCw className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-fg tracking-tight px-2">
          Rotate PDF Pages
        </h1>
        <p className="text-muted text-[13px] sm:text-sm mt-1.5 max-w-xs sm:max-w-lg mx-auto leading-relaxed">
          Rotate your entire document or target a single specific page cleanly.
        </p>
      </div>

      {libLoading ? (
        <div className="border-2 border-dashed border-card rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center bg-[var(--background-secondary)] gap-3">
          <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-fg animate-spin" />
          <span className="text-[13px] sm:text-sm text-muted font-medium">Initializing PDF engine...</span>
        </div>
      ) : !file ? (
        <UploadCard onFiles={handleFileChange} title="Click to browse or drag & drop a PDF" hint="PDF documents" />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* File summary */}
          <div className="bg-card border border-card rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-card border border-card flex items-center justify-center text-fg shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-fg text-[13px] sm:text-sm font-bold truncate">{file.name}</p>
                <p className="text-[11px] sm:text-xs text-muted mt-0.5 truncate">
                  Size: <strong className="text-fg">{(file.size / (1024 * 1024)).toFixed(2)} MB</strong> •{" "}
                  {numPages} {numPages === 1 ? "Page" : "Pages"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearFile}
              className="p-2 sm:p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors shrink-0"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          {/* Rotation settings */}
          <div className="bg-card border border-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-card">
              <RotateCw className="w-4 h-4 text-fg shrink-0" />
              <span className="text-[13px] sm:text-sm font-extrabold text-fg truncate">Rotation Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("all")}
                className={`w-full px-4 py-3 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg"
                  : "bg-card border border-card text-muted hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Whole Document</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("custom")}
                className={`w-full px-4 py-3 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === "custom"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg"
                  : "bg-card border border-card text-muted hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Specific Page</span>
              </button>
            </div>

            {mode === "custom" && (
              <div className="pt-1">
                <label className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-muted block mb-1">
                  Target Page (1 – {numPages || 1})
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={numPages || 1}
                  placeholder="e.g. 1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  className="w-full bg-card border border-card rounded-xl px-3 py-3 sm:py-2.5 text-base sm:text-sm text-fg placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition"
                />
                <p className="text-[11px] text-muted mt-1.5">Enter the exact page number you wish to rotate.</p>
              </div>
            )}
          </div>

          {/* Page preview */}
          {numPages > 0 && (
            <div className="bg-card border border-card rounded-2xl p-3 sm:p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 pb-2 mb-3 border-b border-card">
                <span className="text-[10px] sm:text-xs font-extrabold text-fg uppercase tracking-wider">
                  Page Preview ({numPages} Total)
                </span>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-muted uppercase tracking-wider pr-0.5">
                    Type custom angle
                  </span>
                  <div className="flex items-center gap-1 bg-card border border-card rounded-lg px-2.5 py-1.5 focus-within:border-slate-900 dark:focus-within:border-white transition">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={angleShown}
                      onFocus={(e) => {
                        setAngleInputValue(String(rotation));
                        setAngleFieldFocused(true);
                        // Select-all on focus so typing a new value doesn't
                        // require manually clearing the old one first.
                        e.currentTarget.select();
                      }}
                      onChange={(e) => {
                        // Allow only digits while typing — no normalization
                        // here, so "3" -> "36" -> "360" never gets clobbered
                        // mid-entry (e.g. 360 % 360 briefly showing as 0).
                        const digitsOnly = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                        setAngleInputValue(digitsOnly);
                        // Update the live preview immediately as the person
                        // types, using the raw (unwrapped) number — CSS
                        // rotation handles any value fine, and normalizing
                        // is deferred to blur/Enter so the display doesn't
                        // jump mid-entry.
                        if (digitsOnly === "") {
                          setRotation(0);
                        } else {
                          const parsed = parseInt(digitsOnly, 10);
                          if (!Number.isNaN(parsed)) setRotation(parsed);
                        }
                      }}
                      onBlur={() => {
                        setAngleFieldFocused(false);
                        commitAngleInput();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          const step = e.shiftKey ? 10 : 1;
                          const next = normalizeDeg((parseInt(angleInputValue, 10) || 0) + step);
                          setRotation(next);
                          setAngleInputValue(String(next));
                        }
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          const step = e.shiftKey ? 10 : 1;
                          const next = normalizeDeg((parseInt(angleInputValue, 10) || 0) - step);
                          setRotation(next);
                          setAngleInputValue(String(next));
                        }
                      }}
                      aria-label="Type a custom rotation angle in degrees"
                      placeholder="0"
                      className="w-12 sm:w-14 bg-transparent text-sm sm:text-base font-bold text-fg text-right focus:outline-none placeholder:text-muted/50"
                    />
                    <span className="text-sm sm:text-base font-bold text-fg">°</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted -mt-1.5 mb-3 text-center">
                Type an exact angle above, click the <RotateCw className="inline w-3 h-3 -mt-0.5" /> icon to step through 0°/90°/180°/270°, or drag it for a custom angle.
              </p>

              <div className="w-full max-h-[340px] sm:max-h-[420px] overflow-y-auto space-y-3 sm:space-y-4 pr-1">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum, idx) => {
                  const isTargetRotated = mode === "all" || (mode === "custom" && pageNumber === String(pageNum));
                  const currentDegrees = isTargetRotated ? rotation : 0;
                  const natural = pageSizes[pageNum];
                  const scale = natural
                    ? getFitScale(natural.w, natural.h, currentDegrees, boxSize.w, boxSize.h)
                    : 1;

                  return (
                    <div
                      key={pageNum}
                      className="bg-[var(--background-secondary)] border border-card rounded-xl p-2.5 sm:p-3 flex flex-col items-center"
                    >
                      <div className="w-full flex justify-between items-center gap-2 mb-2 text-[11px] text-muted px-1">
                        <span className="font-semibold truncate">
                          Page {pageNum} of {numPages}
                        </span>

                        <span className={`px-2 py-0.5 rounded font-mono border ${isTargetRotated && rotation !== 0
                          ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]"
                          : "bg-card border-card text-fg"
                          }`}>
                          {currentDegrees}°
                        </span>
                      </div>
                      <div
                        ref={idx === 0 ? frameRefCallback : undefined}
                        className="relative w-full h-56 sm:h-80 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-black/60 rounded-lg p-2"
                      >
                        <canvas
                          ref={(el) => {
                            canvasRefs.current[pageNum] = el;
                          }}
                          className="object-contain origin-center shadow-md"
                          style={{
                            transform: `rotate(${currentDegrees}deg) scale(${scale})`,
                            transition: "transform 0.2s ease-in-out",
                          }}
                        />
                        {/* Rotate handle lives in the empty dark corner of the frame, not over the page */}
                        {idx === 0 && (
                          <RotationCornerHandle value={rotation} onChange={setRotation} frameRef={measuredFrameRef} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted mt-3 text-center">Scroll to inspect every page.</p>
            </div>
          )}

          {error && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[13px] sm:text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleRotateAndDownload}
            disabled={loading || rotation === 0}
            className="w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-[13px] sm:text-base shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:bg-slate-800 dark:hover:bg-zinc-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            ) : (
              <Download className="w-5 h-5 shrink-0" />
            )}
            <span>
              {loading
                ? "Processing document..."
                : rotation === 0
                  ? "Set an angle to enable download"
                  : "Save & Download PDF"}
            </span>
          </button>
        </div>
      )}

      {/* Errors before a file is chosen still need somewhere to show */}
      {error && !file && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[13px] font-semibold text-center">
          {error}
        </div>
      )}

      <DownloadNotice message="Document rotated and downloaded." />

      <SecureNote />
    </div>
  );
}