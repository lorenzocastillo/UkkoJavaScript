var Orb = cc.Sprite.extend({
    _currentRotation:0,
    _world : null,
    _cache : null,
    _body : null,
    _className : "Orb",
    _characterState: "kStateIdle",
    _deathAnim:null,
    _idleAnim:null,
    _sinX:0,
    audioEngine:null,
    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this.setDisplayFrame(this._cache.getSpriteFrame("Orb0.png"));
        this._tag=TAG.kPowerUpTypeOrb;
        this.setUpAnimations();
        this.createBody();
        this.changeState("kStateIdle");
        this.audioEngine = cc.AudioEngine.getInstance();
        this.scheduleUpdate();


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
        bodyDef.type = b2Body.b2_dynamicBody;
        //cc.log(PTM_RATIO);
        bodyDef.position.Set(this.getPosition().x / PTM_RATIO, this.getPosition().y / PTM_RATIO);
        bodyDef.userData = this;
        bodyDef.allowSleep = true;
        bodyDef.isSleeping = false;
        bodyDef.fixedRotation = true;
        this._body = this._world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        dynamicBox.SetAsBox(this.getContentSize().width*.15/PTM_RATIO, this.getContentSize().height*.15/PTM_RATIO);//These are mid points for our 1m box

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
            ////cc.log(str);
            var frame = this._cache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        return cc.Animation.create(animFrames, delay);

    },
    setUpAnimations:function(){
        this._idleAnim = this.animWithName(this._className,0,3,0.2);
        this._deathAnim = this.animWithName(this._className,4,6,0.06);

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
                if (this.audioEngine!==null){
                    //this.audioEngine.playEffect("Sounds/orb.mp3");
                }
                action = cc.Sequence.create(cc.Animate.create(this._deathAnim),cc.FadeOut.create(0.20));
                if (this.getScale()>.9){
                    ORBS+=5;
                }
                else{
                    ORBS+=1;
                }
                ORBCHANGED = true;
                if (ORBS>=100){
                    ORBS = 0;
                    LIVES++;
                    LIFECHANGED = true;
                    ORBLIFE = true;
                }
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
        if (this._body===null){return;}
        if (this._type === 0 ) {return;}
        else if (this._type<=10){ //going down waterfall type
            var speed;
            if (this._type==1) speed=.9;
            if (this._type==2) speed=.65;
            if (this._type==3) speed=1.0;
            //body->SetLinearVelocity(b2Vec2(0,-speed));
            //if (body->GetPosition().y<-screenSize.height*.5/PTM_RATIO){
             //   body->SetTransform(b2Vec2(startPos.x/PTM_RATIO,(screenSize.height*2)/PTM_RATIO), 0);
            //}
        }
        else if (this._type>10 && this._type<=30){
            this._sinX+=0.1;
            var amplitude=5.0;
            var startX=(this._type-11)*(3.14/8);
            this._body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(amplitude*Math.sin(startX+this._sinX),amplitude*Math.cos(startX+this._sinX)));
            //this._body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0,amplitude*Math.sin(startX+this._sinX)));
        }

    },
    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});