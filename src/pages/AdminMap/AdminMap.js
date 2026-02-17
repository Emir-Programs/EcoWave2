import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Tooltip, Polygon, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

// Настройка иконок
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminMap = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [existingLocations, setExistingLocations] = useState([]); // Сохраненные локации
    const [tempPoints, setTempPoints] = useState([]); // Точки новой/редактируемой зоны
    const [taskName, setTaskName] = useState("");
    const [reward, setReward] = useState(100);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null); // ID редактируемой зоны

    // Подгрузка данных из Firebase в реальном времени
    useEffect(() => {
        const saved = localStorage.getItem('admin_access');
        if (saved === '1234') setIsAuthenticated(true);

        const unsubscribe = onSnapshot(collection(db, "locations"), (snapshot) => {
            const locs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Преобразуем массив строк обратно в объекты для карты, если нужно
                path: doc.data().rawPoints || [] 
            }));
            setExistingLocations(locs);
        });
        return () => unsubscribe();
    }, []);

    // Функция копирования в буфер
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Координаты скопированы!");
    };

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                if (tempPoints.length < 4 && !editingId) {
                    setTempPoints(prev => [...prev, e.latlng]);
                }
            },
        });
        return null;
    };

    // Компонент маркера с перетаскиванием и копированием
    const DraggableMarker = ({ position, index, setPoints }) => {
        const eventHandlers = useMemo(() => ({
            dragend(e) {
                const newPos = e.target.getLatLng();
                setPoints(prev => {
                    const next = [...prev];
                    next[index] = newPos;
                    return next;
                });
            },
        }), [index, setPoints]);

        const coordStr = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;

        return (
            <Marker position={position} draggable={true} eventHandlers={eventHandlers}>
                <Tooltip permanent direction="top">
                    <div style={{ textAlign: 'center' }}>
                        <div>{coordStr}</div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(coordStr); }}
                            style={{ fontSize: '9px', marginTop: '2px', cursor: 'pointer' }}
                        >
                            Копировать
                        </button>
                    </div>
                </Tooltip>
            </Marker>
        );
    };

    const handleSave = async () => {
        if (tempPoints.length < 4) return alert("Нужно 4 точки!");
        setLoading(true);
        
        const data = {
            name: taskName,
            coords: tempPoints.map(p => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`),
            rawPoints: tempPoints.map(p => ({ lat: p.lat, lng: p.lng })),
            xp_reward: Number(reward),
            status: "active",
            updatedAt: serverTimestamp()
        };

        try {
            if (editingId) {
                await updateDoc(doc(db, "locations", editingId), data);
                alert("Обновлено!");
            } else {
                await addDoc(collection(db, "locations"), { ...data, createdAt: serverTimestamp() });
                alert("Создано!");
            }
            resetForm();
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить эту локацию навсегда?")) {
            await deleteDoc(doc(db, "locations", id));
            resetForm();
        }
    };

    const startEdit = (loc) => {
        setEditingId(loc.id);
        setTaskName(loc.name);
        setReward(loc.xp_reward);
        setTempPoints(loc.rawPoints);
    };

    const resetForm = () => {
        setTempPoints([]);
        setTaskName("");
        setEditingId(null);
        setReward(100);
    };

    if (!isAuthenticated) return null;

    return (
        <div style={{ position: 'relative' }}>
            <MapContainer center={[40.5139, 72.8161]} zoom={13} style={{ height: "100vh" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents />

                {/* Отображение существующих зон */}
                {existingLocations.map(loc => (
                    <Polygon 
                        key={loc.id} 
                        positions={loc.path} 
                        color={editingId === loc.id ? "orange" : "#3498db"}
                        eventHandlers={{ click: () => startEdit(loc) }}
                    >
                        <Popup>
                            <strong>{loc.name}</strong> <br/>
                            Награда: {loc.xp_reward} XP <br/>
                            <button onClick={() => startEdit(loc)}>Редактировать</button>
                            <button onClick={() => handleDelete(loc.id)} style={{ color: 'red', marginLeft: '5px' }}>Удалить</button>
                        </Popup>
                    </Polygon>
                ))}

                {/* Маркеры текущей работы (создание или правка) */}
                {tempPoints.map((p, i) => (
                    <DraggableMarker key={`temp-${i}`} position={p} index={i} setPoints={setTempPoints} />
                ))}

                {tempPoints.length > 1 && (
                    <Polyline positions={tempPoints.length === 4 ? [...tempPoints, tempPoints[0]] : tempPoints} color="orange" />
                )}
            </MapContainer>

            {/* Панель управления */}
            <div style={panelStyle}>
                <h4>{editingId ? "📝 Редактирование" : "📍 Новая зона"}</h4>
                <input placeholder="Название" value={taskName} onChange={e => setTaskName(e.target.value)} style={inputStyle} />
                <input type="number" placeholder="XP" value={reward} onChange={e => setReward(e.target.value)} style={inputStyle} />
                
                <div style={{ fontSize: '12px', marginBottom: '10px' }}>Точек: {tempPoints.length}/4</div>

                <button onClick={handleSave} disabled={tempPoints.length < 4 || loading} style={btnSave}>
                    {editingId ? "Сохранить изменения" : "Создать зону"}
                </button>

                {(tempPoints.length > 0 || editingId) && (
                    <button onClick={resetForm} style={btnReset}>Отмена / Сброс</button>
                )}

                <div style={{ marginTop: '15px', maxHeight: '200px', overflowY: 'auto', borderTop: '1px solid #eee' }}>
                    <small><b>Список локаций:</b></small>
                    {existingLocations.map(l => (
                        <div key={l.id} style={listItem} onClick={() => startEdit(l)}>
                            {l.name} ({l.xp_reward} XP)
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const panelStyle = { position: 'absolute', top: 20, right: 20, zIndex: 1000, background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '240px' };
const inputStyle = { width: '100%', marginBottom: '8px', padding: '6px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' };
const btnSave = { width: '100%', padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btnReset = { width: '100%', marginTop: '5px', padding: '8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const listItem = { padding: '5px', fontSize: '12px', borderBottom: '1px solid #f9f9f9', cursor: 'pointer', color: '#555' };

export default AdminMap;
