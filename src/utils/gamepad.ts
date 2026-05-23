export type GamepadInput = {
  connected: boolean;
  id: string;
  moveX: -1 | 0 | 1;
  previous: boolean;
  next: boolean;
  jump: boolean;
  shoot: boolean;
  confirm: boolean;
  cancel: boolean;
};

export const emptyGamepadInput: GamepadInput = {
  connected: false,
  id: "",
  moveX: 0,
  previous: false,
  next: false,
  jump: false,
  shoot: false,
  confirm: false,
  cancel: false,
};

const DEADZONE = 0.25;
const MENU_DEADZONE = 0.55;
const BUTTON_THRESHOLD = 0.5;

const xboxButtons = {
  a: 0,
  b: 1,
  x: 2,
  leftShoulder: 4,
  rightShoulder: 5,
  rightTrigger: 7,
  menu: 9,
  dpadUp: 12,
  dpadLeft: 14,
  dpadRight: 15,
};

function isButtonPressed(gamepad: Gamepad, buttonIndex: number) {
  const button = gamepad.buttons[buttonIndex];
  return Boolean(button?.pressed || (button?.value ?? 0) > BUTTON_THRESHOLD);
}

function getAxis(gamepad: Gamepad, axisIndex: number, deadzone = DEADZONE) {
  const value = gamepad.axes[axisIndex] ?? 0;
  return Math.abs(value) >= deadzone ? value : 0;
}

function getPrimaryGamepad() {
  if (typeof navigator === "undefined" || !navigator.getGamepads) {
    return null;
  }

  return Array.from(navigator.getGamepads()).find((gamepad): gamepad is Gamepad => Boolean(gamepad?.connected)) ?? null;
}

export function readGamepadInput(): GamepadInput {
  const gamepad = getPrimaryGamepad();

  if (!gamepad) {
    return emptyGamepadInput;
  }

  const leftAxisX = getAxis(gamepad, 0);
  const menuAxisX = getAxis(gamepad, 0, MENU_DEADZONE);
  const dpadLeft = isButtonPressed(gamepad, xboxButtons.dpadLeft);
  const dpadRight = isButtonPressed(gamepad, xboxButtons.dpadRight);
  const left = leftAxisX < 0 || dpadLeft;
  const right = leftAxisX > 0 || dpadRight;

  return {
    connected: true,
    id: gamepad.id,
    moveX: left && !right ? -1 : right && !left ? 1 : 0,
    previous: dpadLeft || isButtonPressed(gamepad, xboxButtons.leftShoulder) || menuAxisX < 0,
    next: dpadRight || isButtonPressed(gamepad, xboxButtons.rightShoulder) || menuAxisX > 0,
    jump: isButtonPressed(gamepad, xboxButtons.a) || isButtonPressed(gamepad, xboxButtons.dpadUp),
    shoot: isButtonPressed(gamepad, xboxButtons.x) || isButtonPressed(gamepad, xboxButtons.rightTrigger),
    confirm: isButtonPressed(gamepad, xboxButtons.a) || isButtonPressed(gamepad, xboxButtons.menu),
    cancel: isButtonPressed(gamepad, xboxButtons.b),
  };
}

export function wasPressed(current: boolean, previous: boolean) {
  return current && !previous;
}
