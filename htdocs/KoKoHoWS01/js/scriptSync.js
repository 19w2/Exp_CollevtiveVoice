(function() {
    //pixi 4.5.3
    //let cnt = 0;
    
    //定数
    const NUM_DIGGING = 3,
        WAIT_DURATION = 30, 
        VIB_DURATION = 45,
        RRANGE = 3.49066,
        POINTER_F1 = 68,
        POINTER_F2 = 108,
        POINTER_F3 = 115; 

    //アプリの状態
    let appStatus = "IDLE"
        isSelected = false,
        isDigged = false,
        isOpened = false,
        isShown = false,
        isTouchMode = false,
        ansCounter = 0,
        pointerStep = 0,
        waitCounter = WAIT_DURATION, 
        vibCounter = VIB_DURATION;

    //ログ
    let appLog = []
        alog = {};
    const appStartTime = makeDate();

    //アプリの作成(これが描画のベースになる）
    let app = new PIXI.Application(800, 600, {
        antialias: true,     // アンチエイリアスをON
        backgroundColor: 0xcffcfc // 背景色
        //  transparent:      true,     // 背景を透過にしたい場合
    });

    app.stop();

    // DOMにview追加
    document.getElementById("stage").appendChild(app.view);

    //画面が小さい場合にはCSSでキャンバスを縮小
    if (window.parent.screen.width < 800 ) {
        let elm = document.getElementsByTagName("canvas")[0];
        elm.style.width = window.parent.screen.width + "px";
    }

    //JSONファイルの読み込み
    /*
    let xr = new XMLHttpRequest();
    xr.open("get", "./json/pattern01.json", false);
    //xr.open("get", "./json/pattern02.json", false);
    xr.send(null);
    let pattern = JSON.parse(xr.response).data;
    */

    //JSONファイルの読み込み
    let xr = new XMLHttpRequest();
    xr.open("get", "./php/pattern.php", false);
    xr.send(null);
    const res = JSON.parse(xr.response);
    const pattern = res.data;

    console.log(pattern);

    xr.open("get", "./php/pattern.php?cmd=up", false);
    xr.send(null);

    const pl = pattern.length;
    const POINTER_FRAMES = POINTER_F1 + POINTER_F2 + POINTER_F3/pl;
    //console.log(POINTER_FRAMES);

    //console.log(Math.floor(Math.random()*(pl/2)) + pl/2+1);


    //画像からスプライトを作成
    let mountain = PIXI.Sprite.fromImage('images/mountain.png'),
        road = PIXI.Sprite.fromImage('images/road.png'),
        rockL = [],
        rockR = [],
        bank = [],
        numCards = [],
        goalFlag = PIXI.Sprite.fromImage('images/goalFlag.png'),
        pillar = PIXI.Sprite.fromImage('images/pillar.png'),
        mirror = PIXI.Sprite.fromImage('images/mirror.png'),
        dashboard = PIXI.Sprite.fromImage('images/dashboard.png'),
        pointer = PIXI.Sprite.fromImage('images/pointer.png'),
        handle = PIXI.Sprite.fromImage('images/handle.png'),
        scorebd = PIXI.Sprite.fromImage('images/score.png'),
        startBtn = PIXI.Sprite.fromImage('images/startButton.png');
    
    rockL[0] = PIXI.Sprite.fromImage('images/rockL01.png');
    rockL[1] = PIXI.Sprite.fromImage('images/rockL02.png');
    rockL[2] = PIXI.Sprite.fromImage('images/rockL03.png');
    rockR[0] = PIXI.Sprite.fromImage('images/rockR02.png');
    rockR[1] = PIXI.Sprite.fromImage('images/rockR03.png');
    rockR[2] = PIXI.Sprite.fromImage('images/rockR01.png');

    bank[0] = PIXI.Sprite.fromImage('images/bank.png');
    bank[1] = PIXI.Sprite.fromImage('images/bank.png');
    bank[2] = PIXI.Sprite.fromImage('images/bank.png');

    numCards[0] = PIXI.Sprite.fromImage('images/No1.png');
    numCards[1] = PIXI.Sprite.fromImage('images/No2.png');
    numCards[2] = PIXI.Sprite.fromImage('images/No3.png');

    //テクスチャのロード(アニメーション用)
    let cloudsImg = PIXI.Texture.fromImage('images/clouds.png'),
        pickelImgs = [],
        boxImgs = [],
        voiceMarkImgs = [],
        triangleImgs = [],
        goldImgs = [],
        roadEdgeLimgs = [],
        roadEdgeRimgs = [];

    roadEdgeLimgs[0] = PIXI.Texture.fromImage('images/roadEdgeL01.png');
    roadEdgeLimgs[1] = PIXI.Texture.fromImage('images/roadEdgeL02.png');
    roadEdgeRimgs[0] = PIXI.Texture.fromImage('images/roadEdgeR01.png');
    roadEdgeRimgs[1] = PIXI.Texture.fromImage('images/roadEdgeR02.png');

    voiceMarkImgs[0] = PIXI.Texture.fromImage('images/voiceMark.png');
    voiceMarkImgs[1] = PIXI.Texture.fromImage('images/noFill.png');

    triangleImgs[0] = PIXI.Texture.fromImage('images/triangle01.png');
    triangleImgs[1] = PIXI.Texture.fromImage('images/triangle02.png');
    triangleImgs[2] = PIXI.Texture.fromImage('images/triangle03.png');
    triangleImgs[3] = PIXI.Texture.fromImage('images/triangle04.png');
    triangleImgs[4] = PIXI.Texture.fromImage('images/triangle05.png');
    triangleImgs[5] = triangleImgs[3];
    triangleImgs[6] = triangleImgs[2];
    triangleImgs[7] = triangleImgs[1];

    pickelImgs[0] = PIXI.Texture.fromImage('images/pickel01.png');
    pickelImgs[1] = PIXI.Texture.fromImage('images/pickel02.png');
    pickelImgs[2] = PIXI.Texture.fromImage('images/pickel03.png');
    pickelImgs[3] = PIXI.Texture.fromImage('images/pickel04.png');
    pickelImgs[4] = PIXI.Texture.fromImage('images/pickel05.png');
    pickelImgs[5] = pickelImgs[4];
    pickelImgs[6] = pickelImgs[3];
    pickelImgs[7] = pickelImgs[2];
    pickelImgs[8] = pickelImgs[1];
    pickelImgs[9] = pickelImgs[0];

    boxImgs[0] = PIXI.Texture.fromImage('images/digging01.png');
    boxImgs[1] = PIXI.Texture.fromImage('images/digging02.png');
    boxImgs[2] = PIXI.Texture.fromImage('images/digging03.png');
    boxImgs[3] = PIXI.Texture.fromImage('images/digging04.png');
    boxImgs[4] = PIXI.Texture.fromImage('images/digging05.png');

    goldImgs[0] = PIXI.Texture.fromImage('images/gold.png');
    goldImgs[1] = PIXI.Texture.fromImage('images/noFill.png');
    
    //テクスチャからスプライトの生成
    let cloudTile = new PIXI.extras.TilingSprite(
            cloudsImg, app.renderer.width, 93),
        voiceMark = new PIXI.extras.AnimatedSprite(voiceMarkImgs),
        triangles = [],
        box = new PIXI.extras.AnimatedSprite(boxImgs),
        pickel = new PIXI.extras.AnimatedSprite(pickelImgs),
        gold = new PIXI.extras.AnimatedSprite(goldImgs),
        roadEdgeL = new PIXI.extras.AnimatedSprite(roadEdgeLimgs),
        roadEdgeR = new PIXI.extras.AnimatedSprite(roadEdgeRimgs);

    triangles[0] = new PIXI.extras.AnimatedSprite(triangleImgs);
    triangles[1] = new PIXI.extras.AnimatedSprite(triangleImgs);
    triangles[2] = new PIXI.extras.AnimatedSprite(triangleImgs);

    //音声ファイルのロード
    let sndVoice = [];
    sndVoice[0] = "No1";
    sndVoice[1] = "No2";
    sndVoice[2] = "No3";

    createjs.Sound.registerSound("sounds/No1.mp3", sndVoice[0]);
    createjs.Sound.registerSound("sounds/No2.mp3", sndVoice[1]);
    createjs.Sound.registerSound("sounds/No3.mp3", sndVoice[2]);

    createjs.Sound.registerSound("sounds/dig.mp3", "sndDig");
    createjs.Sound.registerSound("sounds/open.mp3", "sndOpen");

    //Sound Instance
    let sndIns = null;

    //フォントの生成
    let counterText = new PIXI.Text(ansCounter+"/"+pl),
        scoreText = new PIXI.Text("");


    //初期位置の設定
    setupSprite();

    //スプライトをステージに追加
    app.stage.addChild(cloudTile);
    app.stage.addChild(mountain);
    app.stage.addChild(road);
    app.stage.addChild(roadEdgeL);
    app.stage.addChild(roadEdgeR);
    app.stage.addChild(rockL[2]);
    app.stage.addChild(rockL[1]);
    app.stage.addChild(rockL[0]);
    app.stage.addChild(rockR[2]);
    app.stage.addChild(rockR[1]);
    app.stage.addChild(rockR[0]);
    app.stage.addChild(bank[1]);
    app.stage.addChild(bank[0]);
    app.stage.addChild(bank[2]);
    app.stage.addChild(goalFlag);
    app.stage.addChild(triangles[0]);
    app.stage.addChild(triangles[1]);
    app.stage.addChild(triangles[2]);
    app.stage.addChild(numCards[0]);
    app.stage.addChild(numCards[1]);
    app.stage.addChild(numCards[2]);
    app.stage.addChild(box);
    app.stage.addChild(pickel);
    app.stage.addChild(pillar);
    app.stage.addChild(mirror);
    app.stage.addChild(dashboard);
    app.stage.addChild(pointer);
    app.stage.addChild(voiceMark);
    app.stage.addChild(counterText);
    app.stage.addChild(handle);
    app.stage.addChild(scorebd);
    app.stage.addChild(scoreText);
    app.stage.addChild(gold);
    app.stage.addChild(startBtn);


    // ----------------------------------------------
    //状態の更新(デフォルトでspee=1; 60 fps)
    // ----------------------------------------------
    //状態の更新(デフォルトでspee=1; 60 fps)
    //app.ticker.speed = 0.5; //30fps
    app.ticker.add(function() {
        //console.log(app.ticker.deltaTime);
        updateCloud();
        updateStatus();
    });

    //パーツの初期位置設定
    function setupSprite() {
        cloudTile.y = 20;

        mountain.x = 0;
        mountain.y = 45;

        road.x = 0;
        road.y = 130;

        for(let i=0; i<3; i+=1) {
            rockL[i].x = 10 + i*60*1.2;
            rockL[i].y = 400 - i*60*1.5;
            rockL[i].scale.x *= 0.993**(i*60);
            rockL[i].scale.y *= 0.993**(i*60);
            rockL[i].anchor.set(1.0, 1.0);

            rockR[i].x = 790 - i*60*1.2;
            rockR[i].y = 400 - i*60*1.5;
            rockR[i].scale.x *= 0.993**(i*60);
            rockR[i].scale.y *= 0.993**(i*60);
            rockR[i].anchor.set(0.0, 1.0);
        }

        let w = app.renderer.width;
        bank[0].anchor.set(0.5, 0.5);
        bank[1].anchor.set(0.5, 0.5);
        bank[2].anchor.set(0.5, 0.5);
        bank[0].x = w/2-180*0.6;
        bank[0].y = 140;
        bank[1].x = w/2;
        bank[1].y = 130;
        bank[2].x = w/2+180*0.6;
        bank[2].y = 140;
        bank[0].scale.x *= 0.6;
        bank[1].scale.x *= 0.6;
        bank[2].scale.x *= 0.6;
        bank[0].scale.y *= 0.6;
        bank[1].scale.y *= 0.6;
        bank[2].scale.y *= 0.6;

        bank[0].interactive = true;
        bank[1].interactive = true;
        bank[2].interactive = true;
        bank[0].buttonMode = false;
        bank[1].buttonMode = false;
        bank[2].buttonMode = false;
        bank[0].on('click', onBankClick0);
        bank[1].on('click', onBankClick1);
        bank[2].on('click', onBankClick2);
        bank[0].on('touchstart', onBankClick0);
        bank[1].on('touchstart', onBankClick1);
        bank[2].on('touchstart', onBankClick2);

        goalFlag.anchor.set(0.5, 0.5);
        goalFlag.visible = false;

        triangles[0].x = 215;
        triangles[1].x = 400;
        triangles[2].x = 575; 
        numCards[0].x = 215;
        numCards[1].x = 400;
        numCards[2].x = 575;
        for(let i=0; i<3; i+=1) {
            triangles[i].y = 215; 
            triangles[i].anchor.set(0.5, 0.5);
            triangles[i].visible = false;
            triangles[i].stop();
            triangles[i].animationSpeed = 0.3;
            numCards[i].y = 190;
            numCards[i].anchor.set(0.5, 1.0);
            numCards[i].visible = false;
        }

        roadEdgeL.x = 0;
        roadEdgeL.y = 140;

        roadEdgeR.x = 570;
        roadEdgeR.y = 140;

        roadEdgeL.animationSpeed = 0.05;
        roadEdgeR.animationSpeed = 0.05;
        roadEdgeL.stop();
        roadEdgeR.stop();

        pillar.x = -10;
        pillar.y = 0;

        mirror.x = 320;
        mirror.y = -20;

        dashboard.x = -10;
        dashboard.y = 430;

        pointer.anchor.set(0.5,1.0);
        pointer.x = 642;
        pointer.y = 565;
        pointerStep = RRANGE / (pl);
        pointer.rotation = -RRANGE/2;

        handle.x = 290;
        handle.y = 440;

        voiceMark.x = 250;
        voiceMark.y = 450;
        voiceMark.visible = false;
        voiceMark.animationSpeed = 0.08;

        box.visible = false;
        box.y = 270;
        box.anchor.set(0.5, 0.5);

        counterText.x = 460;
        counterText.y = 570;
        counterText.anchor.set(0.5, 0.5);
        let ctStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 38,
            fontWeight: 'bold',
            fill: '#33cccc'
        });
        counterText.setStyle(ctStyle);

        scoreText.x = app.renderer.width/2;
        scoreText.y = app.renderer.height/2 - 80;
        scoreText.anchor.set(0.5, 0.5);
        let stStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 100,
            fontWeight: 'bold',
            fill: '#ff9900'
        });
        scoreText.setStyle(stStyle);
        scoreText.visible = false;

        gold.x = app.renderer.width/2;
        gold.y = app.renderer.height/2+70;
        gold.anchor.set(0.5, 0.5);
        gold.visible = false;
        gold.animationSpeed = 0.02;
        gold.stop();

        scorebd.x = app.renderer.width/2;
        scorebd.y = app.renderer.height/2 - 100;
        scorebd.anchor.set(0.5, 0.5);
        scorebd.visible = false;

        startBtn.x = app.renderer.width/2;
        startBtn.y = app.renderer.height/2;
        startBtn.anchor.set(0.5, 0.5);
        startBtn.interactive = true;
        startBtn.buttonMode = true;
        startBtn.on('touchstart', onStartButtonTouch);
        startBtn.on('click', onStartButtonClick);

        pickel.x = app.renderer.width / 2;
        pickel.y = app.renderer.height / 2;
        pickel.stop();
        pickel.animationSpeed = 0.3;
        pickel.loop = false;
        /*
        pickel.interactive = true;
        pickel.buttonMode = true;
        pickel.on('pointerdown', onPickelClick);
        */
        pickel.anchor.set(0.4, 0.5);
        pickel.visible = false;
        //pickel.onComplete(onPickelAnimFinished);
    }

    //雲の位置更新
    function updateCloud() {
        cloudTile.tilePosition.x += 0.08;
    }

    //ピッケルの更新
    function updatePickel() {
        if(isTouchMode) {
            pickel.x = box.x;
            pickel.y = box.y;
        } else {
            let m = app.renderer.plugins.interaction.mouse.global;
            pickel.x = m.x;
            pickel.y = m.y;
        }
    }

    //岩の更新
    function updateRock() {
        for(let i=0; i<3; i+=1) {
            rockL[i].x -= 1.3;
            rockL[i].y += 1.5;
            rockL[i].scale.x *= 1.008;
            rockL[i].scale.y *= 1.008;
            if (rockL[i].y > 400) {
                rockL[i].x = 200;
                rockL[i].y = 150;
                rockL[i].scale.x = 0.3;
                rockL[i].scale.y = 0.3;
            } 

            rockR[i].x += 1.3;
            rockR[i].y += 1.5;
            rockR[i].scale.x *= 1.008;
            rockR[i].scale.y *= 1.008;
            if (rockR[i].y > 400) {
                rockR[i].x = 600;
                rockR[i].y = 150;
                rockR[i].scale.x = 0.3;
                rockR[i].scale.y = 0.3;
            } 
        }
    }

    //盛土の更新
    function updateBank() {
        //cnt += 1;

        bank[0].y += 1.5;
        bank[0].x -= 0.7;
        bank[2].y += 1.5;
        bank[2].x += 0.7;
        bank[1].y += 1.5;

        bank[2].scale.x *= 1.005; 
        bank[2].scale.y *= 1.005; 
        bank[0].scale.x *= 1.005; 
        bank[0].scale.y *= 1.005; 
        bank[1].scale.x *= 1.005; 
        bank[1].scale.y *= 1.005; 
    }

    //宝箱位置の更新
    function updateBoxPos() {
        if (box.x < 350 ) {
            box.x -= 0.7;
        } else if (box.x > 450) {
            box.x += 0.7;
        }

        box.y += 1.5;
        box.scale.x *= 1.005; 
        box.scale.y *= 1.005; 
    }

    //goalFlagの位置の更新
    function updateGoalFlag() {
        if (goalFlag.y < 250) {
            //cnt += 1;
            //console.log(cnt);
            goalFlag.y += 1.5;
            goalFlag.scale.x *= 1.005;
            goalFlag.scale.y *= 1.005;
            updatePointer();
        } else {
            roadEdgeL.stop();
            roadEdgeR.stop();
        }
    }

    //メーターの更新
    function updatePointer() {
        pointer.rotation += pointerStep/POINTER_FRAMES;
    }

    //アプリの状態制御
    function updateStatus() {
        if (appStatus === "IDLE") {
            if (startBtn.visible === false) {
                appStatus = "GOING1";
            }
        } else if (appStatus === "GOING1") { 
            updateRock();
            updateBank();
            updatePointer();
            if (bank[0].y > 300) {
                appStatus = "WAIT";
                initWait();
            }
        } else if (appStatus === "GOING2") {
            updateRock();
            updatePointer();
            updateBank();
            updateBoxPos();
            if (bank[0].y > 400) {
                if (ansCounter >= pl) {
                    appStatus = "GOAL";
                    initGoal();
                    //console.log(cnt);
                } else {
                    appStatus = "GOING1";
                    initGoing1();
                    //console.log(cnt);
                }
            }
        } else if (appStatus === "WAIT") {
            updateWait();
            if (waitCounter < 0) {
                appStatus = "VOICEVIB_NAVIGATION";
                alog = {}; //ログ保存オブジェクト
                initVoiceVibNavigation();
            }
        } else if (appStatus === "VOICEVIB_NAVIGATION") {
            //console.log(sndIns.playState);
            updateVibNavigation();
            if ( (sndIns.playState === createjs.Sound.PLAY_FINISHED) &&
                 (vibCounter < 0) ){
                appStatus = "SELECTION";
                alog.start_select = new Date().getTime();
                initSelection();
            }
        } else if (appStatus === "SELECTION") {
            updatePickel();
            if (isSelected) {
                appStatus = "DIGGING";
                initDigging();
            }
        } else if (appStatus === "DIGGING") {
            diggController.update();
            if (diggController.status === "OPENED") {
                appStatus = "GOING2";
                initGoing2();
                //console.log(cnt);
            }
        } else if (appStatus === "GOAL") {
            goalController.update();
            //updateGoalFlag();
        }
    }

    //Wait処理
    function updateWait() {
        waitCounter -= 1;
    }
    //ASEによるナビゲーション
    function updateVibNavigation() {
        vibCounter -= 1;
    }

    //Waitの初期化
    function initWait() {
        //pointer.rotation += pointerStep;
        waitCounter = WAIT_DURATION;
        roadEdgeL.stop();
        roadEdgeR.stop();
        for(let i=0; i<3; i+=1) {
            triangles[i].visible = true;
            triangles[i].play();
            numCards[i].visible = true;
        }
    }

    //音声ナビゲーションの初期化
    function initVoiceVibNavigation() {
        //vibCounter = VIB_DURATION;
        vibCounter = 60 * sum(pattern[ansCounter].vib)/1000; //ミリ秒 → 秒 → フレーム 
        //console.log(vibCounter);
        voiceMark.visible = true;
        voiceMark.gotoAndPlay(0);
        let num = pattern[ansCounter].voice -1;
        sndIns = createjs.Sound.play(sndVoice[num]);
        alog.voice_nav = num + 1;
        //振動の生成
        let vibArray = pattern[ansCounter].vib;
        navigator.vibrate(vibArray);
        alog.vib_name = pattern[ansCounter].vib_name;
    }

    //GOING1の初期化 
    function initGoing1() {
        //盛土のリセット
        let w = app.renderer.width;
        
        bank[0].x = w/2-180*0.6;
        bank[0].y = 140;
        bank[1].x = w/2;
        bank[1].y = 130;
        bank[2].x = w/2+180*0.6;
        bank[2].y = 140;
        bank[0].scale.x = 0.6;
        bank[1].scale.x = 0.6;
        bank[2].scale.x = 0.6;
        bank[0].scale.y = 0.6;
        bank[1].scale.y = 0.6;
        bank[2].scale.y = 0.6;

        isSelected = false;
        box.visible = false;
        box.y = 270;
        box.scale.x = 1.0;
        box.scale.y = 1.0;
    }

    //GOALの初期化
    function initGoal() {
        //pointer.rotation += pointerStep;
        isSelected = false;
        box.visible = false;
        bank[0].visible = false;
        bank[1].visible = false;
        bank[2].visible = false;
        goalFlag.x = 400;
        goalFlag.y = 80;
        goalFlag.visible = true;
        saveData();
    }

    //SELECTIONの初期化 
    function initSelection() {
        voiceMark.stop();
        voiceMark.visible = false;
        bank[0].buttonMode = true;
        bank[1].buttonMode = true;
        bank[2].buttonMode = true;
        updatePickel();
        if (!isTouchMode) {
            pickel.visible = true;
        }
    }

    //DIGGINGの初期化 
    function initDigging() {
        ansCounter += 1;
        counterText.setText(ansCounter+"/"+pl);
        pickel.gotoAndPlay(0); 
        createjs.Sound.play("sndDig");
        bank[0].buttonMode = false;
        bank[1].buttonMode = false;
        bank[2].buttonMode = false;
        if (isTouchMode) {
            pickel.visible = true;
        }
    }

    //GOING2の初期化 
    function initGoing2() {
        isShown = false;
        diggController.reset();

        roadEdgeL.play();
        roadEdgeR.play();

        for(let i=0; i<3; i+=1) {
            triangles[i].visible = false;
            triangles[i].stop();
            numCards[i].visible = false;
        }
    }

    //ピッケルをマウスクリックしたとき
    function onPickelClick() {
        //pickel.anchor.set(0.5, 1.0);
        pickel.rotation += 1.0;
    }

    //盛土0をクリックしたとき
    function onBankClick0() {
        if (appStatus !== "SELECTION") {return;}
        isSelected = true;
        box.x = 215;
        addClickLog(1);
    }

    //盛土1をクリックしたとき
    function onBankClick1() {
        if (appStatus !== "SELECTION") {return;}
        isSelected = true;
        box.x = 400;
        addClickLog(2);
    }

    //盛土2をクリックしたとき
    function onBankClick2() {
        if (appStatus !== "SELECTION") {return;}
        isSelected = true;
        box.x = 575;
        addClickLog(3);
    }

    function addClickLog(num) {
        alog.clicked = num;
        alog.end_select = new Date().getTime();
        alog.reaction_time = alog.end_select - alog.start_select;
        //console.log(alog);
        appLog.push(alog);
        console.log(obj2csv());
    }

    //スタートボタンクリック
    function onStartButtonClick() {
        startBtn.visible = false;
        roadEdgeL.play();
        roadEdgeR.play();
    }

    function onStartButtonTouch() {
        isTouchMode = true;
        onStartButtonClick();
    }

    /*
    function onPickelAnimFinished() {
        pickelCounter -= 1;        
        if (pickelCounter <= 0) {
            isDigged = true;
            pickelCounter = NUM_DIGGING;
         } else {
            pickel.gotoAndPlay(0);
         }
    }
    */

    //Waitマネージャ
    let waitMgr = {
        counter : 0,
        isWaiting : false,
        start : function(frame) {
            this.counter = frame;
            this.isWaiting = true;
        },
        update : function() {
            this.counter -= 1;
            if (this.counter <= 0 ) {
                this.isWaiting = false;
            }
        },
        reset : function() {
            this.counter = 0;
            this.isWaiting = false;
        }
    };

    // diggController
    // 穴掘りの状態遷移
    let diggController = {
        status : "DIGGING",
        counter : NUM_DIGGING,
        update : function() {
            if (this.status === "DIGGING") {
                if (!pickel.playing) {
                    this.counter -= 1;
                    if (this.counter <= 0) {
                        this.status = "SHOWING"
                        box.gotoAndStop(3);
                        this.counter = NUM_DIGGING;
                        pickel.visible = false;
                        waitMgr.start(60);
                    } else {
                        pickel.gotoAndPlay(0);
                        createjs.Sound.play("sndDig");
                        box.visible = true;
                        box.gotoAndStop(3-this.counter);
                    } 
                }
            } else if (this.status === "SHOWING") {
                waitMgr.update();
                if (!waitMgr.isWaiting) {
                    box.gotoAndStop(4);
                    createjs.Sound.play("sndOpen");
                    this.status = "OPENING";
                    waitMgr.start(60);
                }

            } else if (this.status === "OPENING") {
                waitMgr.update();
                if (!waitMgr.isWaiting) {
                    this.status = "OPENED";
                }
            }
        },
        reset : function() {
            this.status = "DIGGING";
        }
    };

    //goalController
    //ゴール時の状態遷移
    let goalController = {
        status: "GOAL_FLAG",
        update: function() {
            if (this.status === "GOAL_FLAG") {
                if (goalFlag.y < 250) {
                    //cnt += 1;
                    //console.log(cnt);
                    goalFlag.y += 1.5;
                    goalFlag.scale.x *= 1.005;
                    goalFlag.scale.y *= 1.005;
                    updatePointer();
                } else {
                    roadEdgeL.stop();
                    roadEdgeR.stop();
                    this.status = "SCORE_BOARD";
                    waitMgr.start(60);
                }
            } else if (this.status === "SCORE_BOARD") {
                waitMgr.update();
                if (!waitMgr.isWaiting) {
                    scorebd.visible = true;
                    this.status = "SHOW_SCORE";
                    waitMgr.start(30);
                }
            } else if (this.status === "SHOW_SCORE") {
                waitMgr.update();
                if (!waitMgr.isWaiting) {
                    scoreText.setText(Math.floor(pl*2.0/3.0));
                    scoreText.visible = true;
                    this.status = "SHOW_GOLD";
                    waitMgr.start(30);
                }
            } else if (this.status === "SHOW_GOLD") {
                waitMgr.update();
                if (!waitMgr.isWaiting) {
                    gold.visible = true;
                    gold.gotoAndPlay(0);
                    this.status = "FINISH";
                }
            } else if (this.status === "FINISH") {

            }
        }
    };

    //配列の合計
    function sum(arr) {
        let total = 0;
        arr.forEach(function(elm) {
            total += elm;
        });
        return total;
    }

    //データの保存
    function saveData() {
        xr.open("post", "./php/saveGameDataPost.php", true);
        xr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xr.send('log='+obj2csv());
        console.log("data saved");
    }

    //オブジェクトリテラルからCSVに変換
    function obj2csv() {
        let ary = [];
        ary.push(appStartTime);
        ary.push(res.pattern_name);
        let i = 1;
        appLog.forEach(function(elm) {
            ary.push("Q"+i);
            ary.push(elm.voice_nav);
            ary.push(elm.vib_name);
            ary.push(elm.clicked);
            ary.push(elm.reaction_time);
            i += 1;
        });
        return ary.join(",");
    }

    //日付の生成
    function makeDate() {
        const d = new Date();
        let str = "";
        str += d.getFullYear()+"-";
        str += nf((d.getMonth()+1))+"-";
        str += nf(d.getDate())+"_";
        str += nf(d.getHours())+"-";
        str += nf(d.getMinutes())+"-";
        str += nf(d.getSeconds());
        return str;
    }

    //数字の整形
    function nf(num) {
        return ("00" + num).slice(-2);
    }

    /* --------------------------------
     * アプリケーションスタート
     * --------------------------------
     */
    app.start();

}());

