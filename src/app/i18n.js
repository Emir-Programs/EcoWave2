import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ru: {
    translation: {
      nav: { home: "Главная", map: "Карта", rank: "Топ", fund: "Фонд", profile: "Профиль" },
      hero: { title: "Волна перемен", subtitle: "в городе Ош",description:"Мы создаем новую культуру городского пространства. Присоединяйся к волонтерам, которые делают свой дом чище каждый день." },
      footer: { dev: "DEVELOPED BY", bio: "Frontend Developer & Eco-activist" }
    }
  },
  en: {
    translation: {
      nav: { home: "Home", map: "Map", rank: "Top", fund: "Fund", profile:"Профиль" },
      hero: { title: "Wave of Change", subtitle: "in Osh city", description:"We're creating a new culture of urban space. Join the volunteers who make their homes cleaner every day."  },
      footer: { dev: "DEVELOPED BY", bio: "Frontend Developer & Eco-activist" }
    }
  },
  kg: {
    translation: {
      nav: { home: "Башкы", map: "Карта", rank: "Мыктылар", fund: "Фонд", profile:"Profile" },
      hero: { title: "Өзгөрүү толкуну", subtitle: "Ош шаарында", description:"Биз шаардык мейкиндиктин жаңы маданиятын түзүп жатабыз. Үйлөрүн күн сайын таза кылган ыктыярчыларга кошулуңуз." },
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

