const serverRequire = require('racer/lib/util').serverRequire;

const bundle = (serverRequire(module, './bundle') || {}).default;

import connectRacer from './connect-racer';
import connectClient from './connect-client';
import match from './match';
import Provider from './provider' ;

export {
  bundle,
  connectRacer,
  connectClient,
  match,
  Provider,
};

export default {
  bundle,
  connectRacer,
  connectClient,
  match,
  Provider,
};
