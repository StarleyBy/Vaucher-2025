document.addEventListener('DOMContentLoaded', async () => {
    const studentNameSelect = document.getElementById('student-name');
    const tzNumberInput = document.getElementById('tz-number');

    // Fetch students who need confirmations
    const students = (await getSheetData('MAIN!A:Q')).map((row, index) => ({
        name: row[0],
        tz: row[3],
        rowNum: index + 1, // +1 because sheet rows are 1-based
        needsConfirmation: row[0] && !row[15] && !row[16]
    })).filter(student => student.needsConfirmation);

    if (students) {
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.name;
            option.textContent = student.name;
            option.dataset.tz = student.tz;
            option.dataset.rowNum = student.rowNum;
            studentNameSelect.appendChild(option);
        });
    }

    studentNameSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        tzNumberInput.value = selectedOption.dataset.tz;
    });

    // Trigger change event to populate TZ for the first student
    if (studentNameSelect.options.length > 0) {
        studentNameSelect.dispatchEvent(new Event('change'));
    }


    // Handle form submission
    const confirmationsForm = document.getElementById('confirmations-form');
    confirmationsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedOption = studentNameSelect.options[studentNameSelect.selectedIndex];
        const rowNum = selectedOption.dataset.rowNum;

        const ishurArshamaFile = document.getElementById('ishur-arshama').files[0];
        const ishurThilatLimudimFile = document.getElementById('ishur-thilat-limudim').files[0];

        let ishurArshamaLink = '';
        if (ishurArshamaFile) {
            const uploadResponse = await uploadFile(ishurArshamaFile, ISHUR_ARSHAMA_FOLDER_ID);
            if (uploadResponse) {
                ishurArshamaLink = uploadResponse.webViewLink;
            }
        }

        let ishurThilatLimudimLink = '';
        if (ishurThilatLimudimFile) {
            const uploadResponse = await uploadFile(ishurThilatLimudimFile, ISHUR_THILAT_LIMUDIM_FOLDER_ID);
            if (uploadResponse) {
                ishurThilatLimudimLink = uploadResponse.webViewLink;
            }
        }

        const response = await updateSheetData(`MAIN!P${rowNum}:Q${rowNum}`, [[ishurArshamaLink, ishurThilatLimudimLink]]);

        if (response) {
            alert('Ишуры успешно обновлены!');
            window.location.href = 'main.html';
        } else {
            alert('Ошибка при обновлении ишуров.');
        }
    });

    // Handle cancel button
    const cancelButton = document.getElementById('cancel-button');
    cancelButton.addEventListener('click', () => {
        window.location.href = 'main.html';
    });
});