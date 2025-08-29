document.addEventListener('DOMContentLoaded', async () => {
    const groupsContainer = document.getElementById('groups-container');
    const addGroupButton = document.getElementById('add-group-button');
    let groupCount = 0;

    const teachers = (await getSheetData('SERV!A3:E')).filter(row => row[1] === 'учитель').map(row => row[0]);
    const classTimes = (await getSheetData('SERV!H3:H29')).map(row => row[0]);

    function addGroupForm() {
        groupCount++;
        if (groupCount > 4) {
            addGroupButton.disabled = true;
            return;
        }

        const groupForm = document.createElement('div');
        groupForm.classList.add('group-form');
        groupForm.innerHTML = `
            <h3>Группа ${groupCount}</h3>
            <div class="form-group">
                <label for="teacher-${groupCount}">Учитель группы ${groupCount}</label>
                <select id="teacher-${groupCount}" required>
                    ${teachers.map(teacher => `<option value="${teacher}">${teacher}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Дни занятий группы ${groupCount}</label>
                <div class="days-of-week">
                    <button type="button" data-day="Воскресенье">Вс</button>
                    <button type="button" data-day="Понедельник">Пн</button>
                    <button type="button" data-day="Вторник">Вт</button>
                    <button type="button" data-day="Среда">Ср</button>
                    <button type="button" data-day="Четверг">Чт</button>
                    <button type="button" data-day="Пятница">Пт</button>
                    <button type="button" data-day="Суббота">Сб</button>
                </div>
            </div>
            <div class="form-group">
                <label for="time-1-${groupCount}">Время занятий группы ${groupCount}</label>
                <select id="time-1-${groupCount}" required>
                    ${classTimes.map(time => `<option value="${time}">${time}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="level-${groupCount}">Уровень группы ${groupCount}</label>
                <select id="level-${groupCount}" required>
                    <option value="начинающие">начинающие</option>
                    <option value="продвинутые">продвинутые</option>
                </select>
            </div>
        `;
        groupsContainer.appendChild(groupForm);

        const daysOfWeekContainer = groupForm.querySelector('.days-of-week');
        daysOfWeekContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const selectedButtons = daysOfWeekContainer.querySelectorAll('button.selected');
                if (selectedButtons.length < 2 || e.target.classList.contains('selected')) {
                    e.target.classList.toggle('selected');
                }
            }
        });
    }

    addGroupButton.addEventListener('click', addGroupForm);

    // Add initial group form
    addGroupForm();

    // Handle form submission
    const newGroupForm = document.getElementById('new-group-form');
    newGroupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const month = document.getElementById('month').value;
        const startDay = document.getElementById('start-day').value;

        const groups = [];
        for (let i = 1; i <= groupCount; i++) {
            const teacher = document.getElementById(`teacher-${i}`).value;
            const level = document.getElementById(`level-${i}`).value;
            const time1 = document.getElementById(`time-1-${i}`).value;
            // Get selected days
            const dayButtons = document.querySelectorAll(`#groups-container .group-form:nth-child(${i}) .days-of-week button.selected`);
            const days = Array.from(dayButtons).map(btn => btn.dataset.day);

            groups.push([
                month,
                startDay,
                i,
                teacher,
                days[0] || '',
                time1,
                days[1] || '',
                '', // time2 is not implemented yet
                level,
                `${month} ${startDay} - ${teacher}`
            ]);
        }

        const response = await appendSheetData('SERV!K3', groups);

        if (response) {
            alert('Группы успешно добавлены!');
            window.location.href = 'main.html';
        } else {
            alert('Ошибка при добавлении групп.');
        }
    });

    // Handle cancel button
    const cancelButton = document.getElementById('cancel-button');
    cancelButton.addEventListener('click', () => {
        window.location.href = 'main.html';
    });
});