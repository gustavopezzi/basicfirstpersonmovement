/*****************************************************************************/
// This source code is a simple demonstration of how to process 2D movement.
//
// The goal of this code is to be the starting point when it comes to teaching
// the basics of transformations for first person movement.
//
// Wall:
//     x1:       beginning position coordinate x1 of the wall
//     y1:       beginning position coordinate y1 of the wall
//     x2:       end position coordinate x2 of the wall
//     y2:       end position coordinate y2 of the wall
//     color:    wall color in hex
//     draw:     method to render wall position based on the player new values
//
// Player:
//     x:        the player x position on the screen
//     y:        the player y position on the screen
//     angle:    the player rotation angle in radians
//     speed:    the speed factor that increases when pressing the shift key
//     angSpeed: how much the angle changes when pressing left or right keys
//     update:   method to change the values acording to what keys are pressed
//     draw:     method to render the player in the center of the canvas
/*****************************************************************************/

var KEY_ARROW_UP = false;
var KEY_ARROW_DOWN = false;
var KEY_ARROW_LEFT = false;
var KEY_ARROW_RIGHT = false;
var KEY_SHIFT = false;
var canvasCenter;
var canvas;
var context;
var player;
var walls;


function crossProduct(x1, y1, x2, y2) {
    return (x1 * y2) - (y1 * x2);
}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    var x = crossProduct(x1, y1, x2, y2);
    var y = crossProduct(x3, y3, x4, y4);
    var det = crossProduct(x1 - x2, y1 - y2, x3 - x4, y3 - y4);
    return {
        x: crossProduct(x, x1 - x2, y, x3 - x4) / det,
        y: crossProduct(x, y1 - y2, y, y3 - y4) / det
    }
}

/*****************************************************************************/
// WALL CLASS
/*****************************************************************************/
var Wall = function (x1, y1, x2, y2, color) {
    this.x1 = x1, this.y1 = y1;
    this.x2 = x2, this.y2 = y2;
    this.color = color;

    this.draw = function () {
        var tx1 = this.x1 - player.x;
        var ty1 = this.y1 - player.y;
        var tx2 = this.x2 - player.x;
        var ty2 = this.y2 - player.y;

        // rotate them around the players view
        tz1 = tx1 * Math.cos(player.angle) + ty1 * Math.sin(player.angle);
        tz2 = tx2 * Math.cos(player.angle) + ty2 * Math.sin(player.angle);
        tx1 = tx1 * Math.sin(player.angle) - ty1 * Math.cos(player.angle);
        tx2 = tx2 * Math.sin(player.angle) - ty2 * Math.cos(player.angle);

        // draw map
        /*
        context.beginPath();
        context.lineWidth = 4;
        context.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        context.moveTo(canvasCenter - tx1, canvasCenter - tz1);
        context.lineTo(canvasCenter - tx2, canvasCenter - tz2);
        context.stroke();
        */

        if (tz1 > 0 || tz2 > 0) {
            // clip line if it crosses the players viewplane
            var wallIntersection = intersect(tx1, tz1, tx2, tz2, -0.0001, 0.0001, -canvasCenter, canvasCenter/10);
            var ix1 = wallIntersection.x;
            var iz1 = wallIntersection.y;

            var wallIntersection = intersect(tx1, tz1, tx2, tz2, 0.0001, 0.0001, canvasCenter, canvasCenter/10);
            var ix2 = wallIntersection.x;
            var iz2 = wallIntersection.y;

            if (tz1 <= 0) {
                if (iz1 > 0) {
                    tx1 = ix1;
                    tz1 = iz1;
                }
                else {
                    tx1 = ix2;
                    tz1 = iz2;
                }
            }

            if (tz2 <= 0) {
                if (iz1 > 0) {
                    tx2 = ix1;
                    tz2 = iz1;
                }
                else {
                    tx2 = ix2;
                    tz2 = iz2;
                }
            }

            var x1 = -tx1 * 80 / tz1;
            var y1a = -canvasCenter / tz1;
            var y1b = canvasCenter / tz1;

            var x2 = -tx2 * 80 / tz2;
            var y2a = -canvasCenter / tz2;
            var y2b = canvasCenter / tz2;

            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = this.color;
            context.moveTo(canvasCenter + x1, canvasCenter + y1a); context.lineTo(canvasCenter + x2, canvasCenter + y2a); // top    (1-2 b)
            context.moveTo(canvasCenter + x1, canvasCenter + y1b); context.lineTo(canvasCenter + x2, canvasCenter + y2b); // bottom (1-2 b)
            context.moveTo(canvasCenter + x1, canvasCenter + y1a); context.lineTo(canvasCenter + x1, canvasCenter + y1b); // left   (1)
            context.moveTo(canvasCenter + x2, canvasCenter + y2a); context.lineTo(canvasCenter + x2, canvasCenter + y2b); // right  (2)
            context.stroke();
        }
    }
}

/*****************************************************************************/
// PLAYER CLASS
/*****************************************************************************/
var Player = function () {
    this.x;
    this.y;
    this.speed;
    this.angle;
    this.angSpeed = 0.04;

    this.update = function () {
        if (KEY_ARROW_UP) {
            this.x = this.x + Math.cos(this.angle) * this.speed;
            this.y = this.y + Math.sin(this.angle) * this.speed;
        }
        if (KEY_ARROW_DOWN) {
            this.x = this.x - Math.cos(this.angle) * this.speed;
            this.y = this.y - Math.sin(this.angle) * this.speed;
        }
        if (KEY_ARROW_LEFT) {
            this.angle = this.angle - this.angSpeed;
        }
        if (KEY_ARROW_RIGHT) {
            this.angle = this.angle + this.angSpeed;
        }

        this.speed = (KEY_SHIFT) ? 1 : 0.5;
    }

    this.draw = function () {
        context.beginPath();
        context.rect(canvasCenter - 2, canvasCenter - 2, 4, 4);
        context.fillStyle = 'white';
        context.lineWidth = 1;
        context.strokeStyle = '#777';
        context.moveTo(canvasCenter, canvasCenter);
        context.lineTo(Math.cos(Math.PI*3/2) * 10 + canvasCenter, Math.sin(Math.PI*3/2) * 10 + canvasCenter);
        context.stroke();
        context.fill();
    }
}

/*****************************************************************************/
// TRIGGER FUNCTIONS FOR KEY DOWN AND KEY UP
/*****************************************************************************/
function onKeyDown(evt) {
    switch (evt.keyCode) {
        case 39: KEY_ARROW_RIGHT = true; break;
        case 37: KEY_ARROW_LEFT  = true; break;
        case 38: KEY_ARROW_UP    = true; break;
        case 40: KEY_ARROW_DOWN  = true; break;
        case 16: KEY_SHIFT       = true; break;
    }
}

function onKeyUp(evt) {
    switch (evt.keyCode) {
        case 39: KEY_ARROW_RIGHT = false; break;
        case 37: KEY_ARROW_LEFT  = false; break;
        case 38: KEY_ARROW_UP    = false; break;
        case 40: KEY_ARROW_DOWN  = false; break;
        case 16: KEY_SHIFT       = false; break;
    }
}

/*****************************************************************************/
// DEGREE AND RADIAN ANGLE CONVERSION
/*****************************************************************************/
function deg2rad(angleInDegrees) {
    return angleInDegrees * (Math.PI / 180);
}

function rad2deg(angleInRadians) {
    return angleInRadians * (180 / Math.PI);
}

/*****************************************************************************/
// ANIMATION LOOP
/*****************************************************************************/
function mainAnimationLoop() {
    // clear canvas every frame
    context.fillStyle = "black";
    context.clearRect(0, 0, canvas.width, canvas.height);

    // update properties and redraw walls on canvas
    walls.forEach(function (wall) {
        wall.draw();
    });

    // update properties and redraw player on canvas
    player.update();
    //player.draw();

    // recall animation frame loop
    window.requestAnimationFrame(mainAnimationLoop);
}

/**********************************************/
// ON LOAD
/**********************************************/
document.addEventListener("DOMContentLoaded", function(event) {
    canvas = document.getElementById('canvas-map');
    context = canvas.getContext("2d");

    canvasCenter = canvas.width / 2;

    // create the player object
    player = new Player();
    player.x = canvas.width / 3;
    player.y = canvas.height / 2;
    player.angle = 0;

    walls = new Array(
        new Wall(140, 100, 140, 200, '#fff'),
        new Wall(140, 100,  70, 100, '#fff'),
        new Wall( 70, 100,  70, 200, '#fff'),
        new Wall( 70, 200, 140, 200, '#fff')
    );

    // key event listeners
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

    // start animation frame loop
    window.requestAnimationFrame(mainAnimationLoop);

    window.requestAnimationFrame = function () {
        return window.requestAnimationFrame || function(a) {
            window.setTimeout(a, 1000 / 60);
        }
    }();
});