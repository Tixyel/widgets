import { existsSync, readdirSync } from 'fs';

export async function getNextWidgetNumber(rootPath: string): Promise<string> {
  try {
    if (!existsSync(rootPath)) return '01';

    const entries = readdirSync(rootPath);

    const widgetNumbers = entries
      .filter((name) => /^\d+\s*-\s*/.test(name))
      .map((name) => parseInt(name.split('-')[0], 10))
      .filter((num) => !isNaN(num));

    const maxNum = widgetNumbers.length > 0 ? Math.max(...widgetNumbers) : 0;

    return String(maxNum + 1).padStart(2, '0');
  } catch (error) {
    return '01';
  }
}
