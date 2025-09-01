document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const databaseTable = document.getElementById('database-table');

    let studentsData = [];

    const user = JSON.parse(localStorage.getItem('user'));
    const accessToken = user ? user.accessToken : null;

    async function renderTable(data) {
        databaseTable.innerHTML = '';
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Create table headers
        const headers = ['Имя Фамилия', 'Имя Фамилия на иврите', 'Телефон', 'ТЗ', 'Фото/пдф ТЗ', 'Город', 'Мейл', 'Уровень', 'Дата начала курса', 'Группа', 'Ваучер', 'Курс 200 шекелей', 'Фото/пдф оплаты 200 шекелей', 'Оплата', 'Дата оплаты', 'ИА', 'ИТЛ', 'Квитанция 5000', 'Квитанция 200'];
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create table rows
        data.forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                td.textContent = cellData;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        databaseTable.appendChild(table);
    }

    // Fetch and display all students initially
    if (accessToken) {
        studentsData = await getSheetData('MAIN!A:S', accessToken);
        if (studentsData) {
            renderTable(studentsData);
        }
    } else {
        alert('Вы не авторизованы.');
        window.location.href = 'index.html';
    }

    // Handle search
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            const filteredData = studentsData.filter(row => {
                const studentName = row[0] ? row[0].toLowerCase() : '';
                const tzNumber = row[3] ? row[3].toLowerCase() : '';
                return studentName.includes(searchTerm) || tzNumber.includes(searchTerm);
            });
            renderTable(filteredData);
        } else {
            renderTable(studentsData);
        }
    });
});