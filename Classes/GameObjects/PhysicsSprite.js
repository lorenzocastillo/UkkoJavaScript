var PhysicsSprite = cc.Sprite.extend({
    _currentRotation:0,
    _cache : null,
    _className : null,
    _characterState: null,
    _deathAnim:null,
    _idleAnim:null,
    _locked:null,
    _type:null,
    _ukko:null,
    ctor:function(){

        this.init();

    }
});
