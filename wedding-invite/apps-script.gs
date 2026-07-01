const SHEET_ID = '1xZz6dXbD4s_AU05Lyl8nS4MYZWAXuw5kes4IjWPsz_E';
const GUESTS_SHEET = 'Гости';
const ANSWERS_SHEET = 'Ответы анкеты';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const guests = ss.getSheetByName(GUESTS_SHEET);
    const answers = ss.getSheetByName(ANSWERS_SHEET);
    const guestId = String(payload.guest_id || '').trim();
    const now = new Date();

    if (!guestId) return json_({ ok: false, error: 'guest_id is required' });

    const data = guests.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('guest_id');
    const submittedCol = headers.indexOf('submitted');
    const drinksCol = headers.indexOf('drinks');
    const customCol = headers.indexOf('custom_drink');
    const updatedCol = headers.indexOf('updated_at');

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]).trim() === guestId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) return json_({ ok: false, error: 'guest not found' });

    guests.getRange(rowIndex, submittedCol + 1).setValue(true);
    guests.getRange(rowIndex, drinksCol + 1).setValue(payload.drinks || '');
    guests.getRange(rowIndex, customCol + 1).setValue(payload.custom_drink || '');
    guests.getRange(rowIndex, updatedCol + 1).setValue(now);

    answers.appendRow([
      now,
      guestId,
      payload.display_name || '',
      payload.invite_type || '',
      payload.drinks || '',
      payload.custom_drink || '',
      payload.user_agent || '',
      'saved'
    ]);

    return json_({ ok: true, updated: rowIndex });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
