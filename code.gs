// グローバル変数として定義
var activeUserId;
var hadLoginError = false;
/**
 * ページを開いた時に最初に呼ばれるルートメソッド
 */
function doGet(e) {
  activeUserId = e.parameter.user_id;
  // if(e.parameter.user_id != undefined){
  //   activeUserId = e.parameter.user_id;
  // }

  // ログインページのHTMLを読み込み、表示
  let page = e.parameter.page;
  if(!page){
    page = "view_login";
  }
  const template = HtmlService.createTemplateFromFile(page);

  return template
    .evaluate()
    .setTitle("ログイン");
    // .addMetaTag('viewport', 'width=device-eidth, initial-scale=1');
}

// このアプリのURLを返す
function getAppUrl(e) {
  console.log(ScriptApp.getService().getUrl());
  return ScriptApp.getService().getUrl();
}

// 指定秒数待つ関数
function waitSeconds(x) {
  console.log("待つよ~");
  Utilities.sleep(x * 1000); // x秒待つ（1秒 = 1000ミリ秒）
  console.log("待ったよ");
  return null;
}

/**
 * postで呼ばれる
 */
// ログイン処理
function doPost(e){

  // ログイン処理
  // formタグのIDを取得
  // var formId = e.parameters.id;
  // if(formId == "loginForm"){   // 優先度低いけど時間があれば分岐させたい
    let company_id = e.parameters.company_id.toString();
    let employee_id = e.parameters.employee_id.toString();
    let password = e.parameters.password.toString();

    activeUserId = loginUserId(company_id, employee_id, password);

    // ログイン失敗
    if(activeUserId == null){
      hadLoginError = true;
      var templateP = HtmlService.createTemplateFromFile("view_login");
      return templateP
        .evaluate()
        .setTitle("ログイン");
    }
    // ログイン成功
    else{
      hadLoginError = false;
      var is_admin = getUserInfo(activeUserId, "is_admin");
      if(is_admin == "true"){
        console.log("管理者のログイン");
        var templateP = HtmlService.createTemplateFromFile("view_adminHome");
        return templateP
          .evaluate()
          .setTitle("管理者用ホーム");
      }else{
        console.log("従業員のログイン");
        var templateP = HtmlService.createTemplateFromFile("view_employeeHome");
        return templateP
          .evaluate()
          .setTitle("ホーム");
      }
    }
  // }  //if(formId == "loginForm"){の閉じかっこ
}

// ユーザーのログイン情報を受け取って、正しければuser_idを返す
function loginUserId(input_company_id, input_employee_id, input_password){
  console.log("loginUserIdを呼び出した");
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName("LoginInfo");
  var data = sheet.getDataRange().getValues();

  for(var i = 1; i < data.length; i++){
    var row = data[i];
    var user_id = row[0];
    var company_id = row[1];
    var employee_id = row[2];
    var password = row[3];
    var is_admin = row[4];

    if(company_id == input_company_id && employee_id == input_employee_id && password == input_password){
      return user_id;
    }
  }
  // for文での走査が終わっても一致するユーザー情報がなかった時nullを返す
  return null;
}

// 現在ログインしているユーザーのuser_idを返す
function getActiveUserId(){
  return activeUserId;
}

// ログイン失敗を検知する
function checkLoginError(){
  if(hadLoginError){
    return true;
  }
}

// 現在ログインしているユーザーのuser_idを受け取って必要な情報を返す
function getUserInfo(user_id,needed){
  // // デバッグ用
  // user_id = 1;
  // needed = "is_admin";

  if(!user_id){
    user_id = getActiveUserId();
  }

  // UserInfoシートから取得
  if(needed == "user_name"){
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName("UserInfo");
    var data = sheet.getDataRange().getValues();

    var user_name = data[user_id][1];
    return user_name;
  }
  // LoginInfoシートから取得
  if(needed == "employee_id" || needed == "is_admin" || needed == "company_id" || needed == "company_name"){
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName("LoginInfo");
    var data = sheet.getDataRange().getValues();

    if(needed == "employee_id"){
      var employee_id = data[user_id][2];
      return employee_id;
    }
    if(needed == "is_admin"){
      var is_admin = data[user_id][4];
      console.log("is_admin="+is_admin);
      return is_admin;
    }
    if(needed == "company_id" || needed == "company_name"){
      var company_id = data[user_id][1];  // company_nameがほしいときはここでcompany_idを取得している
      if(needed == "company_id"){
        return company_id;
      }
    }
  }
  // CompanyInfoシートから取得
  if(needed == "company_name"){
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName("CompanyInfo");
    var data = sheet.getDataRange().getValues();

    var company_name = data[company_id][1];
    return company_name;
  }
}

// 状態(勤務中/休憩中/勤務外)を更新
function updateCondition(user_id, condition){
  // // デバッグ用
  // user_id = 2;
  // condition = "clock_in";

  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName("Condition");
  var data = sheet.getDataRange().getValues();

  var newCondition;

  if(condition == "clock_in"){
    newCondition = "onDuty";
  }
  if(condition == "clock_out"){
    newCondition = "offDuty";
  }
  if(condition == "break_begin"){
    newCondition = "onBreak";
  }
  if(condition == "break_end"){
    newCondition = "onDuty";
  }
  var targetCell = "B" + (user_id + 1);
  var targetRange = sheet.getRange(targetCell);
  targetRange.setValue(newCondition);
}

// 状態(勤務中/休憩中/勤務外)を取得
function getCondition(user_id){

  if(!user_id){
  user_id = getActiveUserId();
  }

  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName("Condition");
  var data = sheet.getDataRange().getValues();

  var condition = data[user_id][1];
  return condition;
}

// TimeCardsシートに勤怠情報を登録
function updateTimeCards(user_id, action){
  // // デバッグ用
  // user_id = 2;
  // action = "clock_in";

  var datetime = new Date();
  var formattedTime = Utilities.formatDate(datetime, "Asia/Tokyo", "yyyy-MM-dd'T'HH:mm:ss");

  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName("TimeCards");
  var data = sheet.getDataRange().getValues();

  var i = 1;
  while(1){
    if(sheet.getRange(i, 1, 1).isBlank()){
      break;
    }
    i++;
  }
  console.log("i:"+i);
  var timeCard = [[user_id, action, formattedTime]];
  var targetRange = sheet.getRange(i, 1, 1, 3);
  targetRange.setValues(timeCard);
}

// 管理者と同じ企業の勤怠記録(user_name / action / time)をリストにする
function getTimeCards(user_id){
  // // デバッグ用
  // user_id = 1;

  var admins_company_id = getUserInfo(user_id, "company_id");
  // console.log("admins_company_id:"+admins_company_id);

  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName("TimeCards");
  var data = sheet.getDataRange().getValues();
  var row;
  var users_company_id;
  var timeCardForCompany = [];
  var action_name;

  for(var i = 1; i < data.length; i++){
    // console.log("i"+i);
    row = data[i];
    users_company_id = getUserInfo(row[0], "company_id");
    // console.log("users_company_id:"+users_company_id);
    if(users_company_id == admins_company_id){
      var user_name = getUserInfo(row[0], "user_name");
      var action = row[1];
      var time = row[2];

      if(action == "clock_in"){
        action_name = "出勤";
      }else if(action == "break_begin"){
        action_name = "休憩開始";
      }else if(action == "break_end"){
        action_name = "休憩終了";
      }else if(action == "clock_out"){
        action_name = "退勤";
      }else{
        action_name = "不明"
      }

      var formattedTime = Utilities.formatDate(new Date(time), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");
      timeCardForCompany.push({'name':user_name, 'type':action_name, 'date':formattedTime});
    }
  }
  console.log(timeCardForCompany);
  return timeCardForCompany;
}

// 時間帯・勤務の状態に合わせたテキストを返す
function randomTextFromCharacter(loginFrag) {
  var textFromCharacter;
  var text = [];
  // デフォルトのテキストを追加
  text.push("ぴよぴよ");
  text.push("ぴいぴい");
  text.push("ぴぴぴ！");
  text.push("ぴい（ごはん！）");

  // 時間帯ごとのテキストを追加
  timeFrame = getTimeFrame();
  if(timeFrame == "asa"){
    text.push("ぴぴ！（おはよう！）")
  }
  if(timeFrame == "hiru"){
    text.push("ぴい！（こんにちは！）")
  }
  if(timeFrame == "yoru"){
    text.push("ぴい（こんばんは！）")
  }

  // ログイン画面専用テキストを追加
  //　ログイン画面にテキストを返す
  if(loginFrag == "login"){
    text.push("ぴ（ログインする？）");
    textFromCharacter = randomText();
    // console.log("loginFrag == trueのとき"+textFromCharacter);
    return textFromCharacter;
  }

  // ログイン中のテキストを追加
  text.push("ぴいぴい（おつかれさま！）");

  // 状態ごとのテキストを追加
  var condition = getCondition();
  if(condition == "onDuty"){
    // text.push("ぴ？（休憩する？）");
    // text.push("ぴっぴ？（ごはん？）");
    // text.push("ぴぴ？（退勤する？）");
    // text.push("ぴよぴよ（働いてえらいで）");
  }
  if(condition == "offDuty"){
    // text.push("ぴよぴよ（ゆっくり休んでね）");
  }
  if(condition == "onBreak"){
    // text.push("ぴよぴよ（ゆっくり休んでね）");
    // text.push("ぴ！（がんばってね）");
  }

  // テキストを返す
  textFromCharacter = randomText();
  return textFromCharacter;

  function randomText(){
    var randomIndex = Math.floor(Math.random() * text.length);  // ランダムなインデックスを生成
    return text[randomIndex]; // ランダムなテキストを返す
  }
}

// 時間帯を取得
function getTimeFrame(){
  var datetime = new Date();
  var currentHour = datetime.getHours();

  if(currentHour >= 5 && currentHour < 11){
    return "asa";
  }
  else if(currentHour >= 11 && currentHour < 18){
    return "hiru";    
  }
  else{
    return "yoru";    
  }
}  

