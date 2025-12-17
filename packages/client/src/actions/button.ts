import { Client } from '../client/client.js';
import { logger } from '../index.js';

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
    /**
     * Extract the actual field name by removing the template part from the provided field.
     * For example, if the template is "button-{id}" and the field is "button-123",
     * this will extract "123" as the actual field name.
     */
    var f = field.replace(typeof this.field === 'string' ? this.field : (this.template.replace(/\{[^}]*\}/g, '') ?? ''), '').trim();

    try {
      this.run.apply(window.client, [f.length ? f : (field ?? field), value]);
    } catch (error) {
      throw new Error(`Error running button "${this.field}": ${error instanceof Error ? error.message : error}`);
    }

    return this;
  }

  remove(): void {
    if (!(window.client instanceof Client)) return;

    const index = window.client.actions.buttons.indexOf(this);

    if (index > -1) {
      window.client.actions.buttons.splice(index, 1);
      window.client.emit('action', this, 'removed');
    }
  }

  static execute(field: string, value: string | boolean | number): boolean {
    try {
      if (!(window.client instanceof Client)) return false;

      if (window.client.actions.buttons.length) {
        const buttons = window.client.actions.buttons.filter((b) => {
          /**
           * Check if the button's field matches the provided field.
           */
          if (typeof b.field === 'string') return b.field === field;
          /**
           * If the button's field is a function, call it with the provided field and value to determine a match.
           */
          if (typeof b.field === 'function') return b.field(field, value);

          return false;
        });

        if (buttons.length && buttons.every((b) => b instanceof Button)) {
          buttons.forEach((button) => {
            try {
              button.parse(field, value);

              window.client.emit('action', button, 'executed');

              logger.received(`Button executed: ${field}${value ? ` with value: ${value}` : ''}`);
            } catch (error) {
              logger.error(`Error executing button "${field}": ${error instanceof Error ? error.message : error}`);
            }
          });

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
