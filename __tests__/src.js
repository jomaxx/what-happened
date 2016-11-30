import { createDispatcher, INIT } from '../src';

describe('dispatcher', () => {
  it('should subscribe to dispatcher', () => {
    const { dispatch, subscribe } = createDispatcher();
    const subscriber = jest.fn();
    subscribe(subscriber);
    dispatch({ type: 'DONE' });
    expect(subscriber).lastCalledWith({ type: 'DONE' });
  });

  it('should unsubscribe from dispatcher', () => {
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

  it('should block dispatch', () => {
    const { dispatch, block } = createDispatcher();

    try {
      block(() => {
        block(() => {});
        dispatch({ type: 'DONE' });
      }, 'DONE');
    } catch(e) {
      expect(e.message).toEqual('DONE');
      dispatch({ type: 'DONE' });
      return;
    }

    throw new Error('no error thrown');
  });

  it('should throw error from nested block', () => {
    const { dispatch, block } = createDispatcher();

    try {
      block(() => {
        block(() => {}, 'DONE');
        dispatch({ type: 'ERROR' });
      }, 'DONE');
    } catch(e) {
      expect(e.message).toEqual('DONE');
      dispatch({ type: 'DONE' });
      return;
    }

    throw new Error('no error thrown');
  });
});

describe('store', () => {
  it('should create store', () => {
    const { createStore } = createDispatcher();
    const { getState } = createStore((state = { done: true }) => state);
    expect(getState()).toEqual({ done: true });
  });

  it('should create store with initialState', () => {
    const { createStore } = createDispatcher();
    const { getState } = createStore((state = { done: false }) => state, { done: true });
    expect(getState()).toEqual({ done: true });
  });

  it('should handle INIT event on create', () => {
    const { createStore } = createDispatcher();
    const { getState } = createStore((state, event) => {
      if (event.type === INIT) return { done: true };
      return state;
    }, { done: false });

    expect(getState()).toEqual({ done: true });
  });

  it('should handle dispatched events', () => {
    const { createStore, dispatch } = createDispatcher();
    const { getState } = createStore((state, event) => {
      if (event.type === 'DONE') return { done: true };
      return state;
    }, { done: false });

    dispatch({ type: 'DONE' });
    expect(getState()).toEqual({ done: true });
  });

  it('should subscribe to store', () => {
    const { createStore, dispatch } = createDispatcher();
    const { getState, subscribe } = createStore((state) => state);
    const subscriber = jest.fn();
    subscribe(subscriber);
    dispatch({ type: 'DONE' });
    expect(subscriber.mock.calls).toEqual([[]]);
  });

  it('should unsubscribe from store', () => {
    const { createStore, dispatch } = createDispatcher();
    const { getState, subscribe } = createStore((state) => state);
    const subscriber = jest.fn();
    subscribe(subscriber)();
    dispatch({ type: 'DONE' });
    expect(subscriber.mock.calls).toEqual([]);
  });

  it('should have a default reducer that stores last event', () => {
    const { createStore, dispatch } = createDispatcher();
    const { getState } = createStore();

    [
      { type: 'ONE' },
      { type: 'TWO' },
      { type: 'THREE' },
      { type: 'DONE' },
    ].forEach(dispatch);

    expect(getState()).toEqual({ type: 'DONE' });
  });

  it('should ignore dispatched events after destroy', () => {
    const { createStore, dispatch } = createDispatcher();
    const { getState, destroy } = createStore((state, event) => {
      if (event.type === 'DONE') return { done: true };
      if (event.type === 'IGNORE') throw new Error('event should be ignored');
    });

    dispatch({ type: 'DONE' });
    destroy();
    dispatch({ type: 'IGNORE' });
    expect(getState()).toEqual({ done: true });
  });

  it('should throw error if subscribe after destroy', () => {
    const { createStore } = createDispatcher();
    const { subscribe, destroy } = createStore();
    destroy();
    try { subscribe(() => {}); }
    catch(e) { return; }
    throw new Error('no error thrown');
  });

  it('should block dispatch from reducer', () => {
    const { createStore, dispatch } = createDispatcher();

    const { getState } = createStore((state, event) => {
      if (event.type === INIT) {
        try { dispatch({ type: 'ERROR' }); }
        catch (e) { return { init: true }; }
      }

      if (event.type === 'DONE') {
        try { dispatch({ type: 'ERROR' }); }
        catch (e) { return { done: true }; }
      }
    });

    expect(getState()).toEqual({ init: true });
    dispatch({ type: 'DONE' });
    expect(getState()).toEqual({ done: true });
  });

  it('should dispatch from store subscriber', () => {
    const { createStore, dispatch } = createDispatcher();

    const { subscribe, getState } = createStore((state, event) => {
      if (event.type === 'DONE') return { done: true };
      return {};
    });

    subscribe(() => {
      if (getState().done) return;
      dispatch({ type: 'DONE' });
    });

    dispatch({ type: 'TEST' });

    expect(getState()).toEqual({ done: true });
  });
});
