import type { RussianCase, CaseEnding, AspectPair, MovementVerb } from '../types';

// ============ KASUS (ПАДЕЖИ) ============

export const RUSSIAN_CASES: { id: RussianCase; name: string; question: string; description: string }[] = [
  { 
    id: 'nominativ', 
    name: 'Nominativ', 
    question: 'Wer? Was?',
    description: 'Subjekt, Wer tut etwas?'
  },
  { 
    id: 'genitiv', 
    name: 'Genitiv', 
    question: 'Wessen?',
    description: 'Besitz, Abwesenheit, Mengen'
  },
  { 
    id: 'dativ', 
    name: 'Dativ', 
    question: 'Wem?',
    description: 'Empfänger, Alter, Bedürfnisse'
  },
  { 
    id: 'akkusativ', 
    name: 'Akkusativ', 
    question: 'Wen? Was?',
    description: 'Direktes Objekt'
  },
  { 
    id: 'instrumental', 
    name: 'Instrumental', 
    question: 'Womit? Mit wem?',
    description: 'Werkzeug, Begleitung, Berufe'
  },
  { 
    id: 'präpositiv', 
    name: 'Präpositiv', 
    question: 'Worüber? Über wen?',
    description: 'Ort, Thema (immer mit Präposition)'
  },
];

// Kasus-Endungen für Substantive
export const CASE_ENDINGS: CaseEnding[] = [
  // MASKULIN
  { case: 'nominativ', gender: 'maskulin', singular: '- / -ь / -й', plural: '-ы / -и', example: 'стол → столы', question: 'Wer? Was?' },
  { case: 'genitiv', gender: 'maskulin', singular: '-а / -я', plural: '-ов / -ев / -ей', example: 'стола → столов', question: 'Wessen?' },
  { case: 'dativ', gender: 'maskulin', singular: '-у / -ю', plural: '-ам / -ям', example: 'столу → столам', question: 'Wem?' },
  { case: 'akkusativ', gender: 'maskulin', singular: '-∅ / -а / -я', plural: '-ы / -и', example: 'стол → столы', question: 'Wen? Was?' },
  { case: 'instrumental', gender: 'maskulin', singular: '-ом / -ем / -ьм', plural: '-ами / -ями', example: 'столом → столами', question: 'Womit?' },
  { case: 'präpositiv', gender: 'maskulin', singular: '-е / -и', plural: '-ах / -ях', example: 'столе → столах', question: 'Worüber?' },
  
  // FEMININ
  { case: 'nominativ', gender: 'feminin', singular: '-а / -я / -ь', plural: '-ы / -и', example: 'книга → книги', question: 'Wer? Was?' },
  { case: 'genitiv', gender: 'feminin', singular: '-ы / -и', plural: '-∅ / -ь / -ей', example: 'книги → книг', question: 'Wessen?' },
  { case: 'dativ', gender: 'feminin', singular: '-е / -и', plural: '-ам / -ям', example: 'книге → книгам', question: 'Wem?' },
  { case: 'akkusativ', gender: 'feminin', singular: '-у / -ю / -ь', plural: '-ы / -и', example: 'книгу → книги', question: 'Wen? Was?' },
  { case: 'instrumental', gender: 'feminin', singular: '-ой / -ей / -ью', plural: '-ами / -ями', example: 'книгой → книгами', question: 'Womit?' },
  { case: 'präpositiv', gender: 'feminin', singular: '-е / -и', plural: '-ах / -ях', example: 'книге → книгах', question: 'Worüber?' },
  
  // NEUTRAL
  { case: 'nominativ', gender: 'neutral', singular: '-о / -е / -мя', plural: '-а / -я', example: 'окно → окна', question: 'Wer? Was?' },
  { case: 'genitiv', gender: 'neutral', singular: '-а / -я / -мени', plural: '-∅ / -ь / -ей', example: 'окна → окон', question: 'Wessen?' },
  { case: 'dativ', gender: 'neutral', singular: '-у / -ю / -мени', plural: '-ам / -ям', example: 'окну → окнам', question: 'Wem?' },
  { case: 'akkusativ', gender: 'neutral', singular: '-о / -е / -мя', plural: '-а / -я', example: 'окно → окна', question: 'Wen? Was?' },
  { case: 'instrumental', gender: 'neutral', singular: '-ом / -ем / -менем', plural: '-ами / -ями', example: 'окном → окнами', question: 'Womit?' },
  { case: 'präpositiv', gender: 'neutral', singular: '-е / -и / -мени', plural: '-ах / -ях', example: 'окне → окнах', question: 'Worüber?' },
];

// Kasus-Übungen
export const CASE_EXERCISES = [
  {
    id: 'case-nom-1',
    case: 'nominativ',
    title: 'Nominativ - Subjekt',
    description: 'Der Nominativ bezeichnet das Subjekt des Satzes.',
    examples: [
      { russian: 'Книга на столе', german: 'Das Buch ist auf dem Tisch', word: 'Книга', caseForm: 'Nominativ (Subjekt)' },
      { russian: 'Студент читает', german: 'Der Student liest', word: 'Студент', caseForm: 'Nominativ (Subjekt)' },
      { russian: 'Москва — столица', german: 'Moskau ist die Hauptstadt', word: 'Москва', caseForm: 'Nominativ (Subjekt)' },
    ],
    question: 'Wer oder was führt die Handlung aus?',
  },
  {
    id: 'case-gen-1',
    case: 'genitiv',
    title: 'Genitiv - Besitz & Abwesenheit',
    description: 'Der Genitiv drückt Besitz, Abwesenheit oder Mengen aus.',
    examples: [
      { russian: 'У меня нет книги', german: 'Ich habe kein Buch', word: 'книги', caseForm: 'Genitiv (Abwesenheit)' },
      { russian: 'Книга студента', german: 'Das Buch des Studenten', word: 'студента', caseForm: 'Genitiv (Besitz)' },
      { russian: 'Много воды', german: 'Viel Wasser', word: 'воды', caseForm: 'Genitiv (Menge)' },
    ],
    question: 'Wessen? Von wem? Von was?',
  },
  {
    id: 'case-dat-1',
    case: 'dativ',
    title: 'Dativ - Empfänger',
    description: 'Der Dativ bezeichnet den Empfänger oder Nutznießer.',
    examples: [
      { russian: 'Я даю книге другу', german: 'Ich gebe dem Freund das Buch', word: 'другу', caseForm: 'Dativ (Empfänger)' },
      { russian: 'Мне 20 лет', german: 'Ich bin 20 Jahre alt', word: 'Мне', caseForm: 'Dativ (Alter)' },
      { russian: 'Нужна помощь мне', german: 'Ich brauche Hilfe', word: 'мне', caseForm: 'Dativ (Bedürfnis)' },
    ],
    question: 'Wem?',
  },
  {
    id: 'case-acc-1',
    case: 'akkusativ',
    title: 'Akkusativ - direktes Objekt',
    description: 'Der Akkusativ bezeichnet das direkte Objekt.',
    examples: [
      { russian: 'Я читаю книгу', german: 'Ich lese das Buch', word: 'книгу', caseForm: 'Akkusativ (Objekt)' },
      { russian: 'Он видит дом', german: 'Er sieht das Haus', word: 'дом', caseForm: 'Akkusativ (Objekt)' },
      { russian: 'Я люблю музыку', german: 'Ich liebe Musik', word: 'музыку', caseForm: 'Akkusativ (Objekt)' },
    ],
    question: 'Wen? Was?',
  },
  {
    id: 'case-ins-1',
    case: 'instrumental',
    title: 'Instrumental - Werkzeug',
    description: 'Der Instrumental bezeichnet Werkzeuge oder Begleitung.',
    examples: [
      { russian: 'Писать ручкой', german: 'Mit dem Stift schreiben', word: 'ручкой', caseForm: 'Instrumental (Werkzeug)' },
      { russian: 'С другом', german: 'Mit dem Freund', word: 'другом', caseForm: 'Instrumental (Begleitung)' },
      { russian: 'Я работаю учителем', german: 'Ich arbeite als Lehrer', word: 'учителем', caseForm: 'Instrumental (Beruf)' },
    ],
    question: 'Womit? Mit wem?',
  },
  {
    id: 'case-prep-1',
    case: 'präpositiv',
    title: 'Präpositiv - Ort & Thema',
    description: 'Der Präpositiv wird immer mit einer Präposition verwendet.',
    examples: [
      { russian: 'В школе', german: 'In der Schule', word: 'школе', caseForm: 'Präpositiv (Ort)' },
      { russian: 'О книге', german: 'Über das Buch', word: 'книге', caseForm: 'Präpositiv (Thema)' },
      { russian: 'На столе', german: 'Auf dem Tisch', word: 'столе', caseForm: 'Präpositiv (Ort)' },
    ],
    question: 'Worüber? Über wen?',
  },
];

// Präpositionen mit Kasus
export const PREPOSITIONS = [
  // Nominativ (keine)
  
  // Genitiv
  { preposition: 'без', meaning: 'ohne', case: 'genitiv', example: 'без воды (ohne Wasser)' },
  { preposition: 'до', meaning: 'bis', case: 'genitiv', example: 'до школы (bis zur Schule)' },
  { preposition: 'из', meaning: 'aus', case: 'genitiv', example: 'из дома (aus dem Haus)' },
  { preposition: 'у', meaning: 'bei', case: 'genitiv', example: 'у друга (beim Freund)' },
  { preposition: 'от', meaning: 'von', case: 'genitiv', example: 'от мамы (von Mama)' },
  { preposition: 'для', meaning: 'für', case: 'genitiv', example: 'для тебя (für dich)' },
  
  // Dativ
  { preposition: 'к', meaning: 'zu', case: 'dativ', example: 'к врачу (zum Arzt)' },
  { preposition: 'по', meaning: 'nach / längs', case: 'dativ', example: 'по улице (die Straße entlang)' },
  
  // Akkusativ
  { preposition: 'в', meaning: 'in', case: 'akkusativ', example: 'в школу (in die Schule)' },
  { preposition: 'на', meaning: 'auf', case: 'akkusativ', example: 'на стол (auf den Tisch)' },
  { preposition: 'за', meaning: 'hinter', case: 'akkusativ', example: 'за дом (hinter das Haus)' },
  { preposition: 'про', meaning: 'über', case: 'akkusativ', example: 'про книгу (über das Buch)' },
  { preposition: 'через', meaning: 'durch', case: 'akkusativ', example: 'через парк (durch den Park)' },
  
  // Instrumental
  { preposition: 'с', meaning: 'mit', case: 'instrumental', example: 'с другом (mit dem Freund)' },
  { preposition: 'за', meaning: 'hinter', case: 'instrumental', example: 'за домом (hinter dem Haus)' },
  { preposition: 'под', meaning: 'unter', case: 'instrumental', example: 'под столом (unter dem Tisch)' },
  { preposition: 'перед', meaning: 'vor', case: 'instrumental', example: 'перо домом (vor dem Haus)' },
  { preposition: 'между', meaning: 'zwischen', case: 'instrumental', example: 'между домами (zwischen den Häusern)' },
  
  // Präpositiv
  { preposition: 'в', meaning: 'in', case: 'präpositiv', example: 'в школе (in der Schule)' },
  { preposition: 'на', meaning: 'auf', case: 'präpositiv', example: 'на столе (auf dem Tisch)' },
  { preposition: 'о', meaning: 'über', case: 'präpositiv', example: 'о книге (über das Buch)' },
  { preposition: 'при', meaning: 'bei', case: 'präpositiv', example: 'при школе (bei der Schule)' },
];

// ============ VERB-ASPEKTE ============

export const ASPECT_PAIRS: AspectPair[] = [
  { imperfective: 'делать', perfective: 'сделать', german: 'machen / tun' },
  { imperfective: 'писать', perfective: 'написать', german: 'schreiben' },
  { imperfective: 'читать', perfective: 'прочитать', german: 'lesen' },
  { imperfective: 'смотреть', perfective: 'посмотреть', german: 'schauen / ansehen' },
  { imperfective: 'говорить', perfective: 'сказать', german: 'sprechen / sagen' },
  { imperfective: 'отвечать', perfective: 'ответить', german: 'antworten' },
  { imperfective: 'спрашивать', perfective: 'спросить', german: 'fragen' },
  { imperfective: 'понимать', perfective: 'понять', german: 'verstehen' },
  { imperfective: 'брать', perfective: 'взять', german: 'nehmen' },
  { imperfective: 'давать', perfective: 'дать', german: 'geben' },
  { imperfective: 'купать', perfective: 'купить', german: 'kaufen' },
  { imperfective: 'продавать', perfective: 'продать', german: 'verkaufen' },
  { imperfective: 'открывать', perfective: 'открыть', german: 'öffnen' },
  { imperfective: 'закрывать', perfective: 'закрыть', german: 'schließen' },
  { imperfective: 'начинать', perfective: 'начать', german: 'anfangen / beginnen' },
  { imperfective: 'кончать', perfective: 'кончить', german: 'beenden' },
];

export const ASPECT_EXPLANATION = {
  imperfective: {
    name: 'Imperfektiv',
    symbol: 'нес.в.',
    usage: [
      'Laufende Handlung (я читаю - ich lese gerade)',
      'Regelmäßige Handlung (я читаю каждый день - ich lese jeden Tag)',
      'Handlung ohne Zeitangabe (я люблю читать - ich lese gerne)',
      'Dauer der Handlung (я читал 2 часа - ich las 2 Stunden)',
    ],
  },
  perfective: {
    name: 'Perfektiv',
    symbol: 'с.в.',
    usage: [
      'Abgeschlossene Handlung (я прочитал - ich habe fertig gelesen)',
      'Einmalige Handlung (я прочитал эту книгу - ich habe dieses Buch gelesen)',
      'Ergebnis der Handlung (я написал письмо - ich habe den Brief geschrieben)',
      'Folge von Handlungen (почитал и уснул - las und schlief ein)',
    ],
  },
};

// ============ BEWEGUNGSVERBEN ============

export const MOVEMENT_VERBS: MovementVerb[] = [
  {
    unidirectional: 'идти',
    multidirectional: 'ходить',
    german: 'gehen (zu Fuß)',
    usage: {
      unidirectional: [
        'Einmalige Richtung (Сейчас я иду в школу - Jetzt gehe ich zur Schule)',
        'Konkreter Zeitpunkt (Вчера шёл дождь - Gestern regnete es)',
      ],
      multidirectional: [
        'Gewohnheit (Я хожу в школу каждый день - Ich gehe jeden Tag zur Schule)',
        'Hin- und Hergehen (Я ходил по магазинам - Ich bin einkaufen gegangen)',
        'Fähigkeit (Ребёнок уже ходит - Das Kind läuft schon)',
      ],
    },
  },
  {
    unidirectional: 'ехать',
    multidirectional: 'ездить',
    german: 'fahren (mit Verkehrsmittel)',
    usage: {
      unidirectional: [
        'Einmalige Fahrt (Сейчас я еду в Москву - Jetzt fahre ich nach Moskau)',
        'Konkrete Fahrt (Мы ехали на машине - Wir fuhren mit dem Auto)',
      ],
      multidirectional: [
        'Regelmäßige Fahrten (Я езжу в Москву каждую неделю - Ich fahre jede Woche nach Moskau)',
        'Hin- und Herfahren (Я ездил туда три раза - Ich bin drei Mal dort hingefahren)',
      ],
    },
  },
  {
    unidirectional: 'лететь',
    multidirectional: 'летать',
    german: 'fliegen',
    usage: {
      unidirectional: [
        'Einmaliger Flug (Самолёт летит в Берлин - Das Flugzeug fliegt nach Berlin)',
        'Aktueller Flug (Мы летим облаками - Wir fliegen durch die Wolken)',
      ],
      multidirectional: [
        'Regelmäßiges Fliegen (Птицы летают на юг - Vögel fliegen nach Süden)',
        'Flugfähigkeit (Дети любят летать на самолётах - Kinder fliegen gerne)',
      ],
    },
  },
  {
    unidirectional: 'бежать',
    multidirectional: 'бегать',
    german: 'laufen / rennen',
    usage: {
      unidirectional: [
        'Einmaliges Rennen (Он бежит к двери - Er rennt zur Tür)',
        'Konkretes Rennen (Собака побежала за мячом - Der Hund rannte dem Ball nach)',
      ],
      multidirectional: [
        'Sport / Training (Я бегаю каждое утро - Ich laufe jeden Morgen)',
        'Spielendes Rennen (Дети бегают во дворе - Die Kinder rennen im Hof herum)',
      ],
    },
  },
  {
    unidirectional: 'нести',
    multidirectional: 'носить',
    german: 'tragen (in der Hand)',
    usage: {
      unidirectional: [
        'Einmaliges Tragen (Я несу сумку - Ich trage die Tasche)',
        'Konkrete Richtung (Он нёс воду из колодца - Er trug Wasser aus dem Brunnen)',
      ],
      multidirectional: [
        'Regelmäßig tragen (Я ношу очки - Ich trage eine Brille)',
        'Hin- und Hertragen (Он носил вёдра воды - Er trug Eimer mit Wasser)',
      ],
    },
  },
  {
    unidirectional: 'вести',
    multidirectional: 'водить',
    german: 'führen / begleiten',
    usage: {
      unidirectional: [
        'Einmalig führen (Я веду ребёнка в школу - Ich führe das Kind zur Schule)',
        'Konkrete Führung (Она вела группу туристов - Sie führte die Touristengruppe)',
      ],
      multidirectional: [
        'Regelmäßig führen (Я вожу детей в кино - Ich führe die Kinder ins Kino)',
        'Können/Fähigkeit (Она хорошо водит машину - Sie fährt gut Auto)',
      ],
    },
  },
];

// Übungen für Aspekte
export const ASPECT_EXERCISES = [
  {
    context: 'Ich lese gerade ein Buch.',
    correct: 'imperfective',
    word: 'читать',
    explanation: 'Aktuelle, laufende Handlung → Imperfektiv',
  },
  {
    context: 'Ich habe das Buch fertig gelesen.',
    correct: 'perfective',
    word: 'прочитать',
    explanation: 'Abgeschlossene Handlung → Perfektiv',
  },
  {
    context: 'Ich lese jeden Tag Zeitung.',
    correct: 'imperfective',
    word: 'читать',
    explanation: 'Regelmäßige Gewohnheit → Imperfektiv',
  },
  {
    context: 'Gestern habe ich den Brief geschrieben.',
    correct: 'perfective',
    word: 'написать',
    explanation: 'Abgeschlossene Handlung in der Vergangenheit → Perfektiv',
  },
  {
    context: 'Ich schreibe gerade einen Brief.',
    correct: 'imperfective',
    word: 'писать',
    explanation: 'Aktuelle Handlung → Imperfektiv',
  },
  {
    context: 'Wir sehen uns den Film heute Abend an.',
    correct: 'perfective',
    word: 'посмотреть',
    explanation: 'Geplante, abzuschließende Handlung → Perfektiv',
  },
];
