class Rope {
    constructor(numSegments, segmentLength, springConstant, damping) {
        this.numSegments = numSegments;
        this.segmentLength = segmentLength;
        this.springConstant = springConstant;
        this.damping = damping;

        this.masses = [];
        this.springs = [];

        for (let i = 0; i < numSegments; i++) {
            const mass = {
                x: i * segmentLength,
                y: 0,
                vx: 0,
                vy: 0,
                ax: 0,
                ay: 0
            };
            this.masses.push(mass);

            if (i > 0) {
                const spring = {
                    massA: this.masses[i - 1],
                    massB: mass,
                    restLength: segmentLength,
                    springConstant: springConstant
                };
                this.springs.push(spring);
            }
        }

        this.anchor = { x: 0, y: 0 };
    }

    update() {
        for (let i = 0; i < this.numSegments; i++) {
            const mass = this.masses[i];
            mass.x += mass.vx;
            mass.y += mass.vy;

            // Apply damping to the velocity of each mass
            mass.vx *= 1 - this.damping;
            mass.vy *= 1 - this.damping;
        }

        for (let i = 0; i < this.springs.length; i++) {
            const spring = this.springs[i];
            const dx = spring.massB.x - spring.massA.x;
            const dy = spring.massB.y - spring.massA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const displacement = distance - spring.restLength;
            const springForce = displacement * spring.springConstant;
            const fx = (dx / distance) * springForce;
            const fy = (dy / distance) * springForce;
            spring.massA.ax += fx;
            spring.massA.ay += fy;
            spring.massB.ax -= fx;
            spring.massB.ay -= fy;
        }

        for (let i = 0; i < this.numSegments; i++) {
            const mass = this.masses[i];
            mass.vx += mass.ax;
            mass.vy += mass.ay;
            mass.ax = 0;
            mass.ay = 0;
        }
    }

    place(x, y) {
        // Set the anchor point to the specified position
        this.anchor.x = x;
        this.anchor.y = y;

        // Reset the position of the masses to form a straight line
        for (let i = 0; i < this.numSegments; i++) {
            this.masses[i].x = this.anchor.x + i *
                this.segmentLength;
            this.masses[i].y = this.anchor.y;
        }
    }

    dragTo(x, y, maxLength) {
        // Calculate the distance between the anchor point and the specified point
        let dx = x - this.anchor.x;
        let dy = y - this.anchor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Limit the maximum length of the rope
        if (distance > maxLength) {
            dx *= maxLength / distance;
            dy *= maxLength / distance;
        }

        // Move the end of the rope to the specified point
        this.masses[this.numSegments - 1].x = this.anchor.x + dx;
        this.masses[this.numSegments - 1].y = this.anchor.y + dy;

        // Apply a velocity to the end of the rope to simulate dragging
        this.masses[this.numSegments - 1].vx = dx * 0.5;
        this.masses[this.numSegments - 1].vy = dy * 0.5;
    }

    draw(x, y) {
        noFill()
        beginShape();
        stroke(237, 222, 222);
        strokeWeight(1);

        vertex(x + this.anchor.x, y + this.anchor.y);
        for (let i = 0; i < this.numSegments; i++) {
            vertex(x + this.masses[i].x, y + this.masses[i].y);
        }
        endShape();
    }
}


class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    overlaps(other) {
        return !(
            this.x + this.w < other.x ||
            other.x + other.w < this.x ||
            this.y + this.h < other.y ||
            other.y + other.h < this.y
        );
    }


    draw() {
        noFill()
        beginShape();
        stroke(237, 222, 222);
        strokeWeight(2);

        vertex(this.x, this.y);
        vertex(this.x + this.w, this.y);
        vertex(this.x + this.w, this.y + this.h);
        vertex(this.x, this.y + this.h);
        vertex(this.x, this.y);
        endShape();
    }
}



class Player extends Rect {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.speed = 4;
    }

    update(walls) {
        if (keyIsDown(87)) { // W
            this.move(0, -this.speed, walls);
        }
        if (keyIsDown(83)) { // S
            this.move(0, this.speed, walls);
        }
        if (keyIsDown(65)) { // A
            this.move(-this.speed, 0, walls);
        }
        if (keyIsDown(68)) { // D
            this.move(this.speed, 0, walls);
        }
    }

    move(dx, dy, walls) {
        // Move the player by dx and dy
        this.x += dx;
        this.y += dy;

        // Check for collisions with each wall
        for (let wall of walls) {
            if (this.overlaps(wall)) {
                // If there's a collision, move the player back to its previous position
                this.x -= dx;
                this.y -= dy;
                break;  // We don't need to check any more walls
            }
        }
    }

    draw() {
        super.draw();
        noFill()
        beginShape();
        stroke(237, 222, 222);
        strokeWeight(2);

        vertex(this.x + this.w, this.y + this.h / 2);
        vertex(this.x + this.w / 2, this.y + this.h / 2);
        endShape();
    }
}

let player = new Player(50, 50, 40, 40);

let walls = [
    new Rect(100, 100, 40, 40),
    new Rect(200, 200, 40, 40),
    new Rect(300, 300, 40, 40),
];

const rope = new Rope(100, 1, 0.01, 0.1);
const rope2 = new Rope(100, 1, 0.01, 0.1);

function setup() {
    createCanvas(windowWidth / 1.1, windowHeight / 1.1);
    rope.place(40, 50)
    rope2.place(20, windowHeight)
}

function draw() {
    background(5);

    rope.update(0.5);
    rope.dragTo(player.x, player.y, 500)
    rope.draw(0, 0);

    rope2.update(0.5);
    rope2.dragTo(mouseX, mouseY, 1000)
    rope2.draw(0, 0);

    player.update(walls);
    player.draw();

    // Draw the walls
    for (let wall of walls) {
        wall.draw();
    }
}