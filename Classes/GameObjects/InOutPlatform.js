var InOutPlatform = OneSidedPlatform.extend({

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
        this.changeState("kStateIdle");
        this.scheduleUpdate();

        //this.changeState("kStateIdle");

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
                this._body.GetFixtureList().SetSensor(false);
                this._tag = TAG.kOneSidedPlatform;
                this.setDisplayFrame(this._cache.getSpriteFrame("Platform0.png"));
                //this.setScale(1.0);
                break;
            case "kStateDead":
                this._body.GetFixtureList().SetSensor(true);
                this._tag = 1000;
                this.setDisplayFrame(this._cache.getSpriteFrame("Platform1.png"));
                //this.setScale(0.9);
                break;
            default:
              //code to be executed if n is different from case 1 and 2
            }
        if (action!==null){
            this.runAction(action);
        }

    },
    update:function(dt){
        if (this._type === 0){

            if (BUTTON){
                if (this._characterState!=="kStateDead"){
                    this.changeState('kStateDead');
                }
            }
            else{
               if (this._characterState!=="kStateIdle"){
                    this.changeState('kStateIdle');
                }
            }
        }
        else if (this._type === 1){

            if (BUTTON){
                if (this._characterState!=="kStateIdle"){
                    this.changeState('kStateIdle');
                }
            }
            else{
               if (this._characterState!=="kStateDead"){
                    this.changeState('kStateDead');
                }
            }
        }

    },

    
    handleTouch:function(touchLocation)
    {

    },
    handleTouchMove:function(touchLocation){

    }
});