const INIT = '@@what-happened/INIT';

const defaultReducer = (state, event) => event;

const createStoreFactory = (dispatcher) => (reducer = defaultReducer, initialState) => {
  let state = initialState;
  const subscribers = [];
  let destroyed = false;

  const handleEvent = (event) => {
    dispatcher.block(() => {
      state = reducer(state, event);
    }, 'do not dispatch from store reducer');

    subscribers.forEach(fn => fn());
  };

  const unsubscribeFromDispatcher = dispatcher.subscribe(handleEvent);

  const getState = () => state;

  const subscribe = (fn) => {
    if (destroyed) throw new Error('store was destroyed');
    subscribers.push(fn);
    return () => { subscribers.splice(subscribers.indexOf(fn), 1); };
  };

  const destroy = () => {
    if (destroyed) return;
    unsubscribeFromDispatcher();
    subscribers.splice(0);
    destroyed = true;
  };

  handleEvent({ type: INIT });

  return { getState, subscribe, destroy };
};

const createDispatcher = () => {
  const subscribers = [];
  const eventQueue = [];
  let dispatching = false;
  let blockMsgs = [];

  const block = (fn, msg) => {
    blockMsgs.push(msg || 'dispatcher is blocked');
    try { fn(); }
    finally { blockMsgs.pop(); }
  };

  const subscribe = (fn) => {
    subscribers.push(fn);
    return () => { subscribers.splice(subscribers.indexOf(fn), 1); };
  };

  const dispatchEventQueue = () => {
    if (!eventQueue.length) return;
    const event = eventQueue.shift();
    subscribers.forEach(fn => fn(event));
    dispatchEventQueue();
  };

  const dispatch = (event) => {
    if (blockMsgs.length) throw new Error(blockMsgs[blockMsgs.length - 1]);
    if (!event || !event.hasOwnProperty('type')) throw new Error('event.type is required');
    eventQueue.push(event);
    if (dispatching) return;
    dispatching = true;
    dispatchEventQueue();
    dispatching = false;
  };

  const dispatcher = { block, subscribe, dispatch };

  const createStore = createStoreFactory(dispatcher);

  return { ...dispatcher, createStore };
};

export { createDispatcher, INIT };
