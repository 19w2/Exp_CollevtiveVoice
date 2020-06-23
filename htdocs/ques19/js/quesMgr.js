//
// アンケートマネージャ
//
// TODO
// - JSのみでの動画再生(jplayerでいけるのでは)
// - マウスクリック時のエラー除去
//
// 2019-07-19
// ok - likertNoExpの追加
// ok - checkBox3の追加 (透明で大きさ指定できるチェックボックス)
//
// 2019-07-07
// ok - xlsx形式で数値として扱えるように', 'からスペースを削除
// ok - 回答のチェックがうまく動作していないのを修正
// ok - チェックボックスに値を設定できるように
// ok - 画像とチェックボックスのセットを横配置できるように
// ok - imageboxの追加．この要素を親として座標指定で子要素を配置する
// ok - 空の親要素box命令を追加．この中に座標指定で子要素を配置する
// ok - Likert Scaleを横に並べて配置できるように(LikertExp2の追加)
// ok - vspaceがレイアウトに反映するように( clear: leftが重要っぽい)
//      clear: leftで改行を明示できるかな
// ok - "px"の記述をconfファイルでは省略するように仕様変更
// ok - 相対座標指定のテキストエリア textArea2 (makeTextArea2()）の追加
// ok - 相対座標指定のテキスト text3 (makeText3()）の追加
// ok - Likert Scaleで文字を下に配置できるように(元からできた)
// ok - Likertのスペルを修正
// ok - JSでの音楽再生をjQueryで記述
// ok - Hspace(inline-block)の追加
// ok - selectionをjqueryで書く&位置の調整
// ok - flashチェックの削除
// ok - inline-blockでtextareaが使えるように
// ok - 連続して入力できる機能の追加(link命令追加)
//
// 2019-07-04
// - scaleExp2: 内容指定機能付き説明
// - likert2: 左詰め配置で左右ラベルなしのlikert
// - hspace: 横スペース挿入
// - selectionやtextareaから下部のスペースを除去
// - musicで左詰めで配置するように変更
//
// 2019-06-28
// - JSでの音楽再生(jplayerの採用)
//
// 2016-07-22
//  - confirm()の代わりにJQ UIのDialogを使う
//  - electiveのチェックが動作しない問題の解決
//  - リッカートスケールの度合い表示がずれる問題の解決
//  - imageに対してもRepeatがきくように改良
//  
let quesMgr = {};

//デバッグ用(IE対策)
if (!('console' in window)) {
    window.console = {};
    window.console.log = function(str){
        return str;
    };
}

//------------------------------
// ロード
//------------------------------
quesMgr.load = function(fname) {
    this.qPages;
    this.qAnswers;
    this.crrPage;

    this.bgColor = "#FFFFFF";
    this.fgColor = "#000000";
    this.hlColor1 = "#e78f08";
    this.hlColor2 = "#e78f08";
    //this.hlColor3 = "#f8cfb8";
    this.hlColor3 = "#fadfc8";
    this.hlColor4 = "#dffac8";

    this.gid = this.randobet(10);
    this.startDate = this.makeStartDate();

    this.panelWidth = 320;

    //クッキーが設定されていなかったら中断
    if (!this.checkCookie()) {
        let msg = "ブラウザのcookieがオフになっています．<br>";
        msg += "cookieをオンにしてください．";
        //let msg = "Please enable cookies.";
        this.showErrorMessage(msg);
        return false;
    }

    /*
    //実験IDを取得
    if ((this.gid = this.readCookie("gid")) === "") {
    let msg = "実験に参加していない可能性があります．<br><br>";
    msg += "<a href=\"start.html\">実験説明ページへ</a>";
    this.showErrorMessage(msg);
    return false;
    }

    //実験開始時間を取得
    if ((this.startDate = this.readCookie("startDate")) === "") {
    let msg = "実験に参加していない可能性があります．<br><br>";
    msg += "<a href=\"start.html\">実験説明ページへ</a>";
    this.showErrorMessage("実験に参加していない可能性があります．<br>");
    return false;
    }
    */

    //既に回答済みの場合
    if (this.readCookie("status") === "finish") {
        this.showErrorMessage("アンケートは一人一回のみ回答できます．<br>");
        //    this.showErrorMessage("Please note that you can answer this questionnaire only once.<br>");
        return false;
    }

    this.crrPage = 0;

    this.setNoSelect();

    this.loadQuestions(fname);
    this.parseQuestions(this.qPages[this.crrPage]);

    //$('#qTable').css('display', 'flex');

    YAHOO.util.Event.addListener(window, 'resize', this.resize);
};

// ------------------------------
// ヘッダー
// ------------------------------
quesMgr.makeHeader = function() {
    let div = $('<div></div>')
        .attr('id', 'header')
        .html('※ ブラウザの戻る・進む・更新ボタンは押さないでください．')
        .css('right', '10%')
        .css('height', '15px')
        .css('font-size', '10pt')
        .css('margin-bottom', '20px')
        .appnend('<hr>');

    return div;
};

// ------------------------------
// フッター
// ------------------------------
quesMgr.makeFooter = function() {
    let msg = "※ ブラウザの戻る・進む・更新ボタン" +
        "は押さないでください．";

    //let msg = "*NOTE* Please Do Not Use Your Browsers" +
    //        " Navigational Buttons (Back, Forward, Refresh)";

    $('<div class="footer"></div>')
        .css("margin-top", "20px")
        .append(
                $('<center></center>')
                .append(
                    $('<div></div>')
                    .text("- " + (this.crrPage+1) + "/" +
                        (this.qPages.length) + " -")
                    .css("margin-bottom", "20px")
                    )
               )
        .append(
                $('<p></p>')
                .css("border-bottom", "2px solid #e78f08")
               )
        .append(
                $('<center></cener>')
                .append(
                    $('<div></div>')
                    .text(msg)
                    .css("right", "10%")
                    .css("width", "450px")
                    .css("height", "100px")
                    .css("test-align", "center")
                    .css("font-size", "10pt")
                    )
               )
        .appendTo('#qTable');
};

// ------------------------------
// リサイズ
// ------------------------------
quesMgr.resize = function(ev) {
    //let h = parseInt(YAHOO.util.Dom.getClientHeight());
    let w = parseInt(YAHOO.util.Dom.getClientWidth(), 10);
    //let panelX = w - (quesMgr.panelWidth) - 10;
    let panelX = (w-quesMgr.panelWidth) - (w-800)/2 ;

    if (quesMgr.panel !== undefined) {
        quesMgr.panel.cfg.setProperty("x", panelX);
        quesMgr.panel.render("qTable");
    }
};

// ------------------------------
// エラーメッセージの表示
// ------------------------------
quesMgr.showErrorMessage = function(msg) {
    document.getElementById("qTable").innerHTML = msg;
};

// -------------------------------------
// クッキー書き込み
// -------------------------------------
quesMgr.writeCookie = function(key, value, days) {
    let d = new Date();
    d.setDate(d.getDate() + days);
    document.cookie = key + "=" + escape(value) + ";" +
        "expires=" + d.toGMTString() + ";";
};

// -------------------------------------
// クッキー読み込み
// -------------------------------------
quesMgr.readCookie = function(key) {
    if (key === "") {retrun;}

    let rexp = new RegExp(key + "=(.*?)(?:;|$)");
    if (document.cookie.match(rexp)) {
        return unescape(RegExp.$1);
    } else {
        return "";
    }
};

// -------------------------------------
// クッキー消去
// -------------------------------------
quesMgr.clearCookie = function(key) {
    let d = new Date();
    d.setDate(d.getDate() -1);
    document.cookie = key + "=false" +  ";" +
        "expires=" + d.toGMTString() + ";";
};

// ------------------------------
// テキストの選択禁止
// ------------------------------
quesMgr.setNoSelect = function() {
    document.onselectstart = function() {return false;};
};

//------------------------------
//0で桁をそろえる
//------------------------------
quesMgr.nf = function(num, digit) {
    let base = String(num + Math.pow(10, digit));
    let formated = base.substr(base.length-digit, digit);
    return formated;
};

// -------------------------------------
// 質問のロード
// -------------------------------------
quesMgr.loadQuestions = function(fname) {
    let ret = $.ajax({
        //url: proxyURL + "loadCSV.php?",
        url: "php/loadCSV.php?",
        data: {file: fname},
        async: false
    }).responseText;

    this.makePages(ret);
    //parseQues(ret);
};

// -------------------------------------
// ページ分割
// -------------------------------------
quesMgr.makePages = function(ques) {
    let qmax, i, rep, files, startIdx, endIdx, numRepPage;

    this.qPages = ques.split(/\s+newpage.*/);
    qmax = this.qPages.length;
    startIdx = 0;
    endIdx = 0;
    prop = "";

    //ページ内のrepeat命令を走査
    for(i=0; i<qmax; i+=1) {
        //repeatStartの検出
        if (this.qPages[i].match(/\s+repeatStart\s*,\s*([0-9]+)\s*,\s*([a-z]+)\s*,\s*(.*)/)) {
            //console.log(RegExp.$1 + ", " + RegExp.$2 + ", " + RegExp.$3);
            rep = parseInt(RegExp.$1, 10);
            prop = RegExp.$2;
            files = RegExp.$3;

            if (files.match(/\.php/)) {
                // phpファイルだった場合
                files = $.ajax({
                    url: files + "?",
                    data: {cmd: "up"},
                    async: false
                }).responseText;
            }

            files = files.replace(/\"/g, "");
            files = files.split(/ +/);

            //console.log("files.length: " + files.length);
            startIdx = i;
        }

        //repeatEndの検出
        if (this.qPages[i].match(/\s+repeatEnd.*/)) {
            endIdx = i;
            break;
        }
    }

    //repeatがあった場合ページ追加
    numRepPages = endIdx - startIdx;
    this.makePageRepetition(startIdx+1, numRepPages, rep, prop, files);

    //this.qAnswers = new Array(this.qPages.length);
    this.qAnswers = [];
    for(i=0; i<this.qPages.length; i+=1) {
        this.qAnswers[i] = [];
    }
    //alert(this.qPages.length);
};

// -------------------------------------
// 繰り返しページの作成
// -------------------------------------
quesMgr.makePageRepetition = function(startIdx, numRepPages, rep, prop, files) {
    let befPages, aftPages, amax, extPages,
    randFiles, i, j, fmax, r1, r2, tmp;

    if (files === undefined) { return; }

    //ページの追加
    befPages = this.qPages.slice(0, startIdx);
    aftPages = this.qPages.slice(startIdx+numRepPages);

    amax = files.length * rep;
    extPages = [];
    for(i=0; i<amax; i+=1) {
        for(j=startIdx; j<(startIdx+numRepPages); j+=1) {
            extPages.push(this.qPages[j]);
        }
    }

    this.qPages = befPages.concat(extPages, aftPages);

    //propの処理
    if (prop.match(/rand/)) {
        //ベースとなる配列の準備
        randFiles = [];
        fmax = files.length;
        for(i=0; i<fmax; i+=1) {
            for(j=0; j<rep; j+=1) {
                randFiles.push(files[i]);
            }
        }

        //ファイル名をランダムな順序に
        fmax = randFiles.length;
        for(i=0; i<fmax*2; i+=1) {
            r1 = Math.round(Math.random()*(fmax-1));
            r2 = Math.round(Math.random()*(fmax-1));
            tmp = randFiles[r1];
            randFiles[r1] = randFiles[r2];
            randFiles[r2] = tmp;
        }

        //ファイル名管理オブジェクトを初期化
        this.repFileMgr.init(randFiles, startIdx, numRepPages);

        //テスト
        //console.log(this.repFileMgr.showSortedIndex());

    }
    //
    else if (prop.match(/fix/)) {
        //ファイル名管理オブジェクトを初期化
        this.repFileMgr.init(files, startIdx, numRepPages);
    }

};

// ----------------------------------------
// ファイル名管理オブジェクト (クロージャ)
// ----------------------------------------
quesMgr.repFileMgr = {
    init: function(files, startIdx, numRepPages) {
        let cnt = 0,
        startPage = startIdx,
        numRepPage = numRepPages,
        sorted = files.slice(0).sort();

        quesMgr.repFileMgr = {
            //カウンタを進める
            getFname: function() {
                let f = files[cnt];
                //console.log(f);
                cnt += 1;
                return f;
            },
            //表示するだけ
            showFname: function(num) {
                let id = num || cnt;
                return files[id];
            },
            //カウンタの値を表示
            showCounterVal: function() {
                return cnt;
            },
            //すべてのファイルを表示
            showAllFnames: function() {
                return files;
            },
            //繰り返しを開始したページ
            showStartPage: function() {
                return startPage;
            },
            //繰り返しの最後のページ
            showNumRepPages: function() {
                return numRepPages;
            },
            //ソートしたファイル名に合わせたインデックスを表示
            showSortedIndex: function() {
                let ary = [],
                smax, fmax, i, j, tmp;

                smax = sorted.length;
                fmax = files.length;
                tmp = "";
                for(i=0; i<smax; i+=1) {
                    if (tmp === sorted[i]) {continue;}
                    for(j=0; j<fmax; j+=1) {
                        if (sorted[i] === files[j] ) {
                            ary.push(j);
                        }
                    }
                    tmp = sorted[i];
                }
                return ary;
            },
            //ソートしたファイル名を表示
            showSortedFnames: function() {
                return sorted;
            }
        };
    }
};

// -------------------------------------
// 質問内容のパース
// -------------------------------------
quesMgr.parseQuestions = function(ques) {
    let qtbl = document.getElementById("qTable");

    qtbl.innerHTML = "";
    this.pageButtonHidden = false;

    //qtbl.appendChild(this.makeHeader());

    document.body.scrollTop = 0;

    ques = ques.split("\n");
    for(let i=0; i<ques.length; i+=1) {

        //コメントをスキップ
        if (ques[i].match(/^\/\//)) {
            continue;
    }

    let q = ques[i].replace(/\s+,\s+/g, ",").split(/,/);
    q[q.length-1] = q[q.length-1].replace(/\s+$/, "");
    if( q[0].match("select")) {
        this.makeSelection(q);
    } else if (q[0].match("textArea2")) {
        this.makeTextArea2(q);
    } else if (q[0].match("textArea")) {
        this.makeTextArea(q);
    } else if (q[0].match("scaleExp2")) {
        this.makeScaleExp2(q);
    } else if (q[0].match("scaleExp")) {
        this.makeScaleExp(Number(q[1]));
    } else if (q[0].match("NasaTLX")){
        this.makeNasaTLX();
    } else if (q[0].match("NasaPair")){
        this.makeNasaPair();
    } else if (q[0].match("likertNoExp")){
        this.makeLikertNoExp(q);
    } else if (q[0].match("likertExp2")){
        this.makeLikertExp2(q);
    } else if (q[0].match("likertExp")){
        this.makeLikertExp(q);
    } else if (q[0].match("likert2")){
        this.makeLikert2(q);
    } else if (q[0].match("likert")){
        this.makeLikert(q);
    } else if (q[0].match("link")) {
        this.makeLink(q);
    } else if (q[0].match("text3")) {
        this.makeText3(q);
    } else if (q[0].match("text2")) {
        this.makeText2(q);
    } else if (q[0].match("title")) {
        this.makeTitle(q[1]);
    } else if (q[0].match("text1")) {
        this.makeText(q[1]);
    } else if (q[0].match("checkbox3")) {
        this.makeCheckBox3(q);
    } else if (q[0].match("checkbox2")) {
        this.makeCheckBox2(q);
    } else if (q[0].match("checkbox")) {
        this.makeCheckBox(q);
    } else if (q[0].match("radio")) {
        this.makeRadioButton(q);
    } else if (q[0].match("imagebox")) {
        this.makeImageBox(q);
    } else if (q[0].match("image")) {
        this.makeImage(q);
    } else if (q[0].match("music")) {
        this.makeMusic(q);
    } else if (q[0].match("vspace")) {
        this.makeVspace(q);
    } else if (q[0].match("break")) {
        this.makeBreak();
    } else if (q[0].match("box")) {
        this.makeBox(q);
    } else if (q[0].match("hspace")) {
        this.makeHspace(q);
    } else if (q[0].match("video")) {
        this.makeVideo(q);
    } else if (q[0].match("iframe")) {
        this.makeIframe(q);
    } else if (q[0].match("sortableText")) {
        this.makeSortableText(q);
    } else if (q[0].match("sortableVideo")) {
        this.makeSortableVideo(q);
    } else if (q[0].match("writeInfoCookie")) {
        this.writeInfoCookie();
    }
    }

    this.makePageButtons();
    this.makeFooter();
};

// -------------------------------------
// 縦方向のスペースの挿入
// -------------------------------------
quesMgr.makeVspace = function(param) {
    let val = param[1] || "40"
    $("<div class='vspace'></div>")
        //.css('height', val+"px")
        .css('margin-bottom', val+"px")
        .css('clear', 'left')
        //.css('float', 'none')
        //.css('display', 'block')
        //.css('display', 'flex')
        .appendTo('#qTable');
};

// -------------------------------------
// 横方向のスペースの挿入
// -------------------------------------
quesMgr.makeHspace = function(param) {
    let val = param[1] || "40"
    $("<div class='hspace'></div>")
        //.css('padding-left', val+"px")
        .css('margin-left', val+"px")
        .css('display', 'inline-block')
        //.text('__')
        //.css('display', 'flex')
        .appendTo('#qTable');
};

// -------------------------------------
// 横方向のスペースの挿入
// -------------------------------------
quesMgr.makeBreak = function() {
    $("<div></div>")
        .css('display', 'inline-block')
        .css('clear', 'left')
        .appendTo('#qTable');
};

// -----------------------------------------
// ID指定付きの画像タグ 位置決めに使う
// -----------------------------------------
quesMgr.makeImageBox = function(param) {
    let img_file = 'url(./conf/image/' + param[2].trim() + ')';

    $("<div></div>")
        .attr('id', param[1].trim())
        .css('position', 'relative')
        .css('clear', 'left')
        .css('background-image', img_file)
        .css('background-size', 'contain')
        .css('width', param[3]+'px')
        .css('height', param[4]+'px')
        .appendTo('#qTable');
};

// -------------------------------------
// 空のタグ(ID指定) 位置決めに使う
// -------------------------------------
quesMgr.makeBox = function(param) {
    $("<div></div>")
        .attr('id', param[1].trim())
        .css('position', 'relative')
        .css('clear', 'left')
        .css('width', param[2]+'px')
        .css('height', param[3]+'px')
        .appendTo('#qTable');
};

// -------------------------------------
// 音楽の作成
// -------------------------------------
quesMgr.makeMusic = function(param) {
    let file_name = "conf/" + param[1].replace(/^\s+/, "");

    $('<audio controls><source src="' + file_name + '" type = "audio/wav"/></audio>')
        .appendTo('#qTable');
};

// -------------------------------------
// ビデオの作成
// -------------------------------------
quesMgr.makeVideo = function(param) {
    let that = this,
    fileName,
    params,
    attributes;

    if (param[1].match(/randFile/)) {
        fileName = this.repFileMgr.getFname();
    } else {
        fileName = param[1].replace(/^\s+/, "");
    }

    /*
       if (navigator.appName === "Microsoft Internet Explorer") {
//静的ファイルを読み込む
//IEではObjectタグを動的に生成するとうまく表示できない
$("<iframe src='conf/video/" + fileName +".html' frameborder='0'></iframe>")
.attr('align', 'center')
.css('border', "0px #ffffff solid")
.css('margin-bottom', 40)
.css('width', 450)
.css('height', 350)
.appendTo('#qTable');
} else {
    //Objectを動的に生成する
    $("<div id='qvouter'><div id='qvideo'></div></div>")
    .attr('align', 'center')
    .css('margin-bottom', 40)
    .appendTo('#qTable');

    flashvars = {
    flv: "video/"+fileName,
    width: 400,
    height: 300,
    showplayer: "always",
    buffer: 60,
    buffershowbg: 0,
    showiconplay: 1,
    showloading: "always",
    autoload: 0,
    showplayer: "autohide",
    buffermessage: "",
    margin: 0
    };

    params = {
    movie: "conf/player_flv_maxi.swf",
    allowFullScreen: "false"
    };

    attributes = {
    id: "qvideo",
    name: "qvideo"
    };

    swfobject.embedSWF("conf/player_flv_maxi.swf",
    "qvideo", "400", "300",
    "9.0.0", "",
    flashvars, params, attributes);
    }
    */

// http://flv-player.net
/*
   $("<div id='qvideo'></div>")
   .append('<object type="application/x-shockwave-flash" ' +
   'data="conf/player_flv_maxi.swf" ' +
   'width="400" height="300"> ' +
   '<param name="movie" ' +
   'value="conf/player_flv_maxi.swf" /> ' +
   '<param name="allowFullScreen" value="false" /> ' +
   '<param name="FlashVars" ' +
   'value="flv=video/' + fileName +
   '&amp;width=400&amp;height=300'+
   '&amp;showplayer=always&amp;buffer=60' +
   '&amp;buffershowbg=0&amp;showiconplay=1' +
   '&amp;showloading=always&amp;autoload=0&amp;showplayer=autohide' +
   '&amp;buffermessage=&amp;margin=0'+
   '"/></object>')
   .attr('align', 'center')
   .css('margin-bottom', 40)
   .appendTo('#qTable');
   */

    this.pageButtonHidden = true;

    //ボリュームの指定ができるがロゴが出る
    $("<div id='qvouter'><div id='qvideo'></div></div>")
    .attr('align', 'center')
    .css('margin-bottom', 40)
    .appendTo('#qTable');

    $("<div id='vmsg'></div>")
    .css('width', 640)
    .css('padding-top', 5)
    .css('padding-bottom', 5)
    .css('background-color', "#000000")
    .css('color', "#ffffff")
    .css('cursor', 'pointer')
    .unbind()
    .bind('click', function(){jwplayer('qvideo').play();})
    .appendTo('#qvouter');

    jwplayer('qvideo').setup({
        flashplayer: "conf/player.swf",
        file: "conf/video/" + fileName,
        volume: 100,
        width: 640,
        height: 480,
        'controlbar.position': "none",
        'bufferlength': 40,
        icons: false,
        events: {
            onReady: function() {
                //alert("ビデオが終了しました．");
                $('#vmsg').html("【再生】←ここをクリックして再生してください．");
            },
            onComplete: function() {
                let i, max;
                //alert("ビデオが終了しました．");
                //$('#pageButton').css('visibility', 'visible');
                $('#vmsg').html("ビデオが終了しました．【もう一度再生する】");
                $("div:hidden:not(.ui-dialog)").show();
                $("input:hidden:not(.ui-dialog)").show();
            },
            /*
               onBufferFull: function() {
               $('#pageButton').css('visibility', 'visible');
               },
               */
            /*
               onBuffer: function() {
            //alert('しばらくお待ちください．');
            $('#vmsg').html("しばらくお待ちください．");
            },
            */
            onBufferChange: function() {
                $('#vmsg').html("しばらくお待ちください ("+
                        Math.floor(this.getBuffer()) + "％)");
            },
            onPlay: function() {
                //this.getState();
                $('#vmsg').html("再生中");
            },
            onPause: function() {
                //$('#vmsg').html("クリックして再生してください．");
                //停止しないようにする
                this.play();
            }
        }
    });

};

// -------------------------------------
// 画像の作成
// -------------------------------------
quesMgr.makeImage = function(param) {
    let fileName;
    if (param[1].match(/randFile|fixFile/)) {
        fileName = this.repFileMgr.getFname();
    } else {
        fileName = param[1].trim();
    }
        
    $('<img>')
    .attr('src', './conf/image/' + fileName)
    .css('width',  param[2]+'px')
    .css('height', param[3]+'px')
    .css('margin-bottom', '20px')
    //.css('align', 'center')
    .appendTo('#qTable');
};

// -----------------------------------------
// CHECKBOX
// -----------------------------------------
quesMgr.makeCheckBox = function(param) {
    let that = this;

    this.qAnswers[this.crrPage].push("");
    let idx = this.qAnswers[this.crrPage].length -1;
    this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

    if (param[2] && param[2].match("elective")) {
        this.qAnswers[this.crrPage][idx].elec = true;
    }

    let fid = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
    let chkFlg = false;
    let chkOffImg = "css/images/checkboxOff.png";
    let chkOnImg = "css/images/checkboxOn.png";

    $("<div></div>")
        .attr("id", fid)
        .attr('class', 'checkbox')
        .css("position", "relative")
        .css("left", "30px")
        //.css("width", "200px")
        .append($('<img>')
            .attr('src', chkOffImg)
            .unbind()
            .bind('click', function(){
                if (chkFlg == false) {
                    that.qAnswers[that.crrPage][idx].ans = param[1];
                    $(this).attr("src", chkOnImg);
                    chkFlg = true;
                } else {
                    that.qAnswers[that.crrPage][idx].ans = "";
                    $(this).attr("src", chkOffImg);
                    chkFlg = false;
                }
            })
            .mouseover(function() {
                $(this)
                .css('background-color', 'rgba(251, 152, 11, 1)')
                .css('box-shadow', '0 5px 20px rgba(251, 152, 11, 1.0)')
            })
            .mouseout(function() {
                $(this)
                .css('background-color', 'none')
                .css('box-shadow', 'none')
            })
        )
        .append($('<span></span>')
            .css("position", "relative")
            .css("left", "10px")
            .css("top", "-10px")
            .text(param[1])
        )
        .appendTo("#qTable");
};

// -----------------------------------------
// CHECKBOX その3 親要素からの相対位置&大きさ指定 + 透明
// checkbox3, 親id, 記録する値, elective/essential, テキスト, x座標, y座標, 横幅, 縦幅
// 例) checkbox3, imb3, 0.08, elective, , 280, 130, 100, 100
// -----------------------------------------
quesMgr.makeCheckBox3 = function(param) {
    let that = this;

    this.qAnswers[this.crrPage].push("");
    let idx = this.qAnswers[this.crrPage].length -1;
    this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

    if (param[3] && param[3].match("elective")) {
        this.qAnswers[this.crrPage][idx].elec = true;
    }

    //let fid = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
    let chkFlg = false;
    let chkOffImg = "css/images/checkboxOff.png";
    let chkOnImg = "css/images/checkboxOn.png";

    $("<div></div>")
        //.attr('id', fid)
        .attr('class', 'checkbox')
        .css('position', 'absolute')
        .css('left', param[5] + 'px')
        .css('top', param[6] + 'px')
        .css('width', param[7] + 'px')
        .css('height', param[8] + 'px')
        .append($('<img>')
            .attr('src', chkOffImg)
        )
        .append($('<span></span>')
            .css("position", "relative")
            .css("left", "10px")
            .css("top", "-10px")
            .text(param[4])
        )
        .unbind()
        .bind('click', function(){
            if (chkFlg == false) {
                that.qAnswers[that.crrPage][idx].ans = param[2].trim();
                $('img', this).attr("src", chkOnImg);
                chkFlg = true;
            } else {
                that.qAnswers[that.crrPage][idx].ans = "";
                $('img', this).attr("src", chkOffImg);
                chkFlg = false;
            }
        })
        .mouseover(function() {
            $(this)
                //.css('background-color', 'rgba(251, 152, 11, 1)')
                .css('box-shadow', '0 5px 20px rgba(251, 152, 11, 1.0)')
        })
        .mouseout(function() {
            $(this)
                //.css('background-color', 'none')
                .css('box-shadow', 'none')
        })
        .appendTo('#'+param[1].trim());
};

// -----------------------------------------
// CHECKBOX その2 親要素からの相対位置指定
// checkbox2, 親id, 記録する値, elective/essential, テキスト, x座標, y座標
// 例) checkbox2, imb3, 0.08, elective, , 280, 130 
// -----------------------------------------
quesMgr.makeCheckBox2 = function(param) {
    let that = this;

    this.qAnswers[this.crrPage].push("");
    let idx = this.qAnswers[this.crrPage].length -1;
    this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

    if (param[3] && param[3].match("elective")) {
        this.qAnswers[this.crrPage][idx].elec = true;
    }

    let fid = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
    let chkFlg = false;
    let chkOffImg = "css/images/checkboxOff.png";
    let chkOnImg = "css/images/checkboxOn.png";

    $("<div></div>")
        .attr('id', fid)
        .attr('class', 'checkbox')
        .css('position', 'absolute')
        .css('left', param[5] + 'px')
        .css('top', param[6] + 'px')
        .append($('<img>')
            .attr('src', chkOffImg)
            .unbind()
            .bind('click', function(){
                if (chkFlg == false) {
                    that.qAnswers[that.crrPage][idx].ans = param[2].trim();
                    $(this).attr("src", chkOnImg);
                    chkFlg = true;
                } else {
                    that.qAnswers[that.crrPage][idx].ans = "";
                    $(this).attr("src", chkOffImg);
                    chkFlg = false;
                }
            })
            .mouseover(function() {
                $(this)
                .css('background-color', 'rgba(251, 152, 11, 1)')
                .css('box-shadow', '0 5px 20px rgba(251, 152, 11, 1.0)')
            })
            .mouseout(function() {
                $(this)
                .css('background-color', 'none')
                .css('box-shadow', 'none')
            })
        )
        .append($('<span></span>')
            .css("position", "relative")
            .css("left", "10px")
            .css("top", "-10px")
            .text(param[4])
        )
        .appendTo('#'+param[1].trim());
};

// -------------------------------------
// テキストエリアの作成
// -------------------------------------
quesMgr.makeTextArea = function(param) {
    this.qAnswers[this.crrPage].push("");
    let idx = this.qAnswers[this.crrPage].length -1;
    this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};
    that = this;

    if (param[3].match("elective")) {
        this.qAnswers[this.crrPage][idx].elec = true;
    }

    $("<textarea></textarea><br>")
        .attr("id", "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4))
        .attr("value", "")
        //.attr("cols", param[1])
        //.attr("rows", param[2])
        .css("position", "relative")
        //.css("left", "30px")
        .css("width", param[1]+'px')
        .css("height", param[2]+'px')
        //.css("margin-bottom", "30px")
        .css("border", "solid 2px #000000")
        .unbind()
        .change(function() {
            let t = this.value;
            t = t.replace(/\"/g, "″");
            t = t.replace(/,/g, "，");
            t = t.replace(/\n+/g, "<br>");
            that.qAnswers[that.crrPage][idx].ans = t;
        })
    .appendTo("#qTable");
};

// --------------------------------------------
// テキストエリア その2 親ID指定＋相対座標指定
// --------------------------------------------
quesMgr.makeTextArea2 = function(param) {
    this.qAnswers[this.crrPage].push("");
    let idx = this.qAnswers[this.crrPage].length -1;
    this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};
    that = this;

    if (param[2].match("elective")) {
        this.qAnswers[this.crrPage][idx].elec = true;
    }

    $("<textarea></textarea>")
        .attr("id", "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4))
        .attr("value", "")
        .css('position', 'absolute')
        .css('left', param[3] + 'px')
        .css('top', param[4] + 'px')
        .css("width", param[5] + 'px')
        .css("height", param[6] +'px')
        .css("border", "solid 2px #000000")
        .unbind()
        .change(function() {
            let t = this.value;
            t = t.replace(/\"/g, "″");
            t = t.replace(/,/g, "，");
            t = t.replace(/\n+/g, "<br>");
            that.qAnswers[that.crrPage][idx].ans = t;
        })
    .appendTo('#'+param[1].trim());
};

// -------------------------------------
// SELECTの作成
// -------------------------------------
quesMgr.makeSelection = function(param) {
    this.qAnswers[this.crrPage].push("");
    let idx = this.qAnswers[this.crrPage].length -1;
    this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};
    let that = this;

    
    let sel = $("<select></select>")
        .attr('name', param[1])
        .css('background-color', this.bgColor)
        .change(function() {
            that.qAnswers[that.crrPage][idx].ans = this.options[this.selectedIndex].value;
        });

    for(let i=4; i<param.length; i+=1) {
        sel.append($('<option></option>').val(param[i]).html(param[i])); 
    }

    $("<div><form></form></div>")
        .attr("id", "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4))
        .html(param[3] +  "　")
        //.css('width', '400px')
        //.css('height', '50px')
        .append(sel)
        .appendTo("#qTable");
};

// -------------------------------------
// NASA-TLXの作成
// -------------------------------------
quesMgr.makeNasaTLX = function() {
    this.flgNasaTLX = true;
    let divNTLX = document.createElement("div");

    let labels = [
        "精神的要求",
        "身体的要求",
        "時間的圧迫感",
        "作業達成度",
        "努力",
        "不満"
    ];

    for(let i=0; i<6; i+=1) {
        this.qAnswers[this.crrPage].push("");
        let idx = this.qAnswers[this.crrPage].length -1;

        let label = document.createElement("div");
        label.id = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
        label.innerHTML = labels[i];
        label.style.height = "30px";
        label.style.width = "140px";
        divNTLX.appendChild(label);
        divNTLX.appendChild(this.makeSliderTag(i));
    }

    let qtbl = document.getElementById("qTable");
    qtbl.appendChild(divNTLX);

    //スペーサ
    let div = document.createElement("div");
    div.style.height = "50px";
    qtbl.appendChild(div);

    //スライダの作成
    let that = this;
    for(let i=0; i<6; i+=1) {
        let slider = YAHOO.widget.Slider.getHorizSlider(
                "sliderbg-"+this.nf(i,2), "sliderthum-"+this.nf(i,2), 0, 299);
        slider.setValue(150, true);
        slider.num = i;
        this.qAnswers[this.crrPage][slider.num] = {ans:"", elec:false};
        slider.subscribe("change", function(oVal){
            if (this.valueChangeSource !== 1) {return;}
            let nVal = Math.round(oVal/3.0);
            that.qAnswers[that.crrPage][this.num].ans = nVal;
        });
    }

    this.makeNasaExpPanel();
};

// -------------------------------------
// NASA-TLXの一対比較(重み用)の作成
// -------------------------------------
quesMgr.makeNasaPair = function() {
    let divNPair = document.createElement("div");

    let labels = [
        "精神的要求",
        "身体的要求",
        "時間的圧迫感",
        "作業達成度",
        "努力",
        "不満"
    ];

    let tmp;
    for(let i=0; i<6; i+=1) {
        for(let j=i+1; j<6; j+=1) {
            this.qAnswers[this.crrPage].push("");
            let idx = this.qAnswers[this.crrPage].length -1;
            let divPair = document.createElement("div");
            divPair.style.clear = "both";
            divPair.style.height = "30px";
            divPair.style.backgroundColor = this.bgColor;

            //if (j % 2 === 0) {
            if( i !== tmp) {
                let divLeft = this.createClickableDiv(labels[i], idx);
                let divRight = this.createClickableDiv(labels[j], idx);
                tmp = i;
            } else {
                let divLeft = this.createClickableDiv(labels[j], idx);
                let divRight = this.createClickableDiv(labels[i], idx);
                tmp = -1;
            }

            let divNum = document.createElement("div");
            divNum.id = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
            divNum.innerHTML = (idx+1) + ".";
            divNum.style.styleFloat = "left";
            divNum.style.cssFloat = "left";
            divNum.style.textAlign = "center";
            divNum.style.width = "30px";
            divNum.style.border = "solid 1px transparent";

            let divCenter = document.createElement("div");
            divCenter.innerHTML = "&hArr;";
            divCenter.style.styleFloat = "left";
            divCenter.style.cssFloat = "left";
            divCenter.style.textAlign = "center";
            divCenter.style.width = "35px";
            divCenter.style.border = "solid 1px transparent";

            divPair.appendChild(divNum);
            divPair.appendChild(divLeft);
            divPair.appendChild(divCenter);
            divPair.appendChild(divRight);

            divNPair.appendChild(divPair);
            divNPair.appendChild(document.createElement("br"));
        }
        }

        let qtbl = document.getElementById("qTable");
        qtbl.appendChild(divNPair);

        this.makeNasaExpPanel();
    };

    // -------------------------------------
    // 用語説明パネル
    // -------------------------------------
    quesMgr.makeNasaExpPanel = function() {

        this.panel = new YAHOO.widget.Panel("exPanel", {
            width: this.panelWidth + "px",
            visible: true,
            //constraintoviewport: true,
            constraintoviewport: false,
            close: false,
            draggable: false,
            y: 50
        });

        let msg = "　【精神的要求】<br>" +
            "どの程度，精神的かつ知覚的活動が要求されましたか？" +
            "（例：思考，意思決定，計算，記憶，観察，検索など）" +
            "容易／困難，単純／複雑，寛大／過酷だったかを基準にしてください．"+
            "<br><hr>";

        msg +="　【身体的要求】<br>" +
            "どの程度，身体的活動が必要でしたか？" +
            "（例：押す，引く，回す，操作，活動するなど）" +
            "容易／困難，ゆっくり／きびきび，ゆるやか／努力を要する，" +
            "落ち着いていた／骨の折れるものだったかを基準にしてください．"+
            "<br><hr>";

        msg += "　【時間的切迫感】<br>"+
            "作業や要素作業の頻度や速さにどの程度，時間的圧迫感を感じましたか？" +
            "作業ペースはゆっくりしていて暇だったか，それとも急速で大変だったか．" +
            "<br><hr>";

        msg += "　【作業達成度】<br>" +
            "実験者によって設定された作業の達成目標の遂行について，"+
            "どの程度成功したと思いますか？" +
            "この目標達成における作業成績にどのくらい満足していますか？" +
            "<br><hr>";

        msg += "　【努力】<br>" +
            "あなたの作業達成レベルに到達するのにどのくらい一生懸命" +
            "（精神的および身体的に）作業を行わなければなりませんでしたか？" +
            "<br><hr>";

        msg += "　【不満】<br>" +
            "作業中どのくらい不安，落胆，いらいら，ストレス，不快感，" +
            "あるいは安心，喜び，満足，リラックス，自己満足を感じましたか？";

        let divMsg = document.createElement("div");
        divMsg.style.fontSize = "11 pt";
        divMsg.style.lineHeight = 1.3;
        divMsg.innerHTML = msg;

        this.panel.setHeader("説明");
        this.panel.setBody(divMsg);
        this.panel.render("qTable");
        this.resize();
    };

    // -------------------------------------
    // クリック可能なエレメントの作成
    // -------------------------------------
    quesMgr.createClickableDiv = function(label, idx) {
        let cDiv = document.createElement("div");
        cDiv.style.styleFloat = "left";
        cDiv.style.cssFloat = "left";
        cDiv.style.textAlign = "center";
        cDiv.style.width = "100px";
        cDiv.innerHTML = label;
        cDiv.style.cursor = "pointer";
        cDiv.style.border = "solid 2px transparent";

        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        let that = this;
        cDiv.onclick = function() {
            let elms = this.parentNode.getElementsByTagName("div");
            for(let i=0; i<elms.length; i+=1) {
                elms[i].style.border = "solid 2px transparent";
            }
            this.style.border = "solid 2px " + that.hlColor2;
            that.qAnswers[that.crrPage][idx].ans = this.innerHTML;
        };
        cDiv.onmouseover = function() {
            this.style.backgroundColor = that.hlColor1;
        }
        cDiv.onmouseout = function() {
            this.style.backgroundColor = this.parentNode.style.backgroundColor;
        }

        return cDiv;
    };

    // -------------------------------------
    // スライダータグの生成
    // -------------------------------------
    quesMgr.makeSliderTag = function(idx) {
        let divSlider = document.createElement("div");

        let divLeft = document.createElement("div");
        divLeft.style.styleFloat = "left";
        divLeft.style.cssFloat = "left";
        divLeft.innerHTML = "低い";
        divLeft.style.width = "100px";
        divLeft.style.textAlign = "right";

        let divRight = document.createElement("div");
        divRight.style.styleFloat = "left";
        divRight.style.cssFloat = "left";
        divRight.innerHTML = "高い";
        divRight.style.textAlign = "left";
        //divRight.style.marginLeft = "20px";

        let divSliderBG = document.createElement("div");
        divSliderBG.id = "sliderbg-" + this.nf(idx, 2);
        divSliderBG.className = "yui-h-slider";
        divSliderBG.style.styleFloat = "left";
        divSliderBG.style.cssFloat = "left";
        divSliderBG.style.width = "316px";
        //divSliderBG.style.position = "relative";
        //divSliderBG.style.left = "10px";
        //divSliderBG.style.paddingLeft = "-10px";
        //divSliderBG.style.paddingRight = "10px";
        divSliderBG.style.height = "22px";
        divSliderBG.title = "Slider";
        divSliderBG.tabindex = "-1";
        divSliderBG.style.backgroundImage = "url(css/images/nasatlx-black3.png)";
        divSliderBG.style.backgroundPosition = "center center";
        divSliderBG.style.backgroundRepeat = "no-repeat";

        let divSliderThumb = document.createElement("div");
        divSliderThumb.id = "sliderthum-" + this.nf(idx, 2);
        divSliderThumb.className = "yui-slider-thumb";
        let sliderImg = document.createElement("img");
        //sliderImg.src = "http://yui.yahooapis.com/2.8.1/build/slider/assets/thumb-n.gif";
        sliderImg.src = "./yui/build/slider/assets/thumb-n.gif";
        divSliderThumb.appendChild(sliderImg);
        divSliderBG.appendChild(divSliderThumb);

        divSlider.style.height = "70px";
        divSlider.appendChild(divLeft);
        divSlider.appendChild(divSliderBG);
        divSlider.appendChild(divRight);
        divSlider.appendChild(document.createElement("br"));

        return divSlider;
    };

    // ---------------------------------------------------
    // リッカートスケール 説明なし
    // ---------------------------------------------------
    quesMgr.makeLikertNoExp = function(param) {
        let x = param[1] + 'px';
        let y = param[2] + 'px';
        let num = Number(param[3]);
        let name = param[4];
        let elecFlg = param[5];
        let idx, bgcolor;
        let that = this;

        this.qAnswers[this.crrPage].push("");
        idx = this.qAnswers[this.crrPage].length -1;
        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        if (elecFlg.match("elective")) {
            this.qAnswers[this.crrPage][idx].elec = true;
        }

        //全体のDIV
        let div_main = $('<div></div>')
            .css('position', 'relative')
            .css('left', x)
            .css('top', y)
            .css('display', 'inline-block')
            .css('float', 'left');

        //テキストの表示+スペーサ
        $('<div class="text_s"></div>')
            .attr('id',  "P" + that.nf(that.crrPage,2) + "_Q"+that.nf(idx, 4))
            .text(param[6])
            .css('text-align', 'left')
            .css('vertical-align', 'top')
            .css('clear', 'left')
            .css('margin-bottom', '10px')
            .append(
                $('<span></span>').css('margin', '20px')
             )
            .appendTo(div_main);

        //クリッカブルな数字の生成
        let div_nums = $('<div></div>');
        for(let i=0; i<num; i+=1) {
            $('<div></div>')
                .attr('id', "l-" + (i+1))
                .css('float', 'left')
                .css('text-align', 'center')
                .css('width', '30px')
                .html(i+1)
                .css('cursor', 'pointer')
                .css('border', 'solid 2px transparent')
                .click(function() {
                    let elms = $(this).parent().find('div');
                    for(let i=0; i<elms.length; i+=1) {
                        $(elms[i]).css('border', 'solid 2px transparent');
                    }
                    $(this).css('border', 'solid 2px ' + that.hlColor2);
                    that.qAnswers[that.crrPage][idx].ans = $(this).html();
                })
                .mouseover(function() {
                    $(this).css('background-color', that.hlColor1);
                })
                .mouseout(function() {
                    $(this).css('background-color', $(this).parent().css('background-color'));
                })
                .appendTo(div_nums);
        }
        div_nums.appendTo(div_main);

        let lWidth = 360 + (32 * num) + "px";

        let divLikert = $('<div></div>')
            .css('clear', 'both')
            .css('height', '20px')
            //.css('width', lWidth)
            .css('background-color', that.bgColor)
            .append(div_main);

        // ----------- ライン -----------
        let divLine = $('<div></div>')
            .css('clear', 'both')
            //.css('width', lWidth)
            .appendTo(div_main);

        let divBars = $('<div></div>')
        for(let i=0; i<num; i+=1) {
            for(let j=0; j<2; j+=1) {
                let divSC = $('<div></div>')
                    .css('float', 'left')
                    .css('text-align', 'center')
                    .css('width', '16px')
                    .css('height', '10px')
                    .css('margin-bottom', '40px')
                    .css('font-size', '0%');
                if ( (i === 0 && j === 0) || (i===num-1 && j===1)) {
                    divSC.css('border-bottom', 'solid 2px transparent');
                } else {
                    divSC.css('border-bottom', 'solid 2px ' + that.fgColor);
                }
                if (j === 1) {
                    divSC.css('border-left', 'solid 1px ' + that.fgColor);
                } else {
                    divSC.css('border-right', 'solid 1px ' + that.fgColor);
                }
                divSC.css('color', that.bgColor)
                    .html('_')
                    .appendTo(divBars);
            }
        }
        divBars.appendTo(div_main);
        div_main.appendTo('#qTable');
    };

    // ---------------------------------------------------
    // リッカートスケール 説明付き一体化 左詰め 座標指定
    // ---------------------------------------------------
    quesMgr.makeLikertExp2 = function(param) {
        let x = param[1] + 'px';
        let y = param[2] + 'px';
        let num = Number(param[3]);
        let name = param[4];
        let elecFlg = param[5];
        let idx, bgcolor;
        let that = this;

        this.qAnswers[this.crrPage].push("");
        idx = this.qAnswers[this.crrPage].length -1;
        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        if (elecFlg.match("elective")) {
            this.qAnswers[this.crrPage][idx].elec = true;
        }

        //全体のDIV
        let div_main = $('<div></div>')
            .css('position', 'relative')
            .css('left', x)
            .css('top', y)
            .css('display', 'inline-block')
            .css('float', 'left');

        //テキストの表示+スペーサ
        $('<div class="text_s"></div>')
            .attr('id',  "P" + that.nf(that.crrPage,2) + "_Q"+that.nf(idx, 4))
            .text(param[6])
            .css('text-align', 'left')
            .css('vertical-align', 'top')
            .css('clear', 'left')
            .css('margin-bottom', '10px')
            .append(
                $('<span></span>').css('margin', '20px')
             )
            .appendTo(div_main);

        //クリッカブルな数字の生成
        let div_nums = $('<div></div>');
        for(let i=0; i<num; i+=1) {
            $('<div></div>')
                .attr('id', "l-" + (i+1))
                .css('float', 'left')
                .css('text-align', 'center')
                .css('width', '30px')
                .html(i+1)
                .css('cursor', 'pointer')
                .css('border', 'solid 2px transparent')
                .click(function() {
                    let elms = $(this).parent().find('div');
                    for(let i=0; i<elms.length; i+=1) {
                        $(elms[i]).css('border', 'solid 2px transparent');
                    }
                    $(this).css('border', 'solid 2px ' + that.hlColor2);
                    that.qAnswers[that.crrPage][idx].ans = $(this).html();
                })
                .mouseover(function() {
                    $(this).css('background-color', that.hlColor1);
                })
                .mouseout(function() {
                    $(this).css('background-color', $(this).parent().css('background-color'));
                })
                .appendTo(div_nums);
        }
        div_nums.appendTo(div_main);

        let lWidth = 360 + (32 * num) + "px";

        let divLikert = $('<div></div>')
            .css('clear', 'both')
            .css('height', '20px')
            //.css('width', lWidth)
            .css('background-color', that.bgColor)
            .append(div_main);

        // ----------- ライン -----------
        let divLine = $('<div></div>')
            .css('clear', 'both')
            //.css('width', lWidth)
            .appendTo(div_main);

        let divBars = $('<div></div>')
        for(let i=0; i<num; i+=1) {
            for(let j=0; j<2; j+=1) {
                let divSC = $('<div></div>')
                    .css('float', 'left')
                    .css('text-align', 'center')
                    .css('width', '16px')
                    .css('height', '10px')
                    .css('font-size', '0%')
                if ( (i === 0 && j === 0) || (i===num-1 && j===1)) {
                    divSC.css('border-bottom', 'solid 2px transparent');
                } else {
                    divSC.css('border-bottom', 'solid 2px ' + that.fgColor);
                }
                if (j === 1) {
                    divSC.css('border-left', 'solid 1px ' + that.fgColor);
                } else {
                    divSC.css('border-right', 'solid 1px ' + that.fgColor);
                }
                divSC.css('color', that.bgColor)
                    .html('_')
                    .appendTo(divBars);
            }
        }
        divBars.appendTo(div_main);

        
        // ----------- スケールの説明 -----------
        let label;
        if (num === 7) {
            label = [
                param[7],
                param[8],
                param[9],
                param[10],
                param[11],
                param[12],
                param[13]
                ];
        } else if(num === 5) {
            label = [
                param[7],
                param[8],
                param[9],
                param[10],
                param[11]
            ];
        } else if(num === 3) {
            label = [
                param[7],
                param[8],
                param[9]
            ];
        } else if(num === 2) {
            label = [
                param[7],
                param[8],
            ];
        }

        let div_txt = $('<div></div>')
            .css('color', that.fgColor);

        for(let i=0; i<num; i+=1) {
            let lbl = label[i] || '_'
            let fg_color;
            if (lbl === '_') {
                fg_color = that.bgColor;
            } else {
                fg_color = that.fgColor;
            }
            $('<div></div>')
            .css('float', 'left')
            .css('text-align', 'center')
            .css('width', '1em')
            .css('line-height', '1.05em')
            .css('padding-left', '12px')
            .css('padding-right', '11px')
            .css('margin-top', '4px')
            .css('letter-spacing', "-1px")
            .css('font-size', '8pt')
            .css('color', fg_color)
            .html(lbl)
            .appendTo(div_txt);
        }

        $('<div></div>')
            .css('clear', 'both')
            .css('margin', '0 auto')
            .css('border', '0px')
            //.css('width', l_width)
            .css('height', '100px')
            .append(div_txt)
            .appendTo(div_main);
        
        div_main.appendTo('#qTable');
    };

    // ------------------------------------------
    // リッカートスケール 説明付き一体化 左詰め
    // ------------------------------------------
    quesMgr.makeLikertExp = function(param) {
        let num = Number(param[1]);
        let name = param[2];
        let elecFlg = param[3];
        let idx, bgcolor;
        let that = this;

        this.qAnswers[this.crrPage].push("");
        idx = this.qAnswers[this.crrPage].length -1;
        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        if (elecFlg.match("elective")) {
            this.qAnswers[this.crrPage][idx].elec = true;
        }

        //全体のDIV
        let div_main = $('<div></div>')
            .attr('id', 'scale')
            .css('display', 'inline-block')
            .css('float', 'left');

        //テキストの表示+スペーサ
        $('<div class="text_s"></div>')
            .text(param[4])
            .css('text-align', 'left')
            .css('vertical-align', 'top')
            .css('clear', 'left')
            .css('margin-bottom', '10px')
            .append(
                $('<span></span>').css('margin', '20px')
             )
            .appendTo(div_main);

        //クリッカブルな数字の生成
        let div_nums = $('<div></div>');
        for(let i=0; i<num; i+=1) {
            $('<div></div>')
                .attr('id', "l-" + (i+1))
                .css('float', 'left')
                .css('text-align', 'center')
                .css('width', '30px')
                .html(i+1)
                .css('cursor', 'pointer')
                .css('border', 'solid 2px transparent')
                .click(function() {
                    let elms = $(this).parent().find('div');
                    for(let i=0; i<elms.length; i+=1) {
                        $(elms[i]).css('border', 'solid 2px transparent');
                    }
                    $(this).css('border', 'solid 2px ' + that.hlColor2);
                    that.qAnswers[that.crrPage][idx].ans = $(this).html();
                })
                .mouseover(function() {
                    $(this).css('background-color', that.hlColor1);
                })
                .mouseout(function() {
                    $(this).css('background-color', $(this).parent().css('background-color'));
                })
                .appendTo(div_nums);
        }
        div_nums.appendTo(div_main);

        let lWidth = 360 + (32 * num) + "px";

        let divLikert = $('<div></div>')
            .attr('id',  "P" + that.nf(that.crrPage,2) + "_Q"+that.nf(idx, 4))
            .css('clear', 'both')
            .css('height', '20px')
            //.css('width', lWidth)
            .css('background-color', that.bgColor)
            .append(div_main);

        // ----------- ライン -----------
        let divLine = $('<div></div>')
            .css('clear', 'both')
            //.css('width', lWidth)
            .appendTo(div_main);

        let divBars = $('<div></div>')
        for(let i=0; i<num; i+=1) {
            for(let j=0; j<2; j+=1) {
                let divSC = $('<div></div>')
                    .css('float', 'left')
                    .css('text-align', 'center')
                    .css('width', '16px')
                    .css('height', '10px')
                    .css('font-size', '0%')
                if ( (i === 0 && j === 0) || (i===num-1 && j===1)) {
                    divSC.css('border-bottom', 'solid 2px transparent');
                } else {
                    divSC.css('border-bottom', 'solid 2px ' + that.fgColor);
                }
                if (j === 1) {
                    divSC.css('border-left', 'solid 1px ' + that.fgColor);
                } else {
                    divSC.css('border-right', 'solid 1px ' + that.fgColor);
                }
                divSC.css('color', that.bgColor)
                    .html('_')
                    .appendTo(divBars);
            }
        }
        divBars.appendTo(div_main);

        
        // ----------- スケールの説明 -----------
        let label;
        if (num === 7) {
            label = [
                param[5],
                param[6],
                param[7],
                param[8],
                param[9],
                param[10],
                param[11]
                ];
        } else if(num === 5) {
            label = [
                param[5],
                param[6],
                param[7],
                param[8],
                param[9]
            ];
        } else if(num === 3) {
            label = [
                param[5],
                param[6],
                param[7]
            ];
        } else if(num === 2) {
            label = [
                param[5],
                param[6],
            ];
        }

        let div_txt = $('<div></div>')
            .css('color', that.fgColor);

        for(let i=0; i<num; i+=1) {
            let lbl = label[i] || '_'
            let fg_color;
            if (lbl === '_') {
                fg_color = that.bgColor;
            } else {
                fg_color = that.fgColor;
            }
            $('<div></div>')
            .css('float', 'left')
            .css('text-align', 'center')
            .css('width', '1em')
            .css('line-height', '1.05em')
            .css('padding-left', '12px')
            .css('padding-right', '11px')
            .css('margin-top', '4px')
            .css('letter-spacing', "-1px")
            .css('font-size', '8pt')
            .css('color', fg_color)
            .html(lbl)
            .appendTo(div_txt);
        }

        $('<div></div>')
            .css('clear', 'both')
            .css('margin', '0 auto')
            .css('border', '0px')
            //.css('width', l_width)
            .css('height', '100px')
            .append(div_txt)
            .appendTo(div_main);
        
        div_main.appendTo('#qTable');
    };

    // -------------------------------------
    // リッカートスケール その2 (左詰め)
    // -------------------------------------
    quesMgr.makeLikert2 = function(param) {
        let num = Number(param[1]);
        let name = param[2];
        let elecFlg = param[3];
        let idx, bgcolor;
        let that = this;

        this.qAnswers[this.crrPage].push("");
        idx = this.qAnswers[this.crrPage].length -1;
        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        if (elecFlg.match("elective")) {
            this.qAnswers[this.crrPage][idx].elec = true;
        }

        let div_main = $('<div></div>')
            .attr('id', 'scale')
            .css('float', 'left');
            
        for(let i=0; i<num; i+=1) {
            $('<div></div>')
                .attr('id', "l-" + (i+1))
                .css('float', 'left')
                .css('text-align', 'center')
                .css('width', '30px')
                .html(i+1)
                .css('cursor', 'pointer')
                .css('border', 'solid 2px transparent')
                .click(function() {
                    let elms = $(this).parent().find('div');
                    for(let i=0; i<elms.length; i+=1) {
                        $(elms[i]).css('border', 'solid 2px transparent');
                    }
                    $(this).css('border', 'solid 2px ' + that.hlColor2);
                    that.qAnswers[that.crrPage][idx].ans = $(this).html();
                })
                .mouseover(function() {
                    $(this).css('background-color', that.hlColor1);
                })
                .mouseout(function() {
                    $(this).css('background-color', $(this).parent().css('background-color'));
                })
                .appendTo(div_main);
        }

        let lWidth = 360 + (32 * num) + "px";

        let divLikert = $('<div></div>')
            .attr('id',  "P" + that.nf(that.crrPage,2) + "_Q"+that.nf(idx, 4))
            .css('clear', 'both')
            .css('height', '20px')
            .css('width', lWidth)
            .css('background-color', that.bgColor)
            .append(div_main)
            .appendTo('#qTable');
            

        // ----------- ライン -----------
        let divLine = $('<div></div>')
            .css('clear', 'both')
            .css('width', lWidth);

        let divBars = $('<div></div>')
        for(let i=0; i<num; i+=1) {
            for(let j=0; j<2; j+=1) {
                let divSC = $('<div></div>')
                    .css('float', 'left')
                    .css('text-align', 'center')
                    .css('width', '16px')
                    .css('height', '10px')
                    .css('font-size', '0%')
                if ( (i === 0 && j === 0) || (i===num-1 && j===1)) {
                    divSC.css('border-bottom', 'solid 2px transparent');
                } else {
                    divSC.css('border-bottom', 'solid 2px ' + that.fgColor);
                }
                if (j === 1) {
                    divSC.css('border-left', 'solid 1px ' + that.fgColor);
                } else {
                    divSC.css('border-right', 'solid 1px ' + that.fgColor);
                }
                divSC.css('color', that.bgColor)
                    .html('_')
                    .appendTo(divBars);
            }
        }

        divLine.append(divBars)
            .appendTo('#qTable');
    };

    // -------------------------------------
    // リッカートスケールの作成 (1項目)
    // -------------------------------------
    quesMgr.makeLikert = function(param) {
        let num = Number(param[1]);
        let name = param[2];
        let leftText = param[3] || '_';
        let rightText = param[4] || '_';
        let elecFlg = param[5];
        let idx, bgcolor;

        this.qAnswers[this.crrPage].push("");
        idx = this.qAnswers[this.crrPage].length -1;
        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        if (elecFlg.match("elective")) {
            this.qAnswers[this.crrPage][idx].elec = true;
        }

        let divSpace1 = $('<div></div>')
            .attr('id', 'space')
            .css('float', 'left')
            .css('width', '20px')
            .text("　");

        let divSpace2 = $('<div></div>')
            .attr('id', 'space')
            .css('float', 'left')
            .css('width', '20px')
            .text("　");

        if (leftText.match(/_/)) {
            bgcolor = this.bgColor;
        }

        let divLeft = $('<div></div>')
            .attr('id', 'leftText')
            .css('float', 'left')
            .css('width', '150px')
            .css('text-align', 'right')
            .css('color', bgcolor)
            .html(leftText);

        if (rightText.match(/_/)) {
            bgcolor = this.bgColor;
        }

        let divRight = $('<div></div>')
            .attr('id', 'rightText')
            .css('float', 'left')
            .css('width', '150px')
            .css('text-align', 'left')
            .css('color', bgcolor)
            .html(rightText);

        let div_main = $('<div></div>')
            .attr('id', 'scale')
            .css('float', 'left');
            
        let that = this;
        for(let i=0; i<num; i+=1) {
            $('<div></div>')
                .attr('id', "l-" + (i+1))
                .css('float', 'left')
                .css('text-align', 'center')
                .css('width', '30px')
                .html(i+1)
                .css('cursor', 'pointer')
                .css('border', 'solid 2px transparent')
                .click(function() {
                    let elms = $(this).parent().find('div');
                    for(let i=0; i<elms.length; i+=1) {
                        $(elms[i]).css('border', 'solid 2px transparent');
                    }
                    $(this).css('border', 'solid 2px ' + that.hlColor2);
                    that.qAnswers[that.crrPage][idx].ans = $(this).html();
                })
                .mouseover(function() {
                    $(this).css('background-color', that.hlColor1);
                })
                .mouseout(function() {
                    $(this).css('background-color', $(this).parent().css('background-color'));
                })
                .appendTo(div_main);
        }

        let lWidth = 360 + (32 * num) + "px";

        let divLikert = $('<div></div>')
            .attr('id',  "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4))
            .css('margin', "0 auto")
            .css('clear', 'both')
            .css('height', '20px')
            .css('width', lWidth)
            .css('background-color', this.bgColor)
            .append(divLeft)
            .append(divSpace1)
            .append(div_main)
            .append(divSpace2)
            .append(divRight)
            .appendTo('#qTable');
            

        // ----------- ライン -----------
        let divLine = $('<div></div>')
            .css('margin', '0 auto')
            .css('clear', 'both')
            .css('width', lWidth)
            .css('height', '50px');

        let divLeftLine = $('<div></div>')
            .css('float', 'left')
            .css('width', '170px')
            .css('color', this.bgColor)
            .html('_');

        let divRightLine = $('<div></div>')
            .css('float', 'left')
            .css('width', '170px')
            .css('color', this.bgColor)
            .html('_');

        let divBars = $('<div></div>')
        for(let i=0; i<num; i+=1) {
            for(let j=0; j<2; j+=1) {
                let divSC = $('<div></div>')
                    .css('float', 'left')
                    .css('text-align', 'center')
                    .css('width', '16px')
                    .css('height', '10px')
                    .css('font-size', '0%')
                if ( (i === 0 && j === 0) || (i===num-1 && j===1)) {
                    divSC.css('border-bottom', 'solid 2px transparent');
                } else {
                    divSC.css('border-bottom', 'solid 2px ' + this.fgColor);
                }
                if (j === 1) {
                    divSC.css('border-left', 'solid 1px ' + this.fgColor);
                } else {
                    divSC.css('border-right', 'solid 1px ' + this.fgColor);
                }
                divSC.css('color', this.bgColor)
                    .html('_')
                    .appendTo(divBars);
            }
        }

        divLine.append(divLeftLine)
            .append(divBars)
            .append(divRightLine)
            .appendTo('#qTable');
    };

    // -------------------------------------
    // ページボタンの作成
    // -------------------------------------
    quesMgr.makePageButtons = function() {
        if (this.qPages.length === 1) { return; }

        //前のページボタン
        /*
           if (this.crrPage === this.qPages.length-1) {
           }
           */

        let msg = "このページへは戻れません．<br>" +
            "この回答でよいですか？";

        //let msg = "You cannot go back to this page.\n" +
        //        "Would this be okay?";

        //次のページボタン
        let that = this;
        if (this.crrPage < (this.qPages.length -2)) {
            $('<center></center>')
                .append(
                        $('<input type="button"></input>')
                        .attr('id', 'pageButton')
                        .attr('value', "次へ")
                        //.attr('value', "次のページへ (残り" +
                        //      (this.qPages.length - (this.crrPage+1) -1) + "ページ)")
                        //.attr('value', "Next Page")
                        .css('height', '45px')
                        .css('width', '250px')
                        .css('clear', 'both')
                        .css('margin-top', '30px')
                        .unbind()
                        .bind('click', function() {
                            if (that.qAnswers[that.crrPage].length > 0 ) {
                                that.checkAnswers();
                            } else {
                                that.crrPage += 1;
                                that.parseQuestions(that.qPages[that.crrPage]);
                            }
                        })
            ).appendTo('#qTable');

            if(this.pageButtonHidden === true) {
                //nxtButton.style.visibility = "hidden";
                $('#pageButton').css('display', 'none');
            }
        }
        //終了ボタン
        else if (this.crrPage === (this.qPages.length -2)) {
            $('<center></center>')
                .append(
                        $('<input></input>')
                        .attr('type', 'button')
                        .attr('value', '回答を送信する')
                        //.attr('value', 'Submit')
                        .css('height', '45px')
                        .css('clear', 'both')
                        .css('width', '250px')
                        .unbind()
                        .bind('click', function(){
                            that.checkAnswers();
                        })
                       )
                .appendTo('#qTable');
        }
    };

    // -------------------------------------
    // ページタイトルの生成
    // -------------------------------------
    quesMgr.makeTitle = function(text) {
        $('<div class="textTitle"></div>')
            .html(text)
            .css('margin-bottom', 20)
            .css('font-size', "16pt")
            .css('font-weight', 900)
            .css('text-align', 'center')
            .css('background-color', '#e78f08')
            .css('color', 'white')
            .css('padding-top', '5px')
            .css('padding-bottom', '5px')
            .appendTo('#qTable');
    };
    // -------------------------------------
    // 説明文章の生成
    // -------------------------------------
    quesMgr.makeText = function(text) {
        $('<div class="text"></div>')
            .html(text)
            .css('margin-bottom', 20)
            .css('font-size', "14pt")
            .css('font-weight', 900)
            .appendTo('#qTable');
    };

    // -------------------------------------
    // 説明文章の生成(その2)
    // -------------------------------------
    quesMgr.makeText2 = function(param) {
        let dval = param[2] || "block"

            //alert(param + "," + dval);

            $('<div class="text_s"></div>')
            .html(param[1])
            //.css('margin-bottom', 12)
            ///.css('margin-left', 12)
            .css('display', dval)
            .css('text-align', 'left')
            .css('vertical-align', 'top')
            .css('clear', 'left')
            .appendTo('#qTable');
    };

    // ----------------------------------------------
    // リンクの生成
    // ----------------------------------------------
    quesMgr.makeLink = function(param) {
            $('<a></a>')
            .text(param[1])
            .attr('href', param[2])
            .html(param[1])
            .css('display', 'block')
            .css('text-align', 'left')
            .css('vertical-align', 'top')
            .css('clear', 'left')
            .appendTo('#qTable');
    };

    // ----------------------------------------------
    // 説明文章の生成(その3) 親id指定かつ相対座標指定
    // ----------------------------------------------
    quesMgr.makeText3 = function(param) {
        $('<div class="text_s"></div>')
            .css('position', 'absolute')
            .css('left', param[2]+'px')
            .css('top', param[3]+'px')
            .text(param[4])
            .appendTo('#'+param[1].trim());
    };

    // -------------------------------------
    // スケールの説明
    // -------------------------------------
    quesMgr.makeScaleExp = function(num) {
        let l_width = 360 + (32 * num) + "px";

        let div_left = $('<div></div>')
            .css('float', 'left')
            .css('width', '174px')
            .css('color', this.bgColor)
            .html('_');

        let div_right = $('<div></div>')
            .css('float', 'left')
            .css('width', '180px')
            .css('color', this.bgColor)
            .html('_');

        let label;
        if (num === 7) {
            label = ["非常に",
                "かなり",
                "やや",
                "どちらともいえない",
                "やや",
                "かなり",
                "非常に"];
        } else if(num === 5) {
            label = ["かなり",
                "やや",
                "どちらともいえない",
                "やや",
                "かなり"];
        }

        let div_txt = $('<div></div>')
            .css('color', this.fgColor);

        for(let i=0; i<num; i+=1) {
            $('<div></div>')
            .css('float', 'left')
            .css('text-align', 'center')
            .css('width', '1em')
            .css('line-height', '1.05em')
            .css('padding-left', '11px')
            .css('padding-right', '11px')
            .css('letter-spacing', "-2px")
            .css('font-size', '8pt')
            .css('color', this.fgColor)
            .html(label[i])
            .appendTo(div_txt);
        }

        $('<div></div>')
            .css('clear', 'both')
            .css('margin', '0 auto')
            .css('border', '0px')
            .css('width', l_width)
            .css('height', '100px')
            .append(div_left)
            .append(div_txt)
            .append(div_right)
            .appendTo('#qTable');
    };

    // -------------------------------------
    // スケールの説明 その2
    // -------------------------------------
    quesMgr.makeScaleExp2 = function(param) {
        let num = Number(param[1]);
        let l_width = 360 + (32 * num) + "px";

        let label;
        if (num === 7) {
            label = [
                param[2],
                param[3],
                param[4],
                param[5],
                param[6],
                param[7],
                param[8]
                ];
        } else if(num === 5) {
            label = [
                param[2],
                param[3],
                param[4],
                param[5],
                param[6]
            ];
        } else if(num === 3) {
            label = [
                param[2],
                param[3],
                param[4]
            ];
        }

        let div_txt = $('<div></div>')
            .css('color', this.fgColor);

        for(let i=0; i<num; i+=1) {
            let lbl = label[i] || '_'
            let fg_color;
            if (lbl === '_') {
                fg_color = this.bgColor;
            } else {
                fg_color = this.fgColor;
            }
            $('<div></div>')
            .css('float', 'left')
            .css('text-align', 'center')
            .css('width', '1em')
            .css('line-height', '1.05em')
            .css('padding-left', '12px')
            .css('padding-right', '11px')
            .css('margin-top', '4px')
            .css('letter-spacing', "-2px")
            .css('font-size', '8pt')
            .css('color', fg_color)
            .html(lbl)
            .appendTo(div_txt);
        }

        $('<div></div>')
            .css('clear', 'both')
            .css('margin', '0 auto')
            .css('border', '0px')
            //.css('width', l_width)
            .css('height', '100px')
            .append(div_txt)
            .appendTo('#qTable');
    };

    // -------------------------------------
    // データの保存
    // -------------------------------------
    quesMgr.saveData = function() {

        let i, j, k, idx, sidx, eidx, files, p, max;
        let sp = 0;
        let rep = 0;
        let sIndex = [];
        let smax = 0;
        let jAns = "";

        //繰り返しページが存在していた場合
        if (this.repFileMgr.showStartPage) {
            sp = this.repFileMgr.showStartPage();
            rep = this.repFileMgr.showNumRepPages();
            sIndex = this.repFileMgr.showSortedIndex();
        }

        //console.log("sp: " + sp + ", rep: " + rep + ", smax: " + smax);

        // (1) 繰り返しページ以外 (前半)
        for(i=0; i<sp; i+=1) {
            for(j=0; j<this.qAnswers[i].length; j+=1) {
                jAns += this.qAnswers[i][j].ans
                    jAns += ",";
                //console.log(i + ": " + jAns);
            }
        }

        // (2) 繰り返しページ
        smax = sIndex.length;
        if (smax > 0) {
            for(i=0; i<smax; i+=1) {
                for(p=sp; p<(sp+rep); p+=1) {
                    idx = sIndex[i]*rep + p;
                    //console.log(idx);
                    for(j=0; j<this.qAnswers[idx].length; j+=1) {
                        jAns += this.qAnswers[idx][j].ans
                            jAns += ",";
                        //console.log(jAns);
                    }
                }
            }
        }

        // (3) 繰り返しページ以外 (後半)
        for(i=(sp+smax*rep); i<this.qAnswers.length; i+=1) {
            for(j=0; j<this.qAnswers[i].length; j+=1) {
                jAns += this.qAnswers[i][j].ans
                    jAns += ",";
            }
        }


        //繰り返しページが存在していた場合
        if (this.repFileMgr.showStartPage) {
            // (4) ファイル提示順序
            files = this.repFileMgr.showAllFnames();
            jAns += "provided: ";
            for(i=0; i<files.length; i+=1) {
                jAns += files[i];
                jAns += " ";
            }
            jAns += ",";

            // (5) ファイル保存順序
            files = this.repFileMgr.showSortedFnames();
            jAns += "saved: ";
            for(i=0; i<files.length; i+=1) {
                jAns += files[i];
                jAns += " ";
            }
        }

        //alert(jAns);

        let cDate = new Date();
        let tYear = cDate.getFullYear();
        let tMonth = this.nf(cDate.getMonth()+1, 2);
        let tDate = this.nf(cDate.getDate(), 2);
        let tHour = this.nf(cDate.getHours(), 2);
        let tMin = this.nf(cDate.getMinutes(), 2);
        let tSec = this.nf(cDate.getSeconds(), 2);
        let endDate = tYear + "-" + tMonth + "-" + tDate + "_" +
            tHour + "-" + tMin + "-" + tSec;

        this.writeCookie("status", "finish", 60);

        let ret = $.ajax({
            //url: proxyURL + "addComment.php?",
            //url: "saveQuesData.php?",
            type: "POST",
            url: "php/saveQuesDataPost.php",
            data:{
                gid: this.gid,
                startDate: this.startDate,
                endDate: endDate,
                val: jAns
            },
            async: false,
            complete: function() {
            }
        }).responseText;
    };

    // -------------------------------------
    // 回答データのチェック
    // -------------------------------------
    quesMgr.checkAnswers = function() {

        let elm;
        let flgEmptyReqAnswer = false;
        let flgEmptyElecAnswer = false;
        let that = this;
        let msg = "";

        console.log(this.qAnswers);

        for(let i=0; i<this.qAnswers[this.crrPage].length; i+=1) {
            elm = $('#P'+that.nf(that.crrPage, 2)+"_Q"+that.nf(i,4));
            elm.css('background-color', that.bgColor);

            //回答が空だった場合
            if (this.qAnswers[this.crrPage][i].ans === "") {
                //必須項目が空の場合
                if (!this.qAnswers[this.crrPage][i].elec) {
                    flgEmptyReqAnswer = true;
                    elm.css('background-color', that.hlColor3);
                    if (elm.attr('class') === 'checkbox')
                        elm.css('box-shadow', '0 5px 20px rgba(251, 152, 11, 1.0)');
                }

                //非必須項目が空の場合
                else if (this.qAnswers[this.crrPage][i].elec) {
                    flgEmptyElecAnswer = true;
                    elm.css('background-color', that.hlColor4);
                    if (elm.attr('class') === 'checkbox')
                        elm.css('box-shadow', '0 5px 20px rgba(152, 251, 11, 1.0)');
                }
            }
        }

        //必須項目が未入力のとき
        if (flgEmptyReqAnswer) {
            msg += '<span class="ui-icon ui-icon-alert" style="float:left; margin:6px 6px 0px 0;"></span>';
            msg += "未入力の項目があります<br>";
            $("#dialogEmp")
                .html(msg)
                .dialog({
                    resizable: false,
                    height: 250,
                    width: 400,
                    modal: true,
                    buttons: {
                        "戻る": function() {
                            $(this).dialog("close");
                        }
                    }
                });
        }
        //非必須項目が未入力のとき
        else {
            msg = "このページへは戻れません．<br>" +
                "この回答でよいですか？<br><br>";

            if (this.flgNasaTLX) {
                msg += '<span class="ui-icon ui-icon-alert" style="float:left; margin:6px 6px 0px 0;"></span>';
                msg += "動かしていないスライダがあります<br>";
            }

            //ソータブル項目で未入力があったとき
            if (this.flgNoMovedSortableText) {
                msg += '<span class="ui-icon ui-icon-alert" style="float:left; margin:6px 6px 0px 0;"></span>';
                msg += "項目が移動されていません<br>";
            }

            //必須項目が埋まっていて，非必須項目が空のとき
            if (flgEmptyElecAnswer) {
                msg += '<span class="ui-icon ui-icon-alert" style="float:left; margin:6px 6px 0px 0;"></span>';
                msg += "未記入の項目があります<br>";
                //let msg = "Some fields are not filled.\n"
                //           + "Would this be okay?";
            }

            $("#dialogCnf")
                .html(msg)
                .dialog({
                    resizable: false,
                    height: "auto",
                    width: 400,
                    modal: true,
                    buttons: {
                        "進む": function() {
                            $(this).dialog("close");
                            if (that.flgNasaTLX && flgEmptyReqAnswer) {
                                for(let i=0; i<that.qAnswers[that.crrPage].length; i+=1) {
                                    if (that.qAnswers[that.crrPage][i].ans === "") {
                                        that.qAnswers[that.crrPage][i].ans = 50;
                                    }
                                }
                                that.flgNasaTLX = false;
                            }
                            if (that.crrPage === (that.qPages.length -2)) {
                                that.saveData();
                            }
                            that.flgNoMovedSortableText = false;
                            that.crrPage += 1;
                            that.parseQuestions(that.qPages[that.crrPage]);
                        },

                        "戻る": function() {
                            $(this).dialog("close");
                        }
                    }
                });
        }
    };

    // -------------------------------------
    // ウィンドウサイズの取得
    // -------------------------------------
    quesMgr.getWinSize = function() {
        let ua = navigator.userAgent;
        let w, h;
        let nHit = ua.indexOf("MSIE");
        let bIE = (nHit >=  0);
        let bVer6 = (bIE && ua.substr(nHit+5, 1) === "6");
        let bStd = (document.compatMode && document.compatMode==="CSS1Compat");

        // 標準モードかどうか
        if (bIE) {
            if (bVer6 && bStd) {
                w = document.documentElement.clientWidth;
                h = document.documentElement.clientHeight;
            } else {
                w = document.body.clientWidth;
                h = document.body.clientHeight;
            }
        } else {
            w = window.innerWidth;
            h = window.innerHeight;
        }

        return {width: w, height:h};
    };

    // -------------------------------------
    // クッキーオンオフチェック
    // -------------------------------------
    quesMgr.checkCookie = function() {
        let key = "test";
        this.writeCookie(key, 1, 1);
        if (this.readCookie(key) == "") {
            return false;
        } else {
            this.clearCookie(key);
            return true;
        }
    };

    // -------------------------------------
    // ラジオボタンの作成
    // -------------------------------------
    quesMgr.makeRadioButton = function(param) {
        let idx, values, max, i,
        that = this, idval;

        this.qAnswers[this.crrPage].push("");
        idx = this.qAnswers[this.crrPage].length -1;
        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        values = param[1].replace(/\"/g, "");
        values = values.replace(/^ /, "").split(/ +/);

        idval = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);

        $('<div></div>')
            .attr('id', idval)
            .css('position', 'relative')
            .css('float', 'left')
            .css('display', param[2])
            .appendTo('#qTable');

        max = values.length;
        for(i=0; i<max; i+=1) {
            $("<div></div>")
                .append(
                        $("<input type='radio'></input>")
                        .attr('name', 'nm'+idval)
                        //.attr('type', 'radio')
                        .attr('value', values[i])
                        .unbind()
                        .bind('click', function(){
                            //alert($(this).attr('value'));
                            that.qAnswers[that.crrPage][idx].ans = $(this).attr('value');
                        }))
            .css('position', 'absolute')
                .css('width', '200px')
                .css('left', (i*200+50) + "px")
                .append(values[i])
                //.appendTo('#qTable');
                .appendTo('#'+idval);
        }
    };

    // -------------------------------------
    // インラインフレームの作成
    // -------------------------------------
    quesMgr.makeIframe = function(param) {
        let that = this,
        fileName;

        if (param[1].match(/randFile|fixFile/)) {
            fileName = this.repFileMgr.getFname();
        } else {
            fileName = param[1].replace(/^\s+/, "");
        }

        $("<div id='ifr' align='center'></div>")
            .appendTo('#qTable');

        $("<iframe></iframe>")
            .attr('align', 'middle')
            .attr('src', "./" + fileName + "/index.html")
            .attr('scrolling', 'no')
            .css('width', 800) 
            .css('height', 600)
            .css('border', 0)
            .appendTo('#ifr');
    };

    // -------------------------------------
    // ソータブルテキストの作成
    // -------------------------------------
    quesMgr.makeSortableText = function(param) {
        let idx, values, max, i,
        that = this, idval, defAns;

        this.qAnswers[this.crrPage].push("");
        idx = this.qAnswers[this.crrPage].length -1;
        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        if (param[3].match("elective")) {
            this.qAnswers[this.crrPage][idx].elec = true;
        }

        values = param[1].replace(/\"/g, "");
        values = values.replace(/^ /, "").split(/ +/);

        idval = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);

        $("<div></div>")
            .appendTo('#qTable')
            .css('height', '130px')
            .css('width', '400px')
            .css('padding', '10px')
            .css('margin-left', '200px')
            .css('margin-right', 'auto')
            .css('background', '#F0F0F0')
            .append( $("<ul></ul>")
                    .attr('id', 'sortRank')
                    .css('list-style-type', 'none')
                    .css('margin', '0')
                    .css('width', '65px')
                    .css('float', 'left'))
            .append( $("<ul></ul>")
                    .attr('id', idval)
                    .css('margin', '0')
                    .css('list-style-type', 'none')
                    .css('width', '250px')
                    .css('float', 'left')
                    .css('padding', 0));

        max = values.length;
        for(i=0; i<max; i+=1) {
            $("<li align='left'></li>")
                .attr('class', 'ui-state-default')
                .css('margin', '0px 3px 3px 3px')
                .css('padding', '10px')
                .css('height', '20px')
                .css('font-size', '20px')
                //.append("<span>" + (i+1) + "位</span>")
                .append((i+1)+"位")
                .appendTo('#sortRank');

            $("<li align='left'></li>")
                .attr('class', 'ui-state-default')
                .css('margin', '0 3px 3px 3px')
                .css('padding', '10px')
                .css('height', '20px')
                .css('font-size', '20px')
                .css('cursor', 'pointer')
                //	.append($("<span></span>")
                //		.attr('class', 'ui-icon ui-icon-arrowthick-2-n-s')
                //		.css('margin-left', '-1.3em')
                //	       )
                .append("<span>" + values[i] + "</span>")
                .appendTo('#'+idval);
        }

        $("#"+idval).sortable({
            placeholder: "ui-state-highlight",
            update: function(event, ui) {
                let itemOrder = param[2] + " ";
                //console.log(jQuery.makeArray($("li span:last-child")));
                jQuery.each($("li span:last-child"), function() {
                    itemOrder += $(this).html() + " ";
                });
                console.log('"' + itemOrder + '"');
                that.qAnswers[that.crrPage][idx].ans = itemOrder;
                that.flgNoMovedSortableText = false;
                //console.log($("li span:last-child"));
            }
        });
        $("#"+idval).disableSelection();

        //デフォルトの回答を設定
        this.flgNoMovedSortableText = true;
        defAns = param[2] + " ";
        jQuery.each($("li span:last-child"), function() {
            defAns += $(this).html() + " ";
        });
        this.qAnswers[that.crrPage][idx].ans = defAns;
    };

    // -------------------------------------
    // ビデオファイルの埋め込み
    // -------------------------------------
    quesMgr.embedVideo = function(id, fileName) {
        let num = 0;

        jwplayer(id).setup({
            flashplayer: "conf/player.swf",
            file: "conf/video/" + fileName,
            volume: 100,
            width: 200,
            height: 150,
            'controlbar.position': "none",
            //'controlbar.position': "bottom",
            'bufferlength': 40,
            icons: false,
            events: {
                onReady: function() {
                    let that = this;
                    $('#btn-'+id)
                        .unbind()
                        .bind('click', function(){that.play();})

                        $('#btn-'+id)
                        .html('<img src="css/images/play.png">');

                    $('#msg-'+id)
                        .html("(再生回数：" + num + "回)");
                },
                onComplete: function() {
                    //alert("ビデオが終了しました．");
                    //$('#pageButton').css('visibility', 'visible');
                    //$('#msg-'+id).html("ビデオが終了しました．【もう一度再生する】");
                    $('#msg-'+id).html("(再生回数:" + num + "回)");

                    $('#btn-'+id)
                        .html('<img src="css/images/play.png">');
                },
                /*
                   onBufferFull: function() {
                   $('#pageButton').css('visibility', 'visible');
                   },
                   */
                /*
                   onBuffer: function() {
                //alert('しばらくお待ちください．');
                $('#vmsg').html("しばらくお待ちください．");
                },
                */
                onBufferChange: function() {
                    $('#msg-'+id).html("しばらくお待ちください ("+
                            Math.floor(this.getBuffer()) + "％)");
                },
                onPlay: function() {
                    num += 1;
                    //this.getState();
                    $('#msg-'+id).html("再生中");
                    $('#btn-'+id)
                        .html('<img src="css/images/pause.png">');
                },
                onPause: function() {
                    $('#msg-'+id).html("一時停止中");
                    $('#btn-'+id)
                        .html('<img src="css/images/play.png">');
                    //$('#vmsg').html("クリックして再生してください．");
                    //停止しないようにする
                    //this.play();
                }
            }
        });
    };

    // -------------------------------------
    // クッキーへの情報書き込み
    // -------------------------------------
    quesMgr.writeInfoCookie = function() {
        //gidの書き込み
        this.writeCookie("gid", this.gid, 60);

        //開始時刻のクッキー書き込み
        this.writeCookie("startDate", this.startDate, 60);
    };

    // -------------------------------------
    // ランダムな文字列生成
    // -------------------------------------
    quesMgr.randobet = function(n, b) {
        b = b || '';
        let a = 'abcdefghijklmnopqrstuvwxyz'
            + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            + '0123456789'
            + b;
        a = a.split('');
        let s = '';
        for (let i = 0; i < n; i++) {
            s += a[Math.floor(Math.random() * a.length)];
        }
        return s;
    };

    // -------------------------------------
    // ランダムな文字列生成
    // -------------------------------------
    quesMgr.makeStartDate = function() {
        let cDate = new Date();
        let tYear = cDate.getFullYear();
        let tMonth = this.nf(cDate.getMonth()+1, 2);
        let tDate = this.nf(cDate.getDate(), 2);
        let tHour = this.nf(cDate.getHours(), 2);
        let tMin = this.nf(cDate.getMinutes(), 2);
        let tSec = this.nf(cDate.getSeconds(), 2);
        let startDate = tYear + "-" + tMonth + "-" + tDate + "_" +
            tHour + "-" + tMin + "-" + tSec;

        return startDate;
    };

    // -------------------------------------
    // ソータブルビデオの作成
    // -------------------------------------
    quesMgr.makeSortableVideo = function(param) {
        let idx, values, max, i, j, x, y, x0, y0, mod,
        that = this, idval, defAns,
        cols = 3, elm,
        pv, ph, w, hh, hv, my, f, h0, w0, mr, taw,
        r1, r2, tmp;

        this.qAnswers[this.crrPage].push("");
        idx = this.qAnswers[this.crrPage].length -1;
        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        if (param[3].match("elective")) {
            this.qAnswers[this.crrPage][idx].elec = true;
        }

        values = param[1].replace(/\"/g, "");
        values = values.replace(/^ /, "").split(/ +/);

        idval = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);

        $("<div></div>")
            .attr('id', 'sortableFrame')
            .appendTo('#qTable')
            .css('width', '700px')
            .css('height', '800px')
            .css('padding', '10px')
            .css('margin-left', '80px')
            .css('margin-right', 'auto')
            .append( $("<ul></ul>")
                    .attr('id', idval)
                    .addClass('sortable-item')
                    .css('margin', '0')
                    .css('list-style-type', 'none')
                    .css('width', '700px')
                    .css('padding', 0));

        // ================= ラベル部分 =================
        x0 = $('#sortableFrame').position().left;
        y0 = $('#sortableFrame').position().top;
        x0 += 90, y0 += 15;
        x = x0, y = y0;

        //配置の設定
        ph = 5, pv = 10, w = 210, hh = 20, hv = 220;
        my = 0, mr = 5, mt = 35, f = 14, taw=(w-2*pv);

        // ---- .ui-state-highlight-video の CSS設定値 ----
        // width: (w + (ph+1)*2)
        // height: (hv + (pv+1)*2) )
        // margin-top: mt
        //

        //if(jQuery.browser.msie){
        if (!$.support.noCloneChecked) {
            //w += (ph+1) * 2;
            w += (ph+1)*2;
            hh += (ph+1)*2 +1;
            my = -((ph+1)*2);
        }

        max = values.length;
        for(i=0; i<max; i+=1) {
            $('#sortableFrame')
                .append($("<div>" + (i+1) + "位</div>")
                        .attr('class', 'ui-state-default')
                        .attr('align', 'center')
                        .css('position', "absolute")
                        .css('padding', ph)
                        .css('left', x)
                        .css('top', y)
                        .css('width', w)
                        .css('height', hh)
                        .css('font-size', '16px')
                       );

            x += ( w + (ph+1)*2 + mr + my);
            if ( (i+1) % cols == 0) {
                x = x0;
                y += hv + ((pv+1)*2) + mt;
            }
        }

        // ================= アイテムをランダムな順に =================
        max = values.length;
        for(i=0; i<max*2; i+=1) {
            r1 = Math.round(Math.random()*(max-1));
            r2 = Math.round(Math.random()*(max-1));
            tmp = values[r1];
            values[r1] = values[r2];
            values[r2] = tmp;
        }

        // ================= ソートアイテム部分 =================
        w -= pv;
        //if(jQuery.browser.msie){
        if (!$.support.noCloneChecked) {
            w += pv;
            mt += 4;
        }

        max = values.length;
        for(i=0; i<max; i+=1) {
            $("<li align='left'></li>")
                .attr('class', 'ui-state-default')
                .css('width', w+'px')
                .css('height', hv+'px')
                .css('margin-top', mt+'px')
                .css('margin-right', mr+'px')
                .css('padding', pv+'px')
                .css('font-size', f+'px')
                .css('cursor', 'pointer')
                .css('float', 'left')
                .append("映像" + (i+1) +
                        "<span id='video" + i + "'></span>")
                .append("<span id='btn-video" + i + "'></span>")
                .append("<span id='msg-video" + i + "'></span>")
                .append($('<textarea></textarea>')
                        .css('width', taw+'px')
                        .css('height', (f*2)+'px')
                        .css('overflow', 'hidden')
                        .unbind()
                        .bind('click', function() {
                            $(this).focus();
                        })
                        .bind('focusout', function() {
                            let userMemo = [], itemOrder, i;
                            jQuery.each($("li textarea"), function() {
                                userMemo.push($(this).attr('value'));
                            });

                            itemOrder = param[2] + " ";
                            i = 0;
                            jQuery.each($("li span:last-child"), function() {
                                itemOrder += $(this).attr('id') + "(" + userMemo[i]+ ") ";
                                i += 1;
                            });
                            console.log('"' + itemOrder + '"');
                            that.qAnswers[that.crrPage][idx].ans = itemOrder;
                        }))
                        .append("<span id='" + values[i] + "'></span>")
                            .appendTo('#'+idval);

                        $('#btn-video'+i)
                            .css('position', 'asboslute')
                            .css('margin-top', '10px')
                            .append('<img src="css/images/play.png">');

                        $('#msg-video'+i)
                            .css('font-weight', 'normal')
                            .css('font-size', '12px')
                            .css('margin-left', '10px');

                        this.embedVideo("video"+i, values[i]);
        }

        $("#"+idval).sortable({
            placeholder: "ui-state-highlight-video",
            update: function(event, ui) {
                let userMemo = [], itemOrder, i;
                jQuery.each($("li textarea"), function() {
                    userMemo.push($(this).attr('value'));
                });

                itemOrder = param[2] + " ";
                i = 0;
                //console.log(jQuery.makeArray($("li span:last-child")));
                jQuery.each($("li span:last-child"), function() {
                    //itemOrder += $(this).html() + " ";
                    itemOrder += $(this).attr('id') + "(" + userMemo[i]+ ") ";
                    i += 1;
                });
                console.log('"' + itemOrder + '"');

                that.qAnswers[that.crrPage][idx].ans = itemOrder;
                that.flgNoMovedSortableText = false;
                //console.log($("li span:last-child"));
            }
        });
        $("#"+idval).disableSelection();

        //デフォルトの回答を設定
        this.flgNoMovedSortableText = true;
        defAns = param[2] + " ";
        jQuery.each($("li span:last-child"), function() {
            //defAns += $(this).html() + " ";
            defAns += $(this).attr('id') + " ";
        });
        this.qAnswers[that.crrPage][idx].ans = defAns;
    };
