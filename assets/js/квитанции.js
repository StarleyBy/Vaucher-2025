document.addEventListener('DOMContentLoaded', async () => {
    const studentNameSelect = document.getElementById('student-name');
    const tzNumberInput = document.getElementById('tz-number');
    const receipt200Group = document.getElementById('receipt-200-group');

    // Fetch students who need receipts
    const students = (await getSheetData('MAIN!A:S')).map((row, index) => ({
        name: row[0],
        tz: row[3],
        course200: row[11],
        rowNum: index + 1, // +1 because sheet rows are 1-based
        needsReceipt: row[0] && !row[17]
    })).filter(student => student.needsReceipt);

    if (students) {
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.name;
            option.textContent = student.name;
            option.dataset.tz = student.tz;
            option.dataset.course200 = student.course200;
            option.dataset.rowNum = student.rowNum;
            studentNameSelect.appendChild(option);
        });
    }

    studentNameSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        tzNumberInput.value = selectedOption.dataset.tz;
        receipt200Group.style.display = selectedOption.dataset.course200 === 'Да' ? 'block' : 'none';
    });

    // Trigger change event to populate TZ and show/hide 200 receipt for the first student
    if (studentNameSelect.options.length > 0) {
        studentNameSelect.dispatchEvent(new Event('change'));
    }

    // Handle form submission
    const receiptsForm = document.getElementById('receipts-form');
    receiptsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedOption = studentNameSelect.options[studentNameSelect.selectedIndex];
        const rowNum = selectedOption.dataset.rowNum;

        const receipt5000File = document.getElementById('receipt-5000').files[0];
        const receipt200File = document.getElementById('receipt-200').files[0];

        let receipt5000Link = '';
        if (receipt5000File) {
            const uploadResponse = await uploadFile(receipt5000File, RECEIPT_5000_FOLDER_ID);
            if (uploadResponse) {
                receipt5000Link = uploadResponse.webViewLink;
            }
        }

        let receipt200Link = '';
        if (receipt200File) {
            const uploadResponse = await uploadFile(receipt200File, RECEIPT_200_FOLDER_ID);
            if (uploadResponse) {
                receipt200Link = uploadResponse.webViewLink;
            }
        }

        const response = await updateSheetData(`MAIN!R${rowNum}:S${rowNum}`, [[receipt5000Link, receipt200Link]]);

        if (response) {
            alert('Квитанции успешно обновлены!');
            window.location.href = 'main.html';
        } else {
            alert('Ошибка при обновлении квитанций.');
        }
    });

    // Handle cancel button
    const cancelButton = document.getElementById('cancel-button');
    cancelButton.addEventListener('click', () => {
        window.location.href = 'main.html';
    });
});