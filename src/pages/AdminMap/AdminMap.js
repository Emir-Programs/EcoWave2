import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../../firebase';
import { collection, addDoc } from "firebase/firestore";

const AdminMap = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tempPoints, setTempPoints] = useState([]); // Массив для 4-х точек
    const [taskName, setTaskName] = useState("");

    // Проверка пароля (оставляем как было)
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

    // Обработчик кликов
    const MapEvents = () => {
        useMapEvents({
            click(e) {
                if (tempPoints.length < 4) {
                    setTempPoints([...tempPoints, e.latlng]);
                } else {
                    alert("Уже выбрано 4 точки! Нажми 'Сброс', чтобы начать заново.");
                }
            },
        });
        return (
            <>
                {tempPoints.map((p, i) => <Marker key={i} position={p} />)}
                {tempPoints.length > 1 && <Polyline positions={[...tempPoints, tempPoints[0]]} color="green" />}
            </>
        );
    };

    const handleSave = async () => {
        if (tempPoints.length < 4) return alert("Нужно выбрать ровно 4 точки!");
        if (!taskName) return alert("Введите название!");

        try {
            // Форматируем в массив строк "lat, lng" как на твоем скриншоте
            const coordsArray = tempPoints.map(p => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`);

            await addDoc(collection(db, "locations"), {
                name: taskName,
                coords: coordsArray, // Тот самый массив из 4-х строк
                status: "active",
                workerId: null,
                createdAt: new Date(),
                xp_reward: 100
            });

            alert("Зона успешно создана!");
            setTempPoints([]);
            setTaskName("");
        } catch (e) {
            console.error(e);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div style={{ position: 'relative' }}>
            <MapContainer center={[40.5139, 72.8161]} zoom={13} style={{ height: "100vh" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents />
            </MapContainer>

            <div className="admin-floating-panel" style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, background: 'white', padding: 20, borderRadius: 10 }}>
                <h3>Создание зоны ({tempPoints.length}/4)</h3>
                <input 
                    placeholder="Название локации" 
                    value={taskName} 
                    onChange={e => setTaskName(e.target.value)} 
                    style={{ display: 'block', marginBottom: 10 }}
                />
                <button onClick={handleSave} disabled={tempPoints.length < 4}>Сохранить зону</button>
                <button onClick={() => setTempPoints([])} style={{ marginLeft: 10 }}>Сброс</button>
            </div>
        </div>
    );
};

export default AdminMap;