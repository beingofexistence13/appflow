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
        if (!platform_1.isWeb) {
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
            this._workerId = -1;
            this._handler = handler;
            this._lastSentReq = 0;
            this._pendingReplies = Object.create(null);
            this._pendingEmitters = new Map();
            this._pendingEvents = new Map();
        }
        setWorkerId(workerId) {
            this._workerId = workerId;
        }
        sendMessage(method, args) {
            const req = String(++this._lastSentReq);
            return new Promise((resolve, reject) => {
                this._pendingReplies[req] = {
                    resolve: resolve,
                    reject: reject
                };
                this._send(new RequestMessage(this._workerId, req, method, args));
            });
        }
        listen(eventName, arg) {
            let req = null;
            const emitter = new event_1.Emitter({
                onWillAddFirstListener: () => {
                    req = String(++this._lastSentReq);
                    this._pendingEmitters.set(req, emitter);
                    this._send(new SubscribeEventMessage(this._workerId, req, eventName, arg));
                },
                onDidRemoveLastListener: () => {
                    this._pendingEmitters.delete(req);
                    this._send(new UnsubscribeEventMessage(this._workerId, req));
                    req = null;
                }
            });
            return emitter.event;
        }
        handleMessage(message) {
            if (!message || !message.vsWorker) {
                return;
            }
            if (this._workerId !== -1 && message.vsWorker !== this._workerId) {
                return;
            }
            this._handleMessage(message);
        }
        _handleMessage(msg) {
            switch (msg.type) {
                case 1 /* MessageType.Reply */:
                    return this._handleReplyMessage(msg);
                case 0 /* MessageType.Request */:
                    return this._handleRequestMessage(msg);
                case 2 /* MessageType.SubscribeEvent */:
                    return this._handleSubscribeEventMessage(msg);
                case 3 /* MessageType.Event */:
                    return this._handleEventMessage(msg);
                case 4 /* MessageType.UnsubscribeEvent */:
                    return this._handleUnsubscribeEventMessage(msg);
            }
        }
        _handleReplyMessage(replyMessage) {
            if (!this._pendingReplies[replyMessage.seq]) {
                console.warn('Got reply to unknown seq');
                return;
            }
            const reply = this._pendingReplies[replyMessage.seq];
            delete this._pendingReplies[replyMessage.seq];
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
        _handleRequestMessage(requestMessage) {
            const req = requestMessage.req;
            const result = this._handler.handleMessage(requestMessage.method, requestMessage.args);
            result.then((r) => {
                this._send(new ReplyMessage(this._workerId, req, r, undefined));
            }, (e) => {
                if (e.detail instanceof Error) {
                    // Loading errors have a detail property that points to the actual error
                    e.detail = (0, errors_1.transformErrorForSerialization)(e.detail);
                }
                this._send(new ReplyMessage(this._workerId, req, undefined, (0, errors_1.transformErrorForSerialization)(e)));
            });
        }
        _handleSubscribeEventMessage(msg) {
            const req = msg.req;
            const disposable = this._handler.handleEvent(msg.eventName, msg.arg)((event) => {
                this._send(new EventMessage(this._workerId, req, event));
            });
            this._pendingEvents.set(req, disposable);
        }
        _handleEventMessage(msg) {
            if (!this._pendingEmitters.has(msg.req)) {
                console.warn('Got event for unknown req');
                return;
            }
            this._pendingEmitters.get(msg.req).fire(msg.event);
        }
        _handleUnsubscribeEventMessage(msg) {
            if (!this._pendingEvents.has(msg.req)) {
                console.warn('Got unsubscribe for unknown req');
                return;
            }
            this._pendingEvents.get(msg.req).dispose();
            this._pendingEvents.delete(msg.req);
        }
        _send(msg) {
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
            this._handler.sendMessage(msg, transfer);
        }
    }
    /**
     * Main thread side
     */
    class SimpleWorkerClient extends lifecycle_1.Disposable {
        constructor(workerFactory, moduleId, host) {
            super();
            let lazyProxyReject = null;
            this._worker = this._register(workerFactory.create('vs/base/common/worker/simpleWorker', (msg) => {
                this._protocol.handleMessage(msg);
            }, (err) => {
                // in Firefox, web workers fail lazily :(
                // we will reject the proxy
                lazyProxyReject?.(err);
            }));
            this._protocol = new SimpleWorkerProtocol({
                sendMessage: (msg, transfer) => {
                    this._worker.postMessage(msg, transfer);
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
            this._protocol.setWorkerId(this._worker.getId());
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
            const hostMethods = (0, objects_1.getAllMethodNames)(host);
            // Send initialize message
            this._onModuleLoaded = this._protocol.sendMessage(INITIALIZE, [
                this._worker.getId(),
                JSON.parse(JSON.stringify(loaderConfiguration)),
                moduleId,
                hostMethods,
            ]);
            // Create proxy to loaded code
            const proxyMethodRequest = (method, args) => {
                return this._request(method, args);
            };
            const proxyListen = (eventName, arg) => {
                return this._protocol.listen(eventName, arg);
            };
            this._lazyProxy = new Promise((resolve, reject) => {
                lazyProxyReject = reject;
                this._onModuleLoaded.then((availableMethods) => {
                    resolve(createProxyObject(availableMethods, proxyMethodRequest, proxyListen));
                }, (e) => {
                    reject(e);
                    this._onError('Worker failed to load ' + moduleId, e);
                });
            });
        }
        getProxyObject() {
            return this._lazyProxy;
        }
        _request(method, args) {
            return new Promise((resolve, reject) => {
                this._onModuleLoaded.then(() => {
                    this._protocol.sendMessage(method, args).then(resolve, reject);
                }, reject);
            });
        }
        _onError(message, error) {
            console.error(message);
            console.info(error);
        }
    }
    exports.SimpleWorkerClient = SimpleWorkerClient;
    function propertyIsEvent(name) {
        // Assume a property is an event if it has a form of "onSomething"
        return name[0] === 'o' && name[1] === 'n' && strings.isUpperAsciiLetter(name.charCodeAt(2));
    }
    function propertyIsDynamicEvent(name) {
        // Assume a property is a dynamic event (a method that returns an event) if it has a form of "onDynamicSomething"
        return /^onDynamic/.test(name) && strings.isUpperAsciiLetter(name.charCodeAt(9));
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
            this._requestHandlerFactory = requestHandlerFactory;
            this._requestHandler = null;
            this._protocol = new SimpleWorkerProtocol({
                sendMessage: (msg, transfer) => {
                    postMessage(msg, transfer);
                },
                handleMessage: (method, args) => this._handleMessage(method, args),
                handleEvent: (eventName, arg) => this._handleEvent(eventName, arg)
            });
        }
        onmessage(msg) {
            this._protocol.handleMessage(msg);
        }
        _handleMessage(method, args) {
            if (method === INITIALIZE) {
                return this.initialize(args[0], args[1], args[2], args[3]);
            }
            if (!this._requestHandler || typeof this._requestHandler[method] !== 'function') {
                return Promise.reject(new Error('Missing requestHandler or method: ' + method));
            }
            try {
                return Promise.resolve(this._requestHandler[method].apply(this._requestHandler, args));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        _handleEvent(eventName, arg) {
            if (!this._requestHandler) {
                throw new Error(`Missing requestHandler`);
            }
            if (propertyIsDynamicEvent(eventName)) {
                const event = this._requestHandler[eventName].call(this._requestHandler, arg);
                if (typeof event !== 'function') {
                    throw new Error(`Missing dynamic event ${eventName} on request handler.`);
                }
                return event;
            }
            if (propertyIsEvent(eventName)) {
                const event = this._requestHandler[eventName];
                if (typeof event !== 'function') {
                    throw new Error(`Missing event ${eventName} on request handler.`);
                }
                return event;
            }
            throw new Error(`Malformed event name ${eventName}`);
        }
        initialize(workerId, loaderConfig, moduleId, hostMethods) {
            this._protocol.setWorkerId(workerId);
            const proxyMethodRequest = (method, args) => {
                return this._protocol.sendMessage(method, args);
            };
            const proxyListen = (eventName, arg) => {
                return this._protocol.listen(eventName, arg);
            };
            const hostProxy = createProxyObject(hostMethods, proxyMethodRequest, proxyListen);
            if (this._requestHandlerFactory) {
                // static request handler
                this._requestHandler = this._requestHandlerFactory(hostProxy);
                return Promise.resolve((0, objects_1.getAllMethodNames)(this._requestHandler));
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
                    this._requestHandler = module.create(hostProxy);
                    if (!this._requestHandler) {
                        reject(new Error(`No RequestHandler!`));
                        return;
                    }
                    resolve((0, objects_1.getAllMethodNames)(this._requestHandler));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlV29ya2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vd29ya2VyL3NpbXBsZVdvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDO0lBZWpDLElBQUksc0JBQXNCLEdBQUcsS0FBSyxDQUFDO0lBQ25DLFNBQWdCLHVCQUF1QixDQUFDLEdBQVE7UUFDL0MsSUFBSSxDQUFDLGdCQUFLLEVBQUU7WUFDWCxnQkFBZ0I7WUFDaEIsT0FBTztTQUNQO1FBQ0QsSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQzVCLHNCQUFzQixHQUFHLElBQUksQ0FBQztZQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLGlMQUFpTCxDQUFDLENBQUM7U0FDaE07UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBVkQsMERBVUM7SUFFRCxJQUFXLFdBTVY7SUFORCxXQUFXLFdBQVc7UUFDckIsbURBQU8sQ0FBQTtRQUNQLCtDQUFLLENBQUE7UUFDTCxpRUFBYyxDQUFBO1FBQ2QsK0NBQUssQ0FBQTtRQUNMLHFFQUFnQixDQUFBO0lBQ2pCLENBQUMsRUFOVSxXQUFXLEtBQVgsV0FBVyxRQU1yQjtJQUNELE1BQU0sY0FBYztRQUVuQixZQUNpQixRQUFnQixFQUNoQixHQUFXLEVBQ1gsTUFBYyxFQUNkLElBQVc7WUFIWCxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQ2hCLFFBQUcsR0FBSCxHQUFHLENBQVE7WUFDWCxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QsU0FBSSxHQUFKLElBQUksQ0FBTztZQUxaLFNBQUksK0JBQXVCO1FBTXZDLENBQUM7S0FDTDtJQUNELE1BQU0sWUFBWTtRQUVqQixZQUNpQixRQUFnQixFQUNoQixHQUFXLEVBQ1gsR0FB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