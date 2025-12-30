function saveSheetAsCSV() {
  const props = PropertiesService.getScriptProperties();
  const SHEETID = props.getProperty('MASTER_DB_ID');
  const SAVEFOLDERID = props.getProperty('SCRIPT_FOLDER_ID');
  
  const now = new Date();
  const timestamp = Utilities.formatDate(now, "JST", "yyyy-MM-dd_HH-mm-ss");
  const FILENAME = `dataset_${timestamp}.csv`;
  const SEARCH_KEYWORD = 'dataset';

  const ss = SpreadsheetApp.openById(SHEETID);
  const sheet = ss.getActiveSheet(); 
  const data = sheet.getDataRange().getValues();
  
  // データをCSV形式の文字列に変換
  let csvContent = '';
  data.forEach(row => {
    const formattedRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    csvContent += formattedRow + '\r\n';
  });

  const folder = DriveApp.getFolderById(SAVEFOLDERID);

  // ファイル名に "dataset" を含む既存ファイルをすべて削除
  const files = folder.searchFiles(`title contains '${SEARCH_KEYWORD}'`);
  while (files.hasNext()) {
    const file = files.next();
    file.setTrashed(true);
    console.log(`削除（ゴミ箱移動）: ${file.getName()}`);
  }
  
  // 新しいCSVファイルを作成
  const blob = Utilities.newBlob(csvContent, 'text/csv', FILENAME).setDataFromString(csvContent, 'UTF-8');
  folder.createFile(blob);
  
  console.log(`新規作成完了: ${FILENAME}`);
}