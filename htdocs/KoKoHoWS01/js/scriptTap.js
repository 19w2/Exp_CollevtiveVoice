(function() {
    //pixi 4.5.3
    //let cnt = 0;
    
    //定数
    const NUM_DIGGING = 3,
        WAIT_DURATION = 30, 
        //VIB_DURATION = 45,
        VIB_DURATION = 30, //フレーム数 30で0.5秒相当 
        RRANGE = 3.49066,
        //POINTER_F1 = 68,
        POINTER_F1 = 41,
        POINTER_F2 = 108,
        POINTER_F3 = 115;
        SCORE = 19; //hondo3

    //アプリの状態
    let appStatus = "IDLE"
        isSelected = false,
        isDigged = false,
        isOpened = false,
        isShown = false,
        isTouchMode = false,
        ansCounter = 0,
        pointerStep = 0,
        selectedNum = 0,
        waitCounter = WAIT_DURATION,
        vibCounter = VIB_DURATION,
        rejCounter = 0 //hondo3
        minRejectedNum = 10; //hondo4

    //メーター振りきり時のプルプル用 hondo2
    //let vibrationFlag = 1,
    //    MAX_METER_POSITION = 1.775962155105955,
    //    testOneMeterCount = 0;

    //スピードメーター用 hondo3
    let firstGoingFrames = 107,
        goingFrames = 148,
        firstAccelerations = [firstGoingFrames],
        accelerations = [goingFrames],
        startSpeedFlag = true,
        speedMeterFrameCount = 0,
        meterBase = 30; //メータの動き具合
    let tmp = 0;

    let a;
    for (let i = 0; i < firstGoingFrames; i++) {
        if (i < 30)
            a = 1;
        else if (i < 40)
            a -= 0.1;
        else if (i < 90)
            a = 0;
        else
            a = -34.5/16;
        firstAccelerations[i] = a / meterBase;
    }

    for (let i = 0; i < goingFrames; i++) {
        if (i < 40)
            a = 1;
        else if (i < 50)
            a -= 0.1;
        else if (i < 120)
            a = 0;
        else
            a = -44.5/27;
        accelerations[i] = a / meterBase;
    }


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

    /* kby
    //WebSocket関係
    let ws;
    if ("WebSocket" in window) {
        //ws = new WebSocket("ws://127.0.0.1:19999/");
        ws = new WebSocket("ws://192.168.11.30:19999/");
        console.log("websocket is created.");
    } else {
        alert("Error: WebSocket is not supported.");
    }

    ws.onopen = function() {
        ws.send('ping');
        console.log("connected!");
    };

    ws.onmessage = function(ev) {
        console.log(">>> " + ev.data);
    }
    */

    //JSONファイルの読み込み
    /*
    let xr = new XMLHttpRequest();
    xr.open("get", "./json/pattern01.json", false);
    //xr.open("get", "./json/pattern02.json", false);
    xr.send(null);
    let pattern = JSON.parse(xr.response).data;
    */

    //JSONファイルの読み込み
    //スマホ振動用のファイルを流用する
    //vibキーは無視して，振動時間は固定(VIB_DURATION)とする
    let xr = new XMLHttpRequest();
    xr.open("get", "./php/pattern.php", false);
    xr.send(null);
    const res = JSON.parse(xr.response);
    const pattern = res.data;

    console.log(pattern);

    xr.open("get", "./php/pattern.php?cmd=up", false);
    xr.send(null);

    const pl = pattern.length;
    //const shortest = 27; //hondo3
    const shortest = 27; //hondo4
    //console.log(pl)
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
        //dashboard = PIXI.Sprite.fromImage('images/dashboard.png'), //hondo3
        dashboard = PIXI.Sprite.fromImage('images/dashboard2.png'), //kby
        pointer = PIXI.Sprite.fromImage('images/pointer.png'),
        handle = PIXI.Sprite.fromImage('images/handle.png'),
        scorebd = PIXI.Sprite.fromImage('images/score.png'),
        roadLeftFill = PIXI.Sprite.fromImage('images/roadLfill.png'),
        roadRightFill = PIXI.Sprite.fromImage('images/roadRfill.png'),
        roadLeftLineU = PIXI.Sprite.fromImage('images/roadLline.png'),
        roadLeftLineD = PIXI.Sprite.fromImage('images/roadLline.png'),
        roadRightLineU = PIXI.Sprite.fromImage('images/roadRline.png'),
        roadRightLineD = PIXI.Sprite.fromImage('images/roadRline.png'),
        arrowLeft = PIXI.Sprite.fromImage('images/arLeft.png'),
        arrowRight = PIXI.Sprite.fromImage('images/arRight.png'),
        arrowStraight = PIXI.Sprite.fromImage('images/arStraight.png'),
        cursor = PIXI.Sprite.fromImage('images/cursor.png'),
        startBtn = PIXI.Sprite.fromImage('images/startButton.png');
    
    rockL[0] = PIXI.Sprite.fromImage('images/rockL01.png');
    rockL[1] = PIXI.Sprite.fromImage('images/rockL02.png');
    rockL[2] = PIXI.Sprite.fromImage('images/rockL03.png');
    rockR[0] = PIXI.Sprite.fromImage('images/rockR02.png');
    rockR[1] = PIXI.Sprite.fromImage('images/rockR03.png');
    rockR[2] = PIXI.Sprite.fromImage('images/rockR01.png');

    /*
    bank[0] = PIXI.Sprite.fromImage('images/bank.png');
    bank[1] = PIXI.Sprite.fromImage('images/bank.png');
    bank[2] = PIXI.Sprite.fromImage('images/bank.png');
    */

    numCards[0] = PIXI.Sprite.fromImage('images/No1.png');
    numCards[1] = PIXI.Sprite.fromImage('images/No2.png');
    numCards[2] = PIXI.Sprite.fromImage('images/No3.png');

    //テクスチャのロード(アニメーション用)
    let cloudsImg = PIXI.Texture.fromImage('images/clouds.png'),
        pickelImgs = [],
        boxImgs = [],
        voiceMarkImgs = [], //kby voiceMarkは以前はコメントだった
        triangleImgs = [],
        turnLeftImgs = [],
        turnRightImgs = [],
        goldImgs = [],
        roadEdgeLimgs = [],
        roadEdgeRimgs = [];

    roadEdgeLimgs[0] = PIXI.Texture.fromImage('images/roadEdgeL01.png');
    roadEdgeLimgs[1] = PIXI.Texture.fromImage('images/roadEdgeL02.png');
    roadEdgeRimgs[0] = PIXI.Texture.fromImage('images/roadEdgeR01.png');
    roadEdgeRimgs[1] = PIXI.Texture.fromImage('images/roadEdgeR02.png');

    //kby
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

    turnLeftImgs[0] = PIXI.Texture.fromImage('images/turnL.png');
    turnLeftImgs[1] = PIXI.Texture.fromImage('images/turnM.png');
    turnLeftImgs[2] = PIXI.Texture.fromImage('images/turnR.png');

    turnRightImgs[0] = turnLeftImgs[2];
    turnRightImgs[1] = turnLeftImgs[1];
    turnRightImgs[2] = turnLeftImgs[0];

    /*
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
    */

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
        voiceMark = new PIXI.extras.AnimatedSprite(voiceMarkImgs), //kby
        triangles = [],
        box = new PIXI.extras.AnimatedSprite(boxImgs),
        //pickel = new PIXI.extras.AnimatedSprite(pickelImgs),
        turnLeftAnim = new PIXI.extras.AnimatedSprite(turnLeftImgs),
        turnRightAnim = new PIXI.extras.AnimatedSprite(turnRightImgs),
        gold = new PIXI.extras.AnimatedSprite(goldImgs),
        roadEdgeL = new PIXI.extras.AnimatedSprite(roadEdgeLimgs),
        roadEdgeR = new PIXI.extras.AnimatedSprite(roadEdgeRimgs);

    triangles[0] = new PIXI.extras.AnimatedSprite(triangleImgs);
    triangles[1] = new PIXI.extras.AnimatedSprite(triangleImgs);
    triangles[2] = new PIXI.extras.AnimatedSprite(triangleImgs);

    /*
    //音声ファイルのロード kby
    let sndVoice = [];
    sndVoice[0] = "No1";
    sndVoice[1] = "No2";
    sndVoice[2] = "No3";
    */
    
    /*
    //音声ファイルのロード hondo ver1
    let sndVoice = [];
    sndVoice[0] = "135";
    sndVoice[1] = "153";
    sndVoice[2] = "315";
    sndVoice[3] = "351";
    sndVoice[4] = "513";
    sndVoice[5] = "531";
    */

    /*
    //音声ファイルのロード hondo ver2  ver3も？
    let sndVoice = [];
    sndVoice[0] = ["No1people1", "No1people2", "No1people4"];
    sndVoice[1] = ["No2people1", "No2people2", "No2people4"];
    sndVoice[2] = ["No3people1", "No3people2", "No3people4"];
    */

    //音声ファイルのロード hondo ver4
    let sndVoice = [];
    sndVoice[0] = [["No1_vol1_lay1","No1_vol1_lay2","No1_vol1_lay4"],
                   ["No1_vol2_lay1","No1_vol2_lay2","No1_vol2_lay4"],
                   ["No1_vol4_lay1","No1_vol4_lay2","No1_vol4_lay4"]];
    sndVoice[1] = [["No2_vol1_lay1","No2_vol1_lay2","No2_vol1_lay4"],
                   ["No2_vol2_lay1","No2_vol2_lay2","No2_vol2_lay4"],
                   ["No2_vol4_lay1","No2_vol4_lay2","No2_vol4_lay4"]];
    sndVoice[2] = [["No3_vol1_lay1","No3_vol1_lay2","No3_vol1_lay4"],
                   ["No3_vol2_lay1","No3_vol2_lay2","No3_vol2_lay4"],
                   ["No3_vol4_lay1","No3_vol4_lay2","No3_vol4_lay4"]];

    /*
    createjs.Sound.registerSound("sounds/No1.mp3", sndVoice[0]);
    createjs.Sound.registerSound("sounds/No2.mp3", sndVoice[1]);
    createjs.Sound.registerSound("sounds/No3.mp3", sndVoice[2]);
    createjs.Sound.registerSound("sounds/dig.mp3", "sndDig");
    createjs.Sound.registerSound("sounds/open.mp3", "sndOpen");
    */
    /* kby
    createjs.Sound.registerSound("sounds/1ban060.wav", sndVoice[0]);
    createjs.Sound.registerSound("sounds/2ban060.wav", sndVoice[1]);
    createjs.Sound.registerSound("sounds/3ban060.wav", sndVoice[2]);
    */
    
    //createjs.Sound.registerSound("sounds/buttonClick.mp3", "buttonClick"); //kby ~ hondo3
    createjs.Sound.registerSound("sounds/buttonClick_declined.mp3", "buttonClick"); //hondo4

    /*
    //音声ファイルの登録 hondo
    createjs.Sound.registerSound("sounds/sound_135.wav", sndVoice[0]);
    createjs.Sound.registerSound("sounds/sound_153.wav", sndVoice[1]);
    createjs.Sound.registerSound("sounds/sound_315.wav", sndVoice[2]);
    createjs.Sound.registerSound("sounds/sound_351.wav", sndVoice[3]);
    createjs.Sound.registerSound("sounds/sound_513.wav", sndVoice[4]);
    createjs.Sound.registerSound("sounds/sound_531.wav", sndVoice[5]);
    */

    /*
    //音声ファイルの登録 hondo ver2
    createjs.Sound.registerSound("sounds/number1_sa_rg.wav", sndVoice[0][0]);
    createjs.Sound.registerSound("sounds/number1_sasa2_rg.wav", sndVoice[0][1]);
    createjs.Sound.registerSound("sounds/number1_sasa2susu2_rg.wav", sndVoice[0][2]);
    createjs.Sound.registerSound("sounds/number2_sa_rg.wav", sndVoice[1][0]);
    createjs.Sound.registerSound("sounds/number2_sasa2_rg.wav", sndVoice[1][1]);
    createjs.Sound.registerSound("sounds/number2_sasa2susu2_rg.wav", sndVoice[1][2]);
    createjs.Sound.registerSound("sounds/number3_sa_rg.wav", sndVoice[2][0]);
    createjs.Sound.registerSound("sounds/number3_sasa2_rg.wav", sndVoice[2][1]);
    createjs.Sound.registerSound("sounds/number3_sasa2susu2_rg.wav", sndVoice[2][2]);
    */

    /*
    //音声ファイルの登録 hondo ver3 replaygainなしver
    createjs.Sound.registerSound("sounds/noReplayGain/number1_sa.wav", sndVoice[0][0]);
    createjs.Sound.registerSound("sounds/noReplayGain/number1_sasa2.wav", sndVoice[0][1]);
    createjs.Sound.registerSound("sounds/noReplayGain/number1_sasa2susu2.wav", sndVoice[0][2]);
    createjs.Sound.registerSound("sounds/noReplayGain/number2_sa.wav", sndVoice[1][0]);
    createjs.Sound.registerSound("sounds/noReplayGain/number2_sasa2.wav", sndVoice[1][1]);
    createjs.Sound.registerSound("sounds/noReplayGain/number2_sasa2susu2.wav", sndVoice[1][2]);
    createjs.Sound.registerSound("sounds/noReplayGain/number3_sa.wav", sndVoice[2][0]);
    createjs.Sound.registerSound("sounds/noReplayGain/number3_sasa2.wav", sndVoice[2][1]);
    createjs.Sound.registerSound("sounds/noReplayGain/number3_sasa2susu2.wav", sndVoice[2][2]);
    */

    //音声ファイルの登録 hondo ver4 方向3種，音圧3種，人数3種
    createjs.Sound.registerSound("sounds/tuned/no1_vol1_lay1_sa.wav", sndVoice[0][0][0]);
    createjs.Sound.registerSound("sounds/tuned/no1_vol1_lay2_sasa2.wav", sndVoice[0][0][1]);
    createjs.Sound.registerSound("sounds/tuned/no1_vol1_lay4_sasa2susu2.wav", sndVoice[0][0][2]);
    createjs.Sound.registerSound("sounds/tuned/no1_vol2_lay1_sa.wav", sndVoice[0][1][0]);
    createjs.Sound.registerSound("sounds/tuned/no1_vol2_lay2_sasa2.wav", sndVoice[0][1][1]);
    createjs.Sound.registerSound("sounds/tuned/no1_vol2_lay4_sasa2susu2.wav", sndVoice[0][1][2]);
    createjs.Sound.registerSound("sounds/tuned/no1_vol4_lay1_sa.wav", sndVoice[0][2][0]);
    createjs.Sound.registerSound("sounds/tuned/no1_vol4_lay2_sasa2.wav", sndVoice[0][2][1]);
    createjs.Sound.registerSound("sounds/tuned/no1_vol4_lay4_sasa2susu2.wav", sndVoice[0][2][2]);

    createjs.Sound.registerSound("sounds/tuned/no2_vol1_lay1_sa.wav", sndVoice[1][0][0]);
    createjs.Sound.registerSound("sounds/tuned/no2_vol1_lay2_sasa2.wav", sndVoice[1][0][1]);
    createjs.Sound.registerSound("sounds/tuned/no2_vol1_lay4_sasa2susu2.wav", sndVoice[1][0][2]);
    createjs.Sound.registerSound("sounds/tuned/no2_vol2_lay1_sa.wav", sndVoice[1][1][0]);
    createjs.Sound.registerSound("sounds/tuned/no2_vol2_lay2_sasa2.wav", sndVoice[1][1][1]);
    createjs.Sound.registerSound("sounds/tuned/no2_vol2_lay4_sasa2susu2.wav", sndVoice[1][1][2]);
    createjs.Sound.registerSound("sounds/tuned/no2_vol4_lay1_sa.wav", sndVoice[1][2][0]);
    createjs.Sound.registerSound("sounds/tuned/no2_vol4_lay2_sasa2.wav", sndVoice[1][2][1]);
    createjs.Sound.registerSound("sounds/tuned/no2_vol4_lay4_sasa2susu2.wav", sndVoice[1][2][2]);

    createjs.Sound.registerSound("sounds/tuned/no3_vol1_lay1_sa.wav", sndVoice[2][0][0]);
    createjs.Sound.registerSound("sounds/tuned/no3_vol1_lay2_sasa2.wav", sndVoice[2][0][1]);
    createjs.Sound.registerSound("sounds/tuned/no3_vol1_lay4_sasa2susu2.wav", sndVoice[2][0][2]);
    createjs.Sound.registerSound("sounds/tuned/no3_vol2_lay1_sa.wav", sndVoice[2][1][0]);
    createjs.Sound.registerSound("sounds/tuned/no3_vol2_lay2_sasa2.wav", sndVoice[2][1][1]);
    createjs.Sound.registerSound("sounds/tuned/no3_vol2_lay4_sasa2susu2.wav", sndVoice[2][1][2]);
    createjs.Sound.registerSound("sounds/tuned/no3_vol4_lay1_sa.wav", sndVoice[2][2][0]);
    createjs.Sound.registerSound("sounds/tuned/no3_vol4_lay2_sasa2.wav", sndVoice[2][2][1]);
    createjs.Sound.registerSound("sounds/tuned/no3_vol4_lay4_sasa2susu2.wav", sndVoice[2][2][2]);

    //Sound Instance
    let sndIns = null;

    //フォントの生成
    //let counterText = new PIXI.Text(ansCounter+"/"+pl),kby
    let //counterText = new PIXI.Text(ansCounter+"/"+shortest), //hondo2
        counterText = new PIXI.Text(ansCounter), //hondo3
        scoreText = new PIXI.Text("");


    //初期位置の設定
    setupSprite();

    //スプライトをステージに追加
    app.stage.addChild(cloudTile);
    app.stage.addChild(mountain);
    app.stage.addChild(road);
    app.stage.addChild(roadEdgeL);
    app.stage.addChild(roadEdgeR);
    app.stage.addChild(roadLeftFill);
    app.stage.addChild(roadRightFill);
    app.stage.addChild(roadLeftLineU);
    app.stage.addChild(roadLeftLineD);
    app.stage.addChild(roadRightLineU);
    app.stage.addChild(roadRightLineD);
    app.stage.addChild(turnLeftAnim);
    app.stage.addChild(turnRightAnim);
    /*
    app.stage.addChild(rockL[2]);
    app.stage.addChild(rockL[1]);
    app.stage.addChild(rockL[0]);
    app.stage.addChild(rockR[2]);
    app.stage.addChild(rockR[1]);
    app.stage.addChild(rockR[0]);
    app.stage.addChild(bank[1]);
    app.stage.addChild(bank[0]);
    app.stage.addChild(bank[2]);
    */
    app.stage.addChild(arrowLeft);
    app.stage.addChild(arrowRight);
    app.stage.addChild(arrowStraight);
    app.stage.addChild(goalFlag);
    app.stage.addChild(triangles[0]);
    app.stage.addChild(triangles[1]);
    app.stage.addChild(triangles[2]);
    app.stage.addChild(numCards[0]);
    app.stage.addChild(numCards[1]);
    app.stage.addChild(numCards[2]);
    app.stage.addChild(box);
//    app.stage.addChild(pickel);
    app.stage.addChild(startBtn);
    app.stage.addChild(cursor);
    app.stage.addChild(pillar);
    app.stage.addChild(mirror);
    app.stage.addChild(dashboard);
    app.stage.addChild(pointer);
    app.stage.addChild(voiceMark); //kby
    app.stage.addChild(counterText);
    app.stage.addChild(handle);
    app.stage.addChild(scorebd);
    app.stage.addChild(scoreText);
    app.stage.addChild(gold);


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
        let w = app.renderer.width;

        cloudTile.y = 20;

        mountain.x = 0;
        mountain.y = 45;

        road.x = 0;
        road.y = 130;


        /*
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
        */

        //矢印
        arrowLeft.anchor.set(0.5, 0.0);
        arrowLeft.x = 215;
        arrowLeft.y = 260;
        arrowLeft.visible = false;
        arrowLeft.buttonMode = false;
        arrowLeft.interactive = false;
        arrowLeft.on('click', onArrowLeftClick);
        arrowLeft.on('touchstart', onArrowLeftClick);

        arrowStraight.anchor.set(0.5, 0.0);
        arrowStraight.x = 400;
        arrowStraight.y = 260;
        arrowStraight.visible = false;
        arrowStraight.buttonMode = false;
        arrowStraight.interactive = false;
        arrowStraight.on('click', onArrowStraightClick);
        arrowStraight.on('touchstart', onArrowStraightClick);

        arrowRight.anchor.set(0.5, 0.0);
        arrowRight.x = 575;
        arrowRight.y = 260;
        arrowRight.visible = false;
        arrowRight.buttonMode = false;
        arrowRight.interactive = false;
        arrowRight.on('click', onArrowRightClick);
        arrowRight.on('touchstart', onArrowRightClick);


        //回転するときのアニメーション
        turnLeftAnim.x = 0;
        turnLeftAnim.y = 130;
        turnLeftAnim.animationSpeed = 0.05;
        turnLeftAnim.visible = false;
        turnLeftAnim.loop = false;

        turnRightAnim.x = 0;
        turnRightAnim.y = 130;
        turnRightAnim.animationSpeed = 0.05;
        turnRightAnim.visible = false;
        turnRightAnim.loop = false;

        //側道
        roadLeftLineU.anchor.set(1.0, 0.0);
        roadLeftLineU.scale.x *= 0.4;
        roadLeftLineU.scale.y *= 0.4;
        roadLeftLineU.x = w/2-172;
        roadLeftLineU.y = 145;

        roadLeftLineD.anchor.set(1.0, 0.0);
        roadLeftLineD.scale.x *= 0.5;
        roadLeftLineD.scale.y *= 0.5;
        roadLeftLineD.x = w/2-176;
        roadLeftLineD.y = 155;

        roadLeftFill.anchor.set(1.0, 0.0);
        roadLeftFill.x = w/2-160;
        roadLeftFill.y = 147;

        roadRightLineU.anchor.set(0.0, 0.0);
        roadRightLineU.scale.x *= 0.4;
        roadRightLineU.scale.y *= 0.4;
        roadRightLineU.x = w/2+172;
        roadRightLineU.y = 145;

        roadRightLineD.anchor.set(0.0, 0.0);
        roadRightLineD.scale.x *= 0.5;
        roadRightLineD.scale.y *= 0.5;
        roadRightLineD.x = w/2+176;
        roadRightLineD.y = 155;

        roadRightFill.anchor.set(0.0, 0.0);
        roadRightFill.x = w/2+160;
        roadRightFill.y = 147;

        //ゴールフラッグ
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
        //pointerStep = RRANGE / (pl);
        pointerStep = RRANGE / (shortest); //hondo3
        pointer.rotation = -RRANGE/2;

        handle.x = 290;
        handle.y = 440;

         //kby
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

        /*
        pickel.x = app.renderer.width / 2;
        pickel.y = app.renderer.height / 2;
        pickel.stop();
        pickel.animationSpeed = 0.3;
        pickel.loop = false;
        pickel.anchor.set(0.4, 0.5);
        pickel.visible = false;
        */
        //pickel.onComplete(onPickelAnimFinished);
        

        cursor.x = app.renderer.width / 2;
        cursor.y = app.renderer.height / 2;
        cursor.anchor.set(0.4, 0.5);
        cursor.visible = true;

    }

    //雲の位置更新
    function updateCloud() {
        cloudTile.tilePosition.x += 0.08;
    }

    //ピッケルの更新
    /*
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
    */

    //ポインタの更新
    function updateCursor() {
        let m = app.renderer.plugins.interaction.mouse.global;
        cursor.x = m.x;
        cursor.y = m.y;
    }

    //岩の更新
    /*
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
    */

    //分岐道の更新(通常速度)
    function updateRoadLR() {
        roadLeftFill.y += 0.8;
        roadLeftFill.x -= 0.55;
        roadLeftFill.scale.x *= 1.022;
        roadLeftFill.scale.y *= 1.022;

        roadRightFill.y += 0.8;
        roadRightFill.x += 0.55;
        roadRightFill.scale.x *= 1.022;
        roadRightFill.scale.y *= 1.022;

        roadLeftLineU.y += 0.8;
        roadLeftLineU.x -= 0.55;
        roadLeftLineU.scale.x *= 1.004;
        roadLeftLineU.scale.y *= 1.004;
        //console.log("roadlineLeftU >> " + roadLeftLineU.y);
        //
        roadRightLineU.y += 0.8;
        roadRightLineU.x += 0.55;
        roadRightLineU.scale.x *= 1.004;
        roadRightLineU.scale.y *= 1.004;

        roadLeftLineD.y *= 1.0072;
        roadLeftLineD.x -= 1.21;
        roadLeftLineD.scale.x *= 1.008;
        roadLeftLineD.scale.y *= 1.008;

        roadRightLineD.y *= 1.0072;
        roadRightLineD.x += 1.21;
        roadRightLineD.scale.x *= 1.008;
        roadRightLineD.scale.y *= 1.008;
    }

    //分岐道の更新(高速)
    function updateRoadLRFast() {
        roadLeftFill.y += 3.0;
        roadLeftFill.x -= 1.55;
        roadLeftFill.scale.x *= 1.032;
        roadLeftFill.scale.y *= 1.032;

        roadRightFill.y += 3.0;
        roadRightFill.x += 1.55;
        roadRightFill.scale.x *= 1.032;
        roadRightFill.scale.y *= 1.032;

        roadLeftLineU.y += 3.0;
        roadLeftLineU.x -= 2.3;
        roadLeftLineU.scale.x *= 1.008;
        roadLeftLineU.scale.y *= 1.008;
        
        roadRightLineU.y += 3.0;
        roadRightLineU.x += 2.3;
        roadRightLineU.scale.x *= 1.008;
        roadRightLineU.scale.y *= 1.008;

        roadLeftLineD.y *= 1.02;
        roadLeftLineD.x -= 4.0;
        roadLeftLineD.scale.x *= 1.008;
        roadLeftLineD.scale.y *= 1.008;

        roadRightLineD.y *= 1.02;
        roadRightLineD.x += 4.0;
        roadRightLineD.scale.x *= 1.008;
        roadRightLineD.scale.y *= 1.008;
    }

    //盛土の更新
    /*
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
    */

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

    //メーターの更新 kby
    /*
    function updatePointer() {
        if (ansCounter <= shortest) {
            pointer.rotation += pointerStep/POINTER_FRAMES;
            console.log(testOneMeterCount++);
        } else {
            pointer.rotation += vibrationFlag * pointerStep/POINTER_FRAMES * 22;
            vibrationFlag *= -1;
            //console.log(pointer.rotation)
        }
    }*/

    //最初のスピードメーターの更新 hondo3
    function firstUpdatePointer() {
        if (speedMeterFrameCount < 106) {
            pointer.rotation += firstAccelerations[speedMeterFrameCount];
            speedMeterFrameCount++;
        }/* else {
            speedMeterFrameCount = 0;
        }*/
    }

    //スピードメーターの更新 上のものを変更hondo3
    function updatePointer() {
        if (speedMeterFrameCount < 147) {
            pointer.rotation += accelerations[speedMeterFrameCount];
            speedMeterFrameCount++;
        }/* else {
            speedMeterFrameCount = 0;
        }*/
    }


    //アプリの状態制御
    function updateStatus() {
        if (appStatus === "IDLE") {
            updateCursor();
            if (startBtn.visible === false) {
                cursor.visible = false;
                appStatus = "GOING1";
            }
        } else if (appStatus === "GOING1") { 
            //cnt += 1
            //updateRock();
            //updateBank();
            updateRoadLR();
            if (startSpeedFlag) {
                firstUpdatePointer();
            } else {
                updatePointer();
            }
            //if (bank[0].y > 300) {
            if (roadLeftLineU.y > 230) {
                appStatus = "WAIT";
                initWait();
                //console.log(cnt);
            }
        } else if (appStatus === "GOING2") {
            //cnt += 1
            //updateRock();
            startSpeedFlag = false;
            updatePointer();
            //updateBank();
            updateRoadLRFast();
            //updateBoxPos();
            //if (bank[0].y > 400) {
            if (roadLeftLineU.y > 350) {
                //if (ansCounter >= pl) { //kby
                if ((ansCounter >= shortest && rejCounter >= minRejectedNum)
                   || (ansCounter >= pl)) { //hondo3
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
            updateCursor();
            if (waitCounter < 0) {
                appStatus = "VOICEVIB_NAVIGATION";
                initVoiceVibNavigation();
            }
        } else if (appStatus === "VOICEVIB_NAVIGATION") {
            //console.log(sndIns.playState);
            //updateCursor();
            updateVibNavigation();
            /*if ((sndIns.playState === createjs.Sound.PLAY_FINISHED) &&
                (vibCounter <0)){ kby*/
            if (sndIns.playState === createjs.Sound.PLAY_FINISHED) { // hondo
                appStatus = "SELECTION";
                initSelection();
            }
        } else if (appStatus === "SELECTION") {
            //updatePickel();
            cursor.visible = true;
            updateCursor();
            if (isSelected) {
                //appStatus = "DIGGING";
                //initDigging();
                appStatus = "TURNING";
                initTurning(selectedNum);
            }
        /*
        } else if (appStatus === "DIGGING") {
            diggController.update();
            if (diggController.status === "OPENED") {
                appStatus = "GOING2";
                initGoing2();
                //console.log(cnt);
            }
        */
        } else if (appStatus === "TURNING") {
            turnController.update();
            if (turnController.status == "FINISHED") {
                appStatus = "GOING2";
                //GOING1-> GOING2になるタイミングでspeedMeterFrameCountを0に
                speedMeterFrameCount = 0;
                initGoing2();
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
        //タップOK 反応時間記録スタート
        /*
        bank[0].buttonMode = true;
        bank[1].buttonMode = true;
        bank[2].buttonMode = true;
        */
        //cursor.visible = true;
        arrowLeft.visible = true;
        arrowStraight.visible = true;
        arrowRight.visible = true;
        //arrowLeft.buttonMode = true;
        //arrowStraight.buttonMode = true;
        //arrowRight.buttonMode = true;

        alog = {}; //ログ保存オブジェクト
        alog.start_select = new Date().getTime();
        //alog.voice_nav = pattern[ansCounter].voice; kby & hondo1,2,3
        //alog.vib_name  = pattern[ansCounter].vib_name; kby
        //alog.voice_name = pattern[ansCounter].voice_name // hondo
        //alog.people_nav  = pattern[ansCounter].people; //hondo ver2
        alog.route_nav = pattern[ansCounter].route //hondo ver4
        alog.laynum_nav = pattern[ansCounter].laynum //hondo ver4
        alog.volume_nav = pattern[ansCounter].volume //hondo ver4
        for(let i=0; i<3; i+=1) {
            triangles[i].visible = true;
            triangles[i].play();
            numCards[i].visible = true;
        }
    }

    //音声ナビゲーションの初期化
    function initVoiceNavigation() {
        vibCounter = VIB_DURATION;
        //vibCounter = 60 * sum(pattern[ansCounter].vib)/1000; //ミリ秒 → 秒 → フレーム 
        //console.log(vibCounter);
        voiceMark.visible = true;  //kby
        voiceMark.gotoAndPlay(0); //kby
        //let num = pattern[ansCounter].voice -1; kby
        //let VoiceNum = pattern[ansCounter].voice - 1; //hondo ver2
        //let PeopleNum = pattern[ansCounter].people - 1; //hondo ver2
        let RouteNum = pattern[ansCounter].route - 1; //hondo ver4
        let Laynum = pattern[ansCounter].laynum - 1 //hondo ver4
        let VolumeNum = pattern[ansCounter].volume - 1; //hondo ver4
        //if (PeopleNum == 3) //hondo ver2
        //    PeopleNum = 2;
        if (Laynum == 3) Laynum = 2; //hondo ver4
        if (VolumeNum == 3) VolumeNum = 2; //hondo ver4

        //sndIns = createjs.Sound.play(sndVoice[num]); kby
        //sndIns = createjs.Sound.play(sndVoice[VoiceNum][PeopleNum]); //hondo
        sndIns = createjs.Sound.play(sndVoice[RouteNum][Laynum][VolumeNum]); //hondo4
        //alog.voice_nav = num + 1;
    }

    
    //振動ナビゲーションの初期化
    function initVibNavigation() {
        /*
        let vibArray = pattern[ansCounter].vib;
        navigator.vibrate(vibArray);
        */
        //ws.send(pattern[ansCounter].vib_name); kby
        //alog.vib_name = pattern[ansCounter].vib_name;
    }
    
    
    //音声＆振動ナビゲーションの初期化
    function initVoiceVibNavigation() {
        vibCounter = VIB_DURATION;
        //vibCounter = 60 * sum(pattern[ansCounter].vib)/1000; //ミリ秒 → 秒 → フレーム 
        //console.log(vibCounter);
        voiceMark.visible = true; //kby
        voiceMark.gotoAndPlay(0); //kby
        //let num = pattern[ansCounter].voice -1; kby
        //let VoiceNum = pattern[ansCounter].voice - 1; //hondo ver2
        //let PeopleNum = pattern[ansCounter].people - 1; //hondo ver2
        let RouteNum = pattern[ansCounter].route - 1; //hondo ver4
        let Laynum = pattern[ansCounter].laynum - 1 //hondo ver4
        let VolumeNum = pattern[ansCounter].volume - 1; //hondo ver4
        //if (PeopleNum == 3) //hondo ver2
        //    PeopleNum = 2;
        if (Laynum == 3) Laynum = 2; //hondo ver4
        if (VolumeNum == 3) VolumeNum = 2; //hondo ver4
        
        console.log("###", RouteNum, Laynum, VolumeNum);
        //sndIns = createjs.Sound.play(sndVoice[num]); kby
        //sndIns = createjs.Sound.play(sndVoice[VoiceNum][PeopleNum]); //hondo
        sndIns = createjs.Sound.play(sndVoice[RouteNum][Laynum][VolumeNum]); //hondo4
        //alog.voice_nav = num + 1;
        // 振動の生成
        //ws.send(pattern[ansCounter].vib_name); kby
    }
   
    //GOING1の初期化 
    function initGoing1() {
        //盛土のリセット
        let w = app.renderer.width;
       
        /*
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
        */

        //側道のリセット
        roadLeftLineU.scale.x = 0.4;
        roadLeftLineU.scale.y = 0.4;
        roadLeftLineU.x = w/2-172;
        roadLeftLineU.y = 145;

        roadLeftLineD.scale.x = 0.5;
        roadLeftLineD.scale.y = 0.5;
        roadLeftLineD.x = w/2-176;
        roadLeftLineD.y = 155;

        roadLeftFill.scale.x = 1.0;
        roadLeftFill.scale.y = 1.0;
        roadLeftFill.x = w/2-160;
        roadLeftFill.y = 147;

        roadRightLineU.scale.x = 0.4;
        roadRightLineU.scale.y = 0.4;
        roadRightLineU.x = w/2+172;
        roadRightLineU.y = 145;

        roadRightLineD.scale.x = 0.5;
        roadRightLineD.scale.y = 0.5;
        roadRightLineD.x = w/2+176;
        roadRightLineD.y = 155;

        roadRightFill.scale.x = 1.0;
        roadRightFill.scale.y = 1.0;
        roadRightFill.x = w/2+160;
        roadRightFill.y = 147;

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
        /*
        bank[0].visible = false;
        bank[1].visible = false;
        bank[2].visible = false;
        */
        goalFlag.x = 400;
        goalFlag.y = 80;
        goalFlag.visible = true;
        saveData();
    }

    //SELECTIONの初期化 
    function initSelection() {
         //kby
        voiceMark.stop();
        voiceMark.visible = false;
        
        /*
        bank[0].buttonMode = true;
        bank[1].buttonMode = true;
        bank[2].buttonMode = true;
        */
        arrowLeft.buttonMode = true;
        arrowStraight.buttonMode = true;
        arrowRight.buttonMode = true;
        arrowLeft.interactive = true;
        arrowStraight.interactive = true;
        arrowRight.interactive = true;
        //updatePickel();
        updateCursor();
        if (!isTouchMode) {
            //pickel.visible = true;
            cursor.visible = true;
        }
    }

    //右折左折直進の初期化
    function initTurning(num) {
        ansCounter += 1;
        //counterText.setText(ansCounter+"/"+pl); kby
        counterText.setText(ansCounter+"/"+shortest); //hondo2
        counterText.setText(ansCounter); //hondo3

        cursor.visible = false;
        arrowLeft.buttonMode = false;
        arrowStraight.buttonMode = false;
        arrowRight.buttonMode = false;
        arrowLeft.interactive = false;
        arrowStraight.interactive = false;
        arrowRight.interactive = false;
        if (isTouchMode) {
            cursor.visible = true;
        }

        turnController.start(num);
    }

    //DIGGINGの初期化 
    function initDigging() {
        ansCounter += 1;
        //counterText.setText(ansCounter+"/"+pl); //kby
        counterText.setText(ansCounter+"/"+shortest); //hondo3
        //pickel.gotoAndPlay(0); 
        createjs.Sound.play("sndDig");
        /*
        bank[0].buttonMode = false;
        bank[1].buttonMode = false;
        bank[2].buttonMode = false;
        */
        if (isTouchMode) {
            //pickel.visible = true;
            cursor.visible = true;
        }
    }

    //GOING2の初期化 
    function initGoing2() {
        isShown = false;
        //diggController.reset();

        roadEdgeL.play();
        roadEdgeR.play();

        /*
        for(let i=0; i<3; i+=1) {
            triangles[i].visible = false;
            triangles[i].stop();
            numCards[i].visible = false;
        }
        */
    }

    //ピッケルをマウスクリックしたとき
    /*
    function onPickelClick() {
        //pickel.anchor.set(0.5, 1.0);
        pickel.rotation += 1.0;
    }
    */

    //盛土0をクリックしたとき
    function onBankClick0() {
        //if (bank[0].buttonMode === false) {return;}
        //if (appStatus !== "SELECTION") {return;}
        stopExpression();
        box.x = 215;
        addClickLog(1);
    }

    //盛土1をクリックしたとき
    function onBankClick1() {
        //if (bank[1].buttonMode === false) {return;}
        //if (appStatus !== "SELECTION") {return;}
        stopExpression();
        box.x = 400;
        addClickLog(2);
    }

    //盛土2をクリックしたとき
    function onBankClick2() {
        //if (bank[2].buttonMode === false) {return;}
        //if (appStatus !== "SELECTION") {return;}
        stopExpression();
        box.x = 575;
        addClickLog(3);
    }

    //矢印左をクリックしたとき
    function onArrowLeftClick() {
        stopExpression();
        addClickLog(1);
        selectedNum = 1;

        // hondo3
        /*if (pattern[ansCounter].voice != 1) {
            rejCounter += 1;
            console.log("rejected = " + rejCounter);
        }
        */
       // hondo 4
        if (pattern[ansCounter].route != 1) {
            rejCounter += 1;
            console.log("rejected = " + rejCounter);
        }
    }

    //矢印直進をクリックしたとき
    function onArrowStraightClick() {
        stopExpression();
        addClickLog(2);
        selectedNum = 2;

        // hondo3
        /*if (pattern[ansCounter].voice != 2) {
            rejCounter += 1;
            console.log("rejected = " + rejCounter)
        }
        */
        // hondo 4
        if (pattern[ansCounter].route != 2) {
            rejCounter += 1;
            console.log("rejected = " + rejCounter);
        }
    }

    //矢印右をクリックしたとき
    function onArrowRightClick() {
        stopExpression();
        addClickLog(3);
        selectedNum = 3;

        // hondo3
        /*if (pattern[ansCounter].voice != 3) {
            rejCounter += 1;
            console.log("rejected = " + rejCounter)
        }
        */
       // hondo 4
        if (pattern[ansCounter].route != 3) {
            rejCounter += 1;
            console.log("rejected = " + rejCounter);
        }
    }

    function stopExpression() {
         //kby
        voiceMark.stop();
        voiceMark.visible = false;
        
        //pickel.visible = true;
        cursor.visible = true;
        createjs.Sound.stop();
        appStatus = "SELECTION";
        isSelected = true;
        /*
        bank[0].buttonMode = false;
        bank[1].buttonMode = false;
        bank[2].buttonMode = false;
        */

        for(let i=0; i<3; i+=1) {
            triangles[i].visible = false;
            triangles[i].stop();
            numCards[i].visible = false;
        }

        cursor.visible = false;

        arrowLeft.visible = false;
        arrowStraight.visible = false;
        arrowRight.visible = false;

        arrowLeft.buttonMode = false;
        arrowStraight.buttonMode = false;
        arrowRight.buttonMode = false;
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
        createjs.Sound.play("buttonClick");
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

    //右折左折のアニメーション制御
    let turnController = {
        status : "PLAYING",
        num: 0,
        start : function(num) {
            this.num = num;
            if (this.num === 1) {
                turnLeftAnim.visible = true;
                turnLeftAnim.gotoAndPlay(0);
            } else if (this.num === 2) {
            } else if (this.num === 3) {
                turnRightAnim.visible = true;
                turnRightAnim.gotoAndPlay(0);
            }
            this.status = "PLAYING";
        },
        update : function() {
            if (this.num === 1) {
                if (!turnLeftAnim.playing) {
                    this.status = "FINISHED";
                    turnLeftAnim.visible = false;
                }
            } else if (this.num === 2) {
                this.status = "FINISHED";
            } else if (this.num === 3) {
                if (!turnRightAnim.playing) {
                    this.status = "FINISHED";
                    turnRightAnim.visible = false;
                }
            }
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
                    //scoreText.setText(Math.floor(pl*2.0/3.0)); kby
                    //scoreText.setText(Math.ceil(pl/2.0)) //hondo2
                    scoreText.setText(Math.ceil(SCORE)) //hondo3
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
            //ary.push(elm.voice_nav); kby
            //ary.push(elm.vib_name); kby
            //ary.push(elm.voice_name); hondo
            //ary.push(elm.people_nav); //hondo ver2
            ary.push(elm.route_nav); //hondo ver4
            ary.push(elm.laynum_nav); //hondo ver4
            ary.push(elm.volume_nav); //hondo ver4
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

