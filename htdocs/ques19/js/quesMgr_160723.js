//
// アンケートマネージャ
//
// 2016-07-22
// Todo:
//  ok - confirm()の代わりにJQ UIのDialogを使う
//  ok - electiveのチェックが動作しない問題の解決
//  ok - リッカートスケールの度合い表示がずれる問題の解決
//  - imageに対してもRepeatがきくように改良
//  
var quesMgr = {};

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
    this.hlColor3 = "#f8cfb8";
    this.hlColor4 = "#f8cfb8";

    this.gid = this.randobet(10);
    this.startDate = this.makeStartDate();

    this.panelWidth = 320;

    //クッキーが設定されていなかったら中断
    if (!this.checkCookie()) {
        var msg = "ブラウザのcookieがオフになっています．<br>";
        msg += "cookieをオンにしてください．";
        //var msg = "Please enable cookies.";
        this.showErrorMessage(msg);
        return false;
    }

    /*
    //実験IDを取得
    if ((this.gid = this.readCookie("gid")) === "") {
    var msg = "実験に参加していない可能性があります．<br><br>";
    msg += "<a href=\"start.html\">実験説明ページへ</a>";
    this.showErrorMessage(msg);
    return false;
    }

    //実験開始時間を取得
    if ((this.startDate = this.readCookie("startDate")) === "") {
    var msg = "実験に参加していない可能性があります．<br><br>";
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

    YAHOO.util.Event.addListener(window, 'resize', this.resize);
};

// ------------------------------
// ヘッダー
// ------------------------------
quesMgr.makeHeader = function() {
    var div;
    var div = document.createElement("div");
    div.id = "header";
    div.innerHTML = "※ ブラウザの戻る・進む・更新ボタンは押さないでください．";
    div.style.right = "10 %";
    //div.style.width = "350px";
    div.style.height = "15px";
    div.style.textAlign = "right";
    div.style.fontSize = "10 pt";
    //div.style.border = "solid 2px #A00000";
    div.style.marginBottom = "20 px";
    div.appendChild(document.createElement("hr"));

    return div;
};

// ------------------------------
// フッター
// ------------------------------
quesMgr.makeFooter = function() {
    var msg = "※ ブラウザの戻る・進む・更新ボタン" +
        "は押さないでください．";

    //var msg = "*NOTE* Please Do Not Use Your Browsers" +
    //        " Navigational Buttons (Back, Forward, Refresh)";

    $('<div id="footer"></div>')
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
    //var h = parseInt(YAHOO.util.Dom.getClientHeight());
    var w = parseInt(YAHOO.util.Dom.getClientWidth(), 10);
    //var panelX = w - (quesMgr.panelWidth) - 10;
    var panelX = (w-quesMgr.panelWidth) - (w-800)/2 ;

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
    var d = new Date();
    d.setDate(d.getDate() + days);
    document.cookie = key + "=" + escape(value) + ";" +
        "expires=" + d.toGMTString() + ";";
};

// -------------------------------------
// クッキー読み込み
// -------------------------------------
quesMgr.readCookie = function(key) {
    if (key === "") {retrun;}

    var rexp = new RegExp(key + "=(.*?)(?:;|$)");
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
    var d = new Date();
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
    var base = String(num + Math.pow(10, digit));
    var formated = base.substr(base.length-digit, digit);
    return formated;
};

// -------------------------------------
// 質問のロード
// -------------------------------------
quesMgr.loadQuestions = function(fname) {
    var ret = $.ajax({
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
    var qmax, i, rep, files, startIdx, endIdx, numRepPage;

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
    //alert(qPages.length);
};

// -------------------------------------
// 繰り返しページの作成
// -------------------------------------
quesMgr.makePageRepetition = function(startIdx, numRepPages, rep, prop, files) {
    var befPages, aftPages, amax, extPages,
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
        var cnt = 0,
        startPage = startIdx,
        numRepPage = numRepPages,
        sorted = files.slice(0).sort();

        quesMgr.repFileMgr = {
            //カウンタを進める
            getFname: function() {
                var f = files[cnt];
                //console.log(f);
                cnt += 1;
                return f;
            },
            //表示するだけ
            showFname: function(num) {
                var id = num || cnt;
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
                var ary = [],
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
    var qtbl = document.getElementById("qTable");

    qtbl.innerHTML = "";
    this.pageButtonHidden = false;

    //qtbl.appendChild(this.makeHeader());

    document.body.scrollTop = 0;

    var hasFlash = true;
    ques = ques.split("\n");
    for(var i=0; i<ques.length; i+=1) {

        //コメントをスキップ
        if (ques[i].match(/^\/\//)) {
            continue;
    }

    var q = ques[i].replace(/\s+,\s+/g, ",").split(/,/);
    q[q.length-1] = q[q.length-1].replace(/\s+$/, "");
    if( q[0].match("select")) {
        this.makeSelection(q);
    } else if (q[0].match("textArea")) {
        this.makeTextArea(q);
    } else if (q[0].match("scaleExp")) {
        this.makeScaleExp(Number(q[1]));
    } else if (q[0].match("NasaTLX")){
        this.makeNasaTLX();
    } else if (q[0].match("NasaPair")){
        this.makeNasaPair();
    } else if (q[0].match("lickert")){
        this.makeLickert(q);
    } else if (q[0].match("text2")) {
        this.makeSmallText(q);
    } else if (q[0].match("title")) {
        this.makeTitle(q[1]);
    } else if (q[0].match("text1")) {
        this.makeText(q[1]);
    } else if (q[0].match("checkbox")) {
        this.makeCheckBox(q);
    } else if (q[0].match("radio")) {
        this.makeRadioButton(q);
    } else if (q[0].match("image")) {
        this.makeImage(q);
    } else if (q[0].match("music")) {
        this.makeMusic(q);
    } else if (q[0].match("flashCheck")) {
        hasFlash = this.flashCheck();
    } else if (q[0].match("vspace")) {
        this.makeVspace();
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

    if (hasFlash) {
        this.makePageButtons();
        this.makeFooter();
    }
};

// -------------------------------------
// 縦方向のスペースの挿入
// -------------------------------------
quesMgr.makeVspace = function() {
    $("<div id='vspace'></div>")
        .css('height', 40)
        .appendTo('#qTable');
};

// -------------------------------------
// flashプレーヤ有無のチェック
// -------------------------------------
quesMgr.flashCheck = function(param) {
    if (!swfobject.hasFlashPlayerVersion("5.0.0")) {
        var div = document.createElement("div");

        div.innerHTML  = "Adobe Flash Playerがインストールされていません．<br>" +
            "実験ではAdobe Flash Playerが必要になります．<br><br>" +
            "下記の画像をクリックしてAdobe Flash Player<br>" +
            "インストールしてください．<br><br>" +
            "インストール後，再度このページを開いてください．<br><br>" +
            "<a href=\"http://www.adobe.com/go/getflashplayer_jp\">" +
            "<img src=\"http://www.adobe.com/macromedia/" +
            "style_guide/images/160x41_Get_Flash_Player.jpg\">" +
            "</a>";

        /*
           div.innerHTML  = "Please install Adobe Flash Player.<br>" +
           "Click the following link to install Adobe Flash Player.<br>" +
           "After installation, please visit this page again.<br><br>" +
           "<a href=\"http://get.adobe.com/flashplayer/\">" +
           "<img src=\"http://www.adobe.com/macromedia/" +
           "style_guide/images/160x41_Get_Flash_Player.jpg\">" +
           "</a>";
           */

        var qtbl = document.getElementById("qTable");
        qtbl.innerHTML = "";
        qtbl.appendChild(div);

        return false;
    }
    return true;
};

// -------------------------------------
// 音楽の作成
// -------------------------------------
quesMgr.makeMusic = function(param) {
    var divMsc = document.createElement("div");
    var div;

    div = document.createElement("div");
    div.align = "center";
    div.innerHTML = param[2];
    div.style.styleFloat = "left";
    div.style.cssFloat = "left";
    div.style.textAlign = "right";
    div.style.marginLeft = "50px";
    div.style.marginRight = "10px";
    div.style.width = "200px";
    divMsc.appendChild(div);

    div = document.createElement("div");
    //div.align = "center";
    div.align = "left";
    div.id = "qmusic";
    var fileName = param[1].replace(/^\s+/, "");
    div.innerHTML = "<object type=\"application/x-shockwave-flash\"" +
        "data=\"./conf/player_mp3.swf\" " +
        "width=\"200\" height=\"20\">" +
        "<param name=\"movie\"" +
        "value=\"./conf/player_mp3.swf\" />" +
        "<param name=\"bgcolor\" value=\"#ffffff\" />" +
        "<param name=\"FlashVars\"" +
        "value='mp3=./conf/" + fileName + "' />" +
        "</object>";
    div.style.marginBottom = "20px";
    divMsc.appendChild(div);

    var qtbl = document.getElementById("qTable");
    qtbl.appendChild(divMsc);
};

// -------------------------------------
// ビデオの作成
// -------------------------------------
quesMgr.makeVideo = function(param) {
    var that = this,
    fileName,
    flashvars,
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
                var i, max;
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
    var divImg = document.createElement("div");
    divImg.align = "center";
    divImg.id = "qimage";

    var imgName = param[1].replace(/^\s+/, "");

    divImg.innerHTML = "<img src=\"./conf/" + imgName + "\"" +
        " width=" + param[2] + " " +
        " height=" + param[3] + ">";
    divImg.style.marginBottom = "20px";

    var qtbl = document.getElementById("qTable");
    qtbl.appendChild(divImg);
};

// -------------------------------------
// CHECKBOXの作成
// -------------------------------------
quesMgr.makeCheckBox = function(param) {
    var that = this;

    this.qAnswers[this.crrPage].push("");
    var idx = this.qAnswers[this.crrPage].length -1;
    this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

    if (param[2] && param[2].match("elective")) {
        this.qAnswers[this.crrPage][idx].elec = true;
    }

    var fid = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
    var imgId = "cbimg_" + fid;
    var txtId = "cblbl_" + fid;
    var chkFlg = false;
    var chkOffImg = "css/images/checkboxOff.png";
    var chkOnImg = "css/images/checkboxOn.png";

    $("<div></div>")
        .attr("id", fid)
        .css("position", "relative")
        .css("left", "30px")
        //.css("width", "200px")
        .append("<img id='" + imgId + "' src='" + chkOffImg + "'>")
        .append("<span id='" + txtId + "'>" + param[1]+ "</span>")
        .appendTo("#qTable");

    $("#"+txtId)
        .css("position", "relative")
        .css("left", "10px")
        .css("top", "-10px");

    $("#"+imgId)
        .unbind()
        .bind('click', function(){
            if (chkFlg == false) {
                that.qAnswers[that.crrPage][idx].ans = param[1];
                $("#"+imgId).attr("src", chkOnImg);
                chkFlg = true;
            } else {
                that.qAnswers[that.crrPage][idx].ans = "";
                $("#"+imgId).attr("src", chkOffImg);
                chkFlg = false;
            }
        });

    /*
       $("<form></form>")
       .attr("id", fid)
       .css("margin-left", "30px")
       .css("width", "400px")
       .css("height", "50px")
       .appendTo("#qTable");

       $("<input></input>")
       .attr("name", "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4) + "_01")
       .attr("type", "checkbox")
    //.css("background-color", this.bgColor)
    .css("background-color", "#888888")
    .css("width", "50px")
    .css("height", "50px")
    .unbind()
    .bind('click', function(){
//alert(this.checked);
if (this.checked == true) {
that.qAnswers[that.crrPage][idx].ans = param[1];
} else {
that.qAnswers[that.crrPage][idx].ans = "";
}
})
.appendTo("#"+fid);

$("<span>" + param[1] + "<span>")
.css("position", "relative")
.css("top", "-18px")
.appendTo("#"+fid)
*/

/*
   var divCheckBox = document.createElement("form");
   divCheckBox.id = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
   divCheckBox.style.marginLeft = "30px";
   divCheckBox.style.width = "400px";
   divCheckBox.style.height = "20px";

   var divBox = document.createElement("input");
   divBox.name = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4) + "_01";
   divBox.type = "checkbox";
   divBox.style.backgroundColor = this.bgColor;

//divCheckBox.onchange = function() {
var that = this;
divCheckBox.onclick = function() {
//alert(this.elements[0].checked);
if (this.elements[0].checked == true) {
that.qAnswers[that.crrPage][idx].ans = param[1];
} else {
that.qAnswers[that.crrPage][idx].ans = "";
}
};

divCheckBox.appendChild(divBox);
divCheckBox.innerHTML += param[1];

var qtbl = document.getElementById("qTable");
qtbl.appendChild(divCheckBox);
*/
};

// -------------------------------------
// テキストエリアの作成
// -------------------------------------
quesMgr.makeTextArea = function(param) {
    this.qAnswers[this.crrPage].push("");
    var idx = this.qAnswers[this.crrPage].length -1;
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
        .css("left", "30px")
        .css("width", param[1])
        .css("height", param[2])
        .css("margin-bottom", "30px")
        .css("border", "solid 2px #000000")
        .unbind()
        .change(function() {
            var t = this.value;
            t = t.replace(/\"/g, "″");
            t = t.replace(/,/g, "，");
            t = t.replace(/\n+/g, "<br>");
            that.qAnswers[that.crrPage][idx].ans = t;
        })
    .appendTo("#qTable");

    /*
       var div;
       div = document.createElement("textarea");
       div.id = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
       div.value = "";
       div.cols = param[1];
       div.rows = param[2];
       div.style.marginBottom = "50px";
       div.onchange = function() {
       var t = this.value;
       t = t.replace(/\"/g, "″");
       t = t.replace(/,/g, "，");
       t = t.replace(/\n+/g, "<br>");
       that.qAnswers[that.crrPage][idx].ans = t;
       };

       var qtbl = document.getElementById("qTable");
       var cdiv = (document.createElement("center"));
       cdiv.appendChild(div);
       qtbl.appendChild(cdiv);
       qtbl.appendChild(document.createElement("br"));
       */
};

// -------------------------------------
// SELECTの作成
// -------------------------------------
quesMgr.makeSelection = function(param) {
    this.qAnswers[this.crrPage].push("");
    var idx = this.qAnswers[this.crrPage].length -1;
    this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

    var divSelect = document.createElement("div");
    divSelect.id = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
    divSelect.appendChild(document.createElement("form"));
    divSelect.innerHTML = param[3] + "　";
    divSelect.style.marginLeft = "30px";
    divSelect.style.width = "400px";
    divSelect.style.height = "50px";

    var that = this;
    var divSel = document.createElement("select");
    divSel.name = param[1];
    divSel.style.backgroundColor = this.bgColor;
    divSel.onchange = function() {
        that.qAnswers[that.crrPage][idx].ans =
            this.options[this.selectedIndex].value;
    }

    for(var i=4; i<param.length; i+=1) {
        var divOpt = document.createElement("option");
        divOpt.value = param[i];
        divOpt.innerHTML = param[i];
        divSel.appendChild(divOpt);
    }
    divSelect.appendChild(divSel);

    var qtbl = document.getElementById("qTable");
    qtbl.appendChild(divSelect);
};

// -------------------------------------
// NASA-TLXの作成
// -------------------------------------
quesMgr.makeNasaTLX = function() {
    this.flgNasaTLX = true;
    var divNTLX = document.createElement("div");

    var labels = [
        "精神的要求",
        "身体的要求",
        "時間的圧迫感",
        "作業達成度",
        "努力",
        "不満"
    ];

    for(var i=0; i<6; i+=1) {
        this.qAnswers[this.crrPage].push("");
        var idx = this.qAnswers[this.crrPage].length -1;

        var label = document.createElement("div");
        label.id = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
        label.innerHTML = labels[i];
        label.style.height = "30px";
        label.style.width = "140px";
        divNTLX.appendChild(label);
        divNTLX.appendChild(this.makeSliderTag(i));
    }

    var qtbl = document.getElementById("qTable");
    qtbl.appendChild(divNTLX);

    //スペーサ
    var div = document.createElement("div");
    div.style.height = "50px";
    qtbl.appendChild(div);

    //スライダの作成
    var that = this;
    for(var i=0; i<6; i+=1) {
        var slider = YAHOO.widget.Slider.getHorizSlider(
                "sliderbg-"+this.nf(i,2), "sliderthum-"+this.nf(i,2), 0, 299);
        slider.setValue(150, true);
        slider.num = i;
        this.qAnswers[this.crrPage][slider.num] = {ans:"", elec:false};
        slider.subscribe("change", function(oVal){
            if (this.valueChangeSource !== 1) {return;}
            var nVal = Math.round(oVal/3.0);
            that.qAnswers[that.crrPage][this.num].ans = nVal;
        });
    }

    this.makeNasaExpPanel();
};

// -------------------------------------
// NASA-TLXの一対比較(重み用)の作成
// -------------------------------------
quesMgr.makeNasaPair = function() {
    var divNPair = document.createElement("div");

    var labels = [
        "精神的要求",
        "身体的要求",
        "時間的圧迫感",
        "作業達成度",
        "努力",
        "不満"
    ];

    var tmp;
    for(var i=0; i<6; i+=1) {
        for(var j=i+1; j<6; j+=1) {
            this.qAnswers[this.crrPage].push("");
            var idx = this.qAnswers[this.crrPage].length -1;
            var divPair = document.createElement("div");
            divPair.style.clear = "both";
            divPair.style.height = "30px";
            divPair.style.backgroundColor = this.bgColor;

            //if (j % 2 === 0) {
            if( i !== tmp) {
                var divLeft = this.createClickableDiv(labels[i], idx);
                var divRight = this.createClickableDiv(labels[j], idx);
                tmp = i;
            } else {
                var divLeft = this.createClickableDiv(labels[j], idx);
                var divRight = this.createClickableDiv(labels[i], idx);
                tmp = -1;
            }

            var divNum = document.createElement("div");
            divNum.id = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
            divNum.innerHTML = (idx+1) + ".";
            divNum.style.styleFloat = "left";
            divNum.style.cssFloat = "left";
            divNum.style.textAlign = "center";
            divNum.style.width = "30px";
            divNum.style.border = "solid 1px transparent";

            var divCenter = document.createElement("div");
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

        var qtbl = document.getElementById("qTable");
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

        var msg = "　【精神的要求】<br>" +
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

        var divMsg = document.createElement("div");
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
        var cDiv = document.createElement("div");
        cDiv.style.styleFloat = "left";
        cDiv.style.cssFloat = "left";
        cDiv.style.textAlign = "center";
        cDiv.style.width = "100px";
        cDiv.innerHTML = label;
        cDiv.style.cursor = "pointer";
        cDiv.style.border = "solid 2px transparent";

        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        var that = this;
        cDiv.onclick = function() {
            var elms = this.parentNode.getElementsByTagName("div");
            for(var i=0; i<elms.length; i+=1) {
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
        var divSlider = document.createElement("div");

        var divLeft = document.createElement("div");
        divLeft.style.styleFloat = "left";
        divLeft.style.cssFloat = "left";
        divLeft.innerHTML = "低い";
        divLeft.style.width = "100px";
        divLeft.style.textAlign = "right";

        var divRight = document.createElement("div");
        divRight.style.styleFloat = "left";
        divRight.style.cssFloat = "left";
        divRight.innerHTML = "高い";
        divRight.style.textAlign = "left";
        //divRight.style.marginLeft = "20px";

        var divSliderBG = document.createElement("div");
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

        var divSliderThumb = document.createElement("div");
        divSliderThumb.id = "sliderthum-" + this.nf(idx, 2);
        divSliderThumb.className = "yui-slider-thumb";
        var sliderImg = document.createElement("img");
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

    // -------------------------------------
    // リッカートスケールの作成 (1項目)
    // -------------------------------------
    quesMgr.makeLickert = function(param) {
        var num = Number(param[1]);
        var name = param[2];
        var leftText = param[3];
        var rightText = param[4];
        var elecFlg = param[5];
        var idx;

        this.qAnswers[this.crrPage].push("");
        idx = this.qAnswers[this.crrPage].length -1;
        this.qAnswers[this.crrPage][idx] = {ans:"", elec:false};

        if (elecFlg.match("elective")) {
            this.qAnswers[this.crrPage][idx].elec = true;
        }


        var divSpace1 = document.createElement("div");
        divSpace1.id = "space";
        divSpace1.style.styleFloat = "left";
        divSpace1.style.cssFloat = "left";
        divSpace1.style.width = "20px";
        divSpace1.innerHTML = "　";

        var divSpace2 = document.createElement("div");
        divSpace2.id = "space";
        divSpace2.style.styleFloat = "left";
        divSpace2.style.cssFloat = "left";
        divSpace2.style.width = "20px";
        divSpace2.innerHTML = "　";

        var divLeft = document.createElement("div");
        divLeft.id = "leftText";
        divLeft.style.styleFloat = "left";
        divLeft.style.cssFloat = "left";
        divLeft.style.width = "150px";
        divLeft.style.textAlign = "right";
        divLeft.innerHTML = leftText;
        if (leftText.match(/_/)) {
            divLeft.style.color = this.bgColor;
        }

        var divRight = document.createElement("div");
        divRight.id = "rightText";
        divRight.style.styleFloat = "left";
        divRight.style.cssFloat = "left";
        divRight.style.width = "150px";
        divRight.style.textAlign = "left";
        divRight.innerHTML = rightText;
        if (leftText.match(/_/)) {
            divRight.style.color = this.bgColor;
        }

        var divScale = document.createElement("div");
        divScale.id = "scale";
        divScale.style.styleFloat = "left";
        divScale.style.cssFloat = "left";

        var that = this;
        for(var i=0; i<num; i+=1) {
            var divNum = document.createElement("div");
            divNum.id = "l-" + (i+1);
            divNum.style.styleFloat = "left";
            divNum.style.cssFloat = "left";
            divNum.style.textAlign = "center";
            divNum.style.width = "30px";
            divNum.innerHTML = (i+1);
            divNum.style.cursor = "pointer";
            divNum.style.border = "solid 2px transparent";
            divNum.onclick = function() {
                var elms = this.parentNode.getElementsByTagName("div");
                for(var i=0; i<elms.length; i+=1) {
                    elms[i].style.border = "solid 2px transparent";
                }
                this.style.border = "solid 2px " + that.hlColor2;
                that.qAnswers[that.crrPage][idx].ans = this.innerHTML;
            };
            divNum.onmouseover = function() {
                this.style.backgroundColor = that.hlColor1;
            }
            divNum.onmouseout = function() {
                this.style.backgroundColor = this.parentNode.style.backgroundColor;
            }
            divScale.appendChild(divNum);
        }
        var lWidth = 360 + (32 * num) + "px";

        var divLickert = document.createElement("div");
        divLickert.style.margin = "0 auto";
        divLickert.id = "P" + this.nf(this.crrPage,2) + "_Q"+this.nf(idx, 4);
        divLickert.style.clear = "both";
        divLickert.style.height = "20px";
        divLickert.style.width = lWidth;
        divLickert.style.backgroundColor = this.bgColor;
        divLickert.appendChild(divLeft);
        divLickert.appendChild(divSpace1);
        divLickert.appendChild(divScale);
        divLickert.appendChild(divSpace2);
        divLickert.appendChild(divRight);
        //divLickert.appendChild(document.createElement("br"));
        //divLickert.appendChild(document.createElement("br"));
        //divLickert.appendChild(document.createElement("br"));

        var qtbl = document.getElementById("qTable");
        qtbl.appendChild(divLickert);


        // ----------- ライン -----------
        var divLine = document.createElement("div");
        divLine.style.margin = "0 auto";
        //divLine.style.marginBottom = "100px";
        //divLine.style.paddingBottom = "40px";
        divLine.style.clear = "both";
        divLine.style.width = lWidth;
        divLine.style.height = "50px";
        //    if (navigator.appName === "Microsoft Internet Explorer") {
        //	divLine.style.marginBottom = "20px";
        //    }

        var divLeftLine = document.createElement("div");
        divLeftLine.style.styleFloat = "left";
        divLeftLine.style.cssFloat = "left";
        divLeftLine.style.width = "170px";
        divLeftLine.style.color = this.bgColor;
        //divLeftLine.style.color = "transparent";
        divLeftLine.innerHTML = "_";
        //    if (navigator.appName !== "Microsoft Internet Explorer") {
        //	divLeftLine.style.marginBottom = "20px";
        //    }

        var divRightLine = document.createElement("div");
        divRightLine.style.styleFloat = "left";
        divRightLine.style.cssFloat = "left";
        divRightLine.style.width = "170px";
        divRightLine.style.color = this.bgColor;
        //divRightLine.style.color = "transparent";
        divRightLine.innerHTML = "_";

        var divBars = document.createElement("div");
        for(var i=0; i<num; i+=1) {
            for(var j=0; j<2; j+=1) {
                var divSC = document.createElement("div");
                divSC.style.styleFloat = "left";
                divSC.style.cssFloat = "left";
                divSC.style.textAlign = "center";
                divSC.style.width = "16px";
                divSC.style.height = "10px";
                divSC.style.fontSize = "0%";
                if ( (i === 0 && j === 0) || (i===num-1 && j===1)) {
                    divSC.style.borderBottom = "solid 2px transparent";
                } else {
                    divSC.style.borderBottom = "solid 2px " + this.fgColor;
                }
                if (j === 1) {
                    divSC.style.borderLeft = "solid 1px " + this.fgColor;
                } else {
                    divSC.style.borderRight = "solid 1px " + this.fgColor;
                }
                //divSC.style.color = "transparent";
                divSC.style.color = this.bgColor;
                divSC.innerHTML = "_";
                divBars.appendChild(divSC);
            }
        }
        divLine.appendChild(divLeftLine);
        divLine.appendChild(divBars);
        divLine.appendChild(divRightLine);

        qtbl.appendChild(divLine);
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

        var msg = "このページへは戻れません．<br>" +
            "この回答でよいですか？";

        //var msg = "You cannot go back to this page.\n" +
        //        "Would this be okay?";

        //次のページボタン
        var that = this;
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
            /*
               var nxtButton = document.createElement("input");
               nxtButton.type = "button";
               nxtButton.style.height = "45px";
               nxtButton.style.marginLeft = "60px";
               nxtButton.style.clear = "both";
               nxtButton.value = "回答を送信する";
               nxtButton.onclick = function() {
               if (!that.checkAnswers()) {return;}

               if( window.confirm(msg)) {
               that.saveData();
               that.crrPage += 1;
               that.parseQuestions(that.qPages[that.crrPage]);
               }
               }
               var qtbl = document.getElementById("qTable");
               qtbl.appendChild(nxtButton);
               */
        }
    };

    // -------------------------------------
    // ページタイトルの生成
    // -------------------------------------
    quesMgr.makeTitle = function(text) {
        $('<div id="textTitle"></div>')
            .html(text)
            .css('margin-bottom', 20)
            .css('font-size', "16pt")
            .css('font-weight', 900)
            .css('text-align', 'center')
            .css('background-color', '#e78f08')
            .css('color', 'white')
            .css('padding-top', '5px')
            .css('padding-bottom', '5px')
            .appendTo($('#qTable'));
    };
    // -------------------------------------
    // 説明文章の生成
    // -------------------------------------
    quesMgr.makeText = function(text) {
        $('<div id="text"></div>')
            .html(text)
            .css('margin-bottom', 20)
            .css('font-size', "14pt")
            .css('font-weight', 900)
            .appendTo($('#qTable'));
    };

    // -------------------------------------
    // 説明文章の生成(その2)
    // -------------------------------------
    quesMgr.makeSmallText = function(param) {
        var dval = param[2] || "block"

            //alert(param + "," + dval);

            $('<div id="text_s"></div>')
            .html(param[1])
            .css('margin-bottom', 12)
            .css('margin-left', 12)
            .css('display', dval)
            .css('text-align', 'left')
            .css('clear', 'left')
            .appendTo($('#qTable'));
    };

    // -------------------------------------
    // スケールの説明
    // -------------------------------------
    quesMgr.makeScaleExp = function(num) {
        var lWidth = 360 + (32 * num) + "px";

        var divExp= document.createElement("div");
        divExp.style.clear = "both";
        divExp.style.margin = "0 auto";
        divExp.style.border = "0px";
        divExp.style.width = lWidth;
        divExp.style.height = "100px";
        //    if (navigator.appName === "Microsoft Internet Explorer") {
        //	divExp.style.marginBottom = "20px";
        //    }

        var divLeft = document.createElement("div");
        divLeft.style.styleFloat = "left";
        divLeft.style.cssFloat = "left";
        divLeft.style.width = "174px";
        divLeft.style.color = this.bgColor;
        divLeft.innerHTML = "_";
        //    if (navigator.appName !== "Microsoft Internet Explorer") {
        //	divLeft.style.marginBottom = "100px";
        //    }
        //divLeft.style.marginBottom = "100px";

        var divRight = document.createElement("div");
        divRight.style.styleFloat = "left";
        divRight.style.cssFloat = "left";
        divRight.style.width = "180px";
        divRight.style.color = this.bgColor;
        divRight.innerHTML = "_";

        var divTxt = document.createElement("div");
        divTxt.style.color = this.fgColor;
        var label;
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
        for(var i=0; i<num; i+=1) {
            var divSC = document.createElement("div");
            divSC.style.styleFloat = "left";
            divSC.style.cssFloat = "left";
            divSC.style.textAlign = "center";
            divSC.style.width = "1em";
            divSC.style.lineHeight = "1.05em";
            if (navigator.appName === "Microsoft Internet Explorer") {
                divSC.style.paddingLeft = "10px";
                divSC.style.paddingRight = "10px";
            } else {
                divSC.style.paddingLeft = "11px";
                divSC.style.paddingRight = "11px";
            }
            divSC.style.letterSpacing = "-2px";
            //divSC.style.height = "100px";
            divSC.style.fontSize = "8pt";
            divSC.style.color = this.fgColor;
            divSC.innerHTML = label[i];
            divTxt.appendChild(divSC);
        }
        divExp.appendChild(divLeft);
        divExp.appendChild(divTxt);
        divExp.appendChild(divRight);

        var qtbl = document.getElementById("qTable");
        qtbl.appendChild(divExp);
    };

    // -------------------------------------
    // データの保存
    // -------------------------------------
    quesMgr.saveData = function() {

        var i, j, k, idx, sidx, eidx, files, p, max;
        var sp = 0;
        var rep = 0;
        var sIndex = [];
        var smax = 0;
        var jAns = "";

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
                    jAns += ", ";
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
                            jAns += ", ";
                        //console.log(jAns);
                    }
                }
            }
        }

        // (3) 繰り返しページ以外 (後半)
        for(i=(sp+smax*rep); i<this.qAnswers.length; i+=1) {
            for(j=0; j<this.qAnswers[i].length; j+=1) {
                jAns += this.qAnswers[i][j].ans
                    jAns += ", ";
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
            jAns += ", ";

            // (5) ファイル保存順序
            files = this.repFileMgr.showSortedFnames();
            jAns += "saved: ";
            for(i=0; i<files.length; i+=1) {
                jAns += files[i];
                jAns += " ";
            }
        }

        //alert(jAns);

        var cDate = new Date();
        var tYear = cDate.getFullYear();
        var tMonth = this.nf(cDate.getMonth()+1, 2);
        var tDate = this.nf(cDate.getDate(), 2);
        var tHour = this.nf(cDate.getHours(), 2);
        var tMin = this.nf(cDate.getMinutes(), 2);
        var tSec = this.nf(cDate.getSeconds(), 2);
        var endDate = tYear + "-" + tMonth + "-" + tDate + "_" +
            tHour + "-" + tMin + "-" + tSec;

        this.writeCookie("status", "finish", 60);

        var ret = $.ajax({
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

        var elm;
        var flgEmptyReqAnswer = false;
        var flgEmptyElecAnswer = false;
        var that = this;
        var msg = "";

        for(var i=0; i<this.qAnswers[this.crrPage].length; i+=1) {
            elm = document.getElementById("P"+this.nf(this.crrPage, 2)+"_Q"+this.nf(i,4));
            elm.style.backgroundColor = this.bgColor;

            //回答が空だった場合
            if (this.qAnswers[this.crrPage][i].ans === "") {
                //必須項目が空の場合
                if (!this.qAnswers[this.crrPage][i].elec) {
                    flgEmptyReqAnswer = true;
                    elm.style.backgroundColor = this.hlColor3;
                }

                //非必須項目が空の場合
                else if (this.qAnswers[this.crrPage][i].elec) {
                    flgEmptyElecAnswer = true;
                    elm.style.backgroundColor = this.hlColor4;
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
                //var msg = "Some fields are not filled.\n"
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
                                for(var i=0; i<that.qAnswers[that.crrPage].length; i+=1) {
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
        var ua = navigator.userAgent;
        var w, h;
        var nHit = ua.indexOf("MSIE");
        var bIE = (nHit >=  0);
        var bVer6 = (bIE && ua.substr(nHit+5, 1) === "6");
        var bStd = (document.compatMode && document.compatMode==="CSS1Compat");

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
        var key = "test";
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
        var idx, values, max, i,
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
        var that = this,
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
            .css('width', 640)
            .css('height', 480)
            .css('border', 0)
            .appendTo('#ifr');
    };

    // -------------------------------------
    // ソータブルテキストの作成
    // -------------------------------------
    quesMgr.makeSortableText = function(param) {
        var idx, values, max, i,
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
                var itemOrder = param[2] + " ";
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
        var num = 0;

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
                    var that = this;
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
        var a = 'abcdefghijklmnopqrstuvwxyz'
            + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            + '0123456789'
            + b;
        a = a.split('');
        var s = '';
        for (var i = 0; i < n; i++) {
            s += a[Math.floor(Math.random() * a.length)];
        }
        return s;
    };

    // -------------------------------------
    // ランダムな文字列生成
    // -------------------------------------
    quesMgr.makeStartDate = function() {
        var cDate = new Date();
        var tYear = cDate.getFullYear();
        var tMonth = this.nf(cDate.getMonth()+1, 2);
        var tDate = this.nf(cDate.getDate(), 2);
        var tHour = this.nf(cDate.getHours(), 2);
        var tMin = this.nf(cDate.getMinutes(), 2);
        var tSec = this.nf(cDate.getSeconds(), 2);
        var startDate = tYear + "-" + tMonth + "-" + tDate + "_" +
            tHour + "-" + tMin + "-" + tSec;

        return startDate;
    };

    // -------------------------------------
    // ソータブルビデオの作成
    // -------------------------------------
    quesMgr.makeSortableVideo = function(param) {
        var idx, values, max, i, j, x, y, x0, y0, mod,
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
                            var userMemo = [], itemOrder, i;
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
                var userMemo = [], itemOrder, i;
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
