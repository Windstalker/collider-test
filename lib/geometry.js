// Projection

var Projection = function (min, max) {
    this.min = min;
    this.max = max;
};

Projection.prototype = {
    getOverlap: function (projection) {
        return Math.min(this.max - projection.min, projection.max - this.min)
    },
    overlaps: function (projection) {
        return this.max > projection.min && projection.max > this.min;
    },
    overlappedBy: function (projection) {
        return this.min >= projection.min && projection.max >= this.max;
    }
};

// Basic Shape class

var Shape = function () {
    this.relCenter = new Point(0, 0); // user-defined relative center of the shape as Point

    this.velocity = new Vector(0, 0); // Vector
    this.direction = new Vector(1, 0).normalize(); // Normalized vector

    this.lineWidth = '';
    this.strokeStyle = '';
    this.fillStyle = '';

    this.init.apply(this, arguments);

    return this;
};

Shape.prototype.init = function () {
    var options = arguments[0] || {};
    var direction = options.direction; // argument can be a Vector (normalized or not) or Number (in radians, deg * Math.PI / 180)
    var center = options.center instanceof Array && options.center; // should be an Array, [x, y]

    if (typeof direction === 'number') {
        direction = new Vector(Math.cos(direction), Math.sin(direction));
    }

    if (center) {
        this.relCenter = new Point(center[0], center[1]) || this.relCenter;
    }

    this.velocity = options.velocity instanceof Vector && options.velocity || this.velocity; // argument should be a Vector
    this.direction = direction instanceof Vector && direction.normalize() || this.direction;

    this.lineWidth = options.lineWidth || '';
    this.strokeStyle = options.strokeStyle || '';
    this.fillStyle = options.fillStyle || '';
};

Shape.prototype.project = function (axis) {
    throw 'project(axis) not implemented';
};

Shape.prototype.getAxes = function () {
    throw 'getAxes() not implemented';
};

Shape.prototype.update = function (dTime) {
    throw 'update(dTime) not implemented';
};

Shape.prototype.move = function (dTime, dVector) {
    throw 'move(dTime, dVector) not implemented';
};

Shape.prototype.getBoundingBox = function () {
    var xProjection = this.project(new Vector(1,0));
    var yProjection = this.project(new Vector(0,1));
    return {
        x: xProjection,
        y: yProjection
    }
};

Shape.prototype.draw = function (context) {
//    this.fill(context);
    this.stroke(context);
};

Shape.prototype.createPath = function (context) {
    throw 'createPath(context) not implemented';
};

Shape.prototype.fill = function (context) {
    context.save();
    context.fillStyle = this.fillStyle;
    this.createPath(context);
    context.fill();
    context.restore();
};

Shape.prototype.stroke = function (context) {
    context.save();
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.strokeStyle;
    this.createPath(context);
    context.stroke();
    context.restore();
};

Shape.prototype.isPointInPath = function (context, x, y) {
    this.createPath(context);
    return context.isPointInPath(x, y);
};

// Polygon

var Polygon = function () {
    var parent = this.constructor.prototype;

    this.vertices = []; // Array of coordinates as Points

    parent.init.apply(this, arguments);
    this.init.apply(this, arguments);

    return this;
};

Polygon.prototype = new Shape();

Polygon.prototype.init = function () {
    var options = arguments[0] || {};
    var pts = options.vertices instanceof Array && options.vertices || []; // argument should be 2D-Array, [[x0, y0], [x1, y1], ...]
    if (pts.length) {
        for (var i = 0; i < pts.length; i++) {
            this.addPoint.apply(this, pts[i]);
        }
    }
};

Polygon.prototype.addPoint = function (x, y) {
    return this.vertices.push(new Point(x, y));
};

Polygon.prototype.removePoint = function (i) {
    var l = this.vertices.length;
    if (l - 1 < 3) {
        throw 'Polygon can\'t have less than 3 vertices'
    }
    return this.vertices.splice(i, 1);
};

Polygon.prototype.project = function (axis) {
    var scalars = [];
    this.vertices.forEach(function (vt) {
        var v = new Vector(vt).dot(axis);
        scalars.push(v);
    });
    return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
};

Polygon.prototype.getAxes = function () {
    var pts = this.vertices,
        v0, v1,
        axes = [];
    for (var i = 0; i < pts.length; i++) {
        v0 = new Vector(pts[i]);
        v1 = new Vector(pts[(i + 1) % pts.length]);
        axes.push(v0.edge(v1).normal());
    }
    return axes;
};

Polygon.prototype.move = function (dTime, dVector) {
    var pts = this.vertices,
        velocity = dVector || this.velocity.scale(dTime || 1);
    for (var i = 0; i < pts.length; i++) {
        pts[i].x += velocity.x;
        pts[i].y += velocity.y;
    }
    this.relCenter.x += velocity.x;
    this.relCenter.y += velocity.y;
};

Polygon.prototype.createPath = function (ctx) {
    var pts = this.vertices;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
};

// Circle

var Circle = function () {
    var parent = this.constructor.prototype;
    this.radius = 0;
    this.center = null;

    parent.init.apply(this, arguments);
    this.init.apply(this, arguments);

    return this;
};

Circle.prototype = new Shape();

Circle.prototype.init = function () {
    var options = arguments[0] || {};
    this.radius = options.radius || this.radius;
    this.center = this.relCenter;
};

Circle.prototype.project = function (axis) {
    var centerProj = new Vector(this.center).dot(axis);
    return new Projection(centerProj - this.radius, centerProj + this.radius);
};

Circle.prototype.getAxes = function () {
    return undefined; // circle has an infinite number of axes
};

Circle.prototype.move = function (dTime, dVector) {
    var velocity = dVector || this.velocity.scale(dTime || 1);
    this.center.x += velocity.x;
    this.center.y += velocity.y;
};

Circle.prototype.createPath = function (ctx) {
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, false);
    ctx.closePath();
};
