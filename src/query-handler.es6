import { pick } from 'lodash';
import types from './query-types';

export default (model, executeQuery) => (graphQlRequest, resetCollection) => {

  const sendQuery = (collection, type) => {

    // const query = model.graphQlQuery(graphQlRequest);
    const query = { graphQlRequest };

    return executeQuery({
      query,
      type,
      resetCollection,
      collection,
    }).then(queryResult => {
      switch (typeof collection) {
        case 'array':
          return pick(queryResult, collection);
        case 'string':
          return pick(queryResult, [collection]);
        case 'function':
          return collection.apply(null, queryResult);
        default:
          return invariant(`Invalid ${type} argument - ${typeof collection}`);
      }
    });
  }

  return {
    fetchAs: collection => sendQuery( collection, types.FETCH ),
    subscribeAs: collection => sendQuery( collection, types.SUBSCRIPTION ),
    observeAs: collection => sendQuery( collection, types.OBSERVER ),
  };
}
