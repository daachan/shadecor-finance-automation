const FORMID = 'xxxxxxxx'   //① GoogleフォームのID
const ITEMNAME = '名前'                                      //② 項目のタイトル
const SHEETNAME = '明細情報DB(設計)'                                    //③ 読み込むシート名

/**
 * Googleフォームのプルダウンリストに項目を追加する
 */
function AddGoogleFormsListItem() {
  const form = FormApp.openById(FORMID)
  const items = form.getItems()

  const section = choiceValues()
  console.log(section)

  //デバック用Google Formsの質問名と、IDを取得
  for (let i = 0; i < items.length; i++) {

    const item = items[i]
    const itemName = item.getTitle()
    const itemId = item.getId()

    console.log(`質問名 ${itemName}, \n質問のID ${itemId}`)

    //スプレッドシートのシェアハウスDBから内容を読み取って、Formの項目を更新する。
    if (itemName == ITEMNAME) {
      items[i].asListItem().setChoiceValues(section)
    }
  }
}


//Googleシートから、プルダウンリストの選択肢を取得する
function choiceValues() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETNAME)
  const lastRow = sheet.getLastRow()
  const values = sheet.getRange(17, 2, 8, 1).getValues() //本当はここGetLastRow
  console.log(values)

  return values
}
