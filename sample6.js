const TASK_STATUS_MIKANRYO = 0;
const TASK_STATUS_KANRYO = 1;
const HINDO_TP_ONCE = 0;
const HINDO_TP_DAILY = 1;
const HINDO_TP_SPECIFIED_WEEK_DAY = 2;
const HINDO_TP_WEEKLY = 3;
const HINDO_TP_MONTHLY = 4;
const HINDO_TP_YEARLY = 5;
const MAX_LEVEL = 100;
const HINDO_TP_STR_ARRAY = ["Once", "Daily", "SWD", "Weekly", "Monthly", "Yearly"];
const HINDO_TP_STR_ARRAY_JP = ["単発", "毎日", "曜日指定", "毎週", "毎月", "毎年"];
const TASK_STATUS_TP_STR_ARRAY = ["未完了","完了"];
const WEEKDAY_JP = ["日", "月", "火", "水", "木", "金", "土"];
const COUNT_OF_DAYS_IN_A_WEEK = 7;
const LEVEL_STAGE_COUNT = 10;
const COLOR_RED_STR = "#ff0000";
const COLOR_GREEN_STR = "#00ff00";
const COLOR_BLUE_STR = "#0000ff";
const COLOR_BLACK_STR = "#000000";
//タスクのリスト
var MyTaskList = [];
//レベルのリスト
var MyLevelList = [];

//タスク・レベルの連番(ID用)
var MyTaskMaxSeq = 1;
var MyLevelMaxSeq = 1;

//タスクとレベルのクラス
var MyTaskAndLevel = new MyTaskAndLevel(MyTaskList, MyLevelList, MyTaskMaxSeq, MyLevelMaxSeq, "");



//検索結果のタスクのリスト
var SearchResultTaskList = [];

var current; // 現在のタブの状態を保持する変数

//タブのリンク一覧
var Tablinks = [];

//変更がある場合のフラグ
var needSaveFlg = false;

//検索に使用したタスクの検索条件(一時保存用)
var tempTaskSearchCondition = null;

(function(){
var menu = document.getElementById('tab_menu1');
var content = document.getElementById('tab_content1');
var links = menu.getElementsByTagName('a');


//Tablinkのリスト取得
for (var i = 0, l = links.length;i < l; i++){
  if(links[i].className == 'Tablink'){
  	Tablinks.push(links[i]);
  }
}
//各タブの初期化
for (var j = 0;j < Tablinks.length; j++){
  tab_init(Tablinks[j], j);
}
function tab_init(link, index){
  var id = link.hash.slice(1);
  var page = document.getElementById(id);
  if (!current){ // 状態の初期化
    current = {page:page, menu:link};
    page.style.display = 'block';
    link.className = 'active';
  } else {
    page.style.display = 'none';
  }
  
  if(id == 'page1-4' || id == 'page1-9'){//詳細タブ・タスク編集タブについてはリンクを非表示
  	link.className = '';
  	link.style.display = 'none';
  }else if(id == 'page1-1'){//タスク検索タブの初期表示メソッド
  	  link.onclick = function(){
  	  	changeTab(link);
  	  	
  	  	//カテゴリリストの初期化
	  	var categoryList = makeCategoryList(MyLevelList);	  	
		var categorySelbox = document.getElementById("TaskCategoryOnTab1-1");
		//カテゴリのセレクトボックスをクリア
		while(categorySelbox.firstChild != null){ categorySelbox.removeChild(categorySelbox.firstChild); }
		
		categoryList.forEach( function(category){
			let op = document.createElement("option");
			op.value = category;
			op.text = category;
			categorySelbox.appendChild(op);
		});
		
		var all_op = document.createElement("option");
		all_op.value = "all";
		all_op.text = "全て"
		categorySelbox.appendChild(all_op);
		categorySelbox.selectedIndex = categoryList.length;
		
  	  	
  	  	if(SearchResultTaskList != null){
  	  		DisplaySearchResult(SearchResultTaskList);
  	  	}
  	  }
  }else if(id == 'page1-3'){//タスク登録タブの初期表示メソッド
	  link.onclick = function(){
		  	changeTab(link);
		  	var categoryList = makeCategoryList(MyLevelList);
		  	
			var categorySelbox = document.getElementById("TaskCategoryOnTab1-3");
			//カテゴリのセレクトボックスをクリア
			while(categorySelbox.firstChild != null){ categorySelbox.removeChild(categorySelbox.firstChild); }
			
			categoryList.forEach( function(category){
				let op = document.createElement("option");
				op.value = category;
				op.text = category;
				categorySelbox.appendChild(op);
			});
			  	
			return false;
		};
  }else if(id == 'page1-5'){//レベル一覧タブの初期表示メソッド
	  	link.onclick = function(){
	  		changeTab(link);
	  		DisplayLevelInfoList(MyLevelList);
	  		return false;
	  	};
  }else if(id == 'page1-6'){//レベルアップスピード管理タブの初期表示メソッド
  		link.onclick = function(){
  			changeTab(link);
  			DisplayNeedExpList(MyLevelList);
  			return false;
  		}
  }else if(id == 'page1-8'){//カテゴリ削除タブの初期表示メソッド
  		link.onclick = function(){
  			changeTab(link);
		  	
			var categorySelbox = document.getElementById("CategoryNameOnTab1-8");
			
			//カテゴリのセレクトボックスをクリア
			while(categorySelbox.firstChild != null){ categorySelbox.removeChild(categorySelbox.firstChild); }

		  	var categoryList = makeCategoryList(MyLevelList);			
			categoryList.forEach( function(category){
				let op = document.createElement("option");
				op.value = category;
				op.text = category;
				categorySelbox.appendChild(op);
			});
			
  			return false;
  		}
  
  }else{
	  link.onclick = function(){//その他のタブの初期表示メソッド
	  	changeTab(link);
	    return false;
	  }; 
  }
}
})();


function SetClassObjToCookie(keyNm, targetObj){
	var json1 = JSON.stringify(targetObj);
	var encodeStrJson = encodeURIComponent(json1);
	document.cookie = keyNm + "=" + encodeStrJson;
}

function GetClassObjFromCookie(keyNm){
	var cookies = document.cookie.split(';');
	var json1 = "";
	

	for(var i=0; i<cookies.length; i++){
		value1 = cookies[i];
		var keyAndVal = value1.split('=');
		
		var key = keyAndVal[0];
		if(key == keyNm){
			json1 = decodeURIComponent(keyAndVal[1]);
			break;
		}
	}
	alert(json1);
	return JSON.parse(json1);
	
}

function SetClassObjToSessionStrage(keyNm, targetObj){	
	var json = JSON.stringify(targetObj);	
	window.sessionStrage.setItem([keyNm], [json]);
}

function GetClassObjFromSessionStrage(keyNm){
	var json = window.sessionStrage.getItem([keyNm]);
	return JSON.parse(json);
}

function CreateTestData(){

	var createDateStr = makeCurrentDateTimeStr();
	
	var taskId = "MyTask"+MyTaskMaxSeq;
	var taskCategory = "カテゴリA";
	var title = "タスクタイトル1";
	var description = "タスク1の説明1";
	var hindoType = HINDO_TP_ONCE;
	var riviveWeekDay = null;
	var clearExp = 10;
	
	AddMyTask(taskId, taskCategory, title, description, hindoType, riviveWeekDay, clearExp, createDateStr);
	
	taskId = "MyTask"+MyTaskMaxSeq;
	taskCategory = "カテゴリB"
	title = "タスクタイトル2";
	description = "タスク2の説明1";
	hindoType = HINDO_TP_DAILY;
	riviveWeekDay = null;
	clearExp = 10;
	
	AddMyTask(taskId, taskCategory, title, description, hindoType, riviveWeekDay, clearExp, createDateStr);
	
	var levelId = "MyLevel"+MyLevelMaxSeq;
	var levelCategory = "カテゴリA";
	var expForLevelUp = null;
	
	AddMyLevel(levelId, levelCategory, expForLevelUp);
	
	levelId = "MyLevel"+MyLevelMaxSeq;
	levelCategory = "カテゴリB";
	expForLevelUp = [20,40,80,100,120,140,180,200,220,240];

	AddMyLevel(levelId, levelCategory, expForLevelUp);
	
	var MyTaskAndLevel1 = new MyTaskAndLevel(MyTaskList, MyLevelList, 2, 2, "");
	MyTaskAndLevel = MyTaskAndLevel1;
	
	
}

//セーブデータ読込ボタンを押したときの動作
function LoadSaveData(){
	var inputText = document.getElementById("ImportTextArea1");
	var jsonStr = inputText.value;
	
	var data = JSON.parse(jsonStr);
	MyTaskAndLevel = data;
	MyTaskList = MyTaskAndLevel.TaskList;
	MyLevelList = MyTaskAndLevel.LevelInfo;
	
	alert("セーブデータ読み込みました");
	
}
//セーブデータ出力ボタンを押したときの動作
function OutputSaveData(){
	var savedDateStr = makeCurrentDateTimeStr();
	if(MyTaskList.length == 0){
		//デバッグ用
		//CreateTestData();		
	}
	
	
	MyTaskAndLevel.savedDate = savedDateStr;
	
	var json = JSON.stringify(MyTaskAndLevel);
	
	var outputText = document.getElementById("ExportTextArea1");
	outputText.value = json;
	
	//ファイルダウンロード処理
	var content = json;
	var blob = new Blob([ content ], {"type": "text/plain" });
	
	var downLoadLink = document.createElement("a");
	//保存時のファイル名をセット
	downLoadLink.download = 'SaveDataJson.txt';
	downLoadLink.href = URL.createObjectURL(blob);
	downLoadLink.dataset.downloadUrl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
	downLoadLink.click();
	
	if(needSaveFlg == true){
		needSaveFlg = false;
	}
}


function IsFilterOkTask(targetTask, taskOfSearchCondition){

	if(taskOfSearchCondition.hindoType != null){
		if(targetTask.hindoType != taskOfSearchCondition.hindoType){
			return false;
		}else if(taskOfSearchCondition.hindoType == HINDO_TP_SPECIFIED_WEEK_DAY){
			var overlapFlg = false;
			for(var i=0; i<COUNT_OF_DAYS_IN_A_WEEK; i++){
				if(taskOfSearchCondition.riviveWeekDay[i] == 1){
					if(targetTask.riviveWeekDay[i] == 1){
						overlapFlg = true;
						break;
					}
				}
			}
			if(overlapFlg == false){
				return false;
			}
		}
	}
	
	if(taskOfSearchCondition.title != null){
		if(targetTask.title.indexOf(taskOfSearchCondition.title) == -1 &&
		   targetTask.description.indexOf(taskOfSearchCondition.title) == -1){
		   	return false;
		}
	}
	
	if(taskOfSearchCondition.status != null){
		if(targetTask.status != taskOfSearchCondition.status){
			return false;
		}
	}
	
	if(taskOfSearchCondition.category != null){
		if(targetTask.category != taskOfSearchCondition.category){
			return false;
		}
	}
	
	return true;
}

//クッキーの値での検索
function searchTasksByCookieSearchCondition(){
	var taskOfSearchCondition = GetClassObjFromCookie('taskSearchCondition');
	
	SearchResultTaskList = [];
	MyTaskList.forEach( function(task) {
		if(IsFilterOkTask(task, taskOfSearchCondition) == true){
			SearchResultTaskList.push(task);
		}
	});
	
	DisplaySearchResult(SearchResultTaskList);
	
}

//セッションストレージの値での検索
function searchTasksBySessionStrageSearchCondition(){
	var taskOfSearchCondition = GetClassObjFromSessionStrage('taskSearchCondition');
	
	SearchResultTaskList = [];
	MyTaskList.forEach( function(task) {
		if(IsFilterOkTask(task, taskOfSearchCondition) == true){
			SearchResultTaskList.push(task);
		}
	});
	
	DisplaySearchResult(SearchResultTaskList);
	
}

//検索ボタンを押したときの動作(タスクリストタブ)
function searchTasks(){
	//検索条件をセット
	var taskOfSearchCondition = new function(){
		var elem = document.getElementById("searchConditionFormOnTab1-1");
		var radioNodeList = elem.Hindo;

		var checkedVal="";
		for(var j=0; j<radioNodeList.length; j++){
			if(radioNodeList[j].checked == true){
				checkedVal = radioNodeList[j].value;
			}
		}
		if(checkedVal == ""){
			this.hindoType = null;
		}else if(checkedVal == "Hindo_Once"){
			this.hindoType = HINDO_TP_ONCE;
		}else if(checkedVal == "Hindo_Daily"){
			this.hindoType = HINDO_TP_DAILY;
		}else if(checkedVal == "Hindo_SWD"){
			this.hindoType = HINDO_TP_SPECIFIED_WEEK_DAY;
			var youbiList = elem.Youbi;
			this.riviveWeekDay = [0, 0, 0, 0, 0, 0, 0];
			for(var l=0; l<youbiList.length; l++){
				if(youbiList[l].checked == true){
					this.riviveWeekDay[l] = 1;
				}
			}
		}else if(checkedVal == "Hindo_Weekly"){
			this.hindoType = HINDO_TP_WEEKLY;
		}else if(checkedVal == "Hindo_Monthly"){
			this.hindoType = HINDO_TP_MONTHLY;
		}else if(checkedVal == "Hindo_Yearly"){
			this.hindoType = HINDO_TP_YEARLY;
		}else{
			this.hindoType = null;
		}
		
		var taskKeyword = document.getElementById("TaskKeyword1").value;
		if(taskKeyword == ""){
			this.title = null;
		}else{
			this.title = taskKeyword;
		}
		
		var radioNodeList2 = elem.TaskStatus;
		var checkedStsVal = radioNodeList2.value;
		for(var k=0; k<radioNodeList2.length; k++){
			if(radioNodeList2[k].checked == true){
				checkedStsVal = radioNodeList2[k].value;
			}
		}
		if(checkedStsVal == "MiKanryo"){
			this.status = TASK_STATUS_MIKANRYO;
		}else if(checkedStsVal == "Kanryo"){
			this.status = TASK_STATUS_KANRYO;
		}else{
			this.status = null;
		}
		
		var category = document.getElementById("TaskCategoryOnTab1-1").value;
		if(category == "all"){
			this.category = null;
		}else{
			this.category = category;
		}
		
	}
	
	//検索条件を一時保存用にセット
	tempTaskSearchCondition = taskOfSearchCondition;
	
	
	//検索
	SearchResultTaskList = [];
	MyTaskList.forEach( function(task) {
		if(IsFilterOkTask(task, taskOfSearchCondition) == true){
			SearchResultTaskList.push(task);
		}
	});
	
	DisplaySearchResult(SearchResultTaskList);
	

}

//レベルアップスピード管理タブでの表を表示
function DisplayNeedExpList(LevelInfoList1){
	var needExpListTbl = document.getElementById("NeedExpListTableOnTab1-6");

	//表のすべての行の削除
	while(needExpListTbl.rows[0]){ needExpListTbl.deleteRow(0); }
	
	if(LevelInfoList1.length == 0){
		needExpListTbl.style.display = 'none';
	}else{
		needExpListTbl.style.display = 'none';
		//表(ヘッダー)の作成
		setTHRow("NeedExpListTableOnTab1-6", ["","カテゴリ名","1～10", "11～20", "21～30", "31～40", "41～50", "51～60", "61～70", "71～80", "81～90", "91～100", "操作"], COLOR_GREEN_STR);
		//表(検索結果)の作成
		LevelInfoList1.forEach( function(levelInfo) {
			var tr1 = needExpListTbl.insertRow(-1);
			
			var check_td = tr1.insertCell(-1);
			check_td.style.border = 'solid';
			
			var check_id = "chkBox_"+levelInfo.id;
			var chkBox = document.createElement('input');
			chkBox.type = 'checkbox';
			chkBox.name = "chkBoxCategoryOnTab1_6";
			chkBox.id = check_id;
			chkBox.value = levelInfo.id;
			chkBox.checked = false;
			chkBox.onchange = function(){
				if(chkBox.checked == true){
					check_td.style.color = COLOR_RED_STR;
				}else{
					check_td.style.color = COLOR_BLACK_STR;
				}
			}
			
			check_td.appendChild(chkBox);
			
			
			var category_td = tr1.insertCell(-1);
			category_td.innerHTML = levelInfo.category;
			category_td.style.border = 'solid';
			
			//各テキストボックスの表示
			levelInfo.expForLevelUp.forEach( function(needExp, idx) {

				var needExp_td = tr1.insertCell(-1);
				needExp_td.style.border = 'solid';
				
				var needExp_textbox_id = "NeedExpTextBox"+idx+"_"+levelInfo.id;
				var textbox = document.createElement('input');
				textbox.type = 'text';
				textbox.size = 2;
				textbox.id = needExp_textbox_id;
				textbox.value = needExp;
				textbox.onchange = function(){
					category_td.style.color = COLOR_BLUE_STR;
					needSaveFlg = true;
				}
				
				needExp_td.appendChild(textbox);
			
			});
			
			var update_td = tr1.insertCell(-1);
			update_td.style.border = 'solid';
			
			var update_btn_id = "UpdateBtn_"+levelInfo.id;
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.id = update_btn_id;
			btn.value = levelInfo.id;
			btn.innerText = "更新";
			btn.style.width = "50px";

			//各更新ボタンをクリックしたときの動作をセット			
			btn.onclick = function(){
				var clickedBtn = this;
				var levelInfo = getLevelInfoById(clickedBtn.value);
				if(levelInfo == null){
					alert("更新エラー");
					return;
				}
				var new_vals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
				
				for(var i=0; i<levelInfo.expForLevelUp.length; i++){
					var val = document.getElementById("NeedExpTextBox"+i+"_"+levelInfo.id).value;
					if(isNaN(val) == true || val <= 0){
						alert("各Expには正の値を設定してください");
						return;
					}
					new_vals[i] = parseInt(val,10);
				}
				levelInfo.expForLevelUp = new_vals;

				alert("更新しました");
				
				category_td.style.color = COLOR_BLACK_STR;
				needSaveFlg = true;
				
				return;	
			};
			update_td.appendChild(btn);
			
			
		
		});


		
		needExpListTbl.style.display = 'block';
	}
}

function getTaskById(id1){
	var targetTask = null;
	for(var i=0; i<MyTaskList.length; i++){
		if(MyTaskList[i].id == id1){
			targetTask = MyTaskList[i];
			break;
		}
	}
	return targetTask;
}

function getLevelInfoById(id1){
	var targetLevelInfo = null;
	for(var i=0; i<MyLevelList.length; i++){
		if(MyLevelList[i].id == id1){
			targetLevelInfo = MyLevelList[i];
			break;
		}
	}
	return targetLevelInfo;
}

function getLevelInfoByCategory(category1){
	var targetLevelInfo = null;
	for(var i=0; i<MyLevelList.length; i++){
		if(MyLevelList[i].category == category1){
			targetLevelInfo = MyLevelList[i];
			break;
		}
	}
	return targetLevelInfo;
}
//タスク一覧タブの検索結果のタスクをエクスポートボタンを押したときの動作
function exportSearchResultTask(){
	ExportTaskData(SearchResultTaskList);
}
//カテゴリ別レベル一覧の表を表示
function DisplayLevelInfoList(LevelInfoList1){
	var levelInfoListTbl = document.getElementById("LevelInfoListTableOnTab1-5");

	//表のすべての行の削除
	while(levelInfoListTbl.rows[0]){ levelInfoListTbl.deleteRow(0); }
	
	if(LevelInfoList1.length == 0){
		levelInfoListTbl.style.display = 'none';
	}else{
		levelInfoListTbl.style.display = 'none';
		//表(ヘッダー)の作成
		setTHRow("LevelInfoListTableOnTab1-5", ["カテゴリ名", "レベル", "総Exp", "レベルアップに必要なExp", "操作"], COLOR_GREEN_STR);
		//表(検索結果)の作成
		LevelInfoList1.forEach( function(levelInfo) {
			var tr1 = levelInfoListTbl.insertRow(-1);
			
			var category_td = tr1.insertCell(-1);
			category_td.innerText = levelInfo.category;
			category_td.style.border = 'solid';
			
			var level_td = tr1.insertCell(-1);
			level_td.innerText = levelInfo.currentLevel;
			level_td.style.border = 'solid';
			
			
			var totalExp_td = tr1.insertCell(-1);
			totalExp_td.innerText = levelInfo.totalExp;
			totalExp_td.style.border = 'solid';
			
			var needExp = levelInfo.expForLevelUp[parseInt((levelInfo.currentLevel-1)/LEVEL_STAGE_COUNT, 10)];
			var nextNeedExpForLevelUp = levelInfo.prevLevelExp + needExp;
			var diffExp = nextNeedExpForLevelUp - levelInfo.totalExp;
			var diffExp_td = tr1.insertCell(-1);
			diffExp_td.innerText = diffExp;
			diffExp_td.style.border = 'solid';
			
			var sousa_td = tr1.insertCell(-1);
			sousa_td.style.border = 'solid';
			
			var reset_btn_id = "ResetBtn_"+levelInfo.id;
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.id = reset_btn_id;
			btn.value = levelInfo.id;
			btn.innerText = "レベルをリセット";
			btn.style.width = "100px";
			
			btn.onclick = function(){//レベルをリセットボタンを押したときの動作
				if((window.confirm("カテゴリ:"+levelInfo.category+"のレベルをリセットしますか")) == true){
					levelInfo.currentLevel = 1;
					alert("レベルをリセットしました");
					
					needSaveFlg = true;
					DisplayLevelInfoList(LevelInfoList1);
				}
				
			};
			
			sousa_td.appendChild(btn);
			
			 
		
		});
		
		levelInfoListTbl.style.display = 'block';

	}
}

//タスクの検索結果の表を表示
function DisplaySearchResult(SearchResultTaskList1){
	var searchResultTbl = document.getElementById("searchResultTableOnTab1-1");
	var exportBtn = document.getElementById("exportTaskBtnOnTab1-1");
	
	//表のすべての行の削除
	while(searchResultTbl.rows[0]){ searchResultTbl.deleteRow(0); }
	
	if(SearchResultTaskList1.length == 0){
		searchResultTbl.style.display = 'none';
		exportBtn.disabled = true;
		
	}else{
		exportBtn.disabled = false;
		searchResultTbl.style.display = 'none';
		//表(ヘッダー)の作成
		setTHRow("searchResultTableOnTab1-1", ["タスク名", "頻度", "状態", "カテゴリ", "獲得Exp","クリア回数", "詳細", "操作"], COLOR_GREEN_STR);
		//表(検索結果)の作成
		SearchResultTaskList1.forEach( function(task) {
			var tr1 = searchResultTbl.insertRow(-1);
			var title_td = tr1.insertCell(-1);
			title_td.innerText = task.title;
			title_td.style.border = 'solid';
			
			var hindo_td = tr1.insertCell(-1);
			hindo_td.innerText = HINDO_TP_STR_ARRAY[task.hindoType];
			hindo_td.style.border = 'solid';
			
			var status_td = tr1.insertCell(-1);
			status_td.innerText = TASK_STATUS_TP_STR_ARRAY[task.status];
			status_td.style.border = 'solid';
			
			var category_td = tr1.insertCell(-1);
			category_td.innerText = task.category;
			category_td.style.border = 'solid';
			
			var clrExp_td = tr1.insertCell(-1);
			clrExp_td.innerText = task.clearExp;
			clrExp_td.style.border = 'solid';
			
			var clrCount_td = tr1.insertCell(-1);
			clrCount_td.innerText = task.clearCount;
			clrCount_td.style.border = 'solid';
			
			var syousai_td = tr1.insertCell(-1);
			syousai_td.style.border = 'solid';
			var syousai_btn_id = "SyousaiBtn_"+task.id;
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.id = syousai_btn_id;
			btn.innerText = "詳細";
			//各詳細ボタンをクリックしたときの動作をセット			
			btn.onclick = function(){
				var menu = document.getElementById('tab_menu1');
				var content = document.getElementById('tab_content1');				
				var page = document.getElementById("page1-4");
				
				  current.page.style.display = 'none';
				  current = {page:page, menu:null};
				  page.style.display = 'block';
				  current.page = page;
				  
				  DisplayTaskDetail(task);
				 
			};
			syousai_td.appendChild(btn);
			
			var sousa_td = tr1.insertCell(-1);
			sousa_td.style.border = 'solid';
			var edit_btn_id = "EditBtn_"+task.id;
			var btn2 = document.createElement('button');
			btn2.type = 'button';
			btn2.id = edit_btn_id;
			btn2.innerText = "編集";
			btn2.style.margin = "2px";
			
			//各編集ボタンをクリックしたときの動作をセット			
			btn2.onclick = function(){
				var menu = document.getElementById('tab_menu1');
				var content = document.getElementById('tab_content1');
				var page = document.getElementById("page1-9");
				
				  current.page.style.display = 'none';
				  current = {page:page, menu:null};
				  page.style.display = 'block';
				  current.page = page;
				  
				  DisplayEditTaskTab(task);

			};
			sousa_td.appendChild(btn2);
			
			var delete_btn_id = "DeleteBtn_"+task.id;
			var btn3 = document.createElement('button');
			btn3.type = 'button';
			btn3.id = delete_btn_id;
			btn3.innerText = "削除";
			btn3.style.margin = "2px";
						
			//各削除ボタンをクリックしたときの動作をセット			
			btn3.onclick = function(){
				if(window.confirm("タスク:"+task.title+"を削除しますか") == true){
					DeleteTask(task);
					
					//再検索
					SearchResultTaskList = [];
					MyTaskList.forEach( function(task) {
						if(IsFilterOkTask(task, tempTaskSearchCondition) == true){
							SearchResultTaskList.push(task);
						}
					});
					
					DisplaySearchResult(SearchResultTaskList);
					alert('削除しました');
				}
			};
			sousa_td.appendChild(btn3);
		
		});
		
		searchResultTbl.style.display = 'block';
	}
}
//カテゴリデータインポートのボタンを押したときの動作
function ImportCategoryData(){
	var inputText = document.getElementById("ImportTextArea1");
	var jsonStr = inputText.value;
	
	var data = JSON.parse(jsonStr);
	LevelList1 = data;
	
	var levelId;
	var createDateStr = makeCurrentDateTimeStr();
	
	LevelList1.forEach( function(levelInfo){
		levelId = "MyLevel"+MyLevelMaxSeq;
		AddMyLevel(levelId, levelInfo.category, levelInfo.expForLevelUp);
	});
	
	needSaveFlg = true;

	alert('カテゴリデータをインポートしました');
}

//全カテゴリデータエクスポートのボタンを押したときの動作
function ExportAllCategoryData(){
	ExportCategoryData(MyLevelList);
}

//チェックしたカテゴリデータをエクスポートのボタンを押したときの動作
function ExportSelectedCategory(){
	var form1 = document.getElementById("needExpListFormOnTab1-6");
	var chkBoxList = form1.chkBoxCategoryOnTab1_6;
	
	var levelInfoList = [];
	var levelInfo1;
	for(var i=0; i<chkBoxList.length; i++){
		if(chkBoxList[i].checked == true){
			levelInfo1 = getLevelInfoById(chkBoxList[i].value);
			levelInfoList.push(levelInfo1);
		}
	}
	if(levelInfoList.length == 0){
		return;
	}
	
	ExportCategoryData(levelInfoList);
}

//レベルのエクスポートを行うメソッド
function ExportCategoryData(OutputLevelList){
	var levelInfo1;
	var LevelInfoList1 = [];
	
	OutputLevelList.forEach( function(levelInfo) {
		levelInfo1 =  new MyLevel(levelInfo.id, levelInfo.category, levelInfo.expForLevelUp);
		LevelInfoList1.push(levelInfo1); 
	});
	
	var json = JSON.stringify(LevelInfoList1);
	
	var outputText = document.getElementById("ExportTextArea1");
	outputText.value = json;
	
	//ファイルダウンロード処理
	var content = json;
	var blob = new Blob([ content ], {"type": "text/plain" });
	
	var downLoadLink = document.createElement("a");
	//保存時のファイル名をセット
	downLoadLink.download = 'CategoryDataJson.txt';
	downLoadLink.href = URL.createObjectURL(blob);
	downLoadLink.dataset.downloadUrl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
	downLoadLink.click();
	
}

//全タスクデータエクスポートのボタンを押したときの動作
function ExportAllTaskData(){
	ExportTaskData(MyTaskList);
}

//タスクデータインポートのボタンを押したときの動作
function ImportTaskData(){
	var inputText = document.getElementById("ImportTextArea1");
	var jsonStr = inputText.value;
	
	var data = JSON.parse(jsonStr);
	TaskList1 = data;
	
	var taskId;
	var createDateStr = makeCurrentDateTimeStr();
	
	TaskList1.forEach( function(task){
		taskId = "MyTask"+MyTaskMaxSeq;
		AddMyTask(taskId, task.category, task.title, task.description, task.hindoType, 
		task.riviveWeekDay, task.clearExp, createDateStr);
	});
	
	needSaveFlg = true;

	alert('タスクデータをインポートしました');

}
//タスクのエクスポートを行うメソッド
function ExportTaskData(OutputTaskList){
	var Task1;
	var TaskList1 = [];
	
	OutputTaskList.forEach( function(task) {
		Task1 =  new MyTask(task.id, task.category, task.title, task.description, 
		task.hindoType, task.riviveWeekDay, task.clearExp, "");
		TaskList1.push(Task1); 
	});
	
	var json = JSON.stringify(TaskList1);
	
	//ファイルダウンロード処理
	var content = json;
	var blob = new Blob([ content ], {"type": "text/plain" });
	
	var downLoadLink = document.createElement("a");
	//保存時のファイル名をセット
	downLoadLink.download = 'TaskDataJson.txt';
	downLoadLink.href = URL.createObjectURL(blob);
	downLoadLink.dataset.downloadUrl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
	downLoadLink.click();	
	

}

//タスク編集タブを表示
function DisplayEditTaskTab(task){
	//各項目にタスクの値をセット
	var elem = document.getElementById("TaskTitleOnTab1-9");
	elem.value = task.title;
	
	elem = document.getElementById("TaskDescriptionOnTab1-9");
	elem.value = task.description;
	
	elem = document.getElementById("");
	
	var formElem = document.getElementById("editTaskFormOnTab1-9");
	var radioNodeList = formElem.Hindo;
	var checkedVal="";
	for(var i=0; i<radioNodeList.length; i++){
		if(radioNodeList[i].value == "Hindo_Once" &&
		   task.hindoType == HINDO_TP_ONCE){
		   	radioNodeList[i].checked = true;
		 }else if(radioNodeList[i].value == "Hindo_Daily" &&
		   		  task.hindoType == HINDO_TP_DAILY){
		   	radioNodeList[i].checked = true;
		 }else if(radioNodeList[i].value == "Hindo_SWD" &&
		   		  task.hindoType == HINDO_TP_SPECIFIED_WEEK_DAY){
		   	radioNodeList[i].checked = true;
		   	var youbiList = formElem.Youbi;
		   	for(var k=0; k<COUNT_OF_DAYS_IN_A_WEEK; k++){
		   		if(task.riviveWeekDay[k] == 1){
		   			youbiList[k].checked = true;
		   		}
		   	}
		 }else if(radioNodeList[i].value == "Hindo_Weekly" &&
		   		  task.hindoType == HINDO_TP_WEEKLY){
		   	radioNodeList[i].checked = true;
		 }else if(radioNodeList[i].value == "Hindo_Monthly" &&
		   		  task.hindoType == HINDO_TP_MONTHLY){
		    radioNodeList[i].checked = true;
		 }else if(radioNodeList[i].value == "Hindo_Yearly" &&
		   		  task.hindoType == HINDO_TP_YEARLY){
		   	radioNodeList[i].checked = true;
		 }
	}
	
	elem = document.getElementById("TaskCategoryOnTab1-9");
	//カテゴリのセレクトボックスをクリア
	while(elem.firstChild != null){ elem.removeChild(elem.firstChild); }
	
	var categoryList = makeCategoryList(MyLevelList);
	var selIdx;
	categoryList.forEach( function(category, idx){
		let op = document.createElement("option");
		op.value = category;
		op.text = category;
		if(category == task.category){
			selIdx = idx;
		}
		elem.appendChild(op);
	});
	elem.selectedIndex = selIdx;
	
	elem = document.getElementById("TaskClearExpOnTab1-9");
	elem.value = task.clearExp;	
	
	elem = document.getElementById("updateBtnOnTab1-9");
	elem.value = task.id;
}

function UpdateTask(){
	var taskId = document.getElementById("updateBtnOnTab1-9").value;
	var task = getTaskById(taskId);
	
	//各項目のチェック
	var taskCategory = document.getElementById("TaskCategoryOnTab1-9").value;
	if(taskCategory == ""){
		alert("カテゴリがありません");
		return;
	}
	var title = document.getElementById("TaskTitleOnTab1-9").value;
	if(title == ""){
		alert("タイトルを指定してください");
		return;
	}
	var description = document.getElementById("TaskDescriptionOnTab1-9").value;
	
	var hindoType;
	var riviveWeekDay = [0, 0, 0, 0, 0, 0, 0];
	
	var elem = document.getElementById("editTaskFormOnTab1-9");
	var radioNodeList = elem.Hindo;
	var checkedVal="";
	for(var j=0; j<radioNodeList.length; j++){
		if(radioNodeList[j].checked == true){
			checkedVal = radioNodeList[j].value;
		}
	}
	
	if(checkedVal == "Hindo_Once"){
		hindoType = HINDO_TP_ONCE;
	}else if(checkedVal == "Hindo_Daily"){
		hindoType = HINDO_TP_DAILY;
	}else if(checkedVal == "Hindo_SWD"){
		hindoType = HINDO_TP_SPECIFIED_WEEK_DAY;
		var youbiList = elem.Youbi;

		for(var l=0; l<youbiList.length; l++){
			if(youbiList[l].checked == true){
				riviveWeekDay[l] = 1;
			}
		}
	}else if(checkedVal == "Hindo_Weekly"){
		hindoType = HINDO_TP_WEEKLY;
	}else if(checkedVal == "Hindo_Monthly"){
		hindoType = HINDO_TP_MONTHLY;
	}else if(checkedVal == "Hindo_Yearly"){
		hindoType = HINDO_TP_YEARLY;
	}else{
		alert("頻度を指定してください");
		return;
	}

	var clearExp = document.getElementById("TaskClearExpOnTab1-9").value;
	if(isNaN(clearExp) == true || clearExp < 0){
		alert("獲得Expに0以上の数値を指定してください");
		return;
	}
	clearExp = parseInt(clearExp);
	

	//各項目の更新
	task.category = taskCategory;
	task.title = title;
	task.description = description;
	task.hindoType = hindoType;
	task.riviveWeekDay = riviveWeekDay;
	task.clearExp = clearExp;
	
	needSaveFlg = true;
	
	alert("タスクを更新しました");

}
//タスクの詳細タブを表示
function DisplayTaskDetail(task){
	var detailDiv = document.getElementById("DetailTask1");
	
	//詳細タブをクリア
	while(detailDiv.firstChild != null){ detailDiv.removeChild(detailDiv.firstChild); }
	
	var pElem = document.createElement("p");
	var innerHtmlStr = "";
	
	innerHtmlStr += "タイトル: "+ task.title+"<br>"
	innerHtmlStr += "カテゴリ: "+ task.category+"<br>";
	innerHtmlStr += "作成日: "+ task.createDate+"<br>";
	innerHtmlStr += "ステータス: "+ TASK_STATUS_TP_STR_ARRAY[task.status]+"<br>";
	innerHtmlStr += "最新完了日: "+ task.latestCompleteDate + "<br>";
	innerHtmlStr += "クリア回数: "+ task.clearCount + "<br>";
	innerHtmlStr += "頻度: "+ HINDO_TP_STR_ARRAY_JP[task.hindoType];
	if(task.hindoType == HINDO_TP_SPECIFIED_WEEK_DAY){
		innerHtmlStr += "(";
		innerHtmlStr += makeReviveWeekDayListStr(task.riviveWeekDay);
		innerHtmlStr += ")";
	}
	innerHtmlStr += "<br>";
	innerHtmlStr += "獲得Exp: " + task.clearExp + "<br>";
	innerHtmlStr += "説明: <br>"+'<span style="margin-top:10px; margin-left:20px;">' +
					 escapeStr(task.description) + "</span><br>";

	pElem.innerHTML = innerHtmlStr;
	detailDiv.appendChild(pElem);
	
	if(task.status == TASK_STATUS_MIKANRYO){
		var btn = document.createElement('button');
		btn.type = 'button';
		btn.innerText = "完了";
		btn.onclick = function(){//完了ボタンを押したときの動作
			task.status = TASK_STATUS_KANRYO;
			task.latestCompleteDate = makeCurrentDateTimeStr();
			task.clearCount++;
			
			
			var levelInfo = getLevelInfoByCategory(task.category);
			levelInfo.totalExp = parseInt(levelInfo.totalExp,10) + parseInt(task.clearExp, 10);
			
			var needExp;
			var nextNeedExpForLevelUp;
			var levelUpFlg = false;
			if(levelInfo.currentLevel < MAX_LEVEL){
				do{
					needExp = levelInfo.expForLevelUp[parseInt((levelInfo.currentLevel-1)/LEVEL_STAGE_COUNT, 10)];
					nextNeedExpForLevelUp = parseInt(levelInfo.prevLevelExp, 10) + parseInt(needExp, 10);
					if(levelInfo.totalExp >= nextNeedExpForLevelUp){
						levelInfo.prevLevelExp = nextNeedExpForLevelUp;
						levelInfo.currentLevel++;
						levelUpFlg = true;
					}
					if(levelInfo.currentLevel == MAX_LEVEL){
						break;
					}
					
				}while(levelInfo.totalExp >= nextNeedExpForLevelUp);
			}
			
			if(levelUpFlg == true){
				alert("レベルアップしました. レベル:"+levelInfo.currentLevel+", カテゴリ:"+task.category);
			}
			
			needSaveFlg = true;
			
			DisplayTaskDetail(task);
		};
		detailDiv.appendChild(btn);
	}else{
		var btn2 = document.createElement('button');
		btn2.type = 'button';
		btn2.innerText = "タスクを復活";
		btn2.onclick = function(){//タスクを復活ボタンを押したときの動作
			task.status = TASK_STATUS_MIKANRYO;
			
			needSaveFlg = true;
			
			DisplayTaskDetail(task);
		}
		detailDiv.appendChild(btn2);
	}
	
}
function makeCurrentDateTimeStr(){
	return makeDateStr(new Date());
}

function makeDateStr(dateVal){
	if(dateVal == null || dateVal == ""){
		return "";
	}
	var year = dateVal.getFullYear();
	var month = dateVal.getMonth()+1;
	if(month < 10){
		month = "0"+month;
	}
	var date1 = dateVal.getDate();
	if(date1 < 10){
		date1 = "0"+date1;
	}
	var hour = dateVal.getHours();
	if(hour < 10){
		hour = "0"+hour;
	}
	var minute = dateVal.getMinutes();
	if(minute < 10){
		minute = "0"+minute;
	}
	
	return year+"/"+month+"/"+date1+" "+ hour + ":"+minute;
}
function makeReviveWeekDayListStr(riviveWeekDayList){
	var retVal = "";
	for(var i=0; i<riviveWeekDayList.length; i++){
		if(riviveWeekDayList[i] == 1){
			if(retVal != ""){
				retVal += ",";
			}
			retVal += WEEKDAY_JP[i];
		}
	}
	return retVal;
}
function escapeStr(str1){

	str1 = str1.replace(/</g, '&lt;');
	str1 = str1.replace(/>/g, '&gt;');
	str1 = str1.replace(/\n/g, '<br>');
	
	var regex = new RegExp("(\\[URL\\][\t\s]*)(.*?)([\t\s]*\\[\\/URL\\])", "g");
	var matchedStrList;
	var url1;
	var repStr;
	while( (matchedStrList = regex.exec(str1)) != null){
		url1 = matchedStrList[2];
		
		targetStr = matchedStrList[1]+url1+matchedStrList[3];
		repStr = '<a href="' + url1 + '">' + url1 + '</a>';
		str1 = str1.replace(targetStr, repStr);

	}
	
	return str1;
}
//テーブルにthタグがあるかどうか
function hasTHRow(tableId){
	var Tbl = document.getElementById(tableId);
	if(Tbl.hasChildNodes()){
		var childNodeList = Tbl.childNodes;
		for(var i=0; i<Tbl.childNodes.length; i++){
			if(childNodes[i].nodeName == "TH"){
				return true;
			}
		}
	}else{
		return false;
	}
}

//テーブルにthタグを追加
function setTHRow(tableId, thArray, headerColor){
	var Tbl = document.getElementById(tableId);
	var thRow = Tbl.insertRow(0);

	thArray.forEach( function( thVal, idx ){
		var thObj = document.createElement("th");
		thObj.innerHTML = thVal;
		thObj.style.border = '2px solid' + headerColor;
		thRow.appendChild(thObj);
	});
}

function makeCategoryList(levelList){
	var retVal = [];
	levelList.forEach( function(level) {
		retVal.push(level.category);
	});
	return retVal;
}

//登録ボタンを押したときの動作(タスク追加タブ)
function RegistTask(){

	//各項目の取得とチェック
	var taskId = "MyTask"+MyTaskMaxSeq;	
	var taskCategory = document.getElementById("TaskCategoryOnTab1-3").value;
	if(taskCategory == ""){
		alert("カテゴリがありません");
		return;
	}
	var title = document.getElementById("TaskTitleOnTab1-3").value;
	if(title == ""){
		alert("タイトルを指定してください");
		return;
	}
	var description = document.getElementById("TaskDescriptionOnTab1-3").value;
	
	var hindoType;
	var riviveWeekDay = [0, 0, 0, 0, 0, 0, 0];
	
	var elem = document.getElementById("registTaskFormOnTab1-3");
	var radioNodeList = elem.Hindo;
	var checkedVal="";
	for(var j=0; j<radioNodeList.length; j++){
		if(radioNodeList[j].checked == true){
			checkedVal = radioNodeList[j].value;
		}
	}
	
	if(checkedVal == "Hindo_Once"){
		hindoType = HINDO_TP_ONCE;
	}else if(checkedVal == "Hindo_Daily"){
		hindoType = HINDO_TP_DAILY;
	}else if(checkedVal == "Hindo_SWD"){
		hindoType = HINDO_TP_SPECIFIED_WEEK_DAY;
		var youbiList = elem.Youbi;

		for(var l=0; l<youbiList.length; l++){
			if(youbiList[l].checked == true){
				riviveWeekDay[l] = 1;
			}
		}
	}else if(checkedVal == "Hindo_Weekly"){
		hindoType = HINDO_TP_WEEKLY;
	}else if(checkedVal == "Hindo_Monthly"){
		hindoType = HINDO_TP_MONTHLY;
	}else if(checkedVal == "Hindo_Yearly"){
		hindoType = HINDO_TP_YEARLY;
	}else{
		alert("頻度を指定してください");
		return;
	}

	var clearExp = document.getElementById("TaskClearExpOnTab1-3").value;
	if(isNaN(clearExp) == true || clearExp < 0){
		alert("獲得Expに0以上の数値を指定してください");
		return;
	}
	clearExp = parseInt(clearExp);
	
	var createDateStr = makeCurrentDateTimeStr();
	
	AddMyTask(taskId, taskCategory, title, description, hindoType, riviveWeekDay, clearExp, createDateStr);
	
	needSaveFlg = true;
	
	alert("タスクを登録しました");
	
}

//タスクリストにタスクを追加するメソッド
function AddMyTask(id, category, title, description, hindoType,
 riviveWeekDay, clearExp, createDateStr){
 	var MyTask1 = new MyTask(id, category, title, description, hindoType, riviveWeekDay, clearExp, createDateStr);
 	
	MyTaskList.push(MyTask1);
 	MyTaskMaxSeq++;
 	
 	needSaveFlg = true;
 
}

//レベル一覧リストにカテゴリを追加するメソッド
function AddMyLevel(id, category, expForLevelUp){

	var MyLevel1 = new MyLevel(id, category, expForLevelUp);
	MyLevelList.push(MyLevel1);	
	MyLevelMaxSeq++;
	
	needSaveFlg = true;
	
}
//タスククラスを作成するコンストラクタ
function MyTask(id, category, title, description, hindoType,
 riviveWeekDay, clearExp, createDateStr)
{
	this.id = id;
	this.category = category;
	this.title = title;
	this.description = description;
	this.status = TASK_STATUS_MIKANRYO;
	this.hindoType = hindoType;
	if(hindoType == HINDO_TP_SPECIFIED_WEEK_DAY){
		this.riviveWeekDay = riviveWeekDay;
	}else{
		this.riviveWeekDay = [0,0,0,0,0,0,0];
	}
	this.latestCompleteDate = "";
	this.clearExp = clearExp;
	this.clearCount = 0;
	this.createDate = createDateStr;
	

}

//レベルクラスを作成するコンストラクタ
function MyLevel(id, category, expForLevelUp){
	this.id = id;
	this.category = category;
	this.currentLevel = 1;
	this.totalExp = 0;
	this.prevLevelExp = 0;
	if(expForLevelUp != null){
		this.expForLevelUp = expForLevelUp;
	}else{
		this.expForLevelUp = [10,20,30,40,50,60,70,80,90,100];
	}
}

//タスクとレベルのセットのクラスを作成するコンストラクタ
function MyTaskAndLevel(MyTasks, MyLevels, taskMaxSeq1, levelMaxSeq1, savedDateStr){
	this.taskMaxSeq = taskMaxSeq1;
	this.levelMaxSeq = levelMaxSeq1;
	this.savedDate = savedDateStr;
	this.TaskList = MyTasks;
	this.LevelInfo = MyLevels;
}

function changeTab(link){
  var id = link.hash.slice(1);
  var page = document.getElementById(id);

    current.page.style.display = 'none';
    if(current.menu != null){
	    current.menu.className = '';
	}
    page.style.display = 'block';
    link.className = 'active';
    current.page = page;
    current.menu = link;
}

//全タスクの状態を更新ボタンを押したときの動作
function updateAllTaskStatus(){
	var currentDt = new Date();
	var updateCount = 0;
	
	MyTaskList.forEach( function(task) {
		if(task.status == TASK_STATUS_KANRYO &&
		   checkReviveTask(task, currentDt) == true){
			task.status = TASK_STATUS_MIKANRYO;
			updateCount++;
		}
	});
	
	if(updateCount > 0){//タスクの状態の更新が1件以上あった場合
		//再検索
		SearchResultTaskList = [];
		MyTaskList.forEach( function(task) {
			if(IsFilterOkTask(task, tempTaskSearchCondition) == true){
				SearchResultTaskList.push(task);
			}
		});
		
		needSaveFlg = true;
		
		DisplaySearchResult(SearchResultTaskList);
	}
	
}

function checkReviveTask(task, currentDate){
	if(task.latestCompleteDate == ""){
		return false;
	}else if(task.hindoType == HINDO_TP_ONCE){
		return false;
	}

	var riviveTime = calculateRiviveTime(task.latestCompleteDate, task.hindoType, task.riviveWeekDay);
	if(currentDate.getTime() >= riviveTime.getTime()){
		return true;
	}	
	
	return false;
}

//タスクの復活日時を計算
function calculateRiviveTime(latestCompleteDate, hindoType, riviveWeekDay){
	var year1 = parseInt(latestCompleteDate.substring(0,5),10);
	//月はmonthIndexに変換
	var month1 = parseInt(latestCompleteDate.substring(5,7),10) - 1;
	var date1 = parseInt(latestCompleteDate.substring(8,10),10);
	
	var retValDt;
	if(hindoType == HINDO_TP_DAILY){
		retValDt = new Date(year1, month1, date1, 0, 0);
		retValDt.setDate(retValDt.getDate()+1);
		return retValDt;
		
	}else if(hindoType == HINDO_TP_SPECIFIED_WEEK_DAY){
		retValDt = new Date(year1, month1, date1, 0, 0);
		retValDt.setDate(retValDt.getDate()+1);
		
		var daySt = retValDt.getDay();
		for(var i=0, dayIdx=daySt; i<COUNT_OF_DAYS_IN_A_WEEK; i++){
			if(riviveWeekDay[dayIdx] == 1){
				retValDt.setDate(retValDt.getDate()+i);
				return retValDt;
			}
			dayIdx++;
			if(dayIdx >= COUNT_OF_DAYS_IN_A_WEEK){
				dayIdx = 0;
			}
		}
			
	}else if(hindoType == HINDO_TP_WEEKLY){
		retValDt = new Date(year1, month1, date1, 0, 0);
		
		var diffToSunday = COUNT_OF_DAYS_IN_A_WEEK - retValDt.getDay();
		retValDt.setDate(retValDt.getDate() + diffToSunday);
		return retValDt;	
	}else if(hindoType == HINDO_TP_MONTHLY){
		retValDt = new Date(year1, month1, 1, 0, 0);
		var nextMonth = month1 + 1;
		if(nextMonth >= 12){
			retValDt.setFullYear(retValDt.getFullYear()+1);
			nextMonth = 0;
		}
		retValDt.setMonth(nextMonth);
		return retValDt;
	}else if(hindoType == HINDO_TP_YEARLY){
		retValDt = new Date(year1, 1, 1, 0, 0);
		retValDt.setFullYear(retValDt.getFullYear()+1);
		return retValDt;
	}
	
	//復活日時が計算できなかった場合
	retValDt = new Date(2999, 1, 1, 0, 0);
	return retValDt;
	

}

//カテゴリ追加タブの追加ボタンを押したときの動作
function RegistCategory(){
	var categoryName = document.getElementById("CategoryNameOnTab1-7").value;
	if(categoryName == null || categoryName == ""){
		return;
	}

	var levelId = "MyLevel"+MyLevelMaxSeq;
	var expForLevelUp = null;
	AddMyLevel(levelId, categoryName, expForLevelUp);

	needSaveFlg = true;
	
	alert("カテゴリ:"+categoryName+"を追加しました");
	
	
}

//カテゴリ削除タブの削除ボタンを押したときの動作
function DeleteCategory(){
	var categoryName = document.getElementById("CategoryNameOnTab1-8").value;
	var deleteIdx;
	for(var i=0; i<MyLevelList.length; i++){
		if(MyLevelList[i].category == categoryName){
			deleteIdx = i;
			break;
		}
	}
	MyLevelList.splice(deleteIdx, 1);
	
	needSaveFlg = true;
	
	alert("カテゴリ:"+categoryName+"を削除しました");
}

function DeleteTask(taskTargetDel){
	var deleteIdx;
	for(var i=0; i<MyTaskList.length; i++){
		if(taskTargetDel.id == MyTaskList[i].id){
			deleteIdx = i;
			break;
		}
	}
	
	needSaveFlg = true;
	
	MyTaskList.splice(deleteIdx, 1);
	
}

window.onbeforeunload = function(e){
	if(needSaveFlg){
		e.returnValue = true;
	}else{
	}
}

