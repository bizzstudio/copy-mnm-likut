import { useContext, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { languageContext } from "../../App";
import { getWordString } from "../Language";
import { FORM_CODE, buildEmptyEntry, COLUMNS } from "./formT03Config";
import SignaturePad from "./SignaturePad";

const BASE = import.meta.env.VITE_MAIN_SERVER_URL || "";

const INTRO_HE = `תקלה לרבות הפסקות חשמל מעל ארבע שעות, תקלת ציוד, תקלות רישום ביומני טמפרטורה וכו׳. אם התרחשה תקלה בחדר קירור יש לרשום בספר תקלות זה ולדווח ללשכה העירונית לבריאות בתוך 24 שעות ממועד התחלת התקלה. יש לשמור את הספר במשך שנה מתאריך הרישום האחרון.`;

function rowHasContent(e) {
  const keys = [
    "faultDate",
    "faultNature",
    "correctiveAction",
    "repairDate",
    "healthBureauReport",
    "conclusions",
  ];
  return keys.some((k) => e[k]?.trim());
}

export default function FormT03() {
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
  const completeRowsMsg = useMemo(
    () => getWordString(language, "formT03CompleteRows"),
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

  const updateEntry = (key, value) => {
    setEntry((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!rowHasContent(entry)) {
      alert(completeRowsMsg);
      return;
    }
    if (!entry.faultDate?.trim()) {
      alert(completeRowsMsg);
      return;
    }
    if (signatureRef.current?.isEmpty()) {
      alert(completeRowsMsg);
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
      faultDate: entry.faultDate.trim(),
      faultNature: entry.faultNature.trim(),
      correctiveAction: entry.correctiveAction.trim(),
      repairDate: entry.repairDate.trim(),
      healthBureauReport: entry.healthBureauReport.trim(),
      conclusions: entry.conclusions.trim(),
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
      <div className="mx-auto max-w-[110rem] rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <header className="mb-4 border-b border-gray-200 pb-3 text-center text-sm leading-snug">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="text-start font-semibold">
              משה נהוראי מרקטינג בע״מ
              <br />
              <span className="font-normal text-gray-700">אבטחת איכות</span>
            </div>
            <div className="flex-1 px-2 text-lg font-bold">ספר תקלות</div>
            <div className="text-start text-gray-700">
              טופס {FORM_CODE}
              <br />
              תאריך עדכון: 02/11/25
              <br />
              עמוד 1 מתוך 1
            </div>
          </div>
          <p className="mt-3 text-start text-xs leading-relaxed text-gray-700 md:text-sm">
            {INTRO_HE}
          </p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse border border-gray-400 text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`border border-gray-400 p-2 font-semibold leading-tight ${col.width ?? "min-w-[8rem]"}`}
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
                  if (col.type === "signature") {
                    return (
                      <td
                        key={col.key}
                        className="border border-gray-400 p-2 align-top"
                      >
                        <span className="mb-1 block font-semibold">
                          {digitalSignatureTitle}
                        </span>
                        <p className="mb-2 text-xs text-gray-600">
                          {signatureHint}
                        </p>
                        <div className="w-full max-w-xs">
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
                  return (
                    <td
                      key={col.key}
                      className="border border-gray-400 p-1 align-top"
                    >
                      <textarea
                        rows={3}
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
