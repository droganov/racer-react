[Racer.js](https://github.com/derbyjs/racer) wrapper for [React](https://facebook.github.io/react/) which allows to create realtime isomorphic applications with offline support.

In a few words racer-react allows you to query racer model in declarative way from react-router handlers:

```javascript
import React, { Component } from "react";
import { Connect } from "racer-react";

class TestPage extends Component {
  static statics = {
    racer: query => {
      query( "test", {} ).pipeAs( "testList" );
    }
  };
  _submit( ev ){
    ev.preventDefault();
    this.props.racerModel.add( "test", {
      message: this.refs.message.value,
    });
  }
  render() {
    return (
      <div>
        <form onSubmit={ this._submit.bind( this ) }>
          <textarea ref="message" } />
          <button>Add</button>
        </form>
        <ul>
          { this.props.testList.map( (item, i) => {
            <li key={ i }>{ item.id }</li>
          }}
        </ul>
      </div>
    )
  }
}
export default Connect( TestPage );
```
Full list of racer features is [here](https://github.com/derbyjs/racer#features).

Usage [examples](https://github.com/droganov/rkta).
