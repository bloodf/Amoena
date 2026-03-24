import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

const args = process.argv.slice(2);

const serverFlagIndex = args.indexOf('--server');
const serverUrl =
  serverFlagIndex !== -1
    ? (args[serverFlagIndex + 1] ?? 'ws://localhost:3456/api/ws/mission-control')
    : undefined;

const forceStandalone = args.includes('--standalone');

render(<App serverUrl={serverUrl} forceStandalone={forceStandalone} />);
