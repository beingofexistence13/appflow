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
define(["require", "exports", "vs/base/common/performance", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostConfiguration", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensions/common/extensions", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostInitDataService", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostExtensionService", "vs/platform/log/common/log", "vs/base/common/strings"], function (require, exports, performance, uri_1, extHost_protocol_1, extHostConfiguration_1, extensions_1, extensions_2, extHostRpcService_1, extHostInitDataService_1, instantiation_1, extHostExtensionService_1, log_1, strings_1) {
    "use strict";
    var NodeModuleAliasingModuleFactory_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RequireInterceptor = void 0;
    let RequireInterceptor = class RequireInterceptor {
        constructor(_apiFactory, _extensionRegistry, _instaService, _extHostConfiguration, _extHostExtensionService, _initData, _logService) {
            this._apiFactory = _apiFactory;
            this._extensionRegistry = _extensionRegistry;
            this._instaService = _instaService;
            this._extHostConfiguration = _extHostConfiguration;
            this._extHostExtensionService = _extHostExtensionService;
            this._initData = _initData;
            this._logService = _logService;
            this._factories = new Map();
            this._alternatives = [];
        }
        async install() {
            this._installInterceptor();
            performance.mark('code/extHost/willWaitForConfig');
            const configProvider = await this._extHostConfiguration.getConfigProvider();
            performance.mark('code/extHost/didWaitForConfig');
            const extensionPaths = await this._extHostExtensionService.getExtensionPathIndex();
            this.register(new VSCodeNodeModuleFactory(this._apiFactory, extensionPaths, this._extensionRegistry, configProvider, this._logService));
            this.register(this._instaService.createInstance(NodeModuleAliasingModuleFactory));
            if (this._initData.remote.isRemote) {
                this.register(this._instaService.createInstance(OpenNodeModuleFactory, extensionPaths, this._initData.environment.appUriScheme));
            }
        }
        register(interceptor) {
            if ('nodeModuleName' in interceptor) {
                if (Array.isArray(interceptor.nodeModuleName)) {
                    for (const moduleName of interceptor.nodeModuleName) {
                        this._factories.set(moduleName, interceptor);
                    }
                }
                else {
                    this._factories.set(interceptor.nodeModuleName, interceptor);
                }
            }
            if (typeof interceptor.alternativeModuleName === 'function') {
                this._alternatives.push((moduleName) => {
                    return interceptor.alternativeModuleName(moduleName);
                });
            }
        }
    };
    exports.RequireInterceptor = RequireInterceptor;
    exports.RequireInterceptor = RequireInterceptor = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, extHostConfiguration_1.IExtHostConfiguration),
        __param(4, extHostExtensionService_1.IExtHostExtensionService),
        __param(5, extHostInitDataService_1.IExtHostInitDataService),
        __param(6, log_1.ILogService)
    ], RequireInterceptor);
    //#region --- module renames
    let NodeModuleAliasingModuleFactory = class NodeModuleAliasingModuleFactory {
        static { NodeModuleAliasingModuleFactory_1 = this; }
        /**
         * Map of aliased internal node_modules, used to allow for modules to be
         * renamed without breaking extensions. In the form "original -> new name".
         */
        static { this.aliased = new Map([
            ['vscode-ripgrep', '@vscode/ripgrep'],
            ['vscode-windows-registry', '@vscode/windows-registry'],
        ]); }
        constructor(initData) {
            if (initData.environment.appRoot && NodeModuleAliasingModuleFactory_1.aliased.size) {
                const root = (0, strings_1.escapeRegExpCharacters)(this.forceForwardSlashes(initData.environment.appRoot.fsPath));
                // decompose ${appRoot}/node_modules/foo/bin to ['${appRoot}/node_modules/', 'foo', '/bin'],
                // and likewise the more complex form ${appRoot}/node_modules.asar.unpacked/@vcode/foo/bin
                // to ['${appRoot}/node_modules.asar.unpacked/',' @vscode/foo', '/bin'].
                const npmIdChrs = `[a-z0-9_.-]`;
                const npmModuleName = `@${npmIdChrs}+\\/${npmIdChrs}+|${npmIdChrs}+`;
                const moduleFolders = 'node_modules|node_modules\\.asar(?:\\.unpacked)?';
                this.re = new RegExp(`^(${root}/${moduleFolders}\\/)(${npmModuleName})(.*)$`, 'i');
            }
        }
        alternativeModuleName(name) {
            if (!this.re) {
                return;
            }
            const result = this.re.exec(this.forceForwardSlashes(name));
            if (!result) {
                return;
            }
            const [, prefix, moduleName, suffix] = result;
            const dealiased = NodeModuleAliasingModuleFactory_1.aliased.get(moduleName);
            if (dealiased === undefined) {
                return;
            }
            console.warn(`${moduleName} as been renamed to ${dealiased}, please update your imports`);
            return prefix + dealiased + suffix;
        }
        forceForwardSlashes(str) {
            return str.replace(/\\/g, '/');
        }
    };
    NodeModuleAliasingModuleFactory = NodeModuleAliasingModuleFactory_1 = __decorate([
        __param(0, extHostInitDataService_1.IExtHostInitDataService)
    ], NodeModuleAliasingModuleFactory);
    //#endregion
    //#region --- vscode-module
    class VSCodeNodeModuleFactory {
        constructor(_apiFactory, _extensionPaths, _extensionRegistry, _configProvider, _logService) {
            this._apiFactory = _apiFactory;
            this._extensionPaths = _extensionPaths;
            this._extensionRegistry = _extensionRegistry;
            this._configProvider = _configProvider;
            this._logService = _logService;
            this.nodeModuleName = 'vscode';
            this._extApiImpl = new extensions_2.ExtensionIdentifierMap();
        }
        load(_request, parent) {
            // get extension id from filename and api for extension
            const ext = this._extensionPaths.findSubstr(parent);
            if (ext) {
                let apiImpl = this._extApiImpl.get(ext.identifier);
                if (!apiImpl) {
                    apiImpl = this._apiFactory(ext, this._extensionRegistry, this._configProvider);
                    this._extApiImpl.set(ext.identifier, apiImpl);
                }
                return apiImpl;
            }
            // fall back to a default implementation
            if (!this._defaultApiImpl) {
                let extensionPathsPretty = '';
                this._extensionPaths.forEach((value, index) => extensionPathsPretty += `\t${index} -> ${value.identifier.value}\n`);
                this._logService.warn(`Could not identify extension for 'vscode' require call from ${parent}. These are the extension path mappings: \n${extensionPathsPretty}`);
                this._defaultApiImpl = this._apiFactory(extensions_1.nullExtensionDescription, this._extensionRegistry, this._configProvider);
            }
            return this._defaultApiImpl;
        }
    }
    let OpenNodeModuleFactory = class OpenNodeModuleFactory {
        constructor(_extensionPaths, _appUriScheme, rpcService) {
            this._extensionPaths = _extensionPaths;
            this._appUriScheme = _appUriScheme;
            this.nodeModuleName = ['open', 'opn'];
            this._mainThreadTelemetry = rpcService.getProxy(extHost_protocol_1.MainContext.MainThreadTelemetry);
            const mainThreadWindow = rpcService.getProxy(extHost_protocol_1.MainContext.MainThreadWindow);
            this._impl = (target, options) => {
                const uri = uri_1.URI.parse(target);
                // If we have options use the original method.
                if (options) {
                    return this.callOriginal(target, options);
                }
                if (uri.scheme === 'http' || uri.scheme === 'https') {
                    return mainThreadWindow.$openUri(uri, target, { allowTunneling: true });
                }
                else if (uri.scheme === 'mailto' || uri.scheme === this._appUriScheme) {
                    return mainThreadWindow.$openUri(uri, target, {});
                }
                return this.callOriginal(target, options);
            };
        }
        load(request, parent, original) {
            // get extension id from filename and api for extension
            const extension = this._extensionPaths.findSubstr(parent);
            if (extension) {
                this._extensionId = extension.identifier.value;
                this.sendShimmingTelemetry();
            }
            this._original = original(request);
            return this._impl;
        }
        callOriginal(target, options) {
            this.sendNoForwardTelemetry();
            return this._original(target, options);
        }
        sendShimmingTelemetry() {
            if (!this._extensionId) {
                return;
            }
            this._mainThreadTelemetry.$publicLog2('shimming.open', { extension: this._extensionId });
        }
        sendNoForwardTelemetry() {
            if (!this._extensionId) {
                return;
            }
            this._mainThreadTelemetry.$publicLog2('shimming.open.call.noForward', { extension: this._extensionId });
        }
    };
    OpenNodeModuleFactory = __decorate([
        __param(2, extHostRpcService_1.IExtHostRpcService)
    ], OpenNodeModuleFactory);
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFJlcXVpcmVJbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RSZXF1aXJlSW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQStCekYsSUFBZSxrQkFBa0IsR0FBakMsTUFBZSxrQkFBa0I7UUFLdkMsWUFDUyxXQUFpQyxFQUNqQyxrQkFBd0MsRUFDUixhQUFvQyxFQUNwQyxxQkFBNEMsRUFDekMsd0JBQWtELEVBQ25ELFNBQWtDLEVBQzlDLFdBQXdCO1lBTjlDLGdCQUFXLEdBQVgsV0FBVyxDQUFzQjtZQUNqQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXNCO1lBQ1Isa0JBQWEsR0FBYixhQUFhLENBQXVCO1lBQ3BDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDekMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUNuRCxjQUFTLEdBQVQsU0FBUyxDQUF5QjtZQUM5QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUV0RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1lBQ3hELElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTztZQUVaLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRTNCLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztZQUNuRCxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzVFLFdBQVcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUNsRCxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxxQkFBcUIs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