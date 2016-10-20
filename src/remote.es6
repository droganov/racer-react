import GraphThunk from './graph-thunk';
import DocThunk from './doc-thunk';
import Select from './select-thunk';

export default class Remote {
  constructor(mapRemoteToProps, racerModel) {
    this.mapRemoteToProps = mapRemoteToProps;
    this.remoteState = {};
    this.mapState = {};
    this.graphThunk = new GraphThunk(
      racerModel,
      this.receiveUpdates
    );
    this.docThunk = new DocThunk(
      racerModel,
      this.receiveUpdates
    );
    this.select = new Select(
      null,
      racerModel,
    );
  }

  get state() {
    return {
      ...this.remoteState,
      ...this.mapState,
    };
  }

  receiveUpdates = updates => {
    this.remoteState = {
      ...this.remoteState,
      ...updates,
    };
    this.onUpdate && this.onUpdate();
  }

  map(reactProps) {
    const remote = {
      graph: this.graphThunk.thunk(reactProps),
      doc: this.docThunk.thunk(reactProps),
    };

    return Promise.resolve(
      this.mapRemoteToProps && this.mapRemoteToProps(
        remote,
        this.select.thunks(reactProps),
        reactProps
      )
    ).then(
      mapState => {
        this.mapState = mapState;
        this.receiveUpdates();
      }
    );
  }

  setOnScreen(onScreen) {
    this.docThunk.onScreen = onScreen;
    this.docThunk.checkOnScreen();
  }

  unmount = () => {
    this.docThunk.unmount();
  }
}
