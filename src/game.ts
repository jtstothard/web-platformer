const directions = ['up', 'down', 'left', 'right', 'stop'] as const;
const surfaceValues = ['top', 'bottom', 'left', 'right'] as const;
type SurfaceType = typeof surfaceValues[number];

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

  // Check if sprite is touching a surface and return the sides that are touching
  public isTouching(sprite: Sprite, surface: Sprite) {
    const spriteLeft = sprite.x;
    const spriteRight = sprite.x + sprite.width;
    const spriteTop = sprite.y;
    const spriteBottom = sprite.y + sprite.height;

    const surfaceLeft = surface.x;
    const surfaceRight = surface.x + surface.width;
    const surfaceTop = surface.y;
    const surfaceBottom = surface.y + surface.height;

    const touching: SurfaceType[] = [];

    if (spriteLeft <= surfaceRight && spriteRight >= surfaceLeft) {
      if (spriteTop <= surfaceBottom && spriteBottom >= surfaceTop) {
        if (spriteBottom >= surfaceTop) {
          touching.push('top');
        }
        if (spriteTop <= surfaceBottom) {
          touching.push('bottom');
        }
        if (spriteRight >= surfaceLeft) {
          touching.push('left');
        }
        if (spriteLeft <= surfaceRight) {
          touching.push('right');
        }
      }
    }
    return touching;
  }

  public update() {
    this.move();
    this.draw();

    // check if player is touching a surface
    this.player.surfacesTouched = this.surfaces.reduce((acc, surface) => {
      const touching = this.isTouching(this.player, surface);
      if (touching.length > 0) {
        acc.push({ sprite: surface, surfaces: touching });
      }
      return acc;
    }, [] as { sprite: Sprite; surfaces: SurfaceType[] }[]);

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
  public surfacesTouched: { sprite: Sprite; surfaces: SurfaceType[] }[] = [];

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

  public checkIfTouchingFloor() {
    return (
      this.surfacesTouched.filter(({ surfaces }) => {
        return surfaces.includes('bottom');
      }).length > 0
    );
  }

  public isTouchingFloor = false;

  public update(direction: DirectionType) {
    switch (direction) {
      case 'up':
        // only jump if sprite is on a surface
        if (this.isTouchingFloor) {
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
    this.isTouchingFloor = this.checkIfTouchingFloor();

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
    if (this.isTouchingFloor) {
      this.velocity.x *= friction;
    }
    this.velocity.x *= airResistance;

    // check if sprite is on the ground
    if (this.velocity.y > 0 && this.isTouchingFloor) {
      // get the surface that the sprite is touching floor
      const surface = this.surfacesTouched.filter(({ surfaces }) => {
        return surfaces.includes('bottom');
      })[0].sprite;

      // set sprite to the surface
      this.y = surface.y - this.height;
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
