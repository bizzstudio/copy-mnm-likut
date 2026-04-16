import { useContext, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { languageContext } from "../../App";
import { getWordString } from "../Language";
import { FORM_CODE, buildEmptyEntry, COLUMNS } from "./formT02Config";
import SignaturePad from "./SignaturePad";

const BASE = import.meta.env.VITE_MAIN_SERVER_URL || "";

const INTRO_HE =
  "הטופס יתבצע באופן ממוחשב – בהתאם לפורמט זה.";

export default function FormT02() {
  const nav = useNavigate();
  const { language } = useContext(languageContext);
  const [entry, setEntry] = useState(buildEmptyEntry);
  const [saving, setSaving] = useState(false);
  const signatureRef = useRef(null);

  const saveLabel = useMemo(
    () => getWordString(language, "saveDigitalForm"),
    [language]
  );
  const savedOk = useMemo(
    () => getWordString(language, "digitalFormSaved"),
    [language]
  );
  const saveErr = useMemo(
    () => getWordString(language, "digitalFormSaveError"),
    [language]
  );
  const backLabel = useMemo(() => getWordString(language, "back"), [language]);
  const savingLabel = useMemo(
    () => getWordString(language, "savingDigitalForm"),
    [language]
  );
  const completeMsg = useMemo(
    () => getWordString(language, "formT02CompleteFields"),
    [language]
  );
  const signatureHint = useMemo(
    () => getWordString(language, "signatureHint"),
    [language]
  );
  const signatureClearLabel = useMemo(
    () => getWordString(language, "signatureClear"),
    [language]
  );
  const digitalSignatureTitle = useMemo(
    () => getWordString(language, "digitalSignatureLabel"),
    [language]
  );
  const nameLabel = useMemo(() => getWordString(language, "name"), [language]);

  const updateEntry = (key, value) => {
    setEntry((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!entry.receiptDate?.trim()) {
      alert(completeMsg);
      return;
    }
    if (!entry.receiptTime?.trim()) {
      alert(completeMsg);
      return;
    }
    if (!entry.productName?.trim()) {
      alert(completeMsg);
      return;
    }
    if (!entry.receiverName?.trim()) {
      alert(completeMsg);
      return;
    }
    if (signatureRef.current?.isEmpty()) {
      alert(completeMsg);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }
    setSaving(true);
    const sig = signatureRef.current.getDataURL();
    const row = {
      receiptDate: entry.receiptDate.trim(),
      receiptTime: entry.receiptTime.trim(),
      productName: entry.productName.trim(),
      frozenTempIntegrity: entry.frozenTempIntegrity.trim(),
      shelfLifeIntegrity: entry.shelfLifeIntegrity.trim(),
      manufacturerSupplier: entry.manufacturerSupplier.trim(),
      weightQuantity: entry.weightQuantity.trim(),
      certificatesVeterinary: entry.certificatesVeterinary.trim(),
      shipmentIntegrityCleanliness: entry.shipmentIntegrityCleanliness.trim(),
      receiverName: entry.receiverName.trim(),
      signature: sig,
      signatureMime: "image/png",
    };
    const payload = {
      formCode: FORM_CODE,
      submittedAt: new Date().toISOString(),
      melaketId: localStorage.getItem("melaketId") || null,
      data: { entries: [row] },
    };
    try {
      await axios.post(`${BASE}/app/forms/submissions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(savedOk);
      nav("/items");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        saveErr;
      alert(typeof msg === "string" ? msg : saveErr);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 pb-24 text-gray-900" dir="rtl">
      <div className="mx-auto max-w-[120rem] rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <header className="mb-4 border-b border-gray-200 pb-3 text-center text-sm leading-snug">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="text-start font-semibold">
              משה נהוראי מרקטינג בע״מ – מחסן
              <br />
              <span className="font-normal text-gray-700">אבטחת איכות</span>
            </div>
            <div className="flex-1 px-2 text-lg font-bold">
              טופס יומן קבלת סחורה
            </div>
            <div className="text-start text-gray-700">
              טופס {FORM_CODE}
              <br />
              תאריך עדכון: 20/01/26
              <br />
              עמוד 1 מתוך 1
            </div>
          </div>
          <p className="mt-3 text-start text-xs text-gray-700 md:text-sm">
            {INTRO_HE}
          </p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse border border-gray-400 text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`border border-gray-400 p-2 font-semibold leading-tight ${col.width ?? "min-w-[5.5rem]"}`}
                    title={col.labelTitle || col.label}
                  >
                    {col.labelShort || col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {COLUMNS.map((col) => {
                  if (col.type === "receiver") {
                    return (
                      <td
                        key={col.key}
                        className="border border-gray-400 p-2 align-top"
                      >
                        <label className="mb-1 block text-xs font-semibold">
                          {nameLabel}
                        </label>
                        <input
                          type="text"
                          className="mb-3 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                          value={entry.receiverName}
                          onChange={(e) =>
                            updateEntry("receiverName", e.target.value)
                          }
                          autoComplete="name"
                        />
                        <span className="mb-1 block text-xs font-semibold">
                          {digitalSignatureTitle}
                        </span>
                        <p className="mb-2 text-xs text-gray-600">
                          {signatureHint}
                        </p>
                        <div className="w-full max-w-[220px]">
                          <SignaturePad ref={signatureRef} className="w-full" />
                        </div>
                        <button
                          type="button"
                          className="mt-2 rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm font-semibold hover:bg-gray-100"
                          onClick={() => signatureRef.current?.clear()}
                        >
                          {signatureClearLabel}
                        </button>
                      </td>
                    );
                  }
                  if (col.type === "date") {
                    return (
                      <td
                        key={col.key}
                        className="border border-gray-400 p-1 align-top"
                      >
                        <input
                          type="date"
                          className="w-full min-w-0 rounded border border-gray-300 px-1 py-1 text-xs"
                          value={entry[col.key]}
                          onChange={(e) =>
                            updateEntry(col.key, e.target.value)
                          }
                        />
                      </td>
                    );
                  }
                  if (col.type === "time") {
                    return (
                      <td
                        key={col.key}
                        className="border border-gray-400 p-1 align-top"
                      >
                        <input
                          type="time"
                          className="w-full min-w-0 rounded border border-gray-300 px-1 py-1 text-xs"
                          value={entry[col.key]}
                          onChange={(e) =>
                            updateEntry(col.key, e.target.value)
                          }
                        />
                      </td>
                    );
                  }
                  const rows = col.rows ?? 2;
                  return (
                    <td
                      key={col.key}
                      className="border border-gray-400 p-1 align-top"
                    >
                      <textarea
                        rows={rows}
                        className="w-full min-w-0 resize-y rounded border border-gray-300 px-1 py-1 text-xs"
                        value={entry[col.key]}
                        onChange={(e) =>
                          updateEntry(col.key, e.target.value)
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold hover:bg-gray-50"
            onClick={() => nav("/items")}
          >
            {backLabel}
          </button>
          <button
            type="button"
            disabled={saving}
            className="rounded-lg bg-mainColor px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            onClick={handleSubmit}
          >
            {saving ? savingLabel : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
