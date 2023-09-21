/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/performance", "vs/workbench/api/common/extHost.api.impl", "vs/workbench/api/common/extHostRequireInterceptor", "vs/workbench/api/node/proxyResolver", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/node/extHostDownloadService", "vs/base/common/uri", "vs/base/common/network", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/node/extHostCLIServer", "vs/base/node/extpath", "vs/workbench/api/node/extHostConsoleForwarder", "vs/workbench/api/node/extHostDiskFileSystemProvider"], function (require, exports, performance, extHost_api_impl_1, extHostRequireInterceptor_1, proxyResolver_1, extHostExtensionService_1, extHostDownloadService_1, uri_1, network_1, extHostTypes_1, extHostCLIServer_1, extpath_1, extHostConsoleForwarder_1, extHostDiskFileSystemProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pdc = void 0;
    class NodeModuleRequireInterceptor extends extHostRequireInterceptor_1.$edc {
        j() {
            const that = this;
            const node_module = globalThis._VSCODE_NODE_MODULES.module;
            const originalLoad = node_module._load;
            node_module._load = function load(request, parent, isMain) {
                request = applyAlternatives(request);
                if (!that.a.has(request)) {
                    return originalLoad.apply(this, arguments);
                }
                return that.a.get(request).load(request, uri_1.URI.file((0, extpath_1.$Xp)(parent.filename)), request => originalLoad.apply(this, [request, parent, isMain]));
            };
            const originalLookup = node_module._resolveLookupPaths;
            node_module._resolveLookupPaths = (request, parent) => {
                return originalLookup.call(this, applyAlternatives(request), parent);
            };
            const applyAlternatives = (request) => {
                for (const alternativeModuleName of that.b) {
                    const alternative = alternativeModuleName(request);
                    if (alternative) {
                        request = alternative;
                        break;
                    }
                }
                return request;
            };
        }
    }
    class $Pdc extends extHostExtensionService_1.$Qbc {
        constructor() {
            super(...arguments);
            this.extensionRuntime = extHostTypes_1.ExtensionRuntime.Node;
        }
        async tb() {
            // make sure console.log calls make it to the render
            this.h.createInstance(extHostConsoleForwarder_1.$Ndc);
            // initialize API and register actors
            const extensionApiFactory = this.h.invokeFunction(extHost_api_impl_1.$adc);
            // Register Download command
            this.h.createInstance(extHostDownloadService_1.$Mdc);
            // Register CLI Server for ipc
            if (this.f.remote.isRemote && this.f.remote.authority) {
                const cliServer = this.h.createInstance(extHostCLIServer_1.$rM);
                process.env['VSCODE_IPC_HOOK_CLI'] = cliServer.ipcHandlePath;
            }
            // Register local file system shortcut
            this.h.createInstance(extHostDiskFileSystemProvider_1.$Odc);
            // Module loading tricks
            const interceptor = this.h.createInstance(NodeModuleRequireInterceptor, extensionApiFactory, { mine: this.J, all: this.L });
            await interceptor.install();
            performance.mark('code/extHost/didInitAPI');
            // Do this when extension service exists, but extensions are not being activated yet.
            const configProvider = await this.m.getConfigProvider();
            await (0, proxyResolver_1.$Ldc)(this.j, configProvider, this, this.s, this.z, this.f);
            performance.mark('code/extHost/didInitProxyResolver');
        }
        ub(extensionDescription) {
            return extensionDescription.main;
        }
        async vb(extension, module, activationTimesBuilder) {
            if (module.scheme !== network_1.Schemas.file) {
                throw new Error(`Cannot load URI: '${module}', must be of file-scheme`);
            }
            let r = null;
            activationTimesBuilder.codeLoadingStart();
            this.s.trace(`ExtensionService#loadCommonJSModule ${module.toString(true)}`);
            this.s.flush();
            const extensionId = extension?.identifier.value;
            if (extension) {
                await this.w.initializeLocalizedMessages(extension);
            }
            try {
                if (extensionId) {
                    performance.mark(`code/extHost/willLoadExtensionCode/${extensionId}`);
                }
                r = require.__$__nodeRequire(module.fsPath);
            }
            finally {
                if (extensionId) {
                    performance.mark(`code/extHost/didLoadExtensionCode/${extensionId}`);
                }
                activationTimesBuilder.codeLoadingStop();
            }
            return r;
        }
        async $setRemoteEnvironment(env) {
            if (!this.f.remote.isRemote) {
                return;
            }
            for (const key in env) {
                const value = env[key];
                if (value === null) {
                    delete process.env[key];
                }
                else {
                    process.env[key] = value;
                }
            }
        }
    }
    exports.$Pdc = $Pdc;
});
//# sourceMappingURL=extHostExtensionService.js.map