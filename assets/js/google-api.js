const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw2etfZwIDSQITmYXNaM-ZniMChB7MxkkIuNe4GXjm9GbrFQzbqVDJTAyZiEEPYn4yuxQ/exec';

async function getSheetData(range, accessToken) {
    const url = `${WEB_APP_URL}?action=getSheetData&range=${range}&accessToken=${accessToken}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
            return data.data;
        } else {
            console.error('Backend Error:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return null;
    }
}

async function appendSheetData(range, values, accessToken) {
    const url = WEB_APP_URL;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'appendSheetData',
                range: range,
                values: values,
                accessToken: accessToken
            }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error appending sheet data:', error);
        return null;
    }
}

async function updateSheetData(range, values, accessToken) {
    const url = WEB_APP_URL;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'updateSheetData',
                range: range,
                values: values,
                accessToken: accessToken
            }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating sheet data:', error);
        return null;
    }
}

async function uploadFile(file, folderId, accessToken) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
            const url = WEB_APP_URL;
            const requestBody = {
                action: 'uploadFile',
                folderId: folderId,
                file: {
                    name: file.name,
                    mimeType: file.type,
                    bytes: event.target.result.split(',')[1]
                },
                accessToken: accessToken
            };
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(requestBody),
                });
                const data = await response.json();
                if (data.success) {
                    resolve(data);
                } else {
                    console.error('Backend Error:', data.error);
                    reject(null);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                reject(null);
            }
        };
        reader.readAsDataURL(file);
    });
}
