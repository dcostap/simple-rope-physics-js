

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

    moveEnd(x, y) {
        this.masses[0].x = x;
        this.masses[0].y = y;
    }

    draw(x, y) {
        noFill()
        beginShape();
        stroke(237, 222, 222);
        strokeWeight(1);

        vertex(x + this.masses[0].x, y + this.masses[0].y);
        for (let i = 1; i < this.numSegments; i++) {
            vertex(x + this.masses[i].x, y + this.masses[i].y);
        }
        endShape();
    }

    setSpringConstant(value) {
        for (let s of this.springs) {
            s.springConstant = value;
        }
    }
}


const rope = new Rope(100, 1, 0.01, 0.1);


function setup() {
    createCanvas(windowWidth / 1.5, windowHeight / 1.5);
}

function draw() {
    background(5);

    rope.update(0.5);
    rope.moveEnd(mouseX, mouseY)
    rope.draw(0, 0);

    // beginShape();
    // stroke(237, 222, 222);
    // vertex(100, 100);
    // vertex(mouseX, mouseY);
    // endShape();
}

