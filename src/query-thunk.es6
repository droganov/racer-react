import { pick } from 'lodash';
import types from './query-types';

export const createQueryThunk = (queryStore) => {
  const queryAction = query(queryStore);

  (queryObject, resetCollection) =>
      typeof(queryObject) === 'function'
        ? queryObject(queryAction)
        : queryAction(queryObject, resetCollection);
}

const query = (queryStore) => (graphQlRequest, resetCollection) => {
  const racerQuery = queryStore.racerModel.graphQlQuery(graphQlRequest);

  const exec = type => collection => executeQuery({
    racerQuery,
    type,
    collection,
    resetCollection,
  }).then(parseQueryResults);

  return {
    fetchAs: exec(types.FETCH),
    subscribeAs: exec(types.SUBSCRIPTION),
    observeAs: exec(types.OBSERVER),
  };
}

const executeQuery = queryObj => {
  const {
    type,
    racerQuery,
  } = queryObj;

  const queryFunctionName = type === types.SUBSCRIPTION ? "subscribe" : "fetch";

  return new Promise((resolve, reject) => {
    racerModel.root[queryFunctionName](racerQuery, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

const parseQueryResults = (queryObj) => {
  const {
    type,
    racerQuery,
    collection,
  } = queryObj;

  const getQueryData = (query) =>
    (query.getExtra && query.getExtra())
    || query.get();

  switch (typeof collection) {
    case 'string': // await query(graphQL, true).as('news');
      return pick(getQueryData(racerQuery), [collection]);
    break;
    case 'array': // await query(graphQL).as(['news', 'comments']);
      return pick(getQueryData(racerQuery), collection);
    break;
    case 'function': // await query(graphQL).as(result => resolveResult(result));
      return collection.apply(null, getQueryData(racerQuery));
    break;
  }

  throw(`Invalid "collection" argument - ${typeof collection}`);
}

export const createDocQuery = (queryStore) => (expression, ids) => {
  let racerQuery;

  if (ids && Array.isArray(ids)) { // await doc('news', [1,2,3])
    racerQuery = ids.map(_id => this.racerModel.query(expression, { _id }));
  } else {
    racerQuery = this.racerModel.at(expression);
  }

  const exec = type => executeQuery({
    racerQuery,
    type,
  }).then(parseDocQueryResults);

  return {
    subscribe: exec(types.SUBSCRIPTION),
    observe: exec(types.OBSERVER),
  };
}

const parseDocQueryResults = (queryObj) => {
  const { racerQuery } = queryObj;

  return Array.isArray(racerQuery)
    ? racerQuery.map(rq => rq.get())
    : racerQuery.get();
}
