import { Client } from '../client/client.js';
import { Helper } from '../helper/index.js';
import { logger } from '../main.js';
import { StreamElements } from '../types/index.js';

interface ButtonOptions {
  field: string | ((field: string, value: string | boolean | number) => boolean);
  template?: string;
  name?: string;
  value?: string;
  run: (field: string, value: string | boolean | number) => void;
}

/**
 * Represents a button action that can be triggered by custom fields in StreamElements.
 * The button can be configured with a template and a name, and it will execute a specified function when triggered.
 * @example
 * ```javascript
 * const button = new Button({
 *   field: (field, value) => field.startsWith('message-') && field.split('-')[1],
 *   template: 'message-{role}',
 *   // name: '[CAP={role}] role message',
 *   name: 'Generate {role} message',
 *   run(field, value) {
 *     console.log(`Button ${field} was clicked with value: ${value}`);
 *   }
 * })
 *
 * const field = button.generate([{ role: 'broadcaster' }, { role: 'moderator' }]);
 * // This will create buttons with fields "message-broadcaster" and "message-moderator" and names "Generate broadcaster message" and "Generate moderator message".
 * // field['message-broadcaster'] => { type: 'button', label: 'Generate broadcaster message' }
 * // field['message-moderator'] => { type: 'button', label: 'Generate moderator message' }
 *
 * // When a custom field with the name "message-broadcaster" or "message-moderator" is triggered, the run function will be called with the field and value.
 * ```
 */
export class Button {
  field: ButtonOptions['field'] = 'button';
  template: string = 'button';
  name: string = 'Button';
  value: string = '';

  run!: ButtonOptions['run'];

  constructor(options: ButtonOptions) {
    if (!(window.client instanceof Client)) return;

    this.field = options.field ?? this.field;
    this.template = options.template ?? (typeof this.field === 'string' ? this.field : this.template);
    this.name = options.name ?? this.name;
    this.value = options.value ?? this.value;
    this.run = options.run;

    // Register the button in the client actions
    window.client.actions.buttons.push(this);

    window.client.emit('action', this, 'created');
  }

  generate(values: Array<Record<string, string | number>>) {
    const fields = Helper.utils.typedValues(values).reduce(
      (acc, values, index) => {
        const key = Helper.string.compose(this.template, { index, ...values }, { html: false });
        const name = Helper.string.compose(this.name, { index, ...values }, { html: false });

        acc[key] = {
          type: 'button',
          label: name,
        };

        let value: string | number | boolean = Helper.string.compose(String(this.value), { index, ...values }, { html: false });

        if (!isNaN(Number(value))) value = Number(value);
        else if (value.toLowerCase() === 'true') value = true;
        else if (value.toLowerCase() === 'false') value = false;

        if (typeof value !== 'undefined' && !!value && (typeof value === 'string' ? value.length : true)) {
          acc[key].value = value;
        }

        return acc;
      },
      {} as Record<string, StreamElements.CustomField.Schema>,
    );

    // let result = Helper.string.compose(this.template, values, { html: false });

    return fields;
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
