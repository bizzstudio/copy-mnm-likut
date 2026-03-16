/**
 * הגדרות מרכזיות לסריקת ברקוד – מערכת סריקה ברמת מחסן/קופה
 * שיפור מהירות, יציבות וזיהוי קודים קטנים או מטושטשים
 */

/** פורמטים – ברקודי מוצרים בלבד (משפר ביצועים, מונע חיפוש QR וכו') */
export const SCANNER_FORMATS = [
  "EAN_13",
  "EAN_8",
  "UPC_A",
  "UPC_E",
  "CODE_128",
  "CODE_39",
];

/** מרווח בין סריקות (ms) – תגובה מהירה */
export const SCANNER_SCAN_DELAY = 90;

/** נעילה אחרי זיהוי – מונע סריקות כפולות (ms) */
export const SCANNER_LOCK_AFTER_SCAN_MS = 600;

/** Debounce לזיהוי (ms) – נמוך = תגובה מיידית כמו סורק חנות */
export const SCANNER_DEBOUNCE_MS = 40;

/** מרווח בין ניסיונות פענוח (ms) – איזון בין מהירות ל-TRY_HARDER (ברקודים מקומטים/עם אור) */
export const SCANNER_TIME_BETWEEN_DECODING_ATTEMPTS_MS = 35;

/** מרווח בין ניסיונות פענוח מקנבס מעובד (ניגוד/היפוך) – fallback לברקודים עם אור/קימוט */
export const SCANNER_CANVAS_FALLBACK_INTERVAL_MS = 180;

/** אילוצי מצלמה – רזולוציה מקסימלית + אוטופוקוס לברקודים רחוקים/קטנים */
export const SCANNER_CONSTRAINTS = {
  facingMode: "environment",
  width: { ideal: 2560, min: 1280 },
  height: { ideal: 1440, min: 720 },
  frameRate: { ideal: 30, max: 60 },
  advanced: [{ focusMode: "continuous" }],
};

/** רזולוציה בינונית – fallback כשהמכשיר לא תומך ב-FHD+ */
export const SCANNER_CONSTRAINTS_MID = {
  facingMode: "environment",
  width: { ideal: 1920, min: 640 },
  height: { ideal: 1080, min: 480 },
  frameRate: { ideal: 30, max: 60 },
  advanced: [{ focusMode: "continuous" }],
};

/** אילוצים מינימליים – מצלמה אחורית בלבד (טאבלט/טלפון חלש) */
export const SCANNER_CONSTRAINTS_MINIMAL = {
  facingMode: "environment",
};

/** מצלמת מחשב (webcam) – למחשבים שולחניים/לפטופ */
export const SCANNER_CONSTRAINTS_USER = {
  facingMode: "user",
  width: { ideal: 1920, min: 640 },
  height: { ideal: 1080, min: 480 },
};

/** אילוצים עם torch (תאורה) – לשימוש אופציונלי כשהמכשיר תומך */
export const SCANNER_CONSTRAINTS_WITH_TORCH = {
  ...SCANNER_CONSTRAINTS,
  advanced: [{ focusMode: "continuous" }, { torch: true }],
};

/** סגנונות קונטיינר וידאו */
export const SCANNER_STYLES = {
  container: { width: "100%", height: "100%" },
  video: { width: "100%", height: "100%", objectFit: "cover" },
};

/** אזור סריקה (אחוזים) – מרכז המסך להפחתת עומס */
export const SCANNER_REGION = {
  x: 0.2,
  y: 0.25,
  width: 0.6,
  height: 0.4,
};
