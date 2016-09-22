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
      cb(err, redirectLocation);
      return;
    }

    const promisesStack = [];

    renderProps.components.forEach((component) => {
      if (!component || (typeof component.statics.mapRemoteToProps !== 'function')) return;

      component.racerQueries = [];

      const queryThunk = new QueryThunk(racerModel, queryObj => {
        component.racerQueries.push(queryObj);

        // имитация обработки fetch, subscribe, observe
        return new Promise((resolve, reject)=> {
          setTimeout(()=> {
            const qr = {[queryObj.collection]: 'result of query'};
            Object.assign(racerModel, qr);
            resolve(qr);
            console.log('query '+ queryObj.collection + ' resolved ...');
          }, 100+Math.random()*3000);
        });

      });

      const remoteMapPromise =
        component
          .statics
          .mapRemoteToProps(queryThunk, null, renderProps) // обработка запросов
          .then(remoteResult => {
            component.mapRemoteResult = remoteResult; // сохранение результатов запросов
          });

      promisesStack.push(remoteMapPromise);

    });

    Promise.all(promisesStack).then(() => {
      cb(null, null, renderProps);
    });

    // cb(null, null, renderProps);

  });
};
