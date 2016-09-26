import { match } from 'react-router';
import { isServer } from 'racer/lib/util';

import QueryThunk from './query-thunk';

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
      return cb(err, redirectLocation);
    }

    return Promise.all(
      renderProps.components
        .filter(component => component.statics.mapRemoteToProps === 'function'))
        .map(component => component.statics.mapRemoteToProps() );
    );

  });
};
