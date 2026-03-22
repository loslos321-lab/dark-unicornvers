import type { CyrillicLetter } from '../types';

export const CYRILLIC_ALPHABET: CyrillicLetter[] = [
  { letter: 'А', name: 'а', sound: 'a', equivalent: 'A', example: { russian: 'Автобус', german: 'Bus' } },
  { letter: 'Б', name: 'бэ', sound: 'b', equivalent: 'B', example: { russian: 'Банк', german: 'Bank' } },
  { letter: 'В', name: 'вэ', sound: 'w/v', equivalent: 'W', example: { russian: 'Вода', german: 'Wasser' } },
  { letter: 'Г', name: 'гэ', sound: 'g', equivalent: 'G', example: { russian: 'Город', german: 'Stadt' } },
  { letter: 'Д', name: 'дэ', sound: 'd', equivalent: 'D', example: { russian: 'Дом', german: 'Haus' } },
  { letter: 'Е', name: 'е', sound: 'je/e', equivalent: 'E', example: { russian: 'Еда', german: 'Essen' } },
  { letter: 'Ё', name: 'ё', sound: 'jo', equivalent: 'O', example: { russian: 'Ёлка', german: 'Tannenbaum' } },
  { letter: 'Ж', name: 'жэ', sound: 'sch', equivalent: 'Zh', example: { russian: 'Журнал', german: 'Zeitschrift' } },
  { letter: 'З', name: 'зэ', sound: 's', equivalent: 'Z', example: { russian: 'Завтрак', german: 'Frühstück' } },
  { letter: 'И', name: 'и', sound: 'i', equivalent: 'I', example: { russian: 'Игра', german: 'Spiel' } },
  { letter: 'Й', name: 'и краткое', sound: 'j', equivalent: 'J', example: { russian: 'Йогурт', german: 'Joghurt' } },
  { letter: 'К', name: 'ка', sound: 'k', equivalent: 'K', example: { russian: 'Кофе', german: 'Kaffee' } },
  { letter: 'Л', name: 'эль', sound: 'l', equivalent: 'L', example: { russian: 'Лампа', german: 'Lampe' } },
  { letter: 'М', name: 'эм', sound: 'm', equivalent: 'M', example: { russian: 'Мама', german: 'Mama' } },
  { letter: 'Н', name: 'эн', sound: 'n', equivalent: 'N', example: { russian: 'Нос', german: 'Nase' } },
  { letter: 'О', name: 'о', sound: 'o', equivalent: 'O', example: { russian: 'Окно', german: 'Fenster' } },
  { letter: 'П', name: 'пэ', sound: 'p', equivalent: 'P', example: { russian: 'Папа', german: 'Papa' } },
  { letter: 'Р', name: 'эр', sound: 'r', equivalent: 'R', example: { russian: 'Ресторан', german: 'Restaurant' } },
  { letter: 'С', name: 'эс', sound: 's', equivalent: 'S', example: { russian: 'Стол', german: 'Tisch' } },
  { letter: 'Т', name: 'тэ', sound: 't', equivalent: 'T', example: { russian: 'Телефон', german: 'Telefon' } },
  { letter: 'У', name: 'у', sound: 'u', equivalent: 'U', example: { russian: 'Улица', german: 'Straße' } },
  { letter: 'Ф', name: 'эф', sound: 'f', equivalent: 'F', example: { russian: 'Фильм', german: 'Film' } },
  { letter: 'Х', name: 'ха', sound: 'ch', equivalent: 'H', example: { russian: 'Хлеб', german: 'Brot' } },
  { letter: 'Ц', name: 'цэ', sound: 'z', equivalent: 'Z', example: { russian: 'Цирк', german: 'Zirkus' } },
  { letter: 'Ч', name: 'че', sound: 'tsch', equivalent: 'Ch', example: { russian: 'Чай', german: 'Tee' } },
  { letter: 'Ш', name: 'ша', sound: 'sch', equivalent: 'Sh', example: { russian: 'Школа', german: 'Schule' } },
  { letter: 'Щ', name: 'ща', sound: 'schtsch', equivalent: 'Shch', example: { russian: 'Щи', german: 'Kohlsuppe' } },
  { letter: 'Ъ', name: 'твёрдый знак', sound: '-', equivalent: '-', example: { russian: 'Съёмка', german: 'Dreharbeiten' } },
  { letter: 'Ы', name: 'ы', sound: 'y', equivalent: 'Y', example: { russian: 'Мы', german: 'Wir' } },
  { letter: 'Ь', name: 'мягкий знак', sound: '\'', equivalent: "'", example: { russian: 'Письмо', german: 'Brief' } },
  { letter: 'Э', name: 'э', sound: 'e', equivalent: 'E', example: { russian: 'Это', german: 'Das' } },
  { letter: 'Ю', name: 'ю', sound: 'ju', equivalent: 'Yu', example: { russian: 'Юбка', german: 'Rock' } },
  { letter: 'Я', name: 'я', sound: 'ja', equivalent: 'Ya', example: { russian: 'Яблоко', german: 'Apfel' } },
];

// Weiche und harte Laute
export const SOFT_HARD_PAIRS = [
  { hard: 'Т', soft: 'Ч', exampleHard: 'Ты', exampleSoft: 'Чай' },
  { hard: 'С', soft: 'Ш', exampleHard: 'Сад', exampleSoft: 'Шарф' },
  { hard: 'З', soft: 'Ж', exampleHard: 'Зуб', exampleSoft: 'Жук' },
  { hard: 'К', soft: 'Ч', exampleHard: 'Кот', exampleSoft: 'Чек' },
  { hard: 'Г', soft: 'Ж', exampleHard: 'Год', exampleSoft: 'Жир' },
  { hard: 'Х', soft: 'Ш', exampleHard: 'Ход', exampleSoft: 'Шок' },
];

// Handschrift-Übungen
export const HANDWRITING_PRACTICE = [
  { letter: 'А', strokes: 3, description: 'Dreieck mit Querstrich' },
  { letter: 'Б', strokes: 4, description: 'Gerade Linie mit Schleife' },
  { letter: 'В', strokes: 2, description: 'Wie lateinisches B' },
  { letter: 'М', strokes: 2, description: 'Wie Berggipfel' },
  { letter: 'И', strokes: 3, description: 'Wie umgekehrtes N' },
  { letter: 'Ш', strokes: 4, description: 'Drei vertikale Striche' },
  { letter: 'Щ', strokes: 5, description: 'Wie Ш mit Haken' },
  { letter: 'Ц', strokes: 4, description: 'Wie U mit Querstrich' },
  { letter: 'Ж', strokes: 4, description: 'Kreuz mit zwei Strichen' },
  { letter: 'Ф', strokes: 3, description: 'Kreis mit Querstrich' },
];
