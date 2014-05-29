var Collider = function () {
    this.objects = [];
    this.gameField = null;
};
Collider.prototype.addObject = function () {
    if (arguments.length) {
        this.objects.push.apply(this.objects, arguments);
    }
};
Collider.prototype.removeObject = function (i) {
    return this.objects.splice(i);
};
Collider.prototype.detectCollision = function () {
    var obj0, obj1;
    // All objects with all objects collision check
    for (var i = 0, l = this.objects.length; i < l; i++) {
        obj0 = this.objects[i];
        if (i < l - 1) {
            for (var j = i + 1; j < l; j++) {
                obj1 = this.objects[j];
                this.collide(obj0, obj1);
            }
        }
        this.collideWithField(obj0)
    }
};
Collider.prototype.collideWithField = function (obj) {
    this.collideInsideAABB(obj, this.gameField);
};
Collider.prototype.collide = function (shape0, shape1) {
    var axes0 = shape0.getAxes();
    var axes1 = shape1.getAxes();
    if (!axes0 && !axes1) {
        this.circleWithCircle(shape0, shape1);
    }
    if (axes0 && axes1) {
        this.polygonWithPolygon(axes0.concat(axes1), shape0, shape1)
    }
    if (axes0 && !axes1 || !axes0 && axes1) {
        var circle = !axes1 && shape1 || !axes0 && shape0;
        var polygon = !!axes0 && shape0 || !!axes1 && shape1;
        this.polygonWithCircle(axes0 || axes1, polygon, circle);
    }
};
Collider.prototype.separationOnAxes = function (axes, shape0, shape1) {
    var axis, pr0, pr1;
    for (var i = 0; i < axes.length; ++i) {
        axis = axes[i];
        pr0 = shape0.project(axis);
        pr1 = shape1.project(axis);
        if (!pr0.overlaps(pr1)) {
            return true; // Don't have to test remaining axes
        }
    }
    return false;
};
Collider.prototype.collideInsideAABB = function (content, container) {
    var contentBox = content.getBoundingBox(),
        containerBox = container.getBoundingBox();

    var outOfX = !contentBox.x.overlappedBy(containerBox.x),
        outOfY = !contentBox.y.overlappedBy(containerBox.y);

    if (outOfX || outOfY) {
        var dx0 = contentBox.x.min - containerBox.x.min, // this.min >= projection.min && projection.max >= this.max) || (this.max >= projection.max && projection.min >= this.min
            dx1 = containerBox.x.max - contentBox.x.max,
            dy0 = contentBox.y.min - containerBox.y.min,
            dy1 = containerBox.y.max - contentBox.y.max;
        var mtvX = +outOfX * Math.min(dx0, dx1);
        var mtvY = +outOfY * Math.min(dy0, dy1);
        var mtv = content.velocity.normalize().invert().scale(new Vector(mtvX, mtvY).getMagnitude());
        content.move(0, mtv);
    }

    if (outOfX) {
        content.velocity = content.velocity.invertX();
//        container.velocity = container.velocity.invertX();
    }
    if (outOfY) {
        content.velocity = content.velocity.invertY();
//        container.velocity = container.velocity.invertY();
    }
    return outOfX || outOfY
};
Collider.prototype.polygonWithPolygon = function (a, p0, p1) {
    if (!this.separationOnAxes(a, p0, p1)) {
        //reaction here
    }
};
Collider.prototype.circleWithCircle = function (c0, c1) {
    var d = new Vector(c1.center).subtract(c0.center).getMagnitude();
    var overlap = c0.radius + c1.radius - d;
    if (overlap > 0) { //colliding rule
        //reaction here
    }
};
Collider.prototype.polygonWithCircle = function (a, p, c) {
    if (!this.separationOnAxes(a, p, c)) {
        //reaction here
    }
};