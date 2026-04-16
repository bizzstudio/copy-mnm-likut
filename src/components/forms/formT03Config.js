/** טופס T03 — ספר תקלות */

export const FORM_CODE = "T03";
export function buildEmptyEntry() {
  return {
    faultDate: "",
    faultNature: "",
    correctiveAction: "",
    repairDate: "",
    healthBureauReport: "",
    conclusions: "",
  };
}

/** סדר עמודות מימין לשמאל (תצוגה RTL) */
export const COLUMNS = [
  { key: "faultDate", label: "התאריך", type: "date", width: "w-[7.5rem]" },
  { key: "faultNature", label: "מהות התקלה", type: "textarea" },
  {
    key: "correctiveAction",
    label: "פעולה מתקנת / מונעת",
    type: "textarea",
  },
  { key: "repairDate", label: "תאריך ביצוע תיקון", type: "date", width: "w-[7.5rem]" },
  {
    key: "healthBureauReport",
    labelShort: "דיווח ללשכת הבריאות",
    labelTitle:
      "תאריך דיווח ללשכת הבריאות, שמו של האדם בלשכת הבריאות (תוך 24 מתחילת התקלה)",
    type: "textarea",
  },
  { key: "conclusions", label: "מסקנות וסיכום", type: "textarea" },
  { key: "signature", label: "חתימה אחראי", type: "signature" },
];
