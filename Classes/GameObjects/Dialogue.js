var Dialogue = cc.Sprite.extend({

    _label:null,
    _fairy:null,
    ctor:function(x,y){

        this.init();
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this._className = "Dialogue";
        this.setDisplayFrame(this._cache.getSpriteFrame("SmallDialogue.png"));
        this.setOpacity(0);
        this.setFlipX(true);
        this.scheduleUpdate();
        

    },
    changeState:function(state){
        if (state===null) {return;}
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        switch(state)
            {
            case "kStateOn":
                this._label.setOpacity(255);
                this.setOpacity(255);
                this.setPosition(this._fairy.getPosition().x+this.getContentSize().width*0.45,this._fairy.getPosition().y+this.getContentSize().width*0.3);
                this._label.setPosition(this.getPosition().x,this.getPosition().y);
                break;
            case "kStateOff":
                this._label.setOpacity(0);
                this.setOpacity(0);
                break;
            default:
              //code to be executed if n is different from case 1 and 2
            }
        if (action!==null){
            this.runAction(action);
        }

    },
    update:function(dt){


    }
});