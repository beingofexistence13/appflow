/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/workbench/services/extensions/common/proxyIdentifier", "vs/workbench/services/extensions/common/rpcProtocol"], function (require, exports, async_1, proxyIdentifier_1, rpcProtocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestRPCProtocol = exports.SingleProxyRPCProtocol = void 0;
    function SingleProxyRPCProtocol(thing) {
        return {
            _serviceBrand: undefined,
            remoteAuthority: null,
            getProxy() {
                return thing;
            },
            set(identifier, value) {
                return value;
            },
            dispose: undefined,
            assertRegistered: undefined,
            drain: undefined,
            extensionHostKind: 1 /* ExtensionHostKind.LocalProcess */
        };
    }
    exports.SingleProxyRPCProtocol = SingleProxyRPCProtocol;
    class TestRPCProtocol {
        constructor() {
            this.remoteAuthority = null;
            this.extensionHostKind = 1 /* ExtensionHostKind.LocalProcess */;
            this._callCountValue = 0;
            this._locals = Object.create(null);
            this._proxies = Object.create(null);
        }
        drain() {
            return Promise.resolve();
        }
        get _callCount() {
            return this._callCountValue;
        }
        set _callCount(value) {
            this._callCountValue = value;
            if (this._callCountValue === 0) {
                this._completeIdle?.();
                this._idle = undefined;
            }
        }
        sync() {
            return new Promise((c) => {
                setTimeout(c, 0);
            }).then(() => {
                if (this._callCount === 0) {
                    return undefined;
                }
                if (!this._idle) {
                    this._idle = new Promise((c, e) => {
                        this._completeIdle = c;
                    });
                }
                return this._idle;
            });
        }
        getProxy(identifier) {
            if (!this._proxies[identifier.sid]) {
                this._proxies[identifier.sid] = this._createProxy(identifier.sid);
            }
            return this._proxies[identifier.sid];
        }
        _createProxy(proxyId) {
            const handler = {
                get: (target, name) => {
                    if (typeof name === 'string' && !target[name] && name.charCodeAt(0) === 36 /* CharCode.DollarSign */) {
                        target[name] = (...myArgs) => {
                            return this._remoteCall(proxyId, name, myArgs);
                        };
                    }
                    return target[name];
                }
            };
            return new Proxy(Object.create(null), handler);
        }
        set(identifier, value) {
            this._locals[identifier.sid] = value;
            return value;
        }
        _remoteCall(proxyId, path, args) {
            this._callCount++;
            return new Promise((c) => {
                setTimeout(c, 0);
            }).then(() => {
                const instance = this._locals[proxyId];
                // pretend the args went over the wire... (invoke .toJSON on objects...)
                const wireArgs = simulateWireTransfer(args);
                let p;
                try {
                    const result = instance[path].apply(instance, wireArgs);
                    p = (0, async_1.isThenable)(result) ? result : Promise.resolve(result);
                }
                catch (err) {
                    p = Promise.reject(err);
                }
                return p.then(result => {
                    this._callCount--;
                    // pretend the result went over the wire... (invoke .toJSON on objects...)
                    const wireResult = simulateWireTransfer(result);
                    return wireResult;
                }, err => {
                    this._callCount--;
                    return Promise.reject(err);
                });
            });
        }
        dispose() {
            throw new Error('Not implemented!');
        }
        assertRegistered(identifiers) {
            throw new Error('Not implemented!');
        }
    }
    exports.TestRPCProtocol = TestRPCProtocol;
    function simulateWireTransfer(obj) {
        if (!obj) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(simulateWireTransfer);
        }
        if (obj instanceof proxyIdentifier_1.SerializableObjectWithBuffers) {
            const { jsonString, referencedBuffers } = (0, rpcProtocol_1.stringifyJsonWithBufferRefs)(obj);
            return (0, rpcProtocol_1.parseJsonAndRestoreBufferRefs)(jsonString, referencedBuffers, null);
        }
        else {
            return JSON.parse(JSON.stringify(obj));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFJQQ1Byb3RvY29sLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2NvbW1vbi90ZXN0UlBDUHJvdG9jb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLFNBQWdCLHNCQUFzQixDQUFDLEtBQVU7UUFDaEQsT0FBTztZQUNOLGFBQWEsRUFBRSxTQUFTO1lBQ3hCLGVBQWUsRUFBRSxJQUFLO1lBQ3RCLFFBQVE7Z0JBQ1AsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsR0FBRyxDQUFpQixVQUE4QixFQUFFLEtBQVE7Z0JBQzNELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELE9BQU8sRUFBRSxTQUFVO1lBQ25CLGdCQUFnQixFQUFFLFNBQVU7WUFDNUIsS0FBSyxFQUFFLFNBQVU7WUFDakIsaUJBQWlCLHdDQUFnQztTQUNqRCxDQUFDO0lBQ0gsQ0FBQztJQWZELHdEQWVDO0lBRUQsTUFBYSxlQUFlO1FBYTNCO1lBVk8sb0JBQWUsR0FBRyxJQUFLLENBQUM7WUFDeEIsc0JBQWlCLDBDQUFrQztZQUVsRCxvQkFBZSxHQUFXLENBQUMsQ0FBQztZQVFuQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxLQUFLO1lBQ0osT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQVksVUFBVTtZQUNyQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQVksVUFBVSxDQUFDLEtBQWE7WUFDbkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFDN0Is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