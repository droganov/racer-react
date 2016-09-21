import racer from 'racer';
import transport from 'racer-transport-koa/lib/client';
import defaults from './defaults.es6';

export default (bundle, options) => {
  const clientOptions = { ...defaults, ...options };
  transport(racer, clientOptions);
  const model = racer.createModel(bundle);
  return model;
};
