/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable consistent-return */

/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

// eslint-disable-next-line no-console
const fs = require('fs');

const packageJson = require('./package.json');

const appVersion = packageJson.version;
const jsonData = {
  version: appVersion,
};
const jsonContent = JSON.stringify(jsonData);

fs.writeFile('./public/info.json', jsonContent, 'utf8', (err) => {
  if (err) {
    console.error(err);
  }
  // eslint-disable-next-line no-console
  console.log('info.json file has been saved with latest version number');
});
