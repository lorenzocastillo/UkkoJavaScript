var HUDShield = PhysicsSprite.extend({
    _currentRotation:0,
    _className : "HUDShield",
    _characterState: "kStateIdle",
    _locked:null,
    _ukkoInPos:false,
    _blinkingAnim:null,
    _orbAnim:null,
    _lifeAnim:null,
    _shieldShineAnim:null,

    ctor:function(x,y){

        this.init();
        
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this.setDisplayFrame(this._cache.getSpriteFrame("HUDShield0.png"));
        this.setUpAnimations();

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
        this._shieldShineAnim = this.animWithName(this._className,[0,5,6,5,0,5,6,5,0],0.05);
        this._lifeAnim = this.animWithName("Life",[0,1,2,3],0.2);
        this._orbAnim = this.animWithName("Orb",[0,1,2,3],0.2);
        this._blinkingAnim = this.animWithName(this._className,[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,2,1],0.1);
        //this.runAction(cc.RepeatForever.create(cc.Animate.create(walkAnim)));
    },
    changeState:function(state){
        if (state===null || state === this._characterState) return;
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "blinkAnim":
                action = cc.RepeatForever.create(cc.Animate.create(this._blinkingAnim));
            break;
            case "orbAnim":
                action = cc.RepeatForever.create(cc.Animate.create(this._orbAnim));
            break;
            case "lifeAnim":
                action = cc.RepeatForever.create(cc.Animate.create(this._lifeAnim));
            break;
            case "shieldShine":
                action = cc.Sequence.create(cc.FadeIn.create(0),cc.Animate.create(this._shieldShineAnim));
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