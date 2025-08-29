const GOOGLE_SHEET_ID = '1ETu3qsTX_pY6W0xtyRcEHzewi9MgHzm2-4kT0hnn4eI';
const ISHUR_ARSHAMA_FOLDER_ID = '1cNyRHRjNTEvbj3hnA5gN8WLp3oVkM0sJxOdae-HVaGtlQY5bXd09XmtD_Zf59deCI7uTbh5k';
const ISHUR_THILAT_LIMUDIM_FOLDER_ID = '1iTVVPqA_W1Ew4fsf3v_JSKmXnr1MXJ32w1wdMSspMi_0pkYbO9JxmhwblZSj3db3Dph9aSPS';
const RECEIPT_5000_FOLDER_ID = '1zOPAOXQfAmDzSDjWWisbBhMHPkIGaLO0GrIlpwylRUxCkHUZv4Fghav07QaT9ZqW4jFVAxv9';
const RECEIPT_200_FOLDER_ID = '1tSgDiBBGIUuCBmicMaknuMG3wq-ucH2ybU9JZBIAR2DeuiJNgjrYsB2AW8MxjCfiCUgLvRzY';
const TZ_FILE_FOLDER_ID = '1r6dfES7iutO9J2HjvOQSQ9Xd-BqcIXcmTOQZlzigv1oCHXd7Ool75Bc4T2Jo3wLph7ryT1ou';
const VOUCHER_FILE_FOLDER_ID = '1AZmZZL-DLjyjvDmV0tjNriTaIf_AH_6UzXfhfcAlaNApEMuV_j9DLPfO44vRqo0zGZ3-sMVo';
const PAYMENT_200_FILE_FOLDER_ID = '1paDpElQ2tRI7RlhB3yl2FO8o1gPyVjIDh32PXLrIlzO47tQyzJmrO0hQ-Dh_lgkRixZw36WB';

function doGet(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Missing parameters. Please access via the application.' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const action = e.parameter.action;
  const range = e.parameter.range;

  if (action === 'getSheetData') {
    const data = getSheetData(range);
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ error: 'Invalid action' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  Logger.log('Received POST request');
  if (!e || !e.postData) {
    Logger.log('e or e.postData is undefined');
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Missing POST data. Please ensure request body is sent.' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  Logger.log('e.postData.contents: ' + e.postData.contents);
  Logger.log('e.postData.type: ' + e.postData.type);
  Logger.log('e.postData.length: ' + e.postData.length);

  let requestBody;
  try {
    requestBody = JSON.parse(e.postData.contents);
    Logger.log('Parsed requestBody: ' + JSON.stringify(requestBody));
  } catch (error) {
    Logger.log('Error parsing JSON: ' + error.message);
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Error parsing request body', details: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const action = requestBody.action;

  if (action === 'appendSheetData') {
    const range = requestBody.range;
    const values = requestBody.values;
    const result = appendSheetData(range, values);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'updateSheetData') {
    const range = requestBody.range;
    const values = requestBody.values;
    const result = updateSheetData(range, values);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'uploadFile') {
    const folderId = requestBody.folderId;
    const file = requestBody.file;
    const result = uploadFile(file, folderId);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ error: 'Invalid action' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(range) {
  try {
    const sheet = SpreadsheetApp.openById(GOOGLE_SHEET_ID);
    const data = sheet.getRange(range).getValues();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function appendSheetData(range, values) {
  try {
    const sheet = SpreadsheetApp.openById(GOOGLE_SHEET_ID);
    sheet.getRange(range).appendRow(values[0]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function updateSheetData(range, values) {
  try {
    const sheet = SpreadsheetApp.openById(GOOGLE_SHEET_ID);
    sheet.getRange(range).setValues(values);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function uploadFile(file, folderId) {
  try {
    const blob = Utilities.newBlob(
      Utilities.base64Decode(file.bytes),
      file.mimeType,
      file.name
    );
    const folder = DriveApp.getFolderById(folderId);
    const newFile = folder.createFile(blob);
    return {
      success: true,
      fileId: newFile.getId(),
      webViewLink: newFile.getUrl()
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
