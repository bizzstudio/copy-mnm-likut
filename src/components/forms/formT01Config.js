/** טופס T01 — בדיקת ניקיון ותשתיות (מפתחות יציבים ל־API / PDF) */

export const FORM_CODE = "T01";

export const ROW_KEYS = [
  "cleaning",
  "foreign_body_control",
  "employee_hygiene",
  "corrective_action",
  "corrective_verification",
];

export const ZONE_KEYS = [
  "goods_in_out",
  "freezer_fridge",
  "employee_washrooms",
  "yard_trash",
];

export const ROW_LABELS = {
  cleaning: "ניקיון",
  foreign_body_control:
    "בקרת גופים זרים (מנורות, תשתיות, אחסון, אריזות)",
  employee_hygiene: "היגיינת עובדים",
  corrective_action: "פעולה מתקנת",
  corrective_verification: "אימות פ. מתקנת",
};

export const ZONE_LABELS = {
  goods_in_out:
    "אזור קבלת והוצאת סחורה: רצפה, קירות ותקרה, דלתות, תאורה, עמדת מחשב, כיור ומשטח",
  freezer_fridge:
    "מקפיא/מקרר: רצפה, קירות ותקרה, דלתות, מדפים, תאורה",
  employee_washrooms:
    "שירותי עובדים: רצפה, קירות ותקרה, אסלה, כיור",
  yard_trash: "חצר ופחי אשפה: אזור כניסה, אזור אשפה",
};

export function buildEmptyMatrix() {
  return Object.fromEntries(
    ROW_KEYS.map((row) => [
      row,
      Object.fromEntries(ZONE_KEYS.map((z) => [z, false])),
    ])
  );
}
