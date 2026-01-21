import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { createCanvas } from '@napi-rs/canvas';

GlobalRegistrator.register();

const originalCreateElement = document.createElement.bind(document);

document.createElement = function (tagName: string, options?: any) {
  if (tagName.toLowerCase() === 'canvas') return createCanvas(300, 150) as any;

  return originalCreateElement(tagName, options);
};
