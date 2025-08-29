// This function is called by Google after the user signs in.
function handleCredentialResponse(response) {
    // The response object contains the JWT credential.
    const credential = response.credential;

    // Decode the JWT to get user's email and name
    const payload = JSON.parse(atob(credential.split('.')[1]));
    const userEmail = payload.email;
    const userName = payload.name;

    // Now, get an access token to make API calls.
    const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                // We have the access token. Now verify the user's role from the sheet.
                verifyUserRole(userEmail, userName, tokenResponse.access_token);
            }
        },
    });
    client.requestAccessToken();
}

async function verifyUserRole(email, name, accessToken) {
    // Use the access token to fetch the staff data
    // Note: The getSheetData function must be adapted to use the access token.
    // We are also passing the token directly now.
    const staffData = await getSheetData('SERV!A3:E', accessToken);

    if (staffData) {
        // Assuming email is in the 4th column (D) and is the unique identifier
        const userRecord = staffData.find(row => row[3] === email); 
        if (userRecord) {
            const role = userRecord[1]; // Assuming role is in the 2nd column (B)
            
            const user = {
                name: name,
                email: email,
                role: role,
                accessToken: accessToken
            };
            localStorage.setItem('user', JSON.stringify(user));
            
            window.location.href = 'main.html';
        } else {
            alert('Ваш email не найден в базе сотрудников.');
            google.accounts.id.disableAutoSelect();
        }
    } else {
        alert('Ошибка при загрузке данных сотрудников. Пожалуйста, попробуйте еще раз.');
    }
}

function logout() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        google.accounts.oauth2.revoke(user.accessToken, () => {
            console.log('Access token revoked.');
        });
    }
    localStorage.removeItem('user');
    google.accounts.id.disableAutoSelect();
    window.location.href = 'index.html';
}
