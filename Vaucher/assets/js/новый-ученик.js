document.addEventListener('DOMContentLoaded', async () => {
    // Populate dropdowns
    const citySelect = document.getElementById('city');
    const groupSelect = document.getElementById('group');
    const paymentOptionSelect = document.getElementById('payment-option');

    const cities = await getSheetData('SERV!G3:G');
    if (cities) {
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city[0];
            option.textContent = city[0];
            citySelect.appendChild(option);
        });
    }

    const groups = await getSheetData('SERV!T3:T');
    if (groups) {
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group[0];
            option.textContent = group[0];
            groupSelect.appendChild(option);
        });
    }

    const paymentOptions = await getSheetData('SERV!I3:I');
    if (paymentOptions) {
        paymentOptions.forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData[0];
            option.textContent = optionData[0];
            paymentOptionSelect.appendChild(option);
        });
    }

    // Handle conditional fields
    const course200Select = document.getElementById('course-200');
    const payment200FileGroup = document.getElementById('payment-200-file-group');
    course200Select.addEventListener('change', (e) => {
        payment200FileGroup.style.display = e.target.value === 'Да' ? 'block' : 'none';
    });

    const paymentOption = document.getElementById('payment-option');
    const paymentDateGroup = document.getElementById('payment-date-group');
    paymentOption.addEventListener('change', (e) => {
        paymentDateGroup.style.display = e.target.value === 'Дата оплаты указана точно' ? 'block' : 'none';
    });

    // Handle form submission
    const newStudentForm = document.getElementById('new-student-form');
    newStudentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Get form data
        const studentName = document.getElementById('student-name').value;
        const studentNameHebrew = document.getElementById('student-name-hebrew').value;
        const phone = document.getElementById('phone').value;
        const tzNumber = document.getElementById('tz-number').value;
        const city = document.getElementById('city').value;
        const email = document.getElementById('email').value;
        const level = document.getElementById('level').value;
        const startDate = document.getElementById('start-date').value;
        const group = document.getElementById('group').value;
        const course200 = document.getElementById('course-200').value;
        const paymentOption = document.getElementById('payment-option').value;
        const paymentDate = document.getElementById('payment-date').value;

        // 2. Upload files and get links
        const tzFile = document.getElementById('tz-file').files[0];
        const voucherFile = document.getElementById('voucher-file').files[0];
        const payment200File = document.getElementById('payment-200-file').files[0];

        let tzFileLink = '';
        if (tzFile) {
            const tzFileUploadResponse = await uploadFile(tzFile, TZ_FILE_FOLDER_ID);
            if (tzFileUploadResponse) {
                tzFileLink = tzFileUploadResponse.webViewLink;
            }
        }

        let voucherFileLink = '';
        if (voucherFile) {
            const voucherFileUploadResponse = await uploadFile(voucherFile, VOUCHER_FILE_FOLDER_ID);
            if (voucherFileUploadResponse) {
                voucherFileLink = voucherFileUploadResponse.webViewLink;
            }
        }

        let payment200FileLink = '';
        if (payment200File) {
            const payment200FileUploadResponse = await uploadFile(payment200File, PAYMENT_200_FILE_FOLDER_ID);
            if (payment200FileUploadResponse) {
                payment200FileLink = payment200FileUploadResponse.webViewLink;
            }
        }

        // 3. Prepare data for Google Sheets
        const rowData = [
            studentName,
            studentNameHebrew,
            phone,
            tzNumber,
            tzFileLink,
            city,
            email,
            level,
            startDate,
            group,
            voucherFileLink,
            course200,
            payment200FileLink,
            paymentOption,
            paymentDate,
        ];

        // 4. Append data to Google Sheet
        const response = await appendSheetData('MAIN!A1', [rowData]);

        if (response) {
            alert('Студент успешно добавлен!');
            window.location.href = 'main.html';
        } else {
            alert('Ошибка при добавлении студента.');
        }
    });

    // Handle cancel button
    const cancelButton = document.getElementById('cancel-button');
    cancelButton.addEventListener('click', () => {
        window.location.href = 'main.html';
    });
});