import React, { useContext } from "react";
import { languageContext } from "../../App";
import "./style.css";
import DropdownMenu from "../menu/DropdownMenu";

const LA = {
  india: {
    image: "छवि",
    name: "नाम",
    quantity: "मात्रा",
    are_you_sure: "क्या आप सुनिश्चित हैं?",
    id: "आर्डर आईडी",
    address: "पता",
    notes: "नोट्स",
    numOfBoxes: "बॉक्सों की संख्या",
    back: "वापस",
    total: "कुल",
    selfCollected: "स्वयं उठाना",
    shipment: "शिपिंग",
    choseMelaket: "अपना नाम चुनें",
    leaveOrder: "आर्डर छोड़ें",
    leaveConfirm: "यह क्रिया इस आर्डर को आपसे हटा देगी, क्या आप वाकई बाहर निकलना चाहते हैं?",
    loadingOrders: "आर्डर लोड हो रहे हैं",
    saveOrderToYou: "आर्डर आपके लिए सुरक्षित कर दिया गया है",
    leavingOrder: "आर्डर दूसरों के लिए छोड़ रहे हैं",
    alreadyTaken: "यह आर्डर पहले से ही किसी और ने लिया है, आपको होम पेज पर रीडायरेक्ट किया जा रहा है",
    alreadyDone: "यह आर्डर पहले से ही किसी और ने पूरा कर लिया है, आपको होम पेज पर रीडायरेक्ट किया जा रहा है",
    refreshigOrders: "आर्डर रिफ्रेश कर रहे हैं",
    chooseStatus: "स्थिति चुनें",
    createAt: "बनाया गया",
    logOut: "लॉग आउट",
    logOutConfirm: "क्या आप वाकई लॉग आउट करना चाहते हैं?",
    phone: "फोन",
    password: "पासवर्ड",
    login: "लॉग इन",
    orderIsCollected: "यह आदेश निम्नलिखित द्वारा एकत्रित किया जाता है",
    done: "आदेश पूरा करें",
    pickedAll: "सभी चिह्नित करें",
    unableToLeave: "त्रुटि: ऑर्डर की स्थिति को अपडेट करने में असमर्थ। कृपया पुनः प्रयास करें।",
    unableToLogOut: "त्रुटि: सिस्टम से लॉग आउट करने में असमर्थ। कृपया पुनः प्रयास करें।",
    unableToFoundOrder: "त्रुटि: छोड़ने के लिए कोई उपयुक्त ऑर्डर नहीं मिला।",
    orderNotFound: "ऑर्डर लोड करने में विफल। कृपया पुनः प्रयास करें।",
    errorSendingMessage: "ऑर्डर पूरा हो गया था लेकिन ग्राहक को ऑर्डर पूरा होने का संदेश भेजते समय एक त्रुटि हुई। शिफ्ट मैनेजर को अपडेट किया जाना चाहिए और ग्राहक को मैन्युअल रूप से सूचित किया जाना चाहिए।",
    errorUpdateOrder: "ऑर्डर अपडेट करते समय एक त्रुटि हुई",
    city: "शहर",
    street: "रोड",
    houseNumber: "घर नंबर",
    apartmentNumber: "कमरा नंबर",
    floor: "मंजiल",
    orderPreview: "आदेश पूर्वावलोकन",
    continueToOrder: "संग्रहण आदेश के लिए आगे बढ़ें",
    close: "बंद करें",
    moreItems: "और {count} आइटम...",
    totalItems: "कुल {count} आइटम ऑर्डर में",
    notAllItemsMarked: "ऑर्डर पूरा नहीं किया जा सकता - ऑर्डर समाप्त करने से पहले सभी आइटम को चिह्नित करना होगा और मात्रा की सटीकता सुनिश्चित करना होगा",
    unmarkAll: "सभी अनचेक करें",
    scanBarcode: "סריקת ברקוד",
    manualBarcodeEntry: "הזנת ברקוד ידנית",
    enterBarcode: "הזן ברקוד",
    search: "חפש",
    quantityInStock: "כמות להוספה במלאי",
    addToStock: "הוסף למלאי",
    productNotFoundBarcode: "המוצר עם הברקוד לא נמצא במערכת",
    scanInstructions: "הצב את הברקוד מול המצלמה",
    stockAddedSuccess: "המלאי עודכן בהצלחה",
    scanForPick: "סרוק ליקוט",
    quantityPicked: "כמות שנלוקטה",
    deductFromStock: "הורד ממלאי",
    stockDeductedSuccess: "הורדנו מהמלאי בהצלחה"
  },
  en: {
    image: "Image",
    name: "Name",
    quantity: "Qty",
    are_you_sure: "Are you sure?",
    id: "Order ID",
    address: "Address",
    notes: "notes",
    numOfBoxes: "Number of boxes",
    back: "Back",
    total: "Total",
    selfCollected: "Pickup",
    shipment: "Shipping",
    choseMelaket: "Chose Your Name",
    leaveOrder: "Leave the order",
    leaveConfirm: "This action will unassign this order to you, are you sure you want to exit?",
    loadingOrders: "Loading orders",
    saveOrderToYou: "Saves the order for you",
    leavingOrder: "Leaving the order to others",
    alreadyTaken: "This order has already been taken by someone else, you are redirected to the home page",
    alreadyDone: "This order has already been done by someone else, you are redirected to the home page",
    refreshigOrders: "Refreshing orders",
    chooseStatus: "Choose Status",
    createAt: "Create At",
    logOut: "Log Out",
    logOutConfirm: "Are you sure you want to log out?",
    phone: "Phone",
    password: "Password",
    login: "Login",
    orderIsCollected: "This order is collected by",
    done: "Complete Order",
    pickedAll: "Mark All",
    unableToLeave: "Error: Unable to update the order status. Please try again.",
    unableToLogOut: "Error: Unable to log out of the system. Please try again.",
    unableToFoundOrder: "Error: No suitable order found to leave.",
    orderNotFound: "Failed to load the order. Please try again.",
    errorSendingMessage: "The order was completed but an error occurred when sending the order completion message to the customer. The shift manager must be updated and the customer must be notified manually.",
    errorUpdateOrder: "An error occurred while updating the order",
    city: "City",
    street: "Street",
    houseNumber: "House Number",
    apartmentNumber: "Apartment Number",
    floor: "Floor",
    orderPreview: "Order Preview",
    continueToOrder: "Proceed to order collection",
    close: "Close",
    moreItems: "and {count} more items...",
    totalItems: "Total {count} items in order",
    notAllItemsMarked: "Cannot complete order - all products must be marked and quantities must be verified before completing the order",
    unmarkAll: "Unmark All",
    scanBarcode: "Scan barcode",
    manualBarcodeEntry: "Manual barcode entry",
    enterBarcode: "Enter barcode",
    search: "Search",
    quantityInStock: "Quantity to add to stock",
    addToStock: "Add to stock",
    productNotFoundBarcode: "Product with this barcode was not found",
    scanInstructions: "Position the barcode in front of the camera",
    stockAddedSuccess: "Stock updated successfully",
    scanForPick: "Scan for pick",
    quantityPicked: "Quantity picked",
    deductFromStock: "Deduct from stock",
    stockDeductedSuccess: "Deducted from stock successfully"
  },
  hebrew: {
    image: "תמונה",
    name: "שם",
    quantity: "כמות",
    are_you_sure: "אתה בטוח שסיימת?",
    id: "מספר הזמנה",
    address: "כתובת",
    notes: "הערות",
    numOfBoxes: "מספר ארגזים",
    back: "אחורה",
    total: "סכום",
    selfCollected: "קליטת סחורה",
    shipment: "משלוחים",
    choseMelaket: 'בסיום יש לבחור את שם המלקט',
    leaveOrder: "נטישת הזמנה",
    leaveConfirm: "פעולה זאת תבטל את הקצאת הזמנה זאת אליך, האם אתה בטוח שברצונך לצאת?",
    loadingOrders: "טוען הזמנות",
    saveOrderToYou: "שומר לך את ההזמנה",
    leavingOrder: "נוטש הזמנה",
    alreadyTaken: "הזמנה זאת כבר נתפסה בידי מישהו אחר, הנך מועבר לדף הבית",
    alreadyDone: "הזמנה זאת כבר הושלמה בידי מישהו אחר, הנך מועבר לדף הבית",
    refreshigOrders: "מרענן הזמנות",
    chooseStatus: "בחירת סטטוס",
    createAt: "שעת הזמנה",
    logOut: "התנתקות",
    logOutConfirm: "האם אתה בטוח שאתה רוצה להתנתק?",
    phone: "טלפון",
    password: "סיסמה",
    login: "התחברות",
    orderIsCollected: "הזמנה זאת בליקוט על ידי",
    done: "סיום הזמנה",
    pickedAll: "לסמן הכל",
    unableToLeave: "שגיאה: לא הצלחנו לעדכן את הסטטוס של ההזמנה. אנא נסה שוב.",
    unableToLogOut: "שגיאה: לא הצלחנו לבצע התנתקות מהמערכת. אנא נסה שוב.",
    unableToFoundOrder: "שגיאה: לא נמצאה הזמנה מתאימה לנטישה.",
    orderNotFound: "לא הצלחנו לטעון את ההזמנה. אנא נסה שוב.",
    errorSendingMessage: "ההזמנה הושלמה אך התבצעה שגיאה בעת שליחת הודעת סיום ההזמנה ללקוח, יש לעדכן את אחראי המשמרת וליידע את הלקוח ידנית.",
    errorUpdateOrder: "התרחשה שגיאה בעת עדכון ההזמנה",
    city: "עיר",
    street: "רחוב",
    houseNumber: "מספר בית",
    apartmentNumber: "מספר דירה",
    floor: "קומה",
    orderPreview: "תצוגת הזמנה מקדימה",
    continueToOrder: "למעבר לליקוט ההזמנה",
    close: "סגירה",
    moreItems: "ועוד {count} מוצרים...",
    totalItems: "סך הכל {count} מוצרים בהזמנה",
    notAllItemsMarked: "לא ניתן לסיים הזמנה - יש לסמן את כל המוצרים ולוודא כמויות מדויקות לפני סיום ההזמנה",
    unmarkAll: "ביטול הכל",
    scanBarcode: "סריקת ברקוד",
    manualBarcodeEntry: "הזנת ברקוד ידנית",
    enterBarcode: "הזן ברקוד",
    search: "חפש",
    quantityInStock: "כמות להוספה במלאי",
    addToStock: "הוסף למלאי",
    productNotFoundBarcode: "המוצר עם הברקוד לא נמצא במערכת",
    scanInstructions: "הצב את הברקוד מול המצלמה",
    stockAddedSuccess: "המלאי עודכן בהצלחה",
    scanForPick: "סרוק מוצר",
    quantityPicked: "כמות שנלוקטה",
    deductFromStock: "הורד ממלאי",
    stockDeductedSuccess: "הורדנו מהמלאי בהצלחה"
  },
};

export const getWord = (word) => {
  const { language } = useContext(languageContext);
  return <>{LA[language][word]}</>;
};

export const getWordString = (lang, key) => LA[lang]?.[key] ?? key;

export default function Language({ setOpenMenu }) {
  const { setLanguage } = useContext(languageContext);
  const onClick = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem("language", e.target.value);
    setOpenMenu((prev) => !prev);
  };

  const languageOptions = [
    {
      label: "עברית",
      onClick: () => onClick({ target: { value: "hebrew" } })
    },
    {
      label: "हिंदी",
      onClick: () => onClick({ target: { value: "india" } })
    },
    {
      label: "english",
      onClick: () => onClick({ target: { value: "en" } })
    }
  ];

  return (
    <div className="z-20">
      <DropdownMenu
        // title="Language"
        options={languageOptions}
      />
    </div>
  );
}
