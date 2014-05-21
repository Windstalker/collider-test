var Collider = function () {
    this.objects = [];
    this.gameField = null;
};
Collider.prototype.addObject = function () {
    if (arguments.length) {
        this.objects.push.apply(this.objects, arguments);
    }
};
Collider.prototype.collideWithField = function () {
    var obj;
    for (var i = 0; i < this.objects.length; i++) {
        obj = this.objects[i];
//		obj.collidesWithBorders(this.gameField);
    }
};