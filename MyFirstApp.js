
var PTM_RATIO = 64.0;
var velocityIterations = 8;
var positionIterations = 3;
var FIXED_TIMESTEP = 1 / 60.0;
var fixedTimestepAccumulator = 0; 
var fixedTimestepAccumulatorRatio = 0;

var context = document.getElementById("gameCanvas").getContext("2d");
var TAG = { kGround:0, kUkko:1, kPowerUpTypeOrb:2, kMonkeyBar:3, kPowerUpTypeLife:4, kDoor:5, kOneSidedPlatform:6, kKey:7, kBreakableGround:8, kTrampoline:9 ,kSceneChanger:10, kBrokenPlatform: 11, kPlatformSensor: 12, kButton:13, kCloud:14, kCloudSensor:15, kFairy:16, kDialogueBox:17};

var MAX_VOLUME = .1;
var MAX_FX_VOLUME = .2;

var MyFirstApp = cc.Layer.extend(


{   _ukko:null,
    world:null,
    size: null,
    map: null,
    batchNode:null,
    cache:null,
    scale:1.0,
    pos:null,
    BG:null,
    BG2:null,
    prevUkkoPos:null,
    tipLabel:null,
    audioEngine:null,
    foregroundLayer:null,
    init:function(){

        this._super();

        this.audioEngine = cc.AudioEngine.getInstance();
        if (this.audioEngine!==null){
            this.audioEngine.playMusic("Sounds/Michael La Manna - In the secret laboratory.mp3",true);
            this.audioEngine.setMusicVolume(0);
            this.audioEngine.setEffectsVolume(MAX_FX_VOLUME);
        }


        if (GAMEISOVER){

            var size = cc.Director.getInstance().getWinSize();
            this.size = size;
            this.tipLabel = cc.LabelBMFont.create("that's all folks!\ni hope you enjoyed playing\n it as much as i enjoyed making it.\n\n                    -lorenzo","Fonts/UkkoGold32.fnt");
            this.tipLabel.setPosition(this.size.width*.5,this.size.height*.5);
            this.addChild(this.tipLabel, -1);
            return;

        }
        ORBSCHANGED = false;
        LIFECHANGED = false;
        ORBLIFE = false;

        this.setKeyboardEnabled(true);
        this.setAnchorPoint(new cc.Point(0,0));
        //DOORDESTINATION=3;

        var size = cc.Director.getInstance().getWinSize();
        this.size = size;

        var tileMapNames = ["Images/TileMaps/IntroLevel0.tmx","Images/TileMaps/IntroLevel1.tmx","Images/TileMaps/IntroLevel2.tmx","Images/TileMaps/IntroLevel3.tmx","Images/TileMaps/IntroLevel4.tmx"];
        this.map = cc.TMXTiledMap.create(tileMapNames[DOORDESTINATION]);
        this.addChild(this.map, -1, 0);


        this.foregroundLayer = this.map.getLayer("Foreground");
        this.foregroundLayer.removeFromParent();
        this.addChild(this.foregroundLayer,100);

        this.cache = cc.SpriteFrameCache.getInstance();
        if (this.cache.getSpriteFrame("Ukko0.png")===undefined){ //make sure it is not adding extra stuff the cache after each load
            this.cache.addSpriteFrames("Images/SpriteSheets/PlayerSpriteSheet.plist", "Images/SpriteSheets/PlayerSpriteSheet.png");
        }
        
        
        this.batchNode = cc.SpriteBatchNode.create("Images/SpriteSheets/PlayerSpriteSheet.png", 500);

        this.addChild(this.batchNode, -1, 0);
        BATCH = this.batchNode;

 
        /*----------------------------------------------------------------

                                        BOX2D

        ------------------------------------------------------------------*/


        var b2Vec2 = Box2D.Common.Math.b2Vec2
            , b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2World = Box2D.Dynamics.b2World
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
            ;
        

        // varruct a world object, which will hold and simulate the rigid bodies.
 
        this.world = new b2World(new b2Vec2(0, -10), true);
        this.world.SetContinuousPhysics(true);
        //this.setUpdebugDraw();

        var listener = ContactListener;
        this.world.SetContactListener(listener);
    
        /*----------------------------------------------------------------

                                        Populate World

        ------------------------------------------------------------------*/
        
        var ukkosSpawnPos = [];
        ukkosSpawnPos[0] = new cc.Point(size.width*0.2,size.height*0.485); 
        ukkosSpawnPos[1] = new cc.Point(size.width*0.35,size.height*1.75); //size.width*.45,size.height*3 size.width*5,size.height*2 size.width*8,size.height*.75
        ukkosSpawnPos[2] = new cc.Point(size.width*0.65,size.height*0.6); //size.width*0.65,size.height*0.6
        ukkosSpawnPos[3] = new cc.Point(size.width*0.1,size.height*0.4);
        ukkosSpawnPos[4] = new cc.Point(size.width*0.26,size.height*0.4);


        ////cc.log("x: " + ukkosSpawnPos[DOORDESTINATION].x + " y: " + ukkosSpawnPos[DOORDESTINATION].y);
        this._ukko = new Ukko(ukkosSpawnPos[DOORDESTINATION].x,ukkosSpawnPos[DOORDESTINATION].y,this.world);
        this.batchNode.addChild(this._ukko,10, TAG.kUkko);
        this._ukko._levelWidth = this.map.getContentSize().width/PTM_RATIO;
        this.prevUkkoPos = this._ukko.getPosition();

        var xOffset = -this._ukko.getContentSize().width*0.4;
        var yOffset = this._ukko.getContentSize().height*0.4;
        var fairy = new DreamFairy(ukkosSpawnPos[DOORDESTINATION].x+xOffset,ukkosSpawnPos[DOORDESTINATION].y+yOffset,this.world);
        this.batchNode.addChild(fairy,9);
        fairy._ukko = this._ukko;
        fairy._xOffset = xOffset;
        fairy._yOffset = yOffset;

        if (DOORDESTINATION === 1){
            this._ukko._cannonball= true;
            this._ukko.changeState("kStateAttacking");
        }
        if (DOORDESTINATION === 2 || DOORDESTINATION === 3){
            BUTTON = false;
        }

        /*----------------------------------------------------------------

                                        Draw from TileMap

        ------------------------------------------------------------------*/
        this.drawTileWithNameAndTag("Ground",TAG.kGround);
        this.drawTileWithNameAndTag("MonkeyBar",TAG.kMonkeyBar);
        this.drawTileWithNameAndTag("DialogueBox",TAG.kDialogueBox);
        this.drawTileWithNameAndTag("Doors",TAG.kDoor);
        this.drawTileWithNameAndTag("SceneChanger",TAG.kSceneChanger);
        this.drawTileWithNameAndTag("Wall",10000);
        this.drawTileWithNameAndTag("BrokenPlatform",TAG.kBrokenPlatform);
        this.drawTileWithNameAndTag("PlatformSensor",TAG.kPlatformSensor);
        this.drawTileWithNameAndTag("CloudSensor",TAG.kCloudSensor);

        this.drawObject("Orb",Orb,TAG.kPowerUpTypeOrb);
        this.drawObject("Life",Life,TAG.kPowerUpTypeLife);
        this.drawObject("OneSidedPlatform",OneSidedPlatform,TAG.kOneSidedPlatform);
        this.drawObject("Trampoline",Trampoline,TAG.kTrampoline);

        this.drawObject("BreakableGround",BreakableGround,TAG.kBreakableGround);
        this.drawObject("WaterfallPlatform",WaterfallPlatform,TAG.kOneSidedPlatform);


        this.drawObject("InOutPlatform",InOutPlatform,TAG.kOneSidedPlatform);
        this.drawObject("Button",Button,TAG.kButton);

        

        this.drawObject("Cloud",Cloud,TAG.kOneSidedPlatform);
        this.drawObject("Waterfall",Waterfall,TAG.kOneSidedPlatform);
        this.drawObject("Flame",Flame,TAG.kOneSidedPlatform);
                
        this.drawPolys("Poly",TAG.kGround);


        /*----------------------------------------------------------------

                    Reposition Layer Based on Ukko's Position

        ------------------------------------------------------------------*/
        var xPos = 0;
        var yPos = 0;
        if (this._ukko.getPosition().x>this.size.width*.35){
            xPos = this._ukko.getPosition().x;
        }
        if (this._ukko.getPosition().y>this.size.height*.5){
            yPos= this.size.height*.5;
        }
        this.setPosition(new cc.Point(xPos,-yPos));


        this.scheduleUpdate();


        return true;
    },

       createBox: function(width,height,pX,pY,type,data,isSensor){
            var b2Vec2 = Box2D.Common.Math.b2Vec2
                , b2BodyDef = Box2D.Dynamics.b2BodyDef
                , b2Body = Box2D.Dynamics.b2Body
                , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
                , b2World = Box2D.Dynamics.b2World
                , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
                ;

            var bodyDef = new b2BodyDef();
            bodyDef.type = type;
            bodyDef.position.Set(pX/PTM_RATIO,pY/PTM_RATIO);
            bodyDef.userData=data;
            var polygonShape = new b2PolygonShape();
            polygonShape.SetAsBox(width/2/PTM_RATIO,height*.5/PTM_RATIO);

            var fixtureDef = new b2FixtureDef();
            fixtureDef.density = 1.0;
            fixtureDef.friction = 0.0;
            fixtureDef.restitution = 0.0;
            if (isSensor){
                fixtureDef.isSensor=true;
            }

            fixtureDef.shape = polygonShape;
            var body=this.world.CreateBody(bodyDef);
            body.CreateFixture(fixtureDef);
            if (type === b2Body.b2_dynamicBody){
                body.SetGravityScale(0);
            }

    },
    drawObject: function(objectName, className,tag){
        var b2Body = Box2D.Dynamics.b2Body;
        var group = this.map.getObjectGroup(objectName);
        if (group === null){
            return;
        }
        var array = group.getObjects();
        var dict;

        for (var i = 0, len = array.length; i < len; i++) {
            dict = array[i];
            if (!dict)
                break;
            var x = dict["x"];
            var y = dict["y"];
            var width = dict["width"];
            var height = dict["height"];

            x = x + (width*0.5);
            y = y + (height*0.5);

            var sprite = new className(x,y,this.world);
            if (objectName !== "Flame"){
                this.batchNode.addChild(sprite,1,tag);
            }else{
                this.addChild(sprite,1000,tag);
            }
            if (tag===TAG.kBreakableGround || tag === TAG.kDoor){
                sprite._ukko = this._ukko;
                if (tag === TAG.kBreakableGround){
                    this.batchNode.reorderChild(sprite,100000);
                    //cc.log("REORDERING CHILD");
                }
            }
            if (objectName==="Cloud"){
                sprite.setZOrder(1000);
                return;
            }
            if (tag===TAG.kTrampoline || tag === TAG.kPowerUpTypeOrb || tag === TAG.kOneSidedPlatform){
                var type = dict["Type"];
                if (type === undefined){
                    type = 0;
                }

                type = parseInt(type);
                if ((type<100) && tag===TAG.kPowerUpTypeOrb){
                    sprite.setScale(0.7);
                }
                if (type>=100){
                    type-=100;
                }
                sprite._type = type;
            }


            //cc.log(x + " " + y + " " + height + " " + width + " " + tag + " "+ objectName);
            
        }
    },
    drawPolys: function(objectName,tag){
        var b2BodyDef = Box2D.Dynamics.b2BodyDef
                , b2Body = Box2D.Dynamics.b2Body
                , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
                , b2World = Box2D.Dynamics.b2World;

        var b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;
        var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
        var b2Vec2 = Box2D.Common.Math.b2Vec2;

        var shape, oldCoord;
        var group = this.map.getObjectGroup(objectName);

        if (group === null){
            return;
        }
        var array = group.getObjects();
        var dict;
        for (var i = 0, len = array.length; i < len; i++) {
            //cc.log("array length" + array.length);
            dict = array[i];
            if (!dict)
                break;
            var x = dict["x"];
            var y = dict["y"];
            var poly = dict["polyline"];

            var stringPointArray = poly.replace(/ /g,",");
            stringPointArray = stringPointArray.split(",");

            var pointArray = [];
            var fX, fY;
            var n = stringPointArray.length;
            shape = new b2PolygonShape();
            for (var k = 0, j = 0; j < n; ++k ){
                fX = parseInt(stringPointArray[j])/PTM_RATIO;
                ++j;
                fY = -parseInt(stringPointArray[j])/PTM_RATIO;
                ++j;
                ////cc.log(fX + " " + fY);
                pointArray.push(new b2Vec2(fX,fY));
                if (j === n){
                    shape.SetAsArray(pointArray, n/2);

                }

            }
            var sprite = new PhysicsSprite();
            sprite._tag = tag;
            this.addChild(sprite,-1);

            var bodyDef = new b2BodyDef() ;
            bodyDef.position.Set(x/PTM_RATIO, y/PTM_RATIO);
            var body = this.world.CreateBody(bodyDef);
            body.SetUserData(sprite);
            
            var fixtureDef = new b2FixtureDef() ;
            fixtureDef.friction = 1000.0; 
            fixtureDef.shape = shape;

            body.CreateFixture(fixtureDef);
            
        }
    },
    drawTileWithNameAndTag: function(objectName,tag){
        var b2Body = Box2D.Dynamics.b2Body;
        var group = this.map.getObjectGroup(objectName);
        if (group === null){
            //cc.log("No Objects found");
            return;
        }
        var array = group.getObjects()
        var dict;
        var isSensor = false;
        if (tag===TAG.kMonkeyBar || tag === TAG.kDoor || tag === TAG.kSceneChanger || tag === TAG.kBrokenPlatform || tag === TAG.kPlatformSensor || tag ===TAG.kCloudSensor || tag===TAG.kDialogueBox){
            isSensor=true;
        }
        var bodyType = b2Body.b2_staticBody;
        if (tag === TAG.kPlatformSensor){
            bodyType = b2Body.b2_dynamicBody;
        }
        for (var i = 0, len = array.length; i < len; i++) {
            dict = array[i];
            if (!dict)
                break;
            var x = dict["x"];
            var y = dict["y"];
            var width = dict["width"];
            var height = dict["height"];

            x = x + (width*0.5);
            y = y + (height*0.5);
            var sprite = new PhysicsSprite();
            sprite._tag = tag;
            this.addChild(sprite,-1); 
            if (tag===TAG.kDoor){
                var doorDestination = dict["DoorDestination"];
                //cc.log("DD " + doorDestination);
                doorDestination = parseInt(doorDestination);
                var door = new Door(x,y,doorDestination);
                this.batchNode.addChild(door,-100);
                door._ukko = this._ukko;
                sprite._type = doorDestination;
    
            }
            else if (tag===TAG.kSceneChanger){
                var doorDestination = dict["DoorDestination"];
                doorDestination = parseInt(doorDestination);
                sprite._type = doorDestination;
            }
            else if (tag===TAG.kBrokenPlatform){
                //cc.log("BrokenPlatform");
                sprite.setPosition(new cc.Point(x,y));
                sprite.setDisplayFrame(this.cache.getSpriteFrame("BrokenPlatform0.png"));
            }

            //cc.log(x + " " + y + " " + height + " " + width + " " + tag + " "+ objectName + " " + isSensor);
            this.createBox(width,height,x,y,bodyType,sprite,isSensor);

        }

    },
    singleStep:function(dt){
        this.world.Step(dt, velocityIterations, positionIterations);
    },
    resetSmoothStates:function(){
        for (var b = this.world.GetBodyList(); b; b = b.GetNext()) {
            if (b.GetUserData() != null) {
                var myActor = b.GetUserData();    
                myActor.setPosition(cc.p(b.GetPosition().x * PTM_RATIO, b.GetPosition().y * PTM_RATIO));
                myActor.setRotation(-1 * cc.RADIANS_TO_DEGREES(b.GetAngle()));
                b.SetPreviousPosition(b.GetPosition());
 
            }
        }
    },
    smoothStates:function(){

        var oneMinusRatio = 1.0 - fixedTimestepAccumulatorRatio;

        for (var b = this.world.GetBodyList(); b; b = b.GetNext()) {
            if (b.GetUserData() != null) {
                //Synchronize the AtlasSprites position and rotation with the corresponding body
                var myActor = b.GetUserData();
                var prevPos = b.previousPosition;
                var curPos = b.GetPosition();

                if (Math.abs(prevPos.x-curPos.x)<.02 || Math.abs(prevPos.y-curPos.y)<.02){
                    continue; //if there isn't a significance change, sometimes the sprites seem to vibrate due to rounding error, so we ignore if it gets past this threshhold
                }
                myActor.setPosition(cc.p(((fixedTimestepAccumulatorRatio *curPos.x) + (oneMinusRatio * prevPos.x)) * PTM_RATIO, ((fixedTimestepAccumulatorRatio * curPos.y) + (oneMinusRatio * prevPos.y)) * PTM_RATIO));
                myActor.setRotation(-1 * cc.RADIANS_TO_DEGREES(b.GetAngle()));

            }
        }
    },
    update:function(dt){

        var MAX_STEPS = 5;
        fixedTimestepAccumulator += dt;
        var nSteps = Math.floor(fixedTimestepAccumulator / FIXED_TIMESTEP);

        if (nSteps > 0){
            fixedTimestepAccumulator -= nSteps * FIXED_TIMESTEP;
        }
        fixedTimestepAccumulatorRatio = fixedTimestepAccumulator / FIXED_TIMESTEP;

        var nStepsClamped = Math.min(nSteps, MAX_STEPS);


        for (var i = 0; i < nStepsClamped; ++i)
        {
            this.resetSmoothStates();
            this.singleStep(FIXED_TIMESTEP);
        }

        this.world.ClearForces();

        this.smoothStates();

        this.followPlayer();

        this.fadeInMusic();

    },
    followPlayer:function(){
        var ukkoXPos = this._ukko.getPosition().x;
        var ukkoYPos = this._ukko.getPosition().y;
        var screenThreshold = this.size.width*.35; //how far ukko will move before the layer starts scrolling
        var levelSize = this.map.getContentSize();


        
        if ((ukkoXPos > screenThreshold) && (ukkoXPos < (levelSize.width - (this.size.width-screenThreshold)))) {
            var newXPosition = screenThreshold - ukkoXPos; 
            this.setPosition(new cc.Point(newXPosition,this.getPosition().y));
        }

        screenThreshold = this.size.height*.5;

        
        var  restOfTheScreen= this.size.height- screenThreshold;

        
        if ((ukkoYPos> screenThreshold) && (ukkoYPos< (levelSize.height - restOfTheScreen))){
            var newYPosition = screenThreshold - ukkoYPos;
            this.setPosition(new cc.Point(this.getPosition().x,newYPosition));
        }

        this.prevUkkoPos = this._ukko.getPosition();

    },
    onEnter:function(){
        this._super();
    },

    onKeyUp:function(e){
        this._ukko.handleKey(e,false);

    },
    onKeyDown:function(e){
        this._ukko.handleKey(e,true);

    },
    setUpdebugDraw:function (){
        //cc.log("Setup Debug Draw");
        var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(cc.renderContext);
        ////cc.log(debugDraw);
        debugDraw.SetDrawScale(PTM_RATIO);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_controllerBit);
        
        this.world.SetDebugDraw(debugDraw);

        //debugDraw.SetOffsets({x:-(cc.Director.getInstance().getWinSize().width/2)/PTM_RATIO,y:(cc.Director.getInstance().getWinSize().height/2)/PTM_RATIO})
    },
    draw: function(ctx){

        //this.world.DrawDebugData();
    },
    fadeInMusic:function(){
        if (this.audioEngine!==null){
            if (this.audioEngine.getMusicVolume()<MAX_VOLUME && this._ukko._changeSceneCounter===0){
                this.audioEngine.setMusicVolume(this.audioEngine.getMusicVolume()+.025);
            }
        }
    },
    onExit:function(){
        if (this.world!==null){
            for (var b = this.world.GetBodyList(); b; b = b.GetNext()) {
                this.world.DestroyBody(b);
            }
        }
    }
});

var MyFirstAppScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new MyFirstApp();
        layer.init();
        this.addChild(layer);
        var hudLayer = new HUDLayer();
        hudLayer.init();
        this.addChild(hudLayer,1000);

    },
    onExit:function(){
        CANLOADSCENE = true;
    }
});
var LoadLayer = cc.Layer.extend(
{ 
    init:function(){
        var size = cc.Director.getInstance().getWinSize();
        this.size = size;
        var tipLabel = cc.LabelBMFont.create("loading...","Fonts/UkkoGold32.fnt");
        tipLabel.setPosition(this.size.width*.85,this.size.height*.05);
        this.addChild(tipLabel, -1);
        this.scheduleUpdate();
    },
    update:function(){
        this.timer++;
        if (CANLOADSCENE){
            CANLOADSCENE = false;
            this.unscheduleUpdate();
            cc.Director.getInstance().replaceScene(cc.TransitionFade.create(.25,new MyFirstAppScene()));
        }

    },
    onEnter:function(){
        this._super();        
    }

});

var LoadScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new LoadLayer();
        layer.init();
        this.addChild(layer);
    }
});
