// 🔗 Интеграция с Google APIs для CRM управления ваучерами

/**
 * 🌐 Класс для работы с Google APIs
 */
class GoogleAPIManager {
    constructor() {
        this.isInitialized = false;
        this.isSignedIn = false;
        this.gapi = null;
        this.auth2 = null;
        this.sheetsAPI = null;
        this.driveAPI = null;
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 минут
        
        console.log('🔗 Google API Manager создан');
    }
    
    /**
     * 🚀 Инициализация Google APIs
     */
    async initialize() {
        try {
            console.log('🔄 Инициализация Google APIs...');
            
            // Загружаем Google API скрипт если еще не загружен
            if (!window.gapi) {
                await this.loadGoogleAPI();
            }
            
            this.gapi = window.gapi;
            
            // Загружаем необходимые библиотеки
            await this.loadGoogleLibraries();
            
            // Инициализируем клиент
            await this.initializeGoogleClient();
            
            // Получаем экземпляр auth2
            this.auth2 = this.gapi.auth2.getAuthInstance();
            
            // Проверяем статус авторизации
            this.isSignedIn = this.auth2.isSignedIn.get();
            
            this.isInitialized = true;
            console.log('✅ Google APIs инициализированы успешно');
            
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка инициализации Google APIs:', error);
            throw new Error(`Не удалось инициализировать Google APIs: ${error.message}`);
        }
    }
    
    /**
     * 📚 Загрузка Google API скрипта
     */
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Не удалось загрузить Google API скрипт'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * 📖 Загрузка Google библиотек
     */
    loadGoogleLibraries() {
        return new Promise((resolve, reject) => {
            this.gapi.load('client:auth2', {
                callback: resolve,
                onerror: () => reject(new Error('Не удалось загрузить Google библиотеки'))
            });
        });
    }
    
    /**
     * 🔧 Инициализация Google клиента
     */
    async initializeGoogleClient() {
        const config = window.CONFIG?.GOOGLE_CONFIG;
        
        if (!config) {
            throw new Error('Конфигурация Google API не найдена');
        }
        
        if (!config.API_KEY || config.API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
            throw new Error('Google API Key не настроен');
        }
        
        if (!config.CLIENT_ID || config.CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
            throw new Error('Google Client ID не настроен');
        }
        
        await this.gapi.client.init({
            apiKey: config.API_KEY,
            clientId: config.CLIENT_ID,
            discoveryDocs: config.DISCOVERY_DOCS,
            scope: config.SCOPES.join(' ')
        });
    }
    
    /**
     * 🔐 Авторизация в Google
     */
    async signIn() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            if (this.isSignedIn) {
                console.log('👤 Пользователь уже авторизован в Google');
                return true;
            }
            
            console.log('🔐 Авторизация в Google...');
            
            const authResult = await this.auth2.signIn();
            this.isSignedIn = true;
            
            const profile = authResult.getBasicProfile();
            console.log('✅ Успешная авторизация в Google:', profile.getName());
            
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка авторизации в Google:', error);
            throw new Error(`Не удалось авторизоваться в Google: ${error.error || error.message}`);
        }
    }
    
    /**
     * 🔓 Выход из Google аккаунта
     */
    async signOut() {
        try {
            if (this.auth2 && this.isSignedIn) {
                await this.auth2.signOut();
                this.isSignedIn = false;
                console.log('🔓 Выход из Google аккаунта выполнен');
            }
        } catch (error) {
            console.error('❌ Ошибка при выходе из Google:', error);
        }
    }
    
    /**
     * 📊 Получение данных из Google Sheets
     */
    async getSheetData(sheetName, range = null) {
        try {
            await this.ensureAuthorized();
            
            const config = window.CONFIG?.GOOGLE_CONFIG;
            const sheetConfig = window.CONFIG?.SHEET_CONFIG;
            
            if (!config?.SPREADSHEET_ID) {
                throw new Error('ID таблицы не настроен');
            }
            
            // Определяем диапазон
            const sheetRange = range || sheetConfig?.[sheetName]?.range || 'A:Z';
            const fullRange = `${sheetName}!${sheetRange}`;
            
            // Проверяем кэш
            const cacheKey = `sheet_${sheetName}_${sheetRange}`;
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                console.log('📦 Данные загружены из кэша:', sheetName);
                return cachedData;
            }
            
            console.log('📥 Загрузка данных из Google Sheets:', fullRange);
            
            const response = await this.gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: config.SPREADSHEET_ID,
                range: fullRange,
                valueRenderOption: 'UNFORMATTED_VALUE',
                dateTimeRenderOption: 'FORMATTED_STRING'
            });
            
            const data = {
                range: response.result.range,
                values: response.result.values || [],
                timestamp: Date.now()
            };
            
            // Сохраняем в кэш
            this.saveToCache(cacheKey, data);
            
            console.log('✅ Данные успешно загружены:', data.values.length, 'строк');
            return data;
            
        } catch (error) {
            console.error('❌ Ошибка при загрузке данных из Google Sheets:', error);
            throw new Error(`Не удалось загрузить данные: ${error.message}`);
        }
    }
    
    /**
     * 💾 Сохранение данных в Google Sheets
     */
    async saveSheetData(sheetName, range, values, valueInputOption = 'USER_ENTERED') {
        try {
            await this.ensureAuthorized();
            
            const config = window.CONFIG?.GOOGLE_CONFIG;
            
            if (!config?.SPREADSHEET_ID) {
                throw new Error('ID таблицы не настроен');
            }
            
            const fullRange = `${sheetName}!${range}`;
            
            console.log('💾 Сохранение данных в Google Sheets:', fullRange);
            
            const response = await this.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: config.SPREADSHEET_ID,
                range: fullRange,
                valueInputOption: valueInputOption,
                resource: {
                    values: values
                }
            });
            
            // Очищаем кэш для этого листа
            this.clearSheetCache(sheetName);
            
            console.log('✅ Данные успешно сохранены, обновлено ячеек:', response.result.updatedCells);
            return response.result;
            
        } catch (error) {
            console.error('❌ Ошибка при сохранении данных в Google Sheets:', error);
            throw new Error(`Не удалось сохранить данные: ${error.message}`);
        }
    }
    
    /**
     * ➕ Добавление новой строки в Google Sheets
     */
    async appendSheetData(sheetName, values, valueInputOption = 'USER_ENTERED') {
        try {
            await this.ensureAuthorized();
            
            const config = window.CONFIG?.GOOGLE_CONFIG;
            
            if (!config?.SPREADSHEET_ID) {
                throw new Error('ID таблицы не настроен');
            }
            
            console.log('➕ Добавление новой строки в Google Sheets:', sheetName);
            
            const response = await this.gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: config.SPREADSHEET_ID,
                range: `${sheetName}!A:A`,
                valueInputOption: valueInputOption,
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [values]
                }
            });
            
            // Очищаем кэш для этого листа
            this.clearSheetCache(sheetName);
            
            console.log('✅ Новая строка добавлена, обновлено ячеек:', response.result.updatedCells);
            return response.result;
            
        } catch (error) {
            console.error('❌ Ошибка при добавлении строки в Google Sheets:', error);
            throw new Error(`Не удалось добавить строку: ${error.message}`);
        }
    }
    
    /**
     * 🗑 Удаление строки из Google Sheets
     */
    async deleteSheetRow(sheetName, rowIndex) {
        try {
            await this.ensureAuthorized();
            
            const config = window.CONFIG?.GOOGLE_CONFIG;
            
            if (!config?.SPREADSHEET_ID) {
                throw new Error('ID таблицы не настроен');
            }
            
            console.log('🗑 Удаление строки из Google Sheets:', sheetName, 'строка', rowIndex);
            
            // Получаем ID листа
            const sheetId = await this.getSheetId(sheetName);
            
            const response = await this.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: config.SPREADSHEET_ID,
                resource: {
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'ROWS',
                                startIndex: rowIndex - 1, // 0-based index
                                endIndex: rowIndex
                            }
                        }
                    }]
                }
            });
            
            // Очищаем кэш для этого листа
            this.clearSheetCache(sheetName);
            
            console.log('✅ Строка успешно удалена');
            return response.result;
            
        } catch (error) {
            console.error('❌ Ошибка при удалении строки из Google Sheets:', error);
            throw new Error(`Не удалось удалить строку: ${error.message}`);
        }
    }
    
    /**
     * 📂 Загрузка файла в Google Drive
     */
    async uploadFileToDrive(file, fileName, folderId, description = '') {
        try {
            await this.ensureAuthorized();
            
            console.log('📤 Загрузка файла в Google Drive:', fileName);
            
            // Метаданные файла
            const metadata = {
                name: fileName,
                parents: folderId ? [folderId] : undefined,
                description: description
            };
            
            // Создаем FormData для загрузки
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], {
                type: 'application/json'
            }));
            form.append('file', file);
            
            // Загружаем файл
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
                },
                body: form
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            console.log('✅ Файл успешно загружен в Google Drive:', result.id);
            return result;
            
        } catch (error) {
            console.error('❌ Ошибка при загрузке файла в Google Drive:', error);
            throw new Error(`Не удалось загрузить файл: ${error.message}`);
        }
    }
    
    /**
     * 📋 Получение списка файлов из папки Google Drive
     */
    async getFilesFromDriveFolder(folderId, pageSize = 100) {
        try {
            await this.ensureAuthorized();
            
            console.log('📋 Получение файлов из папки Google Drive:', folderId);
            
            const response = await this.gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                pageSize: pageSize,
                fields: 'files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink,thumbnailLink)'
            });
            
            const files = response.result.files || [];
            console.log('✅ Получено файлов:', files.length);
            
            return files;
            
        } catch (error) {
            console.error('❌ Ошибка при получении файлов из Google Drive:', error);
            throw new Error(`Не удалось получить список файлов: ${error.message}`);
        }
    }
    
    /**
     * 🗑 Удаление файла из Google Drive
     */
    async deleteFileFromDrive(fileId) {
        try {
            await this.ensureAuthorized();
            
            console.log('🗑 Удаление файла из Google Drive:', fileId);
            
            await this.gapi.client.drive.files.delete({
                fileId: fileId
            });
            
            console.log('✅ Файл успешно удален из Google Drive');
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка при удалении файла из Google Drive:', error);
            throw new Error(`Не удалось удалить файл: ${error.message}`);
        }
    }
    
    /**
     * 🔍 Получение ID листа по имени
     */
    async getSheetId(sheetName) {
        try {
            const config = window.CONFIG?.GOOGLE_CONFIG;
            
            if (!config?.SPREADSHEET_ID) {
                throw new Error('ID таблицы не настроен');
            }
            
            const response = await this.gapi.client.sheets.spreadsheets.get({
                spreadsheetId: config.SPREADSHEET_ID
            });
            
            const sheet = response.result.sheets.find(s => s.properties.title === sheetName);
            
            if (!sheet) {
                throw new Error(`Лист "${sheetName}" не найден`);
            }
            
            return sheet.properties.sheetId;
            
        } catch (error) {
            console.error('❌ Ошибка при получении ID листа:', error);
            throw error;
        }
    }
    
    /**
     * 🏗 Создание нового листа
     */
    async createSheet(sheetName, headers = []) {
        try {
            await this.ensureAuthorized();
            
            const config = window.CONFIG?.GOOGLE_CONFIG;
            
            if (!config?.SPREADSHEET_ID) {
                throw new Error('ID таблицы не настроен');
            }
            
            console.log('🏗 Создание нового листа:', sheetName);
            
            // Создаем лист
            const response = await this.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: config.SPREADSHEET_ID,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: sheetName
                            }
                        }
                    }]
                }
            });
            
            // Если есть заголовки, добавляем их
            if (headers.length > 0) {
                await this.saveSheetData(sheetName, 'A1', [headers]);
                
                // Форматируем заголовки (жирный шрифт)
                const sheetId = response.result.replies[0].addSheet.properties.sheetId;
                await this.formatSheetHeaders(sheetId, headers.length);
            }
            
            console.log('✅ Лист успешно создан:', sheetName);
            return response.result;
            
        } catch (error) {
            console.error('❌ Ошибка при создании листа:', error);
            throw new Error(`Не удалось создать лист: ${error.message}`);
        }
    }
    
    /**
     * 🎨 Форматирование заголовков листа
     */
    async formatSheetHeaders(sheetId, headerCount) {
        try {
            const config = window.CONFIG?.GOOGLE_CONFIG;
            
            const response = await this.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: config.SPREADSHEET_ID,
                resource: {
                    requests: [{
                        repeatCell: {
                            range: {
                                sheetId: sheetId,
                                startRowIndex: 0,
                                endRowIndex: 1,
                                startColumnIndex: 0,
                                endColumnIndex: headerCount
                            },
                            cell: {
                                userEnteredFormat: {
                                    textFormat: {
                                        bold: true
                                    },
                                    backgroundColor: {
                                        red: 0.9,
                                        green: 0.9,
                                        blue: 0.9
                                    }
                                }
                            },
                            fields: 'userEnteredFormat(textFormat,backgroundColor)'
                        }
                    }]
                }
            });
            
            return response.result;
            
        } catch (error) {
            console.error('❌ Ошибка при форматировании заголовков:', error);
        }
    }
    
    /**
     * 🔐 Проверка и обеспечение авторизации
     */
    async ensureAuthorized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        if (!this.isSignedIn) {
            await this.signIn();
        }
        
        // Проверяем, не истек ли токен
        const authInstance = this.gapi.auth2.getAuthInstance();
        const user = authInstance.currentUser.get();
        const authResponse = user.getAuthResponse();
        
        // Если токен истекает в течение 5 минут, обновляем его
        if (authResponse.expires_at - Date.now() < 5 * 60 * 1000) {
            console.log('🔄 Обновление токена доступа...');
            await user.reloadAuthResponse();
        }
    }
    
    /**
     * 💾 Работа с кэшем
     */
    saveToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // Проверяем не истек ли кэш
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    clearCache() {
        this.cache.clear();
        console.log('🗑 Кэш очищен');
    }
    
    clearSheetCache(sheetName) {
        const keysToDelete = [];
        for (const [key] of this.cache) {
            if (key.includes(`sheet_${sheetName}`)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => this.cache.delete(key));
        console.log(`🗑 Кэш листа "${sheetName}" очищен`);
    }
    
    /**
     * 📊 Получение статистики по API использованию
     */
    getAPIStats() {
        return {
            cacheSize: this.cache.size,
            cacheHits: this.cacheHits || 0,
            apiCalls: this.apiCalls || 0,
            lastCall: this.lastCallTime || null,
            isInitialized: this.isInitialized,
            isSignedIn: this.isSignedIn
        };
    }
}

/**
 * 🎯 Специализированный класс для работы с учениками
 */
class StudentsDataManager {
    constructor(googleAPI) {
        this.googleAPI = googleAPI;
        this.sheetName = 'Ученики';
        this.headers = window.CONFIG?.SHEET_CONFIG?.MAIN_SHEET?.headers || [];
    }
    
    /**
     * 👥 Получение всех учеников
     */
    async getAllStudents() {
        try {
            const data = await this.googleAPI.getSheetData(this.sheetName);
            
            if (!data.values || data.values.length === 0) {
                return [];
            }
            
            // Первая строка - заголовки
            const headers = data.values[0];
            const rows = data.values.slice(1);
            
            // Преобразуем в объекты
            const students = rows.map((row, index) => {
                const student = { rowIndex: index + 2 }; // +2 потому что индекс 0-based и пропускаем заголовки
                
                headers.forEach((header, colIndex) => {
                    student[header] = row[colIndex] || '';
                });
                
                return student;
            });
            
            console.log('👥 Загружено студентов:', students.length);
            return students;
            
        } catch (error) {
            console.error('❌ Ошибка при загрузке студентов:', error);
            throw error;
        }
    }
    
    /**
     * ➕ Добавление нового ученика
     */
    async addStudent(studentData) {
        try {
            // Подготавливаем данные в порядке заголовков
            const values = this.headers.map(header => {
                if (header === 'ID') {
                    return this.generateStudentId();
                } else if (header === 'Дата создания') {
                    return new Date().toLocaleDateString('ru-RU');
                } else if (header === 'Последнее изменение') {
                    return new Date().toLocaleDateString('ru-RU');
                } else if (header === 'Изменил') {
                    return window.authManager?.getCurrentUser()?.name || 'Система';
                } else {
                    return studentData[header] || '';
                }
            });
            
            const result = await this.googleAPI.appendSheetData(this.sheetName, values);
            
            console.log('➕ Студент добавлен успешно');
            return result;
            
        } catch (error) {
            console.error('❌ Ошибка при добавлении студента:', error);
            throw error;
        }
    }
    
    /**
     * 🔄 Обновление данных ученика
     */
    async updateStudent(rowIndex, studentData) {
        try {
            // Подготавливаем данные в порядке заголовков
            const values = [this.headers.map(header => {
                if (header === 'Последнее изменение') {
                    return new Date().toLocaleDateString('ru-RU');
                } else if (header === 'Изменил') {
                    return window.authManager?.getCurrentUser()?.name || 'Система';
                } else {
                    return studentData[header] !== undefined ? studentData[header] : '';
                }
            })];
            
            const range = `A${rowIndex}:${this.getColumnLetter(this.headers.length)}${rowIndex}`;
            const result = await this.googleAPI.saveSheetData(this.sheetName, range, values);
            
            console.log('🔄 Данные студента обновлены');
            return result;
            
        } catch (error) {
            console.error('❌ Ошибка при обновлении данных студента:', error);
            throw error;
        }
    }
    
    /**
     * 🗑 Удаление ученика
     */
    async deleteStudent(rowIndex) {
        try {
            const result = await this.googleAPI.deleteSheetRow(this.sheetName, rowIndex);
            
            console.log('🗑 Студент удален');
            return result;
            
        } catch (error) {
            console.error('❌ Ошибка при удалении студента:', error);
            throw error;
        }
    }
    
    /**
     * 🔍 Поиск учеников
     */
    async searchStudents(query, filters = {}) {
        try {
            const allStudents = await this.getAllStudents();
            
            let filteredStudents = allStudents;
            
            // Текстовый поиск
            if (query && query.trim()) {
                const searchTerm = query.toLowerCase();
                filteredStudents = filteredStudents.filter(student => {
                    return (
                        student['ФИО']?.toLowerCase().includes(searchTerm) ||
                        student['Телефон']?.toLowerCase().includes(searchTerm) ||
                        student['Email']?.toLowerCase().includes(searchTerm) ||
                        student['Удостоверение']?.toLowerCase().includes(searchTerm) ||
                        student['Номер ваучера']?.toLowerCase().includes(searchTerm)
                    );
                });
            }
            
            // Фильтры
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    filteredStudents = filteredStudents.filter(student => 
                        student[key] === filters[key]
                    );
                }
            });
            
            return filteredStudents;
            
        } catch (error) {
            console.error('❌ Ошибка при поиске студентов:', error);
            throw error;
        }
    }
    
    /**
     * 🆔 Генерация ID для ученика
     */
    generateStudentId() {
        return 'STD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    
    /**
     * 📍 Получение буквы колонки по индексу
     */
    getColumnLetter(columnIndex) {
        let letter = '';
        while (columnIndex > 0) {
            const remainder = (columnIndex - 1) % 26;
            letter = String.fromCharCode(65 + remainder) + letter;
            columnIndex = Math.floor((columnIndex - 1) / 26);
        }
        return letter;
    }
}

/**
 * 📁 Класс для работы с документами в Google Drive
 */
class DocumentManager {
    constructor(googleAPI) {
        this.googleAPI = googleAPI;
        this.folders = window.CONFIG?.DRIVE_FOLDERS || {};
    }
    
    /**
     * 📤 Загрузка документа
     */
    async uploadDocument(file, documentType, studentId, additionalInfo = {}) {
        try {
            const docConfig = window.CONFIG?.DOCUMENT_TYPES?.[documentType];
            
            if (!docConfig) {
                throw new Error(`Неизвестный тип документа: ${documentType}`);
            }
            
            // Проверяем размер файла
            if (file.size > docConfig.maxSize) {
                throw new Error(`Файл слишком большой. Максимум: ${(docConfig.maxSize / 1024 / 1024).toFixed(1)}MB`);
            }
            
            // Проверяем формат файла
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!docConfig.formats.includes(fileExtension)) {
                throw new Error(`Неподдерживаемый формат файла. Поддерживаются: ${docConfig.formats.join(', ')}`);
            }
            
            // Получаем папку для загрузки
            const folderId = this.folders[docConfig.folder];
            if (!folderId) {
                throw new Error(`Папка для типа документа ${documentType} не настроена`);
            }
            
            // Создаем имя файла
            const timestamp = new Date().toISOString().slice(0, 10);
            const fileName = `${studentId}_${documentType}_${timestamp}.${fileExtension}`;
            
            // Описание файла
            const description = `${docConfig.name} для студента ${studentId}. ${JSON.stringify(additionalInfo)}`;
            
            // Загружаем файл
            const result = await this.googleAPI.uploadFileToDrive(file, fileName, folderId, description);
            
            console.log('📤 Документ успешно загружен:', fileName);
            return {
                fileId: result.id,
                fileName: fileName,
                fileUrl: result.webViewLink,
                documentType: documentType,
                uploadDate: new Date().toISOString(),
                fileSize: file.size
            };
            
        } catch (error) {
            console.error('❌ Ошибка при загрузке документа:', error);
            throw error;
        }
    }
    
    /**
     * 📋 Получение документов студента
     */
    async getStudentDocuments(studentId) {
        try {
            const allDocuments = [];
            
            // Проходим по всем папкам документов
            for (const [docType, folderId] of Object.entries(this.folders)) {
                try {
                    const files = await this.googleAPI.getFilesFromDriveFolder(folderId);
                    
                    // Фильтруем файлы по ID студента
                    const studentFiles = files.filter(file => 
                        file.name.includes(studentId)
                    );
                    
                    // Добавляем информацию о типе документа
                    studentFiles.forEach(file => {
                        file.documentType = docType;
                        file.documentTypeName = this.getDocumentTypeName(docType);
                    });
                    
                    allDocuments.push(...studentFiles);
                    
                } catch (error) {
                    console.warn(`⚠️ Ошибка при получении файлов из папки ${docType}:`, error);
                }
            }
            
            // Сортируем по дате создания
            allDocuments.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
            
            return allDocuments;
            
        } catch (error) {
            console.error('❌ Ошибка при получении документов студента:', error);
            throw error;
        }
    }
    
    /**
     * 🗑 Удаление документа
     */
    async deleteDocument(fileId) {
        try {
            await this.googleAPI.deleteFileFromDrive(fileId);
            console.log('🗑 Документ успешно удален');
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка при удалении документа:', error);
            throw error;
        }
    }
    
    /**
     * 🏷 Получение названия типа документа
     */
    getDocumentTypeName(docType) {
        const docConfig = window.CONFIG?.DOCUMENT_TYPES?.[docType];
        return docConfig ? docConfig.name : docType;
    }
}

/**
 * 🚀 Инициализация Google API
 */
async function initializeGoogleAPI() {
    try {
        // Создаем глобальный экземпляр менеджера Google API
        window.googleAPI = new GoogleAPIManager();
        
        // Создаем менеджеры данных
        window.studentsManager = new StudentsDataManager(window.googleAPI);
        window.documentsManager = new DocumentManager(window.googleAPI);
        
        console.log('🚀 Google API менеджеры инициализированы');
        
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка инициализации Google API:', error);
        
        // Показываем уведомление пользователю
        if (typeof showNotification === 'function') {
            showNotification('warning', 'Google API недоступен. Некоторые функции могут не работать.');
        }
        
        return false;
    }
}

// 🌐 Экспорт для глобального использования
if (typeof window !== 'undefined') {
    window.GoogleAPIManager = GoogleAPIManager;
    window.StudentsDataManager = StudentsDataManager;
    window.DocumentManager = DocumentManager;
    
    // Автоматическая инициализация при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGoogleAPI);
    } else {
        initializeGoogleAPI();
    }
}

console.log('🔗 Модуль Google API загружен');
