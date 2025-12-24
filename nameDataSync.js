//Googleフォームのプルダウンリストに項目を追加する
function AddGoogleFormsListItem() {
  const props = PropertiesService.getScriptProperties();
  const FORMID = props.getProperty('SUBMISSION_FORM_ID');
  const SHEETID = props.getProperty('MASTER_DB_ID');
  const SHEETNAME = props.getProperty('MASTER_DB_SHEETNAME');
  const ITEMNAME = '名前を選択してください' //Formに記載されているアイテムの表示名

  const form = FormApp.openById(FORMID)
  const items = form.getItems()

  const nameList = getNameListFromDB(SHEETID, SHEETNAME) //中継用DBから名前一覧を取得

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const itemName = item.getTitle() //Formのアイテムのタイトルを取得

    //名前選択プルダウンの項目を更新する。
    if (itemName == ITEMNAME) {
      items[i].asListItem().setChoiceValues(nameList)
    }
  }
}

//中継用DBからプルダウンリストの選択肢を取得する
function getNameListFromDB(sheetID, sheetName) {
  const ss = SpreadsheetApp.openById(sheetID);
  const sheet = ss.getSheetByName(sheetName);

  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(1, 1, lastRow, 1).getValues().flat(); //1列目の1行目から記入行まで読み込む
  values.shift(); //1行目(項目)を削除

  return values.filter(v => v !== "");
}
