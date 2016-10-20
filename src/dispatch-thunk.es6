import invariant from 'fbjs/lib/invariant';

const methods = {
  set: 3,
  del: 2,
  setNull: 3,
  setDiff: 3,
  setDiffDeep: 3,
  setArrayDiff: 3,
  setArrayDiffDeep: 3,
  add: 3,
  setEach: 3,
  increment: 3,
  push: 3,
  unshift: 3,
  insert: 4,
  pop: 2,
  shift: 2,
  remove: 4,
  move: 5,
  stringInsert: 4,
  stringRemove: 4,
};

export default class Dispatch {
  constructor(mapDispatchToProps, racerModel, sendUpdates) {
    this.mapDispatchToProps = mapDispatchToProps;
    this.racerModel = racerModel;
    this.sendUpdates = sendUpdates;
  }

  dispatch = (methodName, ...args) => {
    const [path] = args;
    const {
      _isLocal: isLocal,
      [methodName]: method,
    } = this.racerModel;

    invariant(
      typeof(path) === 'string',
      'Argument \'path\' should be a string.'
    );
    invariant(
      args.length <= methods[methodName],
      'Too much arguments received.'
    );
    invariant(
      args.filter(argument => typeof(argument) === 'function').length === 0,
      'Callbacks not accepted.'
    );

    const collectionName = path.split('.').shift();

    if (isLocal(collectionName)) {
      this.sendUpdates();
      return Promise.resolve(
        method.call(
          this.racerModel,
          ...args
        )
      );
    }

    return new Promise((resolve, reject) => {
      const result = method.call(
        this.racerModel,
        ...args,
        error => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
          this.sendUpdates();
        }
      );
    });
  }

  makeDispatchThunk = (reactProps, method, ...args) => (
    typeof args[0] === 'function'
      ? args[0](this.thunks(reactProps), reactProps)
      : this.dispatch(method, ...args)
  )

  thunks = reactProps => Object
    .keys(methods)
    .reduce(
      (result, method) => ({
        ...result,
        [method]: (...args) => this.makeDispatchThunk(reactProps, method, ...args),
      }),
      {}
    );

  getState = (reactProps, props) => {
    const composedProps = {
      ...props,
      ...reactProps,
    };
    return {
      ...props,
      ...this.mapDispatchToProps && this.mapDispatchToProps(this.thunks(reactProps), composedProps),
    };
  }
}
