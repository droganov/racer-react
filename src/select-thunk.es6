import invariant from 'fbjs/lib/invariant';

const methods = ['get', 'getCopy', 'getDeepCopy'];

export default class Select {
  constructor(mapSelectToProps, racerModel) {
    this.mapSelectToProps = mapSelectToProps;
    this.racerModel = racerModel;
  }
  select = (path, method) => {
    invariant(
      typeof(path) === 'string',
      'Argument \'path\' should be a string.'
    );
    return this.racerModel[method](path);
  }

  makeThunk = (path, method, reactProps) => (
    typeof path === 'function'
      ? path(this.thunks(reactProps), reactProps)
      : this.select(path, method)
  )

  thunks = reactProps =>
    methods
    .reduce(
      (result, method) => ({
        ...result,
        [method]: path => this.makeThunk(path, method, reactProps),
      }),
      {}
    );

  state(reactProps) {
    return (
      this.mapSelectToProps &&
      this.mapSelectToProps(this.thunks(reactProps), reactProps)
    );
  }
}
