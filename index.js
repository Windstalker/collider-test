var tid = null;
var INTERVAL = 100;
var objects = [];
var cnv = document.querySelector('#test'),
    ctx = cnv.getContext('2d');
var collider = new Collider();
collider.gameField = new Polygon([[0,0],[cnv.width,0],[cnv.width,cnv.height],[0,cnv.height]]);

// Custom objects
var someBox = new Polygon([[0,0],[20,0],[20,10],[0,10]]);
someBox.velocity = new Vector(5,5);
objects.push(someBox);

var someCircle = new Circle(10, 70, 50);
someCircle.velocity = new Vector(12,8);
objects.push(someCircle);

// Adding to collider

collider.addObject.apply(collider, objects);

function gameloop() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        obj.draw(ctx);
        obj.move();
    }

    collider.collideWithField();
}
function run() {
    tid = setTimeout(function () {
        if (tid) {
            run();
        }
    }, INTERVAL);
    gameloop();
}
function stop() {
    clearTimeout(tid);
    tid = null;
}

run();