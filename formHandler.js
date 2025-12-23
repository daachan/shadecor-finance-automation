function formHandler(e) {
  const props = PropertiesService.getScriptProperties();
  const SHEETID = props.getProperty('MASTER_DB_ID');
  const SHEETNAME = props.getProperty('MASTER_DB_SHEETNAME'); 
  const LOGFOLDER = props.getProperty('LOG_FOLDER_ID'); 
  const NAMEFOLDER = props.getProperty('NAME_FOLDER_ID'); 
  const ERRORFOLDER = props.getProperty('ERROR_FOLDER_ID'); 
  const ITEMNAME_NAME = '名前を選択してください' //Formに記載されているアイテムの表示名
  const ITEMNAME_STUDENT_NUMBER = '学籍番号' //Formに記載されているアイテムの表示名
  
 //フォームの回答情報を取得
 const responseItems = e.response.getItemResponses();
 let name = "";
 let studentNumber = "";
 
 responseItems.forEach(item => {
  const itemName = item.getTitle().getTitle();
  
  //名前情報を取得
  if (itemName == ITEMNAME_NAME){
    name = responseItems.getResponse();
    console.log(name);
  }
  
  //学籍番号情報を取得
  if (itemName == ITEMNAME_STUDENT_NUMBER){
    studentNumber = responseItems.getResponse();
    console.log(studentNumber);
  }
 });

 //フォームから名前取得　OK
 //フォームから学籍番号取得 OK
 
 //中継用DBから[[名前][学籍番号]]こんなリストを取得 
 
 //フォーム名前とDB名前を照会（絶対ある）
  //一致するときにフォーム学籍番号とDB学籍番号を照会
  //
  //一致するなら　名前フォルダにコピー
  //一致しない＆その他エラーなら　退避用フォルダにコピー＆Discord通知

}

//中継用DBから名前と学籍番号のリストを取得
function getVerifyDataFromDB(){

}