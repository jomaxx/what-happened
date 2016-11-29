const createEventStore = (cacheLimit = 1000) => {
  if (cacheLimit < 0) throw new Error('cacheLimit must be >= 0');

  const events = [];
  const subscribers = [];
  let dispatching = false;

  const getEvents = () => [...events];

  const dispatchToSubscribers = (subscribers, event) => {
    if (dispatching) throw new Error('do not dispatch from a subscriber');
    dispatching = true;
    subscribers.forEach(fn => fn(event));
    dispatching = false;
  };

  const subscribe = (fn) => {
    subscribers.push(fn);
    return () => { subscribers.splice(subscribers.indexOf(fn), 1); };
  };

  const dispatch = (event) => {
    if (!event || !event.hasOwnProperty('type')) throw new Error('event.type is required');
    events.push(event);
    events.splice(0, events.length - cacheLimit);
    dispatchToSubscribers(subscribers, event);
  };

  return { getEvents, dispatch, subscribe };
};

export { createEventStore };
