import { Client } from '../client/index.js';
import { Tixyel } from '../index.js';

interface ButtonOptions {
  field: string | ((field: string, value: string | boolean | number) => boolean);
  template?: string;
  run: (field: string, value: string | boolean | number) => void;
}

export class Button {
  field: ButtonOptions['field'] = 'button';

  template: string = 'button';

  run!: ButtonOptions['run'];

  constructor(options: ButtonOptions) {
    if (!(window.client instanceof Client)) return;

    this.field = options.field ?? this.field;
    this.template = options.template ?? this.template;

    this.run = options.run;

    // Register the button in the client actions
    window.client.actions.buttons.push(this);

    window.client.emit('action', this, 'created');
  }

  parse(field: string, value: string | boolean | number): Button {
    var f = field.replace(typeof this.field === 'string' ? this.field : (this.template.replace(/\{[^}]*\}/g, '') ?? ''), '').trim();

    try {
      this.run.apply(window.client, [f.length ? f : (field ?? field), value]);
    } catch (error) {
      throw new Error(`Error running button "${this.field}": ${error instanceof Error ? error.message : error}`);
    }

    return this;
  }

  static execute(field: string, value: string | boolean | number): boolean {
    try {
      if (!(window.client instanceof Client)) return false;

      if (window.client.actions.buttons.length) {
        const button = window.client.actions.buttons.find((b) => {
          if (typeof b.field === 'string') return b.field === field;
          if (typeof b.field === 'function') return b.field(field, value);

          return false;
        });

        if (button && button instanceof Button) {
          try {
            button.parse(field, value);
            window.client.emit('action', button, 'executed');

            Tixyel.logger.received(`Button executed: ${field}${value ? ` with value: ${value}` : ''}`);
          } catch (error) {
            Tixyel.logger.error(`Error executing button "${field}": ${error instanceof Error ? error.message : error}`);
          }

          return true;
        }
      }
    } catch (error) {
      return false;
    } finally {
      return false;
    }
  }
}
