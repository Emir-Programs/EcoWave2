import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate
} from "react-router-dom";
import Home from "./pages/home/Home";
import MapPage from "./pages/map/Map";
import RankPage from "./pages/ranks/Rank";
import ProfilePage from "./pages/profile1/Profile";
import AdminMap from "./pages/AdminMap/AdminMap";
import "./app/App.css";




import { FaMoneyBill1Wave } from "react-icons/fa6";
import { LuHouse } from "react-icons/lu";
import { CiMap } from "react-icons/ci";
import { GiTrophyCup } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthPage from "./pages/Auth/Auth";

// Firebase и i18n
import { db } from "./firebase";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import "./app/i18n"; // Убедись, что файл создан

function App() {
  const [visits, setVisits] = useState('...');
  const { t, i18n } = useTranslation(); // Хук для перевода
  const [currentUser, setCurrentUser] = useState(null);

  // Логика счетчика через Firebase
  // 1. Логика счетчика и инициализация
  useEffect(() => {
    const statsRef = doc(db, "stats", "global");

    updateDoc(statsRef, { visits: increment(1) }).catch((err) =>
      console.log("Init stats setup needed")
    );

    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setVisits(docSnap.data().visits);
      }
    });

    return () => unsubscribeStats();
  }, []);

  // 2. ОТДЕЛЬНЫЙ хук для слежения за пользователем
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Функция смены языка
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="main-nav">
          <div className="nav-logo">
            ECO<span>WAVE</span>
          </div>

          <div className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <LuHouse className="icon" />
              <span className="label">{t("nav.home")}</span>
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <CiMap className="icon" />
              <span className="label">{t("nav.map")}</span>
            </NavLink>
            <NavLink
              to="/rank"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <GiTrophyCup className="icon" />
              <span className="label">{t("nav.rank")}</span>
            </NavLink>
            
            <NavLink 
            to="/profile"
            className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"}>
              <CgProfile />Profile
            </NavLink>
          </div>

          {/* Переключатель языков */}
          <div className="lang-switcher">
            <button onClick={() => changeLanguage("ru")}>RU</button>
            <button onClick={() => changeLanguage("kg")}>KG</button>
            <button onClick={() => changeLanguage("en")}>EN</button>
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Home  />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/map" 
              element={currentUser ? <MapPage user={currentUser} /> : <Navigate to="/auth" />} 
            />
            <Route path="/rank" element={<RankPage />} />
            <Route
              path="/profile"
              element={
                currentUser ? (
                  <ProfilePage user={currentUser} />
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route path="/admin-map" element={<AdminMap />} />
          </Routes>
        </main>

        <footer className="footer-minimal">
          <div className="footer-content">
            <div className="footer-info">
              <span className="footer-label">{t("footer.dev")}</span>
              <h3 className="developer-name">Emir Marash</h3>
              <p className="developer-bio">{t("footer.bio")}</p>
            </div>

            <div className="footer-stats">
              <div className="visit-counter">
                <span className="footer-label">LIVE ACTIVITY</span>
                <div className="counter-flex">
                  <span className="dot-live"></span>
                  <span className="count-num">{visits.toLocaleString()}</span>
                </div>
              </div>
              <div className="footer-socials">
                <span className="footer-label">CONNECT</span>
                <div className="social-links">
                  <a href="https://t.me/marashtg">Telegram</a>
                  <a href="https://github.com/Emir-Programs">GitHub</a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 ECO-WAVE OSH. ALL RIGHTS RESERVED.</p>
            <p>MADE WITH LOVE FOR NATURE</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

