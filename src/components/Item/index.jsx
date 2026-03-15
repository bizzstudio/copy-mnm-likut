// meshek_Likut_system/src/components/Item/index.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Select, Table } from "antd";
import Loader from "../Loader";
import axios from "axios";
import logo from "../../../public/logo.jpeg";
import { languageContext } from "../../App";
import "./style.css";
import { getWord } from "../Language";
import { FaCheckCircle, FaBoxOpen, FaPlus, FaMinus, FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import spinnerLoadingImage from "/spinner.gif";
import dayjs from "dayjs";
import loginImg from "/loginImg.svg"

export default function Item({ setOrders, orders, setUpdateOrders, setId, loading, setLoading }) {
  const numberOfOrder = useParams();

  const { language } = useContext(languageContext);

  const nav = useNavigate();

  const [data, setData] = useState([]);
  const [cityName, setCityName] = useState();
  const [order, setOrder] = useState();
  const [statuses, setStatuses] = useState([]);
  const [userText, setUserText] = useState("");
  const [numOfBoxes, setNumOfBoxes] = useState(0);
  // const [isLikut, setIsLikut] = useState();
  const [submiting, setSubmiting] = useState(false);
  const [pickedQuantities, setPickedQuantities] = useState({});
  const [markedItems, setMarkedItems] = useState({});

  const numOfBoxesWord = getWord('numOfBoxes');
  const choseMelaket = getWord('choseMelaket');
  const pickedAllWord = getWord('pickedAll');
  const unmarkAllWord = getWord('unmarkAll');
  const notAllItemsMarked = getWord('notAllItemsMarked');
  const words = {
    name: getWord('name'),
    id: getWord('id'),
    address: getWord('address'),
    phone: getWord('phone'),
    notes: getWord('notes'),
    floor: getWord('floor'),
    chooseStatus: getWord('chooseStatus'),
    are_you_sure: getWord('are_you_sure'),
    done: getWord('done'),
    orderNotFound: getWord('orderNotFound')
  };

  // console.log('order: ', order)
  // console.log('orders: ', orders)
  useEffect(() => {
    // בדוק אם ההזמנה קיימת ב-orders מהפרופס
    const ordered = orders?.find((order) => order.invoice == numberOfOrder.id);

    if (ordered) {
      setOrder(ordered); // אם מצאנו את ההזמנה, נעדכן את הסטייט
    } else {
      // אם לא מצאנו את ההזמנה, נמשוך אותה מהשרת
      const fetchOrder = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_MAIN_SERVER_URL}/app/orders/${numberOfOrder.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setOrder(response.data); // עדכון הסטייט בהזמנה שנשלפה מהשרת
        } catch (error) {
          console.error("Error fetching order:", error);
          alert(words.orderNotFound.props.children);
          nav("/items"); // אם לא ניתן למשוך את ההזמנה, נחזור לעמוד ההזמנות
        }
      };

      fetchOrder(); // קריאה לפונקציה שמבצעת את הבקשה
    }
  }, [orders, numberOfOrder.id, nav]);

  console.log('order: ', order)

  // פונקציה לשינוי כמות שנלוקטה
  const updatePickedQuantity = (productId, newQuantity) => {
    const updatedQuantities = {
      ...pickedQuantities,
      [productId]: Math.max(0, newQuantity) // מינימום 0
    };
    setPickedQuantities(updatedQuantities);

    // שמירה ב-sessionStorage
    sessionStorage.setItem(
      `pickedQuantities_${numberOfOrder.id}`,
      JSON.stringify(updatedQuantities)
    );
  };

  // פונקציה לסימון/ביטול סימון כל הצ'קבוקסים
  const toggleAllItems = () => {
    const allItemsMarked = order?.cart?.every(item => markedItems[item._id] === true);

    if (allItemsMarked) {
      // אם הכל מסומן, נבטל את כל הסימונים
      const allUnmarked = {};
      order.cart.forEach(item => {
        allUnmarked[item._id] = false;
      });
      setMarkedItems(allUnmarked);

      // שמירה ב-sessionStorage
      sessionStorage.setItem(
        `markedItems_${numberOfOrder.id}`,
        JSON.stringify(allUnmarked)
      );
    } else {
      // אם לא הכל מסומן, נסמן הכל
      const allMarked = {};
      order.cart.forEach(item => {
        allMarked[item._id] = true;
      });
      setMarkedItems(allMarked);

      // שמירה ב-sessionStorage
      sessionStorage.setItem(
        `markedItems_${numberOfOrder.id}`,
        JSON.stringify(allMarked)
      );
    }
  };

  // פונקציה לסימון/ביטול סימון מוצר ספציפי
  const toggleItemMark = (productId) => {
    const isCurrentlyMarked = markedItems[productId] || false;
    const updatedMarked = {
      ...markedItems,
      [productId]: !isCurrentlyMarked
    };
    setMarkedItems(updatedMarked);

    // שמירה ב-sessionStorage
    sessionStorage.setItem(
      `markedItems_${numberOfOrder.id}`,
      JSON.stringify(updatedMarked)
    );
  };

  const columns = [
    {
      title: "",
      dataIndex: "select",
      align: "center",
      width: 60,
      render: (_, record) => {
        const productId = record.key;
        const isMarked = markedItems[productId] || false;

        return (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={isMarked}
              onChange={() => toggleItemMark(productId)}
            />
          </div>
        );
      }
    },
    {
      title: getWord('image'),
      dataIndex: "image",
      align: "center",
    },
    {
      title: getWord('name'),
      dataIndex: "name",
    },
    {
      title: getWord('quantity'),
      dataIndex: "quantity",
      render: (originalQuantity, record) => {
        const productId = record.key;
        const pickedQty = pickedQuantities[productId] !== undefined ? pickedQuantities[productId] : 0;

        return (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => updatePickedQuantity(productId, pickedQty - 1)}
              className={`w-7 h-7 border-2 border-white text-white rounded-full flex items-center justify-center transition-all duration-300 ${pickedQty <= 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:brightness-125 active:scale-95'
                }`}
              disabled={pickedQty <= 0}
            >
              <FaMinus size={9} />
            </button>

            <div className="text-center">
              <span className="text-black font-bold text-xl">
                {pickedQty}
              </span>
            </div>

            <button
              onClick={() => updatePickedQuantity(productId, pickedQty + 1)}
              className={`w-7 h-7 border-2 border-white text-white rounded-full flex items-center justify-center transition-all duration-300 ${pickedQty >= originalQuantity
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-mainColor hover:brightness-125 active:scale-95'
                }`}
              disabled={pickedQty >= originalQuantity}
            >
              <FaPlus size={9} />
            </button>
          </div>
        );
      }
    },
  ];

  const translateText = async (text) => {
    try {
      let langpair = "";
      if (language === "india") {
        langpair = "he|hi"; // תרגום מעברית להודית
      } else if (language === "en") {
        langpair = "he|en"; // תרגום מעברית לאנגלית
      }

      let response = await axios.get(
        "https://api.mymemory.translated.net/get",
        {
          params: {
            q: text,
            langpair: langpair,
          },
        }
      );
      return (response.data.responseData.translatedText);
    } catch (error) {
      console.error("Error translating text:", error);
    }
  };

  const getText = async (text) => {
    if (text) {
      if (language === "hebrew") setUserText(text);
      else {
        const note = await translateText(text);
        setUserText(note)
      }
    }
  };

  // קבלת שם העיר וההערות על פי השפה
  useEffect(() => {
    if (order) {
      getText(order.customer_note)
      setCityName(language === 'hebrew' ?
        order?.user_info?.address?.city?.city_name_he :
        order?.user_info?.address?.city?.city_name_en
      )
    }
  }, [language, order]);

  // שינוי ההזמנה לסטטוס ליקוט והוצאת המשתמש במידה והיא תפוסה
  useEffect(() => {
    if (order) {
      // setLoading(true);
      const res = (async () =>
        await axios.put(
          `${import.meta.env.VITE_MAIN_SERVER_URL}/app/orders/${order._id}`, {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              status: "Likut",
            },
          }
        ))().catch(err => {
          // console.log(err);
          setLoading(false);
          if (order.actualMelaket?._id !== localStorage.melaketId) {
            // הודעה שההזמנה כבר נתפסה
            const msgToAlert = orderAlreadyTaken.props.children;
            alert(msgToAlert);
            nav("../items");
            // reload the page:
            window.location.reload();
          } else if (err.response.status === 409) {
            // ההזמנה כבר הושלמה
            alert(err.response.data.message[language]);
            nav("../items");
          }
        })
    }
  }, [order]);

  const orderAlreadyTaken = getWord("alreadyTaken");

  // קבלת כל הסטטוסים
  useEffect(() => {
    const getAllStatuses = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_MAIN_SERVER_URL}/app/orders/status/getAll`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStatuses(res.data);
    };
    getAllStatuses();
  }, []);

  const rowClassName = (record, index) => {
    const quantity = data[index].quantity;
    if (quantity === 2) {
      return "t_yalow"; // צהוב
    } else if (quantity === 3) {
      return "t_orange"; // כתום
    } else if (quantity === 4) {
      return "t_dark_orange"; // כתום כהה
    } else if (quantity >= 5) {
      return "t_light_red"; // אדום בהיר
    }
    return "";
  };

  useEffect(() => {
    if (order) {
      getText(order.customer_note);
      setData(
        order.cart.sort((a, b) => a.barcode - b.barcode).map((item, index) => {
          return {
            key: item._id,
            name: <div>
              <div>{language === "hebrew" ? item.title.he : item.title.en}</div>
              <div>₪{item.price || item.originalPrice}</div>
            </div>,
            image: (
              <div className="flex justify-center">
                <img
                  src={item.image || logo}
                  alt={language === "hebrew" ? item.title.he : item.title.en}
                  className="rounded max-w-full h-12 object-contain"
                />
              </div>
            ),
            quantity: item.quantity,
          };
        })
      );

      // אתחול כמויות שלוקטו - טעינה מ-sessionStorage או ברירת מחדל
      const savedQuantities = sessionStorage.getItem(`pickedQuantities_${numberOfOrder.id}`);
      let initialPickedQuantities = {};

      if (savedQuantities) {
        // טעינה מ-sessionStorage
        try {
          initialPickedQuantities = JSON.parse(savedQuantities);
        } catch (error) {
          console.error('Error parsing saved quantities:', error);
          // אם יש שגיאה, נאתחל מחדש לכמות מלאה
          order.cart.forEach(item => {
            initialPickedQuantities[item._id] = item.quantity;
          });
        }
      } else {
        // ברירת מחדל - כמות מלאה לכל מוצר
        order.cart.forEach(item => {
          initialPickedQuantities[item._id] = item.quantity;
        });
      }

      setPickedQuantities(initialPickedQuantities);

      // אתחול צ'קבוקסים - טעינה מ-sessionStorage או ברירת מחדל
      const savedMarkedItems = sessionStorage.getItem(`markedItems_${numberOfOrder.id}`);
      let initialMarkedItems = {};

      if (savedMarkedItems) {
        // טעינה מ-sessionStorage
        try {
          initialMarkedItems = JSON.parse(savedMarkedItems);
        } catch (error) {
          console.error('Error parsing saved marked items:', error);
          // אם יש שגיאה, נאתחל מחדש ללא סימון
          order.cart.forEach(item => {
            initialMarkedItems[item._id] = false;
          });
        }
      } else {
        // ברירת מחדל - ללא סימון
        order.cart.forEach(item => {
          initialMarkedItems[item._id] = false;
        });
      }

      setMarkedItems(initialMarkedItems);
    }
  }, [order]);

  // הגדרת האי-די של ההזמנה כדי שההדר יוכל להשתמש בו לבטל את הליקוט אם יש צורך
  useEffect(() => {
    if (numberOfOrder.id) setId(numberOfOrder.id);
  }, [numberOfOrder])

  const alertMsg = getWord("alreadyDone")
  const errorUpdateOrder = getWord("errorUpdateOrder");
  const errorSendingMessage = getWord("errorSendingMessage");

  const handleDone = async () => {
    // 1) חסימה מיידית אם כבר בתהליך
    if (submiting) return;

    const melaketId = localStorage.getItem("melaketId");
    if (!melaketId) {
      localStorage.removeItem("token");
      nav("/login");
      return;
    }

    // בדיקה שכל הצ'קבוקסים מסומנים
    const allItemsMarked = order?.cart?.every((item) => markedItems[item._id] === true);
    if (!allItemsMarked) {
      alert(notAllItemsMarked.props.children);
      return;
    }

    // confirm לפני שמדליקים submiting כדי לא "לתקוע" את הכפתור אם המשתמש ביטל
    const confirmed = confirm(words.are_you_sure.props.children);
    if (!confirmed) return;

    // 2) עכשיו מתחילים באמת -> נועלים
    setSubmiting(true);

    try {
      const fullValue = statuses.find((status) => status._id === melaketId);

      // בדיקה שההזמנה לא נמצאת כבר בסטטוס מלקט אחר
      const isOrderAlreadyTaken = await axios
        .get(`${import.meta.env.VITE_MAIN_SERVER_URL}/app/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          if (
            res.data.status.name !== "Cancel" &&
            res.data.status.name !== "Pending" &&
            res.data.status.name !== "Likut" &&
            res.data.status.name !== "Processing" &&
            res.data.status.name !== "Delivered"
          ) {
            console.log("ההזמנה כבר על שם מלקט אחר!");
            return true;
          } else {
            console.log("ההזמנה לא על שם מלקט אחר");
            return false;
          }
        })
        .catch((err) => {
          console.log(err);
          return true;
        });

      if (isOrderAlreadyTaken) {
        alert(alertMsg.props.children);
        nav("../items");
        window.location.reload();
        return;
      }

      // בניית pickedItems
      const pickedItems = order.cart
        .map((item) => ({
          _id: item._id,
          quantity: pickedQuantities[item._id] || 0,
        }))
        .filter((item) => item.quantity > 0);

      // בניית payload ל-LionWheel (אם יש משלוח)
      let lionwheelPayload = null;
      if (order.shippingCost != 0) {
        lionwheelPayload = {
          pickup_at: new Date().toISOString(),
          "תאריך יצירת ההזמנה": order.createdAt
            ? dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")
            : dayjs().format("DD/MM/YYYY HH:mm"),
          company_id: "71145",
          original_order_id: numberOfOrder.id,
          notes: `${order.customer_note ? order.customer_note + "." : ""}
  ${order.callOnArrival === false ? "נא להניח את ההזמנה ליד הדלת." : ""}`,
          source_city: "מושב קדרון",
          source_street: "הרימון",
          source_number: "12",
          source_recipient_name: "MNM",
          source_phone: "0586692614",
          destination_city: order?.user_info?.address?.city?.city_name_he,
          destination_street: order?.user_info?.address?.street,
          destination_number: order?.user_info?.address?.houseNumber,
          destination_floor: (() => {
            const floorValue = parseInt(order?.user_info?.address?.floor, 10);
            return isNaN(floorValue) || floorValue <= 0 ? 1 : floorValue;
          })(),
          destination_apartment: order?.user_info?.address?.apartmentNumber,
          destination_notes: order?.user_info?.address?.entryCode
            ? "קוד כניסה לבניין: " + order?.user_info?.address?.entryCode
            : "",
          destination_recipient_name: `${order?.user_info?.name} ${order?.user_info?.lastName || ""}`,
          destination_phone: order?.user_info?.contact,
          line_items: [{ name: "ארגזים", quantity: numOfBoxes }],
          packages_quantity: numOfBoxes,
          money_collect: 0,
        };
      }

      // שליחה לפונקציה המאוחדת בשרת
      let result;
      try {
        result = await axios.post(
          `${import.meta.env.VITE_MAIN_SERVER_URL}/app/orders/send-and-update/${order._id}`,
          { pickedItems, lionwheelPayload },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } catch (error) {
        console.error("error :>> ", error);
        alert(errorUpdateOrder.props.children);
        return;
      }

      // שליחת נתוני ההזמנה לשרת וואטסאפ (לא מפיל את ה-flow אם נכשל)
      try {
        await axios.post(
          `${import.meta.env.VITE_KIRSHNER_WHATSAPP_SERVER_URL}/send-order-ready`,
          {
            date: order.createdAt,
            userFirstName: order?.user_info?.name,
            userLastName: order?.user_info?.lastName,
            userPhone: order?.user_info?.contact,
            orderInvoice: order.invoice,
            total: order.total,
            shipping: order.shippingCost,
            notes: userText,
            melaketName: fullValue?.heName,
            melaketPhone: fullValue?.phone,
            tracking_link: result?.data?.lionwheelResponse?.tracking_link,
          },
          {
            headers: { "x-api-key": import.meta.env.VITE_KIRSHNER_WHATSAPP_API_KEY },
          }
        );
      } catch (error) {
        alert(errorSendingMessage.props.children);
      }

      // סיום
      nav("../items");
      setUpdateOrders((prev) => !prev);
      setOrders();
    } finally {
      // 3) תמיד משחררים את הכפתור גם אם היה return באמצע או שגיאה
      setSubmiting(false);
    }
  };

  return (
    <div className="orderPage">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full border-b border-gray-200 pb-2 pt-1 px-2 from-mainColor-light/20 to-white bg-gradient-to-b">
            <img src={loginImg} alt="לוגו מערכת ליקוט" className="h-[150px] mx-auto" />
          </div>
          <div className="flex flex-col gap-4 p-4 pb-0 max-w-[1300px] mx-auto">
            <div className="flex items-center justify-between gap-4">
              <label className="relative border-2 border-mainColor rounded-full font-bold text-base py-2 px-3 flex items-center justify-center gap-2 w-1/2 sm:w-auto focus-within:outline-1 focus-within:outline-mainColor transition-all duration-300">
                <FaBoxOpen className='text-mainColor w-4 min-w-4' />
                <input
                  placeholder={numOfBoxesWord.props.children}
                  type="number"
                  onChange={(e) => setNumOfBoxes(e.target.value)}
                  className="border-none outline-none w-full bg-transparent"
                />
              </label>
              <button
                onClick={handleDone}
                disabled={
                  // בדיקה שיש לפחות מוצר אחד שנלוקט עם כמות גדולה מ-0
                  !Object.values(pickedQuantities).some(qty => qty > 0) ||
                  numOfBoxes == 0
                }
                className='border-none text-white rounded-full font-bold text-base py-2.5 px-4 flex items-center justify-center gap-1.5 bg-mainColor w-1/2 sm:w-auto whitespace-nowrap disabled:opacity-50'>
                {submiting ? <img
                  src={spinnerLoadingImage}
                  alt="Loading"
                  width={20}
                  height={20}
                /> : <FaCheckCircle />}{words.done}
              </button>
            </div>

            <div className="flex gap-2 justify-center">
              {(() => {
                const allItemsMarked = order?.cart?.every(item => markedItems[item._id] === true);
                return (
                  <button
                    onClick={toggleAllItems}
                    className='border-none text-white rounded-full font-bold text-base py-2.5 px-4 flex items-center justify-center gap-1.5 bg-mainColor sm:flex-grow-0 flex-grow whitespace-nowrap'
                  >
                    {allItemsMarked ? <FaXmark size={21} /> : <FaCheck size={16} />}
                    {allItemsMarked ? unmarkAllWord : pickedAllWord}
                  </button>
                );
              })()}
            </div>
          </div>
          {order ? (
            <div className="p-4 pb-20 max-w-[1300px] mx-auto">
              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered={true}
                rowClassName={rowClassName}
                title={() => (
                  <div>
                    <div>
                      <p>
                        {words.name}: {order?.user_info?.name} {order?.user_info?.lastName || ''}
                      </p>
                      <p> {words.phone}: {order?.user_info?.contact}</p>
                      <p> {words.id}: {numberOfOrder.id}</p>
                      <p> {words.address}: {order?.user_info?.address?.city?.city_name_he + ", " + order?.user_info?.address?.street + " " + order?.user_info?.address?.houseNumber + (order?.user_info?.address?.apartmentNumber ? "/" + order?.user_info?.address?.apartmentNumber : '') + (order?.user_info?.address?.floor ? ", " + words.floor.props.children + " " + order?.user_info?.address?.floor : 1)}</p>
                    </div>
                    <div>
                      {words.notes}:<p className="text_red"> {userText}</p>
                    </div>
                  </div>
                )}
              />
            </div>
          ) : (
            <Loader />
          )}
        </>
      )}
    </div>
  );
};