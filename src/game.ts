const directions = ['up', 'down', 'left', 'right', 'stop'] as const;

type DirectionType = typeof directions[number];
type Coordinates = {
  x: number;
  y: number;
};

export class Game {
  private maxWidth: number;
  private maxHeight: number;
  private ctx: CanvasRenderingContext2D;
  private player: Sprite;
  private surfaces: Sprite[] = [];

  constructor(canvas: HTMLCanvasElement) {
    const dimensions = canvas.getBoundingClientRect();
    this.maxWidth = dimensions.width;
    this.maxHeight = dimensions.height;
    this.ctx = canvas.getContext('2d')!;
    // create player sprite in the middle of the screen
    this.player = new Sprite(
      this.maxWidth / 2,
      this.maxHeight / 2,
      50,
      50,
      'red',
      0.5,
      1
    );

    // create ground sprite
    const ground = new Sprite(
      0,
      this.maxHeight - 50,
      this.maxWidth,
      50,
      'green'
    );

    // create platform stairs sprite
    const platforms = [];
    for (let i = 0; i < 10; i++) {
      platforms.push(
        new Sprite(100 + i * 50, this.maxHeight - 100 - i * 50, 50, 50, 'blue')
      );
    }

    this.surfaces = [ground, ...platforms];
  }

  public drawSprite(sprite: Sprite) {
    this.ctx.fillStyle = sprite.color;
    this.ctx.fillRect(sprite.x, sprite.y, sprite.width, sprite.height);
  }

  public draw() {
    this.ctx.clearRect(0, 0, 800, 600);
    this.drawSprite(this.player);
    this.surfaces.forEach((surface) => this.drawSprite(surface));
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

  // Check if sprite is touching a surface
  public isTouching(sprite: Sprite, surface: Sprite) {
    return (
      sprite.x <= surface.x + surface.width &&
      sprite.x + sprite.width >= surface.x &&
      sprite.y <= surface.y + surface.height &&
      sprite.y + sprite.height >= surface.y
    );
  }

  public update() {
    this.move();
    this.draw();

    // check if player is touching a surface
    this.player.surfacesTouched = this.surfaces.filter((surface) =>
      this.isTouching(this.player, surface)
    );

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
  public surfacesTouched: Sprite[] = [];

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
        if (this.surfacesTouched.length > 0) {
          this.acceleration.y = -this.dex * 20;
        }
        break;
      case 'left':
        this.acceleration.x = -this.dex * 2;
        break;
      case 'right':
        this.acceleration.x = this.dex * 2;
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
      this.velocity.y = this.weight * 10;
    }
    if (this.velocity.y < -5) {
      this.velocity.y = -5;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // calculate friction and air resistance
    const friction = 0.7;
    const airResistance = 0.99;
    if (this.surfacesTouched.length > 0) {
      this.velocity.x *= friction;
    }
    this.velocity.x *= airResistance;

    // check if sprite is on the ground
    if (this.velocity.y > 0 && this.surfacesTouched.length > 0) {
      //   console.log(this.velocity.y);
      // find the surface that is closest to the sprites feet and set the sprites y position to the surface
      if (this.surfacesTouched.length > 1) {
        this.surfacesTouched.sort((a, b) => {
          const aDistance = a.y - a.height - this.y;
          const bDistance = b.y - b.height - this.y;
          return bDistance - aDistance;
        });
      }
      this.y = this.surfacesTouched[0].y - this.height;
      this.velocity.y = 0;
    }

    // apply gravity
    if (!this.surfacesTouched.length) {
      this.acceleration.y = this.weight * 0.5;
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
