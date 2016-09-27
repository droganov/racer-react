import { pick } from 'lodash';
import types from './query-types';

let nextId = 1;

export default class QueryThunk {
  constructor() {
    this.flags = {};
    this.queries = {};
    this.id = `_queryThunk_${nextId++}`;
  }

  use(mapRemoteToProps) {
    this.mapRemoteToProps = mapRemoteToProps;
    return this;
  }

  with(racerModel) {
    this.racerModel = racerModel;
    if (!this.mapRemoteToProps) throw("mapRemoteToProps is undefined");

    return this.mapRemoteToProps(this.queryThunk, this.queryDoc);
  }

  queryThunk = (graphQlRequest, resetCollection) => {
    if (typeof graphQlRequest === 'function') {
      return graphQlRequest(this.queryThunk, this.racerModel);
    }

    const query = this.racerModel.graphQlQuery(graphQlRequest);

    return {
      fetchAs: this.queryProcess( types.FETCH, query, resetCollection ),
      observeAs: this.queryProcess( types.OBSERVER, query, resetCollection ),
    };
  }

  queryDoc = (collection, ids) => {
    let query;

    if (ids && Array.isArray(ids)) { // await doc('news', [1,2,3])
      query = ids.map(_id => this.racerModel.query(collection, { _id }));
    } else {
      query = this.racerModel.at(collection);
    }

    return {
      subscribe: this.queryProcess( types.SUBSCRIPTION, query ),
      observe: this.queryProcess( types.OBSERVER, query ),
    };
  }

  queryProcess(type, querys, resetCollection) {
    const {
      racerModel,
      processResults,
      flags,
    } = this;

    const queryFunction = (
      type === types.SUBSCRIPTION ||
      (type === types.OBSERVER && flags.onScreen)
    )
      ? racerModel.subscribe
      : racerModel.fetch;

    return (collection) => new Promise((resolve, reject) => {
      queryFunction.apply(racerModel.root, querys, (err) => {
        if (err) return reject(err);
        resolve(
          processResults(
            type,
            querys,
            collection,
            resetCollection
          )
        );
      });
    });
  }

  processResults(type, querys, collection, resetCollection) {
    const {
      queries,
      mountData,
    } = this;

    const getData = (query) =>
      (query.getExtra && query.getExtra())
      || query.get();

    let queryResult;

    switch (typeof collection) {
      case 'string': // await query(graphQL, true).as('news');
        queryResult = pick(getData(querys), [collection]);
      break;
      case 'array': // await query(graphQL).as(['news', 'comments']);
        queryResult = pick(getData(querys), collection);
      break;
      case 'function': // await query(graphQL).as(result => resolveResult(result));
        queryResult = collection.apply(null, getData(querys));
      break;
      case 'undefined': // await doc('news.1') OR await doc('news', [1,2,3])
        queryResult = Array.isArray(querys)
          ? querys.map(getData)
          : getData(querys);
      break;
      default:
        throw(`Invalid "collection" argument - ${typeof collection}`);
    }

    queries[type][collection.toString()] = {
      type,
      querys,
      collection,
      resetCollection,
    };

    mountData(queryResult, collection, resetCollection);

    if (type === types.OBSERVER) this.observerSubscribeUpdate();
  }

  getScopedModel() {
    return
      this.scopedModel ||
      (this.scopedModel = this.racerModel.root.at(this.id));
  }

  mountData(queryResult, collection, resetCollection) {
    const scopedModel = this.getScopedModel();

    switch (typeof collection) {
      case 'string': case 'array':
        Object.keys(queryResult).forEach(collectionName => {
          scopedModel.set(collectionName, queryResult[collectionName]);
        });
      break;
      case 'function':
        // ...
      break;
      default:
        return;
    }
  }

  observerSubscribeUpdate() {
    const action = this.flags.onScreen ? 'subscribe' : 'unsubscribe';

    for(let queryObj in this.queries[types.OBSERVER]) {
      Array.isArray(queryObj.querys)
        ? queryObj.querys.map(query => query[action]())
        : queryObj.querys[action]()
    }
  }

  onScreen(state) {
    this.flags.onScreen = state;
    this.observerSubscribeUpdate();
  }
}
