var OneSidedPlatform = OneSidedPlatform.extend({

    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this.setDisplayFrame(this._cache.getSpriteFrame("Platform0.png"));
        this.createBody();
        this._tag=TAG.kOneSidedPlatform;
        this.setUpAnimations();
        this.changeState("kStateIdle");

    },

    setUpAnimations:function(){
        //this._idleAnim = this.animWithName(this._className,0,3,0.2);
    },
    changeState:function(state){
        if (state===null) {return;}
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "kStateIdle":
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
    },
    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});