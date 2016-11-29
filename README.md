# what-happened

## Install

```
npm i what-happened --save
```

## createDispatcher() => dispatcher
The `dispatcher` allows you to notify different parts of your application that an event occured.

```js
import { createDispatcher } from 'what-happened';

const dispatcher = createDispatcher();
```

### dispatcher.subscribe(eventHandler) => unsubscribe
Subscribe to future dispatched events. Returns a function that unsubscribes from future events. Don't forget to unsubscribe!

```js
const unsubscribe = dispatcher.subscribe((event) => {
  switch (event.type) {
    case 'ALERT': return alert(event.message);
    default: return console.warn(`${event.type} not handled`);
  }
});

```

### dispatcher.dispatch(event)
Dispatches an `event` to all subscribers. An `event` is a plain object with a `type` property.

```js
const button = document.createElement('button');
button.innerText = 'Yo!';

button.addEventListener('click', () => dispatcher.dispatch({
  type: 'ALERT',
  message: 'Yo!',
}));

document.body.appendChild(button);

```

## dispatcher.createStore([reducer], [initialState]) => store
A `store` manages the state of your application (or component). When an `event` occurs, the `store` updates it's `state` and notifies it's subscribers. The `reducer` is a function that takes the previous `state` and the dispatched `event` and returns the next `state` (default = `(state = [], event) => event`). Your store can be created with an `initialState` (default = `undefined`).

```js
import { createDispatcher, createStore } from 'what-happened';

const dispatcher = createDispatcher();

const store = dispatcher.createStore((state, event) => {
  if (event.type === 'RESIZE') {
    return {
      width: event.width,
      height: event.height,
    };
  }

  return state;
});

```

### store.subscribe(handler)
Subscribe to future state changes.

```js
const div = document.createElement('div');
document.body.appendChild(div);

store.subscribe(() => {
  const { width, height } = store.getState();
  div.innerText = `window size = ${width}x${height}`;
});

const handleResize = () => dispatcher.dispatch({
  type: 'RESIZE',
  width: window.innerWidth,
  height: window.innerHeight,
});

window.addEventListener('resize', handleResize);
handleResize(); // trigger initial resize
```

### store.destory()
Destroying the store will unsubscribe all subscribers and ignore future dispatched events. Destroy your store when it is no longer needed.
