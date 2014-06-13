var Game = function (el) {
    this.cnv = typeof el === 'string' ? document.querySelector(el) : el;
    this.cnv.style.border = "1px solid black";
    this.ctx = this.cnv.getContext('2d');

    this.width = this.cnv.width = 300;
    this.height = this.cnv.height = 300;

    this.raf = null;
    this.tid = null;
    this.INTERVAL = 100;
    this.GAME_SPEED = 1; // factor for slow down or speed up the game, "1" - regular speed

    this.objects = [];
    this.collider = new Collider();

    this.init();
};

Game.prototype.init = function () {
    var circle = null,
        polygon = null,
        basicVelocity = 100,
        perShapeCount = 5;
    /*
    for (var i = 0, r, x, y, w, h; i < perShapeCount; i++) {
        r = (Math.random() * 20 + 10) >> 0;
        x = ((this.width - 2 * r) * Math.random() + r) >> 0;
        y = ((this.height - 2 * r) * Math.random() + r) >> 0;

        circle = new Circle({
            radius: r,
            center: [x,y],
            velocity: new Vector((Math.random() - 0.5) * basicVelocity >> 0, (Math.random() - 0.5) * basicVelocity >> 0)
        });

        w = (Math.random() * 20 + 10) >> 0;
        h = (Math.random() * 20 + 10) >> 0;
        x = (this.width - w) * Math.random() >> 0;
        y = (this.height - h) * Math.random() >> 0;

        polygon = new Polygon({
            vertices: [[x,y], [x+w,y], [x+w,y+h], [x,y+h]],
            velocity: new Vector((Math.random() - 0.5) * basicVelocity >> 0, (Math.random() - 0.5) * basicVelocity >> 0)
        });

        this.objects.push(circle, polygon);
    }
    */
    circle = new Circle({
        radius: 10,
        center: [30,60],
        velocity: new Vector(50,0)
    });
    this.objects.push(circle);
    circle = new Circle({
        radius: 10,
        center: [150,70],
        velocity: new Vector(10,0)
    });
    this.objects.push(circle);

    this.collider.gameField = new Polygon({
        vertices: [
            [0, 0],
            [this.width, 0],
            [this.width, this.height],
            [0, this.height]
        ]
    });

    this.collider.addObject.apply(this.collider, this.objects);
};

Game.prototype.run = function () {
    var game = this,
        lastTime = null,
        callback = function (t) {
            if (lastTime === null) { lastTime = t }

            var dt = (t - lastTime) * game.GAME_SPEED / 1000; /** delta of time passed from previous
             * frame execution to the current frame (in seconds)
             * */
            var df = (t - lastTime) * game.GAME_SPEED * 60 / 1000; /** number of frame ticks passed from
             * previous frame execution to the current frame (if it was 60 frame/sec)
             * */

            game.loop(dt);

            lastTime = t;
            if (game.raf) {
                game.raf = window.requestAnimationFrame(callback);
            } else {
                lastTime = null;
            }
        };
    if (!game.raf) {
        game.raf = window.requestAnimationFrame(callback);
    }
};

Game.prototype.runInterval = function () {
    var game = this,
        lastTime = null,
        callback = function () {
            var t = Date.now();
            if (lastTime === null) { lastTime = t }
            var dt = (t - lastTime) * game.GAME_SPEED / 1000; /** delta of time passed from previous
             * frame execution to the current frame (in seconds)
             * */
            var df = (t - lastTime) * game.GAME_SPEED * 60 / 1000; /** number of frame ticks passed from
             * previous frame execution to the current frame (if it was 60 frame/sec)
             * */
            game.loop(dt);

            lastTime = t;
            if (game.tid) {
                game.tid = setTimeout(callback, game.INTERVAL);
            } else {
                lastTime = null;
            }
        };
    if (!game.tid) {
        game.tid = setTimeout(callback, 0);
    }
};

Game.prototype.stop = function () {
    if (this.raf) {
        window.cancelAnimationFrame(this.raf);
        this.raf = null;
    }
    if (this.tid) {
        clearTimeout(this.tid);
        this.tid = null;
    }
};

Game.prototype.loop = function (dt) {
    this.draw(dt);
    this.update(dt);
};

Game.prototype.draw = function (dt) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        obj.draw(this.ctx);
    }
};

Game.prototype.update = function (dt) {
    for (var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        obj.move(dt);
    }
    this.collider.detectCollision();
};