var Point = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};
// Constructor........................................................
var Vector = function (x, y) {
    var p = arguments.length === 1 && typeof x == 'object' && x;

    // if no arguments passed - initialized as zero-vector
    this.x = +(p ? p.x : x) || 0;
    this.y = +(p ? p.y : y) || 0;

    return this;
};
// Prototype..........................................................
Vector.prototype.getMagnitude = function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};
Vector.prototype.scale = function (s) {
    return new Vector(this.x * s, this.y * s);
};
Vector.prototype.add = function (v) {
    return new Vector(this.x + v.x, this.y + v.y)
};
Vector.prototype.subtract = function (v) {
    return new Vector(this.x - v.x, this.y - v.y);
};
Vector.prototype.invert = function () {
    return this.scale(-1);
};
Vector.prototype.invertX = function () {
    return new Vector(-1 * this.x, this.y);
};
Vector.prototype.invertY = function () {
    return new Vector(this.x, -1 * this.y);
};
Vector.prototype.normalize =  function () {
    var v = new Vector(0, 0),
        m = this.getMagnitude();
    if (m != 0) {
        v.x = this.x / m;
        v.y = this.y / m;
    }
    return v;
};
Vector.prototype.orthogonal = function () {
    return new Vector(this.y, 0 - this.x);
};
Vector.prototype.normal = function () {
    return this.orthogonal().normalize();
};
Vector.prototype.edge = function (v) {
	return this.subtract(v);
};
Vector.prototype.dot = function (v) {
    return (this.x * v.x) + (this.y * v.y);
};
