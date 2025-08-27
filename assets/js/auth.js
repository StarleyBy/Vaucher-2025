// 🔐 Система авторизации для CRM управления ваучерами

/**
 * 👤 Класс для управления авторизацией
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'ulpan_crm_session';
        this.testUsers = this.initializeTestUsers();
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 часов в миллисекундах
        
        // Инициализация при создании объекта
        this.init();
    }
    
    /**
     * 🚀 Инициализация системы авторизации
     */
    init() {
        // Проверяем сохраненную сессию
        this.checkSavedSession();
        
        // Настраиваем обработчики событий
        this.setupEventListeners();
        
        // Автоматический выход при закрытии вкладки
        this.setupSessionCleanup();
        
        console.log('🔐 Система авторизации инициализирована');
    }
    
    /**
     * 🧪 Инициализация тестовых пользователей
     */
    initializeTestUsers() {
        return {
            admin: {
                id: 1,
                username: 'admin',
                password: 'admin123',
                role: 'ADMIN',
                name: 'Администратор системы',
                email: 'admin@ulpan.com',
                ulpan: null,
                lastLogin: null,
                active: true
            },
            teacher1: {
                id: 2,
                username: 'teacher1',
                password: 'teach123',
                role: 'TEACHER',
                name: 'Учитель 1',
                email: 'teacher1@ulpan.com',
                ulpan: 'Ульпан "Шалом"',
                lastLogin: null,
                active: true
            },
            seller1: {
                id: 3,
                username: 'seller1',
                password: 'sell123',
                role: 'SELLER',
                name: 'Продавец ваучеров',
                email: 'seller@ulpan.com',
                ulpan: null,
                lastLogin: null,
                active: true
            },
            ulpan1: {
                id: 4,
                username: 'ulpan1',
                password: 'ulp123',
                role: 'ULPAN',
                name: 'Ульпан "Шалом"',
                email: 'shalom@ulpan.com',
                ulpan: 'Ульпан "Шалом"',
                lastLogin: null,
                active: true
            },
            fin1: {
                id: 5,
                username: 'fin1',
                password: 'fin123',
                role: 'FINANCE',
                name: 'Финансовый отдел',
                email: 'finance@ulpan.com',
                ulpan: null,
                lastLogin: null,
                active: true
            },
            curator1: {
                id: 6,
                username: 'curator1',
                password: 'cur123',
                role: 'CURATOR',
                name: 'Куратор программы',
                email: 'curator@ulpan.com',
                ulpan: null,
                lastLogin: null,
                active: true
            }
        };
    }
    
    /**
     * 🔑 Авторизация пользователя
     */
    async login(username, password, rememberMe = false) {
        try {
            // Показываем индикатор загрузки
            this.showLoadingState();
            
            // Имитация задержки сети
            await this.delay(1000);
            
            // Проверяем тестовых пользователей
            const user = this.validateTestUser(username, password);
            
            if (user) {
                // Успешная авторизация
                this.currentUser = { ...user };
                this.currentUser.lastLogin = new Date().toISOString();
                this.currentUser.sessionStart = Date.now();
                
                // Сохраняем сессию
                this.saveSession(rememberMe);
                
                // Уведомление об успехе
                this.showNotification('success', window.CONFIG.MESSAGES.SUCCESS.LOGIN);
                
                // Логируем событие
                console.log('✅ Пользователь авторизован:', this.currentUser.name);
                
                // Перенаправляем на главную страницу
                this.redirectToMain();
                
                return { success: true, user: this.currentUser };
            } else {
                // Неудачная авторизация
                throw new Error('Неверные логин или пароль');
            }
            
        } catch (error) {
            console.error('❌ Ошибка авторизации:', error);
            this.showNotification('error', error.message);
            return { success: false, error: error.message };
        } finally {
            this.hideLoadingState();
        }
    }
    
    /**
     * 🔓 Выход из системы
     */
    logout() {
        try {
            const userName = this.currentUser?.name || 'Пользователь';
            
            // Очищаем данные пользователя
            this.currentUser = null;
            
            // Удаляем сохраненную сессию
            this.clearSession();
            
            // Уведомление
            this.showNotification('info', window.CONFIG.MESSAGES.SUCCESS.LOGOUT);
            
            // Логируем событие
            console.log('🔓 Пользователь вышел из системы:', userName);
            
            // Перенаправляем на страницу авторизации
            this.redirectToLogin();
            
        } catch (error) {
            console.error('❌ Ошибка при выходе:', error);
        }
    }
    
    /**
     * ✅ Проверка авторизации пользователя
     */
    isAuthenticated() {
        if (!this.currentUser) return false;
        
        // Проверяем не истекла ли сессия
        const sessionAge = Date.now() - (this.currentUser.sessionStart || 0);
        if (sessionAge > this.sessionTimeout) {
            console.log('⏰ Сессия истекла');
            this.logout();
            return false;
        }
        
        return true;
    }
    
    /**
     * 🎭 Проверка роли пользователя
     */
    hasRole(role) {
        return this.isAuthenticated() && this.currentUser.role === role;
    }
    
    /**
     * 🔒 Проверка прав доступа
     */
    hasPermission(permission) {
        if (!this.isAuthenticated()) return false;
        
        const userRole = window.CONFIG.USER_ROLES[this.currentUser.role];
        return userRole && userRole.permissions.includes(permission);
    }
    
    /**
     * 👤 Получение текущего пользователя
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * 🏫 Проверка доступа к ульпану
     */
    canAccessUlpan(ulpanName) {
        if (!this.isAuthenticated()) return false;
        
        // Администратор и куратор имеют доступ ко всем ульпанам
        if (this.hasRole('ADMIN') || this.hasRole('CURATOR') || this.hasRole('FINANCE')) {
            return true;
        }
        
        // Учитель и ульпан имеют доступ только к своему ульпану
        if (this.hasRole('TEACHER') || this.hasRole('ULPAN')) {
            return this.currentUser.ulpan === ulpanName;
        }
        
        // Продавец имеет доступ ко всем ульпанам
        if (this.hasRole('SELLER')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 🧪 Валидация тестового пользователя
     */
    validateTestUser(username, password) {
        const user = this.testUsers[username];
        
        if (user && user.password === password && user.active) {
            return user;
        }
        
        return null;
    }
    
    /**
     * 💾 Сохранение сессии
     */
    saveSession(rememberMe = false) {
        const sessionData = {
            user: this.currentUser,
            timestamp: Date.now(),
            rememberMe: rememberMe
        };
        
        if (rememberMe) {
            // Сохраняем в localStorage для длительного хранения
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        } else {
            // Сохраняем в sessionStorage только на время сессии браузера
            sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        }
    }
    
    /**
     * 📖 Проверка сохраненной сессии
     */
    checkSavedSession() {
        let sessionData = null;
        
        // Сначала проверяем sessionStorage
        const sessionStorageData = sessionStorage.getItem(this.sessionKey);
        if (sessionStorageData) {
            sessionData = JSON.parse(sessionStorageData);
        } else {
            // Затем проверяем localStorage
            const localStorageData = localStorage.getItem(this.sessionKey);
            if (localStorageData) {
                sessionData = JSON.parse(localStorageData);
            }
        }
        
        if (sessionData && sessionData.user) {
            // Проверяем не истекла ли сессия
            const sessionAge = Date.now() - sessionData.timestamp;
            
            if (sessionAge < this.sessionTimeout) {
                this.currentUser = sessionData.user;
                console.log('🔄 Сессия восстановлена для:', this.currentUser.name);
                
                // Если мы на странице авторизации, перенаправляем на главную
                if (this.isLoginPage()) {
                    this.redirectToMain();
                }
            } else {
                // Сессия истекла
                this.clearSession();
            }
        }
    }
    
    /**
     * 🗑 Очистка сессии
     */
    clearSession() {
        localStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem(this.sessionKey);
    }
    
    /**
     * 🎯 Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработчик формы авторизации
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
        }
        
        // Обработчик кнопки выхода
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-btn')) {
                e.preventDefault();
                this.logout();
            }
        });
        
        // Отслеживание активности пользователя
        this.setupActivityTracking();
    }
    
    /**
     * 📝 Обработчик отправки формы авторизации
     */
    async handleLoginSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe') === 'on';
        
        // Валидация
        if (!username || !password) {
            this.showNotification('warning', 'Пожалуйста, введите логин и пароль');
            return;
        }
        
        // Попытка авторизации
        await this.login(username, password, rememberMe);
    }
    
    /**
     * 📊 Отслеживание активности пользователя
     */
    setupActivityTracking() {
        let lastActivity = Date.now();
        
        // События, указывающие на активность пользователя
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
        activityEvents.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
        
        // Проверка неактивности каждую минуту
        setInterval(() => {
            const inactiveTime = Date.now() - lastActivity;
            const maxInactiveTime = 30 * 60 * 1000; // 30 минут
            
            if (this.isAuthenticated() && inactiveTime > maxInactiveTime) {
                console.log('⏰ Автоматический выход по неактивности');
                this.showNotification('warning', 'Сессия завершена по неактивности');
                this.logout();
            }
        }, 60000); // Проверяем каждую минуту
    }
    
    /**
     * 🧹 Настройка очистки сессии при закрытии
     */
    setupSessionCleanup() {
        window.addEventListener('beforeunload', () => {
            // Очищаем только sessionStorage, localStorage оставляем для "Запомнить меня"
            if (!this.currentUser || !this.isRememberMeSession()) {
                sessionStorage.removeItem(this.sessionKey);
            }
        });
    }
    
    /**
     * 🧠 Проверка сессии "Запомнить меня"
     */
    isRememberMeSession() {
        const localData = localStorage.getItem(this.sessionKey);
        return localData && JSON.parse(localData).rememberMe;
    }
    
    /**
     * 📍 Проверка, находимся ли на странице авторизации
     */
    isLoginPage() {
        return document.querySelector('.auth-container') !== null;
    }
    
    /**
     * 🔄 Перенаправление на главную страницу
     */
    redirectToMain() {
        // Скрываем форму авторизации и показываем главное приложение
        const authContainer = document.querySelector('.auth-container');
        const appContainer = document.querySelector('.app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) {
            appContainer.classList.remove('hidden');
            // Инициализируем главное приложение
            if (window.app && window.app.init) {
                window.app.init();
            }
        }
    }
    
    /**
     * 🔙 Перенаправление на страницу авторизации
     */
    redirectToLogin() {
        // Показываем форму авторизации и скрываем главное приложение
        const authContainer = document.querySelector('.auth-container');
        const appContainer = document.querySelector('.app-container');
        
        if (authContainer) authContainer.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
        
        // Очищаем форму
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.reset();
    }
    
    /**
     * ⏳ Показать состояние загрузки
     */
    showLoadingState() {
        const submitBtn = document.querySelector('.btn-login');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Вход...';
        }
    }
    
    /**
     * 🎯 Скрыть состояние загрузки
     */
    hideLoadingState() {
        const submitBtn = document.querySelector('.btn-login');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Войти';
        }
    }
    
    /**
     * 📢 Показать уведомление
     */
    showNotification(type, message) {
        if (typeof showNotification === 'function') {
            showNotification(type, message);
        } else {
            // Fallback для случая, если функция уведомлений еще не загружена
            console.log(`${type.toUpperCase()}: ${message}`);
            
            // Простое уведомление через alert для критических ошибок
            if (type === 'error') {
                alert(message);
            }
        }
    }
    
    /**
     * ⏱ Задержка для имитации сетевых запросов
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 📊 Получение статистики пользователей (для администратора)
     */
    getUserStats() {
        if (!this.hasRole('ADMIN')) {
            throw new Error('Недостаточно прав доступа');
        }
        
        const stats = {
            total: Object.keys(this.testUsers).length,
            active: Object.values(this.testUsers).filter(u => u.active).length,
            roles: {}
        };
        
        // Подсчет по ролям
        Object.values(this.testUsers).forEach(user => {
            if (user.active) {
                stats.roles[user.role] = (stats.roles[user.role] || 0) + 1;
            }
        });
        
        return stats;
    }
    
    /**
     * 🔧 Управление пользователями (для администратора)
     */
    manageUser(action, userData) {
        if (!this.hasRole('ADMIN')) {
            throw new Error('Недостаточно прав доступа');
        }
        
        switch (action) {
            case 'create':
                return this.createUser(userData);
            case 'update':
                return this.updateUser(userData);
            case 'deactivate':
                return this.deactivateUser(userData.id);
            case 'activate':
                return this.activateUser(userData.id);
            default:
                throw new Error('Неизвестное действие');
        }
    }
    
    /**
     * 👤 Создание нового пользователя
     */
    createUser(userData) {
        const newId = Math.max(...Object.values(this.testUsers).map(u => u.id)) + 1;
        const username = userData.username.toLowerCase();
        
        if (this.testUsers[username]) {
            throw new Error('Пользователь с таким логином уже существует');
        }
        
        const newUser = {
            id: newId,
            username: username,
            password: userData.password,
            role: userData.role,
            name: userData.name,
            email: userData.email,
            ulpan: userData.ulpan || null,
            lastLogin: null,
            active: true,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id
        };
        
        this.testUsers[username] = newUser;
        
        console.log('✅ Пользователь создан:', newUser.name);
        return newUser;
    }
    
    /**
     * 🔄 Обновление пользователя
     */
    updateUser(userData) {
        const user = Object.values(this.testUsers).find(u => u.id === userData.id);
        
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        
        // Обновляем разрешенные поля
        const allowedFields = ['name', 'email', 'role', 'ulpan'];
        allowedFields.forEach(field => {
            if (userData[field] !== undefined) {
                user[field] = userData[field];
            }
        });
        
        user.updatedAt = new Date().toISOString();
        user.updatedBy = this.currentUser.id;
        
        console.log('🔄 Пользователь обновлен:', user.name);
        return user;
    }
    
    /**
     * ❌ Деактивация пользователя
     */
    deactivateUser(userId) {
        const user = Object.values(this.testUsers).find(u => u.id === userId);
        
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        
        user.active = false;
        user.deactivatedAt = new Date().toISOString();
        user.deactivatedBy = this.currentUser.id;
        
        console.log('❌ Пользователь деактивирован:', user.name);
        return user;
    }
    
    /**
     * ✅ Активация пользователя
     */
    activateUser(userId) {
        const user = Object.values(this.testUsers).find(u => u.id === userId);
        
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        
        user.active = true;
        user.activatedAt = new Date().toISOString();
        user.activatedBy = this.currentUser.id;
        
        console.log('✅ Пользователь активирован:', user.name);
        return user;
    }
    
    /**
     * 🔐 Смена пароля
     */
    changePassword(oldPassword, newPassword) {
        if (!this.isAuthenticated()) {
            throw new Error('Пользователь не авторизован');
        }
        
        const currentUserData = this.testUsers[this.currentUser.username];
        
        if (currentUserData.password !== oldPassword) {
            throw new Error('Неверный текущий пароль');
        }
        
        if (newPassword.length < 6) {
            throw new Error('Пароль должен содержать минимум 6 символов');
        }
        
        currentUserData.password = newPassword;
        currentUserData.passwordChangedAt = new Date().toISOString();
        
        console.log('🔐 Пароль изменен для пользователя:', this.currentUser.name);
        this.showNotification('success', 'Пароль успешно изменен');
        
        return true;
    }
    
    /**
     * 📋 Получение списка всех пользователей
     */
    getAllUsers() {
        if (!this.hasRole('ADMIN')) {
            throw new Error('Недостаточно прав доступа');
        }
        
        return Object.values(this.testUsers).map(user => ({
            ...user,
            password: undefined // Скрываем пароль
        }));
    }
    
    /**
     * 🔍 Поиск пользователей
     */
    searchUsers(query, filters = {}) {
        if (!this.hasRole('ADMIN')) {
            throw new Error('Недостаточно прав доступа');
        }
        
        let users = Object.values(this.testUsers);
        
        // Фильтрация по тексту
        if (query) {
            const searchTerm = query.toLowerCase();
            users = users.filter(user => 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm)
            );
        }
        
        // Фильтрация по роли
        if (filters.role) {
            users = users.filter(user => user.role === filters.role);
        }
        
        // Фильтрация по статусу
        if (filters.active !== undefined) {
            users = users.filter(user => user.active === filters.active);
        }
        
        // Фильтрация по ульпану
        if (filters.ulpan) {
            users = users.filter(user => user.ulpan === filters.ulpan);
        }
        
        return users.map(user => ({
            ...user,
            password: undefined // Скрываем пароль
        }));
    }
    
    /**
     * 📊 Аудит авторизации (журнал входов)
     */
    getLoginAudit() {
        if (!this.hasRole('ADMIN')) {
            throw new Error('Недостаточно прав доступа');
        }
        
        // В реальной системе это был бы запрос к базе данных
        // Здесь возвращаем имитацию данных
        return Object.values(this.testUsers)
            .filter(user => user.lastLogin)
            .map(user => ({
                userId: user.id,
                username: user.username,
                name: user.name,
                lastLogin: user.lastLogin,
                role: user.role,
                ulpan: user.ulpan
            }))
            .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin));
    }
    
    /**
     * 🛡 Middleware для проверки прав доступа
     */
    requirePermission(permission) {
        return (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value;
            
            descriptor.value = function(...args) {
                if (!this.hasPermission(permission)) {
                    throw new Error(`Недостаточно прав доступа. Требуется: ${permission}`);
                }
                return originalMethod.apply(this, args);
            };
            
            return descriptor;
        };
    }
    
    /**
     * 🔒 Middleware для проверки роли
     */
    requireRole(role) {
        return (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value;
            
            descriptor.value = function(...args) {
                if (!this.hasRole(role)) {
                    throw new Error(`Недостаточно прав доступа. Требуется роль: ${role}`);
                }
                return originalMethod.apply(this, args);
            };
            
            return descriptor;
        };
    }
}

/**
 * 🚀 Инициализация системы авторизации
 */
function initializeAuth() {
    // Создаем глобальный экземпляр менеджера авторизации
    window.authManager = new AuthManager();
    
    // Проверяем авторизацию при загрузке страницы
    if (window.authManager.isAuthenticated()) {
        console.log('✅ Пользователь уже авторизован:', window.authManager.getCurrentUser().name);
    } else {
        console.log('🔐 Требуется авторизация');
    }
    
    // Устанавливаем защиту для неавторизованных пользователей
    setupAuthGuard();
}

/**
 * 🛡 Настройка защиты доступа
 */
function setupAuthGuard() {
    // Скрываем основное приложение, если пользователь не авторизован
    const appContainer = document.querySelector('.app-container');
    const authContainer = document.querySelector('.auth-container');
    
    if (!window.authManager.isAuthenticated()) {
        if (appContainer) appContainer.classList.add('hidden');
        if (authContainer) authContainer.classList.remove('hidden');
    } else {
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
    }
}

/**
 * 🎭 Декоратор для методов, требующих авторизации
 */
function requireAuth(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            window.authManager.showNotification('error', 'Требуется авторизация');
            window.authManager.redirectToLogin();
            return;
        }
        return originalMethod.apply(this, args);
    };
    
    return descriptor;
}

/**
 * 🔐 Утилиты для работы с авторизацией
 */
const AuthUtils = {
    /**
     * 📱 Генерация безопасного пароля
     */
    generatePassword(length = 12) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return password;
    },
    
    /**
     * 🔍 Валидация пароля
     */
    validatePassword(password) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        const errors = [];
        
        if (password.length < minLength) {
            errors.push(`Минимум ${minLength} символов`);
        }
        
        if (!hasLowerCase) {
            errors.push('Должна быть хотя бы одна строчная буква');
        }
        
        if (!hasNumbers) {
            errors.push('Должна быть хотя бы одна цифра');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            strength: this.getPasswordStrength(password)
        };
    },
    
    /**
     * 💪 Определение силы пароля
     */
    getPasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score < 3) return 'Слабый';
        if (score < 5) return 'Средний';
        return 'Сильный';
    },
    
    /**
     * 🏷 Получение локализованного названия роли
     */
    getRoleName(roleKey) {
        const role = window.CONFIG?.USER_ROLES[roleKey];
        return role ? role.name : roleKey;
    },
    
    /**
     * 🎨 Получение цвета для роли
     */
    getRoleColor(roleKey) {
        const colors = {
            ADMIN: 'danger',
            TEACHER: 'success',
            SELLER: 'warning',
            ULPAN: 'info',
            FINANCE: 'primary',
            CURATOR: 'secondary'
        };
        
        return colors[roleKey] || 'secondary';
    }
};

// 🌐 Экспорт для глобального использования
if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
    window.AuthUtils = AuthUtils;
    window.requireAuth = requireAuth;
    
    // Автоматическая инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAuth);
    } else {
        initializeAuth();
    }
}

console.log('🔐 Модуль авторизации загружен');
