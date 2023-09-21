/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/workbench/services/extensions/common/proxyIdentifier", "vs/workbench/services/extensions/common/rpcProtocol"], function (require, exports, async_1, proxyIdentifier_1, rpcProtocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3dc = exports.$2dc = void 0;
    function $2dc(thing) {
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
    exports.$2dc = $2dc;
    class $3dc {
        constructor() {
            this.remoteAuthority = null;
            this.extensionHostKind = 1 /* ExtensionHostKind.LocalProcess */;
            this.a = 0;
            this.f = Object.create(null);
            this.g = Object.create(null);
        }
        drain() {
            return Promise.resolve();
        }
        get h() {
            return this.a;
        }
        set h(value) {
            this.a = value;
            if (this.a === 0) {
                this.d?.();
                this.b = undefined;
            }
        }
        sync() {
            return new Promise((c) => {
                setTimeout(c, 0);
            }).then(() => {
                if (this.h === 0) {
                    return undefined;
                }
                if (!this.b) {
                    this.b = new Promise((c, e) => {
                        this.d = c;
                    });
                }
                return this.b;
            });
        }
        getProxy(identifier) {
            if (!this.g[identifier.sid]) {
                this.g[identifier.sid] = this.i(identifier.sid);
            }
            return this.g[identifier.sid];
        }
        i(proxyId) {
            const handler = {
                get: (target, name) => {
                    if (typeof name === 'string' && !target[name] && name.charCodeAt(0) === 36 /* CharCode.DollarSign */) {
                        target[name] = (...myArgs) => {
                            return this.j(proxyId, name, myArgs);
                        };
                    }
                    return target[name];
                }
            };
            return new Proxy(Object.create(null), handler);
        }
        set(identifier, value) {
            this.f[identifier.sid] = value;
            return value;
        }
        j(proxyId, path, args) {
            this.h++;
            return new Promise((c) => {
                setTimeout(c, 0);
            }).then(() => {
                const instance = this.f[proxyId];
                // pretend the args went over the wire... (invoke .toJSON on objects...)
                const wireArgs = simulateWireTransfer(args);
                let p;
                try {
                    const result = instance[path].apply(instance, wireArgs);
                    p = (0, async_1.$tg)(result) ? result : Promise.resolve(result);
                }
                catch (err) {
                    p = Promise.reject(err);
                }
                return p.then(result => {
                    this.h--;
                    // pretend the result went over the wire... (invoke .toJSON on objects...)
                    const wireResult = simulateWireTransfer(result);
                    return wireResult;
                }, err => {
                    this.h--;
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
    exports.$3dc = $3dc;
    function simulateWireTransfer(obj) {
        if (!obj) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(simulateWireTransfer);
        }
        if (obj instanceof proxyIdentifier_1.$dA) {
            const { jsonString, referencedBuffers } = (0, rpcProtocol_1.$F3b)(obj);
            return (0, rpcProtocol_1.$G3b)(jsonString, referencedBuffers, null);
        }
        else {
            return JSON.parse(JSON.stringify(obj));
        }
    }
});
//# sourceMappingURL=testRPCProtocol.js.map