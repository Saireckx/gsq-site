/**
 * =========================================================================
 * КОНФИГУРАЦИЯ СЕРВЕРА "GSQ"
 * =========================================================================
 */

export const MAP_URL = 'https://map.example.com/?world=gsq';

export interface NavLink {
  to: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { to: '/', label: 'Главная' },
  { to: '/rules', label: 'Правила' },
  { to: '/store', label: 'Магазин' },
  { to: '/map', label: 'Карта' },
];

export const SERVER_INFO = {
  name: 'GSQ',
  tagline: 'Ванильное выживание в Minecraft',
  description:
    'Присоединяйся к нашему серверу и окунись в атмосферу настоящего лампового выживания. Уютный сервер, верные друзья и масштабные совместные проекты без лишнего мусора.',
  ip: 'mc.gsq.ru',
  backupIps: [
    { label: 'Основной', ip: 'mc.gsq.ru' },
    { label: 'Запасной 1', ip: 'play.gsq.ru' },
    { label: 'Запасной 2', ip: 'backup.gsq.ru' },
  ],
  version: '26.1.2',
  defaultPort: 25565,
  onlinePlayers: 0,
  maxPlayers: 100,
  links: {
    discord: 'https://discord.gg/GbgNVXDdtf',
    telegram: 'https://t.me/gsq_mc',
    vk: 'https://vk.com/gsq_mc',
    youtube: 'https://youtube.com/@gsq_mc',
  },
};

export interface SubscriptionItem {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  tagline: string;
  features: string[];
  price: number;
  period: string;
}

export const SUBSCRIPTION_ITEMS: SubscriptionItem[] = [
  {
    id: 'sub',
    name: 'SUB',
    popular: false,
    tagline: 'Базовая подписка',
    features: [
      'Доступ к приватам',
      'Доступ к /sethome (до 3 точек дома)',
      'Уникальный белый префикс в чате и табе',
      'Возможность писать цветным текстом',
      'Поддержка любимого сервера',
    ],
    price: 199,
    period: 'навсегда',
  },
  {
    id: 'sub-plus',
    name: 'SUB+',
    badge: 'Популярный',
    popular: true,
    tagline: 'Максимальные возможности',
    features: [
      'Все возможности подписки SUB',
      'Доступ к /fly в приватах и строительных зонах',
      'Эксклюзивный сияющий префикс [SUB+]',
      'Приоритет в очереди при полном сервере',
      'До 10 точек /sethome и доступ к /workbench',
      'Личный значок в Discord сообществе',
    ],
    price: 399,
    period: 'навсегда',
  },
];

export interface ServiceItem {
  id: string;
  name: string;
  iconType: 'unban' | 'unmute' | 'donate';
  description: string;
  priceText: string;
  priceMin: number;
  buttonText: string;
}

export const ADDITIONAL_SERVICES: ServiceItem[] = [
  {
    id: 'unban',
    name: 'Разбан',
    iconType: 'unban',
    description: 'Снятие блокировки с аккаунта (если это возможно).',
    priceText: 'от 299 ₽',
    priceMin: 299,
    buttonText: 'Купить',
  },
  {
    id: 'unmute',
    name: 'Размут',
    iconType: 'unmute',
    description: 'Снятие мута с чата.',
    priceText: 'от 199 ₽',
    priceMin: 199,
    buttonText: 'Купить',
  },
  {
    id: 'donate',
    name: 'Пожертвование',
    iconType: 'donate',
    description: 'Поддержи сервер и получи благодарность!',
    priceText: 'от 50 ₽',
    priceMin: 50,
    buttonText: 'Поддержать',
  },
];

export interface RuleCategory {
  id: string;
  number: number;
  title: string;
  intro: string;
  rules: {
    code: string;
    text: string;
    note?: string;
  }[];
}

export const RULES_DATA: RuleCategory[] = [
  {
    id: 'general',
    number: 1,
    title: 'Общие положения',
    intro:
      'Данные правила являются основными и обязательными для всех игроков, находящихся на сервере GSQ.',
    rules: [
      {
        code: '1.1',
        text: 'Уважайте других игроков, будьте дружелюбны и не создавайте конфликтные ситуации.',
      },
      {
        code: '1.2',
        text: 'Запрещено оскорблять, унижать или провоцировать других игроков в любых каналах связи.',
      },
      {
        code: '1.3',
        text: 'Администрация оставляет за собой право изменять правила без предварительного уведомления.',
      },
      {
        code: '1.4',
        text: 'Незнание правил не освобождает от ответственности за их нарушение.',
      },
    ],
  },
  {
    id: 'modifications',
    number: 2,
    title: 'Запрещённые модификации',
    intro:
      'На сервере запрещено использование любых читов, взломов и сторонних модификаций, дающих преимущество.',
    rules: [
      {
        code: '2.1',
        text: 'Использование X-Ray в любом проявлении (модификации, текстур-паки, кастомные шейдеры) категорически запрещено.',
        note: 'Наказание: перманентная блокировка без возможности амнистии.',
      },
      {
        code: '2.2',
        text: 'Запрещены модификации автоматизации и автокликеры.',
      },
      {
        code: '2.3',
        text: 'Разрешены клиенты и оптимизаторы: Sodium, Iris, Lithium, FerriteCore, Bobby, Voice Chat (Plasmo Voice).',
      },
    ],
  },
  {
    id: 'software',
    number: 3,
    title: 'Читы и программы',
    intro:
      'Использование автоматизации процессов и макросов, нарушающих честный игровой процесс.',
    rules: [
      {
        code: '3.1',
        text: 'Запрещено использование автокликеров, скриптов на авто-рыбалку, авто-атаку мобов и авто-добычу ресурсов.',
      },
      {
        code: '3.2',
        text: 'Запрещено использование нескольких аккаунтов одного игрока для обхода лимитов или банов.',
      },
    ],
  },
  {
    id: 'chat-behavior',
    number: 4,
    title: 'Поведение на сервере',
    intro:
      'Культура общения в общем и локальном чатах, голосовом чате и Discord-сервере проекта.',
    rules: [
      {
        code: '4.1',
        text: 'Запрещён спам, флуд, капс и реклама сторонних проектов.',
      },
      {
        code: '4.2',
        text: 'Запрещены любые проявления токсичности и оскорблений.',
      },
    ],
  },
  {
    id: 'economy',
    number: 5,
    title: 'Экономика на АР',
    intro:
      'Правила торговли между игроками, создание рынков и использование Алмазной Руды (АР).',
    rules: [
      {
        code: '5.1',
        text: 'Официальным эталоном обмена на сервере является Алмазная Руда (АР) и алмазы.',
      },
      {
        code: '5.2',
        text: 'Запрещён обман при сделках и намеренный срыв торговых договоренностей.',
      },
    ],
  },
  {
    id: 'gameplay',
    number: 6,
    title: 'Игровой процесс',
    intro:
      'Правила взаимодействия с миром, строительства и уважения к чужому труду на сервере GSQ.',
    rules: [
      {
        code: '6.1',
        text: 'Запрещён любой гриферство, воровство из сундуков и разрушение чужих построек.',
      },
      {
        code: '6.2',
        text: 'Запрещено создание лаг-машин и чрезмерного скопления сущностей.',
      },
    ],
  },
  {
    id: 'penalties',
    number: 7,
    title: 'Наказания',
    intro:
      'Регламент мер пресечения за нарушение правил проекта GSQ.',
    rules: [
      {
        code: '7.1',
        text: 'Наказания выносятся модераторами в соответствии с тяжестью нарушения.',
      },
    ],
  },
  {
    id: 'additional',
    number: 8,
    title: 'Дополнительно',
    intro:
      'Особые положения и тикет-система регистрации игроков.',
    rules: [
      {
        code: '8.1',
        text: 'Вход на сервер осуществляется только после подачи и одобрения тикета в Discord.',
      },
    ],
  },
];

export const SERVER_FEATURES = [
  {
    title: 'Ванилла 26.1.2',
    description: 'Оригинальный геймплей без лишних плагинов и модов. Чистое честное выживание с друзьями в просторном мире.',
    icon: 'Pickaxe',
  },
  {
    title: 'Голосовой чат',
    description: 'Общайся голосом прямо в игре через Plasmo Voice — слышно только тех, кто находится рядом с тобой.',
    icon: 'Mic',
  },
  {
    title: 'Экономика на АР',
    description: 'Вся торговля построена на Алмазной Руде (АР) между самими игроками. Никаких админ-магазинов с читерскими ресурсами.',
    icon: 'Coins',
  },
  {
    title: 'Вход по заявкам (Тикеты)',
    description: 'Попасть на сервер можно только через тикет в Discord. Мы фильтруем токсичных игроков и бережём уютную атмосферу.',
    icon: 'Ticket',
  },
  {
    title: 'Защита построек',
    description: 'Полное логирование каждого блока CoreProtect: любые случайные поломки или воровство мгновенно откатываются.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Дружное комьюнити',
    description: 'Совместные масштабные постройки, ивенты, помощь новичкам и ламповые посиделки у ночного костра.',
    icon: 'Users',
  },
];
