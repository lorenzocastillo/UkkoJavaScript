var WaterfallPlatform = OneSidedPlatform.extend({

    _screenSize:null,
    _speeds:null,
    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._screenSize = cc.Director.getInstance().getWinSize();
        this._cache = cc.SpriteFrameCache.getInstance();
        this._tag= TAG.kOneSidedPlatform;
        this._startPos = new cc.Point(x,y);
        this.setDisplayFrame(this._cache.getSpriteFrame("Platform0.png"));
        this.createBody();
        this._speeds = [1.2,1.75,1.25];
        this.scheduleUpdate();

        //this.changeState("kStateIdle");

    },

    setUpAnimations:function(){
        //this._idleAnim = this.animWithName(this._className,0,3,0.2);
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
        if (this._body === null){return;}
        var b2Vec2 = Box2D.Common.Math.b2Vec2;
        this._body.SetLinearVelocity(new b2Vec2(0,-this._speeds[this._type]));
        if (this._body.GetPosition().y < -this._screenSize.height*.2/PTM_RATIO){
            this._body.SetPosition(new b2Vec2 (this._startPos.x/PTM_RATIO, (this._screenSize.height*2)/PTM_RATIO));
        }
    },

    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});