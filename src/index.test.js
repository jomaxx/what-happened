import { createEventStore } from './';

it('should subscribe', () => {
  const { dispatch, subscribe } = createEventStore();
  const subscriber = jest.fn();
  subscribe(subscriber);
  dispatch({ type: 'DONE' });
  expect(subscriber).lastCalledWith({ type: 'DONE' });
});

it('should unsubscribe', () => {
  const { dispatch, subscribe } = createEventStore();
  const subscriber = jest.fn();
  subscribe(subscriber)();
  dispatch({ type: 'DONE' });
  expect(subscriber).not.lastCalledWith({ type: 'DONE' });
});

it('should get previously dispatched events', () => {
  const { dispatch, getEvents } = createEventStore();
  dispatch({ type: 'DONE' });
  expect(getEvents()).toEqual([{ type: 'DONE' }]);
});

it('should limit number of cached events', () => {
  const { dispatch, getEvents } = createEventStore(2);
  dispatch({ type: 'ONE' });
  dispatch({ type: 'TWO' })
  dispatch({ type: 'THREE' });
  expect(getEvents()).toEqual([{ type: 'TWO' }, { type: 'THREE' }]);
});

it('should throw error if cacheLimit < 0', () => {
  try { createEventStore(-1); }
  catch (e) { return; }
  throw new Error('no error thrown');
});

it('should throw error when dispatch event with no type', () => {
  const { dispatch } = createEventStore();
  try { dispatch({ typ: 'DONE' }); }
  catch(e) { return; }
  throw new Error('no error thrown');
});

it('should throw error when dispatch from subscriber', () => {
  const { dispatch, subscribe } = createEventStore();

  const subscriber = jest.fn(() => {
    try { dispatch({ type: 'DONE' }); }
    catch (e) { return; }
    throw new Error('no error thrown');
  });

  subscribe(subscriber);
  expect(subscriber).not.lastCalledWith({ type: 'DONE' });
});
