import createDispatcher from './createDispatcher';

const INIT = '@@INIT';

const defaultReducer = (state = [], event) => [...state, event];

const createStore = (
  reducer = defaultReducer,
  initialState,
  dispatcher = createDispatcher()
) => {
  let state = reducer(initialState, { type: INIT });
  const subscribers = [];
  let destroyed = false;

  const unsubscribeFromDispatcher = dispatcher.subscribe((event) => {
    state = reducer(state, event);
    subscribers.forEach(fn => fn());
  });

  const getState = () => state;

  const subscribe = (fn) => {
    if (destroyed) throw new Error('store was destroyed');
    subscribers.push(fn);
    return () => { subscribers.splice(subscribers.indexOf(fn), 1); };
  };

  const destroy = () => {
    if (!destroyed) {
      unsubscribeFromDispatcher();
      subscribers.splice(0);
      destroyed = true;
    }

    return destroyed;
  };

  return { getState, subscribe, destroy, dispatch: dispatcher.dispatch };
};

export default createStore;
export { INIT };
