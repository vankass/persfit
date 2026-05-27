const TRANSLATIONS: Record<string, string> = {
  // Уровни сложности
  "beginner": "Новичок",
  "intermediate": "Средний",
  "expert": "Профи",
  
  // Тип (категория в твоем JSON)
  "strength": "Силовая",
  "stretching": "Растяжка",
  "cardio": "Кардио",
  "powerlifting": "Пауэрлифтинг",
  "plyometrics": "Плиометрика",
  "olympic weightlifting": "Тяжелая атлетика",
  "strongman": "Стронгмен",

// Оборудование
  "body only": "Свой вес",
  "dumbbell": "Гантели",
  "barbell": "Штанга",
  "kettlebells": "Гири",
  "bands": "Резинки",
  "cable": "Тросовый тренажер",
  "machine": "Тренажер",
  "medicine ball": "Медбол",
  "exercise ball": "Фитбол",
  "e-z curl bar": "EZ-гриф",
  "foam roll": "МФР ролл",
  "other": "Спецоборудование",

  // Группы мышц
  "abdominals": "Пресс",
  "abductors": "Отводящие мышцы бедра",
  "adductors": "Приводящие мышцы бедра",
  "biceps": "Бицепс",
  "calves": "Икры",
  "chest": "Грудь",
  "forearms": "Предплечья",
  "glutes": "Ягодицы",
  "hamstrings": "Бицепс бедра",
  "lats": "Широчайшие мышцы",
  "lower back": "Поясница",
  "middle back": "Середина спины",
  "neck": "Шея",
  "quadriceps": "Квадрицепс",
  "shoulders": "Плечи",
  "traps": "Трапеции",
  "triceps": "Трицепс",

  // Механика 
  "isolation": "Изолирующее",
  "compound": "Базовое",

  // Усилия
  "pull": "Тяга",
  "push": "Жим",
  "static": "Статика",

  //Пол
  "male": "Мужчина",
  "female": "Женщина"
};

export const translate = (key: string | null | undefined): string => {
  if (!key) return "Не указано";
  const lowerKey = key.toLowerCase();
  return TRANSLATIONS[lowerKey] || key;
};