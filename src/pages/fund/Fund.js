import React, { useState } from 'react';
import './Fund.css';
import qrPhoto from '../../components/qr.png';
import wayToPay from '../../components/waysToPay.png'; // Импортируйте второе фото
import { useTranslation } from 'react-i18next';

const FundPage = () => {
  const [goal] = useState(50000);
  const [raised] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // Используем булево значение для логики
  const progress = (raised / goal) * 100;
  const { t } = useTranslation();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div className="fund-container">
      {/* Секция Hero - Минималистичное фото */}
      <div className="fund-hero">
        <img 
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013" 
          alt="Clean Nature" 
          className="fund-image"
          style={{  }}
        />
        <div className="fund-hero-text">
          <h1>Фонд Инвентаря</h1>
          <p>Прозрачный сбор на средства очистки города Ош</p>
        </div>
      </div>


      <div className="donate-grid-minimal">
        <div className="donate-card">
          <h2>Поддержать волну</h2>
          <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
          <p>Все средства идут на покупку биоразлагаемых мешков и прочных перчаток.</p>
          
          <div className="amount-selectors">
            <button className="amount-btn">50 сом</button>
            <button className="amount-btn active">100 сом</button>
            <button className="amount-btn">300 сом</button>
          </div>
          
          <button className="pay-button" onClick={handleOpen}>Поддержать проект</button>
          
          {/* Модальное окно */}
          {isOpen && (
            <div className="Modal-Overlay" onClick={handleClose}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={handleClose}>&times;</button>
                
                <h3>Способы оплаты</h3>
                <p className="modal-subtitle">Сканируйте QR или выберите удобный сервис</p>
                
                <div className="payment-content">
                  <div className="payment-box">
                    <span>QR-код для оплаты</span>
                    <img src={qrPhoto} alt="QR Code" className="modal-img" />
                  </div>
                  <div className="payment-box">
                    <span>Инструкция / Сервисы</span>
                    <img src={wayToPay} alt="Ways to pay" className="modal-img" />
                  </div>
                </div>
                
                <span className="secure-text-modal">MBANK • ЭЛСОМ • О!Деньги</span>
              </div>
            </div>
          )}

          <span className="secure-text">💳 Безопасный платеж через MBANK / ЭЛСОМ</span>
        </div>
      </div>
    </div>
  );
};

export default FundPage;