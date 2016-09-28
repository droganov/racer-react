import { pick } from 'lodash';
import types from './query-types';
import { createQueryThunk, createDocQuery } from './query-thunk';

let nextId = 1;

export default class QueryStore {
  constructor() {
    this.flags = {};
    this.queryFunctions = [];
    this.queries = {};
    this.id = `_queryStore_${nextId++}`;
  }

  use(queryFunction) {
    this.queryFunctions.push(queryFunction);
    return this;
  }

  with(racerModel, renderProps) {
    this.racerModel = racerModel;
    if (!this.queryFunctions.length) throw("queryFunctions is empty");

    const queryThunk = createQueryThunk(this);
    const queryDoc   = createDocQuery(this);

    return Promise.all(
        this
          .queryFunctions
          .map(queryFunction => queryFunction(queryThunk, queryDoc, renderProps));
      ).then();
  }

  getScopedModel() {
    return this.scopedModel ||
      (this.scopedModel = this.racerModel.at(this.id));
  }


}
