interface Theme {
  color?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  icon?: string;
}

interface Options {
  enabled?: boolean;
  prefix?: string;
}

type LogMethod = (...args: unknown[]) => void;

export class Logger {
  private readonly enabled: boolean;
  private readonly prefix: string;

  readonly error = this.apply({
    color: '#721c24',
    background: '#f8d7da',
    bold: true,
    italic: false,
    icon: '✖',
  });

  readonly warn = this.apply({
    color: '#856404',
    background: '#fff3cd',
    bold: true,
    italic: false,
    fontSize: 20,
  });

  readonly success = this.apply({
    color: '#155724',
    background: '#d4edda',
    bold: true,
    italic: false,
    fontSize: 18,
    icon: '✔',
  });

  readonly info = this.apply({
    color: '#0c5460',
    background: '#d1ecf1',
    fontSize: 12,
    icon: 'ℹ',
  });

  readonly debug = this.apply({
    color: '#6c757d',
    background: 'transparent',
    fontSize: 11,
    icon: '●',
  });

  readonly alert = this.apply({
    color: '#856404',
    background: '#fff3cd',
    bold: true,
    italic: false,
    fontSize: 20,
    icon: '⚠',
  });

  readonly status = this.apply({
    color: '#0c5460',
    background: '#d1ecf1',
    bold: true,
    italic: false,
    fontSize: 12,
    icon: '·',
  });

  readonly received = this.apply({
    color: '#E6BBFF',
    background: 'transparent',
    bold: false,
    italic: false,
    fontSize: 14,
    icon: '⬇',
  });

  readonly simple = this.apply({
    color: '#f6c6cb',
    background: 'transparent',
    bold: false,
    italic: false,
    fontSize: 14,
    icon: '☼',
  });

  constructor(options: Options = {}) {
    this.enabled = options.enabled ?? true;
    this.prefix = options.prefix ? `[${options.prefix}]` : '';
  }

  public apply(theme: Theme): LogMethod {
    const style = this.style(theme);
    const icon = theme.icon ? `${theme.icon} ` : '';

    return (...args: unknown[]): void => {
      if (!this.enabled || typeof console === 'undefined') return;

      const prefix = this.prefix ? `${this.prefix} ` : '';

      const primitives: unknown[] = [];
      const objects: unknown[] = [];

      args.forEach((arg) => {
        if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
          primitives.push(arg);
        } else {
          objects.push(arg);
        }
      });

      // Log with style

      if (primitives.length > 0) {
        const message = primitives.join(' ');
        console.log(`%c${icon}${prefix}${message}`, style, ...objects);
      } else if (objects.length > 0) {
        console.log(`%c${icon}${prefix}`, style, ...objects);
      }
    };
  }

  private style(theme: Theme): string {
    const styles: string[] = [];

    if (theme.background && theme.background !== 'transparent') {
      styles.push(`background: ${theme.background}`);
      styles.push('padding: 2px 6px');
      styles.push('border-radius: 3px');
    }
    if (theme.color) styles.push(`color: ${theme.color}`);
    if (theme.bold) styles.push('font-weight: bold');
    if (theme.italic) styles.push('font-style: italic');
    if (theme.fontSize) styles.push(`font-size: ${theme.fontSize}px`);

    return styles.join('; ');
  }

  public group(label: string): void {
    if (!this.enabled || !console.group) return;

    console.group(label);
  }

  public groupCollapsed(label: string): void {
    if (!this.enabled || !console.groupCollapsed) return;

    console.groupCollapsed(label);
  }

  public groupEnd(): void {
    if (!this.enabled || !console.groupEnd) return;

    console.groupEnd();
  }

  public table(data: unknown): void {
    if (!this.enabled || !console.table) return;

    console.table(data);
  }

  public time(label: string): void {
    if (!this.enabled || !console.time) return;

    console.time(label);
  }

  public timeEnd(label: string): void {
    if (!this.enabled || !console.timeEnd) return;

    console.timeEnd(label);
  }
}
