import { match } from 'react-router';
import { isServer } from 'racer/lib/util';

import QueryAggregator from './query-aggregator.es6';

export default (options, cb) => {
  const {
    racerModel,
    reduxStore,
  } = options;

  if (!isServer) {
    const silentModel = racerModel.silent();
    silentModel.destroy && silentModel.destroy('_page');
    silentModel.unloadAll && silentModel.unloadAll();
  }

  match(options, (err, redirectLocation, renderProps) => {
    //  errors and redirects
    if (err || redirectLocation || !renderProps) {
      cb(err, redirectLocation);
      return;
    }

    // for (let i = 0; i < renderProps.components.length; i++) {
    //   const component = renderProps.components[i];
    //   if (component && (typeof component.fixRenderProps === 'function')) {
    //     component.fixRenderProps(renderProps);
    //   }
    // }


    cb(null, null, renderProps);

  });
};
