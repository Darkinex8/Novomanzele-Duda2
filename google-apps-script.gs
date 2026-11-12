/**
 * Google Apps Script pro svatební RSVP.
 */

const SHEET_NAME = 'Odpovědi';

const HEADERS = [
  'Čas odeslání',
  'Jméno a příjmení',
  'Účast',
  'Alergie / speciální strava',
  'Pití',
  'Ubytování',
  'Odvoz',
  'Poznámka'
];

function prepareSheet(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow === 0 || lastColumn === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  const data = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const oldHeaders = data[0].map(function(value) { return String(value || '').trim(); });

  const oldIndex = {};
  oldHeaders.forEach(function(header, index) {
    if (header) oldIndex[header] = index;
  });

  const reordered = [HEADERS];
  for (let r = 1; r < data.length; r++) {
    reordered.push(HEADERS.map(function(header) {
      const index = oldIndex[header];
      return index === undefined ? '' : data[r][index];
    }));
  }

  sheet.clearContents();
  sheet.getRange(1, 1, reordered.length, HEADERS.length).setValues(reordered);
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    prepareSheet(sheet);

    const payload = JSON.parse(e.parameter.rsvp_payload || '{}');
    const guests = Array.isArray(payload.guests) ? payload.guests : [];
    const note = payload.note || '';
    const timestamp = new Date();

    guests.forEach(function(guest) {
      sheet.appendRow([
        timestamp,
        guest.name || '',
        guest.attending || '',
        guest.diet || '',
        guest.drink || '',
        guest.accommodation || '',
        guest.transport || '',
        note
      ]);
    });

    return HtmlService.createHtmlOutput(
      '<!doctype html><html><body>OK</body></html>'
    );
  } catch (err) {
    return HtmlService.createHtmlOutput(
      '<!doctype html><html><body>CHYBA</body></html>'
    );
  }
}