// Shape

var Shape = function () {
    this.lineWidth = '5px';
    this.strokeStyle = '#000000';
    this.fillStyle = '#ffffff';
    this.velocity = new Vector(0, 0);
};

Shape.prototype = {
    // Collision detection methods
    collidesWith: function (shape) {
        var axes = this.getAxes().concat(shape.getAxes());
        return !this.separationOnAxes(axes, shape);
    },
    collidesWithBorders: function (parentShape) {
        var bBox = this.getBoundingBox(),
            pBox = parentShape.getBoundingBox(),
            outOfX = !(bBox.x.min > pBox.x.min && pBox.x.max > bBox.x.max),
            outOfY = !(bBox.y.min > pBox.y.min && pBox.y.max > bBox.y.max);
        if (outOfX) {
            this.velocity = this.velocity.invertX()
        }
        if (outOfY) {
            this.velocity = this.velocity.invertY();
        }
    },
    separationOnAxes: function (axes, shape) {
        var axis, pr0, pr1;
        for (var i = 0; i < axes.length; ++i) {
            axis = axes[i];
            pr0 = shape.project(axis);
            pr1 = this.project(axis);
            if (!pr0.overlaps(pr1)) {
                return true; // Don't have to test remaining axes
            }
        }
        return false;
    },
    getBoundingBox: function () {
        var xProj = this.project(new Vector(1,0));
        var yProj = this.project(new Vector(0,1));
        return {
            x: xProj,
            y: yProj
        }
    },
    project: function (axis) {
        throw 'project(axis) not implemented';
    },
    getAxes: function () {
        throw 'getAxes() not implemented';
    },
    move: function (dx, dy) {
        throw 'move(dx, dy) not implemented';
    },
// Drawing methods
    createPath: function (context) {
        throw 'createPath(context) not implemented';
    },
    fill: function (context) {
        context.save();
        context.fillStyle = this.fillStyle;
        this.createPath(context);
        context.fill();
        context.restore();
    },
    stroke: function (context) {
        context.save();
        context.lineWidth = this.lineWidth;
        context.strokeStyle = this.strokeStyle;
        this.createPath(context);
        context.stroke();
        context.restore();
    },
    isPointInPath: function (context, x, y) {
        this.createPath(context);
        return context.isPointInPath(x, y);
    }
};

// Polygon
var Polygon = function (pts) {
    this.vertices = [];
    if (Array.isArray(pts)) {
        for (var i = 0, x, y; i < pts.length; i++) {
            x = pts[i][0];
            y = pts[i][1];
            this.vertices.push(new Vector(x,y));
        }
    }
};

Polygon.prototype = new Shape();

Polygon.prototype.createPath = function (ctx) {
    var v = this.vertices;

    ctx.beginPath();
    ctx.moveTo(v[0].x, v[0].y);
    for (var i = 1; i < v.length; i++) {
        ctx.lineTo(v[i].x, v[i].y);
    }
    ctx.closePath();
};

Polygon.prototype.getAxes = function () {
    var v = this.vertices,
        v0, v1,
        axes = [];
    for (var i = 0; i < v.length; i++) {
        v0 = v[i];
        v1 = v[(i + 1) % v.length];
        axes.push(v0.edge(v1).normal());
    }

    return axes;
};

Polygon.prototype.project = function (axis) {
    var scalars = [];
    this.vertices.forEach( function (v) {
        scalars.push(v.dot(axis));
    });
    return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
};

Polygon.prototype.addPoint = function (x, y) {
    this.vertices.push(new Vector(x, y));
};

Polygon.prototype.move = function () {
    var v = this.vertices;
    for (var i = 0; i < v.length; i++) {
        v[i] = v[i].add(this.velocity);
    }
};

// Circle

var Circle = function (r, x, y) {
    this.radius = r || 1;
    this.center = new Vector(x || 0, y || 0);
};

Circle.prototype = new Shape();

Circle.prototype.project = function (axis) {
    var centerProj = this.center.dot(axis);
    return new Projection(centerProj - this.radius, centerProj + this.radius);
};

Circle.prototype.getAxes = function () {
    return undefined; // circle has an infinite number of axes
};

Circle.prototype.move = function () {
    this.center = this.center.add(this.velocity);
};

Circle.prototype.createPath = function (ctx) {
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, false);
    ctx.closePath();
};

// Projection

var Projection = function (min, max) {
    this.min = min;
    this.max = max;
};
Projection.prototype = {
    overlaps: function (projection) {
        return this.max > projection.min && projection.max > this.min;
    }
};
