import { createDispatcher, createStore, INIT } from '../';

it('should create store', () => {
  const { getState } = createStore((state = { done: true }) => state);
  expect(getState()).toEqual({ done: true });
});

it('should create store with initialState', () => {
  const { getState } = createStore((state = { done: false }) => state, { done: true });
  expect(getState()).toEqual({ done: true });
});

it('should handle INIT event on create', () => {
  const { getState } = createStore((state, event) => {
    if (event.type === INIT) return { done: true };
    return state;
  }, { done: false });

  expect(getState()).toEqual({ done: true });
});

it('should handle dispatched events', () => {
  const { getState, dispatch } = createStore((state, event) => {
    if (event.type === 'DONE') return { done: true };
    return state;
  }, { done: false });

  dispatch({ type: 'DONE' });
  expect(getState()).toEqual({ done: true });
});

it('should subscribe', () => {
  const { getState, subscribe, dispatch } = createStore((state) => state);
  const subscriber = jest.fn();
  subscribe(subscriber);
  dispatch({ type: 'DONE' });
  expect(subscriber.mock.calls).toEqual([[]]);
});

it('should unsubscribe', () => {
  const { getState, subscribe, dispatch } = createStore((state) => state);
  const subscriber = jest.fn();
  subscribe(subscriber)();
  dispatch({ type: 'DONE' });
  expect(subscriber.mock.calls).toEqual([]);
});

it('should have a default reducer that records events', () => {
  const { getState, dispatch } = createStore();

  const events = [
    { type: 'ONE' },
    { type: 'TWO' },
    { type: 'THREE' },
    { type: 'DONE' },
  ];

  events.forEach(dispatch);
  expect(getState()).toEqual([{ type: INIT }, ...events]);
});

it('should ignore dispatched events after destroy', () => {
  const { getState, destroy, dispatch } = createStore((state, event) => {
    if (event.type === 'DONE') return { done: true };
    if (event.type === 'IGNORE') throw new Error('event should be ignored');
  });

  dispatch({ type: 'DONE' });
  destroy();
  dispatch({ type: 'IGNORE' });
  expect(getState()).toEqual({ done: true });
});

it('should throw error if subscribe after destroy', () => {
  const { subscribe, destroy } = createStore();
  destroy();
  try { subscribe(() => {}); }
  catch(e) { return; }
  throw new Error('no error thrown');
});

it('should create store with dispatcher', () => {
  const dispatcher = createDispatcher();

  const { getState } = createStore((state, event) => {
    if (event.type === 'DONE') return { done: true };
    return state;
  }, undefined, dispatcher);

  dispatcher.dispatch({ type: 'DONE' });
  expect(getState()).toEqual({ done: true });
});
