const CACHE_NAME = 'ulpan-crm-v6.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/js/auth.js',
  '/assets/js/google-api.js',
  '/assets/js/utils.js',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
  '/assets/images/favicon.ico'
];

// Установка Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching files...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: Installed and cached successfully');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('Service Worker: Installation failed:', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Обработка запросов (fetch)
self.addEventListener('fetch', function(event) {
  // Игнорируем запросы к Google APIs
  if (event.request.url.includes('googleapis.com') || 
      event.request.url.includes('google.com') ||
      event.request.url.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Возвращаем кэшированную версию, если она есть
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Клонируем запрос для сетевого запроса
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(function(response) {
          // Проверяем, что ответ валидный
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Клонируем ответ для кэширования
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              console.log('Service Worker: Caching new resource:', event.request.url);
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function(error) {
          console.log('Service Worker: Fetch failed:', error);
          
          // Возвращаем офлайн страницу для навигационных запросов
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          // Возвращаем пустой ответ для других ресурсов
          return new Response('Офлайн режим', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Обработка push уведомлений
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление от CRM системы',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/icon-192.png',
    tag: 'crm-notification',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть',
        icon: '/assets/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/assets/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('База учеников ульпана', options)
  );
});

// Обработка нажатий на уведомления
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    event.notification.close();
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Обработка фоновой синхронизации
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Background sync event');
  
  if (event.tag === 'background-sync-forms') {
    event.waitUntil(
      syncOfflineData()
    );
  }
});

// Функция синхронизации офлайн данных
async function syncOfflineData() {
  try {
    console.log('Service Worker: Syncing offline data...');
    
    // Получаем данные из IndexedDB или localStorage
    const offlineData = await getOfflineData();
    
    if (offlineData && offlineData.length > 0) {
      // Отправляем данные на сервер
      for (const data of offlineData) {
        await sendDataToServer(data);
      }
      
      // Очищаем офлайн хранилище после успешной синхронизации
      await clearOfflineData();
      
      console.log('Service Worker: Offline data synced successfully');
      
      // Показываем уведомление об успешной синхронизации
      self.registration.showNotification('Данные синхронизированы', {
        body: 'Офлайн данные успешно отправлены на сервер',
        icon: '/assets/images/icon-192.png',
        tag: 'sync-success'
      });
    }
  } catch (error) {
    console.error('Service Worker: Sync failed:', error);
  }
}

// Заглушки для функций работы с данными
async function getOfflineData() {
  // В реальном приложении здесь была бы работа с IndexedDB
  return [];
}

async function sendDataToServer(data) {
  // В реальном приложении здесь была бы отправка на Google Sheets API
  console.log('Sending data to server:', data);
  return true;
}

async function clearOfflineData() {
  // В реальном приложении здесь была бы очистка IndexedDB
  console.log('Clearing offline data...');
}

// Обработка ошибок
self.addEventListener('error', function(event) {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker: Script loaded successfully');
