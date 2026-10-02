var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../node_modules/events/events.js
var require_events = __commonJS({
  "../node_modules/events/events.js"(exports, module) {
    "use strict";
    var R = typeof Reflect === "object" ? Reflect : null;
    var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
      return Function.prototype.apply.call(target, receiver, args);
    };
    var ReflectOwnKeys;
    if (R && typeof R.ownKeys === "function") {
      ReflectOwnKeys = R.ownKeys;
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
      };
    } else {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target);
      };
    }
    function ProcessEmitWarning(warning) {
      if (console && console.warn) console.warn(warning);
    }
    var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
      return value !== value;
    };
    function EventEmitter2() {
      EventEmitter2.init.call(this);
    }
    module.exports = EventEmitter2;
    module.exports.once = once;
    EventEmitter2.EventEmitter = EventEmitter2;
    EventEmitter2.prototype._events = void 0;
    EventEmitter2.prototype._eventsCount = 0;
    EventEmitter2.prototype._maxListeners = void 0;
    var defaultMaxListeners = 10;
    function checkListener(listener) {
      if (typeof listener !== "function") {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
    }
    Object.defineProperty(EventEmitter2, "defaultMaxListeners", {
      enumerable: true,
      get: function() {
        return defaultMaxListeners;
      },
      set: function(arg) {
        if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
        }
        defaultMaxListeners = arg;
      }
    });
    EventEmitter2.init = function() {
      if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      }
      this._maxListeners = this._maxListeners || void 0;
    };
    EventEmitter2.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
      }
      this._maxListeners = n;
      return this;
    };
    function _getMaxListeners(that) {
      if (that._maxListeners === void 0)
        return EventEmitter2.defaultMaxListeners;
      return that._maxListeners;
    }
    EventEmitter2.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this);
    };
    EventEmitter2.prototype.emit = function emit(type) {
      var args = [];
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      var doError = type === "error";
      var events = this._events;
      if (events !== void 0)
        doError = doError && events.error === void 0;
      else if (!doError)
        return false;
      if (doError) {
        var er;
        if (args.length > 0)
          er = args[0];
        if (er instanceof Error) {
          throw er;
        }
        var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
        err.context = er;
        throw err;
      }
      var handler = events[type];
      if (handler === void 0)
        return false;
      if (typeof handler === "function") {
        ReflectApply(handler, this, args);
      } else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          ReflectApply(listeners[i], this, args);
      }
      return true;
    };
    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;
      checkListener(listener);
      events = target._events;
      if (events === void 0) {
        events = target._events = /* @__PURE__ */ Object.create(null);
        target._eventsCount = 0;
      } else {
        if (events.newListener !== void 0) {
          target.emit(
            "newListener",
            type,
            listener.listener ? listener.listener : listener
          );
          events = target._events;
        }
        existing = events[type];
      }
      if (existing === void 0) {
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === "function") {
          existing = events[type] = prepend ? [listener, existing] : [existing, listener];
        } else if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
        m = _getMaxListeners(target);
        if (m > 0 && existing.length > m && !existing.warned) {
          existing.warned = true;
          var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
          w.name = "MaxListenersExceededWarning";
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          ProcessEmitWarning(w);
        }
      }
      return target;
    }
    EventEmitter2.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };
    EventEmitter2.prototype.on = EventEmitter2.prototype.addListener;
    EventEmitter2.prototype.prependListener = function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };
    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0)
          return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }
    function _onceWrap(target, type, listener) {
      var state2 = { fired: false, wrapFn: void 0, target, type, listener };
      var wrapped = onceWrapper.bind(state2);
      wrapped.listener = listener;
      state2.wrapFn = wrapped;
      return wrapped;
    }
    EventEmitter2.prototype.once = function once2(type, listener) {
      checkListener(listener);
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter2.prototype.prependOnceListener = function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter2.prototype.removeListener = function removeListener(type, listener) {
      var list, events, position, i, originalListener;
      checkListener(listener);
      events = this._events;
      if (events === void 0)
        return this;
      list = events[type];
      if (list === void 0)
        return this;
      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = /* @__PURE__ */ Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit("removeListener", type, list.listener || listener);
        }
      } else if (typeof list !== "function") {
        position = -1;
        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }
        if (position < 0)
          return this;
        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }
        if (list.length === 1)
          events[type] = list[0];
        if (events.removeListener !== void 0)
          this.emit("removeListener", type, originalListener || listener);
      }
      return this;
    };
    EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
    EventEmitter2.prototype.removeAllListeners = function removeAllListeners(type) {
      var listeners, events, i;
      events = this._events;
      if (events === void 0)
        return this;
      if (events.removeListener === void 0) {
        if (arguments.length === 0) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== void 0) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else
            delete events[type];
        }
        return this;
      }
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === "removeListener") continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
        return this;
      }
      listeners = events[type];
      if (typeof listeners === "function") {
        this.removeListener(type, listeners);
      } else if (listeners !== void 0) {
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }
      return this;
    };
    function _listeners(target, type, unwrap) {
      var events = target._events;
      if (events === void 0)
        return [];
      var evlistener = events[type];
      if (evlistener === void 0)
        return [];
      if (typeof evlistener === "function")
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];
      return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }
    EventEmitter2.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true);
    };
    EventEmitter2.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false);
    };
    EventEmitter2.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === "function") {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };
    EventEmitter2.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;
      if (events !== void 0) {
        var evlistener = events[type];
        if (typeof evlistener === "function") {
          return 1;
        } else if (evlistener !== void 0) {
          return evlistener.length;
        }
      }
      return 0;
    }
    EventEmitter2.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };
    function arrayClone(arr, n) {
      var copy = new Array(n);
      for (var i = 0; i < n; ++i)
        copy[i] = arr[i];
      return copy;
    }
    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
      list.pop();
    }
    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }
    function once(emitter, name) {
      return new Promise(function(resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver);
          reject(err);
        }
        function resolver() {
          if (typeof emitter.removeListener === "function") {
            emitter.removeListener("error", errorListener);
          }
          resolve([].slice.call(arguments));
        }
        ;
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== "error") {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
      });
    }
    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === "function") {
        eventTargetAgnosticAddListener(emitter, "error", handler, flags);
      }
    }
    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === "function") {
        if (flags.once) {
          emitter.once(name, listener);
        } else {
          emitter.on(name, listener);
        }
      } else if (typeof emitter.addEventListener === "function") {
        emitter.addEventListener(name, function wrapListener(arg) {
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener);
          }
          listener(arg);
        });
      } else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
      }
    }
  }
});

// ../node_modules/@owlbear-rodeo/sdk/lib/api/PlayerApi.js
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var PlayerApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  get id() {
    if (!this.messageBus.userId) {
      throw Error("Unable to get user ID: not ready");
    }
    return this.messageBus.userId;
  }
  getSelection() {
    return __awaiter(this, void 0, void 0, function* () {
      const { selection } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_SELECTION", {});
      return selection;
    });
  }
  select(items, replace) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_PLAYER_SELECT", { items, replace });
    });
  }
  deselect(items) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_PLAYER_DESELECT", { items });
    });
  }
  getName() {
    return __awaiter(this, void 0, void 0, function* () {
      const { name } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_NAME", {});
      return name;
    });
  }
  setName(name) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_PLAYER_SET_NAME", { name });
    });
  }
  getColor() {
    return __awaiter(this, void 0, void 0, function* () {
      const { color } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_COLOR", {});
      return color;
    });
  }
  setColor(color) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_PLAYER_SET_COLOR", { color });
    });
  }
  getSyncView() {
    return __awaiter(this, void 0, void 0, function* () {
      const { syncView } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_SYNC_VIEW", {});
      return syncView;
    });
  }
  setSyncView(syncView) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_PLAYER_SET_SYNC_VIEW", { syncView });
    });
  }
  getId() {
    return __awaiter(this, void 0, void 0, function* () {
      const { id } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_ID", {});
      return id;
    });
  }
  getRole() {
    return __awaiter(this, void 0, void 0, function* () {
      const { role } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_ROLE", {});
      return role;
    });
  }
  getMetadata() {
    return __awaiter(this, void 0, void 0, function* () {
      const { metadata } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_METADATA", {});
      return metadata;
    });
  }
  setMetadata(update) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_PLAYER_SET_METADATA", { update });
    });
  }
  hasPermission(permission) {
    return __awaiter(this, void 0, void 0, function* () {
      const role = yield this.getRole();
      if (role === "GM") {
        return true;
      }
      const { permissions } = yield this.messageBus.sendAsync("OBR_ROOM_GET_PERMISSIONS", {});
      return permissions.indexOf(permission) > -1;
    });
  }
  getConnectionId() {
    return __awaiter(this, void 0, void 0, function* () {
      const { connectionId } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_CONNECTION_ID", {});
      return connectionId;
    });
  }
  onChange(callback) {
    const handleChange = (data) => {
      callback(data.player);
    };
    this.messageBus.send("OBR_PLAYER_SUBSCRIBE", {});
    this.messageBus.on("OBR_PLAYER_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_PLAYER_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_PLAYER_EVENT_CHANGE", handleChange);
    };
  }
};
var PlayerApi_default = PlayerApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/ViewportApi.js
var __awaiter2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var ViewportApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  reset() {
    return __awaiter2(this, void 0, void 0, function* () {
      const { transform } = yield this.messageBus.sendAsync("OBR_VIEWPORT_RESET", {});
      return transform;
    });
  }
  animateTo(transform) {
    return __awaiter2(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_VIEWPORT_ANIMATE_TO", { transform });
    });
  }
  animateToBounds(bounds) {
    return __awaiter2(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_VIEWPORT_ANIMATE_TO_BOUNDS", {
        bounds
      });
    });
  }
  getPosition() {
    return __awaiter2(this, void 0, void 0, function* () {
      const { position } = yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_POSITION", {});
      return position;
    });
  }
  setPosition(position) {
    return __awaiter2(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_VIEWPORT_SET_POSITION", { position });
    });
  }
  getScale() {
    return __awaiter2(this, void 0, void 0, function* () {
      const { scale } = yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_SCALE", {});
      return scale;
    });
  }
  setScale(scale) {
    return __awaiter2(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_VIEWPORT_SET_SCALE", { scale });
    });
  }
  getWidth() {
    return __awaiter2(this, void 0, void 0, function* () {
      const { width } = yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_WIDTH", {});
      return width;
    });
  }
  getHeight() {
    return __awaiter2(this, void 0, void 0, function* () {
      const { height } = yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_HEIGHT", {});
      return height;
    });
  }
  transformPoint(point) {
    return __awaiter2(this, void 0, void 0, function* () {
      const { point: transformed } = yield this.messageBus.sendAsync("OBR_VIEWPORT_TRANSFORM_POINT", { point });
      return transformed;
    });
  }
  inverseTransformPoint(point) {
    return __awaiter2(this, void 0, void 0, function* () {
      const { point: transformed } = yield this.messageBus.sendAsync("OBR_VIEWPORT_INVERSE_TRANSFORM_POINT", { point });
      return transformed;
    });
  }
};
var ViewportApi_default = ViewportApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/messages/Message.js
function isMessage(message) {
  return typeof message.id === "string";
}

// ../node_modules/@owlbear-rodeo/sdk/lib/messages/MessageBus.js
var import_events = __toESM(require_events());

// ../node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// ../node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

// ../node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = {
  randomUUID
};

// ../node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// ../node_modules/@owlbear-rodeo/sdk/lib/messages/MessageBus.js
var MessageBus = class extends import_events.EventEmitter {
  constructor(origin, roomId) {
    super();
    this.ready = false;
    this.userId = null;
    this.ref = null;
    this.handleMessage = (event) => {
      const message = event.data;
      if (event.origin === this.targetOrigin && isMessage(message)) {
        if (message.id === "OBR_READY") {
          this.ready = true;
          const data = message.data;
          this.ref = data.ref;
          this.userId = data.userId;
        }
        this.emit(message.id, message.data);
      }
    };
    this.send = (id, data, nonce) => {
      var _a;
      if (!this.ref) {
        throw Error("Unable to send message: not ready");
      }
      (_a = window.parent) === null || _a === void 0 ? void 0 : _a.postMessage({
        id,
        data,
        ref: this.ref,
        nonce
      }, this.targetOrigin);
    };
    this.sendAsync = (id, data, timeout = 5e3) => {
      const nonce = `_${v4_default()}`;
      this.send(id, data, nonce);
      return Promise.race([
        new Promise((resolve, reject) => {
          const self = this;
          function onResponse(value) {
            self.off(`${id}_RESPONSE${nonce}`, onResponse);
            self.off(`${id}_ERROR${nonce}`, onError);
            resolve(value);
          }
          function onError(error) {
            self.off(`${id}_RESPONSE${nonce}`, onResponse);
            self.off(`${id}_ERROR${nonce}`, onError);
            reject(error);
          }
          this.on(`${id}_RESPONSE${nonce}`, onResponse);
          this.on(`${id}_ERROR${nonce}`, onError);
        }),
        ...timeout > 0 ? [
          new Promise((_, reject) => window.setTimeout(() => reject(new Error(`Message ${id} took longer than ${timeout}ms to get a result`)), timeout))
        ] : []
      ]);
    };
    this.roomId = roomId;
    this.targetOrigin = origin;
    window.addEventListener("message", this.handleMessage);
    this.setMaxListeners(100);
  }
  destroy() {
    window.removeEventListener("message", this.handleMessage);
  }
};
var MessageBus_default = MessageBus;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/NotificationApi.js
var __awaiter3 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var NotificationApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  show(message, variant) {
    return __awaiter3(this, void 0, void 0, function* () {
      const { id } = yield this.messageBus.sendAsync("OBR_NOTIFICATION_SHOW", { message, variant });
      return id;
    });
  }
  close(id) {
    return __awaiter3(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_NOTIFICATION_CLOSE", { id });
    });
  }
};
var NotificationApi_default = NotificationApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/scene/SceneFogApi.js
var __awaiter4 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var SceneFogApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  getColor() {
    return __awaiter4(this, void 0, void 0, function* () {
      const { color } = yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_COLOR", {});
      return color;
    });
  }
  setColor(color) {
    return __awaiter4(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_COLOR", { color });
    });
  }
  getStrokeWidth() {
    return __awaiter4(this, void 0, void 0, function* () {
      const { strokeWidth } = yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_STROKE_WIDTH", {});
      return strokeWidth;
    });
  }
  setStrokeWidth(strokeWidth) {
    return __awaiter4(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_STROKE_WIDTH", {
        strokeWidth
      });
    });
  }
  getFilled() {
    return __awaiter4(this, void 0, void 0, function* () {
      const { filled } = yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_FILLED", {});
      return filled;
    });
  }
  setFilled(filled) {
    return __awaiter4(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_FILLED", { filled });
    });
  }
  onChange(callback) {
    const handleChange = (data) => {
      callback(data.fog);
    };
    this.messageBus.send("OBR_SCENE_FOG_SUBSCRIBE", {});
    this.messageBus.on("OBR_SCENE_FOG_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_SCENE_FOG_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_SCENE_FOG_EVENT_CHANGE", handleChange);
    };
  }
};
var SceneFogApi_default = SceneFogApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/scene/SceneGridApi.js
var __awaiter5 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var SceneGridApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  getDpi() {
    return __awaiter5(this, void 0, void 0, function* () {
      const { dpi } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_DPI", {});
      return dpi;
    });
  }
  getScale() {
    return __awaiter5(this, void 0, void 0, function* () {
      const scale = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_SCALE", {});
      return scale;
    });
  }
  setScale(scale) {
    return __awaiter5(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_SCALE", { scale });
    });
  }
  getColor() {
    return __awaiter5(this, void 0, void 0, function* () {
      const { color } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_COLOR", {});
      return color;
    });
  }
  setColor(color) {
    return __awaiter5(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_COLOR", { color });
    });
  }
  getOpacity() {
    return __awaiter5(this, void 0, void 0, function* () {
      const { opacity } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_OPACITY", {});
      return opacity;
    });
  }
  setOpacity(opacity) {
    return __awaiter5(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_OPACITY", { opacity });
    });
  }
  getType() {
    return __awaiter5(this, void 0, void 0, function* () {
      const { type } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_TYPE", {});
      return type;
    });
  }
  setType(type) {
    return __awaiter5(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_TYPE", { type });
    });
  }
  getLineType() {
    return __awaiter5(this, void 0, void 0, function* () {
      const { lineType } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_LINE_TYPE", {});
      return lineType;
    });
  }
  setLineType(lineType) {
    return __awaiter5(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_LINE_TYPE", {
        lineType
      });
    });
  }
  getMeasurement() {
    return __awaiter5(this, void 0, void 0, function* () {
      const { measurement } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_MEASUREMENT", {});
      return measurement;
    });
  }
  setMeasurement(measurement) {
    return __awaiter5(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_MEASUREMENT", {
        measurement
      });
    });
  }
  getLineWidth() {
    return __awaiter5(this, void 0, void 0, function* () {
      const { lineWidth } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_LINE_WIDTH", {});
      return lineWidth;
    });
  }
  setLineWidth(lineWidth) {
    return __awaiter5(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_LINE_WIDTH", {
        lineWidth
      });
    });
  }
  snapPosition(position, snappingSensitivity, useCorners, useCenter) {
    return __awaiter5(this, void 0, void 0, function* () {
      const { position: snapped } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_SNAP_POSITION", {
        position,
        snappingSensitivity,
        useCorners,
        useCenter
      });
      return snapped;
    });
  }
  getDistance(from, to) {
    return __awaiter5(this, void 0, void 0, function* () {
      const { distance } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_DISTANCE", { from, to });
      return distance;
    });
  }
  onChange(callback) {
    const handleChange = (data) => {
      callback(data.grid);
    };
    this.messageBus.send("OBR_SCENE_GRID_SUBSCRIBE", {});
    this.messageBus.on("OBR_SCENE_GRID_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_SCENE_GRID_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_SCENE_GRID_EVENT_CHANGE", handleChange);
    };
  }
};
var SceneGridApi_default = SceneGridApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/scene/SceneHistoryApi.js
var __awaiter6 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var SceneHistoryApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  undo() {
    return __awaiter6(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_UNDO", {});
    });
  }
  redo() {
    return __awaiter6(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_REDO", {});
    });
  }
  canUndo() {
    return __awaiter6(this, void 0, void 0, function* () {
      const { canUndo } = yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_CAN_UNDO", {});
      return canUndo;
    });
  }
  canRedo() {
    return __awaiter6(this, void 0, void 0, function* () {
      const { canRedo } = yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_CAN_REDO", {});
      return canRedo;
    });
  }
};
var SceneHistoryApi_default = SceneHistoryApi;

// ../node_modules/immer/dist/immer.mjs
var NOTHING = Symbol.for("immer-nothing");
var DRAFTABLE = Symbol.for("immer-draftable");
var DRAFT_STATE = Symbol.for("immer-state");
var errors = true ? [
  // All error codes, starting by 0:
  function(plugin) {
    return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
  },
  function(thing) {
    return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
  },
  "This object has been frozen and should not be mutated",
  function(data) {
    return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
  },
  "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
  "Immer forbids circular references",
  "The first or second argument to `produce` must be a function",
  "The third argument to `produce` must be a function or undefined",
  "First argument to `createDraft` must be a plain object, an array, or an immerable object",
  "First argument to `finishDraft` must be a draft returned by `createDraft`",
  function(thing) {
    return `'current' expects a draft, got: ${thing}`;
  },
  "Object.defineProperty() cannot be used on an Immer draft",
  "Object.setPrototypeOf() cannot be used on an Immer draft",
  "Immer only supports deleting array indices",
  "Immer only supports setting array indices and the 'length' property",
  function(thing) {
    return `'original' expects a draft, got: ${thing}`;
  }
  // Note: if more errors are added, the errorOffset in Patches.ts should be increased
  // See Patches.ts for additional errors
] : [];
function die(error, ...args) {
  if (true) {
    const e = errors[error];
    const msg = typeof e === "function" ? e.apply(null, args) : e;
    throw new Error(`[Immer] ${msg}`);
  }
  throw new Error(
    `[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`
  );
}
var getPrototypeOf = Object.getPrototypeOf;
function isDraft(value) {
  return !!value && !!value[DRAFT_STATE];
}
function isDraftable(value) {
  if (!value)
    return false;
  return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
}
var objectCtorString = Object.prototype.constructor.toString();
var cachedCtorStrings = /* @__PURE__ */ new WeakMap();
function isPlainObject(value) {
  if (!value || typeof value !== "object")
    return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null || proto === Object.prototype)
    return true;
  const Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  if (Ctor === Object)
    return true;
  if (typeof Ctor !== "function")
    return false;
  let ctorString = cachedCtorStrings.get(Ctor);
  if (ctorString === void 0) {
    ctorString = Function.toString.call(Ctor);
    cachedCtorStrings.set(Ctor, ctorString);
  }
  return ctorString === objectCtorString;
}
function each(obj, iter, strict = true) {
  if (getArchtype(obj) === 0) {
    const keys = strict ? Reflect.ownKeys(obj) : Object.keys(obj);
    keys.forEach((key) => {
      iter(key, obj[key], obj);
    });
  } else {
    obj.forEach((entry, index) => iter(index, entry, obj));
  }
}
function getArchtype(thing) {
  const state2 = thing[DRAFT_STATE];
  return state2 ? state2.type_ : Array.isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
}
function has(thing, prop) {
  return getArchtype(thing) === 2 ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
}
function get(thing, prop) {
  return getArchtype(thing) === 2 ? thing.get(prop) : thing[prop];
}
function set(thing, propOrOldValue, value) {
  const t = getArchtype(thing);
  if (t === 2)
    thing.set(propOrOldValue, value);
  else if (t === 3) {
    thing.add(value);
  } else
    thing[propOrOldValue] = value;
}
function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
function isMap(target) {
  return target instanceof Map;
}
function isSet(target) {
  return target instanceof Set;
}
function latest(state2) {
  return state2.copy_ || state2.base_;
}
function shallowCopy(base, strict) {
  if (isMap(base)) {
    return new Map(base);
  }
  if (isSet(base)) {
    return new Set(base);
  }
  if (Array.isArray(base))
    return Array.prototype.slice.call(base);
  const isPlain = isPlainObject(base);
  if (strict === true || strict === "class_only" && !isPlain) {
    const descriptors = Object.getOwnPropertyDescriptors(base);
    delete descriptors[DRAFT_STATE];
    let keys = Reflect.ownKeys(descriptors);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const desc = descriptors[key];
      if (desc.writable === false) {
        desc.writable = true;
        desc.configurable = true;
      }
      if (desc.get || desc.set)
        descriptors[key] = {
          configurable: true,
          writable: true,
          // could live with !!desc.set as well here...
          enumerable: desc.enumerable,
          value: base[key]
        };
    }
    return Object.create(getPrototypeOf(base), descriptors);
  } else {
    const proto = getPrototypeOf(base);
    if (proto !== null && isPlain) {
      return { ...base };
    }
    const obj = Object.create(proto);
    return Object.assign(obj, base);
  }
}
function freeze(obj, deep = false) {
  if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
    return obj;
  if (getArchtype(obj) > 1) {
    Object.defineProperties(obj, {
      set: dontMutateMethodOverride,
      add: dontMutateMethodOverride,
      clear: dontMutateMethodOverride,
      delete: dontMutateMethodOverride
    });
  }
  Object.freeze(obj);
  if (deep)
    Object.values(obj).forEach((value) => freeze(value, true));
  return obj;
}
function dontMutateFrozenCollections() {
  die(2);
}
var dontMutateMethodOverride = {
  value: dontMutateFrozenCollections
};
function isFrozen(obj) {
  if (obj === null || typeof obj !== "object")
    return true;
  return Object.isFrozen(obj);
}
var plugins = {};
function getPlugin(pluginKey) {
  const plugin = plugins[pluginKey];
  if (!plugin) {
    die(0, pluginKey);
  }
  return plugin;
}
function loadPlugin(pluginKey, implementation) {
  if (!plugins[pluginKey])
    plugins[pluginKey] = implementation;
}
var currentScope;
function getCurrentScope() {
  return currentScope;
}
function createScope(parent_, immer_) {
  return {
    drafts_: [],
    parent_,
    immer_,
    // Whenever the modified draft contains a draft from another scope, we
    // need to prevent auto-freezing so the unowned draft can be finalized.
    canAutoFreeze_: true,
    unfinalizedDrafts_: 0
  };
}
function usePatchesInScope(scope, patchListener) {
  if (patchListener) {
    getPlugin("Patches");
    scope.patches_ = [];
    scope.inversePatches_ = [];
    scope.patchListener_ = patchListener;
  }
}
function revokeScope(scope) {
  leaveScope(scope);
  scope.drafts_.forEach(revokeDraft);
  scope.drafts_ = null;
}
function leaveScope(scope) {
  if (scope === currentScope) {
    currentScope = scope.parent_;
  }
}
function enterScope(immer2) {
  return currentScope = createScope(currentScope, immer2);
}
function revokeDraft(draft) {
  const state2 = draft[DRAFT_STATE];
  if (state2.type_ === 0 || state2.type_ === 1)
    state2.revoke_();
  else
    state2.revoked_ = true;
}
function processResult(result, scope) {
  scope.unfinalizedDrafts_ = scope.drafts_.length;
  const baseDraft = scope.drafts_[0];
  const isReplaced = result !== void 0 && result !== baseDraft;
  if (isReplaced) {
    if (baseDraft[DRAFT_STATE].modified_) {
      revokeScope(scope);
      die(4);
    }
    if (isDraftable(result)) {
      result = finalize(scope, result);
      if (!scope.parent_)
        maybeFreeze(scope, result);
    }
    if (scope.patches_) {
      getPlugin("Patches").generateReplacementPatches_(
        baseDraft[DRAFT_STATE].base_,
        result,
        scope.patches_,
        scope.inversePatches_
      );
    }
  } else {
    result = finalize(scope, baseDraft, []);
  }
  revokeScope(scope);
  if (scope.patches_) {
    scope.patchListener_(scope.patches_, scope.inversePatches_);
  }
  return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value, path) {
  if (isFrozen(value))
    return value;
  const useStrictIteration = rootScope.immer_.shouldUseStrictIteration();
  const state2 = value[DRAFT_STATE];
  if (!state2) {
    each(
      value,
      (key, childValue) => finalizeProperty(rootScope, state2, value, key, childValue, path),
      useStrictIteration
    );
    return value;
  }
  if (state2.scope_ !== rootScope)
    return value;
  if (!state2.modified_) {
    maybeFreeze(rootScope, state2.base_, true);
    return state2.base_;
  }
  if (!state2.finalized_) {
    state2.finalized_ = true;
    state2.scope_.unfinalizedDrafts_--;
    const result = state2.copy_;
    let resultEach = result;
    let isSet2 = false;
    if (state2.type_ === 3) {
      resultEach = new Set(result);
      result.clear();
      isSet2 = true;
    }
    each(
      resultEach,
      (key, childValue) => finalizeProperty(
        rootScope,
        state2,
        result,
        key,
        childValue,
        path,
        isSet2
      ),
      useStrictIteration
    );
    maybeFreeze(rootScope, result, false);
    if (path && rootScope.patches_) {
      getPlugin("Patches").generatePatches_(
        state2,
        path,
        rootScope.patches_,
        rootScope.inversePatches_
      );
    }
  }
  return state2.copy_;
}
function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
  if (childValue == null) {
    return;
  }
  if (typeof childValue !== "object" && !targetIsSet) {
    return;
  }
  const childIsFrozen = isFrozen(childValue);
  if (childIsFrozen && !targetIsSet) {
    return;
  }
  if (childValue === targetObject)
    die(5);
  if (isDraft(childValue)) {
    const path = rootPath && parentState && parentState.type_ !== 3 && // Set objects are atomic since they have no keys.
    !has(parentState.assigned_, prop) ? rootPath.concat(prop) : void 0;
    const res = finalize(rootScope, childValue, path);
    set(targetObject, prop, res);
    if (isDraft(res)) {
      rootScope.canAutoFreeze_ = false;
    } else
      return;
  } else if (targetIsSet) {
    targetObject.add(childValue);
  }
  if (isDraftable(childValue) && !childIsFrozen) {
    if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
      return;
    }
    if (parentState && parentState.base_ && parentState.base_[prop] === childValue && childIsFrozen) {
      return;
    }
    finalize(rootScope, childValue);
    if ((!parentState || !parentState.scope_.parent_) && typeof prop !== "symbol" && (isMap(targetObject) ? targetObject.has(prop) : Object.prototype.propertyIsEnumerable.call(targetObject, prop)))
      maybeFreeze(rootScope, childValue);
  }
}
function maybeFreeze(scope, value, deep = false) {
  if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
    freeze(value, deep);
  }
}
function createProxyProxy(base, parent) {
  const isArray = Array.isArray(base);
  const state2 = {
    type_: isArray ? 1 : 0,
    // Track which produce call this is associated with.
    scope_: parent ? parent.scope_ : getCurrentScope(),
    // True for both shallow and deep changes.
    modified_: false,
    // Used during finalization.
    finalized_: false,
    // Track which properties have been assigned (true) or deleted (false).
    assigned_: {},
    // The parent draft state.
    parent_: parent,
    // The base state.
    base_: base,
    // The base proxy.
    draft_: null,
    // set below
    // The base copy with any updated values.
    copy_: null,
    // Called by the `produce` function.
    revoke_: null,
    isManual_: false
  };
  let target = state2;
  let traps = objectTraps;
  if (isArray) {
    target = [state2];
    traps = arrayTraps;
  }
  const { revoke, proxy } = Proxy.revocable(target, traps);
  state2.draft_ = proxy;
  state2.revoke_ = revoke;
  return proxy;
}
var objectTraps = {
  get(state2, prop) {
    if (prop === DRAFT_STATE)
      return state2;
    const source = latest(state2);
    if (!has(source, prop)) {
      return readPropFromProto(state2, source, prop);
    }
    const value = source[prop];
    if (state2.finalized_ || !isDraftable(value)) {
      return value;
    }
    if (value === peek(state2.base_, prop)) {
      prepareCopy(state2);
      return state2.copy_[prop] = createProxy(value, state2);
    }
    return value;
  },
  has(state2, prop) {
    return prop in latest(state2);
  },
  ownKeys(state2) {
    return Reflect.ownKeys(latest(state2));
  },
  set(state2, prop, value) {
    const desc = getDescriptorFromProto(latest(state2), prop);
    if (desc?.set) {
      desc.set.call(state2.draft_, value);
      return true;
    }
    if (!state2.modified_) {
      const current2 = peek(latest(state2), prop);
      const currentState = current2?.[DRAFT_STATE];
      if (currentState && currentState.base_ === value) {
        state2.copy_[prop] = value;
        state2.assigned_[prop] = false;
        return true;
      }
      if (is(value, current2) && (value !== void 0 || has(state2.base_, prop)))
        return true;
      prepareCopy(state2);
      markChanged(state2);
    }
    if (state2.copy_[prop] === value && // special case: handle new props with value 'undefined'
    (value !== void 0 || prop in state2.copy_) || // special case: NaN
    Number.isNaN(value) && Number.isNaN(state2.copy_[prop]))
      return true;
    state2.copy_[prop] = value;
    state2.assigned_[prop] = true;
    return true;
  },
  deleteProperty(state2, prop) {
    if (peek(state2.base_, prop) !== void 0 || prop in state2.base_) {
      state2.assigned_[prop] = false;
      prepareCopy(state2);
      markChanged(state2);
    } else {
      delete state2.assigned_[prop];
    }
    if (state2.copy_) {
      delete state2.copy_[prop];
    }
    return true;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor(state2, prop) {
    const owner = latest(state2);
    const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
    if (!desc)
      return desc;
    return {
      writable: true,
      configurable: state2.type_ !== 1 || prop !== "length",
      enumerable: desc.enumerable,
      value: owner[prop]
    };
  },
  defineProperty() {
    die(11);
  },
  getPrototypeOf(state2) {
    return getPrototypeOf(state2.base_);
  },
  setPrototypeOf() {
    die(12);
  }
};
var arrayTraps = {};
each(objectTraps, (key, fn) => {
  arrayTraps[key] = function() {
    arguments[0] = arguments[0][0];
    return fn.apply(this, arguments);
  };
});
arrayTraps.deleteProperty = function(state2, prop) {
  if (isNaN(parseInt(prop)))
    die(13);
  return arrayTraps.set.call(this, state2, prop, void 0);
};
arrayTraps.set = function(state2, prop, value) {
  if (prop !== "length" && isNaN(parseInt(prop)))
    die(14);
  return objectTraps.set.call(this, state2[0], prop, value, state2[0]);
};
function peek(draft, prop) {
  const state2 = draft[DRAFT_STATE];
  const source = state2 ? latest(state2) : draft;
  return source[prop];
}
function readPropFromProto(state2, source, prop) {
  const desc = getDescriptorFromProto(source, prop);
  return desc ? `value` in desc ? desc.value : (
    // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    desc.get?.call(state2.draft_)
  ) : void 0;
}
function getDescriptorFromProto(source, prop) {
  if (!(prop in source))
    return void 0;
  let proto = getPrototypeOf(source);
  while (proto) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc)
      return desc;
    proto = getPrototypeOf(proto);
  }
  return void 0;
}
function markChanged(state2) {
  if (!state2.modified_) {
    state2.modified_ = true;
    if (state2.parent_) {
      markChanged(state2.parent_);
    }
  }
}
function prepareCopy(state2) {
  if (!state2.copy_) {
    state2.copy_ = shallowCopy(
      state2.base_,
      state2.scope_.immer_.useStrictShallowCopy_
    );
  }
}
var Immer2 = class {
  constructor(config) {
    this.autoFreeze_ = true;
    this.useStrictShallowCopy_ = false;
    this.useStrictIteration_ = true;
    this.produce = (base, recipe, patchListener) => {
      if (typeof base === "function" && typeof recipe !== "function") {
        const defaultBase = recipe;
        recipe = base;
        const self = this;
        return function curriedProduce(base2 = defaultBase, ...args) {
          return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
        };
      }
      if (typeof recipe !== "function")
        die(6);
      if (patchListener !== void 0 && typeof patchListener !== "function")
        die(7);
      let result;
      if (isDraftable(base)) {
        const scope = enterScope(this);
        const proxy = createProxy(base, void 0);
        let hasError = true;
        try {
          result = recipe(proxy);
          hasError = false;
        } finally {
          if (hasError)
            revokeScope(scope);
          else
            leaveScope(scope);
        }
        usePatchesInScope(scope, patchListener);
        return processResult(result, scope);
      } else if (!base || typeof base !== "object") {
        result = recipe(base);
        if (result === void 0)
          result = base;
        if (result === NOTHING)
          result = void 0;
        if (this.autoFreeze_)
          freeze(result, true);
        if (patchListener) {
          const p = [];
          const ip = [];
          getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
          patchListener(p, ip);
        }
        return result;
      } else
        die(1, base);
    };
    this.produceWithPatches = (base, recipe) => {
      if (typeof base === "function") {
        return (state2, ...args) => this.produceWithPatches(state2, (draft) => base(draft, ...args));
      }
      let patches, inversePatches;
      const result = this.produce(base, recipe, (p, ip) => {
        patches = p;
        inversePatches = ip;
      });
      return [result, patches, inversePatches];
    };
    if (typeof config?.autoFreeze === "boolean")
      this.setAutoFreeze(config.autoFreeze);
    if (typeof config?.useStrictShallowCopy === "boolean")
      this.setUseStrictShallowCopy(config.useStrictShallowCopy);
    if (typeof config?.useStrictIteration === "boolean")
      this.setUseStrictIteration(config.useStrictIteration);
  }
  createDraft(base) {
    if (!isDraftable(base))
      die(8);
    if (isDraft(base))
      base = current(base);
    const scope = enterScope(this);
    const proxy = createProxy(base, void 0);
    proxy[DRAFT_STATE].isManual_ = true;
    leaveScope(scope);
    return proxy;
  }
  finishDraft(draft, patchListener) {
    const state2 = draft && draft[DRAFT_STATE];
    if (!state2 || !state2.isManual_)
      die(9);
    const { scope_: scope } = state2;
    usePatchesInScope(scope, patchListener);
    return processResult(void 0, scope);
  }
  /**
   * Pass true to automatically freeze all copies created by Immer.
   *
   * By default, auto-freezing is enabled.
   */
  setAutoFreeze(value) {
    this.autoFreeze_ = value;
  }
  /**
   * Pass true to enable strict shallow copy.
   *
   * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
   */
  setUseStrictShallowCopy(value) {
    this.useStrictShallowCopy_ = value;
  }
  /**
   * Pass false to use faster iteration that skips non-enumerable properties
   * but still handles symbols for compatibility.
   *
   * By default, strict iteration is enabled (includes all own properties).
   */
  setUseStrictIteration(value) {
    this.useStrictIteration_ = value;
  }
  shouldUseStrictIteration() {
    return this.useStrictIteration_;
  }
  applyPatches(base, patches) {
    let i;
    for (i = patches.length - 1; i >= 0; i--) {
      const patch = patches[i];
      if (patch.path.length === 0 && patch.op === "replace") {
        base = patch.value;
        break;
      }
    }
    if (i > -1) {
      patches = patches.slice(i + 1);
    }
    const applyPatchesImpl = getPlugin("Patches").applyPatches_;
    if (isDraft(base)) {
      return applyPatchesImpl(base, patches);
    }
    return this.produce(
      base,
      (draft) => applyPatchesImpl(draft, patches)
    );
  }
};
function createProxy(value, parent) {
  const draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : createProxyProxy(value, parent);
  const scope = parent ? parent.scope_ : getCurrentScope();
  scope.drafts_.push(draft);
  return draft;
}
function current(value) {
  if (!isDraft(value))
    die(10, value);
  return currentImpl(value);
}
function currentImpl(value) {
  if (!isDraftable(value) || isFrozen(value))
    return value;
  const state2 = value[DRAFT_STATE];
  let copy;
  let strict = true;
  if (state2) {
    if (!state2.modified_)
      return state2.base_;
    state2.finalized_ = true;
    copy = shallowCopy(value, state2.scope_.immer_.useStrictShallowCopy_);
    strict = state2.scope_.immer_.shouldUseStrictIteration();
  } else {
    copy = shallowCopy(value, true);
  }
  each(
    copy,
    (key, childValue) => {
      set(copy, key, currentImpl(childValue));
    },
    strict
  );
  if (state2) {
    state2.finalized_ = false;
  }
  return copy;
}
function enablePatches() {
  const errorOffset = 16;
  if (true) {
    errors.push(
      'Sets cannot have "replace" patches.',
      function(op) {
        return "Unsupported patch operation: " + op;
      },
      function(path) {
        return "Cannot apply patch, path doesn't resolve: " + path;
      },
      "Patching reserved attributes like __proto__, prototype and constructor is not allowed"
    );
  }
  const REPLACE = "replace";
  const ADD = "add";
  const REMOVE = "remove";
  function generatePatches_(state2, basePath, patches, inversePatches) {
    switch (state2.type_) {
      case 0:
      case 2:
        return generatePatchesFromAssigned(
          state2,
          basePath,
          patches,
          inversePatches
        );
      case 1:
        return generateArrayPatches(state2, basePath, patches, inversePatches);
      case 3:
        return generateSetPatches(
          state2,
          basePath,
          patches,
          inversePatches
        );
    }
  }
  function generateArrayPatches(state2, basePath, patches, inversePatches) {
    let { base_, assigned_ } = state2;
    let copy_ = state2.copy_;
    if (copy_.length < base_.length) {
      ;
      [base_, copy_] = [copy_, base_];
      [patches, inversePatches] = [inversePatches, patches];
    }
    for (let i = 0; i < base_.length; i++) {
      if (assigned_[i] && copy_[i] !== base_[i]) {
        const path = basePath.concat([i]);
        patches.push({
          op: REPLACE,
          path,
          // Need to maybe clone it, as it can in fact be the original value
          // due to the base/copy inversion at the start of this function
          value: clonePatchValueIfNeeded(copy_[i])
        });
        inversePatches.push({
          op: REPLACE,
          path,
          value: clonePatchValueIfNeeded(base_[i])
        });
      }
    }
    for (let i = base_.length; i < copy_.length; i++) {
      const path = basePath.concat([i]);
      patches.push({
        op: ADD,
        path,
        // Need to maybe clone it, as it can in fact be the original value
        // due to the base/copy inversion at the start of this function
        value: clonePatchValueIfNeeded(copy_[i])
      });
    }
    for (let i = copy_.length - 1; base_.length <= i; --i) {
      const path = basePath.concat([i]);
      inversePatches.push({
        op: REMOVE,
        path
      });
    }
  }
  function generatePatchesFromAssigned(state2, basePath, patches, inversePatches) {
    const { base_, copy_ } = state2;
    each(state2.assigned_, (key, assignedValue) => {
      const origValue = get(base_, key);
      const value = get(copy_, key);
      const op = !assignedValue ? REMOVE : has(base_, key) ? REPLACE : ADD;
      if (origValue === value && op === REPLACE)
        return;
      const path = basePath.concat(key);
      patches.push(op === REMOVE ? { op, path } : { op, path, value });
      inversePatches.push(
        op === ADD ? { op: REMOVE, path } : op === REMOVE ? { op: ADD, path, value: clonePatchValueIfNeeded(origValue) } : { op: REPLACE, path, value: clonePatchValueIfNeeded(origValue) }
      );
    });
  }
  function generateSetPatches(state2, basePath, patches, inversePatches) {
    let { base_, copy_ } = state2;
    let i = 0;
    base_.forEach((value) => {
      if (!copy_.has(value)) {
        const path = basePath.concat([i]);
        patches.push({
          op: REMOVE,
          path,
          value
        });
        inversePatches.unshift({
          op: ADD,
          path,
          value
        });
      }
      i++;
    });
    i = 0;
    copy_.forEach((value) => {
      if (!base_.has(value)) {
        const path = basePath.concat([i]);
        patches.push({
          op: ADD,
          path,
          value
        });
        inversePatches.unshift({
          op: REMOVE,
          path,
          value
        });
      }
      i++;
    });
  }
  function generateReplacementPatches_(baseValue, replacement, patches, inversePatches) {
    patches.push({
      op: REPLACE,
      path: [],
      value: replacement === NOTHING ? void 0 : replacement
    });
    inversePatches.push({
      op: REPLACE,
      path: [],
      value: baseValue
    });
  }
  function applyPatches_(draft, patches) {
    patches.forEach((patch) => {
      const { path, op } = patch;
      let base = draft;
      for (let i = 0; i < path.length - 1; i++) {
        const parentType = getArchtype(base);
        let p = path[i];
        if (typeof p !== "string" && typeof p !== "number") {
          p = "" + p;
        }
        if ((parentType === 0 || parentType === 1) && (p === "__proto__" || p === "constructor"))
          die(errorOffset + 3);
        if (typeof base === "function" && p === "prototype")
          die(errorOffset + 3);
        base = get(base, p);
        if (typeof base !== "object")
          die(errorOffset + 2, path.join("/"));
      }
      const type = getArchtype(base);
      const value = deepClonePatchValue(patch.value);
      const key = path[path.length - 1];
      switch (op) {
        case REPLACE:
          switch (type) {
            case 2:
              return base.set(key, value);
            case 3:
              die(errorOffset);
            default:
              return base[key] = value;
          }
        case ADD:
          switch (type) {
            case 1:
              return key === "-" ? base.push(value) : base.splice(key, 0, value);
            case 2:
              return base.set(key, value);
            case 3:
              return base.add(value);
            default:
              return base[key] = value;
          }
        case REMOVE:
          switch (type) {
            case 1:
              return base.splice(key, 1);
            case 2:
              return base.delete(key);
            case 3:
              return base.delete(patch.value);
            default:
              return delete base[key];
          }
        default:
          die(errorOffset + 1, op);
      }
    });
    return draft;
  }
  function deepClonePatchValue(obj) {
    if (!isDraftable(obj))
      return obj;
    if (Array.isArray(obj))
      return obj.map(deepClonePatchValue);
    if (isMap(obj))
      return new Map(
        Array.from(obj.entries()).map(([k, v]) => [k, deepClonePatchValue(v)])
      );
    if (isSet(obj))
      return new Set(Array.from(obj).map(deepClonePatchValue));
    const cloned = Object.create(getPrototypeOf(obj));
    for (const key in obj)
      cloned[key] = deepClonePatchValue(obj[key]);
    if (has(obj, DRAFTABLE))
      cloned[DRAFTABLE] = obj[DRAFTABLE];
    return cloned;
  }
  function clonePatchValueIfNeeded(obj) {
    if (isDraft(obj)) {
      return deepClonePatchValue(obj);
    } else
      return obj;
  }
  loadPlugin("Patches", {
    applyPatches_,
    generatePatches_,
    generateReplacementPatches_
  });
}
var immer = new Immer2();
var produce = immer.produce;
var produceWithPatches = /* @__PURE__ */ immer.produceWithPatches.bind(
  immer
);

// ../node_modules/@owlbear-rodeo/sdk/lib/api/scene/SceneItemsApi.js
var __awaiter7 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
enablePatches();
var SceneItemsApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  getItems(filter) {
    return __awaiter7(this, void 0, void 0, function* () {
      if (Array.isArray(filter)) {
        const { items } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEMS", { ids: filter });
        return items;
      } else if (filter) {
        const { items } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ALL_ITEMS", {});
        return items.filter(filter);
      } else {
        const { items } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ALL_ITEMS", {});
        return items;
      }
    });
  }
  isItemArray(value) {
    return Array.isArray(value) && value.every((item) => typeof item !== "string");
  }
  updateItems(filterOrItems, update) {
    return __awaiter7(this, void 0, void 0, function* () {
      let items;
      if (this.isItemArray(filterOrItems)) {
        items = filterOrItems;
      } else {
        items = yield this.getItems(filterOrItems);
      }
      const [nextState, patches] = produceWithPatches(items, update);
      const nextUpdates = nextState.map((item) => ({
        id: item.id,
        type: item.type
      }));
      for (const patch of patches) {
        const [index, key] = patch.path;
        if (typeof index === "number" && typeof key === "string") {
          nextUpdates[index][key] = nextState[index][key];
        }
      }
      const updates = nextUpdates.filter(
        // Ensure that there are updates besides the default ID and type
        (update2) => Object.keys(update2).length > 2
      );
      if (updates.length === 0) {
        return;
      }
      yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_UPDATE_ITEMS", {
        updates
      });
    });
  }
  addItems(items) {
    return __awaiter7(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_ADD_ITEMS", {
        items
      });
    });
  }
  deleteItems(ids) {
    return __awaiter7(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_DELETE_ITEMS", {
        ids
      });
    });
  }
  getItemAttachments(ids) {
    return __awaiter7(this, void 0, void 0, function* () {
      const { items } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEM_ATTACHMENTS", { ids });
      return items;
    });
  }
  getItemBounds(ids) {
    return __awaiter7(this, void 0, void 0, function* () {
      const { bounds } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEM_BOUNDS", { ids });
      return bounds;
    });
  }
  onChange(callback) {
    const handleChange = (data) => {
      callback(data.items);
    };
    this.messageBus.send("OBR_SCENE_ITEMS_SUBSCRIBE", {});
    this.messageBus.on("OBR_SCENE_ITEMS_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_SCENE_ITEMS_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_SCENE_ITEMS_EVENT_CHANGE", handleChange);
    };
  }
};
var SceneItemsApi_default = SceneItemsApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/scene/SceneLocalApi.js
var __awaiter8 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
enablePatches();
var SceneLocalApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  getItems(filter) {
    return __awaiter8(this, void 0, void 0, function* () {
      if (Array.isArray(filter)) {
        const { items } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEMS", { ids: filter });
        return items;
      } else if (filter) {
        const { items } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ALL_ITEMS", {});
        return items.filter(filter);
      } else {
        const { items } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ALL_ITEMS", {});
        return items;
      }
    });
  }
  isItemArray(value) {
    return Array.isArray(value) && value.every((item) => typeof item !== "string");
  }
  updateItems(filterOrItems, update, fastUpdate) {
    return __awaiter8(this, void 0, void 0, function* () {
      let items;
      if (this.isItemArray(filterOrItems)) {
        items = filterOrItems;
      } else {
        items = yield this.getItems(filterOrItems);
      }
      const [nextState, patches] = produceWithPatches(items, update);
      const nextUpdates = nextState.map((item) => ({
        id: item.id,
        type: item.type
      }));
      for (const patch of patches) {
        const [index, key] = patch.path;
        if (typeof index === "number" && typeof key === "string") {
          nextUpdates[index][key] = nextState[index][key];
        }
      }
      const updates = nextUpdates.filter(
        // Ensure that there are updates besides the default ID and type
        (update2) => Object.keys(update2).length > 2
      );
      if (updates.length === 0) {
        return;
      }
      yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_UPDATE_ITEMS", {
        updates,
        fastUpdate
      });
    });
  }
  addItems(items) {
    return __awaiter8(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_ADD_ITEMS", {
        items
      });
    });
  }
  deleteItems(ids) {
    return __awaiter8(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_DELETE_ITEMS", {
        ids
      });
    });
  }
  getItemAttachments(ids) {
    return __awaiter8(this, void 0, void 0, function* () {
      const { items } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEM_ATTACHMENTS", { ids });
      return items;
    });
  }
  getItemBounds(ids) {
    return __awaiter8(this, void 0, void 0, function* () {
      const { bounds } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEM_BOUNDS", { ids });
      return bounds;
    });
  }
  onChange(callback) {
    const handleChange = (data) => {
      callback(data.items);
    };
    this.messageBus.send("OBR_SCENE_LOCAL_SUBSCRIBE", {});
    this.messageBus.on("OBR_SCENE_LOCAL_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_SCENE_LOCAL_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_SCENE_LOCAL_EVENT_CHANGE", handleChange);
    };
  }
};
var SceneLocalApi_default = SceneLocalApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/scene/SceneApi.js
var __awaiter9 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var SceneApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
    this.grid = new SceneGridApi_default(messageBus2);
    this.fog = new SceneFogApi_default(messageBus2);
    this.history = new SceneHistoryApi_default(messageBus2);
    this.items = new SceneItemsApi_default(messageBus2);
    this.local = new SceneLocalApi_default(messageBus2);
  }
  isReady() {
    return __awaiter9(this, void 0, void 0, function* () {
      const { ready } = yield this.messageBus.sendAsync("OBR_SCENE_IS_READY", {});
      return ready;
    });
  }
  onReadyChange(callback) {
    const handleChange = (data) => {
      callback(data.ready);
    };
    this.messageBus.send("OBR_SCENE_READY_SUBSCRIBE", {});
    this.messageBus.on("OBR_SCENE_EVENT_READY_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_SCENE_READY_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_SCENE_EVENT_READY_CHANGE", handleChange);
    };
  }
  getMetadata() {
    return __awaiter9(this, void 0, void 0, function* () {
      const { metadata } = yield this.messageBus.sendAsync("OBR_SCENE_GET_METADATA", {});
      return metadata;
    });
  }
  setMetadata(update) {
    return __awaiter9(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_SCENE_SET_METADATA", { update });
    });
  }
  onMetadataChange(callback) {
    const handleChange = (data) => {
      callback(data.metadata);
    };
    this.messageBus.send("OBR_SCENE_METADATA_SUBSCRIBE", {});
    this.messageBus.on("OBR_SCENE_METADATA_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_SCENE_METADATA_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_SCENE_METADATA_EVENT_CHANGE", handleChange);
    };
  }
};
var SceneApi_default = SceneApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/common/normalize.js
function normalizeUrl(url) {
  return url.startsWith("http") ? url : `${window.location.origin}${url}`;
}
function normalizeIconPaths(icons) {
  return icons.map((base) => Object.assign(Object.assign({}, base), { icon: normalizeUrl(base.icon) }));
}
function normalizeUrlObject(urlObject) {
  return Object.assign(Object.assign({}, urlObject), { url: normalizeUrl(urlObject.url) });
}

// ../node_modules/@owlbear-rodeo/sdk/lib/api/ContextMenuApi.js
var __awaiter10 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var ContextMenuApi = class {
  constructor(messageBus2) {
    this.contextMenus = {};
    this.handleClick = (event) => {
      var _a;
      const menu = this.contextMenus[event.id];
      if (menu) {
        (_a = menu.onClick) === null || _a === void 0 ? void 0 : _a.call(menu, event.context, event.elementId);
      }
    };
    this.messageBus = messageBus2;
    messageBus2.on("OBR_CONTEXT_MENU_EVENT_CLICK", this.handleClick);
  }
  create(contextMenu) {
    return __awaiter10(this, void 0, void 0, function* () {
      this.messageBus.sendAsync("OBR_CONTEXT_MENU_CREATE", {
        id: contextMenu.id,
        shortcut: contextMenu.shortcut,
        icons: normalizeIconPaths(contextMenu.icons),
        embed: contextMenu.embed && normalizeUrlObject(contextMenu.embed)
      });
      this.contextMenus[contextMenu.id] = contextMenu;
    });
  }
  remove(id) {
    return __awaiter10(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_CONTEXT_MENU_REMOVE", { id });
      delete this.contextMenus[id];
    });
  }
};
var ContextMenuApi_default = ContextMenuApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/ToolApi.js
var __awaiter11 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var ToolApi = class {
  constructor(messageBus2) {
    this.tools = {};
    this.toolActions = {};
    this.toolModes = {};
    this.handleToolClick = (event) => {
      const tool = this.tools[event.id];
      if (tool) {
        if (tool.onClick) {
          const result = tool.onClick(event.context, event.elementId);
          Promise.resolve(result).then((activate) => {
            if (activate) {
              this.messageBus.send("OBR_TOOL_ACTIVATE", {
                id: event.id
              });
            }
          });
        } else {
          this.messageBus.send("OBR_TOOL_ACTIVATE", {
            id: event.id
          });
        }
      }
    };
    this.handleToolActionClick = (event) => {
      var _a;
      const action = this.toolActions[event.id];
      if (action) {
        (_a = action.onClick) === null || _a === void 0 ? void 0 : _a.call(action, event.context, event.elementId);
      }
    };
    this.handleToolModeClick = (event) => {
      const mode = this.toolModes[event.id];
      if (mode) {
        if (mode.onClick) {
          const result = mode.onClick(event.context, event.elementId);
          Promise.resolve(result).then((activate) => {
            if (activate) {
              this.messageBus.send("OBR_TOOL_MODE_ACTIVATE", {
                toolId: event.context.activeTool,
                modeId: event.id
              });
            }
          });
        } else {
          this.messageBus.send("OBR_TOOL_MODE_ACTIVATE", {
            toolId: event.context.activeTool,
            modeId: event.id
          });
        }
      }
    };
    this.handleToolModeToolClick = (event) => {
      const mode = this.toolModes[event.id];
      if (mode) {
        if (mode.onToolClick) {
          const result = mode.onToolClick(event.context, event.event);
          Promise.resolve(result).then((select) => {
            if (select && event.event.target && !event.event.target.locked) {
              this.messageBus.sendAsync("OBR_PLAYER_SELECT", {
                items: [event.event.target.id]
              });
            }
          });
        } else {
          if (event.event.target && !event.event.target.locked) {
            this.messageBus.sendAsync("OBR_PLAYER_SELECT", {
              items: [event.event.target.id]
            });
          }
        }
      }
    };
    this.handleToolModeToolDoubleClick = (event) => {
      const mode = this.toolModes[event.id];
      if (mode) {
        if (mode.onToolDoubleClick) {
          const result = mode.onToolDoubleClick(event.context, event.event);
          Promise.resolve(result).then((select) => {
            if (select && event.event.target) {
              this.messageBus.sendAsync("OBR_PLAYER_SELECT", {
                items: [event.event.target.id]
              });
            }
          });
        } else {
          if (event.event.target) {
            this.messageBus.sendAsync("OBR_PLAYER_SELECT", {
              items: [event.event.target.id]
            });
          }
        }
      }
    };
    this.handleToolModeToolDown = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onToolDown) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
      }
    };
    this.handleToolModeToolMove = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onToolMove) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
      }
    };
    this.handleToolModeToolUp = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onToolUp) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
      }
    };
    this.handleToolModeToolDragStart = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onToolDragStart) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
      }
    };
    this.handleToolModeToolDragMove = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onToolDragMove) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
      }
    };
    this.handleToolModeToolDragEnd = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onToolDragEnd) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
      }
    };
    this.handleToolModeToolDragCancel = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onToolDragCancel) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
      }
    };
    this.handleToolModeKeyDown = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onKeyDown) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
      }
    };
    this.handleToolModeKeyUp = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onKeyUp) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
      }
    };
    this.handleToolModeActivate = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onActivate) === null || _a === void 0 ? void 0 : _a.call(mode, event.context);
      }
    };
    this.handleToolModeDeactivate = (event) => {
      var _a;
      const mode = this.toolModes[event.id];
      if (mode) {
        (_a = mode.onDeactivate) === null || _a === void 0 ? void 0 : _a.call(mode, event.context);
      }
    };
    this.messageBus = messageBus2;
    messageBus2.on("OBR_TOOL_EVENT_CLICK", this.handleToolClick);
    messageBus2.on("OBR_TOOL_ACTION_EVENT_CLICK", this.handleToolActionClick);
    messageBus2.on("OBR_TOOL_MODE_EVENT_CLICK", this.handleToolModeClick);
    messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_CLICK", this.handleToolModeToolClick);
    messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DOUBLE_CLICK", this.handleToolModeToolDoubleClick);
    messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DOWN", this.handleToolModeToolDown);
    messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_MOVE", this.handleToolModeToolMove);
    messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_UP", this.handleToolModeToolUp);
    messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_START", this.handleToolModeToolDragStart);
    messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_MOVE", this.handleToolModeToolDragMove);
    messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_END", this.handleToolModeToolDragEnd);
    messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_CANCEL", this.handleToolModeToolDragCancel);
    messageBus2.on("OBR_TOOL_MODE_EVENT_KEY_DOWN", this.handleToolModeKeyDown);
    messageBus2.on("OBR_TOOL_MODE_EVENT_KEY_UP", this.handleToolModeKeyUp);
    messageBus2.on("OBR_TOOL_MODE_EVENT_ACTIVATE", this.handleToolModeActivate);
    messageBus2.on("OBR_TOOL_MODE_EVENT_DEACTIVATE", this.handleToolModeDeactivate);
  }
  create(tool) {
    return __awaiter11(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_TOOL_CREATE", {
        id: tool.id,
        shortcut: tool.shortcut,
        defaultMode: tool.defaultMode,
        defaultMetadata: tool.defaultMetadata,
        icons: normalizeIconPaths(tool.icons),
        disabled: tool.disabled
      });
      this.tools[tool.id] = tool;
    });
  }
  remove(id) {
    return __awaiter11(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_TOOL_REMOVE", { id });
      delete this.tools[id];
    });
  }
  activateTool(id) {
    return __awaiter11(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_TOOL_ACTIVATE", { id });
    });
  }
  getActiveTool() {
    return __awaiter11(this, void 0, void 0, function* () {
      const { id } = yield this.messageBus.sendAsync("OBR_TOOL_GET_ACTIVE", {});
      return id;
    });
  }
  onToolChange(callback) {
    const handleChange = (data) => {
      callback(data.id);
    };
    this.messageBus.send("OBR_TOOL_ACTIVE_SUBSCRIBE", {});
    this.messageBus.on("OBR_TOOL_ACTIVE_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_TOOL_ACTIVE_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_TOOL_ACTIVE_EVENT_CHANGE", handleChange);
    };
  }
  getMetadata(id) {
    return __awaiter11(this, void 0, void 0, function* () {
      const { metadata } = yield this.messageBus.sendAsync("OBR_TOOL_GET_METADATA", { id });
      return metadata;
    });
  }
  setMetadata(toolId, update) {
    return __awaiter11(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_TOOL_SET_METADATA", {
        toolId,
        update
      });
    });
  }
  createAction(action) {
    return __awaiter11(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_TOOL_ACTION_CREATE", {
        id: action.id,
        shortcut: action.shortcut,
        icons: normalizeIconPaths(action.icons),
        disabled: action.disabled
      });
      this.toolActions[action.id] = action;
    });
  }
  removeAction(id) {
    return __awaiter11(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_TOOL_ACTION_REMOVE", { id });
      delete this.tools[id];
    });
  }
  createMode(mode) {
    return __awaiter11(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_TOOL_MODE_CREATE", {
        id: mode.id,
        shortcut: mode.shortcut,
        icons: normalizeIconPaths(mode.icons),
        preventDrag: mode.preventDrag,
        disabled: mode.disabled,
        cursors: mode.cursors
      });
      this.toolModes[mode.id] = mode;
    });
  }
  removeMode(id) {
    return __awaiter11(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_TOOL_MODE_REMOVE", { id });
      delete this.tools[id];
    });
  }
  activateMode(toolId, modeId) {
    return __awaiter11(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_TOOL_MODE_ACTIVATE", {
        toolId,
        modeId
      });
    });
  }
  getActiveToolMode() {
    return __awaiter11(this, void 0, void 0, function* () {
      const { id } = yield this.messageBus.sendAsync("OBR_TOOL_MODE_GET_ACTIVE", {});
      return id;
    });
  }
  onToolModeChange(callback) {
    const handleChange = (data) => {
      callback(data.id);
    };
    this.messageBus.send("OBR_TOOL_MODE_ACTIVE_SUBSCRIBE", {});
    this.messageBus.on("OBR_TOOL_MODE_ACTIVE_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_TOOL_MODE_ACTIVE_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_TOOL_MODE_ACTIVE_EVENT_CHANGE", handleChange);
    };
  }
};
var ToolApi_default = ToolApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/PopoverApi.js
var __awaiter12 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var PopoverApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  open(popover) {
    return __awaiter12(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_POPOVER_OPEN", Object.assign({}, normalizeUrlObject(popover)));
    });
  }
  close(id) {
    return __awaiter12(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_POPOVER_CLOSE", { id });
    });
  }
  getWidth(id) {
    return __awaiter12(this, void 0, void 0, function* () {
      const { width } = yield this.messageBus.sendAsync("OBR_POPOVER_GET_WIDTH", { id });
      return width;
    });
  }
  setWidth(id, width) {
    return __awaiter12(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_POPOVER_SET_WIDTH", { id, width });
    });
  }
  getHeight(id) {
    return __awaiter12(this, void 0, void 0, function* () {
      const { height } = yield this.messageBus.sendAsync("OBR_POPOVER_GET_HEIGHT", { id });
      return height;
    });
  }
  setHeight(id, height) {
    return __awaiter12(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_POPOVER_SET_HEIGHT", { id, height });
    });
  }
};
var PopoverApi_default = PopoverApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/ModalApi.js
var __awaiter13 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var ModalApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  open(modal) {
    return __awaiter13(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_MODAL_OPEN", Object.assign({}, normalizeUrlObject(modal)));
    });
  }
  close(id) {
    return __awaiter13(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_MODAL_CLOSE", { id });
    });
  }
};
var ModalApi_default = ModalApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/ActionApi.js
var __awaiter14 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var ActionApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  getWidth() {
    return __awaiter14(this, void 0, void 0, function* () {
      const { width } = yield this.messageBus.sendAsync("OBR_ACTION_GET_WIDTH", {});
      return width;
    });
  }
  setWidth(width) {
    return __awaiter14(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ACTION_SET_WIDTH", { width });
    });
  }
  getHeight() {
    return __awaiter14(this, void 0, void 0, function* () {
      const { height } = yield this.messageBus.sendAsync("OBR_ACTION_GET_HEIGHT", {});
      return height;
    });
  }
  setHeight(height) {
    return __awaiter14(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ACTION_SET_HEIGHT", { height });
    });
  }
  getBadgeText() {
    return __awaiter14(this, void 0, void 0, function* () {
      const { badgeText } = yield this.messageBus.sendAsync("OBR_ACTION_GET_BADGE_TEXT", {});
      return badgeText;
    });
  }
  setBadgeText(badgeText) {
    return __awaiter14(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ACTION_SET_BADGE_TEXT", { badgeText });
    });
  }
  getBadgeBackgroundColor() {
    return __awaiter14(this, void 0, void 0, function* () {
      const { badgeBackgroundColor } = yield this.messageBus.sendAsync("OBR_ACTION_GET_BADGE_BACKGROUND_COLOR", {});
      return badgeBackgroundColor;
    });
  }
  setBadgeBackgroundColor(badgeBackgroundColor) {
    return __awaiter14(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ACTION_SET_BADGE_BACKGROUND_COLOR", {
        badgeBackgroundColor
      });
    });
  }
  getIcon() {
    return __awaiter14(this, void 0, void 0, function* () {
      const { icon } = yield this.messageBus.sendAsync("OBR_ACTION_GET_ICON", {});
      return icon;
    });
  }
  setIcon(icon) {
    return __awaiter14(this, void 0, void 0, function* () {
      const data = normalizeIconPaths([{ icon }]);
      yield this.messageBus.sendAsync("OBR_ACTION_SET_ICON", {
        icon: data[0].icon
      });
    });
  }
  getTitle() {
    return __awaiter14(this, void 0, void 0, function* () {
      const { title } = yield this.messageBus.sendAsync("OBR_ACTION_GET_TITLE", {});
      return title;
    });
  }
  setTitle(title) {
    return __awaiter14(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ACTION_SET_TITLE", { title });
    });
  }
  isOpen() {
    return __awaiter14(this, void 0, void 0, function* () {
      const { isOpen } = yield this.messageBus.sendAsync("OBR_ACTION_GET_IS_OPEN", {});
      return isOpen;
    });
  }
  open() {
    return __awaiter14(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ACTION_OPEN", {});
    });
  }
  close() {
    return __awaiter14(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ACTION_CLOSE", {});
    });
  }
  onOpenChange(callback) {
    const handleChange = (data) => {
      callback(data.isOpen);
    };
    this.messageBus.send("OBR_ACTION_IS_OPEN_SUBSCRIBE", {});
    this.messageBus.on("OBR_ACTION_IS_OPEN_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_IS_OPEN_ACTION_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_ACTION_IS_OPEN_EVENT_CHANGE", handleChange);
    };
  }
};
var ActionApi_default = ActionApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/InteractionApi.js
var __awaiter15 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
enablePatches();
var InteractionApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  startItemInteraction(baseState) {
    return __awaiter15(this, void 0, void 0, function* () {
      const { id } = yield this.messageBus.sendAsync("OBR_INTERACTION_START_ITEM_INTERACTION", { baseState });
      let prev = baseState;
      const dispatcher = (update) => {
        const [next, patches] = produceWithPatches(prev, update);
        prev = next;
        this.messageBus.send("OBR_INTERACTION_UPDATE_ITEM_INTERACTION", {
          id,
          patches
        });
        return next;
      };
      const stop = () => {
        this.messageBus.send("OBR_INTERACTION_STOP_ITEM_INTERACTION", { id });
      };
      return [dispatcher, stop];
    });
  }
};
var InteractionApi_default = InteractionApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/PartyApi.js
var __awaiter16 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var PartyApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  getPlayers() {
    return __awaiter16(this, void 0, void 0, function* () {
      const { players } = yield this.messageBus.sendAsync("OBR_PARTY_GET_PLAYERS", {});
      return players;
    });
  }
  onChange(callback) {
    const handleChange = (data) => {
      callback(data.players);
    };
    this.messageBus.send("OBR_PARTY_SUBSCRIBE", {});
    this.messageBus.on("OBR_PARTY_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_PARTY_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_PARTY_EVENT_CHANGE", handleChange);
    };
  }
};
var PartyApi_default = PartyApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/RoomApi.js
var __awaiter17 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var RoomApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  get id() {
    return this.messageBus.roomId;
  }
  getPermissions() {
    return __awaiter17(this, void 0, void 0, function* () {
      const { permissions } = yield this.messageBus.sendAsync("OBR_ROOM_GET_PERMISSIONS", {});
      return permissions;
    });
  }
  getMetadata() {
    return __awaiter17(this, void 0, void 0, function* () {
      const { metadata } = yield this.messageBus.sendAsync("OBR_ROOM_GET_METADATA", {});
      return metadata;
    });
  }
  setMetadata(update) {
    return __awaiter17(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ROOM_SET_METADATA", { update });
    });
  }
  onMetadataChange(callback) {
    const handleChange = (data) => {
      callback(data.metadata);
    };
    this.messageBus.send("OBR_ROOM_METADATA_SUBSCRIBE", {});
    this.messageBus.on("OBR_ROOM_METADATA_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_METADATA_ROOM_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_ROOM_METADATA_EVENT_CHANGE", handleChange);
    };
  }
  onPermissionsChange(callback) {
    const handleChange = (data) => {
      callback(data.permissions);
    };
    this.messageBus.send("OBR_ROOM_PERMISSIONS_SUBSCRIBE", {});
    this.messageBus.on("OBR_ROOM_PERMISSIONS_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_PERMISSIONS_ROOM_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_ROOM_PERMISSIONS_EVENT_CHANGE", handleChange);
    };
  }
};
var RoomApi_default = RoomApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/ThemeApi.js
var __awaiter18 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var ThemeApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  getTheme() {
    return __awaiter18(this, void 0, void 0, function* () {
      const { theme } = yield this.messageBus.sendAsync("OBR_THEME_GET_THEME", {});
      return theme;
    });
  }
  onChange(callback) {
    const handleChange = (data) => {
      callback(data.theme);
    };
    this.messageBus.send("OBR_THEME_SUBSCRIBE", {});
    this.messageBus.on("OBR_THEME_EVENT_CHANGE", handleChange);
    return () => {
      this.messageBus.send("OBR_THEME_UNSUBSCRIBE", {});
      this.messageBus.off("OBR_THEME_EVENT_CHANGE", handleChange);
    };
  }
};
var ThemeApi_default = ThemeApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/AssetsApi.js
var __awaiter19 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var AssetsApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  uploadImages(images, typeHint) {
    return __awaiter19(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ASSETS_UPLOAD_IMAGES", {
        images,
        typeHint
      });
    });
  }
  uploadScenes(scenes, disableShowScenes) {
    return __awaiter19(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_ASSETS_UPLOAD_SCENES", {
        scenes,
        disableShowScenes
      });
    });
  }
  downloadImages(multiple, defaultSearch, typeHint) {
    return __awaiter19(this, void 0, void 0, function* () {
      const { images } = yield this.messageBus.sendAsync("OBR_ASSETS_DOWNLOAD_IMAGES", { multiple, defaultSearch, typeHint }, -1);
      return images;
    });
  }
  downloadScenes(multiple, defaultSearch) {
    return __awaiter19(this, void 0, void 0, function* () {
      const { scenes } = yield this.messageBus.sendAsync("OBR_ASSETS_DOWNLOAD_SCENES", { multiple, defaultSearch }, -1);
      return scenes;
    });
  }
};
var AssetsApi_default = AssetsApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/api/BroadcastApi.js
var __awaiter20 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var BroadcastApi = class {
  constructor(messageBus2) {
    this.messageBus = messageBus2;
  }
  sendMessage(channel2, data, options) {
    return __awaiter20(this, void 0, void 0, function* () {
      yield this.messageBus.sendAsync("OBR_BROADCAST_SEND_MESSAGE", {
        channel: channel2,
        data,
        options
      });
    });
  }
  onMessage(channel2, callback) {
    this.messageBus.send("OBR_BROADCAST_SUBSCRIBE", { channel: channel2 });
    this.messageBus.on(`OBR_BROADCAST_MESSAGE_${channel2}`, callback);
    return () => {
      this.messageBus.send("OBR_BROADCAST_UNSUBSCRIBE", { channel: channel2 });
      this.messageBus.off(`OBR_BROADCAST_MESSAGE_${channel2}`, callback);
    };
  }
};
var BroadcastApi_default = BroadcastApi;

// ../node_modules/@owlbear-rodeo/sdk/lib/builders/GenericItemBuilder.js
var GenericItemBuilder = class {
  constructor(player) {
    this._item = {
      createdUserId: player.id,
      id: v4_default(),
      name: "Item",
      zIndex: Date.now(),
      lastModified: (/* @__PURE__ */ new Date()).toISOString(),
      lastModifiedUserId: player.id,
      locked: false,
      metadata: {},
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      type: "ITEM",
      visible: true,
      layer: "POPOVER"
    };
  }
  createdUserId(createdUserId) {
    this._item.createdUserId = createdUserId;
    return this.self();
  }
  id(id) {
    this._item.id = id;
    return this.self();
  }
  name(name) {
    this._item.name = name;
    return this.self();
  }
  description(description) {
    this._item.description = description;
    return this.self();
  }
  lastModified(lastModified) {
    this._item.lastModified = lastModified;
    return this.self();
  }
  zIndex(zIndex) {
    this._item.zIndex = zIndex;
    return this.self();
  }
  lastModifiedUserId(lastModifiedUserId) {
    this._item.lastModifiedUserId = lastModifiedUserId;
    return this.self();
  }
  locked(locked) {
    this._item.locked = locked;
    return this.self();
  }
  metadata(metadata) {
    this._item.metadata = metadata;
    return this.self();
  }
  position(position) {
    this._item.position = position;
    return this.self();
  }
  rotation(rotation) {
    this._item.rotation = rotation;
    return this.self();
  }
  scale(scale) {
    this._item.scale = scale;
    return this.self();
  }
  visible(visible) {
    this._item.visible = visible;
    return this.self();
  }
  attachedTo(attachedTo) {
    this._item.attachedTo = attachedTo;
    return this.self();
  }
  layer(layer) {
    this._item.layer = layer;
    return this.self();
  }
  disableHit(disable) {
    this._item.disableHit = disable;
    return this.self();
  }
  disableAutoZIndex(disable) {
    this._item.disableAutoZIndex = disable;
    return this.self();
  }
  disableAttachmentBehavior(disable) {
    this._item.disableAttachmentBehavior = disable;
    return this.self();
  }
  self() {
    return this;
  }
};

// ../node_modules/@owlbear-rodeo/sdk/lib/builders/ImageBuilder.js
var ImageBuilder = class extends GenericItemBuilder {
  constructor(player, image, grid) {
    super(player);
    this._image = image;
    this._grid = grid;
    this._item.name = "Image";
    this._text = {
      richText: [
        {
          type: "paragraph",
          children: [{ text: "" }]
        }
      ],
      plainText: "",
      style: {
        padding: 8,
        fontFamily: "Roboto",
        fontSize: 24,
        fontWeight: 400,
        textAlign: "CENTER",
        textAlignVertical: "BOTTOM",
        fillColor: "white",
        fillOpacity: 1,
        strokeColor: "white",
        strokeOpacity: 1,
        strokeWidth: 0,
        lineHeight: 1.5
      },
      type: "PLAIN",
      width: "AUTO",
      height: "AUTO"
    };
    this._textItemType = "LABEL";
  }
  text(text) {
    this._text = text;
    return this.self();
  }
  textItemType(textItemType) {
    this._textItemType = textItemType;
    return this.self();
  }
  textWidth(width) {
    this._text.width = width;
    return this.self();
  }
  textHeight(height) {
    this._text.height = height;
    return this.self();
  }
  richText(richText) {
    this._text.richText = richText;
    return this.self();
  }
  plainText(plainText) {
    this._text.plainText = plainText;
    return this.self();
  }
  textType(textType) {
    this._text.type = textType;
    return this.self();
  }
  textPadding(padding) {
    this._text.style.padding = padding;
    return this.self();
  }
  fontFamily(fontFamily) {
    this._text.style.fontFamily = fontFamily;
    return this.self();
  }
  fontSize(fontSize) {
    this._text.style.fontSize = fontSize;
    return this.self();
  }
  fontWeight(fontWeight) {
    this._text.style.fontWeight = fontWeight;
    return this.self();
  }
  textAlign(textAlign) {
    this._text.style.textAlign = textAlign;
    return this.self();
  }
  textAlignVertical(textAlignVertical) {
    this._text.style.textAlignVertical = textAlignVertical;
    return this.self();
  }
  textFillColor(fillColor) {
    this._text.style.fillColor = fillColor;
    return this.self();
  }
  textFillOpacity(fillOpacity) {
    this._text.style.fillOpacity = fillOpacity;
    return this.self();
  }
  textStrokeColor(strokeColor) {
    this._text.style.strokeColor = strokeColor;
    return this.self();
  }
  textStrokeOpacity(strokeOpacity) {
    this._text.style.strokeOpacity = strokeOpacity;
    return this.self();
  }
  textStrokeWidth(strokeWidth) {
    this._text.style.strokeWidth = strokeWidth;
    return this.self();
  }
  textLineHeight(lineHeight) {
    this._text.style.lineHeight = lineHeight;
    return this.self();
  }
  build() {
    return Object.assign(Object.assign({}, this._item), { type: "IMAGE", image: this._image, grid: this._grid, text: this._text, textItemType: this._textItemType });
  }
};

// ../node_modules/@owlbear-rodeo/sdk/lib/builders/ShapeBuilder.js
var ShapeBuilder = class extends GenericItemBuilder {
  constructor(player) {
    super(player);
    this._width = 0;
    this._height = 0;
    this._shapeType = "RECTANGLE";
    this._style = {
      fillColor: "black",
      fillOpacity: 1,
      strokeColor: "white",
      strokeOpacity: 1,
      strokeWidth: 5,
      strokeDash: []
    };
    this._item.layer = "DRAWING";
    this._item.name = "Shape";
  }
  width(width) {
    this._width = width;
    return this.self();
  }
  height(height) {
    this._height = height;
    return this.self();
  }
  shapeType(shapeType) {
    this._shapeType = shapeType;
    return this.self();
  }
  style(style) {
    this._style = style;
    return this.self();
  }
  fillColor(fillColor) {
    this._style.fillColor = fillColor;
    return this.self();
  }
  fillOpacity(fillOpacity) {
    this._style.fillOpacity = fillOpacity;
    return this.self();
  }
  strokeColor(strokeColor) {
    this._style.strokeColor = strokeColor;
    return this.self();
  }
  strokeOpacity(strokeOpacity) {
    this._style.strokeOpacity = strokeOpacity;
    return this.self();
  }
  strokeWidth(strokeWidth) {
    this._style.strokeWidth = strokeWidth;
    return this.self();
  }
  strokeDash(strokeDash) {
    this._style.strokeDash = strokeDash;
    return this.self();
  }
  build() {
    return Object.assign(Object.assign({}, this._item), { type: "SHAPE", width: this._width, height: this._height, shapeType: this._shapeType, style: this._style });
  }
};

// ../node_modules/@owlbear-rodeo/sdk/lib/builders/TextBuilder.js
var TextBuilder = class extends GenericItemBuilder {
  constructor(player) {
    super(player);
    this._text = {
      richText: [
        {
          type: "paragraph",
          children: [{ text: "" }]
        }
      ],
      plainText: "",
      style: {
        padding: 0,
        fontFamily: "Roboto",
        fontSize: 16,
        fontWeight: 400,
        textAlign: "LEFT",
        textAlignVertical: "TOP",
        fillColor: "white",
        fillOpacity: 1,
        strokeColor: "white",
        strokeOpacity: 1,
        strokeWidth: 0,
        lineHeight: 1.5
      },
      type: "RICH",
      width: "AUTO",
      height: "AUTO"
    };
    this._item.layer = "TEXT";
    this._item.name = "Text";
  }
  text(text) {
    this._text = text;
    return this.self();
  }
  width(width) {
    this._text.width = width;
    return this.self();
  }
  height(height) {
    this._text.height = height;
    return this.self();
  }
  richText(richText) {
    this._text.richText = richText;
    return this.self();
  }
  plainText(plainText) {
    this._text.plainText = plainText;
    return this.self();
  }
  textType(textType) {
    this._text.type = textType;
    return this.self();
  }
  padding(padding) {
    this._text.style.padding = padding;
    return this.self();
  }
  fontFamily(fontFamily) {
    this._text.style.fontFamily = fontFamily;
    return this.self();
  }
  fontSize(fontSize) {
    this._text.style.fontSize = fontSize;
    return this.self();
  }
  fontWeight(fontWeight) {
    this._text.style.fontWeight = fontWeight;
    return this.self();
  }
  textAlign(textAlign) {
    this._text.style.textAlign = textAlign;
    return this.self();
  }
  textAlignVertical(textAlignVertical) {
    this._text.style.textAlignVertical = textAlignVertical;
    return this.self();
  }
  fillColor(fillColor) {
    this._text.style.fillColor = fillColor;
    return this.self();
  }
  fillOpacity(fillOpacity) {
    this._text.style.fillOpacity = fillOpacity;
    return this.self();
  }
  strokeColor(strokeColor) {
    this._text.style.strokeColor = strokeColor;
    return this.self();
  }
  strokeOpacity(strokeOpacity) {
    this._text.style.strokeOpacity = strokeOpacity;
    return this.self();
  }
  strokeWidth(strokeWidth) {
    this._text.style.strokeWidth = strokeWidth;
    return this.self();
  }
  lineHeight(lineHeight) {
    this._text.style.lineHeight = lineHeight;
    return this.self();
  }
  build() {
    return Object.assign(Object.assign({}, this._item), { type: "TEXT", text: this._text });
  }
};

// ../node_modules/js-base64/base64.mjs
var _TD = typeof TextDecoder === "function" ? new TextDecoder("utf-8", { ignoreBOM: true }) : void 0;
var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var b64chs = Array.prototype.slice.call(b64ch);
var b64tab = ((a) => {
  let tab = {};
  a.forEach((c, i) => tab[c] = i);
  return tab;
})(b64chs);
var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
var _fromCC = String.fromCharCode.bind(String);
var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
var _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, "");
var btoaPolyfill = (bin) => {
  let u32, c0, c1, c2, asc = "";
  const pad = bin.length % 3;
  for (let i = 0; i < bin.length; ) {
    if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255)
      throw new TypeError("invalid character found");
    u32 = c0 << 16 | c1 << 8 | c2;
    asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
  }
  return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
var _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : btoaPolyfill;
var _fromUint8Array = typeof Uint8Array.prototype.toBase64 === "function" ? (u8a) => u8a.toBase64() : (u8a) => {
  const maxargs = 4096;
  let strs = [];
  for (let i = 0, l = u8a.length; i < l; i += maxargs) {
    strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
  }
  return _btoa(strs.join(""));
};
var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
var cb_btou = (cccc) => {
  switch (cccc.length) {
    case 4:
      var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
      return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
    case 3:
      return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
    default:
      return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
  }
};
var btou = (b) => b.replace(re_btou, cb_btou);
var atobPolyfill = (asc) => {
  asc = asc.replace(/\s+/g, "");
  if (!b64re.test(asc))
    throw new TypeError("malformed base64.");
  asc += "==".slice(2 - (asc.length & 3));
  let u24, r1, r2;
  let binArray = [];
  for (let i = 0; i < asc.length; ) {
    u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
    if (r1 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255));
    } else if (r2 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
    } else {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
    }
  }
  return binArray.join("");
};
var _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : atobPolyfill;
var _toUint8Array = typeof Uint8Array.fromBase64 === "function" ? (a) => Uint8Array.fromBase64(a) : (a) => _U8Afrom(_atob(a).split("").map((c) => c.charCodeAt(0)));
var _decode = _TD ? (a) => _TD.decode(_toUint8Array(a)) : (a) => btou(_atob(a));
var _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/"));
var decode = (src) => _decode(_unURI(src));

// ../node_modules/@owlbear-rodeo/sdk/lib/common/getDetails.js
function getDetails() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const ref = urlSearchParams.get("obrref");
  let origin = "";
  let roomId = "";
  if (ref) {
    const decodedRef = decode(ref);
    const parts = decodedRef.split(" ");
    if (parts.length === 2) {
      origin = parts[0];
      roomId = parts[1];
    }
  }
  return { origin, roomId };
}

// ../node_modules/@owlbear-rodeo/sdk/lib/types/items/Path.js
var Command;
(function(Command2) {
  Command2[Command2["MOVE"] = 0] = "MOVE";
  Command2[Command2["LINE"] = 1] = "LINE";
  Command2[Command2["QUAD"] = 2] = "QUAD";
  Command2[Command2["CONIC"] = 3] = "CONIC";
  Command2[Command2["CUBIC"] = 4] = "CUBIC";
  Command2[Command2["CLOSE"] = 5] = "CLOSE";
})(Command || (Command = {}));

// ../node_modules/@owlbear-rodeo/sdk/lib/index.js
var details = getDetails();
var messageBus = new MessageBus_default(details.origin, details.roomId);
var viewportApi = new ViewportApi_default(messageBus);
var playerApi = new PlayerApi_default(messageBus);
var partyApi = new PartyApi_default(messageBus);
var notificationApi = new NotificationApi_default(messageBus);
var sceneApi = new SceneApi_default(messageBus);
var contextMenuApi = new ContextMenuApi_default(messageBus);
var toolApi = new ToolApi_default(messageBus);
var popoverApi = new PopoverApi_default(messageBus);
var modalApi = new ModalApi_default(messageBus);
var actionApi = new ActionApi_default(messageBus);
var interactionApi = new InteractionApi_default(messageBus);
var roomApi = new RoomApi_default(messageBus);
var themeApi = new ThemeApi_default(messageBus);
var assetsApi = new AssetsApi_default(messageBus);
var broadcastApi = new BroadcastApi_default(messageBus);
var OBR = {
  onReady: (callback) => {
    if (messageBus.ready) {
      callback();
    } else {
      messageBus.once("OBR_READY", () => callback());
    }
  },
  get isReady() {
    return messageBus.ready;
  },
  viewport: viewportApi,
  player: playerApi,
  party: partyApi,
  notification: notificationApi,
  scene: sceneApi,
  contextMenu: contextMenuApi,
  tool: toolApi,
  popover: popoverApi,
  modal: modalApi,
  action: actionApi,
  interaction: interactionApi,
  room: roomApi,
  theme: themeApi,
  assets: assetsApi,
  broadcast: broadcastApi,
  /** True if the current site is embedded in an instance of Owlbear Rodeo */
  isAvailable: Boolean(details.origin)
};
function buildImage(image, grid) {
  return new ImageBuilder(playerApi, image, grid);
}
function buildShape() {
  return new ShapeBuilder(playerApi);
}
function buildText() {
  return new TextBuilder(playerApi);
}
var lib_default = OBR;

// src/overlays.ts
var CONDITION_ICONS = {
  "/screens/unconscious": "unconscious",
  "/screens/frightened": "frightened",
  "/screens/exhaustion": "exhaustion",
  "/screens/invisible": "invisible",
  "/screens/incapacitated": "incapacitated",
  "/screens/deafened": "deafened",
  "/screens/petrified": "petrified",
  "/screens/restrained": "restrained",
  "/screens/blinded": "blinded",
  "/screens/poisoned": "poisoned",
  "/screens/charmed": "charmed",
  "/screens/stunned": "stunned",
  "/screens/paralyzed": "paralyzed",
  "/screens/condition_prone": "prone",
  "/screens/grappled": "grappled"
};
var CONDITION_ORDER = Object.keys(CONDITION_ICONS);
function deriveMarkers(participant, round) {
  if (participant.isDead) {
    return [];
  }
  const markers = [];
  if (participant.hpCurrent > 0 && participant.hpMax > 0 && participant.hpCurrent < participant.hpMax / 2) {
    markers.push({ kind: "bloodied", icon: "bloodied" });
  }
  if (participant.isConcentrating) {
    markers.push({ kind: "concentration", icon: "concentration" });
  }
  const knownConditions = [];
  const unknownConditions = [];
  for (const condition of participant.conditions) {
    if (condition.expiresOnRound != null && condition.expiresOnRound <= round) continue;
    const marker = {
      kind: "condition",
      icon: CONDITION_ICONS[condition.url] ?? "condition",
      conditionUrl: condition.url,
      remainingRounds: condition.expiresOnRound == null ? void 0 : condition.expiresOnRound - round
    };
    if (CONDITION_ICONS[condition.url]) knownConditions.push(marker);
    else unknownConditions.push(marker);
  }
  knownConditions.sort((left, right) => CONDITION_ORDER.indexOf(left.conditionUrl) - CONDITION_ORDER.indexOf(right.conditionUrl));
  unknownConditions.sort((left, right) => left.conditionUrl.localeCompare(right.conditionUrl));
  return [...markers, ...knownConditions, ...unknownConditions];
}
function layoutMarkers(markers, diameter) {
  const iconSize = diameter * 0.2;
  const gap = diameter * 0.03;
  const inset = diameter * 0.04;
  const start = diameter / 2 - inset - iconSize / 2;
  return markers.map((marker, index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    return {
      marker,
      x: start - column * (iconSize + gap),
      y: -start + row * (iconSize + gap)
    };
  });
}

// src/tokenVisuals.ts
var MAX_VISUAL_SIZE = 512;
var TOKEN_VISUAL_VERSION = "3";
var NORMAL_VISUAL = { state: "normal", darkeningOpacity: 0, tokenOpacity: 1 };
var DOWN_VISUAL = { state: "down", darkeningOpacity: 0.5, tokenOpacity: 0.75 };
var DEAD_VISUAL = { state: "dead", darkeningOpacity: 0.8, tokenOpacity: 0.5 };
function getTokenVisualConfig(participant) {
  if (participant.isDead) return DEAD_VISUAL;
  if (participant.hpCurrent <= 0) return DOWN_VISUAL;
  return NORMAL_VISUAL;
}
function resolveTokenVisualImage(participant, image) {
  const visual = getTokenVisualConfig(participant);
  if (visual.state === "normal") return image;
  const scale = Math.min(1, MAX_VISUAL_SIZE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const url = new URL(image.url);
  url.searchParams.set("visual", visual.state);
  url.searchParams.set("visualVersion", TOKEN_VISUAL_VERSION);
  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  return {
    url: url.toString(),
    mime: "image/svg+xml",
    width,
    height
  };
}

// src/types.ts
var OWLBEAR_METADATA_NAMESPACE = "club.ttg.dnd-dm-tools";
var OWLBEAR_PARTICIPANT_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/participantId`;
var OWLBEAR_ENCOUNTER_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/encounterId`;
var OWLBEAR_SNAPSHOT_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/snapshotId`;
var OWLBEAR_MARKER_KIND_KEY = `${OWLBEAR_METADATA_NAMESPACE}/markerKind`;
var OWLBEAR_TOKEN_RING_KEY = `${OWLBEAR_METADATA_NAMESPACE}/tokenRing`;
var OWLBEAR_TURN_HIGHLIGHT_KEY = `${OWLBEAR_METADATA_NAMESPACE}/turnHighlight`;
var OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY = `${OWLBEAR_METADATA_NAMESPACE}/turnHighlightRole`;
var OWLBEAR_DEAD_OVERLAY_KEY = `${OWLBEAR_METADATA_NAMESPACE}/deadOverlay`;
var OWLBEAR_MARKER_LAYOUT_KEY = `${OWLBEAR_METADATA_NAMESPACE}/markerLayout`;
var OWLBEAR_PREVIEW_ID_KEY = `${OWLBEAR_METADATA_NAMESPACE}/previewId`;
var OWLBEAR_PREVIEW_KIND_KEY = `${OWLBEAR_METADATA_NAMESPACE}/previewKind`;
var OWLBEAR_PUBLIC_INITIATIVE_KEY = `${OWLBEAR_METADATA_NAMESPACE}/publicInitiative`;

// src/owlbearSync.ts
var DEFAULT_TOKEN_SIZE = 100;
var STATUS_ICON_SIZE = 100;
var TURN_HIGHLIGHT_Z_INDEX = -2;
var TOKEN_RING_Z_INDEX = 99;
var TOKEN_IMAGE_Z_INDEX = 100;
var MARKER_Z_INDEX = 2e12;
var MARKER_LAYOUT_VERSION = 12;
var LEGACY_TOKEN_LABEL_KEY = "club.ttg.dnd-dm-tools/tokenLabel";
async function pushSnapshotToScene(snapshot, previousSnapshot = null) {
  const assetBaseUrl = resolveAssetBaseUrl(snapshot.assetBaseUrl);
  const sceneReady = await lib_default.scene.isReady();
  if (!sceneReady) {
    return { diagnostics: createDiagnostics(snapshot, false, [], [], "No active Owlbear scene."), tokenLinks: [] };
  }
  const sceneItems = await lib_default.scene.items.getItems();
  const staleTokenIds = findStaleTokenIds(sceneItems, snapshot);
  if (staleTokenIds.length > 0) {
    const staleItems = await lib_default.scene.items.getItems(
      (item) => staleTokenIds.includes(item.id) || staleTokenIds.includes(item.attachedTo ?? "")
    );
    await lib_default.scene.items.deleteItems(staleItems.map((item) => item.id));
  }
  const currentSceneItems = staleTokenIds.length > 0 ? await lib_default.scene.items.getItems() : sceneItems;
  const linkedTokens = findLinkedTokens(currentSceneItems, snapshot);
  const retainedTokenIds = new Set([...linkedTokens.values()].map((item) => item.id));
  const duplicateTokenIds = currentSceneItems.filter((item) => isManagedToken(item, snapshot.encounterId)).filter((item) => !retainedTokenIds.has(item.id)).map((item) => item.id);
  if (duplicateTokenIds.length > 0) {
    const duplicateItems = await lib_default.scene.items.getItems(
      (item) => duplicateTokenIds.includes(item.id) || duplicateTokenIds.includes(item.attachedTo ?? "")
    );
    await lib_default.scene.items.deleteItems(duplicateItems.map((item) => item.id));
  }
  const legacyLabelIds = currentSceneItems.filter((item) => item.metadata?.[LEGACY_TOKEN_LABEL_KEY] === true).filter((item) => item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === snapshot.encounterId).map((item) => item.id);
  if (legacyLabelIds.length > 0) {
    await lib_default.scene.items.deleteItems(legacyLabelIds);
  }
  const previousParticipants = new Map(previousSnapshot?.participants.map((participant) => [participant.participantId, participant]));
  const images = /* @__PURE__ */ new Map();
  for (const participant of snapshot.participants) {
    const image = resolveImage(participant.imageUrl, participant.imageMime, participant.imageWidth, participant.imageHeight);
    if (!image) throw new Error(`\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D URL \u0438\u043B\u0438 MIME \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0442\u043E\u043A\u0435\u043D\u0430 \u0434\u043B\u044F \xAB${participant.name}\xBB.`);
    images.set(participant.participantId, resolveTokenVisualImage(participant, image));
  }
  const itemsToCreate = [];
  const markerIdsToDelete = /* @__PURE__ */ new Set();
  const tokenUpdates = /* @__PURE__ */ new Map();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const [viewportWidth, viewportHeight] = await Promise.all([lib_default.viewport.getWidth(), lib_default.viewport.getHeight()]);
  const center = await lib_default.viewport.inverseTransformPoint({ x: viewportWidth / 2, y: viewportHeight / 2 });
  const gridDpi = await lib_default.scene.grid.getDpi();
  const tokenSize = Number.isFinite(gridDpi) && gridDpi > 0 ? gridDpi : DEFAULT_TOKEN_SIZE;
  let createdIndex = 0;
  for (const participant of snapshot.participants) {
    const existing = linkedTokens.get(participant.participantId);
    const previousParticipant = previousParticipants.get(participant.participantId);
    const resolvedImage = images.get(participant.participantId);
    if (existing) {
      if (hasTokenVisualChange(participant, previousParticipant)) {
        tokenUpdates.set(existing.id, { participant, image: resolvedImage });
      }
      if (hasMarkerChange(participant, previousParticipant, snapshot.round, previousSnapshot?.round) || needsMarkerLayoutMigration(currentSceneItems, existing.id, snapshot.encounterId, participant, snapshot.round)) {
        const geometry = tokenGeometry(existing, tokenSize, gridDpi);
        queueMarkerReplacement(
          currentSceneItems,
          existing.id,
          participant,
          snapshot,
          geometry.center,
          geometry.diameter,
          gridDpi,
          assetBaseUrl,
          markerIdsToDelete,
          itemsToCreate
        );
      }
    } else {
      const position = clusterPosition(center, createdIndex, snapshot.participants.length, tokenSize);
      createdIndex += 1;
      itemsToCreate.push(...buildTokenItems(participant, snapshot, position, tokenSize, gridDpi, resolvedImage, assetBaseUrl));
    }
  }
  if (markerIdsToDelete.size > 0) {
    await lib_default.scene.items.deleteItems([...markerIdsToDelete]);
  }
  await updateImageTokens(currentSceneItems, linkedTokens, tokenUpdates, snapshot, tokenSize, itemsToCreate);
  if (itemsToCreate.length > 0) {
    await lib_default.scene.items.addItems(itemsToCreate);
  }
  const refreshedItems = await lib_default.scene.items.getItems();
  await reconcileTurnHighlights(snapshot, refreshedItems, tokenSize, gridDpi);
  await focusActiveParticipant(snapshot, previousSnapshot, refreshedItems);
  const diagnostics = createDiagnostics(snapshot, true, refreshedItems, findLinkedTokens(refreshedItems, snapshot), void 0, now);
  return { diagnostics, tokenLinks: createTokenLinks(refreshedItems, snapshot, now) };
}
async function focusActiveParticipant(snapshot, previousSnapshot, items) {
  if (snapshot.activeParticipantId == null || snapshot.activeParticipantId === previousSnapshot?.activeParticipantId) return;
  const token = findLinkedTokens(items, snapshot).get(snapshot.activeParticipantId);
  if (!token?.position) return;
  try {
    const [viewportPosition, scale, viewportWidth, viewportHeight] = await Promise.all([
      lib_default.viewport.getPosition(),
      lib_default.viewport.getScale(),
      lib_default.viewport.getWidth(),
      lib_default.viewport.getHeight()
    ]);
    const viewportCenter = await lib_default.viewport.inverseTransformPoint({ x: viewportWidth / 2, y: viewportHeight / 2 });
    await lib_default.viewport.animateTo({
      position: {
        x: viewportPosition.x + viewportCenter.x - token.position.x,
        y: viewportPosition.y + viewportCenter.y - token.position.y
      },
      scale
    });
  } catch {
  }
}
async function clearManagedSceneItems() {
  if (!await lib_default.scene.isReady()) return;
  const items = await lib_default.scene.items.getItems();
  const managedIds = items.filter((item) => Object.keys(item.metadata ?? {}).some((key) => key.startsWith(`${OWLBEAR_METADATA_NAMESPACE}/`))).map((item) => item.id);
  if (managedIds.length > 0) await lib_default.scene.items.deleteItems(managedIds);
}
function hasTokenVisualChange(participant, previous) {
  return !previous || participant.name !== previous.name || participant.imageUrl !== previous.imageUrl || participant.imageMime !== previous.imageMime || participant.imageWidth !== previous.imageWidth || participant.imageHeight !== previous.imageHeight || participant.colorHex !== previous.colorHex || participant.hpCurrent !== previous.hpCurrent || participant.isDead !== previous.isDead;
}
function hasMarkerChange(participant, previous, round, previousRound) {
  if (!previous || previousRound == null) return true;
  return JSON.stringify(deriveMarkers(participant, round)) !== JSON.stringify(deriveMarkers(previous, previousRound));
}
function needsMarkerLayoutMigration(items, tokenId, encounterId, participant, round) {
  const expectedMarkers = deriveMarkers(participant, round);
  const statusItems = items.filter(
    (item) => item.attachedTo === tokenId && item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === encounterId && (Boolean(item.metadata?.[OWLBEAR_MARKER_KIND_KEY]) || item.metadata?.[OWLBEAR_DEAD_OVERLAY_KEY] === true)
  );
  if (statusItems.some((item) => item.metadata?.[OWLBEAR_MARKER_KIND_KEY] === "dead" || item.metadata?.[OWLBEAR_MARKER_KIND_KEY] === "down" || item.metadata?.[OWLBEAR_DEAD_OVERLAY_KEY] === true)) return true;
  if (expectedMarkers.length > 0 && statusItems.length === 0) return true;
  return statusItems.some((item) => item.metadata?.[OWLBEAR_MARKER_LAYOUT_KEY] !== MARKER_LAYOUT_VERSION);
}
function createTokenLinks(items, snapshot, lastSeenAt) {
  return [...findLinkedTokens(items, snapshot).entries()].map(([participantId, item]) => ({
    participantId,
    owlbearItemId: item.id,
    position: item.position,
    lastSeenAt
  }));
}
function findLinkedTokens(items, snapshot) {
  const linked = /* @__PURE__ */ new Map();
  const participantIds = new Set(snapshot.participants.map((participant) => participant.participantId));
  const itemsById = new Map(items.map((item) => [item.id, item]));
  for (const link of snapshot.tokenLinks) {
    const item = itemsById.get(link.owlbearItemId);
    if (item && isManagedToken(item, snapshot.encounterId) && participantIds.has(link.participantId)) {
      linked.set(link.participantId, item);
    }
  }
  for (const item of items) {
    const metadata = item.metadata ?? {};
    if (!isManagedToken(item, snapshot.encounterId)) continue;
    const participantId = metadata[OWLBEAR_PARTICIPANT_ID_KEY];
    if (typeof participantId !== "number" || !participantIds.has(participantId) || linked.has(participantId)) continue;
    linked.set(participantId, item);
  }
  for (const item of items) {
    if (item.type !== "IMAGE" || linked.size === participantIds.size) break;
    const metadata = item.metadata ?? {};
    if (!isManagedToken(item, snapshot.encounterId)) continue;
    const participantId = metadata[OWLBEAR_PARTICIPANT_ID_KEY];
    if (typeof participantId !== "number" || !participantIds.has(participantId) || linked.has(participantId)) continue;
    linked.set(participantId, item);
  }
  return linked;
}
function isManagedToken(item, encounterId) {
  const metadata = item.metadata ?? {};
  return item.type === "IMAGE" && item.attachedTo == null && metadata[OWLBEAR_ENCOUNTER_ID_KEY] === encounterId && metadata[OWLBEAR_PARTICIPANT_ID_KEY] != null && !metadata[OWLBEAR_MARKER_KIND_KEY] && metadata[OWLBEAR_DEAD_OVERLAY_KEY] !== true && metadata[OWLBEAR_TOKEN_RING_KEY] !== true && metadata[OWLBEAR_TURN_HIGHLIGHT_KEY] !== true;
}
function tokenGeometry(item, defaultDiameter, gridDpi) {
  const scale = item.scale ? Math.max(Math.abs(item.scale.x), Math.abs(item.scale.y)) : 1;
  return {
    center: item.position ?? { x: 0, y: 0 },
    diameter: defaultDiameter * scale
  };
}
function findStaleTokenIds(items, snapshot) {
  const participantIds = new Set(snapshot.participants.map((participant) => participant.participantId));
  return items.filter((item) => isManagedToken(item, snapshot.encounterId)).filter((item) => {
    const participantId = item.metadata?.[OWLBEAR_PARTICIPANT_ID_KEY];
    return typeof participantId === "number" && !participantIds.has(participantId);
  }).map((item) => item.id);
}
async function updateImageTokens(items, linkedTokens, updates, snapshot, tokenSize, itemsToCreate) {
  if (updates.size > 0) {
    const tokens = items.filter((item) => updates.has(item.id));
    await lib_default.scene.items.updateItems(tokens, (drafts) => {
      for (const draft of drafts) {
        const update = updates.get(draft.id);
        if (!update) continue;
        const { participant, image } = update;
        draft.name = participant.name;
        draft.zIndex = TOKEN_IMAGE_Z_INDEX;
        draft.disableAutoZIndex = true;
        draft.metadata = tokenMetadata(participant, snapshot);
        draft.text = { ...draft.text, plainText: participant.name, type: "PLAIN" };
        draft.textItemType = "LABEL";
        if (draft.image?.url !== image.url) {
          draft.image = {
            ...draft.image,
            url: image.url,
            mime: image.mime,
            width: image.width,
            height: image.height
          };
          draft.grid = {
            dpi: Math.max(image.width, image.height),
            offset: { x: image.width / 2, y: image.height / 2 }
          };
        }
      }
    });
  }
  const participantsByTokenId = /* @__PURE__ */ new Map();
  for (const participant of snapshot.participants) {
    const token = linkedTokens.get(participant.participantId);
    if (token) participantsByTokenId.set(token.id, participant);
  }
  const rings = items.filter((item) => item.metadata?.[OWLBEAR_TOKEN_RING_KEY] === true && item.attachedTo && participantsByTokenId.has(item.attachedTo));
  const ringTokenIds = new Set(rings.map((ring) => ring.attachedTo));
  const ringsToUpdate = rings.filter((ring) => ring.attachedTo && updates.has(ring.attachedTo));
  if (ringsToUpdate.length > 0) {
    await lib_default.scene.items.updateItems(ringsToUpdate, (drafts) => {
      for (const draft of drafts) {
        const participant = participantsByTokenId.get(draft.attachedTo);
        if (!participant) continue;
        draft.width = tokenSize;
        draft.height = tokenSize;
        draft.layer = "CHARACTER";
        draft.zIndex = TOKEN_RING_Z_INDEX;
        draft.disableAutoZIndex = true;
        if (draft.style) {
          draft.style.strokeColor = participantColor(participant);
        }
      }
    });
  }
  for (const [participantId, token] of linkedTokens) {
    if (ringTokenIds.has(token.id)) continue;
    const participant = snapshot.participants.find((candidate) => candidate.participantId === participantId);
    if (!participant) continue;
    itemsToCreate.push(buildTokenRing(participant, snapshot, token.position ?? { x: 0, y: 0 }, token.id, tokenSize));
  }
}
function queueMarkerReplacement(items, tokenId, participant, snapshot, center, diameter, gridDpi, assetBaseUrl, markerIdsToDelete, itemsToCreate) {
  const overlays = items.filter(
    (item) => item.attachedTo === tokenId && item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === snapshot.encounterId && (Boolean(item.metadata?.[OWLBEAR_MARKER_KIND_KEY]) || item.metadata?.[OWLBEAR_DEAD_OVERLAY_KEY] === true)
  );
  for (const overlay of overlays) markerIdsToDelete.add(overlay.id);
  itemsToCreate.push(...buildMarkerItems(tokenId, participant, snapshot, center, diameter, gridDpi, assetBaseUrl));
}
function buildTokenItems(participant, snapshot, position, tokenSize, gridDpi, image, assetBaseUrl) {
  const token = buildTokenImage(participant, snapshot, position, tokenSize, image);
  return [
    token,
    buildTokenRing(participant, snapshot, position, token.id, tokenSize),
    ...buildTurnHighlight(token.id, participant, snapshot, position, tokenSize),
    ...buildMarkerItems(token.id, participant, snapshot, position, tokenSize, gridDpi, assetBaseUrl)
  ];
}
function buildTokenImage(participant, snapshot, position, tokenSize, image) {
  return buildImage(
    {
      width: image.width,
      height: image.height,
      mime: image.mime,
      url: image.url
    },
    { dpi: Math.max(image.width, image.height), offset: { x: image.width / 2, y: image.height / 2 } }
  ).name(participant.name).plainText(participant.name).textItemType("LABEL").position(position).layer("CHARACTER").zIndex(TOKEN_IMAGE_Z_INDEX).disableAutoZIndex(true).metadata(tokenMetadata(participant, snapshot)).build();
}
function buildTokenRing(participant, snapshot, position, tokenId, tokenSize) {
  return buildShape().shapeType("CIRCLE").width(tokenSize).height(tokenSize).layer("CHARACTER").zIndex(TOKEN_RING_Z_INDEX).disableAutoZIndex(true).position(position).attachedTo(tokenId).locked(true).disableHit(true).metadata({ ...tokenMetadata(participant, snapshot), [OWLBEAR_TOKEN_RING_KEY]: true }).style({
    fillColor: "#ffffff",
    fillOpacity: 0,
    strokeColor: participantColor(participant),
    strokeOpacity: 1,
    strokeWidth: 5,
    strokeDash: []
  }).build();
}
async function reconcileTurnHighlights(snapshot, items, defaultDiameter, gridDpi) {
  const linkedTokens = findLinkedTokens(items, snapshot);
  const linkedTokenIds = new Set([...linkedTokens.values()].map((item) => item.id));
  const highlights = items.filter(
    (item) => item.metadata?.[OWLBEAR_ENCOUNTER_ID_KEY] === snapshot.encounterId && item.metadata?.[OWLBEAR_TURN_HIGHLIGHT_KEY] === true
  );
  const highlightsByTokenId = /* @__PURE__ */ new Map();
  const idsToDelete = /* @__PURE__ */ new Set();
  const itemsToAdd = [];
  for (const highlight of highlights) {
    if (!highlight.attachedTo || !linkedTokenIds.has(highlight.attachedTo)) {
      idsToDelete.add(highlight.id);
      continue;
    }
    const tokenHighlights = highlightsByTokenId.get(highlight.attachedTo) ?? [];
    tokenHighlights.push(highlight);
    highlightsByTokenId.set(highlight.attachedTo, tokenHighlights);
  }
  for (const participant of snapshot.participants) {
    const token = linkedTokens.get(participant.participantId);
    if (!token) continue;
    const expectedRole = getTurnHighlightRole(participant.participantId, snapshot);
    const tokenHighlights = highlightsByTokenId.get(token.id) ?? [];
    if (expectedRole === null) {
      for (const highlight of tokenHighlights) idsToDelete.add(highlight.id);
      continue;
    }
    if (tokenHighlights.length === 1 && tokenHighlights[0].metadata?.[OWLBEAR_PARTICIPANT_ID_KEY] === participant.participantId && tokenHighlights[0].metadata?.[OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY] === expectedRole) {
      continue;
    }
    for (const highlight of tokenHighlights) idsToDelete.add(highlight.id);
    const geometry = tokenGeometry(token, defaultDiameter, gridDpi);
    itemsToAdd.push(...buildTurnHighlight(token.id, participant, snapshot, geometry.center, geometry.diameter));
  }
  if (idsToDelete.size > 0) await lib_default.scene.items.deleteItems([...idsToDelete]);
  if (itemsToAdd.length > 0) await lib_default.scene.items.addItems(itemsToAdd);
}
function buildTurnHighlight(tokenId, participant, snapshot, position, diameter) {
  const role = getTurnHighlightRole(participant.participantId, snapshot);
  if (role === null) return [];
  const isActive = role === "active";
  const metadata = {
    ...tokenMetadata(participant, snapshot),
    [OWLBEAR_TURN_HIGHLIGHT_KEY]: true,
    [OWLBEAR_TURN_HIGHLIGHT_ROLE_KEY]: role
  };
  return [buildShape().shapeType("CIRCLE").width(diameter + (isActive ? 32 : 20)).height(diameter + (isActive ? 32 : 20)).position(position).attachedTo(tokenId).layer("CHARACTER").zIndex(TURN_HIGHLIGHT_Z_INDEX).disableAutoZIndex(true).locked(true).disableHit(true).metadata(metadata).style({
    fillColor: "#000000",
    fillOpacity: 0,
    strokeColor: isActive ? "#fbbf24" : "#15803d",
    strokeOpacity: 1,
    strokeWidth: isActive ? 16 : 6,
    strokeDash: []
  }).build()];
}
function getTurnHighlightRole(participantId, snapshot) {
  if (snapshot.activeParticipantId === participantId) return "active";
  if (snapshot.nextParticipantId === participantId) return "next";
  return null;
}
function buildMarkerItems(tokenId, participant, snapshot, center, diameter, gridDpi, assetBaseUrl) {
  const iconSize = diameter * 0.2;
  const effectiveGridDpi = Number.isFinite(gridDpi) && gridDpi > 0 ? gridDpi : DEFAULT_TOKEN_SIZE;
  const imageSize = Math.max(1, iconSize * 0.65);
  const iconDpi = STATUS_ICON_SIZE * effectiveGridDpi / imageSize;
  return layoutMarkers(deriveMarkers(participant, snapshot.round), diameter).flatMap(({ marker, x, y }, index) => {
    const position = { x: center.x + x, y: center.y + y };
    const metadata = {
      ...tokenMetadata(participant, snapshot),
      [OWLBEAR_MARKER_KIND_KEY]: marker.kind,
      [OWLBEAR_MARKER_LAYOUT_KEY]: MARKER_LAYOUT_VERSION
    };
    const zIndex = MARKER_Z_INDEX + index * 10;
    const background = buildShape().shapeType("CIRCLE").width(iconSize).height(iconSize).position(position).attachedTo(tokenId).layer("ATTACHMENT").zIndex(zIndex).disableAutoZIndex(true).locked(true).disableHit(true).metadata(metadata).style({ fillColor: "#111827", fillOpacity: 0.86, strokeColor: "#f8fafc", strokeOpacity: 0.9, strokeWidth: Math.max(1, diameter * 0.015), strokeDash: [] }).build();
    const icon = buildImage(
      { width: STATUS_ICON_SIZE, height: STATUS_ICON_SIZE, mime: "image/svg+xml", url: statusIconUrl(marker.icon, assetBaseUrl) },
      { dpi: iconDpi, offset: { x: STATUS_ICON_SIZE / 2, y: STATUS_ICON_SIZE / 2 } }
    ).name(`${participant.name} ${marker.kind}`).position(position).attachedTo(tokenId).layer("ATTACHMENT").zIndex(zIndex + 1).disableAutoZIndex(true).locked(true).disableHit(true).metadata(metadata).build();
    if (marker.remainingRounds == null) return [background, icon];
    const badgeSize = Math.max(10, iconSize * 0.55);
    const badgePosition = getConditionBadgePosition(position, iconSize);
    const badgeTextPosition = getConditionBadgeTextPosition(badgePosition, badgeSize);
    const badge = buildShape().shapeType("CIRCLE").width(badgeSize).height(badgeSize).position(badgePosition).attachedTo(tokenId).layer("ATTACHMENT").zIndex(zIndex + 2).disableAutoZIndex(true).locked(true).disableHit(true).metadata(metadata).style({ fillColor: "#2563eb", fillOpacity: 1, strokeColor: "#eff6ff", strokeOpacity: 1, strokeWidth: 1, strokeDash: [] }).build();
    const text = String(marker.remainingRounds);
    const badgeText = buildText().plainText(text).textType("PLAIN").width(badgeSize).height(badgeSize).padding(0).fontSize(text.length > 2 ? 8 : 10).fontWeight(700).fillColor("#ffffff").textAlign("CENTER").textAlignVertical("MIDDLE").position(badgeTextPosition).attachedTo(tokenId).layer("ATTACHMENT").zIndex(zIndex + 3).disableAutoZIndex(true).locked(true).disableHit(true).metadata(metadata).build();
    return [background, icon, badge, badgeText];
  });
}
function getConditionBadgePosition(position, iconSize) {
  return { x: position.x + iconSize * 0.36, y: position.y + iconSize * 0.36 };
}
function getConditionBadgeTextPosition(position, badgeSize) {
  return { x: position.x - badgeSize / 2, y: position.y - badgeSize / 2 };
}
function statusIconUrl(icon, assetBaseUrl) {
  return `${assetBaseUrl}/status-icons/${icon}.svg`;
}
function resolveAssetBaseUrl(value) {
  if (!value) throw new Error("\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D \u043F\u0443\u0431\u043B\u0438\u0447\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432 Owlbear.");
  const url = new URL(value);
  if (url.protocol !== "https:" || !/\.trycloudflare\.com$/i.test(url.hostname)) throw new Error("\u041F\u043E\u043B\u0443\u0447\u0435\u043D \u043D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0439 \u043F\u0443\u0431\u043B\u0438\u0447\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432 Owlbear.");
  return url.toString().replace(/\/$/, "");
}
function tokenMetadata(participant, snapshot) {
  return {
    [OWLBEAR_PARTICIPANT_ID_KEY]: participant.participantId,
    [OWLBEAR_ENCOUNTER_ID_KEY]: snapshot.encounterId,
    [OWLBEAR_SNAPSHOT_ID_KEY]: snapshot.snapshotId
  };
}
function createDiagnostics(snapshot, sceneReady, items, linkedTokens, lastError2, lastSyncAt) {
  const linked = Array.isArray(linkedTokens) ? /* @__PURE__ */ new Map() : linkedTokens;
  const participantIds = new Set(snapshot.participants.map((participant) => participant.participantId));
  const staleTokenIds = findStaleTokenIds(items, snapshot);
  const missingParticipantIds = snapshot.participants.filter((participant) => !linked.has(participant.participantId)).map((participant) => participant.participantId);
  return {
    sceneReady,
    snapshotLoaded: true,
    linkedCount: linked.size,
    participantCount: snapshot.participants.length,
    staleTokenIds,
    missingParticipantIds,
    fallbackParticipantIds: snapshot.participants.filter((participant) => participant.imageFallback).map((participant) => participant.participantId),
    lastSyncAt,
    lastError: lastError2
  };
}
function clusterPosition(center, index, total, tokenSize) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(total)));
  const row = Math.floor(index / columns);
  const column = index % columns;
  const rows = Math.ceil(total / columns);
  return {
    x: center.x + (column - (columns - 1) / 2) * tokenSize * 1.15,
    y: center.y + (row - (rows - 1) / 2) * tokenSize * 1.15
  };
}
function participantColor(participant) {
  return participant.colorHex ?? "#94a3b8";
}
function resolveImage(url, mime, width, height) {
  if (!url || !mime || !mime.startsWith("image/") || !isImageDimension(width) || !isImageDimension(height)) return null;
  return /^https:\/\//i.test(url) ? { url, mime, width, height } : null;
}
function isImageDimension(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

// src/previewSync.ts
var PREVIEW_Z_INDEX = 9e5;
async function pushPreviewToScene(preview) {
  if (!await lib_default.scene.isReady()) throw new Error("No active Owlbear scene.");
  if (!preview.imageUrl) throw new Error("\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D URL \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u043F\u0440\u0435\u0432\u044C\u044E.");
  const [topLeft, bottomRight, gridDpi] = await Promise.all([
    lib_default.viewport.inverseTransformPoint({ x: 0, y: 0 }),
    Promise.all([lib_default.viewport.getWidth(), lib_default.viewport.getHeight()]).then(([width, height]) => lib_default.viewport.inverseTransformPoint({ x: width, y: height })),
    lib_default.scene.grid.getDpi()
  ]);
  const viewportWidth = Math.abs(bottomRight.x - topLeft.x);
  const viewportHeight = Math.abs(bottomRight.y - topLeft.y);
  if (!(viewportWidth > 0 && viewportHeight > 0 && gridDpi > 0)) throw new Error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u0440\u0430\u0437\u043C\u0435\u0440 viewport Owlbear.");
  const viewportOrigin = {
    x: Math.min(topLeft.x, bottomRight.x),
    y: Math.min(topLeft.y, bottomRight.y)
  };
  const center = { x: (topLeft.x + bottomRight.x) / 2, y: (topLeft.y + bottomRight.y) / 2 };
  const imageAspect = preview.imageWidth / preview.imageHeight;
  const maxWidth = viewportWidth * 0.9;
  const maxHeight = viewportHeight * 0.9;
  const targetWidth = Math.min(maxWidth, maxHeight * imageAspect);
  const imageDpi = Math.max(preview.imageWidth, preview.imageHeight);
  const baseWidth = preview.imageWidth * gridDpi / imageDpi;
  const scale = targetWidth / baseWidth;
  const metadata = {
    [OWLBEAR_PREVIEW_ID_KEY]: preview.previewId
  };
  const backdrop = buildShape().name("DnD DM Tools preview backdrop").shapeType("RECTANGLE").width(viewportWidth).height(viewportHeight).position(viewportOrigin).layer("POPOVER").zIndex(PREVIEW_Z_INDEX).disableAutoZIndex(true).locked(true).disableHit(true).metadata({ ...metadata, [OWLBEAR_PREVIEW_KIND_KEY]: "backdrop" }).style({ fillColor: "#000000", fillOpacity: 0.84, strokeColor: "#000000", strokeOpacity: 0, strokeWidth: 0, strokeDash: [] }).build();
  const image = buildImage(
    { width: preview.imageWidth, height: preview.imageHeight, mime: preview.imageMime, url: preview.imageUrl },
    { dpi: imageDpi, offset: { x: preview.imageWidth / 2, y: preview.imageHeight / 2 } }
  ).name(preview.name).position(center).scale({ x: scale, y: scale }).layer("POPOVER").zIndex(PREVIEW_Z_INDEX + 1).disableAutoZIndex(true).locked(true).disableHit(true).metadata({ ...metadata, [OWLBEAR_PREVIEW_KIND_KEY]: "image" }).build();
  await lib_default.scene.items.addItems([backdrop, image]);
  await deleteManagedPreviews(preview.previewId);
}
async function clearPreviewFromScene() {
  if (!await lib_default.scene.isReady()) return;
  await deleteManagedPreviews();
}
async function deleteManagedPreviews(exceptPreviewId) {
  const items = await lib_default.scene.items.getItems((item) => {
    const previewId = item.metadata?.[OWLBEAR_PREVIEW_ID_KEY];
    return typeof previewId === "string" && (item.metadata?.[OWLBEAR_PREVIEW_KIND_KEY] === "backdrop" || item.metadata?.[OWLBEAR_PREVIEW_KIND_KEY] === "image") && previewId !== exceptPreviewId;
  });
  if (items.length > 0) await lib_default.scene.items.deleteItems(items.map((item) => item.id));
}

// src/publicInitiative.ts
var PUBLIC_INITIATIVE_SCHEMA_VERSION = 1;
var DEFAULT_PARTICIPANT_COLOR = "#94a3b8";
function createPublicInitiativeState(snapshot) {
  return {
    schemaVersion: PUBLIC_INITIATIVE_SCHEMA_VERSION,
    round: snapshot.round,
    participants: snapshot.participants.map((participant) => ({
      name: participant.name,
      color: participant.colorHex ?? DEFAULT_PARTICIPANT_COLOR,
      portraitUrl: publicPortraitUrl(participant.imageUrl),
      initiative: participant.initiative,
      isActive: participant.participantId === snapshot.activeParticipantId,
      statuses: publicStatuses(participant, snapshot.round)
    }))
  };
}
async function publishPublicInitiative(snapshot) {
  await lib_default.scene.setMetadata({ [OWLBEAR_PUBLIC_INITIATIVE_KEY]: createPublicInitiativeState(snapshot) });
}
async function clearPublicInitiative() {
  if (!await lib_default.scene.isReady()) return;
  await lib_default.scene.setMetadata({ [OWLBEAR_PUBLIC_INITIATIVE_KEY]: null });
}
function publicStatuses(participant, round) {
  if (participant.isDead) return [{ kind: "dead", icon: "dead" }];
  const statuses = [];
  if (participant.hpCurrent <= 0) statuses.push({ kind: "down", icon: "down" });
  for (const marker of deriveMarkers(participant, round)) {
    statuses.push({
      kind: marker.kind,
      icon: marker.icon,
      ...marker.remainingRounds == null ? {} : { remainingRounds: marker.remainingRounds }
    });
  }
  return statuses;
}
function publicPortraitUrl(value) {
  return value && /^https:\/\//i.test(value) ? value : void 0;
}

// src/state.ts
function createInitialDiagnostics() {
  return {
    sceneReady: false,
    snapshotLoaded: false,
    linkedCount: 0,
    participantCount: 0,
    staleTokenIds: [],
    missingParticipantIds: [],
    fallbackParticipantIds: []
  };
}
var state = {
  snapshot: null,
  diagnostics: createInitialDiagnostics()
};

// src/protocol.ts
var PROTOCOL_VERSION = 2;
var AUTH_ERROR_CLOSE_CODE = 4001;
var PROTOCOL_ERROR_CLOSE_CODE = 4002;
var PAIRING_KEY = "dnd-dm-tools.owlbear.pairing";
var MANUAL_DISCONNECT_KEY = "dnd-dm-tools.owlbear.manual-disconnect";
var RUNTIME_CHANNEL_NAME = "dnd-dm-tools.owlbear.runtime";

// src/pairing.ts
var TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,}$/;
var QUICK_TUNNEL_HOST_PATTERN = /^[a-z0-9-]+\.trycloudflare\.com$/i;
function parsePairingCode(value) {
  const publicMatch = /^dnd-dm-tools:v2:([^:]+):([A-Za-z0-9_-]{32}):([A-Za-z0-9_-]{32,})$/.exec(value);
  if (publicMatch) {
    const [, host, pathSecret, token] = publicMatch;
    if (!QUICK_TUNNEL_HOST_PATTERN.test(host) || !TOKEN_PATTERN.test(token)) return null;
    return {
      version: 2,
      websocketUrl: `wss://${host.toLowerCase()}/assets/${pathSecret}/ws`,
      token
    };
  }
  const localMatch = /^dnd-dm-tools:v1:(\d{4,5}):([A-Za-z0-9_-]{32,})$/.exec(value);
  if (!localMatch) return null;
  const port = Number(localMatch[1]);
  if (port < 1024 || port > 65535 || !TOKEN_PATTERN.test(localMatch[2])) return null;
  return {
    version: 1,
    websocketUrl: `ws://localhost:${port}/ws`,
    token: localMatch[2]
  };
}

// src/background.ts
var APPLY_QUEUE_EMPTY = Symbol("empty");
var MAX_AUTOMATIC_RECONNECT_ATTEMPTS = 3;
var channel = new BroadcastChannel(RUNTIME_CHANNEL_NAME);
var socket = null;
var reconnectTimer = null;
var reconnectAttempts = 0;
var manuallyDisconnected = localStorage.getItem(MANUAL_DISCONNECT_KEY) === "true";
var connectionState = localStorage.getItem(PAIRING_KEY) ? "disconnected" : "unauthorized";
var lastError;
var activePairing = null;
var actionPending = false;
var applying = false;
var pendingSnapshot = APPLY_QUEUE_EMPTY;
var readyResolve = null;
var readyPromise = new Promise((resolve) => {
  readyResolve = resolve;
});
channel.addEventListener("message", (event) => void handleRuntimeMessage(event.data));
window.addEventListener("storage", (event) => {
  if (event.key === MANUAL_DISCONNECT_KEY) manuallyDisconnected = event.newValue === "true";
});
function postState() {
  const runtimeState = {
    connectionState,
    diagnostics: state.diagnostics,
    lastError: lastError ?? state.diagnostics.lastError,
    actionPending,
    snapshotAvailable: state.snapshot !== null
  };
  channel.postMessage({ type: "runtime.state", state: runtimeState });
}
async function handleRuntimeMessage(message) {
  if (!message || typeof message !== "object") return;
  if (message.type === "ui.request") {
    postState();
    return;
  }
  if (message.type !== "ui.command") return;
  if (message.command === "connect") {
    await connect(message.pairingCode ?? localStorage.getItem(PAIRING_KEY) ?? "", true);
    return;
  }
  if (message.command === "disconnect") {
    await disconnect();
    return;
  }
  await runAction(reconnectSceneItems);
}
async function connect(pairingCode, resetAttempts) {
  const pairing = parsePairingCode(pairingCode);
  if (!pairing) {
    connectionState = "auth-error";
    lastError = "\u0421\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u043A\u043E\u0434 \u0441\u043E\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u044F \u0438\u0437 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A DnD DM Tools.";
    postState();
    return;
  }
  if (resetAttempts) reconnectAttempts = 0;
  localStorage.setItem(PAIRING_KEY, pairingCode);
  localStorage.removeItem(MANUAL_DISCONNECT_KEY);
  manuallyDisconnected = false;
  cancelReconnect();
  closeCurrentSocket();
  activePairing = pairing;
  connectionState = "connecting";
  lastError = void 0;
  postState();
  const nextSocket = new WebSocket(pairing.websocketUrl);
  socket = nextSocket;
  nextSocket.onopen = () => send({ type: "client.hello", token: pairing.token });
  nextSocket.onmessage = (event) => void onSocketMessage(event.data);
  nextSocket.onerror = () => {
    if (socket !== nextSocket) return;
    lastError = pairing.version === 2 ? "\u0421\u0435\u0441\u0441\u0438\u044F Obsidian \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430. \u041F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A\u0430 Obsidian \u0438\u043B\u0438 \u0442\u0443\u043D\u043D\u0435\u043B\u044F \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043A\u043E\u0434 \u0441\u043E\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u044F." : "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u0434 v1 \u043C\u043E\u0436\u0435\u0442 \u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043E\u043C. \u0421\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043A\u043E\u0434 \u0441\u043E\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u044F \u0438\u0437 DnD DM Tools.";
    postState();
  };
  nextSocket.onclose = (event) => handleSocketClose(nextSocket, event);
}
async function disconnect() {
  manuallyDisconnected = true;
  localStorage.setItem(MANUAL_DISCONNECT_KEY, "true");
  reconnectAttempts = 0;
  cancelReconnect();
  let cleanupError;
  try {
    cleanupError = await clearManagedScene() ?? void 0;
  } catch (error) {
    cleanupError = formatError(error);
  } finally {
    closeCurrentSocket(false);
    connectionState = localStorage.getItem(PAIRING_KEY) ? "disconnected" : "unauthorized";
    lastError = cleanupError;
    postState();
  }
}
function handleSocketClose(closedSocket, event) {
  if (socket !== closedSocket) return;
  socket = null;
  void clearPreview(void 0);
  if (event.code === AUTH_ERROR_CLOSE_CODE) {
    connectionState = "auth-error";
    lastError = event.reason || "\u041F\u043B\u0430\u0433\u0438\u043D \u043E\u0442\u043A\u043B\u043E\u043D\u0438\u043B \u043A\u043E\u0434 \u0441\u043E\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u044F.";
    postState();
    return;
  }
  if (event.code === PROTOCOL_ERROR_CLOSE_CODE) {
    connectionState = "disconnected";
    lastError = event.reason || "\u041D\u0435\u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F \u043F\u0440\u043E\u0442\u043E\u043A\u043E\u043B\u0430 DnD DM Tools.";
    postState();
    return;
  }
  connectionState = localStorage.getItem(PAIRING_KEY) ? "disconnected" : "unauthorized";
  if (!lastError && event.code !== 1e3) {
    lastError = activePairing?.version === 2 ? "\u0421\u0435\u0441\u0441\u0438\u044F Obsidian \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u043B\u0430\u0441\u044C. \u0421\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043A\u043E\u0434 \u0441\u043E\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u044F \u0438\u0437 DnD DM Tools." : "\u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0441 Obsidian \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u043E.";
  }
  postState();
  if (!manuallyDisconnected && localStorage.getItem(PAIRING_KEY) && reconnectAttempts < MAX_AUTOMATIC_RECONNECT_ATTEMPTS) {
    reconnectAttempts += 1;
    reconnectTimer = window.setTimeout(() => void connect(localStorage.getItem(PAIRING_KEY) ?? "", false), Math.min(3e4, 1e3 * 2 ** Math.min(reconnectAttempts - 1, 5)));
    return;
  }
  if (!manuallyDisconnected && localStorage.getItem(PAIRING_KEY)) {
    lastError = "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435 3 \u043F\u043E\u043F\u044B\u0442\u043E\u043A. \u0421\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043A\u043E\u0434 \u0441\u043E\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u044F \u0438 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435\u0441\u044C \u0432\u0440\u0443\u0447\u043D\u0443\u044E.";
    postState();
  }
}
async function onSocketMessage(data) {
  let message;
  try {
    message = JSON.parse(String(data));
  } catch {
    return;
  }
  if (message.protocolVersion !== PROTOCOL_VERSION || typeof message.type !== "string") {
    lastError = "\u041D\u0435\u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F \u043F\u0440\u043E\u0442\u043E\u043A\u043E\u043B\u0430 DnD DM Tools.";
    postState();
    return;
  }
  if (message.type === "server.ready") {
    connectionState = "connected";
    reconnectAttempts = 0;
    lastError = void 0;
    postState();
    send({ type: "snapshot.request" });
    send({ type: "preview.request" });
    return;
  }
  if (message.type === "snapshot.publish") {
    pendingSnapshot = { value: message.snapshot, snapshotId: message.snapshotId };
    if (!applying) void drainApplyQueue();
    return;
  }
  if (message.type === "snapshot.empty") {
    try {
      await clearPublicInitiative();
    } catch (error) {
      lastError = formatError(error);
    }
    state.snapshot = null;
    state.diagnostics = createInitialDiagnostics();
    postState();
    return;
  }
  if (message.type === "preview.publish") {
    void applyPreview(message.preview, typeof message.previewId === "string" ? message.previewId : void 0);
    return;
  }
  if (message.type === "preview.clear" || message.type === "preview.empty") {
    void clearPreview(typeof message.previewId === "string" ? message.previewId : void 0);
    return;
  }
  if (message.type === "scene.clear") {
    void clearManagedScene(typeof message.clearId === "string" ? message.clearId : void 0);
    return;
  }
  if (message.type === "pong") {
    connectionState = "connected";
    postState();
  }
}
async function drainApplyQueue() {
  applying = true;
  while (pendingSnapshot !== APPLY_QUEUE_EMPTY) {
    const next = pendingSnapshot;
    pendingSnapshot = APPLY_QUEUE_EMPTY;
    await applySnapshot(next.value, next.snapshotId);
  }
  applying = false;
}
async function applySnapshot(value, snapshotId) {
  if (typeof snapshotId !== "string" || !isSnapshot(value)) {
    if (snapshotId) send({ type: "snapshot.failed", snapshotId, error: "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u043D\u0430\u043F\u0448\u043E\u0442 Owlbear." });
    return;
  }
  await readyPromise;
  const previousSnapshot = state.snapshot;
  state.diagnostics = { ...createInitialDiagnostics(), snapshotLoaded: true, participantCount: value.participants.length };
  try {
    const result = await pushSnapshotToScene(value, previousSnapshot);
    if (!result.diagnostics.sceneReady) {
      state.diagnostics = result.diagnostics;
      lastError = localizeSceneError(result.diagnostics.lastError ?? "No active Owlbear scene.");
      send({ type: "snapshot.failed", snapshotId, error: lastError });
      return;
    }
    await publishPublicInitiative(value);
    state.snapshot = value;
    state.diagnostics = result.diagnostics;
    lastError = result.diagnostics.lastError ? localizeSceneError(result.diagnostics.lastError) : void 0;
    send({ type: "snapshot.applied", snapshotId, tokenLinks: result.tokenLinks, diagnostics: result.diagnostics });
  } catch (error) {
    lastError = formatError(error);
    send({ type: "snapshot.failed", snapshotId, error: lastError });
  } finally {
    postState();
  }
}
async function applyPreview(value, previewId) {
  if (typeof previewId !== "string" || !isPreview(value)) return;
  await readyPromise;
  try {
    await pushPreviewToScene(value);
    send({ type: "preview.applied", previewId });
  } catch (error) {
    send({ type: "preview.failed", previewId, error: localizeSceneError(formatError(error)) });
  }
}
async function clearPreview(previewId) {
  await readyPromise;
  try {
    await clearPreviewFromScene();
    if (typeof previewId === "string") send({ type: "preview.applied", previewId });
  } catch (error) {
    if (typeof previewId === "string") send({ type: "preview.failed", previewId, error: formatError(error) });
  }
}
async function clearManagedScene(clearId) {
  await readyPromise;
  try {
    await clearManagedSceneItems();
    await clearPublicInitiative();
    state.snapshot = null;
    state.diagnostics = createInitialDiagnostics();
    if (typeof clearId === "string") send({ type: "scene.applied", clearId });
    return null;
  } catch (error) {
    const message = formatError(error);
    if (typeof clearId === "string") send({ type: "scene.failed", clearId, error: message });
    return message;
  } finally {
    postState();
  }
}
async function reconnectSceneItems() {
  if (!state.snapshot) throw new Error("\u041F\u043B\u0430\u0433\u0438\u043D \u0435\u0449\u0451 \u043D\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u0441\u0442\u043E\u043B\u043A\u043D\u043E\u0432\u0435\u043D\u0438\u0435.");
  const result = await pushSnapshotToScene(state.snapshot, null);
  if (!result.diagnostics.sceneReady) {
    throw new Error(localizeSceneError(result.diagnostics.lastError ?? "No active Owlbear scene."));
  }
  state.diagnostics = result.diagnostics;
  send({ type: "snapshot.applied", snapshotId: state.snapshot.snapshotId, tokenLinks: result.tokenLinks, diagnostics: result.diagnostics });
  postState();
}
async function runAction(action) {
  actionPending = true;
  postState();
  try {
    await action();
    lastError = void 0;
  } catch (error) {
    lastError = formatError(error);
  } finally {
    actionPending = false;
    postState();
  }
}
function send(payload) {
  if (socket?.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, messageId: crypto.randomUUID(), ...payload }));
}
function isSnapshot(value) {
  if (!value || typeof value !== "object") return false;
  const snapshot = value;
  return snapshot.schemaVersion === 1 && typeof snapshot.snapshotId === "string" && Array.isArray(snapshot.participants) && Array.isArray(snapshot.tokenLinks);
}
function isPreview(value) {
  if (!value || typeof value !== "object") return false;
  const preview = value;
  return preview.schemaVersion === 1 && typeof preview.previewId === "string" && typeof preview.imageUrl === "string" && typeof preview.imageMime === "string" && typeof preview.imageWidth === "number" && typeof preview.imageHeight === "number";
}
function formatError(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "\u041E\u0448\u0438\u0431\u043A\u0430 Owlbear \u0431\u0435\u0437 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u0434\u0435\u0442\u0430\u043B\u0435\u0439.";
  }
}
function localizeSceneError(error) {
  return error === "No active Owlbear scene." ? "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043A\u043E\u043C\u043D\u0430\u0442\u0443 Owlbear \u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u0443\u044E \u0441\u0446\u0435\u043D\u0443, \u0437\u0430\u0442\u0435\u043C \u043E\u0442\u043F\u0440\u0430\u0432\u044C\u0442\u0435 encounter \u0441\u043D\u043E\u0432\u0430." : error;
}
function closeCurrentSocket(shouldClearPreview = true) {
  const currentSocket = socket;
  socket = null;
  if (shouldClearPreview) void clearPreview(void 0);
  if (currentSocket && currentSocket.readyState < WebSocket.CLOSING) currentSocket.close(1e3, "Client disconnect");
}
function cancelReconnect() {
  if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
  reconnectTimer = null;
}
void lib_default.onReady(async () => {
  state.diagnostics = { ...state.diagnostics, sceneReady: await lib_default.scene.isReady() };
  lib_default.scene.onReadyChange((sceneReady) => {
    state.diagnostics = { ...state.diagnostics, sceneReady };
    postState();
    if (sceneReady) send({ type: "snapshot.request" });
  });
  readyResolve?.();
  postState();
});
postState();
var storedPairing = localStorage.getItem(PAIRING_KEY) ?? "";
if (storedPairing && !manuallyDisconnected) void connect(storedPairing, true);
//# sourceMappingURL=background.js.map
