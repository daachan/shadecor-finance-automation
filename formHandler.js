function formHandler(e) {
  const props = PropertiesService.getScriptProperties();
  const SHEETID = props.getProperty('MASTER_DB_ID');
  const SHEETNAME = props.getProperty('MASTER_DB_SHEETNAME'); 
  const NAMEFOLDER = props.getProperty('NAME_FOLDER_ID'); 
  const ERRORFOLDER = props.getProperty('ERROR_FOLDER_ID'); 
  const ITEMNAME_NAME = '名前を選択してください' //Formに記載されているアイテムの表示名
  const ITEMNAME_STUDENT_NUMBER = '学籍番号' //Formに記載されているアイテムの表示名
  const ITEMNAME_UPLOAD = '活動費申請書(Excelファイル)を提出してください' //Formに記載されているアイテムの表示名
  const WEBHOOKURL = props.getProperty('DISCORD_WEBHOOK_URL');
  const ROLLID = props.getProperty('DISCORD_ROLL_ID');

  const TIMESTAMP = Utilities.formatDate(new Date(), "JST", "yyyy-MM-dd_HH-mm-ss");
    
  //コピー先DB(初期値)
  let copyTargetID = ERRORFOLDER;

  //フォームの回答情報を取得
  const responseItems = e.response.getItemResponses();
  let name = "";
  let studentNumber = "";
  let uploadFileID = "";
  let fileName = "error_" + TIMESTAMP + ".xlsx";
  
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
      fileName = name + "_" + TIMESTAMP + ".xlsx";
    }
    else {
      throw new Error("verify error");
    }
  } 
  catch (err) {
    const msg = err.message;
    let discordMsg = "";
    
    console.log("エラー内容" + err);
    
    //通知内容の選択
    if (msg.includes("verify error")) {
      discordMsg = "【退避】名前と学籍番号が一致しないファイルがアップロードされました"
    }
    else {
      discordMsg = "【退避】原因不明のエラーが発生しました"
    }

    sendDiscordNotification(discordMsg, WEBHOOKURL, ROLLID, name, studentNumber, TIMESTAMP);
  }

  //退避 or 名前フォルダにコピー
  const file = DriveApp.getFileById(uploadFileID);
  const targetFolder = DriveApp.getFolderById(copyTargetID);
  file.makeCopy(fileName, targetFolder);
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

//Discordにエラー(退避処理)が発生したことを通知する
function sendDiscordNotification(message, url, rollId, name, studentNumber, time) {

  //送るデータ
  const payload = {
    "username": "提出システム監視bot",
    "embeds": [{
      "title": message,
      "description": "To: <@&" + rollId + ">",
      "color": 16711680, 
      "fields": [
        { "name": "提出者", "value": name, "inline": true },
        { "name": "学籍番号", "value": studentNumber, "inline": true }
      ],
      "footer": {
        "text": "発生時刻: " + time
      }
    }]
  };

  //付加情報
  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };

  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    console.log("Discord通知に失敗しました: " + e.message);
  }
}