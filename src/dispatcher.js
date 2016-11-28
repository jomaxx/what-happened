const verifyEvent = (event) => {
  if (event && event.hasOwnProperty('type')) return;
  throw new Error('event.type is required');
};

const INIT = '@@INIT';

const createDispatcher = (createInitEvent = () => ({ type: INIT })) => {
  if (typeof createInitEvent !== 'function') {
    throw new Error('createInitEvent should be a function');
  }

  const subscribers = [];
  let dispatching = false;

  const dispatchToSubscribers = (subscribers, event) => {
    verifyEvent(event);
    if (dispatching) throw new Error('do not dispatch from a subscriber');
    dispatching = true;
    subscribers.forEach(fn => fn(event));
    dispatching = false;
  };

  const subscribe = (fn) => {
    subscribers.push(fn);
    dispatchToSubscribers([fn], createInitEvent());
    return () => { subscribers.splice(subscribers.indexOf(fn), 1); };
  };

  const dispatch = (event) => {
    dispatchToSubscribers(subscribers, event);
  };

  return { dispatch, subscribe };
};

export { createDispatcher, INIT };
