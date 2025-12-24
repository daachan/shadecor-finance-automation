function formHandler(e) {
  const props = PropertiesService.getScriptProperties();
  const SHEETID = props.getProperty('MASTER_DB_ID');
  const SHEETNAME = props.getProperty('MASTER_DB_SHEETNAME'); 
  const NAMEFOLDER = props.getProperty('NAME_FOLDER_ID'); 
  const ERRORFOLDER = props.getProperty('ERROR_FOLDER_ID'); 
  const ITEMNAME_NAME = '名前を選択してください' //Formに記載されているアイテムの表示名
  const ITEMNAME_STUDENT_NUMBER = '学籍番号' //Formに記載されているアイテムの表示名
  const ITEMNAME_UPLOAD = '活動費申請書(Excelファイル)を提出してください' //Formに記載されているアイテムの表示名
    
  //コピー先DB(初期値)
  let copyTargetID = ERRORFOLDER;

  //フォームの回答情報を取得
  const responseItems = e.response.getItemResponses();
  let name = "";
  let studentNumber = "";
  let uploadFileID = "";
  
  responseItems.forEach(item => {
    const itemName = item.getItem().getTitle();
    
    //名前情報を取得
    if (itemName == ITEMNAME_NAME) {
      name = item.getResponse();
      console.log(name);
    }
    
    //学籍番号情報を取得
    if (itemName == ITEMNAME_STUDENT_NUMBER) {
      studentNumber = item.getResponse();
      console.log(studentNumber);
    }
    
    //アップロードされたファイルIDを取得
    if (itemName == ITEMNAME_UPLOAD) {
      const res = item.getResponse();
      uploadFileID = res[0] 
    }
  });

  //DB照会処理（ここで不一致/エラーなら 退避&通知）
  try {
    //中継用DBから照合情報を取得
    const verifyDB = getVerifyDataFromDB(SHEETID, SHEETNAME);
    console.log(verifyDB);
    
    //名前と学籍番号が一致するかを照合
    let isVerified = false;
    for (let i = 0; i < verifyDB.length; i++){
      const dbName = verifyDB[i][0];
      const dbStudentNumber = verifyDB[i][1];

      if (dbName == name && String(dbStudentNumber) == String(studentNumber)){
        isVerified = true;
        break;
      }
    }

    if (isVerified) {
      console.log("verified!")
      copyTargetID = NAMEFOLDER;
    }
    else {
      throw new Error("名前と学籍番号が一致しませんでした");
    }
  } 
  catch (err) {
    console.log("エラー内容" + err);
  }

  //退避 or 名前フォルダにコピー
  const file = DriveApp.getFileById(uploadFileID);
  const targetFolder = DriveApp.getFolderById(copyTargetID);
  file.makeCopy(file.getName(), targetFolder);
  console.log("copied!")
}

//中継用DBから名前と学籍番号のリストを取得
function getVerifyDataFromDB(sheetID, sheetName){
  const ss = SpreadsheetApp.openById(sheetID);
  const sheet = ss.getSheetByName(sheetName);

  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(1, 1, lastRow, 3).getValues(); //名前A列, 学籍番号C列
  data.shift(); //1行目(項目)を削除

  const values = data.map(row =>{ //2列目を削除
    return [row[0], row[2]];
  });

  return values.filter(v => v !== "");
}