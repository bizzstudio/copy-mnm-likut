// meshek_Likut_system/src/components/Header/index.jsx
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { languageContext } from "../../App";
import "./style.css";
import { getWord } from "../Language";
import { FaLanguage, FaBackward } from "react-icons/fa";
import axios from "axios";
import useLoadingStore from "../../LoadingContext";
import { HiOutlineLogout } from "react-icons/hi";
import { PiTranslateBold } from "react-icons/pi";
import { TbUserX } from "react-icons/tb";
import DropdownMenu from "../menu/DropdownMenu";
import { IoLanguage } from "react-icons/io5";

export default function Header({ id, go, setLoading, loading, orders = [] }) {
  const { language, setLanguage } = useContext(languageContext);

  const [order, setOrder] = useState();
  useEffect(() => {
    const ordered = orders.find((order) => order.invoice == id);
    setOrder(ordered)
  }, [orders, id]);

  // טקסט טעינה
  const { setText } = useLoadingStore();

  const location = useLocation();

  const backWord = getWord('back');
  const leaveWord = getWord('leaveOrder');
  const areYouSureWord = getWord('leaveConfirm');
  const logOutWord = getWord("logOut");
  const logOutConfirm = getWord("logOutConfirm");
  const unableToLogOut = getWord("unableToLogOut");
  const unableToLeave = getWord("unableToLeave");
  const unableToFoundOrder = getWord("unableToFoundOrder");


  const [openMenu, setOpenMenu] = useState(false);

  const nav = useNavigate();

  // פונקציית נטישת הזמנה
  const leaveOrder = async () => {
    if (order) {
      setLoading(true);
      try {
        await axios.put(
          `${import.meta.env.VITE_MAIN_SERVER_URL}/app/orders/${order._id}?status=Processing`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        await go();
      } catch (error) {
        console.error("Failed to update order status", error);
        alert(unableToLeave.props.children);
      } finally {
        setLoading(false);
      }
    } else {
      alert(unableToFoundOrder.props.children);
    }
  };

  // const exit = async (e) => {
  //   setText("saveOrderToYou");
  //   setLoading(true);
  //   await go();
  //   nav(e.target.value);
  // };

  const leaveOrderBtn = async (e) => {
    let areYouSure = confirm(areYouSureWord.props.children);
    if (areYouSure) {
      setText("leavingOrder");
      setLoading(false);
      await leaveOrder();
      nav('/items');
      // reload the page:
      window.location.reload();
    }
  };

  const handleClick = () => {
    setOpenMenu(prev => !prev);
  };

  const handleLogOut = () => {
    try {
      const confirmed = confirm(logOutConfirm.props.children);
      if (confirmed) {
        localStorage.removeItem("token");
        nav("../login");
      }
    } catch (error) {
      console.error("Failed to log out", error);
      alert(unableToLogOut.props.children);
    }
  };

  useEffect(() => {
    // דוחף את המצב הנוכחי כדי למנוע חזרה אחורה מיידית
    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      // דוחף שוב את המצב כדי למנוע חזרה אחורה
      window.history.pushState(null, null, window.location.href);
      // תפעל את פונקציית הנטישה במקום לחזור אחורה
      leaveOrderBtn();
    };

    // מאזין לאירועי חזרה אחורה
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [leaveOrderBtn]);

  if (loading) return <></>

  // Create menu options based on current location
  const menuOptions = [
    {
      label: <span className="flex items-center gap-2 justify-start"><IoLanguage size={20} />עברית</span>,
      onClick: () => {
        setLanguage("hebrew");
        localStorage.setItem("language", "hebrew");
      }
    },
    {
      label: <span className="flex items-center gap-2 justify-start"><IoLanguage size={20} />हिंदी</span>,
      onClick: () => {
        setLanguage("india");
        localStorage.setItem("language", "india");
      }
    },
    {
      label: <span className="flex items-center gap-2 justify-start"><IoLanguage size={20} />English</span>,
      onClick: () => {
        setLanguage("en");
        localStorage.setItem("language", "en");
      }
    }
  ];

  // Add logout or leave order option based on location
  if (location.pathname === "/items") {
    menuOptions.unshift({
      label: <span className="flex items-center gap-2 justify-start"><HiOutlineLogout size={20} />{logOutWord}</span>,
      onClick: handleLogOut
    });
  } else {
    menuOptions.unshift({
      label: <span className="flex items-center gap-2 justify-start"><TbUserX size={20} />{leaveWord}</span>,
      onClick: leaveOrderBtn
    });
  }

  return (
    <div className="fixed z-50 end-1 bottom-1">
      {/* <Language setOpenMenu={setOpenMenu} /> */}
      <DropdownMenu
        options={menuOptions}
        position="bottom-left"
      />
    </div>
  );
};