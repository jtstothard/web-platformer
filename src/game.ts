const directions = ['up', 'down', 'left', 'right', 'stop'] as const;

type DirectionType = typeof directions[number];
type Coordinates = {
  x: number;
  y: number;
};

export class Game {
  private ctx: CanvasRenderingContext2D;
  private player: Sprite;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    // create player sprite in the middle of the screen
    this.player = new Sprite(400, 300, 50, 50, 'red', 1, 1);
  }

  public drawSprite(sprite: Sprite) {
    this.ctx.fillStyle = sprite.color;
    this.ctx.fillRect(sprite.x, sprite.y, sprite.width, sprite.height);
  }

  public draw() {
    this.ctx.clearRect(0, 0, 800, 600);
    this.drawSprite(this.player);
  }

  public start() {
    this.addEventListener();
    this.draw();
    requestAnimationFrame(() => this.update());
  }

  // add event listener to the window
  public addEventListener() {
    window.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
    window.addEventListener('keyup', (event) => {
      this.handleKeyUp(event);
    });
  }

  // handle key down event
  private handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.player.update('up');
        break;
      case 'ArrowDown':
        this.player.update('down');
        break;
      case 'ArrowLeft':
        this.player.update('left');
        break;
      case 'ArrowRight':
        this.player.update('right');
        break;
    }
  }

  // handle key up event
  private handleKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        this.player.update('stop');
        break;
    }
  }

  // add continuous movement
  public move() {
    this.player.move();
  }

  // check if sprite is on the ground
  public isOnGround(sprite: Sprite) {
    return sprite.y + sprite.height >= 600;
  }

  public update() {
    this.move();
    this.draw();
    this.player.isTouchingSurface = this.isOnGround(this.player);
    requestAnimationFrame(() => this.update());
  }
}
class Sprite {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string;
  public acceleration: Coordinates = { x: 0, y: 0 };
  public velocity: Coordinates = { x: 0, y: 0 };
  public dex: number;
  public weight: number;
  public isTouchingSurface: boolean = false;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    dex = 0,
    weight = 0
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.dex = dex;
    this.weight = weight;
  }

  public update(direction: DirectionType) {
    switch (direction) {
      case 'up':
        // only jump if sprite is on a surface
        if (this.isTouchingSurface) {
          this.acceleration.y = -this.dex;
        }
        break;
      case 'left':
        this.acceleration.x = -this.dex;
        break;
      case 'right':
        this.acceleration.x = this.dex;
        break;
      case 'stop':
        this.acceleration.x = 0;
        break;
      default:
        break;
    }
  }

  public move() {
    const maxVelocity = this.dex * 10;

    // apply velocity
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    // max velocity
    if (this.velocity.x > maxVelocity) {
      this.velocity.x = maxVelocity;
    }
    if (this.velocity.x < -maxVelocity) {
      this.velocity.x = -maxVelocity;
    }
    if (this.velocity.y > 5) {
      this.velocity.y = this.weight * 20;
    }
    if (this.velocity.y < -5) {
      this.velocity.y = -5;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // apply gravity
    this.acceleration.y += 0.1;

    // calculate friction and air resistance
    const friction = 0.9;
    const airResistance = 0.99;
    if (this.isTouchingSurface) {
      this.velocity.x *= friction;
    }
    this.velocity.x *= airResistance;

    // check if sprite is on the ground
    if (this.y + this.height >= 600) {
      this.y = 600 - this.height;
      this.velocity.y = 0;
    }

    // check if sprite is on the left wall
    if (this.x <= 0) {
      this.x = 0;
      this.velocity.x = 0;
    }

    // check if sprite is on the right wall
    if (this.x + this.width >= 800) {
      this.x = 800 - this.width;
      this.velocity.x = 0;
    }

    // check if sprite is on the top wall
    if (this.y <= 0) {
      this.y = 0;
      this.velocity.y = 0;
    }

    // check if sprite is on the bottom wall
    if (this.y + this.height >= 600) {
      this.y = 600 - this.height;
      this.velocity.y = 0;
    }
  }
}
