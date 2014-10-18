var BreakableGround = cc.Sprite.extend({

    _currentRotation:0,
    _world : null,
    _cache : null,
    _body : null,
    _className : "Rock",
    _characterState: "kStateIdle",
    _deathAnim:null,
    _idleAnim:null,
    _height:0,
    _ukko:null,
    _fixture:null,
    audioEngine:null,
    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this.setDisplayFrame(this._cache.getSpriteFrame("Rock0.png"));
        this.createBody();
        this._tag=TAG.kBreakableGround;
        this.setUpAnimations();
        this.changeState("kStateIdle");
        this.audioEngine = cc.AudioEngine.getInstance();
        this.scheduleUpdate();
    },
    animWithName:function(name,start,end,delay){
        var animFrames = [];
        var str = "";
        for (var i = start; i <= end; i++) {
            // Obtain frames by alias name
            str = name + (i < 10 ? (i) : i) + ".png";
            //cc.log(str);
            var frame = this._cache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        return cc.Animation.create(animFrames, delay);

    },
    setUpAnimations:function(){
        this._deathAnim = this.animWithName(this._className,0,4,0.05);
    },
    changeState:function(state){
        if (state===null) return;
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "kStateIdle":
                break;
            case "kStateDead":
                if (this.audioEngine!==null){
                    this.audioEngine.playEffect("Sounds/rock_destroyed.mp3");
                }
                action = cc.Sequence.create(cc.Animate.create(this._deathAnim),cc.FadeOut.create(0.2));
                //action = cc.Animate.create(this._deathAnim);
                break;
            default:
              //code to be executed if n is different from case 1 and 2
            }
        if (action!==null){
            this.runAction(action);
        }

    },
        createBody:function(){
        ////cc.log('create Body');
        var b2Vec2 = Box2D.Common.Math.b2Vec2
            , b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2World = Box2D.Dynamics.b2World
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
            ;
        this._Vec = b2Vec2;
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_staticBody;
        //cc.log(PTM_RATIO);
        bodyDef.position.Set(this.getPosition().x / PTM_RATIO, this.getPosition().y / PTM_RATIO);
        bodyDef.userData = this;
        this._body = this._world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        dynamicBox.SetAsBox(this.getContentSize().width*.5/PTM_RATIO, this.getContentSize().height*.5/PTM_RATIO);//These are mid points for our 1m box
        this._height = this.getContentSize().height*.5/PTM_RATIO;
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
        if (this._ukko!==null){
            if (this._ukko._cannonball){
                this._fixture.SetSensor(true);
            }
            else{
                this._fixture.SetSensor(false);
            }
        }
    },
    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});