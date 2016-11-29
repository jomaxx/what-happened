import { createDispatcher, INIT } from '../src';

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

it('should dispatch in order', () => {
  const { dispatch, subscribe } = createDispatcher();

  const subscriber = jest.fn((event) => {
    if (event.type === 'ONE') dispatch({ type: 'TWO' });
  });

  const subscriber2 = jest.fn();

  subscribe(subscriber);
  subscribe(subscriber2);
  dispatch({ type: 'ONE' });

  expect(subscriber.mock.calls).toEqual([
    [{ type: 'ONE' }],
    [{ type: 'TWO' }],
  ]);

  expect(subscriber2.mock.calls).toEqual([
    [{ type: 'ONE' }],
    [{ type: 'TWO' }],
  ]);
});

it('should throw error when dispatch event with no type', () => {
  const { dispatch } = createDispatcher();
  try { dispatch({ typ: 'DONE' }); }
  catch(e) { return; }
  throw new Error('no error thrown');
});
