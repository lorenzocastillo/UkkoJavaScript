var cocos2dApp = cc.Application.extend({
    config:document.ccConfig,
    ctor:function (scene) {
        this._super();
        this.startScene = scene;
        cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
        cc.setup(this.config['tag']);
        cc.Loader.getInstance().onloading = function () {
            cc.LoaderScene.getInstance().draw();
        };
        cc.Loader.getInstance().onload = function () {
            cc.AppController.shareAppController().didFinishLaunchingWithOptions();
        };
        cc.Loader.getInstance().preload([
            {type:"bgm",src:"Sounds/Michael La Manna - In the secret laboratory.mp3"},
            {type:"effect",src:"Sounds/ground_pound.mp3"},
            {type:"effect",src:"Sounds/rock_destroyed.mp3"},
            {type:"effect",src:"Sounds/orb.mp3"},
            {type:"effect",src:"Sounds/life.mp3"},
            {type:"effect",src:"Sounds/button.mp3"},
            {type:"effect",src:"Sounds/jump.mp3"},
            {type:"effect",src:"Sounds/level_passed.mp3"},
            {type:"image",src:"Images/SpriteSheets/PlayerSpriteSheet.png"},
            {type:"image",src:"Images/TileMaps/UkkoMapTiles1.png"},
            {type:"image",src:"Fonts/UkkoGold32.png"},
            {type:"fnt",src:"Fonts/UkkoGold32.fnt"},
            //{type:"fnt",src:"Fonts/UkkoBlack.fnt"},
            {type:"plist",src:"Images/SpriteSheets/PlayerSpriteSheet.plist"},
            {type:'tmx', src:'Images/TileMaps/IntroLevel0.tmx'},
            {type:'tmx', src: 'Images/TileMaps/IntroLevel1.tmx'},
            {type:'tmx', src:'Images/TileMaps/IntroLevel2.tmx'},
            {type:'tmx', src:'Images/TileMaps/IntroLevel3.tmx'},
            {type:'tmx', src:'Images/TileMaps/IntroLevel4.tmx'}
        ]);
    },
    applicationDidFinishLaunching:function () {
        var director = cc.Director.getInstance();
        director.setDisplayStats(this.config['showFPS']);
        director.setAnimationInterval(1.0 / this.config['frameRate']);
        director.runWithScene(new this.startScene());

        return true;
    }
});
var myApp = new cocos2dApp(MyFirstAppScene);