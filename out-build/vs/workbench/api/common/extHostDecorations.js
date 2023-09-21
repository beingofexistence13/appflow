/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostRpcService", "vs/platform/log/common/log", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/path", "vs/workbench/services/extensions/common/extensions"], function (require, exports, uri_1, extHost_protocol_1, extHostTypes_1, instantiation_1, extHostRpcService_1, log_1, arrays_1, strings_1, path_1, extensions_1) {
    "use strict";
    var $gcc_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hcc = exports.$gcc = void 0;
    let $gcc = class $gcc {
        static { $gcc_1 = this; }
        static { this.c = 0; }
        static { this.d = 250; }
        constructor(extHostRpc, h) {
            this.h = h;
            this.f = new Map();
            this.g = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadDecorations);
        }
        registerFileDecorationProvider(provider, extensionDescription) {
            const handle = $gcc_1.c++;
            this.f.set(handle, { provider, extensionDescription });
            this.g.$registerDecorationProvider(handle, extensionDescription.identifier.value);
            const listener = provider.onDidChangeFileDecorations && provider.onDidChangeFileDecorations(e => {
                if (!e) {
                    this.g.$onDidChange(handle, null);
                    return;
                }
                const array = (0, arrays_1.$1b)(e);
                if (array.length <= $gcc_1.d) {
                    this.g.$onDidChange(handle, array);
                    return;
                }
                // too many resources per event. pick one resource per folder, starting
                // with parent folders
                this.h.warn('[Decorations] CAPPING events from decorations provider', extensionDescription.identifier.value, array.length);
                const mapped = array.map(uri => ({ uri, rank: (0, strings_1.$re)(uri.path, '/') }));
                const groups = (0, arrays_1.$xb)(mapped, (a, b) => a.rank - b.rank || (0, strings_1.$Fe)(a.uri.path, b.uri.path));
                const picked = [];
                outer: for (const uris of groups) {
                    let lastDirname;
                    for (const obj of uris) {
                        const myDirname = (0, path_1.$_d)(obj.uri.path);
                        if (lastDirname !== myDirname) {
                            lastDirname = myDirname;
                            if (picked.push(obj.uri) >= $gcc_1.d) {
                                break outer;
                            }
                        }
                    }
                }
                this.g.$onDidChange(handle, picked);
            });
            return new extHostTypes_1.$3J(() => {
                listener?.dispose();
                this.g.$unregisterDecorationProvider(handle);
                this.f.delete(handle);
            });
        }
        async $provideDecorations(handle, requests, token) {
            if (!this.f.has(handle)) {
                // might have been unregistered in the meantime
                return Object.create(null);
            }
            const result = Object.create(null);
            const { provider, extensionDescription: extensionId } = this.f.get(handle);
            await Promise.all(requests.map(async (request) => {
                try {
                    const { uri, id } = request;
                    const data = await Promise.resolve(provider.provideFileDecoration(uri_1.URI.revive(uri), token));
                    if (!data) {
                        return;
                    }
                    try {
                        extHostTypes_1.$lL.validate(data);
                        if (data.badge && typeof data.badge !== 'string') {
                            (0, extensions_1.$QF)(extensionId, 'codiconDecoration');
                        }
                        result[id] = [data.propagate, data.tooltip, data.badge, data.color];
                    }
                    catch (e) {
                        this.h.warn(`INVALID decoration from extension '${extensionId.identifier.value}': ${e}`);
                    }
                }
                catch (err) {
                    this.h.error(err);
                }
            }));
            return result;
        }
    };
    exports.$gcc = $gcc;
    exports.$gcc = $gcc = $gcc_1 = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, log_1.$5i)
    ], $gcc);
    exports.$hcc = (0, instantiation_1.$Bh)('IExtHostDecorations');
});
//# sourceMappingURL=extHostDecorations.js.map