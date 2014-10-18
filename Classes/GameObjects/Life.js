var Life = cc.Sprite.extend({
    _currentRotation:0,
    _world : null,
    _cache : null,
    _body : null,
    _className : "Life",
    _characterState: "kStateIdle",
    _deathAnim:null,
    _idleAnim:null,

    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this.setDisplayFrame(this._cache.getSpriteFrame("Life0.png"));
        this._tag=TAG.kPowerUpTypeLife;
        this.setUpAnimations();
        this.createBody();
        this.changeState("kStateIdle");
        this.scheduleUpdate();


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
        bodyDef.type = b2Body.b2_dynamicBody;
        //console.log(PTM_RATIO);
        bodyDef.position.Set(this.getPosition().x / PTM_RATIO, this.getPosition().y / PTM_RATIO);
        bodyDef.userData = this;
        bodyDef.allowSleep = true;
        bodyDef.isSleeping = false;
        bodyDef.fixedRotation = true;
        this._body = this._world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        dynamicBox.SetAsBox(this.getContentSize().width*.15/PTM_RATIO, this.getContentSize().height*.35/PTM_RATIO);//These are mid points for our 1m box

        // Define the dynamic body fixture.
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.isSensor=true;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.0;
        fixtureDef.restitution = 0.0;
        this._body.CreateFixture(fixtureDef);
        this._body.SetGravityScale(0.0);
        
    },
    animWithName:function(name,start,end,delay){
        var animFrames = [];
        var str = "";
        for (var i = start; i <= end; i++) {
            // Obtain frames by alias name
            str = name + (i < 10 ? (i) : i) + ".png";
            //console.log(str);
            var frame = this._cache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        return cc.Animation.create(animFrames, delay);

    },
    setUpAnimations:function(){
        this._idleAnim = this.animWithName(this._className,0,3,0.2);
        this._deathAnim = this.animWithName(this._className,4,5,0.06);

        //this.runAction(cc.RepeatForever.create(cc.Animate.create(walkAnim)));
    },
    changeState:function(state){
        if (state===null) return;
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "kStateIdle":
                action = cc.RepeatForever.create(cc.Animate.create(this._idleAnim));
                break;
            case "kStateDead":
                action = cc.Sequence.create(cc.Animate.create(this._deathAnim),cc.FadeOut.create(0.20));
                LIVES ++;
                LIFECHANGED = true;
                break;
            default:
              //code to be executed if n is different from case 1 and 2
            }
        if (action!==null){
            this.runAction(action);
        }

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
    },
    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});