import { isServer } from 'racer/lib/util';

export default class DocThunk {
  constructor(racerModel, sendUpdatesToRemote) {
    this.racerModel = racerModel;
    this.sendUpdatesToRemote = sendUpdatesToRemote;

    this.subscribers = [];
    this.observers = [];
    this.listeners = {};

    this.observersIsSubscribed = false;
    this.onScreen = false;
  }

  dispatch = (path, ids) => ({
    listen: target => this.makePromise(path, ids, target, false),
    observe: target => this.makePromise(path, ids, target, true).then(this.checkOnScreen),
  })

  thunk = reactProps => (path, ids) => (
    typeof path === 'function'
      ? path(this.thunk(reactProps), reactProps)
      : this.dispatch(path, ids)
  );

  makePromise = (path, ids, target, isObserver) => {
    const {
      racerModel,
      makeRacerQueries,
      sendUpdates,
      addListeners,
      isLocalQuery,
    } = this;

    const targetStorage = this[isObserver ? 'observers' : 'subscribers'];

    const allRacerQueries = makeRacerQueries(path, ids);
    allRacerQueries.forEach(query => targetStorage.push(query));

    const updatesTrigger = sendUpdates(ids, target, allRacerQueries);
    const queriesResults = updatesTrigger();

    const needSubscribe = !isServer && !isObserver; // на сервере subscribe подменяется на fetch
    const emptyRacerQueries =
      needSubscribe
        ? allRacerQueries
        : allRacerQueries.filter(this.isEmptyQuery);

    if (
      emptyRacerQueries.length === 0 ||
      isLocalQuery(allRacerQueries[0])
    ) {
      addListeners(allRacerQueries, updatesTrigger);
      return Promise.resolve(queriesResults);
    }

    return new Promise((resolve, reject) => {
      racerModel[needSubscribe ? 'subscribe' : 'fetch'](emptyRacerQueries, error => {
        if (error) {
          reject(error);
          return;
        }

        addListeners(allRacerQueries, updatesTrigger);
        resolve(updatesTrigger());
      });
    });
  }

  isMultiDocs = ids => ids && Array.isArray(ids);

  makeRacerQueries = (path, ids) => (
    this.isMultiDocs(ids)
      ? ids.map(_id => this.racerModel.at(`${path}.${_id}`))
      : [this.racerModel.at(path)]
  );

  isEmptyQuery = query => !query.get();

  // eslint-disable-next-line no-underscore-dangle
  isLocalQuery = query => query._isLocal(query._at.split('.').shift());

  getResults = (ids, racerQueries) => {
    const queryResults = racerQueries.map(query => query.getCopy());
    return this.isMultiDocs(ids)
      ? queryResults
      : queryResults[0];
  }

  sendUpdates = (ids, target, racerQueries) => () => {
    const queryResults = this.getResults(ids, racerQueries);
    this.sendUpdatesToRemote({
      [target]: queryResults,
    });
    return queryResults;
  }

  addListeners = (racerQueries, updatesTrigger) => {
    racerQueries.forEach(query => {
      const queryPath = query.path();
      if (this.listeners[queryPath]) return;
      this.listeners[queryPath] = query.on('all', '**', updatesTrigger);
    });
  }

  removeAllListeners = () => {
    const { racerModel } = this;
    Object
      .keys(this.listeners)
      .forEach(queryPath => {
        racerModel.removeListener('all', this.listeners[queryPath]);
        delete this.listeners[queryPath];
      });
  }

  checkOnScreen = data => {
    const { onScreen, observers } = this;
    if (onScreen === this.observersIsSubscribed) return data;
    this.observersIsSubscribed = onScreen;
    this.setSubscribeState(observers, onScreen);
    return data;
  }

  setSubscribeState = (targets, state) => {
    const { racerModel, isLocalQuery } = this;
    const method = state ? 'subscribe' : 'unsubscribe';
    targets.forEach(racerQuery =>
      isLocalQuery(racerQuery) ||
      racerModel[method](racerQuery)
    );
  }

  unmount = () => {
    this.setSubscribeState(this.observers, false);
    this.setSubscribeState(this.subscribers, false);
    this.removeAllListeners();
  }
}
