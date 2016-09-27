import { pick } from 'lodash';
import types from './query-types';

export default class QueryThunk {
  constructor() {
    this.flags = {};
    this.queries = {};
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

  queryThunk(graphQlRequest, resetCollection) {
    if (typeof graphQlRequest === 'function') {
      return graphQlRequest(this.queryThunk, this.racerModel);
    }

    const query = this.racerModel.graphQlQuery(graphQlRequest);

    return {
      fetchAs: this.queryProcess( types.FETCH, query, resetCollection ),
      observeAs: this.queryProcess( types.OBSERVER, query, resetCollection ),
    };
  }

  queryDoc(collection, ids) {
    let query;

    if (ids && Array.isArray(ids)) { // await doc('news', [1,2,3])
      query = ids.map(_id => this.racerModel.query(collection, { _id });
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

    return (collection) => {
      let queryFunction;
      let queryResultHandler;

      switch (type) {
        case types.FETCH:
          queryFunction = racerModel.fetch;
        break;
        case types.SUBSCRIPTION:
          queryFunction = racerModel.subscribe;
        break;
        case types.OBSERVER:
          queryFunction = flags.onScreen ? racerModel.subscribe : racerModel.fetch;
        break;
        default:
          throw(`Invalid "type" argument - ${type}`);
      }

      switch (typeof collection) {
        case 'string': // await query(graphQL, true).as('news');
          queryResultHandler = (querys) =>
            pick(querys.get(), [collection]);
        break;
        case 'array': // await query(graphQL).as(['news', 'comments']);
          queryResultHandler = (querys) =>
            pick(querys.get(), collection);
        break;
        case 'function': // await query(graphQL).as(result => resolveResult(result));
          queryResultHandler = (querys) =>
            collection.apply(null, querys.get());
        break;
        case 'undefined': // await doc('news.1') OR await doc('news', [1,2,3])
          queryResultHandler = (querys) =>
            Array.isArray(querys) ? querys.map(query => query.get()) : querys.get();
        break;
        default:
          throw(`Invalid "collection" argument - ${typeof collection}`);
      }

      return new Promise((resolve, reject) => {
        queryFunction.apply(racerModel.root, querys, (err) => {
          if (err) return reject(err);
          resolve(
            processResults(
              type,
              querys,
              queryResultHandler,
              collection,
              resetCollection
            )
          );
        });
      });

    }
  }

  processResults(type, querys, queryResultHandler, collection, resetCollection) {
    const {
      racerModel,
    } = this;

    // сохранение данных запросов
    // подвешивание слушателей операций над данными подписок
    // осуществление подписок/отписок для observe по команде из connect-racer

  }

  onScreen(state) {
    this.flags.onScreen = state;
    // обновление момстоняие подписок по observe
  }
}
