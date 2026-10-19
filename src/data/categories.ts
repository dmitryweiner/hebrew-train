// Русские названия категорий словаря

export const CATEGORY_NAMES: Record<string, string> = {
  food: 'Еда',
  animals: 'Животные',
  objects: 'Предметы',
  home: 'Дом',
  nature: 'Природа',
  transport: 'Транспорт',
  clothing: 'Одежда',
  body: 'Тело',
};

export const getCategoryName = (category: string): string => CATEGORY_NAMES[category] ?? category;
