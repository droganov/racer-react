const serverRequire = require('racer/lib/util').serverRequire;

const bundle = serverRequire(module, './bundle');

import connectRacer from './connect-racer.es6';
import connectClient from './connect-client.es6';
import match from './match.es6';
import Provider from './provider.es6';

export default {
  bundle,
  connectRacer,
  connectClient,
  match,
  Provider,
};
