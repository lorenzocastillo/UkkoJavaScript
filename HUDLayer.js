var HUDLayer = cc.Layer.extend(

{   _ukko:null,
    size: null,
    batchNode:null,
    shield:null,
    ukkoFace:null,
    orb:null,
    life:null,
   	shieldDisplay:null,
   	orbTimerSchedule:false,
   	lifeTimerSchedule:false,
   	orbCountdown:0,
   	lifeCountdown:0,
   	orbWave:null,
   	goldWave:null,
   	orbCounter:null,
   	orbFill:null,
   	cache:null,
   	orbLabel:null,
   	lifeLabel:null,
    audioEngine:null,

    init:function(){
    	this._super();

    	if (GAMEISOVER){return;}

        this.audioEngine = cc.AudioEngine.getInstance();
        
    	this.cache = cc.SpriteFrameCache.getInstance();
        this.batchNode = cc.SpriteBatchNode.create("Images/SpriteSheets/PlayerSpriteSheet.png", 50);
        this.addChild(this.batchNode, -1, 0);
        this.size = cc.Director.getInstance().getWinSize();

        this.shield = new HUDShield(this.size.width*.025,this.size.height*.875);
    	this.shield.setAnchorPoint(new cc.Point(0,0.5));
        this.batchNode.addChild(this.shield, 0);

        this.shieldDisplay = new HUDShield(this.size.width*.10,this.size.height*.875);
        this.shieldDisplay.setAnchorPoint(new cc.Point(0.5,0.5));
        this.batchNode.addChild(this.shieldDisplay, 0);
        this.shieldDisplay.changeState("blinkAnim");


        var orbMeterPos = new cc.Point(this.shieldDisplay.getPosition().x,this.size.height*.675);

        var orbLabel = cc.LabelBMFont.create("0","Fonts/UkkoGold32.fnt");
        orbLabel.setPosition(orbMeterPos.x,this.shield.getPosition().y - orbLabel.getContentSize().height*.7);
        orbLabel.setVisible(false);
        this.addChild(orbLabel, 100);

        this.orbLabel = orbLabel;

        var lifeLabel = cc.LabelBMFont.create("0","Fonts/UkkoGold32.fnt");
        lifeLabel.setPosition(orbMeterPos.x,this.shield.getPosition().y - lifeLabel.getContentSize().height*.7);
        lifeLabel.setVisible(false);
        this.addChild(lifeLabel, 100);

        this.lifeLabel = lifeLabel;

        this.orbWave = new Counters(orbMeterPos.x,orbMeterPos.y,2);
        this.batchNode.addChild(this.orbWave, -98);

        this.goldWave = new Counters(orbMeterPos.x,orbMeterPos.y,3);
        this.batchNode.addChild(this.goldWave, -98);

        this.orbCounter = new Counters(orbMeterPos.x,orbMeterPos.y,0);
        this.batchNode.addChild(this.orbCounter, -100);

        this.orbFill = new Counters(orbMeterPos.x,orbMeterPos.y,1);
        this.batchNode.addChild(this.orbFill, -99);

        this.scheduleUpdate();

    },

    lifeTimer: function(){

    	this.orbCountdown-=1/60.0;
    	this.lifeCountdown-=1/60.0;

    	if (this.lifeCountdown<=0){
	        this.lifeLabel.setVisible(false);

	       	if (!this.orbCounter._visible){
	            this.shieldDisplay.changeState("blinkAnim");
	        }
	        else{
	        	 this.shieldDisplay.changeState("orbAnim");
	        }  
	       	ORBLIFE = false;
   
	    }
    	if (this.orbCountdown<=0){
   			
    		this.orbWave.setVisible(false);
    		this.orbFill.setVisible(false);
    		this.goldWave.setVisible(false);
        	this.orbCounter.setVisible(false);
        	this.orbLabel.setVisible(false);
        	ORBLIFE = false;

    	}
    },
    orbChanged: function(){
    	this.orbLabel.setString(ORBS);
    	if (ORBCHANGED){
    		this.orbWave.setVisible(true);
    		if (ORBLIFE){
            	this.goldWave.setVisible(true);
            	this.orbFill.setDisplayFrame(this.cache.getSpriteFrame("OrbMeter7.png"));
        	}
        	this.orbFill.setVisible(true);
    		
    		
    		if (!this.orbCounter._visible || (this.orbCounter._visible && this.lifeLabel._visible)){ //|| (this.orbCounter.visible)&& livesLabel.visible
	            this.lifeLabel.setVisible(false);
	            this.shieldDisplay.changeState("orbAnim");
	            this.orbCounter.changeState("lifeCounterAnim");
        	}
    		this.orbCounter.setVisible(true);
    		this.orbLabel.setVisible(true);
    		this.orbCountdown = 2;

    		ORBCHANGED = false;
    	}

    },
    lifeChanged: function(){
    	this.lifeLabel.setString(LIVES);
    	if (LIFECHANGED){
            if (this.audioEngine!==null){
                this.audioEngine.playEffect("Sounds/life.mp3");
            }
    		this.shieldDisplay.changeState("lifeAnim");
    		this.shield.changeState("shieldShine");

    		this.lifeLabel.setVisible(true);
        	this.orbLabel.setVisible(false);
    		this.lifeCountdown = 2;

    		LIFECHANGED = false;	

    	}   
    },
    update: function(dt){
    	this.orbChanged();
    	this.lifeChanged();
    	this.lifeTimer();
    }
});