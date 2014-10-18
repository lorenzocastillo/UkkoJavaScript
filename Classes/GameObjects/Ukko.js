var Ukko = cc.Sprite.extend({
    _currentRotation:0,
    _world : null,
    _cache : null,
    _body : null,
    _className : "Ukko",
    _characterState: "kStateIdle",
    _walkAnim:null,
    _idleAnim:null,
    _jumpingAnim:null,
    _landingAnim:null,
    _fallingAnim:null,
    _cannonballAnim:null,
    _monkeybarAnim:null,
    _indoorAnim:null,
    _outdoorAnim:null,
    _bounceAnim:null,
    _Vec:null,
    _timesApplied: 0,
    _jumpbuttonActive: false,
    _onGround: false,
    _onDoor:false,
    _joystickVel:0,
    _cannonball:false,
    _onMonkeyBar:false,
    _height:0,
    _trampolineImpulse:0,
    _groundContacts:0,
    _changingScenes:false,
    _platform:null,
    _activateFinalJump:false,
    _endOfLevel:false,
    _levelWidth:0,
    _spin: false,
    _trampolineButton:0,
    _canZoomOut:false,
    _spinDirection: -1,
    _changeSceneCounter:0,
    _jumpHeight:0,
    audioEngine:null,

    ctor:function(x,y,world){

        this.init();
        this._world = world;
        this.setPosition(x,y);
        this._cache = cc.SpriteFrameCache.getInstance();
        this.setDisplayFrame(this._cache.getSpriteFrame("Ukko0.png"));
        this._tag=TAG.kUkko;
        this.setUpAnimations();
        this.createBody();
        this._changeSceneCounter = 0;
        this.audioEngine = cc.AudioEngine.getInstance();

        this.scheduleUpdate();


    },
    createBody:function(){
        //cc.log('create Body');
        var b2Vec2 = Box2D.Common.Math.b2Vec2
            , b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2World = Box2D.Dynamics.b2World
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
            , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
            ;
        this._Vec = b2Vec2;
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        cc.log(PTM_RATIO);
        bodyDef.position.Set(this.getPosition().x / PTM_RATIO, this.getPosition().y / PTM_RATIO);
        bodyDef.userData = this;
        bodyDef.allowSleep = true;
        bodyDef.isSleeping = false;
        bodyDef.fixedRotation = true;
        this._body = this._world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        dynamicBox.SetAsBox(this.getContentSize().width*.125/PTM_RATIO, this.getContentSize().height*.35/PTM_RATIO);//These are mid points for our 1m box
        this._height = this.getContentSize().height*.35/PTM_RATIO;
        // Define the dynamic body fixture.
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.0;
        fixtureDef.restitution = 0.0;
        this._body.CreateFixture(fixtureDef);

        var groundBox = new b2PolygonShape();
        groundBox.SetAsOrientedBox(this.getContentSize().width*.125/PTM_RATIO, this.getContentSize().height*.04/PTM_RATIO, new b2Vec2(0,-this._height),0);
        var groundSensor = new b2FixtureDef();
        groundSensor.shape = groundBox;
        groundSensor.isSensor = true;
        this._body.CreateFixture(groundSensor);


    },
    /*params: Name: the name of the picture without the file extension
    start: the number where said picture starts
    end: the number where said picture ends
    delay: delay between each anim
    i.e If we want to animate three pictures Dog0.png, Dog1.png, and Dog2.png with a delay of 0.3 seconds, we would supply Dog,0,2,0.3
    */
    animWithName:function(name,start,end,delay){
        var animFrames = [];
        var str = "";
        for (var i = start; i <= end; i++) {

            str = name + (i < 10 ? (i) : i) + ".png";
            var frame = this._cache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        return cc.Animation.create(animFrames, delay);

    },
    /*params: 
    Name: the name of the picture without the file extension
    frameVals:the list of ints of said picture
    delay: delay between each anim

    i.e If we want to animate three pictures out of numerical order or want
    one particular frame to last longer such as Dog0.png, Dog0.png, Dog2.png, Dog1.png with a delay of 0.3 seconds, 
    we would supply Dog,[0,0,2,1],0.3
    */
    animWithNameAndList:function(name,frameVals,delay){
        var animFrames = [];
        var str = "";
        for (var i = 0; i < frameVals.length ; i++){
            str = name + frameVals[i] + ".png";
            var frame = this._cache.getSpriteFrame(str);
            animFrames.push(frame);
        }
        return cc.Animation.create(animFrames, delay);

    },
    setUpAnimations:function(){
        this._walkAnim = this.animWithName(this._className,3,11,0.07);
        this._idleAnim = this.animWithNameAndList(this._className,[0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],0.1);
        this._jumpingAnim = this.animWithName(this._className,12,14,0.1);
        this._landingAnim = this.animWithNameAndList(this._className,[15,16,16,0],.04);
        this._fallingAnim = this.animWithName(this._className,21,21,5.0);
        this._cannonballAnim = this.animWithNameAndList(this._className,[17,18,19,19,20],0.08);
        this._indoorAnim = this.animWithName(this._className,32,34,0.12);
        this._outdoorAnim = this.animWithName(this._className,35,37,0.15);
        this._monkeybarAnim = this.animWithName(this._className,25,31,0.08);
        this._bounceAnim = this.animWithNameAndList(this._className,[22,23,24,24,24,24,21],0.08);
    },

    /*params: state, the string describing the state of our sprite. For future updates this will be changed to a dictionary for minimizing size of command in case I want to add multiplayer*/
    changeState:function(state){
        if (state===null) return;
        this.stopAllActions();
        this._characterState=state;
        var action = null;
        if (state==="kStateIdle" || state==="kStateGameOver" || state==="kStateLanding"){ //makes him not slide downhill. May change when having an Anim for the "downhill" sliding
            for (var f = this._body.GetFixtureList(); f; f = f.GetNext()) {
                f.SetFriction(1000.0);
            }       
        }
        else{
            for (var f = this._body.GetFixtureList(); f;f = f.GetNext()) {
                f.SetFriction(0.0);
            }
        }
        switch(state)
            {
            case "kStateIdle":
                if (!this._onMonkeyBar){
                    action = cc.RepeatForever.create(cc.Sequence.create(cc.Animate.create(this._idleAnim),cc.DelayTime.create(1.0)));
                }
                else if (this._onMonkeyBar){
                    this.setDisplayFrame(this._cache.getSpriteFrame("Ukko25.png"));
                }
              break;
            case "kStateWalking":

                action = cc.RepeatForever.create(cc.Animate.create(this._walkAnim));
              break;
            case "kStateJumping":
                if (this.audioEngine!==null){
                    this.audioEngine.playEffect("Sounds/jump.mp3");
                }
                this._jumpHeight = this._body.GetPosition().y;
                this._trampolineButton = 0;
                if (this._activateFinalJump || this._spin){
                    this._spinDirection = -1;
                    if (this.isFlippedX()){
                        this._spinDirection = 1;
                    }
                    action = cc.Animate.create(this._bounceAnim);
                }else{
                    action = cc.Animate.create(this._jumpingAnim);
                }
                break;

            case "kStateFalling":
                action = cc.Animate.create(this._fallingAnim);
                break;

            case "kStateLanding":
                this._body.SetLinearVelocity(new this._Vec(0,this._body.GetLinearVelocity().y));
                this._characterState="kStateIdle";
                action = cc.Animate.create(this._landingAnim);
                break;

            case "kStateAttacking":
                this._cannonball = true;
                if (this.audioEngine!==null){
                    this.audioEngine.playEffect("Sounds/ground_pound.mp3");
                }
                action = cc.Animate.create(this._cannonballAnim);
                break;

            case "kStateMonkeyBar":
                action = cc.RepeatForever.create(cc.Animate.create(this._monkeybarAnim));
                break;

            case "kStateInDoor":
                action = cc.Sequence.create(cc.Animate.create(this._indoorAnim),cc.FadeOut.create(.1),cc.CallFunc.create(this.changeScene, this));
                break;

            case "kStateOutDoor":

                action = cc.Sequence.create(cc.Spawn.create(cc.FadeIn.create(0.15),cc.Animate.create(this._outdoorAnim)),cc.CallFunc.create(this.changeState(''),this));  
                break;
            case "kStateDead":
                this.changeScene();
                break;

            case "kStateGameOver":

                this.setDisplayFrame(this._cache.getSpriteFrame("Ukko38.png"));
                if (this.audioEngine!==null){
                    this.audioEngine.playEffect("Sounds/level_passed.mp3");
                }
                GAMEISOVER = true;
                break;
            default:
              
            }
        if (action!==null){
            this.runAction(action);
        }

    },
    limitVelocities:function(){

        if (this._endOfLevel){return;}

        var xVel = this._body.GetLinearVelocity().x;
        var yVel = this._body.GetLinearVelocity().y;
        var maxXVel = 5.0;
        var maxYVel = 3.2 + this._trampolineImpulse;
        var minYVel = -10;

        if (this._characterState==="kStateJumping" || this._characterState=== "kStateFalling"){
            maxXVel = 4.0;
            if (xVel>maxXVel){
                this._body.SetLinearVelocity(new this._Vec(xVel*.9,yVel));
            }
            if (xVel<-maxXVel){
                this._body.SetLinearVelocity(new this._Vec(xVel*.9,yVel));
            }
        }
        if (this._body.GetLinearVelocity().y>maxYVel){
            this._body.SetLinearVelocity(new this._Vec(xVel,maxYVel));
        }
        if (yVel<-10){
            this._body.SetLinearVelocity(new this._Vec(xVel,-10));
        }
        if (this._onMonkeyBar){
            maxXVel = 2.5;
        }
        if (this._body.GetLinearVelocity().x>maxXVel){
            this._body.SetLinearVelocity(new this._Vec(maxXVel,yVel));
        }
        if (this._body.GetLinearVelocity().x<-maxXVel){
            this._body.SetLinearVelocity(new this._Vec(-maxXVel,yVel));
        }



    },
    update:function(dt){
        if (this._body===null) {return;}
        if (this._characterState === "kStateGameOver"){
            if (this._body.GetPosition().x > this._levelWidth*1.1){
                this.changeScene();
            }
            return;
        }
        //if (this._characterState==="kStateInDoor" || this._characterState === "kStateOutDoor"){return;}

        this.limitVelocities();

        var xVel = this._body.GetLinearVelocity().x;
        var yVel = this._body.GetLinearVelocity().y;

        if (this._characterState==="kStateJumping" && this._jumpbuttonActive && !this._onMonkeyBar && this._trampolineImpulse===0){

            if (this._timesApplied===0){
                this._body.SetLinearVelocity(new this._Vec(this._body.GetLinearVelocity().x,6));
            }
            if (this._timesApplied<9 && this._timesApplied>0){
            
                if (this._body.GetPosition().y-this._jumpHeight < 2.2){ //Makes sure to stop ukko from jumping too high at low frame rates. 
                    this._body.ApplyImpulse(new this._Vec(0,(0.279568*32.0)), this._body.GetWorldCenter());
                }

            }
            this._timesApplied++; //What allows ukko to have a variable height jump
        }

        if (yVel<-0.7 && !this._onGround && !this._cannonball){          
            if (this._characterState!=='kStateFalling'){
                this.changeState("kStateFalling");
                this._body.SetLinearVelocity(new this._Vec(this._body.GetLinearVelocity().x,-2.0));
            }
        }

        if (this._cannonball && !this._onGround){
            this._body.ApplyImpulse(new this._Vec(0,-(0.279568*7.0)), this._body.GetWorldCenter());
        }
        else if (this._cannonball && this._onGround){
            this.changeState("kStateLanding");
            this._cannonball = false;
        }

        if (this._onMonkeyBar){
            this._canZoomOut = false;
        }

        if (this._onGround){
            this._trampolineImpulse=0; 

            this._canZoomOut = false;
        }
        else{
            this._platform=null;
        }

        if (this._body.GetPosition().y<-this._height && this._changingScenes){
            this.changeScene();        
        }
        else if (this._body.GetPosition().y<-this._height*2 && this._characterState!=="kStateDead"){
            this.changeState("kStateDead");
        }

        if (this._platform!==null && this._characterState!=='kStateJumping'){
            if (this._platform._body.GetLinearVelocity().y!==0){
                //cc.log('moving ukko to platform');
                this._body.SetLinearVelocity(new this._Vec(this._body.GetLinearVelocity().x,this._platform._body.GetLinearVelocity().y));
            }
        }

        if (this._activateFinalJump && !this._onGround){
            this._body.SetLinearVelocity(new this._Vec(0,this._body.GetLinearVelocity().y));
        }

        if (this._activateFinalJump && this._onGround && (this._body.GetLinearVelocity().x<2.0 || this._characterState==='kStateWalking')){
            this._endOfLevel=true;
            var xVel = CLOUDXPOS-this._body.GetPosition().x;
            this._body.SetLinearVelocity(new this._Vec(xVel*1.1,6.0));
            this.changeState('kStateJumping');
            this._activateFinalJump=false;
            this._spin = true;
        }

        if (this._spin && !this._world.IsLocked()){
            var angle = this._body.GetAngle();
            var pi = 3.14;
            if (angle<2*pi && angle > -2*pi){

                this._body.SetAngle(this._body.GetAngle()+(pi*.1*this._spinDirection));

            }
        }

        if (this._spin && this._characterState !== "kStateJumping"){
            this._spin = false;
            this._body.SetAngle(0);
        }
        if (this._trampolineButton>=1){
            this._trampolineButton++;
        }
        if (this._changeSceneCounter>0){
            this.changeScene();
        }
    },

    /*params: the key being pressed or let go, and whether it was pressed or let go*/
    handleKey:function(e,keyDown)
    {
        if (this._characterState==="kStateInDoor" || this._characterState === "kStateOutDoor" || this._characterState==="kStateGameOver" || this._endOfLevel){return;}
        if (this._body===null) return; 
        if (!keyDown){ //if key is let go
            if (e===cc.KEY.right || e === cc.KEY.left){
                this._joystickVel=0;
            }
            if (this._characterState==='kStateWalking' || this._characterState==="kStateMonkeyBar"){
                this.changeState("kStateIdle");
                this._body.SetLinearVelocity(new this._Vec(0,0));
            }
            if (e===90){
                this._jumpbuttonActive=false;
                this._timesApplied=0;
            }
            return;
        }

        if(e === cc.KEY.left)
        {
            this._joystickVel=-1;
            this.setFlipX(true);
            var speed = 5;
            this._body.SetLinearVelocity(new this._Vec(-speed,this._body.GetLinearVelocity().y));
            if (this._characterState!=="kStateWalking" && this._onGround && this._characterState!=="kStateJumping"){
                this.changeState("kStateWalking");
            }
            else if (!this._onGround && this._characterState!=="kStateMonkeyBar" && this._onMonkeyBar){
                this.changeState("kStateMonkeyBar");
            }

        }
        else if(e === cc.KEY.right){
            
            this.setFlipX(false);
            this._joystickVel=1;
            var speed = 5;
            this._body.SetLinearVelocity(new this._Vec(speed,this._body.GetLinearVelocity().y));
            if (this._characterState!=="kStateWalking" && this._onGround && this._characterState!=="kStateJumping"){
                this.changeState("kStateWalking");
            }
            else if (!this._onGround && this._characterState!=="kStateMonkeyBar" && this._onMonkeyBar){
                this.changeState("kStateMonkeyBar");
            }
        }
        else if (e === 90){
            if (this._characterState==="kStateFalling"){
                this._trampolineButton = 1;
            }
            if (this._onMonkeyBar && this._jumpbuttonActive){return;}

            
            if (this._onGround && this._timesApplied===0 && (this._characterState==="kStateWalking" || this._characterState==="kStateIdle")){ 
                this._platform = null;
                this._jumpbuttonActive=true;
                this.changeState("kStateJumping");
            }
            if (this._onMonkeyBar){
                this._body.SetGravityScale(1.0);
                this._onMonkeyBar = false;

                this._body.ApplyImpulse(new this._Vec(0,-(0.279568*5.0)), this._body.GetWorldCenter());
                if (this._characterState!=="kStateFalling"){
                     this.changeState("kStateFalling");
                }     
            }

        }
        else if (e === cc.KEY.down){


            if (this._characterState==="kStateJumping" || this._characterState === "kStateFalling" ){
                    if (!this._cannonball){
                    this.changeState("kStateAttacking");
                }
            }
            if (this._onMonkeyBar){
                this._body.SetGravityScale(1.0);
                this._onMonkeyBar = false;

                this._body.ApplyImpulse(new this._Vec(0,-(0.279568*5.0)), this._body.GetWorldCenter());
                if (this._characterState!=="kStateFalling"){
                     this.changeState("kStateFalling");
                }     
            }
        }
        else if (e === cc.KEY.up){
            if (this._onDoor && this._characterState==="kStateIdle"){
                this.changeState("kStateInDoor");
            }
        }

    },
    changeScene:function(){
        this._changeSceneCounter++; //having a counter so the music can fade out first before changing the scenes. Tried to prevent the music from stopping abruptly after one scene was being loaded

        if (this._changeSceneCounter>20){
            if (this.audioEngine!==null){
                if (this.audioEngine.getMusicVolume()<=0){
                    this._changeSceneCounter = 0;
                    this._changingScenes=true;
                    this.unscheduleUpdate();
                    cc.Director.getInstance().replaceScene(cc.TransitionFade.create(.25,new LoadScene()));
                }
            }
            else{
                this._changeSceneCounter = 0;
                this._changingScenes=true;
                this.unscheduleUpdate();
                cc.Director.getInstance().replaceScene(cc.TransitionFade.create(.25,new LoadScene()));
            }


        }
        if (this.audioEngine!==null){
            if (this.audioEngine.getMusicVolume()>0){
                this.audioEngine.setMusicVolume(this.audioEngine.getMusicVolume()-.025);
            }
        }
    }
});