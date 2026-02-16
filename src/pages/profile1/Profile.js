import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot, query, collection, where } from "firebase/firestore"; // ПРОВЕРЬ ЭТУ СТРОКУ
import './Profile.css';

const ProfilePage = ({ user }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      
      // Слушаем изменения в реальном времени
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }, (error) => {
        console.error("Ошибка при получении профиля:", error);
      });

      return () => unsubscribe(); // Отписываемся при закрытии страницы
    }
  }, [user]);

  const [activeTasks, setActiveTasks] = useState([]);

useEffect(() => {
  if (user) {
    // Слушаем только те локации, которые взял этот пользователь
    const q = query(collection(db, "locations"), where("workerId", "==", user.uid), where("status", "==", "in-progress"));
    
    const unsubscribeTasks = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveTasks(tasks);
    });

    return () => unsubscribeTasks();
  }
}, [user]);

  if (!userData) return <div className="loading">Загрузка профиля...</div>;
  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.photoURL} alt="avatar" />
        <h1>{userData.name}</h1>
        <p>Уровень: {userData.level}</p>
        <div className="xp-bar">XP: {userData.xp}</div>
      </div>

      <div className="tasks-stats">
        <div className="stat-box">
          <h3>{userData.inProgressCount || 0}</h3>
          <p>В процессе</p>
        </div>
        <div className="stat-box">
          <h3>{userData.completedCount || 0}</h3>
          <p>Сделано</p>
        </div>
      </div>
      <div className="active-tasks-section">
  <h2>{activeTasks.length > 0 ? "Мои текущие задачи" : "Нет активных задач"}</h2>
  <div className="tasks-list">
    {activeTasks.map(task => (
      <div key={task.id} className="task-card-mini">
        <div className="task-info">
          <h4>{task.name}</h4>
          <span>Награда: {task.xp_reward} XP</span>
        </div>
        {/* Кнопка перекидывает в Телеграм и передает ID задачи, чтобы бот знал, о чем речь */}
        <a 
  href={`https://t.me/EcoWaveOshbot?start=task_${task.id}_${user.uid}`} 
  target="_blank" 
  rel="noreferrer"
  className="done-btn"
>
  Сделал
</a>
      </div>
    ))}
  </div>
</div>
    </div>
  );
};


export default ProfilePage;