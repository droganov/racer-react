"use strict"

const serverRequire = require("racer/lib/util").serverRequire;

const bundle = serverRequire( module, "./lib/bundle" );

import connectRacer from './lib/connect';
import connectClient from './lib/connect-client';
import match from './lib/match';
import Provider from './lib/provider';

export default {
  bundle,
  connectRacer,
  connectClient,
  match,
  Provider,
}
