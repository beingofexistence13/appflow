/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/strings"], function (require, exports, errors_1, event_1, lifecycle_1, objects_1, platform_1, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = exports.SimpleWorkerServer = exports.SimpleWorkerClient = exports.logOnceWebWorkerWarning = void 0;
    const INITIALIZE = '$initialize';
    let webWorkerWarningLogged = false;
    function logOnceWebWorkerWarning(err) {
        if (!platform_1.$o) {
            // running tests
            return;
        }
        if (!webWorkerWarningLogged) {
            webWorkerWarningLogged = true;
            console.warn('Could not create web worker(s). Falling back to loading web worker code in main thread, which might cause UI freezes. Please see https://github.com/microsoft/monaco-editor#faq');
        }
        console.warn(err.message);
    }
    exports.logOnceWebWorkerWarning = logOnceWebWorkerWarning;
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["Request"] = 0] = "Request";
        MessageType[MessageType["Reply"] = 1] = "Reply";
        MessageType[MessageType["SubscribeEvent"] = 2] = "SubscribeEvent";
        MessageType[MessageType["Event"] = 3] = "Event";
        MessageType[MessageType["UnsubscribeEvent"] = 4] = "UnsubscribeEvent";
    })(MessageType || (MessageType = {}));
    class RequestMessage {
        constructor(vsWorker, req, method, args) {
            this.vsWorker = vsWorker;
            this.req = req;
            this.method = method;
            this.args = args;
            this.type = 0 /* MessageType.Request */;
        }
    }
    class ReplyMessage {
        constructor(vsWorker, seq, res, err) {
            this.vsWorker = vsWorker;
            this.seq = seq;
            this.res = res;
            this.err = err;
            this.type = 1 /* MessageType.Reply */;
        }
    }
    class SubscribeEventMessage {
        constructor(vsWorker, req, eventName, arg) {
            this.vsWorker = vsWorker;
            this.req = req;
            this.eventName = eventName;
            this.arg = arg;
            this.type = 2 /* MessageType.SubscribeEvent */;
        }
    }
    class EventMessage {
        constructor(vsWorker, req, event) {
            this.vsWorker = vsWorker;
            this.req = req;
            this.event = event;
            this.type = 3 /* MessageType.Event */;
        }
    }
    class UnsubscribeEventMessage {
        constructor(vsWorker, req) {
            this.vsWorker = vsWorker;
            this.req = req;
            this.type = 4 /* MessageType.UnsubscribeEvent */;
        }
    }
    class SimpleWorkerProtocol {
        constructor(handler) {
            this.a = -1;
            this.g = handler;
            this.b = 0;
            this.c = Object.create(null);
            this.d = new Map();
            this.f = new Map();
        }
        setWorkerId(workerId) {
            this.a = workerId;
        }
        sendMessage(method, args) {
            const req = String(++this.b);
            return new Promise((resolve, reject) => {
                this.c[req] = {
                    resolve: resolve,
                    reject: reject
                };
                this.o(new RequestMessage(this.a, req, method, args));
            });
        }
        listen(eventName, arg) {
            let req = null;
            const emitter = new event_1.$fd({
                onWillAddFirstListener: () => {
                    req = String(++this.b);
                    this.d.set(req, emitter);
                    this.o(new SubscribeEventMessage(this.a, req, eventName, arg));
                },
                onDidRemoveLastListener: () => {
                    this.d.delete(req);
                    this.o(new UnsubscribeEventMessage(this.a, req));
                    req = null;
                }
            });
            return emitter.event;
        }
        handleMessage(message) {
            if (!message || !message.vsWorker) {
                return;
            }
            if (this.a !== -1 && message.vsWorker !== this.a) {
                return;
            }
            this.h(message);
        }
        h(msg) {
            switch (msg.type) {
                case 1 /* MessageType.Reply */:
                    return this.j(msg);
                case 0 /* MessageType.Request */:
                    return this.k(msg);
                case 2 /* MessageType.SubscribeEvent */:
                    return this.l(msg);
                case 3 /* MessageType.Event */:
                    return this.m(msg);
                case 4 /* MessageType.UnsubscribeEvent */:
                    return this.n(msg);
            }
        }
        j(replyMessage) {
            if (!this.c[replyMessage.seq]) {
                console.warn('Got reply to unknown seq');
                return;
            }
            const reply = this.c[replyMessage.seq];
            delete this.c[replyMessage.seq];
            if (replyMessage.err) {
                let err = replyMessage.err;
                if (replyMessage.err.$isError) {
                    err = new Error();
                    err.name = replyMessage.err.name;
                    err.message = replyMessage.err.message;
                    err.stack = replyMessage.err.stack;
                }
                reply.reject(err);
                return;
            }
            reply.resolve(replyMessage.res);
        }
        k(requestMessage) {
            const req = requestMessage.req;
            const result = this.g.handleMessage(requestMessage.method, requestMessage.args);
            result.then((r) => {
                this.o(new ReplyMessage(this.a, req, r, undefined));
            }, (e) => {
                if (e.detail instanceof Error) {
                    // Loading errors have a detail property that points to the actual error
                    e.detail = (0, errors_1.$1)(e.detail);
                }
                this.o(new ReplyMessage(this.a, req, undefined, (0, errors_1.$1)(e)));
            });
        }
        l(msg) {
            const req = msg.req;
            const disposable = this.g.handleEvent(msg.eventName, msg.arg)((event) => {
                this.o(new EventMessage(this.a, req, event));
            });
            this.f.set(req, disposable);
        }
        m(msg) {
            if (!this.d.has(msg.req)) {
                console.warn('Got event for unknown req');
                return;
            }
            this.d.get(msg.req).fire(msg.event);
        }
        n(msg) {
            if (!this.f.has(msg.req)) {
                console.warn('Got unsubscribe for unknown req');
                return;
            }
            this.f.get(msg.req).dispose();
            this.f.delete(msg.req);
        }
        o(msg) {
            const transfer = [];
            if (msg.type === 0 /* MessageType.Request */) {
                for (let i = 0; i < msg.args.length; i++) {
                    if (msg.args[i] instanceof ArrayBuffer) {
                        transfer.push(msg.args[i]);
                    }
                }
            }
            else if (msg.type === 1 /* MessageType.Reply */) {
                if (msg.res instanceof ArrayBuffer) {
                    transfer.push(msg.res);
                }
            }
            this.g.sendMessage(msg, transfer);
        }
    }
    /**
     * Main thread side
     */
    class SimpleWorkerClient extends lifecycle_1.$kc {
        constructor(workerFactory, moduleId, host) {
            super();
            let lazyProxyReject = null;
            this.a = this.B(workerFactory.create('vs/base/common/worker/simpleWorker', (msg) => {
                this.c.handleMessage(msg);
            }, (err) => {
                // in Firefox, web workers fail lazily :(
                // we will reject the proxy
                lazyProxyReject?.(err);
            }));
            this.c = new SimpleWorkerProtocol({
                sendMessage: (msg, transfer) => {
                    this.a.postMessage(msg, transfer);
                },
                handleMessage: (method, args) => {
                    if (typeof host[method] !== 'function') {
                        return Promise.reject(new Error('Missing method ' + method + ' on main thread host.'));
                    }
                    try {
                        return Promise.resolve(host[method].apply(host, args));
                    }
                    catch (e) {
                        return Promise.reject(e);
                    }
                },
                handleEvent: (eventName, arg) => {
                    if (propertyIsDynamicEvent(eventName)) {
                        const event = host[eventName].call(host, arg);
                        if (typeof event !== 'function') {
                            throw new Error(`Missing dynamic event ${eventName} on main thread host.`);
                        }
                        return event;
                    }
                    if (propertyIsEvent(eventName)) {
                        const event = host[eventName];
                        if (typeof event !== 'function') {
                            throw new Error(`Missing event ${eventName} on main thread host.`);
                        }
                        return event;
                    }
                    throw new Error(`Malformed event name ${eventName}`);
                }
            });
            this.c.setWorkerId(this.a.getId());
            // Gather loader configuration
            let loaderConfiguration = null;
            const globalRequire = globalThis.require;
            if (typeof globalRequire !== 'undefined' && typeof globalRequire.getConfig === 'function') {
                // Get the configuration from the Monaco AMD Loader
                loaderConfiguration = globalRequire.getConfig();
            }
            else if (typeof globalThis.requirejs !== 'undefined') {
                // Get the configuration from requirejs
                loaderConfiguration = globalThis.requirejs.s.contexts._.config;
            }
            const hostMethods = (0, objects_1.$6m)(host);
            // Send initialize message
            this.b = this.c.sendMessage(INITIALIZE, [
                this.a.getId(),
                JSON.parse(JSON.stringify(loaderConfiguration)),
                moduleId,
                hostMethods,
            ]);
            // Create proxy to loaded code
            const proxyMethodRequest = (method, args) => {
                return this.g(method, args);
            };
            const proxyListen = (eventName, arg) => {
                return this.c.listen(eventName, arg);
            };
            this.f = new Promise((resolve, reject) => {
                lazyProxyReject = reject;
                this.b.then((availableMethods) => {
                    resolve(createProxyObject(availableMethods, proxyMethodRequest, proxyListen));
                }, (e) => {
                    reject(e);
                    this.h('Worker failed to load ' + moduleId, e);
                });
            });
        }
        getProxyObject() {
            return this.f;
        }
        g(method, args) {
            return new Promise((resolve, reject) => {
                this.b.then(() => {
                    this.c.sendMessage(method, args).then(resolve, reject);
                }, reject);
            });
        }
        h(message, error) {
            console.error(message);
            console.info(error);
        }
    }
    exports.SimpleWorkerClient = SimpleWorkerClient;
    function propertyIsEvent(name) {
        // Assume a property is an event if it has a form of "onSomething"
        return name[0] === 'o' && name[1] === 'n' && strings.$Le(name.charCodeAt(2));
    }
    function propertyIsDynamicEvent(name) {
        // Assume a property is a dynamic event (a method that returns an event) if it has a form of "onDynamicSomething"
        return /^onDynamic/.test(name) && strings.$Le(name.charCodeAt(9));
    }
    function createProxyObject(methodNames, invoke, proxyListen) {
        const createProxyMethod = (method) => {
            return function () {
                const args = Array.prototype.slice.call(arguments, 0);
                return invoke(method, args);
            };
        };
        const createProxyDynamicEvent = (eventName) => {
            return function (arg) {
                return proxyListen(eventName, arg);
            };
        };
        const result = {};
        for (const methodName of methodNames) {
            if (propertyIsDynamicEvent(methodName)) {
                result[methodName] = createProxyDynamicEvent(methodName);
                continue;
            }
            if (propertyIsEvent(methodName)) {
                result[methodName] = proxyListen(methodName, undefined);
                continue;
            }
            result[methodName] = createProxyMethod(methodName);
        }
        return result;
    }
    /**
     * Worker side
     */
    class SimpleWorkerServer {
        constructor(postMessage, requestHandlerFactory) {
            this.a = requestHandlerFactory;
            this.b = null;
            this.c = new SimpleWorkerProtocol({
                sendMessage: (msg, transfer) => {
                    postMessage(msg, transfer);
                },
                handleMessage: (method, args) => this.d(method, args),
                handleEvent: (eventName, arg) => this.f(eventName, arg)
            });
        }
        onmessage(msg) {
            this.c.handleMessage(msg);
        }
        d(method, args) {
            if (method === INITIALIZE) {
                return this.g(args[0], args[1], args[2], args[3]);
            }
            if (!this.b || typeof this.b[method] !== 'function') {
                return Promise.reject(new Error('Missing requestHandler or method: ' + method));
            }
            try {
                return Promise.resolve(this.b[method].apply(this.b, args));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        f(eventName, arg) {
            if (!this.b) {
                throw new Error(`Missing requestHandler`);
            }
            if (propertyIsDynamicEvent(eventName)) {
                const event = this.b[eventName].call(this.b, arg);
                if (typeof event !== 'function') {
                    throw new Error(`Missing dynamic event ${eventName} on request handler.`);
                }
                return event;
            }
            if (propertyIsEvent(eventName)) {
                const event = this.b[eventName];
                if (typeof event !== 'function') {
                    throw new Error(`Missing event ${eventName} on request handler.`);
                }
                return event;
            }
            throw new Error(`Malformed event name ${eventName}`);
        }
        g(workerId, loaderConfig, moduleId, hostMethods) {
            this.c.setWorkerId(workerId);
            const proxyMethodRequest = (method, args) => {
                return this.c.sendMessage(method, args);
            };
            const proxyListen = (eventName, arg) => {
                return this.c.listen(eventName, arg);
            };
            const hostProxy = createProxyObject(hostMethods, proxyMethodRequest, proxyListen);
            if (this.a) {
                // static request handler
                this.b = this.a(hostProxy);
                return Promise.resolve((0, objects_1.$6m)(this.b));
            }
            if (loaderConfig) {
                // Remove 'baseUrl', handling it is beyond scope for now
                if (typeof loaderConfig.baseUrl !== 'undefined') {
                    delete loaderConfig['baseUrl'];
                }
                if (typeof loaderConfig.paths !== 'undefined') {
                    if (typeof loaderConfig.paths.vs !== 'undefined') {
                        delete loaderConfig.paths['vs'];
                    }
                }
                if (typeof loaderConfig.trustedTypesPolicy !== undefined) {
                    // don't use, it has been destroyed during serialize
                    delete loaderConfig['trustedTypesPolicy'];
                }
                // Since this is in a web worker, enable catching errors
                loaderConfig.catchError = true;
                globalThis.require.config(loaderConfig);
            }
            return new Promise((resolve, reject) => {
                // Use the global require to be sure to get the global config
                // ESM-comment-begin
                const req = (globalThis.require || require);
                // ESM-comment-end
                // ESM-uncomment-begin
                // const req = globalThis.require;
                // ESM-uncomment-end
                req([moduleId], (module) => {
                    this.b = module.create(hostProxy);
                    if (!this.b) {
                        reject(new Error(`No RequestHandler!`));
                        return;
                    }
                    resolve((0, objects_1.$6m)(this.b));
                }, reject);
            });
        }
    }
    exports.SimpleWorkerServer = SimpleWorkerServer;
    /**
     * Called on the worker side
     * @skipMangle
     */
    function create(postMessage) {
        return new SimpleWorkerServer(postMessage, null);
    }
    exports.create = create;
});
//# sourceMappingURL=simpleWorker.js.map