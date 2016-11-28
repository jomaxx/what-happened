import { createDispatcher, INIT } from './dispatcher';

it('should subscribe', () => {
  const { dispatch, subscribe } = createDispatcher();
  const subscriber = jest.fn();
  subscribe(subscriber);
  dispatch({ type: 'DONE' });
  expect(subscriber).lastCalledWith({ type: 'DONE' });
});

it('should unsubscribe', () => {
  const { dispatch, subscribe } = createDispatcher();
  const subscriber = jest.fn();
  subscribe(subscriber)();
  dispatch({ type: 'DONE' });
  expect(subscriber).not.lastCalledWith({ type: 'DONE' });
});

it('should dispatch INIT event on subscribe', () => {
  const { dispatch, subscribe } = createDispatcher();
  const subscriber = jest.fn();
  subscribe(subscriber);
  expect(subscriber).lastCalledWith({ type: INIT });
});

it('should create init event on subscribe', () => {
  const { dispatch, subscribe } = createDispatcher(() => ({ type: 'DONE' }));
  const subscriber = jest.fn();
  subscribe(subscriber);
  expect(subscriber).lastCalledWith({ type: 'DONE' });
});

it('should throw error when dispatch malformed event', () => {
  const { dispatch } = createDispatcher(() => payload);

  try {
    dispatch({ typ: 'DONE' });
  } catch(e) {
    return;
  }

  throw new Error('no error thrown');
});

it('should throw error when dispatching from subscriber', () => {
  const { dispatch, subscribe } = createDispatcher();

  const subscriber = jest.fn(() => {
    try {
      store.dispatch({ type: 'DONE' });
    } catch (e) {
      return;
    }

    throw new Error('no error thrown');
  });

  subscribe(subscriber);

  expect(subscriber).not.lastCalledWith({ type: 'DONE' });
});
