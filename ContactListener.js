/*
Doing quick checks to see if either of the two objects match the sprite tag
*/

IS_PLAYER           = function(tagA,tagB){if (tagA===TAG.kUkko || tagB===TAG.kUkko){return true;}return false;}
IS_GROUND           = function(tagA,tagB){if (tagA===TAG.kGround || tagB===TAG.kGround){return true;}return false;}
IS_BREAKABLEGROUND  = function(tagA,tagB){if (tagA===TAG.kBreakableGround || tagB===TAG.kBreakableGround){return true;}return false;}
IS_POWERUPORB       = function(tagA,tagB){if (tagA===TAG.kPowerUpTypeOrb || tagB===TAG.kPowerUpTypeOrb){return true;}return false;}
IS_MONKEYBAR        = function(tagA,tagB){if (tagA===TAG.kMonkeyBar || tagB===TAG.kMonkeyBar){return true;}return false;}
IS_DOOR             = function(tagA,tagB){if (tagA===TAG.kDoor || tagB===TAG.kDoor){return true;}return false;}
IS_KEY              = function(tagA,tagB){if (tagA===TAG.kKey || tagB===TAG.kKey){return true;}return false;}
IS_LIFE             = function(tagA,tagB){if (tagA===TAG.kPowerUpTypeLife || tagB===TAG.kPowerUpTypeLife){return true;}return false;}
IS_ONESIDEDPLATFORM = function(tagA,tagB){if (tagA===TAG.kOneSidedPlatform || tagB===TAG.kOneSidedPlatform){return true;}return false;}
IS_TRAMPOLINE       = function(tagA,tagB){if (tagA===TAG.kTrampoline || tagB===TAG.kTrampoline){return true;}return false;}
IS_SCENECHANGER     = function(tagA,tagB){if (tagA===TAG.kSceneChanger || tagB===TAG.kSceneChanger){return true;}return false;}
IS_BROKENPLATFORM   = function(tagA,tagB){if (tagA===TAG.kBrokenPlatform || tagB===TAG.kBrokenPlatform){return true;}return false;}
IS_PLATFORMSENSOR   = function(tagA,tagB){if (tagA===TAG.kPlatformSensor || tagB===TAG.kPlatformSensor){return true;}return false;}
IS_CLOUDSENSOR      = function(tagA,tagB){if (tagA===TAG.kCloudSensor || tagB===TAG.kCloudSensor){return true;}return false;}
IS_BUTTON           = function(tagA,tagB){if (tagA===TAG.kButton || tagB===TAG.kButton){return true;}return false;}
IS_CLOUD            = function(tagA,tagB){if (tagA===TAG.kCloud || tagB===TAG.kCloud){return true;}return false;}
IS_FAIRY            = function(tagA,tagB){if (tagA===TAG.kFairy || tagB===TAG.kFairy){return true;}return false;}
IS_DIALOGUEBOX      = function(tagA,tagB){if (tagA===TAG.kDialogueBox || tagB===TAG.kDialogueBox){return true;}return false;}


var ContactListener = Box2D.Dynamics.b2ContactListener;
ContactListener.BeginContact = function(contact) {
    var audioEngine = null;
    audioEngine = cc.AudioEngine.getInstance();
    var b2Vec2 = Box2D.Common.Math.b2Vec2;

    var o1 = contact.GetFixtureA().GetBody().GetUserData();
    var o2 = contact.GetFixtureB().GetBody().GetUserData();

    var ukko;
    var sprite;

    if (IS_TRAMPOLINE(o1._tag, o2._tag) && IS_PLATFORMSENSOR(o1._tag,o2._tag)){
        if (o1._tag===TAG.kTrampoline){ sprite = o1; }else {sprite = o2;}
        sprite._directionNum++;
        return;
    }

    if (IS_FAIRY(o1._tag,o2._tag)){
        var otherSprite;
        if (o1._tag===TAG.kFairy){ sprite = o1; otherSprite = o2; }else {sprite = o2; otherSprite = o1;}

        if (IS_DIALOGUEBOX(o1._tag,o2._tag)){
            sprite._dialogue.changeState("kStateOn");
            otherSprite._tag= 1000;
        }
        return;
    }

    if(IS_PLAYER(o1._tag,o2._tag)){

        if (o1._tag===TAG.kUkko){ ukko = o1; }else {ukko = o2;}
        if (IS_GROUND(o1._tag,o2._tag)){

                    if (o2._tag===TAG.kUkko){ 
            if (!contact.GetFixtureB().IsSensor()){
                return;
            }
        }else if (o1._tag===TAG.kUkko){
            if (!contact.GetFixtureA().IsSensor()){
                return;
            }
        }

            ukko._onGround = true;
            ukko._groundContacts++;
            if (ukko._activateFinalJump || ukko._endOfLevel){
                return;
            }
            if (ukko._joystickVel===0 && ukko._characterState==='kStateFalling'){
                ukko.changeState('kStateLanding');
            }
            else if (ukko._joystickVel!==0){
                ukko.changeState('kStateWalking');
            }
        }
        if (IS_ONESIDEDPLATFORM(o1._tag,o2._tag)){

            if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}
            if (ukko._body.GetPosition().y-ukko._height > sprite._body.GetPosition().y+sprite._height){
                
            if (o2._tag===TAG.kUkko){ 
                if (!contact.GetFixtureB().IsSensor()){
                    return;
                }
            }else if (o1._tag===TAG.kUkko){
                if (!contact.GetFixtureA().IsSensor()){
                    return;
                }
            }
                ukko._onGround = true;
                ukko._groundContacts++;
                ukko._platform = sprite;
                if (sprite._type!==TAG.kCloud){
                    if (ukko._joystickVel===0 && ukko._characterState==='kStateFalling'){
                        ukko.changeState('kStateLanding');
                    }
                    else if (ukko._joystickVel!==0){
                        ukko.changeState('kStateWalking');
                    }
                }
                else{ //is cloud
                    sprite._ukko = ukko;
                    sprite._body.SetLinearVelocity(new b2Vec2 (.25,ukko._body.GetLinearVelocity().y));
                    ukko.changeState("kStateGameOver");
                }
            }

        }
        else if (IS_BREAKABLEGROUND(o1._tag,o2._tag)){

            if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}

            if ((ukko._body.GetPosition().y-ukko._height > sprite._body.GetPosition().y+sprite._height) && !ukko._cannonball){
                ukko._onGround = true;
                ukko._groundContacts++;

                if (ukko._joystickVel===0 && ukko._characterState==='kStateFalling'){
                    ukko.changeState('kStateLanding');
                }
                else if (ukko._joystickVel!==0){
                    ukko.changeState('kStateWalking');
                }
            }
            if (ukko._cannonball){
                sprite.changeState("kStateDead");
            }
        }
        else if (IS_TRAMPOLINE(o1._tag,o2._tag)){
            if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}
            if (o2._tag===TAG.kUkko){ 
                if (!contact.GetFixtureB().IsSensor()){
                    return;
                }
            }else if (o1._tag===TAG.kUkko){
                if (!contact.GetFixtureA().IsSensor()){
                    return;
                }
            }
            if (ukko._body.GetPosition().y-ukko._height > sprite._body.GetPosition().y+(sprite._height*.5)){
                sprite.changeState("kStateSpring");
                sprite._startMoving = true;
                ukko._trampolineImpulse = 12;
                if (sprite._type === 1 || sprite._type === 4 || sprite._type === 5){
                    ukko._canZoomOut = true;
                }
                ////cc.log("Counter: " + ukko._trampolineButton);
                var xVel = ukko._body.GetLinearVelocity().x*.25;
                if (!ukko._cannonball){
                    if (ukko._trampolineButton<60 && ukko._trampolineButton>0){
                        ukko._spin = true;
                        ukko._body.SetLinearVelocity(new b2Vec2(xVel,8)); 
                    }
                    else { 
                        ukko._body.SetLinearVelocity(new b2Vec2(xVel,4.5)); 
                    }
        
                }
                else{
                    ukko._body.SetLinearVelocity(new b2Vec2(xVel,9));
                    ukko._cannonball = false;
                }
                ukko.changeState("kStateJumping");
            }

        }
        else if (IS_BUTTON(o1._tag,o2._tag)){
            if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}
            if (o2._tag===TAG.kUkko){ 
                if (contact.GetFixtureB().IsSensor()){
                    return;
                }
            }else if (o1._tag===TAG.kUkko){
                if (contact.GetFixtureA().IsSensor()){
                    return;
                }
            }
            if (sprite._counter>30){
                if (audioEngine!==null){
                    audioEngine.playEffect("Sounds/button.mp3");
                }
                if (BUTTON){
                    BUTTON = false;
                }
                else{

                    BUTTON = true;
                }
            }
            sprite._counter = 0;
        }
        else if (IS_POWERUPORB(o1._tag,o2._tag) || IS_LIFE(o1._tag,o2._tag) || IS_KEY(o1._tag,o2._tag)){
            if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}
            sprite.changeState("kStateDead");

        }
        else if (IS_MONKEYBAR(o1._tag,o2._tag)){

            ukko._body.SetGravityScale(0.0);
            ukko._onMonkeyBar= true;
            ukko._trampolineImpulse = 0;
            ukko._body.SetLinearVelocity(new b2Vec2(0,0));
            if (ukko._characterState!=="kStateIdle"){
                 ukko.changeState("kStateIdle");
            }
            
        }
        else if (IS_DOOR(o1._tag,o2._tag)){
            if (!DOORLOCKED){
                if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}
                if (sprite._type<100){
                    DOORDESTINATION = sprite._type;
                    ukko._onDoor=true;
                }
            }
        }
        else if (IS_SCENECHANGER(o1._tag,o2._tag)){
            if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}
            //cc.log("Scene Changer "+ sprite._type);
            DOORDESTINATION = sprite._type;
            ukko.changeScene();
        }
        else if (IS_BROKENPLATFORM(o1._tag,o2._tag)){
            if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}
            //cc.log("BrokenPLatform");
            sprite.setOpacity(0);
            //sprite.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("BrokenPlatform1.png"));
        }
        else if (IS_CLOUDSENSOR(o1._tag,o2._tag) && o1._characterState!="kStateDead" && o2._characterState!="kStateDead"){
            if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}
            sprite._characterState="kStateDead";
            if (ukko._characterState!="kStateWalking") ukko._body.SetLinearVelocity(new b2Vec2(ukko._body.GetLinearVelocity().x*.1,ukko._body.GetLinearVelocity().y));
    
            ukko._activateFinalJump=true;

        }

}

}
ContactListener.EndContact = function(contact) {
// //cc.log(contact.GetFixtureA().GetBody().GetUserData());
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var o1 = contact.GetFixtureA().GetBody().GetUserData();
var o2 = contact.GetFixtureB().GetBody().GetUserData();
var ukko;
var sprite;
if(IS_PLAYER(o1._tag,o2._tag)){
    if (o1._tag===TAG.kUkko){ ukko = o1; }else {ukko = o2;}
    if (IS_GROUND(o1._tag,o2._tag) || IS_ONESIDEDPLATFORM(o1._tag,o2._tag)){
        if (o2._tag===TAG.kUkko){ 
            if (!contact.GetFixtureB().IsSensor()){
                return;
            }
        }else if (o1._tag===TAG.kUkko){
            if (!contact.GetFixtureA().IsSensor()){
                return;
            }
        }
        ukko._groundContacts--;
        if (ukko._groundContacts<0){
            ukko._groundContacts=0;
            ukko._platform = null;
        }

    }
    if (IS_BREAKABLEGROUND(o1._tag,o2._tag)){
        if (o2._tag===TAG.kUkko){ sprite = o1; }else {sprite = o2;}
        if ((ukko._body.GetPosition().y-ukko._height > sprite._body.GetPosition().y+sprite._height) && !ukko._cannonball){
            //cc.log('lost break');
            ukko._groundContacts--;
            if (ukko._groundContacts<0){
                ukko._groundContacts=0;
            }
        }
    }
    if (ukko._groundContacts===0){
        ukko._onGround = false;
    }
    if (IS_MONKEYBAR(o1._tag,o2._tag)){

        ukko._jumpbuttonActive = false;
        ukko._body.SetGravityScale(1.0);
        ukko._body.SetLinearVelocity(new b2Vec2(0,-1.5));
        ukko._onMonkeyBar= false;
        if (ukko._characterState!=="kStateFalling"){
            ukko.changeState("kStateFalling");
        }
        ukko._jumpbuttonActive = false;

    }
    if (IS_DOOR(o1._tag,o2._tag)){
        ukko._onDoor=false;
    }
}
}
ContactListener.PostSolve = function(contact, impulse) {

}
ContactListener.PreSolve = function(contact, oldManifold) {
var b2Vec2 = Box2D.Common.Math.b2Vec2;

var o1 = contact.GetFixtureA().GetBody().GetUserData();
var o2 = contact.GetFixtureB().GetBody().GetUserData();

var ukko;
var sprite;

if(IS_PLAYER(o1._tag,o2._tag)){
    
    if (IS_ONESIDEDPLATFORM(o1._tag,o2._tag)){
        if (o1._tag===TAG.kUkko){ ukko = o1; }else {ukko = o2;}
        if (o1._tag===TAG.kOneSidedPlatform){ sprite = o1; }else {sprite = o2;}

        if ((ukko._body.GetPosition().y-ukko._height)<=(sprite._body.GetPosition().y+sprite._height) || ukko._characterState==="kStateJumping"){
            contact.SetEnabled(false);
        }
    }
}

}