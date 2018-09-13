# spunky

`spunky` leverages the power of [redux-saga](https://redux-saga.js.org/) to take away the pain of
writing [redux](https://redux.js.org/) reducers, allowing you to focus on writing simple JavaScript
functions for reading and writing your application's data.  `spunky` will automatically take care of
state management, providing insight about the progress, success, or failure of calling your
function.  This progress along with data, errors, and more can in turn be exposed to your
[React](https://reactjs.org/) components using a predefined set of
[higher-order components](https://reactjs.org/docs/higher-order-components.html) (HOCs).

Benefits of using `spunky`:

* Eliminates the need to write a reducer for every redux action.
* Automatic progress tracking with loading, loaded, and error states.
* Cancel asynchronous actions before they finish.
* Track action progress.
* Simple HOC's for exposing data, errors, and progress (and more!) to your components.

One important aspect worth noting about this package is that it stores functions inside of redux
stores.  Because functions cannot be serialized, this package currently *does not* work with
isomorphic applications that attempt to preload data on the server in order to pass it to the
client.

## Installation

If using npm:

```
npm install spunky react redux redux-saga --save
```

If using yarn:

```
yarn add spunky react redux redux-saga
```

## Setup

First, you will need to combine `spunky`'s reducer in your top-level reducer.  If your app does not
already have a reducer, you will need to create one.

The `spunky` package assumes that you will store this under the "spunky" key.  If you prefer a
different key, note that you will need to specify that key as part of `options.prefix` when using
the HOCs provided by this package.

```js
// app/reducers.js
import { combineReducers } from "redux";
import { reducer as spunkyReducer } from "spunky";

export default combineReducers({
  spunky: spunkyReducer
  // other app reducers here
});
```

Next, you will need to expose your reducer from above along with `spunky`'s saga to your redux store.

```js
// app/store.js
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { saga } from "spunky";
import reducers from "./reducers";

export default function configureStore(initialState = {}) {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(reducers, initialState, applyMiddleware(sagaMiddleware));

  sagaMiddleware.run(saga);

  return store;
}
```

In order to use promises (or `async`/`await` syntax) in your actions, you can apply the `redux-saga`
middleware in conjunction with [`redux-thunk`](https://github.com/gaearon/redux-thunk).  e.g.:

```js
import thunk from "redux-thunk";

const store = createStore(reducers, initialState, applyMiddleware(sagaMiddleware, thunk));
```

## Usage

Usage of `spunky` can be broken down into three parts:

1. **Define actions:** Actions can be used for reading or writing data, whether through an API,
   local storage, or otherwise.  They can be synchronous or asynchronous (via promises or the ES6
   `async` keyword).
2. **Call actions:** Use actions to retrieve and return data to your application.
3. **Expose data:** Use HOCs to expose data (or errors) to your components.

Below is an example of how these three steps work together to fetch & expose data to a custom
component, displaying a loading component while data is loading.

```js
import React from "react";
import ReactDOM from "react";
import { compose } from "recompose";
import {
  createActions,
  withCall,
  withData,
  withProgressComponents,
  progressValues
} from "spunky";

const { LOADING, FAILED } = progressValues;

const PROFILES = [
  { id: 1, name: "Homer", email: "homer@example.com" },
  { id: 2, name: "Lenny", email: "lenny@example.com" },
  { id: 2, name: "Carl", email: "carl@example.com" }
];

const profileActions = createActions("profile", ({ id }) => async () => {
  const profile = PROFILES.find(profile => profile.id === id);

  // fake internet latency so that we can see loading component while data loads
  await delay(1000);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  return profile;
});

const MyComponent = ({ name, email }) => (
  <ul>
    <li>Name: {name}</li>
    <li>Email: {email}</li>
  </ul>
);

const Loading = () => <div>Loading...</div>;
const Failed = () => <div>Failed to load profile!</div>;

const mapProfileDataToProps = (profile) => ({
  name: profile.name,
  email: profile.email
})

const MyContainer = compose(
  withCall(profileActions),
  withProgressComponents(profileActions, {
    [LOADING]: Loading,
    [FAILED]: Failed
  }),
  withData(profileActions, mapProfileDataToProps)
)(MyComponent);

ReactDOM.render(
  <MyContainer id={1} />,
  document.getElementById("root")
);
```

### Actions

Actions can be called, reset, and cancelled.

#### createActions

To create a set of actions, use the `createActions` function.  It accepts as arguments:

1. `id`: Unique string representing the key in the redux store.  If multiple actions have the same
   `id`, then performing one action will overwrite the results of the other.  Including periods
   (`.`) will result in a nested object structure within the redux store (e.g.: `foo.bar` will
   create an object with key `foo` nesting an object with key `bar`).
1. `action`: Function to be called when dispatching the action.

Calling `createActions` will generate a simple object with the following shape:

* `id`: The same unique string that was passed in.
* `call`: Wrapper function used for dispatching your function definition.
* `cancel`: Wrapper function used for cancelling your action if it is processing.
* `reset`: Wrapper function for resetting the portion of the redux store under `id` to its initial
  state.
* `actionTypes`: Used internally for mapping function calls and results within the redux store.

```js
import { createActions } from "spunky";

export default createActions("geocode", ({ latitude, longitude }) => async () => {
  // Perform a reverse geocode request & return the full address of the first result.
  const { data } = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
    params: {
      latlng: [latitude, longitude].join(","),
      key: GOOGLE_MAPS_API_KEY
    }
  });

  if (data.status !== "OK") {
    throw new Error(`Unexpected API response: ${data.status}`);
  }

  return data.results[0].address_components.map((component) => component.short_name).join(" ");
});
```

#### createBatchActions

The `createBatchActions` function is useful when you want to call multiple functions in parallel, or
if you want to display a loading component until all actions are finished loading.  It accepts as
arguments:

1. `id`: Unique string representing the key in the redux store.  If multiple actions have the same
   `id`, then performing one action will overwrite the results of the other.  Including periods
   (`.`) will result in a nested object structure within the redux store (e.g.: `foo.bar` will
   create an object with key `foo` that has a nested object under key `bar`).
1. `actionsMap`: an object where each key represents an identifier for data, errors, etc., and each
   value is a set of actions created via `createActions` or `createBatchActions`.

```js
import { createBatchActions } from "spunky";

export default createBatchActions("account", {
  profile: profileActions,
  friends: friendsActions
});
```

### Higher-Order Components

#### withCall

The `withCall` HOC is used for kicking off your action's function for the first time.  It will run
any time your component is added to the DOM.

| Argument           | Type       | Required | Description
| ------------------ | ---------- | -------- | -----------
| `actions`          | `Actions`  | Yes      | The actions defined by `createAction` or `createBatchActions`.
| `mapPropsToAction` | `Function` | No       | The function used to pass data to the function call. (default: `(props) => props`)
| `options`          | `object`   | No       | An object containing additional options outlined below.
| `options.propName` | `string`   | No       | The dispatch function prop's name. (default: `"performAction"`)

```js
import { withCall } from "spunky";

export default withCall(profileActions)(MyComponent);
```

#### withData

The `withData` HOC is used for passing data (once loaded) to your component.

| Argument           | Type       | Required | Description
| ------------------ | ---------- | -------- | -----------
| `actions`          | `Actions`  | Yes      | The actions defined by `createAction` or `createBatchActions`.
| `mapper`           | `function` | No       | The function used to map the error to props. (default: maps to `error` prop)
| `options`          | `object`   | No       | An object containing additional options outlined below.
| `options.prefix`   | `string`   | No       | The reducer key used when integrating this package. (default: `"spunky"`)

```js
import { withCall } from "spunky";

const mapLocationDataToProps = (location) => ({
  address: location.address
});

const dashboardActions = ({ profile, friends }) => ({
  name: `${profile.firstName} ${profile.lastName}`,
  email: profile.email,
  activeFriends: friends.filter(friend => friend.active)
});

const MyComponent = ({ address, name, email, activeFriends }) => (
  <dl>
    <dt>Location<dt>
    <dd>{address}</dd>
    <dt>Name</dt>
    <dd>{name}</dd>
    <dt>Email</dt>
    <dd>{email}</dd>
    <dt>Number of Friends</dt>
    <dd>{activeFriends.length}</dd>
  </dl>
);

export default compose(
  // for actions:
  withData(locationActions, mapLocationDataToProps),

  // for batch actions:
  withData(dashboardActions, mapDashboardDataToProps)
)(MyComponent);
```

#### withError

The `withError` HOC is used for passing error (once failed) to your component.

| Argument           | Type       | Required | Description
| ------------------ | ---------- | -------- | -----------
| `actions`          | `Actions`  | Yes      | The actions defined by `createAction` or `createBatchActions`.
| `mapper`           | `function` | No       | The function used to map the error to props. (default: maps to `error` prop)
| `options`          | `object`   | No       | An object containing additional options outlined below.
| `options.prefix`   | `string`   | No       | The reducer key used when integrating this package. (default: `"spunky"`)

```js
import { withError } from "spunky";

const MyComponent = ({ error }) => (
  <div>Error loading data: {error}</div>
);

export default withError(profileActions)(MyComponent);
```

#### withProgress

The `withProgress` HOC is used for passing the progress value for an action to your component.

| Argument           | Type       | Required | Description
| ------------------ | ---------- | -------- | -----------
| `actions`          | `Actions`  | Yes      | The actions defined by `createAction` or `createBatchActions`.
| `options`          | `object`   | No       | An object containing additional options outlined below.
| `options.propName` | `string`   | No       | The progress prop's name. (default: `"progress"`)
| `options.prefix`   | `string`   | No       | The reducer key used when integrating this package. (default: `"spunky"`)
| `options.strategy` | `function` | No       | The reducer key used when integrating this package. (default: `initiallyLoadedStrategy`)

```js
import { withProgress } from "spunky";

const MyComponent = ({ progress }) => (
  <div>Progress: {progress}</div>
);

export default withProgress(profileActions)(MyComponent);
```

##### Initially Loaded Strategy

The `initiallyLoadedStrategy` is the default strategy.  It:

* returns `FAILED` if any actions have failed,
* returns `LOADED` if all actions have loaded.
* returns `LOADING` if any actions are loading or haven't started loading,

```js
import { initiallyLoadedStrategy } from "spunky";
```

##### Already Loaded Strategy

The `alreadyLoadedStrategy`:

* returns `FAILED` if any actions have failed,
* returns `LOADED` if all actions have loaded *at least once*, even if it has been called (is
  loading) again,
* returns `LOADING` if any actions hasn't finished loading *for the first time*.

```js
import { alreadyLoadedStrategy } from "spunky";
```

##### Recently Completed Strategy

The `recentlyCompletedStrategy`:

* returns `FAILED` if any actions are failed or are loading but failed before the most recent load,
* returns `LOADED` if all actions are loaded or are loading but loaded before the most recent load,
* returns `LOADING` if any actions are loading and have not previously loaded or failed.

#### Custom Strategy

You can define your own strategy as well.  It should accept an array of action states and return one
of `LOADING`, `LOADED`, or `FAILED`.  An action state is defined as:

```js
{
  batch: boolean,
  progress: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED',
  rollbackProgress: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED' | null,
  loadedCount: number,
  data: any,
  error: string
}
```

For example:

```js
import { progressValues } from "spunky";

const { LOADING, LOADED, FAILED } = progressValues;

function progressCount(progressValue) {
  return actionStates.filter(actionState => actionState.progress === progressValue).length;
}

function atLeastTwoLoadedStrategy(actionStates) {
  if (progressCount(FAILED) > 0) {
    return FAILED;
  } else if (progressCount(LOADED) >= 2) {
    return LOADED;
  } else {
    return LOADING;
  }
}
```

#### withProgressComponents

The `withProgress` HOC is used for passing the progress value for an action to your component.

| Argument           | Type       | Required | Description
| ------------------ | ---------- | -------- | -----------
| `actions`          | `Actions`  | Yes      | The actions defined by `createAction` or `createBatchActions`.
| `mapping`          | `object`   | Yes      | An object with keys representing the progress value and values representing the component to render.
| `options`          | `object`   | No       | An object containing additional options outlined below.
| `options.propName` | `string`   | No       | The progress prop's name. (default: `"progress"`)
| `options.prefix`   | `string`   | No       | The reducer key used when integrating this package. (default: `"spunky"`)
| `options.strategy` | `function` | No       | The reducer key used when integrating this package. (default: `initiallyLoadedStrategy`)

```js
import { withProgressComponents, progressValues } from "spunky";

const { LOADING, LOADED, FAILED } = progressValues;

const MyComponent = () => (
  <div>Data loaded successfully!</div>
);

const Loading = () => <div>Loading...</div>;
const Failed = () => <div>Failed to load profile!</div>;

export default withProgressComponents(profileActions, {
  [LOADING]: Loading,
  [FAILED]: Failed
})(MyComponent);
```

#### withCancel

The `withCancel` HOC is used for cancelling (interrupting) a call when one (or more) prop changes.

| Argument           | Type                           | Required | Description
| ------------------ | ------------------------------ | -------- | -----------
| `actions`          | `Actions`                      | Yes      | The actions defined by `createAction` or `createBatchActions`.
| `shouldReload`     | `string / string[] / function` | Yes      | The prop name(s) to watch for changes, or a function that takes `prevProps` and `nextProps` and returns a boolean.
| `options`          | `object`                       | No       | An object containing additional options outlined below.
| `options.propName` | `string`                       | No       | The dispatch function prop's name. (default: `"performAction"`)

```js
import { withCancel } from "spunky";

export default withCancel(profileActions, "profileId")(MyComponent);

export default withCancel(profileActions, (prevProps, nextProps) => {
  return prevProps.profileId === null && nextProps.profileId !== null;
})(MyComponent);
```

#### withRecall

The `withRecall` HOC is used for retrying a call when one (or more) prop changes.

| Argument           | Type                           | Required | Description
| ------------------ | ------------------------------ | -------- | -----------
| `actions`          | `Actions`                      | Yes      | The actions defined by `createAction` or `createBatchActions`.
| `shouldReload`     | `string / string[] / function` | Yes      | The prop name(s) to watch for changes, or a function that takes `prevProps` and `nextProps` and returns a boolean.
| `options`          | `object`                       | No       | An object containing additional options outlined below.
| `options.propName` | `string`                       | No       | The dispatch function prop's name. (default: `"performAction"`)

```js
import { withRecall } from "spunky";

export default withRecall(profileActions, "error")(MyComponent);

export default withRecall(profileActions, (prevProps, nextProps) => {
  return prevProps.error === null && nextProps.error !== null;
})(MyComponent);
```

#### withReset

The `withReset` HOC is used for reseting (clearing) the redux store for an action when one (or more) prop changes.

| Argument           | Type                           | Required | Description
| ------------------ | ------------------------------ | -------- | -----------
| `actions`          | `Actions`                      | Yes      | The actions defined by `createAction` or `createBatchActions`.
| `shouldReload`     | `string / string[] / function` | Yes      | The prop name(s) to watch for changes, or a function that takes `prevProps` and `nextProps` and returns a boolean.
| `options`          | `object`                       | No       | An object containing additional options outlined below.
| `options.propName` | `string`                       | No       | The dispatch function prop's name. (default: `"performAction"`)

```js
import { withReset } from "spunky";

export default withReset(profileActions, "profileId")(MyComponent);

export default withReset(profileActions, (prevProps, nextProps) => {
  return prevProps.profileId !== null && nextProps.profileId === null;
})(MyComponent);
```

#### withActions

The `withActions` HOC is used for passing the `call`, `cancel`, `reset`, and/or `clean` function
definitions for an action to your component.

| Argument            | Type       | Required | Description
| ------------------- | ---------- | -------- | -----------
| `actions`           | `Actions`  | Yes      | The actions defined by `createAction` or `createBatchActions`.
| `mapActionsToProps` | `function` | No       | The function used to map the actions to props. (default: maps to `call`, `cancel`, and/or `reset` props)

```js
import { withActions } from "spunky";

export default withActions(profileActions)(MyComponent);

export default withActions(profileActions, (actions, ownProps) => ({
  request: actions.call,
  abort: actions.cancel,
  reset: actions.reset,
  clean: actions.clean
}))(MyComponent);
```

## Development

Run test suite:

```
yarn run test
```

Run lint:

```
yarn run lint
```

Run flow:

```
yarn run flow
```

### Building

Build for development:

```
yarn run build:dev
```

Build for production:

```
yarn run build:prod
```
