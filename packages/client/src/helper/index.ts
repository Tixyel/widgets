import _element from './functions/element.js';
import _object from './functions/object.js';
import _sound from './functions/sound.js';
import _utils from './functions/utils.js';
import _color from './functions/color.js';
import _random from './functions/random.js';
import _number from './functions/number.js';
import _string from './functions/string.js';
import _message from './functions/message.js';
import _event from './functions/event.js';

export namespace Helper {
  export const sound = _sound;
  export const element = _element;
  export const color = _color;
  export const object = _object;
  export const utils = _utils;
  export const random = _random;
  export const number = _number;
  export const string = _string;
  export const message = _message;
  export const event = _event;
}
