import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Добавляем Firestore
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Добавь это

const firebaseConfig = {
  apiKey: "AIzaSyBH4jORIamf3dviJeuEv35M87Eyn8LRjwk",
  authDomain: "eco-wave-61f37.firebaseapp.com",
  databaseURL: "https://eco-wave-61f37-default-rtdb.firebaseio.com",
  projectId: "eco-wave-61f37",
  storageBucket: "eco-wave-61f37.firebasestorage.app",
  messagingSenderId: "888631268044",
  appId: "1:888631268044:web:941e19c73ad955ce976869",
  measurementId: "G-FHMD7CGM6V"
};

// Инициализируем приложение
const app = initializeApp(firebaseConfig);

// Инициализируем сервисы
export const db = getFirestore(app); // Экспортируем базу данных
export const analytics = getAnalytics(app);
export const auth = getAuth(app); // Экспортируем Auth
export const googleProvider = new GoogleAuthProvider(); // Экспортируем Провайдер