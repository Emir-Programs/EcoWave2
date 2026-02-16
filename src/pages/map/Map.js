import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { db } from '../../firebase';
import { collection, onSnapshot } from "firebase/firestore";
import { updateDoc, doc, increment } from "firebase/firestore";

const MapPage = ({ user }) => { // Принимаем user из пропсов
  const { t } = useTranslation();
  const position = [40.5139, 72.8161]; // Центр Оша
  const [dirtyZones, setDirtyZones] = useState([]);

  useEffect(() => {
    // Подписываемся на данные из Firebase
    const unsubscribe = onSnapshot(collection(db, "locations"), (snapshot) => {
      const zones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDirtyZones(zones);
    });

    return () => unsubscribe();
  }, []);

  const handleTakeTask = async (zone) => {
  if (!user) return alert("Войдите в аккаунт!");
  if (zone.status === 'in-progress') return alert("Это задание уже кто-то делает!");

  try {
    const userRef = doc(db, "users", user.uid);
    const zoneRef = doc(db, "locations", zone.id);

    // 1. Обновляем юзера (добавляем XP и +1 к заданиям в процессе)
    // Важно: проверь, что в Firebase поле называется 'xp', а не 'XP' (регистр важен!)
    await updateDoc(userRef, {
      xp: increment(Number(zone.xp) || 0),
      inProgressCount: increment(1)
    });

    // 2. Обновляем зону (ставим статус и записываем, кто её взял)
    await updateDoc(zoneRef, {
      status: 'in-progress',
      workerId: user.uid // чтобы знать, кто именно убирается
    });

    alert(`Задание принято! Тебе начислено ${zone.xp} XP`);
  } catch (error) {
    console.error("Ошибка:", error);
  }
};
  // Функция для конвертации строк "lat, lng" в числа для Leaflet
  const formatCoords = (coordsArray) => {
    if (!coordsArray || !Array.isArray(coordsArray)) return [];
    return coordsArray.map(str => {
      const [lat, lng] = str.split(',').map(Number);
      return [lat, lng];
    });
  };

  return (
    <div className="map-container">
      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {dirtyZones.map(zone => {
  // Определяем цвет на основе статуса
  let zoneColor = "#ff4757"; // По умолчанию красный
  if (zone.status === 'in-progress') zoneColor = "#f1c40f"; // Желтый
  if (zone.status === 'clean') zoneColor = "#2ecc71"; // Зеленый

  return (
    <Polygon 
      key={zone.id}
      positions={formatCoords(zone.coords)} 
      pathOptions={{ 
        color: zoneColor,
        fillColor: zoneColor, 
        fillOpacity: 0.6
      }}
    >
      <Popup>
        <h3>{zone.name}</h3>
        <p>Награда: {zone.xp_reward} XP</p>
        
        {zone.status === 'in-progress' ? (
          <p><b>⚠️ Задание уже выполняется</b></p>
        ) : zone.status === 'clean' ? (
          <p><b>✅ Убрано</b></p>
        ) : (
          <button className="take-btn" onClick={() => handleTakeTask(zone)}>
            Забрать задание
          </button>
        )}
      </Popup>
    </Polygon>
  );
})}
      </MapContainer>
    </div>
  );
};

export default MapPage;