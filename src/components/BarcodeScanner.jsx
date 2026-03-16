// src/components/BarcodeScanner.jsx
import React, { useRef, useEffect, useCallback, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import {
  SCANNER_FORMATS,
  SCANNER_LOCK_AFTER_SCAN_MS,
  SCANNER_DEBOUNCE_MS,
  SCANNER_CONSTRAINTS,
  SCANNER_CONSTRAINTS_MID,
  SCANNER_CONSTRAINTS_MINIMAL,
  SCANNER_CONSTRAINTS_USER,
  SCANNER_STYLES,
  SCANNER_REGION,
  SCANNER_TIME_BETWEEN_DECODING_ATTEMPTS_MS,
  SCANNER_CANVAS_FALLBACK_INTERVAL_MS,
} from "../utils/scannerConfig";

// 🔹 HINTS – מקסימום זיהוי: רחוקים, קטנים, מקומטים, מטושטשים, אור/סינוור (בלי PURE_BARCODE – מזיק כשברקוד קטן במסגרת)
const HINTS = (() => {
  const hints = new Map();
  const formats = SCANNER_FORMATS.map((name) => BarcodeFormat[name]).filter(Boolean);
  if (formats.length) hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  if (DecodeHintType.TRY_HARDER !== undefined) hints.set(DecodeHintType.TRY_HARDER, true);
  if (DecodeHintType.ALSO_INVERTED !== undefined) hints.set(DecodeHintType.ALSO_INVERTED, true);
  if (DecodeHintType.ASSUME_GS1 !== undefined) hints.set(DecodeHintType.ASSUME_GS1, true);
  return hints;
})();

// 🔹 Debounce פשוט
function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  return useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

// 🔹 עיבוד קנבס לשיפור זיהוי: אור חזק, צל, קימוט – מתיחת ניגוד ו/או היפוך
function drawVideoToCanvas(canvas, video) {
  if (!video?.videoWidth || !video?.videoHeight) return false;
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(video, 0, 0, w, h);
  return true;
}

function applyContrastStretch(ctx, w, h) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  let minL = 255;
  let maxL = 0;
  for (let i = 0; i < data.length; i += 4) {
    const L = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) | 0;
    if (L < minL) minL = L;
    if (L > maxL) maxL = L;
  }
  const range = maxL - minL || 1;
  for (let i = 0; i < data.length; i += 4) {
    const L = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) | 0;
    const v = Math.max(0, Math.min(255, ((L - minL) / range) * 255)) | 0;
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyInvert(ctx, w, h) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  ctx.putImageData(imageData, 0, 0);
}

// 🔹 צליל קצר בסריקה מוצלחת
function playScanSuccessBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (_) {}
}

export default function BarcodeScanner({
  onScan,
  onError,
  paused = false,
  playSoundOnScan = true,
  enableTorch = false,
  className = "",
  style = {},
}) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const startScanningRef = useRef(null);
  const lockedUntilRef = useRef(0);
  const canvasRef = useRef(null);
  const canvasFallbackIntervalRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  const stopScanning = useCallback(() => {
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    if (canvasFallbackIntervalRef.current) {
      clearInterval(canvasFallbackIntervalRef.current);
      canvasFallbackIntervalRef.current = null;
    }
    try { controlsRef.current?.stop(); } catch (_) {}
    controlsRef.current = null;
    try { readerRef.current?.releaseAllStreams(); } catch (_) {}
    readerRef.current = null;
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleResult = useCallback(
    (text) => {
      const barcode = typeof text === "string" ? text.trim() : "";
      if (!barcode) return;
      if (Date.now() < lockedUntilRef.current) return;
      lockedUntilRef.current = Date.now() + SCANNER_LOCK_AFTER_SCAN_MS;
      if (playSoundOnScan) playScanSuccessBeep();
      onScan(barcode);
    },
    [onScan, playSoundOnScan]
  );

  const debouncedHandleResult = useDebouncedCallback(handleResult, SCANNER_DEBOUNCE_MS);

  const startScanning = useCallback(() => {
    if (!videoRef.current || paused) return;
    setCameraError(null);
    const reader = new BrowserMultiFormatReader(HINTS);
    if (typeof reader.timeBetweenDecodingAttempts !== "undefined") {
      reader.timeBetweenDecodingAttempts = SCANNER_TIME_BETWEEN_DECODING_ATTEMPTS_MS;
    }
    readerRef.current = reader;

    const tryDecode = async (constraints) => {
      const controls = await reader.decodeFromConstraints(
        { video: constraints },
        videoRef.current,
        (result, err, controls) => {
          if (controls) controlsRef.current = controls;
          if (err) return;
          if (result?.getText) debouncedHandleResult(result.getText());
        }
      );

      // Torch אם מבוקש ותומך
      if (enableTorch && videoRef.current?.srcObject) {
        const track = videoRef.current.srcObject.getVideoTracks()[0];
        if (track?.applyConstraints) {
          const capabilities = track.getCapabilities();
          if (capabilities.torch) {
            try { track.applyConstraints({ advanced: [{ torch: true }] }); } catch (_) {}
          }
        }
      }
      return controls;
    };

    const setError = (err) => {
      const msg = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
        ? "cameraPermissionDenied"
        : err?.message || "cameraError";
      setCameraError(msg);
      if (onError) onError(err);
    };

    tryDecode(SCANNER_CONSTRAINTS)
      .then((c) => { controlsRef.current = c; })
      .catch(() => tryDecode(SCANNER_CONSTRAINTS_MID).then((c) => { controlsRef.current = c; }))
      .catch(() => tryDecode(SCANNER_CONSTRAINTS_MINIMAL).then((c) => { controlsRef.current = c; }))
      .catch(() => tryDecode(SCANNER_CONSTRAINTS_USER).then((c) => { controlsRef.current = c; }))
      .catch(setError);
  }, [paused, debouncedHandleResult, enableTorch, onError]);

  startScanningRef.current = startScanning;

  // 🔹 Fallback: פענוח מקנבס מעובד (ניגוד + היפוך) – לברקודים עם אור/קימוט/סינוור
  const runCanvasFallbackTick = useCallback(() => {
    const video = videoRef.current;
    const reader = readerRef.current;
    if (!video || !reader || !controlsRef.current || video.videoWidth === 0) return;
    if (Date.now() < lockedUntilRef.current) return;
    let canvas = canvasRef.current;
    if (!canvas) canvasRef.current = canvas = document.createElement("canvas");
    if (!drawVideoToCanvas(canvas, video)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    try {
      applyContrastStretch(ctx, w, h);
      const result = reader.decodeFromCanvas(canvas);
      if (result?.getText) {
        debouncedHandleResult(result.getText());
        return;
      }
    } catch (_) {}
    try {
      applyInvert(ctx, w, h);
      const result = reader.decodeFromCanvas(canvas);
      if (result?.getText) debouncedHandleResult(result.getText());
    } catch (_) {}
  }, [debouncedHandleResult]);

  useEffect(() => {
    if (paused) { stopScanning(); return; }
    const timer = setTimeout(startScanning, 200);
    const fallbackId = setInterval(runCanvasFallbackTick, SCANNER_CANVAS_FALLBACK_INTERVAL_MS);
    canvasFallbackIntervalRef.current = fallbackId;
    return () => {
      clearTimeout(timer);
      clearInterval(fallbackId);
      canvasFallbackIntervalRef.current = null;
      stopScanning();
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, [paused, startScanning, stopScanning, runCanvasFallbackTick]);

  const { x, y, width, height } = SCANNER_REGION;

  return (
    <div className={className} style={{ position: "relative", ...SCANNER_STYLES.container, ...style }}>
      <video ref={videoRef} muted playsInline autoPlay style={SCANNER_STYLES.video} />
      <div
        style={{
          position: "absolute",
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: `${width * 100}%`,
          height: `${height * 100}%`,
          border: "3px solid rgba(255,255,255,0.8)",
          borderRadius: 8,
          boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.2)",
          pointerEvents: "none",
        }}
      />
      {cameraError && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12, background: "rgba(0,0,0,0.6)", color: "#fff", padding: 16, textAlign: "center", fontSize: 14
        }}>
          <span>{cameraError === "cameraPermissionDenied" ? "נא לאפשר גישה למצלמה בהגדרות הדפדפן" : "שגיאה בהפעלת המצלמה. בדוק הרשאות או נסה מכשיר אחר."}</span>
          <button type="button" onClick={() => { setCameraError(null); stopScanning(); setTimeout(() => startScanningRef.current?.(), 150); }} className="rounded-lg bg-white px-4 py-2 text-gray-800 font-medium">
            נסה שוב
          </button>
        </div>
      )}
    </div>
  );
}