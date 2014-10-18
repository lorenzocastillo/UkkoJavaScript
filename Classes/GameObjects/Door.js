var Door = PhysicsSprite.extend({
    _currentRotation:0,
    _className : "Door",
    _characterState: "kStateIdle",
    _locked:null,
    _ukkoInPos:false,
    ctor:function(x,y,type){

        this.init();
        
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this.setDisplayFrame(this._cache.getSpriteFrame("Door3.png"));
        this.setAnchorPoint(new cc.Point(this._anchorPoint.x,0));
        this._tag=TAG.kDoor;
        this.setUpAnimations();
        this.setOpacity(0);
        this._locked = DOORLOCKED;
        this._type = type;
        this.changeState('kStateIdle');
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
        this._idleAnim = this.animWithName(this._className,[2,3,3],0.15);
        this._deathAnim = this.animWithName(this._className,[3,2],0.05);

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
                
                action = cc.Sequence.create(cc.FadeIn.create(0),cc.Animate.create(this._idleAnim));
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
        //if (this._type>100){return;}
        if (this._ukko===null){return;}

        if ((this._ukko.getPosition().x > this.getPosition().x - (this.getContentSize().width*.1)) && this._ukko.getPosition().x < this.getPosition().x+ (this.getContentSize().width*.1)){
            this._ukkoInPos = true;
        }
        if (!this._locked){
            if (this._ukko._onDoor && this._characterState!=="kStateDead"){
                this.changeState("kStateDead");
            }
            else if (!this._ukko._onDoor && this._characterState!=="kStateIdle"){
                this.changeState("kStateIdle");
            }
        }
        else{

        }
    },
    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});