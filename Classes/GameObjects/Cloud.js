var Cloud = PhysicsSprite.extend({
    _currentRotation:0,
    _className : "Cloud",
    _idleAnim:null,

    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this._tag= TAG.kOneSidedPlatform;
        this._type = TAG.kCloud;
        
        this.setDisplayFrame(this._cache.getSpriteFrame("Cloud0.png"));
        this.setUpAnimations();
        this.createBody();
        this.changeState("kStateIdle");
        this.scheduleUpdate();
        CLOUDXPOS = this._body.GetPosition().x;

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
        cc.log(PTM_RATIO);
        bodyDef.position.Set(this.getPosition().x / PTM_RATIO, this.getPosition().y / PTM_RATIO);
        bodyDef.userData = this;
        bodyDef.allowSleep = true;
        bodyDef.isSleeping = false;
        bodyDef.fixedRotation = true;
        this._body = this._world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        this._height = this.getContentSize().height*.05/PTM_RATIO;
        dynamicBox.SetAsBox(this.getContentSize().width*.5/PTM_RATIO, this.getContentSize().height*.05/PTM_RATIO);//These are mid points for our 1m box
        
        // Define the dynamic body fixture.
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 100.0;
        fixtureDef.restitution = 0.0;
        this._body.CreateFixture(fixtureDef);
        
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
        this._idleAnim = this.animWithName(this._className,0,4,0.1);
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
        if (this._ukko!==null){
            var xVel = this._body.GetLinearVelocity().x;
            var yVel = this._body.GetLinearVelocity().y;
            if (xVel < 5.0 && yVel < 3.0){
                //cc.log("up up and away " + yVel);
                this._body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2 (xVel + 0.25,2.0));
                this._ukko._body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2 (xVel + 0.25,2.0));
            }
        }
    },
    
});