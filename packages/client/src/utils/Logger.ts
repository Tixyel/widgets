type LoggerThemeName = 'error' | 'success' | 'alert' | 'warn' | 'status' | 'received' | 'simple' | 'info';

interface LoggerTheme {
  name: LoggerThemeName;
  color?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  template?: {
    before?: string;
    after?: string;
  };
}

type LoggerLogFunction = (...args: any[]) => void;

type LoggerMethods = Record<LoggerThemeName, LoggerLogFunction>;

export class Logger implements LoggerMethods {
  private readonly themes: LoggerTheme[] = [
    {
      name: 'error',
      color: '#721c24',
      background: '#f8d7da',
      bold: true,
      italic: false,
      fontSize: 18,
      template: { before: ' ✖ ', after: ' ' },
    },
    {
      name: 'success',
      color: '#155724',
      background: '#d4edda',
      bold: true,
      italic: false,
      fontSize: 18,
      template: { before: ' ✔ ', after: ' ' },
    },
    {
      name: 'alert',
      color: '#856404',
      background: '#fff3cd',
      bold: true,
      italic: false,
      fontSize: 20,
      template: { before: ' ⚠ ', after: ' ' },
    },
    {
      name: 'warn',
      color: '#856404',
      background: '#fff3cd',
      bold: true,
      italic: false,
      fontSize: 20,
      template: { before: ' ⚠ ', after: ' ' },
    },
    {
      name: 'status',
      color: '#0c5460',
      background: '#d1ecf1',
      bold: true,
      italic: false,
      fontSize: 12,
      template: { before: ' · ', after: '' },
    },
    {
      name: 'received',
      color: '#E6BBFF',
      background: 'transparent',
      bold: false,
      italic: false,
      fontSize: 14,
      template: { before: ' ⬇ ', after: '' },
    },
    {
      name: 'simple',
      color: '#f5c6cb',
      background: 'transparent',
      bold: false,
      italic: false,
      fontSize: 14,
      template: { before: '', after: '' },
    },
    {
      name: 'info',
      color: '#f6c6cb',
      background: 'transparent',
      bold: false,
      italic: false,
      fontSize: 14,
      template: { before: ' ℹ ', after: '' },
    },
  ];

  error: LoggerLogFunction = () => {};
  success: LoggerLogFunction = () => {};
  alert: LoggerLogFunction = () => {};
  warn: LoggerLogFunction = () => {};
  status: LoggerLogFunction = () => {};
  received: LoggerLogFunction = () => {};
  simple: LoggerLogFunction = () => {};
  info: LoggerLogFunction = () => {};

  constructor() {
    this.themes.forEach((theme) => {
      const styles: string[] = [];

      if (theme.background && theme.background !== 'transparent') styles.push(`background-color: ${theme.background}`);
      if (theme.color) styles.push(`color: ${theme.color}`);
      if (theme.bold) styles.push('font-weight: bold');
      if (theme.italic) styles.push('font-style: italic');
      if (theme.underline) styles.push('text-decoration: underline');
      if (theme.fontSize) styles.push(`font-size: ${theme.fontSize}px`);

      const signal = '%c';

      const logFn: LoggerLogFunction = (...args: any[]) => {
        const textContent = Array.from(args).filter((arg) => typeof arg === 'string' || typeof arg === 'number');
        const objectContent = Array.from(args).filter((arg) => typeof arg !== 'string' && typeof arg !== 'number');
        const css = textContent.length > 0 ? styles.join('; ') : null;

        const log: any[] = [
          textContent.length > 0 ? signal + (theme.template?.before ?? '') + textContent.join(' ') + (theme.template?.after ?? '') : null,
          css,
          ...objectContent,
        ].filter(Boolean);

        return console.log(...log);
      };

      this[theme.name] = logFn;
    });
  }
}
