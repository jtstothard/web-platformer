export const directions = ['up', 'down', 'left', 'right', 'stop'] as const;

export type DirectionType = typeof directions[number];

export class Controls {
  keys: string[];
  currentKeys: string[] = [];

  public keyMap: {
    [key: string]: string;
  };

  public update: (direction: DirectionType) => void;

  constructor(update: (direction: DirectionType) => void) {
    this.keyMap = {
      up: 'w',
      left: 'a',
      right: 's',
      down: 'r',
      space: ' ',
      shift: 'Shift',
      enter: 'Enter',
      escape: 'Escape',
    };

    this.keys = Object.keys(this.keyMap);

    this.update = update;

    this.init();
  }

  public init() {
    window.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });

    window.addEventListener('keyup', (event) => {
      this.handleKeyUp(event);
    });
  }

  // handle key down event
  private handleKeyDown(event: KeyboardEvent) {
    this.currentKeys.push(event.key);
    const direction = this.keys.find((key) => event.key === this.keyMap[key]);

    if (direction) {
      this.update(direction as DirectionType);
    }
  }

  // handle key up event
  private handleKeyUp(event: KeyboardEvent) {
    // debounce left and right keys
    const isLeftOrRight =
      event.key === this.keyMap.left || event.key === this.keyMap.right;

    const isLeftAndRightPressed =
      this.currentKeys.includes(this.keyMap.left) &&
      this.currentKeys.includes(this.keyMap.right);

    if (isLeftOrRight && !isLeftAndRightPressed) {
      this.update('stop');
    }
    this.currentKeys = this.currentKeys.filter((key) => key !== event.key);
  }
}
