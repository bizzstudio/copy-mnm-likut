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
export const SCANNER_LOCK_AFTER_SCAN_MS = 800;

/** Debounce לזיהוי (ms) */
export const SCANNER_DEBOUNCE_MS = 100;

/** מרווח בין ניסיונות פענוח (ms) – ~20 ניסיונות בשנייה לקצב סריקה מוגבר */
export const SCANNER_TIME_BETWEEN_DECODING_ATTEMPTS_MS = 50;

/** אילוצי מצלמה – מצלמה אחורית. רזולוציה נמוכה יותר לתאימות טובה במובייל/טאבלט */
export const SCANNER_CONSTRAINTS = {
  facingMode: "environment",
  width: { ideal: 1280, min: 320 },
  height: { ideal: 720, min: 240 },
  frameRate: { ideal: 24, max: 30 },
};

/** אילוצים מינימליים – מצלמה אחורית (טאבלט/טלפון) */
export const SCANNER_CONSTRAINTS_MINIMAL = {
  facingMode: "environment",
};

/** מצלמת מחשב (webcam) – למחשבים שולחניים/לפטופ */
export const SCANNER_CONSTRAINTS_USER = {
  facingMode: "user",
};

/** אילוצים עם torch (תאורה) – לשימוש אופציונלי כשהמכשיר תומך */
export const SCANNER_CONSTRAINTS_WITH_TORCH = {
  ...SCANNER_CONSTRAINTS,
  advanced: [{ torch: true }],
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
