import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ru: {
    translation: {
      nav: { home: "Главная", map: "Карта", rank: "Топ", fund: "Фонд" },
      hero: { title: "Волна перемен", subtitle: "в городе Ош" },
      footer: { dev: "DEVELOPED BY", bio: "Frontend Developer & Eco-activist" }
    }
  },
  en: {
    translation: {
      nav: { home: "Home", map: "Map", rank: "Top", fund: "Fund" },
      hero: { title: "Wave of Change", subtitle: "in Osh city" },
      footer: { dev: "DEVELOPED BY", bio: "Frontend Developer & Eco-activist" }
    }
  },
  kg: {
    translation: {
      nav: { home: "Башкы", map: "Карта", rank: "Мыктылар", fund: "Фонд" },
      hero: { title: "Өзгөрүү толкуну", subtitle: "Ош шаарында" },
      footer: { dev: "ИШТЕП ЧЫККАН", bio: "Frontend Developer & Эко-активист" }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ru", // Язык по умолчанию
    interpolation: { escapeValue: false }
  });

export default i18n;