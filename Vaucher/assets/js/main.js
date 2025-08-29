document.addEventListener('DOMContentLoaded', () => {
    if (GOOGLE_API_KEY === 'YOUR_API_KEY') {
        alert('Пожалуйста, добавьте ваш GOOGLE_API_KEY в файл config/google-config.js');
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const menuContainer = document.getElementById('menu-container');
    const role = user.role;

    const menuItems = [
        { name: 'Новый ученик', roles: ['продавец', 'администратор', 'куратор'], file: 'новый-ученик.html' },
        { name: 'Новые группы', roles: ['продавец', 'администратор', 'куратор'], file: 'новые-группы.html' },
        { name: 'Ишуры', roles: ['ульпан', 'финотдел', 'администратор', 'куратор'], file: 'ишуры.html' },
        { name: 'Квитанции', roles: ['ульпан', 'финотдел', 'администратор', 'куратор'], file: 'квитанции.html' },
        { name: 'База', roles: ['ульпан', 'финотдел', 'продавец', 'администратор', 'куратор'], file: 'база.html' }
    ];

    menuItems.forEach(item => {
        const button = document.createElement('button');
        button.textContent = item.name;
        if (item.roles.includes(role)) {
            button.addEventListener('click', () => {
                window.location.href = item.file;
            });
        } else {
            button.disabled = true;
        }
        menuContainer.appendChild(button);
    });
});