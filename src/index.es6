"use strict"

const serverRequire = require("racer/lib/util").serverRequire;

const bundle = serverRequire( module, "./bundle" );

import connectRacer from './connect';
import connectClient from './connect-client';
import match from './match';
import Provider from './provider';

export default {
  bundle,
  connectRacer,
  connectClient,
  match,
  Provider,
}
