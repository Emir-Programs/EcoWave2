import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(true); // Переключатель Вход/Регистрация
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Новое поле для связи
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // РЕГИСТРАЦИЯ
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Создаем документ в Firestore с телефоном
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name,
          phone: phone, // Сохраняем номер для связи
          email: email,
          xp: 0,
          level: 1,
          inProgressCount: 0,
          completedCount: 0,
          createdAt: new Date()
        });
        alert("Успешная регистрация!");
      } else {
        // ВХОД
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/map');
    } catch (error) {
      alert("Ошибка: " + error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleAuth}>
          <h2>{isRegister ? "Создать аккаунт" : "С возвращением"}</h2>
          <p className="auth-subtitle">Присоединяйся к Eco-Wave Osh</p>

          {isRegister && (
            <>
              <input 
                type="text" 
                placeholder="Твоё имя" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
              <input 
                type="tel" 
                placeholder="Номер телефона (например, +996...)" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
              />
            </>
          )}

          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Пароль" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          <button type="submit" className="auth-submit">
            {isRegister ? "Зарегистрироваться" : "Войти"}
          </button>

          <p className="auth-toggle">
            {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"} 
            <span onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? " Войти" : " Создать"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;