'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var createDispatcher = function createDispatcher() {
  var subscribers = [];

  var subscribe = function subscribe(fn) {
    subscribers.push(fn);
    return function () {
      subscribers.splice(subscribers.indexOf(fn), 1);
    };
  };

  var eventQueue = [];
  var dispatching = false;

  var dispatchEventQueue = function dispatchEventQueue() {
    if (!eventQueue.length) return;
    var event = eventQueue.shift();
    subscribers.forEach(function (fn) {
      return fn(event);
    });
    dispatchEventQueue();
  };

  var dispatch = function dispatch(event) {
    if (!event || !event.hasOwnProperty('type')) throw new Error('event.type is required');
    eventQueue.push(event);
    if (dispatching) return;
    dispatching = true;
    dispatchEventQueue();
    dispatching = false;
  };

  return { dispatch: dispatch, subscribe: subscribe };
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var INIT = '@@INIT';

var defaultReducer = function defaultReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var event = arguments[1];
  return [].concat(toConsumableArray(state), [event]);
};

var createStore = function createStore() {
  var reducer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultReducer;
  var initialState = arguments[1];
  var dispatcher = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : createDispatcher();

  var state = reducer(initialState, { type: INIT });
  var subscribers = [];
  var destroyed = false;

  var unsubscribeFromDispatcher = dispatcher.subscribe(function (event) {
    state = reducer(state, event);
    subscribers.forEach(function (fn) {
      return fn();
    });
  });

  var getState = function getState() {
    return state;
  };

  var subscribe = function subscribe(fn) {
    if (destroyed) throw new Error('store was destroyed');
    subscribers.push(fn);
    return function () {
      subscribers.splice(subscribers.indexOf(fn), 1);
    };
  };

  var destroy = function destroy() {
    if (!destroyed) {
      unsubscribeFromDispatcher();
      subscribers.splice(0);
      destroyed = true;
    }

    return destroyed;
  };

  return { getState: getState, subscribe: subscribe, destroy: destroy, dispatch: dispatcher.dispatch };
};

exports.createDispatcher = createDispatcher;
exports.createStore = createStore;
exports.INIT = INIT;
