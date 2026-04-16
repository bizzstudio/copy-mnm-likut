/**
 * יומן קבלת סחורה — formCode ב־API: T02
 * (במסמך מודפס לעיתים מופיע T03; באפליקציה T03 = ספר תקלות)
 */
export const FORM_CODE = "T02";

export function buildEmptyEntry() {
  return {
    receiptDate: "",
    receiptTime: "",
    productName: "",
    frozenTempIntegrity: "",
    shelfLifeIntegrity: "",
    manufacturerSupplier: "",
    weightQuantity: "",
    certificatesVeterinary: "",
    shipmentIntegrityCleanliness: "",
    receiverName: "",
  };
}

/** עמודות מימין לשמאל (RTL) */
export const COLUMNS = [
  { key: "receiptDate", label: "תאריך קבלה", type: "date", width: "w-[7rem]" },
  { key: "receiptTime", label: "שעת קבלה", type: "time", width: "w-[7rem]" },
  {
    key: "productName",
    label: "שם המוצר שהתקבל",
    type: "textarea",
    rows: 3,
  },
  {
    key: "frozenTempIntegrity",
    labelShort: "תקינות טמפ' (קפוא)",
    labelTitle:
      "תקינות טמפ' המזון המתקבל (קפוא) בדיקה קשה במגע",
    type: "textarea",
    rows: 3,
  },
  {
    key: "shelfLifeIntegrity",
    label: "תקינות תאריך חיי מדף",
    type: "textarea",
    rows: 2,
  },
  {
    key: "manufacturerSupplier",
    label: "יצרן/ספק המוצר / מענו",
    type: "textarea",
    rows: 2,
  },
  {
    key: "weightQuantity",
    label: "משקל / כמות",
    type: "textarea",
    rows: 2,
    width: "w-[6rem]",
  },
  {
    key: "certificatesVeterinary",
    labelShort: "תעודות וטרינרית",
    labelTitle: "שלימות תעודות, משלוח וטרינרית",
    type: "textarea",
    rows: 2,
  },
  {
    key: "shipmentIntegrityCleanliness",
    labelShort: "שלמות וניקיון משלוח",
    labelTitle: "שלמות וניקיון המשלוח",
    type: "textarea",
    rows: 2,
  },
  { key: "receiverBlock", label: "שם וחתימת מקבל", type: "receiver" },
];
