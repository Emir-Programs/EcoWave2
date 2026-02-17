import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Фикс иконок
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
    const [reward, setReward] = useState(100);
    const [loading, setLoading] = useState(false);

    // 1. Обработчик кликов по карте для добавления точек
    const MapEvents = () => {
        useMapEvents({
            click(e) {
                if (tempPoints.length < 4) {
                    setTempPoints(prev => [...prev, e.latlng]);
                }
            },
        });
        return null;
    };

    // 2. Компонент перетаскиваемого маркера с координатами
    const DraggableMarker = ({ position, index, setTempPoints }) => {
        const eventHandlers = useMemo(() => ({
            dragend(e) {
                const marker = e.target;
                const newPos = marker.getLatLng();
                setTempPoints(prev => {
                    const newPoints = [...prev];
                    newPoints[index] = newPos;
                    return newPoints;
                });
            },
        }), [index, setTempPoints]);

        return (
            <Marker
                position={position}
                draggable={true} // Включаем перетаскивание
                eventHandlers={eventHandlers}
            >
                <Tooltip permanent direction="top" offset={[0, -20]}>
                    {/* Отображение координат прямо на карте */}
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
                        {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                    </div>
                </Tooltip>
            </Marker>
        );
    };

    // --- Логика авторизации и сохранения (без изменений) ---
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

    const handleSave = async () => {
        if (tempPoints.length < 4) return alert("Поставьте 4 точки!");
        if (!taskName.trim()) return alert("Введите название!");

        setLoading(true);
        try {
            const locationData = {
                name: taskName,
                coords: tempPoints.map(p => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`),
                rawPoints: tempPoints.map(p => ({ lat: p.lat, lng: p.lng })),
                status: "active",
                createdAt: serverTimestamp(),
                xp_reward: Number(reward)
            };
            await addDoc(collection(db, "locations"), locationData);
            alert("Зона сохранена!");
            setTempPoints([]);
            setTaskName("");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div style={{ position: 'relative' }}>
            <MapContainer center={[40.5139, 72.8161]} zoom={13} style={{ height: "100vh" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                <MapEvents />

                {/* Рендерим интерактивные маркеры */}
                {tempPoints.map((p, i) => (
                    <DraggableMarker 
                        key={i} 
                        position={p} 
                        index={i} 
                        setTempPoints={setTempPoints} 
                    />
                ))}

                {/* Линия периметра */}
                {tempPoints.length > 1 && (
                    <Polyline 
                        positions={tempPoints.length === 4 ? [...tempPoints, tempPoints[0]] : tempPoints} 
                        color="#2ecc71" 
                        weight={3}
                    />
                )}
            </MapContainer>

            {/* Интерфейс управления */}
            <div style={panelStyle}>
                <h4 style={{ margin: '0 0 10px 0' }}>Настройка зоны</h4>
                <input 
                    placeholder="Название" 
                    value={taskName} 
                    onChange={e => setTaskName(e.target.value)} 
                    style={inputStyle}
                />
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                    Точек: {tempPoints.length}/4 {tempPoints.length === 4 && "✅"}
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={tempPoints.length < 4 || loading}
                    style={{ ...btnStyle, backgroundColor: tempPoints.length === 4 ? '#27ae60' : '#bdc3c7' }}
                >
                    {loading ? "Запись..." : "Сохранить в Firebase"}
                </button>
                <button onClick={() => setTempPoints([])} style={btnReset}>Сбросить</button>
                
                <hr />
                <div style={{ fontSize: '11px' }}>
                    💡 <i>Вы можете перетаскивать маркеры на карте, чтобы подправить границы.</i>
                </div>
            </div>
        </div>
    );
};

// Стили
const panelStyle = { position: 'absolute', top: 20, right: 20, zIndex: 1000, background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '220px' };
const inputStyle = { width: '100%', marginBottom: '10px', padding: '5px', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '8px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const btnReset = { width: '100%', marginTop: '5px', background: 'none', border: '1px solid #e74c3c', color: '#e74c3c', cursor: 'pointer', padding: '5px' };

export default AdminMap;
