#!/usr/bin/env node

const path = require('path');
const exec = require('child_process').exec;
const fileUrl = require('file-url');

const distPath = path.resolve(__dirname, '../dist');

const url = `${fileUrl(distPath)}/`;

console.log('Running Electron app with base URL', url);

exec(`ng build --prod --base-href ${url} && electron .`,
  (error, stdout, stderr) => {
    console.log(`${stdout}`);
    console.log(`${stderr}`);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });