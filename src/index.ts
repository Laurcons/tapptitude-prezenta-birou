import dayjs from 'dayjs';
import { google } from 'googleapis';
import { authenticate } from './authenticate';
import { getWifiName } from './get-wifi';
import { isDisabled } from './is-disabled';

async function main() {
  if (await isDisabled()) {
    console.log('Program is disabled, aborting');
    return;
  }
  console.log('Program is not disabled');

  if ((await getWifiName()) !== 'Tapptitude') {
    console.log('Not on Tapptitude wifi, aborting');
    return;
  }
  console.log('On Tapptitude wifi');

  console.log('Authenticating');
  const oauthClient = await authenticate();

  const sheets = google.sheets({ version: 'v4', auth: oauthClient });
  const spreadSheetIdJson = (await import('../spreadsheetid.json')).default;
  const spreadsheetId =
    spreadSheetIdJson[spreadSheetIdJson.selected as 'live' | 'testing'];

  const todaySheetName = dayjs().format('MMM YYYY'); // like Sep 2024
  console.log(`Today's sheet is ${todaySheetName}`);

  // get all row headers and find our one
  const rowHeaders = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${todaySheetName}'!A4:A150`,
    majorDimension: 'COLUMNS',
  });
  const myRowIdx =
    rowHeaders.data.values![0].findIndex((cell) => cell === '38') + 4;

  // get all column headers and find our one
  const todayDate = dayjs().format('D');
  const colHeaders = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${todaySheetName}'!B1:AZ1`,
    majorDimension: 'ROWS',
  });
  const myColIdx =
    colHeaders.data.values![0].findIndex((cell) => cell === todayDate) + 2;

  const targetCell = `'${todaySheetName}'!R${myRowIdx}C${myColIdx}`;
  console.log({ targetCell });

  // checking if there's nothing in the cell
  const existingCell = await sheets.spreadsheets.values
    .get({
      spreadsheetId,
      range: targetCell,
    })
    .then((r) => r.data.values?.[0][0] ?? '');

  if (existingCell.trim() !== '') {
    console.log(`Cell already contains content (${existingCell}), aborting`);
    return;
  }

  const cellContent = 'Lau P [Auto]';
  // write cell content
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: targetCell,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[cellContent]],
    },
  });

  console.log('Cell content written, exiting');
}

main();
