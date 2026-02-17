import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Исправление бага с иконками Leaflet в React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminMap = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tempPoints, setTempPoints] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [reward, setReward] = useState(100); // Динамическая награда
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('admin_access');
        if (saved === '1234') setIsAuthenticated(true);
        else {
            const pass = prompt("Пароль:");
            if (pass === '1234') {
                localStorage.setItem('admin_access', '1234');
                setIsAuthenticated(true);
            } else window.location.href = "/";
        }
    }, []);

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                if (tempPoints.length < 4) {
                    setTempPoints(prev => [...prev, e.latlng]);
                }
            },
        });
        return (
            <>
                {tempPoints.map((p, i) => (
                    <Marker key={i} position={p} />
                ))}
                {tempPoints.length > 1 && (
                    <Polyline 
                        positions={tempPoints.length === 4 ? [...tempPoints, tempPoints[0]] : tempPoints} 
                        color={tempPoints.length === 4 ? "#2ecc71" : "#3498db"} 
                        dashArray={tempPoints.length === 4 ? "" : "5, 10"}
                    />
                )}
            </>
        );
    };

    const handleSave = async () => {
        if (tempPoints.length < 4) return alert("Нужно выбрать 4 точки для замыкания зоны!");
        if (!taskName.trim()) return alert("Введите название локации!");

        setLoading(true);
        try {
            // Более подробный объект данных
            const locationData = {
                name: taskName,
                // Сохраняем и как строки для читаемости, и как объекты для расчетов
                coords: tempPoints.map(p => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`),
                rawPoints: tempPoints.map(p => ({ lat: p.lat, lng: p.lng })),
                status: "active",
                workerId: null,
                createdAt: serverTimestamp(), // Используем серверное время Firebase
                xp_reward: Number(reward),
                areaType: "polygon"
            };

            await addDoc(collection(db, "locations"), locationData);

            console.log("Данные успешно отправлены:", locationData);
            alert(`Зона "${taskName}" создана!`);
            
            // Сброс формы
            setTempPoints([]);
            setTaskName("");
        } catch (e) {
            console.error("Ошибка при сохранении:", e);
            alert("Ошибка сети. Проверьте консоль.");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div style={{ position: 'relative', fontFamily: 'sans-serif' }}>
            <MapContainer center={[40.5139, 72.8161]} zoom={13} style={{ height: "100vh", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents />
            </MapContainer>

            {/* Панель управления */}
            <div style={panelStyle}>
                <h3 style={{ marginTop: 0 }}>📍 Новая зона</h3>
                
                <div style={inputGroup}>
                    <label>Название:</label>
                    <input 
                        style={inputStyle}
                        placeholder="Напр: Парк Победы" 
                        value={taskName} 
                        onChange={e => setTaskName(e.target.value)} 
                    />
                </div>

                <div style={inputGroup}>
                    <label>Награда (XP):</label>
                    <input 
                        type="number"
                        style={inputStyle}
                        value={reward} 
                        onChange={e => setReward(e.target.value)} 
                    />
                </div>

                <div style={infoBox}>
                    <small>Выбрано точек: <b>{tempPoints.length} из 4</b></small>
                    <div style={progressBg}>
                        <div style={{...progressFill, width: `${(tempPoints.length / 4) * 100}%`}}></div>
                    </div>
                </div>

                <button 
                    onClick={handleSave} 
                    disabled={tempPoints.length < 4 || loading}
                    style={{...btnStyle, backgroundColor: (tempPoints.length < 4 || loading) ? '#ccc' : '#2ecc71'}}
                >
                    {loading ? "Сохранение..." : "Сохранить зону"}
                </button>

                <button onClick={() => setTempPoints([])} style={btnReset}>
                    Сбросить точки
                </button>
            </div>
        </div>
    );
};

// Стили в объектах для чистоты кода
const panelStyle = {
    position: 'absolute', top: 20, right: 20, zIndex: 1000,
    background: 'white', padding: '20px', borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '250px'
};

const inputGroup = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '10px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnReset = { width: '100%', marginTop: '10px', background: 'none', border: '1px solid #ff7675', color: '#ff7675', padding: '8px', borderRadius: '6px', cursor: 'pointer' };
const infoBox = { margin: '15px 0', fontSize: '12px' };
const progressBg = { width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginTop: '5px' };
const progressFill = { height: '100%', background: '#3498db', borderRadius: '3px', transition: 'width 0.3s' };

export default AdminMap;
