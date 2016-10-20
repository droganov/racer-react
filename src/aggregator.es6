import hash from 'object-hash';

const collection = '$react';
const path = query => `${collection}.${hash(query)}`;

class Aggregator {
  constructor(racerModel) {
    this.racerModel = racerModel;
  }
  get(query) {
    return this.racerModel.get(
      path(query)
    );
  }
  has(query) {
    return this.get(query) !== undefined;
  }
  set(query, result) {
    this.racerModel.set(
      path(query),
      result,
    );
  }
  purge() {
    // TODO: reset racer collection
  }
}

export default Aggregator;
