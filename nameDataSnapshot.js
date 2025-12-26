function saveSheetAsCSV() {
  const props = PropertiesService.getScriptProperties();
  const SHEETID = props.getProperty('MASTER_DB_ID');
  const SAVEFOLDERID = props.getProperty('SCRIPT_FOLDER_ID');
  const FILENAME = 'dataset.csv';

  const ss = SpreadsheetApp.openById(SHEETID);
  const sheet = ss.getActiveSheet(); 
  const data = sheet.getDataRange().getValues();
  
  //データをCSV形式の文字列に変換
  let csvContent = '';
  data.forEach(row => {
    const formattedRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    csvContent += formattedRow + '\r\n';
  });

  const folder = DriveApp.getFolderById(SAVEFOLDERID);

  //既存の同名ファイルがあれば探して削除する
  const existingFiles = folder.getFilesByName(FILENAME);
  while (existingFiles.hasNext()) {
    const file = existingFiles.next();
    file.setTrashed(true); //ゴミ箱に移動（完全に消す場合はDrive.Files.remove）
  }
  
  //新しいCSVファイルを作成
  const blob = Utilities.newBlob(csvContent, 'text/csv', FILENAME).setDataFromString(csvContent, 'UTF-8');
  folder.createFile(blob);
  
  console.log(`更新完了: ${FILENAME}`);
}