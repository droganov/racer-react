import racer from 'racer';
import transport from 'racer-transport-koa/lib/client';
import defaults from './defaults';

export default (bundle, options) => {
  const clientOptions = {
    ...defaults,
    ...options,
  };
  transport(racer, clientOptions);
  return racer.createModel(bundle);
};
