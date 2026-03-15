import React, { useState, useEffect, lazy, Suspense, useContext } from "react";
import { languageContext } from "../../App";
import { getWord, getWordString } from "../Language";
import axios from "axios";

const Scanner = lazy(() =>
  import("@yudiel/react-qr-scanner").then((mod) => ({ default: mod.Scanner }))
);

const BASE = import.meta.env.VITE_MAIN_SERVER_URL || "";

export default function BarcodeStockModal({ isOpen, onClose, onSuccess, entryMode = "scan" }) {
  const { language } = useContext(languageContext);
  const t = (key) => getWordString(language, key);

  const [step, setStep] = useState("scan");
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [manualBarcodeInput, setManualBarcodeInput] = useState("");
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadScanner, setLoadScanner] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep("scan");
      setScannedBarcode(null);
      setManualBarcodeInput("");
      setProduct(null);
      setQuantity("");
      setLoading(false);
      setSubmitting(false);
      setError(null);
      setLoadScanner(false);
    } else {
      const id = setTimeout(() => setLoadScanner(true), 100);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  const token = localStorage.getItem("token");

  const fetchProductByBarcode = async (barcode) => {
    if (!barcode?.trim() || loading) return;
    const trimmed = String(barcode).trim();
    setScannedBarcode(trimmed);
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${BASE}/products/barcode/${encodeURIComponent(trimmed)}/app`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const prod = res?.data;
      if (prod && (prod._id || prod.id)) {
        setProduct(prod);
        setStep("quantity");
      } else {
        setError(t("productNotFoundBarcode"));
      }
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 400) {
        setError(t("productNotFoundBarcode"));
      } else {
        setError(err?.response?.data?.message?.he || err?.response?.data?.message?.en || "שגיאה");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (detectedCodes) => {
    if (!detectedCodes?.length || loading) return;
    const barcode = detectedCodes[0]?.rawValue;
    if (!barcode) return;
    await fetchProductByBarcode(barcode);
  };

  const handleManualSearch = () => {
    if (!manualBarcodeInput?.trim()) return;
    fetchProductByBarcode(manualBarcodeInput.trim());
  };

  const handleAddStock = async () => {
    const qty = parseInt(quantity, 10);
    if (!scannedBarcode || !Number.isFinite(qty) || qty < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      await axios.patch(
        `${BASE}/products/barcode/${encodeURIComponent(scannedBarcode)}/add-stock-app`,
        { quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t("stockAddedSuccess"));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message?.he || err?.response?.data?.message?.en || "שגיאה בעדכון מלאי");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {entryMode === "manual" ? getWord("manualBarcodeEntry") : getWord("scanBarcode")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        {error && (
          <p className="mb-3 text-center text-red-600">{error}</p>
        )}

        {step === "scan" && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-mainColor border-t-transparent" />
                <p className="mt-2 text-gray-600">בודק מוצר...</p>
              </div>
            ) : entryMode === "manual" ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {getWord("enterBarcode")}
                </label>
                <input
                  type="text"
                  value={manualBarcodeInput}
                  onChange={(e) => setManualBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="7290012345678"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleManualSearch}
                  disabled={!manualBarcodeInput?.trim()}
                  className="w-full rounded-lg bg-mainColor py-2 text-white disabled:opacity-50"
                >
                  {getWord("search")}
                </button>
              </div>
            ) : (
              <>
                <p className="mb-3 text-center text-gray-600">{getWord("scanInstructions")}</p>
                <div className="overflow-hidden rounded-lg" style={{ height: 260 }}>
                  {loadScanner ? (
                    <Suspense
                      fallback={
                        <div className="flex h-full items-center justify-center bg-gray-100">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mainColor border-t-transparent" />
                        </div>
                      }
                    >
                      <Scanner
                        onScan={handleScan}
                        constraints={{ facingMode: "environment" }}
                        styles={{
                          container: { width: "100%", height: "100%" },
                          video: { width: "100%", height: "100%", objectFit: "cover" },
                        }}
                      />
                    </Suspense>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-mainColor border-t-transparent" />
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {step === "quantity" && product && (
          <div className="space-y-4">
            <p className="font-medium text-gray-800">
              {product?.title?.he || product?.title?.en || scannedBarcode}
            </p>
            <p className="text-sm text-gray-500">ברקוד: {scannedBarcode}</p>
            <label className="block text-sm font-medium text-gray-700">
              {getWord("quantityInStock")}
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="0"
            />
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-4">
          {step === "quantity" ? (
            <>
              <button
                type="button"
                onClick={() => { setStep("scan"); setError(null); setQuantity(""); setProduct(null); setScannedBarcode(null); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                {getWord("back")}
              </button>
              <button
                type="button"
                onClick={handleAddStock}
                disabled={submitting || !quantity || parseInt(quantity, 10) < 1}
                className="rounded-lg bg-mainColor px-4 py-2 text-white disabled:opacity-50"
              >
                {submitting ? "..." : getWord("addToStock")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              {getWord("close")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
