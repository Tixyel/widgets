import {
  AnimateHelper,
  ColorHelper,
  ElementHelper,
  EventHelper,
  FunctionHelper,
  MessageHelper,
  NumberHelper,
  ObjectHelper,
  RandomHelper,
  SoundHelper,
  StringHelper,
  UtilsHelper,
} from './classes/index.js';

export namespace Helper {
  export const animate = new AnimateHelper();

  export const number = new NumberHelper();

  export const element = new ElementHelper();

  export const object = new ObjectHelper();

  export const message = new MessageHelper();

  export const event = new EventHelper();

  export const string = new StringHelper();

  export const sound = new SoundHelper();

  export const color = new ColorHelper();

  export const random = new RandomHelper();

  export const fn = new FunctionHelper();

  export const utils = new UtilsHelper();
}
