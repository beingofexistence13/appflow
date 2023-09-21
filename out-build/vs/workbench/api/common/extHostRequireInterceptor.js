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
    exports.$edc = void 0;
    let $edc = class $edc {
        constructor(c, d, e, f, g, h, i) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.a = new Map();
            this.b = [];
        }
        async install() {
            this.j();
            performance.mark('code/extHost/willWaitForConfig');
            const configProvider = await this.f.getConfigProvider();
            performance.mark('code/extHost/didWaitForConfig');
            const extensionPaths = await this.g.getExtensionPathIndex();
            this.register(new VSCodeNodeModuleFactory(this.c, extensionPaths, this.d, configProvider, this.i));
            this.register(this.e.createInstance(NodeModuleAliasingModuleFactory));
            if (this.h.remote.isRemote) {
                this.register(this.e.createInstance(OpenNodeModuleFactory, extensionPaths, this.h.environment.appUriScheme));
            }
        }
        register(interceptor) {
            if ('nodeModuleName' in interceptor) {
                if (Array.isArray(interceptor.nodeModuleName)) {
                    for (const moduleName of interceptor.nodeModuleName) {
                        this.a.set(moduleName, interceptor);
                    }
                }
                else {
                    this.a.set(interceptor.nodeModuleName, interceptor);
                }
            }
            if (typeof interceptor.alternativeModuleName === 'function') {
                this.b.push((moduleName) => {
                    return interceptor.alternativeModuleName(moduleName);
                });
            }
        }
    };
    exports.$edc = $edc;
    exports.$edc = $edc = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, extHostConfiguration_1.$mbc),
        __param(4, extHostExtensionService_1.$Rbc),
        __param(5, extHostInitDataService_1.$fM),
        __param(6, log_1.$5i)
    ], $edc);
    //#region --- module renames
    let NodeModuleAliasingModuleFactory = class NodeModuleAliasingModuleFactory {
        static { NodeModuleAliasingModuleFactory_1 = this; }
        /**
         * Map of aliased internal node_modules, used to allow for modules to be
         * renamed without breaking extensions. In the form "original -> new name".
         */
        static { this.a = new Map([
            ['vscode-ripgrep', '@vscode/ripgrep'],
            ['vscode-windows-registry', '@vscode/windows-registry'],
        ]); }
        constructor(initData) {
            if (initData.environment.appRoot && NodeModuleAliasingModuleFactory_1.a.size) {
                const root = (0, strings_1.$qe)(this.c(initData.environment.appRoot.fsPath));
                // decompose ${appRoot}/node_modules/foo/bin to ['${appRoot}/node_modules/', 'foo', '/bin'],
                // and likewise the more complex form ${appRoot}/node_modules.asar.unpacked/@vcode/foo/bin
                // to ['${appRoot}/node_modules.asar.unpacked/',' @vscode/foo', '/bin'].
                const npmIdChrs = `[a-z0-9_.-]`;
                const npmModuleName = `@${npmIdChrs}+\\/${npmIdChrs}+|${npmIdChrs}+`;
                const moduleFolders = 'node_modules|node_modules\\.asar(?:\\.unpacked)?';
                this.b = new RegExp(`^(${root}/${moduleFolders}\\/)(${npmModuleName})(.*)$`, 'i');
            }
        }
        alternativeModuleName(name) {
            if (!this.b) {
                return;
            }
            const result = this.b.exec(this.c(name));
            if (!result) {
                return;
            }
            const [, prefix, moduleName, suffix] = result;
            const dealiased = NodeModuleAliasingModuleFactory_1.a.get(moduleName);
            if (dealiased === undefined) {
                return;
            }
            console.warn(`${moduleName} as been renamed to ${dealiased}, please update your imports`);
            return prefix + dealiased + suffix;
        }
        c(str) {
            return str.replace(/\\/g, '/');
        }
    };
    NodeModuleAliasingModuleFactory = NodeModuleAliasingModuleFactory_1 = __decorate([
        __param(0, extHostInitDataService_1.$fM)
    ], NodeModuleAliasingModuleFactory);
    //#endregion
    //#region --- vscode-module
    class VSCodeNodeModuleFactory {
        constructor(c, d, e, f, g) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.nodeModuleName = 'vscode';
            this.a = new extensions_2.$Xl();
        }
        load(_request, parent) {
            // get extension id from filename and api for extension
            const ext = this.d.findSubstr(parent);
            if (ext) {
                let apiImpl = this.a.get(ext.identifier);
                if (!apiImpl) {
                    apiImpl = this.c(ext, this.e, this.f);
                    this.a.set(ext.identifier, apiImpl);
                }
                return apiImpl;
            }
            // fall back to a default implementation
            if (!this.b) {
                let extensionPathsPretty = '';
                this.d.forEach((value, index) => extensionPathsPretty += `\t${index} -> ${value.identifier.value}\n`);
                this.g.warn(`Could not identify extension for 'vscode' require call from ${parent}. These are the extension path mappings: \n${extensionPathsPretty}`);
                this.b = this.c(extensions_1.$KF, this.e, this.f);
            }
            return this.b;
        }
    }
    let OpenNodeModuleFactory = class OpenNodeModuleFactory {
        constructor(e, f, rpcService) {
            this.e = e;
            this.f = f;
            this.nodeModuleName = ['open', 'opn'];
            this.d = rpcService.getProxy(extHost_protocol_1.$1J.MainThreadTelemetry);
            const mainThreadWindow = rpcService.getProxy(extHost_protocol_1.$1J.MainThreadWindow);
            this.c = (target, options) => {
                const uri = uri_1.URI.parse(target);
                // If we have options use the original method.
                if (options) {
                    return this.g(target, options);
                }
                if (uri.scheme === 'http' || uri.scheme === 'https') {
                    return mainThreadWindow.$openUri(uri, target, { allowTunneling: true });
                }
                else if (uri.scheme === 'mailto' || uri.scheme === this.f) {
                    return mainThreadWindow.$openUri(uri, target, {});
                }
                return this.g(target, options);
            };
        }
        load(request, parent, original) {
            // get extension id from filename and api for extension
            const extension = this.e.findSubstr(parent);
            if (extension) {
                this.a = extension.identifier.value;
                this.h();
            }
            this.b = original(request);
            return this.c;
        }
        g(target, options) {
            this.i();
            return this.b(target, options);
        }
        h() {
            if (!this.a) {
                return;
            }
            this.d.$publicLog2('shimming.open', { extension: this.a });
        }
        i() {
            if (!this.a) {
                return;
            }
            this.d.$publicLog2('shimming.open.call.noForward', { extension: this.a });
        }
    };
    OpenNodeModuleFactory = __decorate([
        __param(2, extHostRpcService_1.$2L)
    ], OpenNodeModuleFactory);
});
//#endregion
//# sourceMappingURL=extHostRequireInterceptor.js.map