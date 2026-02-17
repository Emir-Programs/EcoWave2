import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';
import '../../app/i18n'
import { useTranslation } from "react-i18next";

const Home = (t) => {
  const navigate = useNavigate();

  
  return (
    <div className="home-container">
      {/* 1. HERO - ГЛАВНЫЙ ЭКРАН */}
      <section className="hero-section">
        <div className="hero-top">
          <span className="hero-label">ENVIRONMENTAL PROJECT 2026</span>
          <h1 className="hero-title">{t('hero.title')}<br/>{t('hero.subtitle')}</h1>
        </div>
        
        <div className="hero-bottom">
          <div className="hero-desc">
            <p>{t('hero.descritpion')}</p>
            <button className="btn-minimal" onClick={() => navigate('/map')}>
              Начать участие —
            </button>
          </div>
          <div className="hero-image-frame">
            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013" alt="Eco Life" />
          </div>
        </div>
      </section>

      {/* 2. MISSION - НАША МИССИЯ (Добавили блок) */}
      <section className="mission-section">
        <div className="section-header">
          <span className="info-num">01</span>
          <h2>Наша миссия</h2>
        </div>
        <div className="mission-content">
          <div className="mission-text">
            <p>Ош — это наш общий дом. Мы верим, что технологии могут объединить людей ради одной цели: чистоты и порядка в каждом дворе, у каждой реки и на каждой улице.</p>
          </div>
          <div className="mission-stats">
            <div className="stat-card">
              <h4>120+</h4>
              <p>Чистых локаций</p>
            </div>
            <div className="stat-card">
              <h4>500кг</h4>
              <p>Собрано пластика</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STEPS - КАК ЭТО РАБОТАЕТ */}
      <section className="steps-section">
        <div className="section-header">
          <span className="info-num">02</span>
          <h2>Три шага к цели</h2>
        </div>
        <div className="steps-grid">
          <div className="step-item">
            <h3>Find</h3>
            <p>Выбирай на карте "красную зону". Это места, которые больше всего нуждаются в уборке прямо сейчас.</p>
          </div>
          <div className="step-item">
            <h3>Clean</h3>
            <p>Сделай фото "До", проведи уборку и сделай фото "После". Наш бот мгновенно проверит результат.</p>
          </div>
          <div className="step-item">
            <h3>Earn</h3>
            <p>Получай XP и баллы. Ставновись лучшим в топе и получай призы от нашего проекта.</p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION - ПРИЗЫВ (Финальный акцент) */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Готов стать <br/>частью истории?</h2>
          <button className="cta-btn" onClick={() => navigate('/map')}>Перейти к карте</button>
        </div>
      </section>
      
    </div>
  );
};


export default Home;



