/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import packageJson from '../package.json';

const globalAny:any = global;
globalAny.appVersion = packageJson.version;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
