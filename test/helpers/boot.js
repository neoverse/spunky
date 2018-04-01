require('babel-register')({ ignore: /node_modules/ });

const path = require('path');
const appModulePath = require('app-module-path');

appModulePath.addPath(path.resolve(__dirname, '../../src'));
appModulePath.addPath(path.resolve(__dirname, '..'));
