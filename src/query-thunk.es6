import { pick } from 'lodash';
import types from './query-types';

// internal
const query = remote => (graphQlRequest, resetCollection) => {
  const racerQuery = remote.racerModel.graphQlQuery(graphQlRequest);

  const exec = type => collection => executeQuery({
    racerQuery,
    type,
    collection,
    resetCollection,
    remote,
  })
  .then(attachResults(getQueryResults))
  .then(mountQueryToRemote);

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
    remote,
  } = queryObj;

  const queryFunctionName = type === types.SUBSCRIPTION ? "subscribe" : "fetch";

  const queryPromise = new Promise((resolve, reject) => {
    remote.racerModel[queryFunctionName](racerQuery, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  remote.handleQueryPromise(queryPromise); // сообщаем в remote что нужно ждать этот query

  return queryPromise;
}

const attachResults = getResultFunction => queryObj => {
  queryObj.queryResult = getResultFunction.bind(null, queryObj);
  return queryObj;
}

const getQueryResults = queryObj => {
  const {
    type,
    racerQuery,
    collection,
    remote,
  } = queryObj;

  const getQueryData = (query) =>
    (query.getExtra && query.getExtra())
    || query.get();

  let queryResult;

  switch (typeof collection) {
    case 'string': // await query(graphQL, true).as('news');
      queryResult = pick(getQueryData(racerQuery), [collection]);
    break;
    case 'array': // await query(graphQL).as(['news', 'comments']);
      queryResult = pick(getQueryData(racerQuery), collection);
    break;
    case 'function': // await query(graphQL).as(result => resolveResult(result));
      queryResult = collection.apply(null, getQueryData(racerQuery));
    break;
    default:
      throw(`Invalid "collection" argument - ${typeof collection}`);
  }

  return queryResult;
}

const getDocQueryResults = queryObj => {
  const {
    racerQuery,
    remote,
  } = queryObj;

  const queryResult = Array.isArray(racerQuery)
    ? racerQuery.map(rq => rq.get())  // doc('news',[1,2,3])
    : racerQuery.get();               // doc('news.1')

  return queryResult;
}

const mountQueryToRemote = queryObj => {
  const { remote } = queryObj;
  remote.mountQuery(queryObj);
}

// exports
export const createQueryThunk = remote => {
  const queryAction = query(remote);

  return (queryObject, resetCollection) =>
      typeof(queryObject) === 'function'
        ? queryObject(queryAction)
        : queryAction(queryObject, resetCollection);
}

export const createDocQuery = remote => (expression, ids) => {
  let racerQuery;

  if (ids && Array.isArray(ids)) { // await doc('news', [1,2,3])
    racerQuery = ids.map(_id => remote.racerModel.at(`${expression}.${_id}`));
  } else {
    racerQuery = remote.racerModel.at(expression);
  }

  const exec = type => executeQuery({
    racerQuery,
    type,
    expression,
    ids,
    remote,
  })
  .then(attachResults(getDocQueryResults))
  .then(mountQueryToRemote);

  return {
    subscribe: exec(types.SUBSCRIPTION),
    observe: exec(types.OBSERVER),
  };
}
