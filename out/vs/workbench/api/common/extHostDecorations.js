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
    var ExtHostDecorations_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostDecorations = exports.ExtHostDecorations = void 0;
    let ExtHostDecorations = class ExtHostDecorations {
        static { ExtHostDecorations_1 = this; }
        static { this._handlePool = 0; }
        static { this._maxEventSize = 250; }
        constructor(extHostRpc, _logService) {
            this._logService = _logService;
            this._provider = new Map();
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadDecorations);
        }
        registerFileDecorationProvider(provider, extensionDescription) {
            const handle = ExtHostDecorations_1._handlePool++;
            this._provider.set(handle, { provider, extensionDescription });
            this._proxy.$registerDecorationProvider(handle, extensionDescription.identifier.value);
            const listener = provider.onDidChangeFileDecorations && provider.onDidChangeFileDecorations(e => {
                if (!e) {
                    this._proxy.$onDidChange(handle, null);
                    return;
                }
                const array = (0, arrays_1.asArray)(e);
                if (array.length <= ExtHostDecorations_1._maxEventSize) {
                    this._proxy.$onDidChange(handle, array);
                    return;
                }
                // too many resources per event. pick one resource per folder, starting
                // with parent folders
                this._logService.warn('[Decorations] CAPPING events from decorations provider', extensionDescription.identifier.value, array.length);
                const mapped = array.map(uri => ({ uri, rank: (0, strings_1.count)(uri.path, '/') }));
                const groups = (0, arrays_1.groupBy)(mapped, (a, b) => a.rank - b.rank || (0, strings_1.compare)(a.uri.path, b.uri.path));
                const picked = [];
                outer: for (const uris of groups) {
                    let lastDirname;
                    for (const obj of uris) {
                        const myDirname = (0, path_1.dirname)(obj.uri.path);
                        if (lastDirname !== myDirname) {
                            lastDirname = myDirname;
                            if (picked.push(obj.uri) >= ExtHostDecorations_1._maxEventSize) {
                                break outer;
                            }
                        }
                    }
                }
                this._proxy.$onDidChange(handle, picked);
            });
            return new extHostTypes_1.Disposable(() => {
                listener?.dispose();
                this._proxy.$unregisterDecorationProvider(handle);
                this._provider.delete(handle);
            });
        }
        async $provideDecorations(handle, requests, token) {
            if (!this._provider.has(handle)) {
                // might have been unregistered in the meantime
                return Object.create(null);
            }
            const result = Object.create(null);
            const { provider, extensionDescription: extensionId } = this._provider.get(handle);
            await Promise.all(requests.map(async (request) => {
                try {
                    const { uri, id } = request;
                    const data = await Promise.resolve(provider.provideFileDecoration(uri_1.URI.revive(uri), token));
                    if (!data) {
                        return;
                    }
                    try {
                        extHostTypes_1.FileDecoration.validate(data);
                        if (data.badge && typeof data.badge !== 'string') {
                            (0, extensions_1.checkProposedApiEnabled)(extensionId, 'codiconDecoration');
                        }
                        result[id] = [data.propagate, data.tooltip, data.badge, data.color];
                    }
                    catch (e) {
                        this._logService.warn(`INVALID decoration from extension '${extensionId.identifier.value}': ${e}`);
                    }
                }
                catch (err) {
                    this._logService.error(err);
                }
            }));
            return result;
        }
    };
    exports.ExtHostDecorations = ExtHostDecorations;
    exports.ExtHostDecorations = ExtHostDecorations = ExtHostDecorations_1 = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, log_1.ILogService)
    ], ExtHostDecorations);
    exports.IExtHostDecorations = (0, instantiation_1.createDecorator)('IExtHostDecorations');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdERlY29yYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFxQnpGLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCOztpQkFFZixnQkFBVyxHQUFHLENBQUMsQUFBSixDQUFLO2lCQUNoQixrQkFBYSxHQUFHLEdBQUcsQUFBTixDQUFPO1FBTW5DLFlBQ3FCLFVBQThCLEVBQ3JDLFdBQXlDO1lBQXhCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBTHRDLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztZQU81RCxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCw4QkFBOEIsQ0FBQyxRQUF1QyxFQUFFLG9CQUEyQztZQUNsSCxNQUFNLE1BQU0sR0FBRyxvQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoRCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsTUFBTSxFQUFFLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV2RixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsMEJBQTBCLElBQUksUUFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMvRixJQUFJLENBQUMsQ0FBQyxFQUFFO29CQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FB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