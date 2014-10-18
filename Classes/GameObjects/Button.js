var Button = PhysicsSprite.extend({

    _onAnim:null,
    _counter:0,
    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this._tag= TAG.kButton;
        this._className = "Button";
        this.setDisplayFrame(this._cache.getSpriteFrame("Button0.png"));
        this.createBody();
        this.setUpAnimations();
        this.scheduleUpdate();
        //this.changeState("kStateIdle");

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
        bodyDef.type = b2Body.b2_staticBody;
        //cc.log(PTM_RATIO);
        bodyDef.position.Set(this.getPosition().x / PTM_RATIO, this.getPosition().y / PTM_RATIO);
        bodyDef.userData = this;
        bodyDef.allowSleep = true;
        bodyDef.isSleeping = false;
        bodyDef.fixedRotation = true;
        this._body = this._world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        this._height = this.getContentSize().height*.05/PTM_RATIO;
        dynamicBox.SetAsBox(this.getContentSize().width*.35/PTM_RATIO, this.getContentSize().height*.35/PTM_RATIO);//These are mid points for our 1m box
        
        // Define the dynamic body fixture.
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.0;
        fixtureDef.restitution = 0.0;
        fixtureDef.isSensor = true;
        this._body.CreateFixture(fixtureDef);
        
    },
    changeState:function(state){
        if (state===null) {return;}
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "kStateOn":
                action = cc.Animate.create(this._onAnim);
                this.setDisplayFrame(this._cache.getSpriteFrame("Button1.png"));

                break;
            case "kStateOff":
                this.setDisplayFrame(this._cache.getSpriteFrame("Button0.png"));
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
        this._onAnim = this.animWithName(this._className,1,2,0.05);

        //this.runAction(cc.RepeatForever.create(cc.Animate.create(walkAnim)));
    },
    update:function(dt){
        if (BUTTON){
            if (this._characterState!=="kStateOn"){
                this.changeState("kStateOn");
            }
        }
        else {
            if (this._characterState!=="kStateOff"){
                this.changeState("kStateOff");
            }
        }
        this._counter++;

    }
});