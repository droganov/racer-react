import { match } from 'react-router';
import { isServer } from 'racer/lib/util';

export default (options, cb) => {
  const {
    racerModel,
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

    Promise
      .all(
        renderProps.components
          .filter(component =>
            component &&
            component.statics &&
            typeof component.statics.mapRemoteToProps === 'function'
          )
          .map(
            Component =>
              Component.statics.mapRemoteToProps(
                racerModel,
                renderProps,
              )
          )
      )
      .catch(cb)
      .then(
        () => cb(null, null, renderProps)
      );
  });
};
