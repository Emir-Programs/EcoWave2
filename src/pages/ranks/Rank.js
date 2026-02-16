import React, { useState, useEffect } from 'react';
import './Rank.css';
import { db } from '../../firebase'; // Проверь путь к файлу firebase.js
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { useTranslation } from 'react-i18next';

const RankPage = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Запрос: берем коллекцию "users", сортируем по XP, берем топ 50
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1, // Ранг вычисляем по порядку сортировки
        ...doc.data(),
        // Если аватара нет в базе, ставим дефолтный
        avatar: doc.data().avatar || "👤" 
      }));
      setPlayers(usersData);
    });

    return () => unsubscribe();
  }, []);

  // Если данных еще нет (загрузка)
  if (players.length === 0) return <div className="loading">Загрузка топа...</div>;

  // Безопасное получение топ-3 (через optional chaining ?.)
  const top1 = players[0];
  const top2 = players[1];
  const top3 = players[2];
  
  // Остальные игроки (с 4 места)
  const others = players.slice(3);

  return (
    <div className="rank-page">
      <div className="rank-header">
        <h2>Лидеры Оша</h2>
        <p>Лучшие эко-герои этого месяца</p>
      </div>

      <div className="podium">
        {/* 2 МЕСТО */}
        {top2 && (
          <div className="podium-item second">
            <div className="avatar-wrapper">
              <span className="avatar">🥈</span>
            </div>
            <p className="podium-name">{top2.name}</p>
            <div className="step">{top2.xp} XP</div>
          </div>
        )}

        {/* 1 МЕСТО */}
        {top1 && (
          <div className="podium-item first">
            <div className="crown">👑</div>
            <div className="avatar-wrapper main">
              <span className="avatar">🤴</span>
            </div>
            <p className="podium-name">{top1.name}</p>
            <div className="step">{top1.xp} XP</div>
          </div>
        )}

        {/* 3 МЕСТО */}
        {top3 && (
          <div className="podium-item third">
            <div className="avatar-wrapper">
              <span className="avatar">🥉</span>
            </div>
            <p className="podium-name">{top3.name}</p>
            <div className="step">{top3.xp} XP</div>
          </div>
        )}
      </div>

      <div className="rank-list">
        {others.map(player => (
          <div key={player.id} className="list-item">
            <span className="list-rank">#{player.rank}</span>
            <span className="list-avatar">{player.avatar}</span>
            <span className="list-name">{player.name}</span>
            <span className="list-xp">{player.xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankPage;