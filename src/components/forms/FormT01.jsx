import { useContext, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { languageContext } from "../../App";
import { getWordString } from "../Language";
import {
  FORM_CODE,
  ROW_KEYS,
  ZONE_KEYS,
  ROW_LABELS,
  ZONE_LABELS,
  buildEmptyMatrix,
} from "./formT01Config";
import SignaturePad from "./SignaturePad";

const BASE = import.meta.env.VITE_MAIN_SERVER_URL || "";

export default function FormT01() {
  const nav = useNavigate();
  const { language } = useContext(languageContext);
  const [matrix, setMatrix] = useState(buildEmptyMatrix);
  const [inspectionDate, setInspectionDate] = useState("");
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
  const requiredMsg = useMemo(
    () => getWordString(language, "formT01RequiredDateSignature"),
    [language]
  );
  const backLabel = useMemo(() => getWordString(language, "back"), [language]);
  const savingLabel = useMemo(
    () => getWordString(language, "savingDigitalForm"),
    [language]
  );
  const signatureClearLabel = useMemo(
    () => getWordString(language, "signatureClear"),
    [language]
  );
  const signatureHint = useMemo(
    () => getWordString(language, "signatureHint"),
    [language]
  );
  const digitalSignatureTitle = useMemo(
    () => getWordString(language, "digitalSignatureLabel"),
    [language]
  );

  const toggleCell = (row, zone) => {
    setMatrix((prev) => ({
      ...prev,
      [row]: { ...prev[row], [zone]: !prev[row][zone] },
    }));
  };

  const handleSubmit = async () => {
    if (!inspectionDate.trim() || signatureRef.current?.isEmpty()) {
      alert(requiredMsg);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }
    setSaving(true);
    const melaketId = localStorage.getItem("melaketId") || null;
    const payload = {
      formCode: FORM_CODE,
      submittedAt: new Date().toISOString(),
      melaketId,
      data: {
        matrix,
        inspectionDate: inspectionDate.trim(),
        signature: signatureRef.current?.getDataURL() ?? "",
        signatureMime: "image/png",
      },
    };
    try {
      await axios.post(`${BASE}/app/forms/submissions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(savedOk);
      nav("/items");
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        saveErr;
      alert(typeof msg === "string" ? msg : saveErr);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 pb-24 text-gray-900" dir="rtl">
      <div className="mx-auto max-w-6xl rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <header className="mb-4 border-b border-gray-200 pb-3 text-center text-sm leading-snug">
          <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
            <div className="text-start font-semibold">
              משה נהוראי מרקטינג בע״מ – מחסן
              <br />
              <span className="font-normal text-gray-700">אבטחת איכות</span>
            </div>
            <div className="flex-1 px-2 text-lg font-bold md:order-none">
              טופס בדיקת ניקיון ותשתיות
            </div>
            <div className="text-start text-gray-700">
              טופס {FORM_CODE}
              <br />
              תאריך עדכון: 20/01/26
              <br />
              עמוד 1 מתוך 1
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-600 md:text-sm">
            <strong>תדירות:</strong> מילוי שבועי – בתחילת שבוע עבודה.
            <span className="mx-2">|</span>
            <strong>סימון תקין (V)</strong> — סמן את התא.
            <span className="mx-2">|</span>
            <strong>לא תקין</strong> — השאר ללא סימון (לציין ליקוי שנמצא).
          </p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse border border-gray-400 text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="w-40 border border-gray-400 p-2 align-bottom font-semibold">
                  שם החדר / תאריך
                </th>
                {ZONE_KEYS.map((z) => (
                  <th
                    key={z}
                    className="border border-gray-400 p-2 align-bottom font-semibold leading-tight"
                  >
                    {ZONE_LABELS[z]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROW_KEYS.map((row) => (
                <tr key={row}>
                  <th className="border border-gray-400 bg-gray-50 p-2 text-start font-semibold leading-tight">
                    {ROW_LABELS[row]}
                  </th>
                  {ZONE_KEYS.map((zone) => (
                    <td
                      key={zone}
                      className="border border-gray-400 p-1 text-center align-middle"
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 cursor-pointer accent-mainColor"
                        checked={matrix[row][zone]}
                        onChange={() => toggleCell(row, zone)}
                        aria-label={`${ROW_LABELS[row]} — ${ZONE_LABELS[zone]}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="border border-gray-400 p-2 align-top">
                  <span className="mb-1 block font-semibold">תאריך</span>
                  <input
                    type="date"
                    className="w-full max-w-[11rem] rounded border border-gray-300 px-2 py-1"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                  />
                </td>
                <td
                  colSpan={ZONE_KEYS.length}
                  className="border border-gray-400 p-2 align-top"
                >
                  <span className="mb-1 block font-semibold">{digitalSignatureTitle}</span>
                  <p className="mb-2 text-xs text-gray-600">{signatureHint}</p>
                  <div className="w-full max-w-xl">
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
