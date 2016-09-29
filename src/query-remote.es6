import { pick } from 'lodash';
import types from './query-types';
import { createQueryThunk, createDocQuery } from './query-thunk';

let nextId = 1;

export default class QueryRemote {
  constructor(mapRemoteToProps) {
    if(typeof mapRemoteToProps !== 'function') throw("mapRemoteToProps is not function!");

    this.id = `_remote_${nextId++}`;
    this.flags = {};

    this.mapRemoteToProps = mapRemoteToProps;
    this.queryPromises = [];
    this.remoteFunctions = null;
    this.queries = [];
  }

  // общий интерфейс
  fetch(racerModel, renderProps) {
    const remote = this;

    remote.queryPromises = [];
    remote.racerModel = racerModel;
    remote.renderProps = renderProps;

    const queryThunk = createQueryThunk(remote);
    const queryDoc   = createDocQuery(remote);

    return Promise.resolve(
      remote.mapRemoteToProps(queryThunk, queryDoc, renderProps)
    ).then(functionsProps => {
      remote.functionsProps = functionsProps; // сохранили результат синхронный (функции)
      return remote.queryPromises; // ожидаем окончания собраных query (через fixQueryPromise) в процессе исполнения mapRemoteToProps
    });
  }
  handleQueryPromise(queryPromise) {
    this.queryPromises.push(queryPromise);
  }
  getScopedModel() {
    return this.scopedModel ||
      (this.scopedModel = this.racerModel.at(this.id));
  }
  getData() {
    return this.getScopedModel().get();
  }
  onChange(callback) {
    this.onChangeCallbak = callback;
  }
  handleChange() {
    const {
      updateQueriesData,
      onChangeCallbak,
     } = this;

    updateQueriesData();
    onChangeCallbak && onChangeCallbak();
  }
  props() {
    return {
      ...this.getData(),
      ...this.functionsProps,
    }
  }

  // обслуживание queryObj
  isDocQuery(queryObj) {
    return typeof queryObj.expression !== 'undefined';
  }
  mountQuery(queryObj) {
    const {
      type,
      queryResult,
      racerQuery,
      mounted,
    } = queryObj;

    if (mounted) return;

    const scopedModel = this.getScopedModel();

    if (this.isDocQuery(queryObj)) {
      [].concat(racerQuery).forEach(oneScopedModel => {
        scopedModel.ref(oneScopedModel.path(), oneScopedModel);
      });
    } else {
      racerQuery.ref(this.queryPath(racerQuery));
      mountQueryData(queryResult);
    }

    queryObj.mounted = true;

    this.listen(queryObj);

    this.queries.push(queryObj);
  }
  unmountQuery(queryObj) {
    const {
      racerQuery,
      mounted,
    } = queryObj;

    const scopedModel = this.getScopedModel();

    this.unlisten(queryObj);

    if (this.isDocQuery(queryObj)) {
      [].concat(racerQuery).forEach(oneScopedModel => {
        scopedModel.removeRef(oneScopedModel.path());
      });
    } else {
      racerQuery.removeRef(this.queryPath(racerQuery));
    }

    queryObj.mounted = false;

    this.queries = this.queries.filter(q => q.racerQuery.hash !== racerQuery.hash);
  }
  unmountAllQueries() {
    this.queries.forEach(this.unmountQuery);
  }
  queryPath(racerQuery) {
    return racerQuery.segments.concat('data').join('.');
  }
  updateQueriesData() {
    this.queries
      .map(queryObj => queryObj.queryResult)
      .forEach(this.mountQueryData);
  }
  mountQueryData(queryResult) {
    const scopedModel = this.getScopedModel();
    const qResult = queryResult();

    Object.keys(qResult).forEach(key => {
      scopedModel.set(key, qResult[key]);
    });
  }
  listen(queryObj) {
    const remote = this;
    const {
      racerQuery,
      mounted,
      listened,
    } = queryObj;

    if (!mounted || listened) return;

    if (this.isDocQuery(queryObj)) {
      [].concat(racerQuery).forEach(oneScopedModel => {
        oneScopedModel.on('all', `**`, remote.handleChange);
      });
    } else {
      remote.racerModel.on('all', `${remote.queryPath(racerQuery)}.**`, remote.handleChange);
    }

    queryObj.listened = true;
  }
  unlisten(queryObj) {
    const remote = this;
    const { racerQuery } = queryObj;

    if (this.isDocQuery(queryObj)) {
      [].concat(racerQuery).forEach(oneScopedModel => {
        oneScopedModel.removeAllListeners('all', `**`);
      });
    } else {
      remote.racerModel.removeAllListeners('all', `${remote.queryPath(racerQuery)}.**`);
    }
  }
  changeSubscribeObservers(method) {
    this.racerModel[method](
      this.observers
        .filter(queryObj => queryObj.type === types.OBSERVER)
        .map(queryObj => queryObj.racerQuery)
        .reduce((allObservers, queryObj) => allObservers.concat(queryObj.racerQuery), [])
    );
  }
  subscribeObservers() {
    changeSubscribeObservers('subscribe');
  }
  unsubscribeObservers() {
    changeSubscribeObservers('unsubscribe');
  }
}
