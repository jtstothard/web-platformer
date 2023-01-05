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
    this.ctx.fillRect(
      sprite.coordinates.x,
      sprite.coordinates.y,
      sprite.width,
      sprite.height
    );
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

  // find the surface that the player is touching
  public whichSurfaceTouchingWith(a: Sprite, b: Sprite) {
    if (
      a.coordinates.x < b.coordinates.x + b.width &&
      a.coordinates.x + a.width > b.coordinates.x
    ) {
      if (a.coordinates.y === b.coordinates.y + b.height) return 'bottom';
      if (a.coordinates.y + a.height === b.coordinates.y) return 'top';
    }

    if (
      a.coordinates.y < b.coordinates.y + b.height &&
      a.coordinates.y + a.height > b.coordinates.y
    ) {
      if (a.coordinates.x === b.coordinates.x + b.width) return 'right';
      if (a.coordinates.x + a.width === b.coordinates.x) return 'left';
    }

    return null;
  }

  public whichSurfaceCollidingWith(a: Sprite, b: Sprite) {
    const isColliding =
      a.coordinates.x < b.coordinates.x + b.width &&
      a.coordinates.x + a.width > b.coordinates.x &&
      a.coordinates.y < b.coordinates.y + b.height &&
      a.coordinates.y + a.height > b.coordinates.y;

    if (isColliding) {
      let timeToCollisionList: { surface: SurfaceType; time: number }[] = [];
      // Assuming a is the player and b is the surface
      // based on the player's previous coordinates and the velocity, we can determine which side of the player is touching the surface
      if (a.velocity.x >= 0) {
        // player is moving right
        const timeToCollision =
          (b.coordinates.x - a.previousCoordinates.x - a.width) / a.velocity.x;
        timeToCollisionList.push({ surface: 'left', time: timeToCollision });
      } else if (a.velocity.x <= 0) {
        // player is moving left
        const timeToCollision =
          (b.coordinates.x + b.width - a.previousCoordinates.x) / a.velocity.x;
        timeToCollisionList.push({ surface: 'right', time: timeToCollision });
      }

      if (a.velocity.y >= 0) {
        // player is moving down
        const timeToCollision =
          (b.coordinates.y - a.previousCoordinates.y - a.height) /
            a.velocity.y || 0;
        timeToCollisionList.push({ surface: 'top', time: timeToCollision });
      } else if (a.velocity.y <= 0) {
        // player is moving up
        const timeToCollision =
          (b.coordinates.y + b.height - a.previousCoordinates.y) / a.velocity.y;
        timeToCollisionList.push({ surface: 'bottom', time: timeToCollision });
      }

      // return the surface with the smallest time to collision (only positive values)
      const res = timeToCollisionList
        .filter((t) => t.time >= 0)
        .sort((a, b) => a.time - b.time)[0];
      return res?.surface || null;
    }
    return null;
  }

  public update() {
    requestAnimationFrame(() => this.update());
    this.move();
    this.draw();

    // check if player is touching a surface
    this.player.surfacesTouched = this.surfaces.reduce((acc, surface) => {
      const colliding = this.whichSurfaceTouchingWith(this.player, surface);
      if (colliding) {
        acc.push({ sprite: surface, surface: colliding });
      }
      return acc;
    }, [] as { sprite: Sprite; surface: SurfaceType }[]);
    // check if player is colliding with a surface
    this.player.surfacesCollided = this.surfaces.reduce((acc, surface) => {
      const colliding = this.whichSurfaceCollidingWith(this.player, surface);
      if (colliding) {
        acc.push({ sprite: surface, surface: colliding });
      }
      return acc;
    }, [] as { sprite: Sprite; surface: SurfaceType }[]);
  }
}
class Sprite {
  public coordinates: Coordinates = { x: 0, y: 0 };
  public previousCoordinates: Coordinates = { x: 0, y: 0 };
  public width: number;
  public height: number;
  public color: string;
  public acceleration: Coordinates = { x: 0, y: 0 };
  public velocity: Coordinates = { x: 0, y: 0 };
  public dex: number;
  public weight: number;
  public surfacesCollided: { sprite: Sprite; surface: SurfaceType }[] = [];
  public surfacesTouched: { sprite: Sprite; surface: SurfaceType }[] = [];

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    dex = 0,
    weight = 0
  ) {
    this.coordinates.x = x;
    this.coordinates.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.dex = dex;
    this.weight = weight;
  }

  public checkIfTouchingFloor() {
    return (
      this.surfacesTouched.filter(({ surface }) => {
        return surface === 'top';
      }).length > 0 ||
      this.surfacesCollided.filter(({ surface }) => {
        return surface === 'top';
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
    const updatedSprite: Sprite = JSON.parse(JSON.stringify(this));
    updatedSprite.previousCoordinates = { ...updatedSprite.coordinates };

    updatedSprite.isTouchingFloor = this.checkIfTouchingFloor();

    const maxVelocity = this.dex * 10;

    // apply velocity
    updatedSprite.velocity.x += updatedSprite.acceleration.x;
    updatedSprite.velocity.y += updatedSprite.acceleration.y;

    // max velocity
    if (updatedSprite.velocity.x > maxVelocity) {
      updatedSprite.velocity.x = maxVelocity;
    }
    if (updatedSprite.velocity.x < -maxVelocity) {
      updatedSprite.velocity.x = -maxVelocity;
    }
    if (updatedSprite.velocity.y > 5) {
      updatedSprite.velocity.y = updatedSprite.weight * 10;
    }
    if (updatedSprite.velocity.y < -5) {
      updatedSprite.velocity.y = -5;
    }
    // apply velocity to coordinates if not touching a surface in that direction and deal with collisions
    if (
      !updatedSprite.surfacesTouched.some((s) => s.surface === 'left') &&
      updatedSprite.velocity.x > 0
    ) {
      updatedSprite.coordinates.x += updatedSprite.velocity.x;
    }
    if (
      !updatedSprite.surfacesTouched.some((s) => s.surface === 'top') &&
      updatedSprite.velocity.y > 0
    ) {
      updatedSprite.coordinates.y += updatedSprite.velocity.y;
    }
    if (
      !updatedSprite.surfacesTouched.some((s) => s.surface === 'right') &&
      updatedSprite.velocity.x < 0
    ) {
      updatedSprite.coordinates.x += updatedSprite.velocity.x;
    }
    if (
      !updatedSprite.surfacesTouched.some((s) => s.surface === 'bottom') &&
      updatedSprite.velocity.y < 0
    ) {
      updatedSprite.coordinates.y += updatedSprite.velocity.y;
    }
    // calculate friction and air resistance
    const friction = 0.7;
    const airResistance = 0.99;
    if (updatedSprite.isTouchingFloor) {
      updatedSprite.velocity.x *= friction;
    }
    updatedSprite.velocity.x *= airResistance;

    const gravity = updatedSprite.weight * 0.5;
    // apply gravity
    if (!updatedSprite.surfacesTouched.length) {
      updatedSprite.acceleration.y = gravity;
    }

    // handle collisions and translations
    updatedSprite.surfacesCollided.forEach(({ sprite, surface }) => {
      switch (surface) {
        case 'top':
          updatedSprite.previousCoordinates.y =
            sprite.coordinates.y - updatedSprite.height;
          updatedSprite.coordinates.y =
            sprite.coordinates.y - updatedSprite.height;
          updatedSprite.velocity.y = 0;
          break;
        case 'bottom':
          updatedSprite.coordinates.y = sprite.coordinates.y + sprite.height;
          updatedSprite.velocity.y = 0;
          break;
        case 'left':
          updatedSprite.coordinates.x =
            sprite.coordinates.x - updatedSprite.width;
          updatedSprite.velocity.x = 0;
          break;
        case 'right':
          updatedSprite.coordinates.x = sprite.coordinates.x + sprite.width;
          updatedSprite.velocity.x = 0;
          break;
        default:
          break;
      }
    });

    // check if sprite is on the left wall
    if (updatedSprite.coordinates.x <= 0) {
      updatedSprite.coordinates.x = 0;
      updatedSprite.velocity.x = 0;
    }

    // check if sprite is on the right wall
    if (updatedSprite.coordinates.x + updatedSprite.width >= 800) {
      updatedSprite.coordinates.x = 800 - updatedSprite.width;
      updatedSprite.velocity.x = 0;
    }

    // check if sprite is on the top wall
    if (updatedSprite.coordinates.y <= 0) {
      updatedSprite.coordinates.y = 0;
      updatedSprite.velocity.y = 0;
    }

    // check if sprite is on the bottom wall
    if (updatedSprite.coordinates.y + updatedSprite.height >= 600) {
      updatedSprite.coordinates.y = 600 - updatedSprite.height;
      updatedSprite.velocity.y = 0;
    }

    //update sprite
    Object.assign(this, updatedSprite);
  }
}
