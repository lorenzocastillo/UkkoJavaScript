(function () {
    var gODir = "Classes/GameObjects/";
    var d = document;
    var c = {
        COCOS2D_DEBUG:0, //0 to turn debug off, 1 for basic debug, and 2 for full debug
        box2d:true,
        showFPS:false,
        frameRate:60,
        tag:'gameCanvas', //the dom element to run cocos2d on
        engineDir:'cocos2d/',
        //gameObject Directory (gO)
        appFiles:['MyFirstApp.js',
        'box2d/box2d.js',
        'HUDLayer.js',
        'ContactListener.js',
        'GameManager.js',
        gODir +'Ukko.js',
        gODir +'PhysicsSprite.js',
        gODir +'DreamFairy.js',
        gODir +'Counters.js',
        gODir +'HUDShield.js',
        gODir +'Flame.js',
        gODir +'Button.js',
        gODir +'Waterfall.js',
        gODir +'Door.js',
        gODir +'Cloud.js',
        gODir +'Orb.js',
        gODir +'OneSidedPlatform.js',
        gODir +'WaterfallPlatform.js',
        gODir +'InOutPlatform.js',
        gODir +'Life.js',
        gODir +'Key.js',
        gODir +'Trampoline.js',
        gODir +'Dialogue.js',
        gODir +'BreakableGround.js']

    };
    window.addEventListener('DOMContentLoaded', function () {
        //first load engine file if specified
        var s = d.createElement('script');
        s.src = c.engineDir + 'platform/jsloader.js';
        d.body.appendChild(s);
        document.ccConfig = c;
        s.id = 'cocos2d-html5';
    });
})();