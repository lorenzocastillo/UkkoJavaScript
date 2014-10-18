var Trampoline = cc.Sprite.extend({

        _currentRotation:0,
    _world : null,
    _cache : null,
    _body : null,
    _className : "Trampoline",
    _characterState: "kStateIdle",
    _deathAnim:null,
    _springAnim:null,
    _height:0,
    _ukko:null,
    _fixture:null,
    _directions:[],
    _directionNum:0,
    _startMoving:false,
    _type:0,
    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this.setDisplayFrame(this._cache.getSpriteFrame("Trampoline0.png"));
        this.createBody();
        this._tag=TAG.kTrampoline;
        this.setUpAnimations();
        this.changeState("kStateIdle");
        var b2Vec2 = Box2D.Common.Math.b2Vec2;
        this._directions = [new b2Vec2(1.5,0), new b2Vec2(-1.5,0),new b2Vec2(0,.75),new b2Vec2(0,-.75)];
        this._directionNum = 0;
        this.scheduleUpdate();


    },
    animWithName:function(name,frameVals,delay){
        var animFrames = [];
        var str = "";
        //console.log(frameVals[1]);
        for (var i = 0; i < frameVals.length ; i++){
            str = name + frameVals[i] + ".png";
            //console.log(str);
            var frame = this._cache.getSpriteFrame(str);
            animFrames.push(frame);
        }
        return cc.Animation.create(animFrames, delay);

    },
    setUpAnimations:function(){
        this._springAnim = this.animWithName(this._className,[1,0],0.08);
    },
    changeState:function(state){
        if (state===null) return;
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "kStateSpring":
                action = cc.Sequence.create(cc.Animate.create(this._springAnim),cc.CallFunc.create(this.changeState,this,'kStateIdle'));
                break;
            case "kStateIdle":
                this.setDisplayFrame(this._cache.getSpriteFrame("Trampoline0.png"));
                break;
            case "kStateDead":
                action = cc.FadeOut.create(0.10);
                break;
            case "kStateIn":
                this._body.GetFixtureList().SetSensor(true);
                this._tag = 1000;
                this.setDisplayFrame(this._cache.getSpriteFrame("Trampoline2.png"));
                //this.setScale(0.9);
                break;
            case "kStateOut":
                this._body.GetFixtureList().SetSensor(false);
                this._tag = TAG.kTrampoline;
                this.setDisplayFrame(this._cache.getSpriteFrame("Trampoline0.png"));
                //this.setScale(1.0);
                break;
            default:
              //code to be executed if n is different from case 1 and 2
            }
        if (action!==null){
            this.runAction(action);
        }

    },
        createBody:function(){
        //console.log('create Body');
        var b2Vec2 = Box2D.Common.Math.b2Vec2
            , b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2World = Box2D.Dynamics.b2World
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
            ;
        this._Vec = b2Vec2;
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_kinematicBody;
        //console.log(PTM_RATIO);
        bodyDef.position.Set(this.getPosition().x / PTM_RATIO, this.getPosition().y / PTM_RATIO);
        bodyDef.userData = this;
        this._body = this._world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        this._height = this.getContentSize().height*.1/PTM_RATIO;
        dynamicBox.SetAsOrientedBox(this.getContentSize().width*.425/PTM_RATIO, this.getContentSize().height*.1/PTM_RATIO,new b2Vec2(0,(this.getContentSize().height*.5/PTM_RATIO)-this._height),0);//These are mid points for our 1m box
        
        // Define the dynamic body fixture.
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.0;
        fixtureDef.restitution = 0.0;
        this._fixture = this._body.CreateFixture(fixtureDef);
        
    },
    update:function(dt){
        if(this.getOpacity()===0 && this._characterState==="kStateDead"){
            this.stopAllActions();
            if (this._body!==null){
                this._world.DestroyBody(this._body);
                this._body=null;
            }
            this.unscheduleAllCallbacks();
        }
        if (this._type==1 && this._startMoving){ //side to sidee with touch
            this._body.SetLinearVelocity(this._directions[this._directionNum%2]);
        }
        if (this._type==4){ //side to side NO TOUCH
            this._body.SetLinearVelocity(this._directions[this._directionNum%2]);
        }
        if (this._type==5  && this._startMoving){ //up and down with touch
            this._body.SetLinearVelocity(this._directions[(this._directionNum%2) + 2]);
        }
        if (this._type==2){
            if (BUTTON){
                if (this._characterState!=="kStateSpring"){
                    this.changeState('kStateIn');
                }
            }
            else{
               if (this._characterState!=="kStateSpring"){
                    this.changeState('kStateOut');
                }
            }
        }
        if (this._type==3){
            if (BUTTON){
                if (this._characterState!=="kStateSpring"){
                    this.changeState('kStateOut');
                }
            }
            else{
               if (this._characterState!=="kStateSpring"){
                    this.changeState('kStateIn');
                }
            }
        }

    },
    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});