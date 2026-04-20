#!/usr/bin/env node

import { program } from './app.js';
import './commands/index.js';

process
  .on('unhandledRejection', (reason, promise) => {
    process.exit(0);
  })
  .on('uncaughtException', (error) => {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      console.log('👋 until next time!');
    } else {
      throw error;
    }
  })
  .on('SIGINT', () => {
    process.exit(0);
  });

program.parse();
