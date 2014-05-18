var Point = function (x, y) {
	this.x = x || 0;
	this.y = x || 0;
};
var Shape = function (opts) {
	var options = opts || {};
	this.x = options.x || null;
	this.y = options.y || null;
	this.strokeStyle = options.strokeStyle || '#000000';
	this.fillStyle = options.fillStyle || '#ffffff';
};
Shape.prototype = {
// Collision detection methods.....................................
	collidesWith: function (shape) {
		var axes = this.getAxes().concat(shape.getAxes());
		return !this.separationOnAxes(axes, shape);
	},
	separationOnAxes: function (axes, shape) {
		var axis, projection1, projection2;
		for (var i=0; i < axes.length; ++i) {
			axis = axes[i];
			projection1 = shape.project(axis);
			projection2 = this.project(axis);
			if (! projection1.overlaps(projection2)) {
				return true; // Don't have to test remaining axes
			}
		}
		return false;
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
// Drawing methods.................................................
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
var Projection = function (min, max) {
	this.min = min;
	this.max = max;
};
Projection.prototype = {
	overlaps: function (projection) {
		return this.max > projection.min && projection.max > this.min;
	}
};
