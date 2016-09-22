import { pick } from 'lodash';
import types from './query-types';

export default (racerModel, executeQuery) => {

  const queryThunk = (graphQlRequest, resetCollection) => {

    const sendQuery = (collection, type) => {

      // const query = racerModel.graphQlQuery(graphQlRequest);
      const query = { graphQlRequest };

      return Promise
        .resolve()
        .then(() => {
          let queryResultHandler;

          switch (typeof collection) {
            case 'array':
              queryResultHandler = (queryResult) => pick(queryResult, collection);
            break;
            case 'string':
              queryResultHandler = (queryResult) => pick(queryResult, [collection]);
            break;
            case 'function':
              queryResultHandler = (queryResult) => collection.apply(null, queryResult);
            break;
            default:
              throw(`Invalid ${type} argument - ${typeof collection}`);
          }

          return executeQuery({
            query,
            type,
            resetCollection,
            collection,
          }).then(queryResultHandler);

        });
    }

    if (typeof graphQlRequest === 'function') {
      return graphQlRequest(queryThunk, racerModel);
    }

    return {
      fetchAs: collection => sendQuery( collection, types.FETCH ),
      // subscribeAs: collection => sendQuery( collection, types.SUBSCRIPTION ),
      observeAs: collection => sendQuery( collection, types.OBSERVER ),
    };
  }

  return queryThunk;
}
