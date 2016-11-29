import createStoreFactory from './createStoreFactory';

const createDispatcher = () => {
  const subscribers = [];

  const subscribe = (fn) => {
    subscribers.push(fn);
    return () => { subscribers.splice(subscribers.indexOf(fn), 1); };
  };

  const eventQueue = [];
  let dispatching = false;

  const dispatchEventQueue = () => {
    if (!eventQueue.length) return;
    const event = eventQueue.shift();
    subscribers.forEach(fn => fn(event));
    dispatchEventQueue();
  };

  const dispatch = (event) => {
    if (!event || !event.hasOwnProperty('type')) throw new Error('event.type is required');
    eventQueue.push(event);
    if (dispatching) return;
    dispatching = true;
    dispatchEventQueue();
    dispatching = false;
  };

  const createStore = createStoreFactory({ dispatch, subscribe });

  return { dispatch, subscribe, createStore };
};

export default createDispatcher;
