// 🔧 Конфигурация Google APIs для CRM системы управления ваучерами

/**
 * 📋 Google Sheets конфигурация
 * Основная таблица с данными учеников
 */
const GOOGLE_CONFIG = {
    // 🔑 API ключ (получить в Google Cloud Console)
    API_KEY: 'AIzaSyBD6-DJTUl9-lInaS4CkWBIYKDkAXzWlMQ',
    
    // 👤 Client ID для авторизации (Google OAuth)
    CLIENT_ID: '399222378656-metga7nra7tfu9usugtovvildhhg2l9q.apps.googleusercontent.com',
    
    // 📊 ID основной Google таблицы с учениками
    SPREADSHEET_ID: '1ETu3qsTX_pY6W0xtyRcEHzewi9MgHzm2-4kT0hnn4eI',
    
    // 🌐 Области доступа для Google APIs
    SCOPES: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly'
    ],
    
    // 🏠 Discovery документы для APIs
    DISCOVERY_DOCS: [
        'https://sheets.googleapis.com/$discovery/rest?version=v4',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ]
};

/**
 * 📂 Google Drive папки для разных типов документов
 * Каждый тип документа хранится в отдельной папке
 */
const DRIVE_FOLDERS = {
    // 📷 Фотографии удостоверений личности
    TZ_PHOTOS: '1r6dfES7iutO9J2HjvOQSQ9Xd-BqcIXcmTOQZlzigv1oCHXd7Ool75Bc4T2Jo3wLph7ryT1ou',
    
    // 🎫 Ваучеры на обучение
    VOUCHERS: '1AZmZZL-DLjyjvDmV0tjNriTaIf_AH_6UzXfhfcAlaNApEMuV_j9DLPfO44vRqo0zGZ3-sMVo',
    
    // 💰 Справки об оплате 200 шекелей
    PAYMENT_200: '1paDpElQ2tRI7RlhB3yl2FO8o1gPyVjIDh32PXLrIlzO47tQyzJmrO0hQ-Dh_lgkRixZw36WB',
    
    // 📋 Справки о регистрации
    ISHUR_ARSHAMA: '1cNyRHRjNTEvbj3hnA5gN8WLp3oVkM0sJxOdae-HVaGtlQY5bXd09XmtD_Zf59deCI7uTbh5k',
    
    // 📝 Справки о начале обучения
    ISHUR_TKHILAT: '1iTVVPqA_W1Ew4fsf3v_JSKmXnr1MXJ32w1wdMSspMi_0pkYbO9JxmhwblZSj3db3Dph9aSPS',
    
    // 🧾 Квитанции на 5000 шекелей
    RECEIPT_5000: '1zOPAOXQfAmDzSDjWWisbBhMHPkIGaLO0GrIlpwylRUxCkHUZv4Fghav07QaT9ZqW4jFVAxv9',
    
    // 🧾 Квитанции на 200 шекелей  
    RECEIPT_200: '1tSgDiBBGIUuCBmicMaknuMG3wq-ucH2ybU9JZBIAR2DeuiJNgjr7QAW8MxjCfiCUgLvRzY'
};

/**
 * 📊 Конфигурация листов в Google Sheets
 * Определяет структуру данных в таблице
 */
const SHEET_CONFIG = {
    // 📋 Основной лист с данными учеников
    MAIN_SHEET: {
        name: 'Ученики',
        range: 'A:Z',
        headers: [
            'ID',              // A - Уникальный идентификатор
            'ФИО',             // B - Полное имя
            'Телефон',         // C - Номер телефона
            'Email',           // D - Электронная почта
            'Удостоверение',   // E - Номер удостоверения личности
            'Дата рождения',   // F - Дата рождения
            'Пол',             // G - Пол (М/Ж)
            'Адрес',           // H - Адрес проживания
            'Ульпан',          // I - Название ульпана
            'Группа',          // J - Номер группы
            'Уровень',         // K - Уровень знания языка
            'Дата начала',     // L - Дата начала обучения
            'Статус ваучера',  // M - Статус ваучера
            'Номер ваучера',   // N - Номер ваучера
            'Дата выдачи',     // O - Дата выдачи ваучера
            'Срок действия',   // P - Срок действия ваучера
            'Статус оплаты',   // Q - Статус оплаты
            'Сумма к доплате', // R - Сумма доплаты
            'Документы',       // S - Список загруженных документов
            'Примечания',      // T - Дополнительные примечания
            'Дата создания',   // U - Дата создания записи
            'Последнее изменение', // V - Дата последнего изменения
            'Изменил',         // W - Кто внес изменения
            'Статус проверки', // X - Статус проверки документов
            'Куратор'          // Y - Ответственный куратор
        ]
    },
    
    // 📈 Лист со статистикой
    STATS_SHEET: {
        name: 'Статистика',
        range: 'A:F'
    },
    
    // 🏫 Справочник ульпанов
    ULPANS_SHEET: {
        name: 'Ульпаны',
        range: 'A:E',
        headers: ['ID', 'Название', 'Адрес', 'Контакт', 'Активен']
    },
    
    // 👥 Справочник пользователей
    USERS_SHEET: {
        name: 'Пользователи',
        range: 'A:F',
        headers: ['ID', 'Логин', 'Пароль', 'Роль', 'Ульпан', 'Активен']
    }
};

/**
 * 👤 Роли пользователей и их права доступа
 */
const USER_ROLES = {
    ADMIN: {
        name: 'Администратор',
        permissions: ['read', 'write', 'delete', 'manage_users', 'view_all', 'export']
    },
    TEACHER: {
        name: 'Учитель',
        permissions: ['read', 'write', 'view_own_ulpan']
    },
    SELLER: {
        name: 'Продавец ваучеров',
        permissions: ['read', 'write', 'create_voucher']
    },
    ULPAN: {
        name: 'Ульпан',
        permissions: ['read', 'write', 'view_own_ulpan', 'upload_docs']
    },
    FINANCE: {
        name: 'Финансовый отдел',
        permissions: ['read', 'write', 'view_payments', 'manage_payments']
    },
    CURATOR: {
        name: 'Куратор',
        permissions: ['read', 'write', 'verify_docs', 'view_all']
    }
};

/**
 * 📋 Статусы ваучеров
 */
const VOUCHER_STATUSES = {
    NEW: { name: 'Новый', color: 'info', icon: '📄' },
    ACTIVE: { name: 'Активен', color: 'success', icon: '✅' },
    USED: { name: 'Использован', color: 'warning', icon: '⏳' },
    EXPIRED: { name: 'Просрочен', color: 'danger', icon: '❌' },
    CANCELLED: { name: 'Отменен', color: 'secondary', icon: '🚫' }
};

/**
 * 💰 Статусы оплаты
 */
const PAYMENT_STATUSES = {
    NOT_PAID: { name: 'Не оплачено', color: 'danger', icon: '❌' },
    PARTIAL: { name: 'Частично', color: 'warning', icon: '⏳' },
    PAID: { name: 'Оплачено', color: 'success', icon: '✅' },
    REFUND: { name: 'Возврат', color: 'info', icon: '↩️' }
};

/**
 * 📝 Статусы проверки документов
 */
const VERIFICATION_STATUSES = {
    PENDING: { name: 'На проверке', color: 'warning', icon: '⏳' },
    APPROVED: { name: 'Одобрено', color: 'success', icon: '✅' },
    REJECTED: { name: 'Отклонено', color: 'danger', icon: '❌' },
    INCOMPLETE: { name: 'Неполные', color: 'info', icon: '📝' }
};

/**
 * 📁 Типы документов
 */
const DOCUMENT_TYPES = {
    TZ_PHOTO: {
        name: 'Фото удостоверения',
        folder: 'TZ_PHOTOS',
        required: true,
        formats: ['jpg', 'jpeg', 'png', 'pdf'],
        maxSize: 5 * 1024 * 1024 // 5MB
    },
    VOUCHER: {
        name: 'Ваучер',
        folder: 'VOUCHERS',
        required: true,
        formats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSize: 3 * 1024 * 1024 // 3MB
    },
    PAYMENT_200: {
        name: 'Справка об оплате 200₪',
        folder: 'PAYMENT_200',
        required: false,
        formats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSize: 3 * 1024 * 1024 // 3MB
    },
    ISHUR_ARSHAMA: {
        name: 'Справка о регистрации',
        folder: 'ISHUR_ARSHAMA',
        required: false,
        formats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSize: 3 * 1024 * 1024 // 3MB
    },
    ISHUR_TKHILAT: {
        name: 'Справка о начале обучения',
        folder: 'ISHUR_TKHILAT',
        required: false,
        formats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSize: 3 * 1024 * 1024 // 3MB
    },
    RECEIPT_5000: {
        name: 'Квитанция 5000₪',
        folder: 'RECEIPT_5000',
        required: false,
        formats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSize: 3 * 1024 * 1024 // 3MB
    },
    RECEIPT_200: {
        name: 'Квитанция 200₪',
        folder: 'RECEIPT_200',
        required: false,
        formats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSize: 3 * 1024 * 1024 // 3MB
    }
};

/**
 * 🎓 Уровни знания языка
 */
const LANGUAGE_LEVELS = {
    BEGINNER: 'Начинающий',
    ELEMENTARY: 'Элементарный',
    INTERMEDIATE: 'Средний',
    ADVANCED: 'Продвинутый',
    FLUENT: 'Свободный'
};

/**
 * ⚙️ Настройки приложения
 */
const APP_CONFIG = {
    // 📱 Название приложения
    APP_NAME: 'База учеников ульпана с ваучером',
    
    // 🎨 Версия приложения
    VERSION: '1.0.0',
    
    // 📞 Контактная информация
    SUPPORT_EMAIL: 'support@ulpan-crm.com',
    SUPPORT_PHONE: '+972-50-123-4567',
    
    // 🕒 Настройки времени
    TIMEZONE: 'Asia/Jerusalem',
    DATE_FORMAT: 'DD/MM/YYYY',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    
    // 📊 Пагинация
    ITEMS_PER_PAGE: 50,
    
    // 🔄 Автообновление данных (в минутах)
    AUTO_REFRESH_INTERVAL: 5,
    
    // 💾 Кэширование (в минутах)
    CACHE_DURATION: 10,
    
    // 🚨 Уведомления
    NOTIFICATION_DURATION: 5000, // 5 секунд
    
    // 📂 Максимальный размер файла (в байтах)
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    
    // 🔐 Время сессии (в часах)
    SESSION_DURATION: 8
};

/**
 * 🎯 Валидация данных
 */
const VALIDATION_RULES = {
    // 📞 Телефон (израильский формат)
    PHONE_REGEX: /^(\+972|972|0)[-.\s]?([23489]|5[0248]|77)[-.\s]?\d{7}$/,
    
    // 📧 Email
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    // 🆔 Удостоверение личности (израильское)
    ID_REGEX: /^\d{9}$/,
    
    // 📅 Дата рождения (минимальный возраст 16 лет)
    MIN_AGE: 16,
    MAX_AGE: 100,
    
    // 📝 Длина полей
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    ADDRESS_MAX_LENGTH: 200,
    NOTES_MAX_LENGTH: 1000
};

/**
 * 📋 Сообщения для пользователя
 */
const MESSAGES = {
    // ✅ Успешные операции
    SUCCESS: {
        SAVED: 'Данные успешно сохранены!',
        DELETED: 'Запись удалена!',
        UPLOADED: 'Файл загружен успешно!',
        LOGIN: 'Добро пожаловать!',
        LOGOUT: 'До свидания!'
    },
    
    // ⚠️ Предупреждения
    WARNING: {
        UNSAVED_CHANGES: 'У вас есть несохраненные изменения',
        CONFIRM_DELETE: 'Вы уверены, что хотите удалить эту запись?',
        FILE_TOO_LARGE: 'Файл слишком большой',
        INVALID_FORMAT: 'Неподдерживаемый формат файла'
    },
    
    // ❌ Ошибки
    ERROR: {
        NETWORK: 'Ошибка сети. Проверьте подключение к интернету',
        AUTH: 'Ошибка авторизации',
        PERMISSION: 'У вас нет прав для выполнения этого действия',
        VALIDATION: 'Пожалуйста, проверьте правильность введенных данных',
        FILE_UPLOAD: 'Ошибка загрузки файла',
        SAVE_FAILED: 'Не удалось сохранить данные'
    },
    
    // ℹ️ Информационные сообщения
    INFO: {
        LOADING: 'Загрузка данных...',
        SAVING: 'Сохранение...',
        UPLOADING: 'Загрузка файла...',
        NO_DATA: 'Нет данных для отображения',
        SEARCH_NO_RESULTS: 'По вашему запросу ничего не найдено'
    }
};

/**
 * 🔗 API Endpoints
 */
const API_ENDPOINTS = {
    // 📊 Google Sheets API
    SHEETS_BASE: 'https://sheets.googleapis.com/v4/spreadsheets',
    
    // 📂 Google Drive API  
    DRIVE_BASE: 'https://www.googleapis.com/drive/v3',
    
    // 🔐 Google Auth API
    AUTH_BASE: 'https://accounts.google.com/oauth2/v2/auth'
};

/**
 * 🎨 UI настройки
 */
const UI_CONFIG = {
    // 🎨 Цветовая схема
    COLORS: {
        primary: '#2563eb',
        success: '#16a34a', 
        warning: '#ca8a04',
        danger: '#dc2626',
        info: '#0284c7',
        secondary: '#64748b'
    },
    
    // 📱 Брейкпоинты для адаптивности
    BREAKPOINTS: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1200px'
    },
    
    // ⚡ Анимации
    ANIMATION: {
        duration: 300,
        easing: 'ease-in-out'
    }
};

/**
 * 📊 Экспорт данных
 */
const EXPORT_CONFIG = {
    FORMATS: {
        EXCEL: { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        CSV: { ext: 'csv', mime: 'text/csv' },
        PDF: { ext: 'pdf', mime: 'application/pdf' }
    },
    
    FILENAME_PREFIX: 'ulpan-students',
    
    COLUMNS: [
        'ID', 'ФИО', 'Телефон', 'Email', 'Удостоверение',
        'Ульпан', 'Группа', 'Статус ваучера', 'Статус оплаты'
    ]
};

/**
 * 🚀 Инициализация конфигурации
 */
function initializeConfig() {
    // Проверка наличия обязательных настроек
    if (!GOOGLE_CONFIG.API_KEY || GOOGLE_CONFIG.API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
        console.warn('⚠️ Google API Key не настроен! Некоторые функции могут не работать.');
    }
    
    if (!GOOGLE_CONFIG.CLIENT_ID || GOOGLE_CONFIG.CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
        console.warn('⚠️ Google Client ID не настроен! Авторизация не будет работать.');
    }
    
    if (!GOOGLE_CONFIG.SPREADSHEET_ID) {
        console.error('❌ Spreadsheet ID не настроен! Приложение не будет работать.');
    }
    
    console.log('🚀 Конфигурация загружена успешно');
    return true;
}

/**
 * 🔧 Получение конфигурации по ключу
 */
function getConfig(key) {
    const configs = {
        google: GOOGLE_CONFIG,
        sheets: SHEET_CONFIG,
        folders: DRIVE_FOLDERS,
        roles: USER_ROLES,
        statuses: { voucher: VOUCHER_STATUSES, payment: PAYMENT_STATUSES, verification: VERIFICATION_STATUSES },
        documents: DOCUMENT_TYPES,
        app: APP_CONFIG,
        validation: VALIDATION_RULES,
        messages: MESSAGES,
        api: API_ENDPOINTS,
        ui: UI_CONFIG,
        export: EXPORT_CONFIG
    };
    
    return configs[key] || null;
}

/**
 * 🌐 Экспорт для глобального использования
 */
if (typeof window !== 'undefined') {
    window.CONFIG = {
        GOOGLE_CONFIG,
        SHEET_CONFIG,
        DRIVE_FOLDERS,
        USER_ROLES,
        VOUCHER_STATUSES,
        PAYMENT_STATUSES,
        VERIFICATION_STATUSES,
        DOCUMENT_TYPES,
        APP_CONFIG,
        VALIDATION_RULES,
        MESSAGES,
        API_ENDPOINTS,
        UI_CONFIG,
        EXPORT_CONFIG,
        initializeConfig,
        getConfig
    };
}

// Автоматическая инициализация при загрузке
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeConfig);
}
