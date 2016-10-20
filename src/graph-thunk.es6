import Aggregator from './aggregator';

export default class GraphThunk {
  constructor(racerModel, sendUpdates) {
    this.racerModel = racerModel;
    this.sendUpdates = sendUpdates;
    this.aggregator = new Aggregator(racerModel);
  }
  validate = (queryResult) =>
    Object
      .keys(queryResult)
      .reduce(
        (errors, key) => (
          Array.isArray(queryResult[key])
            ? errors
            : [...errors, `Non-array value received as '${key}'.`]
          ),
        []
      );

  apply = (queryResult, query) => {
    const nextQueryResult = {};
    Object
      .keys(queryResult)
      .forEach(key => {
        nextQueryResult[key] = queryResult[key].map(snapshot => {
          const doc = this.racerModel.getOrCreateDoc(key, snapshot.id, snapshot);

          if (doc.shareDoc) {
            doc.shareDoc.data = snapshot.data;
          } else {
            doc.data = snapshot.data;
          }

          doc._updateCollectionData(); // eslint-disable-line no-underscore-dangle

          return doc.get();
        });
      });

    this.sendUpdates(nextQueryResult);
    if (query) this.aggregator.set(query, queryResult);
    return nextQueryResult;
  }

  dispatch = query => ({
    resolve: resolver => (
      this.aggregator.has(query)
        ?
          Promise.resolve(
            this.apply(
              this.aggregator.get(query)
            )
          )
        :
          new Promise((resolve, reject) =>
            this.racerModel.call('graph', query, (error, rawQueryResult) => {
              if (error) return reject([error]);

              const queryResult = typeof(resolver) === 'function'
                  ? resolver(rawQueryResult)
                  : rawQueryResult;

              const errors = this.validate(queryResult);

              return errors.length > 0
                ? reject(errors)
                : resolve(this.apply(queryResult, query));
            })
          )
    ),
  });

  thunk = reactProps => query => (
    typeof query === 'function'
      ? query(this.thunk(reactProps), reactProps)
      : this.dispatch(query)
  );
}
