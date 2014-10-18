var DreamFairy = PhysicsSprite.extend({

    _flapWingsAnim:null,
    _counter:0,
    _xOffset:0,
    _yOffset:0,
    _sinX:0,
    _targetPos:[],
    _dialogue:null,
    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this._tag= TAG.kFairy;
        this._className = "DreamFairy";
        this.setDisplayFrame(this._cache.getSpriteFrame("DreamFairy0.png"));
        this.setUpAnimations();
        this.changeState("kStateFlying");
        this.createBody();
        this.setScale(.75);
        this.scheduleUpdate();

    },
    changeState:function(state){
        if (state===null) {return;}
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "kStateFlying":
                action = cc.RepeatForever.create(cc.Animate.create(this._flapWingsAnim));
                break;
            case "kStateInDoor":
                action = cc.Spawn.create(cc.RepeatForever.create(cc.Animate.create(this._flapWingsAnim)),cc.FadeOut.create(.2));
                break;
            default:
              //code to be executed if n is different from case 1 and 2
            }
        if (action!==null){
            this.runAction(action);
        }

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
        this._flapWingsAnim = this.animWithName(this._className,0,1,0.08);

        //this.runAction(cc.RepeatForever.create(cc.Animate.create(walkAnim)));
    },
    createBody:function(){
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
    update:function(dt){
        //this.setPosition(this._xOffset+this._ukko.getPosition().x,this._yOffset+this._ukko.getPosition().y);
        var ukkoVel = this._ukko._body.GetLinearVelocity();
        var xPos = this._body.GetPosition().x;
        var yPos = this._body.GetPosition().y;
        var posIndex = 0;
        if (this._ukko.isFlippedX()){
            posIndex = 1;
        }
        if (this._body.GetPosition().x>this._ukko._body.GetPosition().x){
            this.setFlipX(true);
        }
        else{this.setFlipX(false);}
        if (this._ukko._cannonball){
            posIndex=2;
        }

        if (this._ukko._characterState==="kStateInDoor"){
            posIndex=2;
            if (this._characterState!=="kStateInDoor"){
                this.changeState("kStateInDoor");
            }
        }
        var monkeyBarFactor = 1.0;
        if (this._ukko._onMonkeyBar){
            monkeyBarFactor = 0.0;
        }
        this._targetPos[0] = new Box2D.Common.Math.b2Vec2(this._ukko._body.GetPosition().x + this._xOffset/PTM_RATIO, this._ukko._body.GetPosition().y+ (monkeyBarFactor*this._yOffset/PTM_RATIO) + Math.sin(this._sinX)/10);
        this._targetPos[1] = new Box2D.Common.Math.b2Vec2(this._ukko._body.GetPosition().x - this._xOffset/PTM_RATIO, this._ukko._body.GetPosition().y+ (monkeyBarFactor*this._yOffset/PTM_RATIO) + Math.sin(this._sinX)/10);
        this._targetPos[2] = new Box2D.Common.Math.b2Vec2(this._ukko._body.GetPosition().x, this._ukko._body.GetPosition().y+ this._yOffset/PTM_RATIO);
        var scale = 4.0;

        this._body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(scale*-(xPos-this._targetPos[posIndex].x),scale*-(yPos-this._targetPos[posIndex].y)));
        /*if (this._body.GetLinearVelocity().x!==0){
            if (this._dialogue._characterState!=="kStateOff"){
                this._dialogue.changeState("kStateOff");
            }
        }*/

        this._sinX+=.1;
    },
    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});