import { StreamElements } from '../../types.js';
import { ColorHelper } from './color.js';
import { NumberHelper } from './number.js';
import { StringHelper } from './string.js';

export class SEHelper {
  /**
   * Assign StreamElements custom field schemas from a given data object, with optional prefixing and grouping
   * @param data - Object containing StreamElements custom field schemas to assign
   * @param prefix - Optional string to prefix each field key with
   * @param assign - Optional object to assign the resulting field schemas to (defaults to a new object)
   * @param group - Optional string to group the fields under (will use existing group if not provided)
   * @returns - Object containing the assigned StreamElements custom field schemas
   * @example
   * ```javascript
   * const data = {
   *   'field1': { type: 'text', label: 'Field 1', value: 'Value 1' },
   *   'field2': { type: 'colorpicker', label: 'Field 2', value: '#ff0000' },
   *   'field3': { type: 'number', label: 'Field 3', value: 10, min: 0, max: 100, step: 1 },
   * }
   *
   * const fields = assignFields(data, 'prefix-', {}, 'Group 1');
   *
   * console.log(fields);
   * // Output:
   * // {
   * //   'prefix-field1': { type: 'text', label: 'Field 1', value: 'Value 1', group: 'Group 1' },
   * //   'prefix-field2': { type: 'colorpicker', label: 'Field 2', value: '#ff0000', group: 'Group 1' },
   * //   'prefix-field3': { type: 'number', label: 'Field 3', value: 10, min: 0, max: 100, step: 1, group: 'Group 1' },
   * // }
   * ```
   */
  assignFields(
    data: Record<string, StreamElements.CustomField.Schema>,
    prefix: string = '',
    assign: Record<string, StreamElements.CustomField.Schema> = {},
    group?: string,
  ) {
    if (!data || typeof data !== 'object') return;

    Object.assign(
      assign,
      Object.entries(data).reduce(
        (acc, [key, { type, label, ...value }]) => {
          acc[prefix + key] = {
            type: type || 'text',
            label: label,
            ...value,
            group: group && group.length ? group : value?.group,
          };

          return acc;
        },
        {} as Record<string, StreamElements.CustomField.Schema>,
      ),
    );

    return assign;
  }

  /**
   * Check for errors in StreamElements custom fields and throw an error if any are found
   * @param fields - Object containing StreamElements custom field schemas to check for errors
   * @throws Will throw an error if any custom field has a label that includes 'undefined', if a non-hidden/button field has an undefined value, or if a hidden/button field has an undefined label
   * @example
   * ```javascript
   * const fields = {
   *   'field1': { type: 'text', label: 'Field 1', value: 'Value 1' },
   *   'field2': { type: 'colorpicker', label: 'Field 2', value: '#ff0000' },
   *  'field3': { type: 'hidden', label: 'Hidden Field' },
   *  'field4': { type: 'button', label: 'Button Field' },
   *  'field5': { type: 'text', label: 'Undefined Value Field' },
   * }
   *
   * checkFieldErrors(fields);
   *
   * // Output:
   * //  Error: StreamElements custom fields have errors: field5 (Undefined Value Field)
   * ```
   */
  checkFieldErrors(fields: Record<string, StreamElements.CustomField.Schema>) {
    const check = Object.entries(fields).filter(([key, value]) => {
      if (value.label && value.label.includes('undefined')) return true;
      if (!['hidden', 'button'].some((e) => e === value.type) && value.value === undefined)
        return true;
      if (['hidden', 'button'].includes(value.type) && value.label === undefined) return true;
      return false;
    });

    if (check.length) {
      throw new Error(
        `StreamElements custom fields have errors: ${check
          .map(([key, value]) => `${key} (${value.label ?? value.type})`)
          .join(', ')}`,
      );
    }
  }

  /**
   * Transform CSS variables into StreamElements custom fields
   * @param data - Array of CSS variable entries (name and value)
   * @param method - Whether to determine field type based on variable name or value
   * @param replace - Function to modify the field label based on the variable name
   * @param subgroup - Function to determine subgrouping of fields based on variable name and value
   * @returns - Object containing StreamElements custom field schemas
   * @example
   * ```javascript
   * const cssVariables = [
   *   ['--primary-gradient-color', '#ff0000'],
   *   ['--secondary-gradient-color', '#00ff00'],
   * ];
   * const fields = transformCSSIntoFields(
   *   cssVariables,
   *   'name',
   *   (x) => x.replace('gradient', '').trim(),
   *   (key, value) => {
   *     if (key.includes('gradient')) return 'Gradients';
   *     return null;
   *   }
   * );
   *
   * console.log(fields);
   *
   * /* Output:
   *   {
   *     '/Gradients': {
   *       type: 'hidden',
   *       label: 'Gradients',
   *     },
   *     '--primary-gradient-color': {
   *       type: 'colorpicker',
   *       label: 'Primary color',
   *       value: '#ff0000',
   *     },
   *     '--secondary-gradient-color': {
   *       type: 'colorpicker',
   *       label: 'Secondary color',
   *       value: '#00ff00',
   *     },
   *   }
   * ```
   */
  transformCSSIntoFields(
    data: [string, string][],
    method: 'name' | 'value' = 'name',
    replace: (name: string) => string = (x) => x,
    subgroup: (key: string, value: string) => string | null = () => null,
  ) {
    const string = new StringHelper();
    const color = new ColorHelper();
    const number = new NumberHelper();

    const all = Object.fromEntries(data);

    return data.reduce(
      (acc, [k, v]) => {
        const group: string = subgroup(k, v) ?? '';

        const name = replace(
          String(k).replace('--', '').replaceAll('-', ' ').replace('message ', ''),
        ).trim();

        if (!acc[group] && group.length) {
          acc['/' + group] = {
            type: 'hidden',
            label: string.capitalize(group),
          };
        }

        switch (method) {
          case 'name': {
            if (['color'].some((t) => k.endsWith(t))) {
              acc[k] = {
                type: 'colorpicker',
                label: string.capitalize(name),
                value: v,
              };
            } else if (['gradient'].some((t) => k.endsWith(t))) {
              //  separate each color from the gradient
              const colors = v.match(colorRegex) as string[];

              if (colors) {
                acc[`${k}-gradient`] = {
                  type: 'hidden',
                  label: '• Gradient colors',
                };

                colors.forEach((color, index) => {
                  acc[`${k}-gradient-${index}`] = {
                    type: 'colorpicker',
                    label:
                      string.capitalize(name) + ` ${number.translate(index + 1, 'suffix')} color`,
                    value: color,
                  };
                });
              }
            } else if (
              ['size', 'width', 'height', 'spacing', 'gap', 'radius'].some((t) => k.endsWith(t))
            ) {
              var min = all[k + '-min'] ? parseFloat(all[k + '-min']) : undefined;
              var max = all[k + '-max'] ? parseFloat(all[k + '-max']) : undefined;
              var step = all[k + '-step'] ? parseFloat(all[k + '-step']) : undefined;

              acc[k] = {
                type: 'number',
                label: string.capitalize(name),
                value: parseFloat(v),
                min,
                max,
                step,
              };
            } else if (['weight'].some((t) => k.endsWith(t))) {
              acc[k] = {
                type: 'dropdown',
                label: string.capitalize(name),
                value: String(v),
                options: {
                  '100': 'Thin 100',
                  '200': 'Extra Light 200',
                  '300': 'Light 300',
                  '400': 'Normal 400',
                  '500': 'Medium 500',
                  '600': 'Semi Bold 600',
                  '700': 'Bold 700',
                  '800': 'Extra Bold 800',
                  '900': 'Black 900',
                },
              };
            } else if (k.endsWith('font-family')) {
              acc[k] = {
                type: 'googleFont',
                label: string.capitalize(name),
                value: v.split(',')[0].trim().replaceAll("'", ''),
              };
            } else if (!['step', 'min', 'max'].every((t) => k.endsWith(t))) {
              acc[k] = {
                type: 'text',
                label: string.capitalize(name),
                value: String(v),
              };
            }

            break;
          }
          case 'value': {
            if (color.validate(v)) {
              acc[k] = {
                type: 'colorpicker',
                label: string.capitalize(name) + ' color',
                value: v,
              };
            } else if (v.startsWith('linear-gradient(') || v.startsWith('radial-gradient(')) {
              //  separate each color from the gradient
              const colors = v.match(colorRegex) as string[];

              if (colors) {
                acc[`${k}-gradient`] = {
                  type: 'hidden',
                  label: '• Gradient colors',
                };

                colors.forEach((color, index) => {
                  acc[`${k}-gradient-${index}`] = {
                    type: 'colorpicker',
                    label:
                      string.capitalize(name) + ` ${number.translate(index + 1, 'suffix')} color`,
                    value: color,
                  };
                });
              }
            } else if (v.endsWith('px')) {
              var min = all[k + '-min'] ? parseFloat(all[k + '-min']) : undefined;
              var max = all[k + '-max'] ? parseFloat(all[k + '-max']) : undefined;
              var step = all[k + '-step'] ? parseFloat(all[k + '-step']) : undefined;

              acc[k] = {
                type: 'number',
                label: string.capitalize(name) + ' (px)',
                value: parseFloat(v.replace('px', '')),
                min,
                max,
                step,
              };
            } else if (v.endsWith('em')) {
              var min = all[k + '-min'] ? parseFloat(all[k + '-min']) : undefined;
              var max = all[k + '-max'] ? parseFloat(all[k + '-max']) : undefined;
              var step = all[k + '-step'] ? parseFloat(all[k + '-step']) : undefined;

              acc[k] = {
                type: 'number',
                label: string.capitalize(name) + ' (em)',
                value: parseFloat(v.replace('em', '')),
                min,
                max,
                step,
              };
            } else if (!isNaN(parseFloat(v))) {
              var min = all[k + '-min'] ? parseFloat(all[k + '-min']) : undefined;
              var max = all[k + '-max'] ? parseFloat(all[k + '-max']) : undefined;
              var step = all[k + '-step'] ? parseFloat(all[k + '-step']) : undefined;

              acc[k] = {
                type: 'number',
                label: string.capitalize(name),
                value: parseFloat(v),
                min,
                max,
                step,
              };
            } else if (!['step', 'min', 'max'].every((t) => k.endsWith(t))) {
              acc[k] = {
                type: 'text',
                label: string.capitalize(name),
                value: String(v),
              };
            }

            break;
          }
        }

        return acc;
      },
      {} as Record<string, StreamElements.CustomField.Schema>,
    );
  }

  /**
   * Split a long text into multiple StreamElements custom fields with a specified maximum label length, using a key prefix for the field keys
   * @param keyPrefix - Prefix to use for the field keys (e.g., 'field' will create keys like 'field[0]', 'field[1]', etc.)
   * @param text - The long text to split into multiple fields
   * @param maxLabelLength - The maximum length for each field label (default is 31 characters, which is the maximum allowed by StreamElements)
   * @returns An object containing the generated StreamElements custom field schemas with split labels
   * @example
   */
  splitFieldLabel(keyPrefix: string, text: string, maxLabelLength: number = 31) {
    const safeMaxLength = Math.max(1, Math.floor(maxLabelLength));
    const content = String(text).trim();
    const tokens = content.match(/\[[^\]]+\]|\S+/g) ?? [];

    const lines: string[] = [];

    let currentLine = '';

    const pushWord = (word: string) => {
      if (!currentLine.length) {
        currentLine = word;
        return;
      }

      if (`${currentLine} ${word}`.length <= safeMaxLength) {
        currentLine += ` ${word}`;
        return;
      }

      lines.push(currentLine);
      currentLine = word;
    };

    for (const token of tokens) {
      const isForcedSignleLabel = token.startsWith('[') && token.endsWith(']');

      if (isForcedSignleLabel) {
        const forcedLabel = token.slice(1, -1).trim();

        if (!forcedLabel.length) continue;

        if (currentLine.length) {
          lines.push(currentLine);
          currentLine = '';
        }

        lines.push(forcedLabel);
        continue;
      }

      const originalWord = token;
      let word = originalWord;

      while (word.length > safeMaxLength) {
        const chunk = word.slice(0, safeMaxLength);

        if (currentLine.length) {
          lines.push(currentLine);
          currentLine = '';
        }

        lines.push(chunk);
        word = word.slice(safeMaxLength);
      }

      if (word.length) {
        pushWord(word);
      }
    }

    if (currentLine.length) lines.push(currentLine);
    if (!lines.length) lines.push('');

    return Object.fromEntries(
      lines.map((label, index) => [
        `${keyPrefix}[${index}]`,
        {
          type: 'hidden',
          label,
        } as StreamElements.CustomField.Schema,
      ]),
    );
  }
}

export const colorRegex =
  /(#)(?:([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?|([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?)|(rgb|rgba)\((?:\s*(0*(?:0|1[0-9]{0,2}|2(?:[0-4][0-9]?|5[0-4]?|[6-9])?|[3-9][0-9]?)(?:\.[0-9]+)?|255(?:\.0+)?|\.[0-9]+)\s*,\s*(0*(?:0|1[0-9]{0,2}|2(?:[0-4][0-9]?|5[0-4]?|[6-9])?|[3-9][0-9]?)(?:\.[0-9]+)?|255(?:\.0+)?|\.[0-9]+)\s*,\s*(0*(?:0|1[0-9]{0,2}|2(?:[0-4][0-9]?|5[0-4]?|[6-9])?|[3-9][0-9]?)(?:\.[0-9]+)?|255(?:\.0+)?|\.[0-9]+)(?:\s*,\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*|\s*(0*(?:0|1[0-9]{0,2}|2(?:[0-4][0-9]?|5[0-4]?|[6-9])?|[3-9][0-9]?)(?:\.[0-9]+)?|255(?:\.0+)?|\.[0-9]+)\s+(0*(?:0|1[0-9]{0,2}|2(?:[0-4][0-9]?|5[0-4]?|[6-9])?|[3-9][0-9]?)(?:\.[0-9]+)?|255(?:\.0+)?|\.[0-9]+)\s+(0*(?:0|1[0-9]{0,2}|2(?:[0-4][0-9]?|5[0-4]?|[6-9])?|[3-9][0-9]?)(?:\.[0-9]+)?|255(?:\.0+)?|\.[0-9]+)\s*|\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s*,\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s*,\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)(?:\s*,\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*|\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s*|\s*(0*(?:0|1[0-9]{0,2}|2(?:[0-4][0-9]?|5[0-4]?|[6-9])?|[3-9][0-9]?)(?:\.[0-9]+)?|255(?:\.0+)?|\.[0-9]+)\s+(0*(?:0|1[0-9]{0,2}|2(?:[0-4][0-9]?|5[0-4]?|[6-9])?|[3-9][0-9]?)(?:\.[0-9]+)?|255(?:\.0+)?|\.[0-9]+)\s+(0*(?:0|1[0-9]{0,2}|2(?:[0-4][0-9]?|5[0-4]?|[6-9])?|[3-9][0-9]?)(?:\.[0-9]+)?|255(?:\.0+)?|\.[0-9]+)(?:\s*(?:\/)\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*|\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)(?:\s*(?:\/)\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*)\)|(hsl|hsla)\((?:\s*(-?[0-9]+(?:\.[0-9]+)?(?:deg|rad|grad|turn)?)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)(?:\s*(?:\/)\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*|\s*(-?[0-9]+(?:\.[0-9]+)?(?:deg|rad|grad|turn)?)\s*,\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s*,\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)(?:\s*,\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*|\s*(-?[0-9]+(?:\.[0-9]+)?(?:deg|rad|grad|turn)?)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s*)\)|(hwb)\(\s*(-?[0-9]+(?:\.[0-9]+)?(?:deg|rad|grad|turn)?)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)(?:(?:\s*(?:\/)\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*)?\)|(lab|oklab)\(\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?)\s+(-?(?:0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|(?:0|1(?:[0-1][0-9]?|2[0-4]?|[3-9])?|[2-9][0-9]?)(?:\.[0-9]+)?|125(?:\.0+)?))\s+(-?(?:0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|(?:0|1(?:[0-1][0-9]?|2[0-4]?|[3-9])?|[2-9][0-9]?)(?:\.[0-9]+)?|125(?:\.0+)?))\s*(?:(?:\s*(?:\/)\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*)?\)|(lch|oklch)\(\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?)\s+(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|(?:0|1(?:[0-4][0-9]?|[5-9])?|[2-9][0-9]?)(?:\.[0-9]+)?|150(?:\.0+)?)\s+(-?[0-9]+(?:\.[0-9]+)?(?:deg|rad|grad|turn)?)\s*(?:(?:\s*(?:\/)\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*)?\)|(color)\((?:(srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020)(?:\s+|\s*,\s*)(0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+|0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)(?:\s+|\s*,\s*)(0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+|0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)(?:\s+|\s*,\s*)(0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+|0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%)(?:(?:\s+\s*(?:\/)\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*)?|(xyz|xyz-d50|xyz-d65)(?:\s+|\s*,\s*)(-?[0-9]+(?:\.[0-9]+)?%?)(?:\s+|\s*,\s*)(-?[0-9]+(?:\.[0-9]+)?%?)(?:\s+|\s*,\s*)(-?[0-9]+(?:\.[0-9]+)?%?)(?:(?:\s+\s*(?:\/)\s*(0*(?:(?:0|[1-9][0-9]?)(?:\.[0-9]+)?|100(?:\.0+)?|\.[0-9]+)%|0*0*(?:\.[0-9]+)?|1(?:\.0+)?|\.[0-9]+))?\s*)?)\)|(yellowgreen|yellow|whitesmoke|white|wheat|VisitedText|violet|turquoise|transparent|tomato|thistle|teal|tan|steelblue|springgreen|snow|slategrey|slategray|slateblue|skyblue|silver|sienna|SelectedItemText|SelectedItem|seashell|seagreen|sandybrown|salmon|saddlebrown|royalblue|rosybrown|red|rebeccapurple|purple|powderblue|plum|pink|peru|peachpuff|papayawhip|palevioletred|paleturquoise|palegreen|palegoldenrod|orchid|orangered|orange|olivedrab|olive|oldlace|navy|navajowhite|moccasin|mistyrose|mintcream|midnightblue|mediumvioletred|mediumturquoise|mediumspringgreen|mediumslateblue|mediumseagreen|mediumpurple|mediumorchid|mediumblue|mediumaquamarine|maroon|MarkText|Mark|magenta|LinkText|linen|limegreen|lime|lightyellow|lightsteelblue|lightslategrey|lightslategray|lightskyblue|lightseagreen|lightsalmon|lightpink|lightgrey|lightgreen|lightgray|lightgoldenrodyellow|lightcyan|lightcoral|lightblue|lemonchiffon|lawngreen|lavenderblush|lavender|khaki|ivory|indigo|indianred|hotpink|honeydew|HighlightText|Highlight|grey|greenyellow|green|GrayText|gray|goldenrod|gold|ghostwhite|gainsboro|fuchsia|forestgreen|floralwhite|firebrick|FieldText|Field|dodgerblue|dimgrey|dimgray|deepskyblue|deeppink|darkviolet|darkturquoise|darkslategrey|darkslategray|darkslateblue|darkseagreen|darksalmon|darkred|darkorchid|darkorange|darkolivegreen|darkmagenta|darkkhaki|darkgrey|darkgreen|darkgray|darkgoldenrod|darkcyan|darkblue|cyan|currentColor|crimson|cornsilk|cornflowerblue|coral|chocolate|chartreuse|CanvasText|Canvas|cadetblue|ButtonText|ButtonFace|ButtonBorder|burlywood|brown|blueviolet|blue|blanchedalmond|black|bisque|beige|azure|aquamarine|aqua|antiquewhite|aliceblue|ActiveText|AccentColorText|AccentColor)/gi;
