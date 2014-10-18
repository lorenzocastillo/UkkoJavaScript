var Waterfall = PhysicsSprite.extend({
    _currentRotation:0,
    _className : "Waterfall",
    _characterState: "kStateIdle",
    _locked:null,
    _ukkoInPos:false,
    ctor:function(x,y,world){

        this.init();
        
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this.setDisplayFrame(this._cache.getSpriteFrame("Waterfall0.png"));
        this.setAnchorPoint(new cc.Point(this._anchorPoint.x,1.0));
        this._tag=TAG.kDoor;

        this.setUpAnimations();
        this.changeState("kStateIdle");
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
        this._idleAnim = this.animWithName(this._className,[0,1,2,3,4],0.08);

        //this.runAction(cc.RepeatForever.create(cc.Animate.create(walkAnim)));
    },
    changeState:function(state){
        if (state===null) {return;}
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "kStateIdle":
                action = cc.RepeatForever.create(cc.Animate.create(this._idleAnim));
                break;
            case "kStateDead":
                action = cc.Sequence.create(cc.Animate.create(this._deathAnim),cc.FadeOut.create(0));
                break;
            default:
              //code to be executed if n is different from case 1 and 2
            }
        if (action!==null){
            this.runAction(action);
        }

    },

    update:function(dt){
        

    },
    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});