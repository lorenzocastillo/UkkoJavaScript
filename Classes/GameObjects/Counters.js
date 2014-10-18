var Counters = PhysicsSprite.extend({
    _currentRotation:0,
    _className : "OrbMeter",
    _characterState: "kStateIdle",
    _locked:null,
    _ukkoInPos:false,
    _orbCounterAnim:null,
    _lifeCounterAnim:null,
    _orbGoldCounterAnim:null,
    _animStarted:false,
    _middlePoint:null,
    ctor:function(x,y,t){

        this.init();
        this._middlePoint = new cc.Point(x,y);
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        
        this.setUpAnimations();
        if (t===0){
            this.setDisplayFrame(this._cache.getSpriteFrame("OrbMeter0.png"));
        }
        else if (t===1){
            this.setDisplayFrame(this._cache.getSpriteFrame("OrbMeter3.png"));
            this.setAnchorPoint(new cc.Point(0.5,0));
            this.setPosition(x,y-this.getContentSize().height*.35);
        }else if (t===2){ //water
            this.setDisplayFrame(this._cache.getSpriteFrame("OrbMeter3.png"));
            this.setPosition(x,y-this.getContentSize().height*.35);
            this.setScaleY(1.05);
            this.changeState("orbCounterAnim");
        }else if (t===3){ //gold
            this.setDisplayFrame(this._cache.getSpriteFrame("OrbMeter10.png"));
            this.setPosition(x,y-this.getContentSize().height*.35);
            this.setScaleY(1.05);
            this.changeState("orbGoldCounterAnim");
        }
        this._type = t;
        this.setVisible(false);
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
        this._orbCounterAnim = this.animWithName(this._className,[4,5,6],0.2);
        this._lifeCounterAnim = this.animWithName(this._className,[11,1,2,1,11],0.07);
        this._orbGoldCounterAnim = this.animWithName(this._className,[8,9,10],0.2);

        //this.runAction(cc.RepeatForever.create(cc.Animate.create(walkAnim)));
    },
    changeState:function(state){
        if (state===null) return;
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "orbCounterAnim":
                if (!ORBLIFE){
                    action = cc.RepeatForever.create(cc.Animate.create(this._orbCounterAnim));
                }
                break;
            case "lifeCounterAnim":
                action = cc.Animate.create(this._lifeCounterAnim);
                break;
            case "orbGoldCounterAnim":
                action = cc.RepeatForever.create(cc.Animate.create(this._orbGoldCounterAnim));
                break;

            default:
              //code to be executed if n is different from case 1 and 2
            }
        if (action!==null){
            this.runAction(action);
        }

    },

    update:function(dt){

        if ((ORBS >=100 || ORBS === 0) && ORBCHANGED){
            if (this._type===0 && !this._animStarted){
                this._animStarted=true;
                this.changeState("lifeCounterAnim");
            }
            if (this._type === 1 || this._type == 1){
                this.setDisplayFrame(this._cache.getSpriteFrame("OrbMeter7.png"));
            }
        }
        else{
            if (!ORBLIFE && !ORBCHANGED && !LIFECHANGED){

                if (this._type === 0){
                    this._animStarted = false;
                    this.setDisplayFrame(this._cache.getSpriteFrame("OrbMeter0.png"));
                }
                if (this._type === 1){ //blue fillbar 
                    var scaleSize = .1 + ORBS/55.0; //when orbs=100, 100/50 = 2, so it would be at max
                    var newPos = (this._middlePoint.y-this.getContentSize().height*.3)- this.getContentSize().height*.22*scaleSize;
                    this.setPosition(this.getPosition().x,newPos);
                    this.setScaleY(scaleSize);
                    this.setDisplayFrame(this._cache.getSpriteFrame("OrbMeter3.png"));
                    
                }
                if (this._type===2 || this._type===3){
                    var newPos =(this._middlePoint.y-this.getContentSize().height*.35) + this.getContentSize().height*.64*(ORBS/100.0);
                    this.setPosition(this._middlePoint.x,newPos);
                    if (this._type === 3){
                        this.setVisible(false);
                    }
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