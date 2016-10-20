import racer from 'racer';
import racerRPC from 'racer-rpc';
import transport from 'racer-transport-koa/lib/client';
import defaults from './defaults';

export default (bundle, options) => {
  const clientOptions = {
    ...defaults,
    ...options,
  };
  racer.use(racerRPC);
  transport(racer, clientOptions);
  return racer.createModel(bundle);
};
