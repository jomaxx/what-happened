const INIT = '@@INIT';

const defaultReducer = (state = [], event) => [...state, event];

const createStoreFactory = (dispatcher) => (reducer = defaultReducer, initialState) => {
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

  return { getState, subscribe, destroy };
};

export default createStoreFactory;
export { INIT };
