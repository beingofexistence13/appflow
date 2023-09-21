/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/performance", "vs/workbench/api/common/extHost.api.impl", "vs/workbench/api/common/extHostRequireInterceptor", "vs/workbench/api/node/proxyResolver", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/node/extHostDownloadService", "vs/base/common/uri", "vs/base/common/network", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/node/extHostCLIServer", "vs/base/node/extpath", "vs/workbench/api/node/extHostConsoleForwarder", "vs/workbench/api/node/extHostDiskFileSystemProvider"], function (require, exports, performance, extHost_api_impl_1, extHostRequireInterceptor_1, proxyResolver_1, extHostExtensionService_1, extHostDownloadService_1, uri_1, network_1, extHostTypes_1, extHostCLIServer_1, extpath_1, extHostConsoleForwarder_1, extHostDiskFileSystemProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostExtensionService = void 0;
    class NodeModuleRequireInterceptor extends extHostRequireInterceptor_1.RequireInterceptor {
        _installInterceptor() {
            const that = this;
            const node_module = globalThis._VSCODE_NODE_MODULES.module;
            const originalLoad = node_module._load;
            node_module._load = function load(request, parent, isMain) {
                request = applyAlternatives(request);
                if (!that._factories.has(request)) {
                    return originalLoad.apply(this, arguments);
                }
                return that._factories.get(request).load(request, uri_1.URI.file((0, extpath_1.realpathSync)(parent.filename)), request => originalLoad.apply(this, [request, parent, isMain]));
            };
            const originalLookup = node_module._resolveLookupPaths;
            node_module._resolveLookupPaths = (request, parent) => {
                return originalLookup.call(this, applyAlternatives(request), parent);
            };
            const applyAlternatives = (request) => {
                for (const alternativeModuleName of that._alternatives) {
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
    class ExtHostExtensionService extends extHostExtensionService_1.AbstractExtHostExtensionService {
        constructor() {
            super(...arguments);
            this.extensionRuntime = extHostTypes_1.ExtensionRuntime.Node;
        }
        async _beforeAlmostReadyToRunExtensions() {
            // make sure console.log calls make it to the render
            this._instaService.createInstance(extHostConsoleForwarder_1.ExtHostConsoleForwarder);
            // initialize API and register actors
            const extensionApiFactory = this._instaService.invokeFunction(extHost_api_impl_1.createApiFactoryAndRegisterActors);
            // Register Download command
            this._instaService.createInstance(extHostDownloadService_1.ExtHostDownloadService);
            // Register CLI Server for ipc
            if (this._initData.remote.isRemote && this._initData.remote.authority) {
                const cliServer = this._instaService.createInstance(extHostCLIServer_1.CLIServer);
                process.env['VSCODE_IPC_HOOK_CLI'] = cliServer.ipcHandlePath;
            }
            // Register local file system shortcut
            this._instaService.createInstance(extHostDiskFileSystemProvider_1.ExtHostDiskFileSystemProvider);
            // Module loading tricks
            const interceptor = this._instaService.createInstance(NodeModuleRequireInterceptor, extensionApiFactory, { mine: this._myRegistry, all: this._globalRegistry });
            await interceptor.install();
            performance.mark('code/extHost/didInitAPI');
            // Do this when extension service exists, but extensions are not being activated yet.
            const configProvider = await this._extHostConfiguration.getConfigProvider();
            await (0, proxyResolver_1.connectProxyResolver)(this._extHostWorkspace, configProvider, this, this._logService, this._mainThreadTelemetryProxy, this._initData);
            performance.mark('code/extHost/didInitProxyResolver');
        }
        _getEntryPoint(extensionDescription) {
            return extensionDescription.main;
        }
        async _loadCommonJSModule(extension, module, activationTimesBuilder) {
            if (module.scheme !== network_1.Schemas.file) {
                throw new Error(`Cannot load URI: '${module}', must be of file-scheme`);
            }
            let r = null;
            activationTimesBuilder.codeLoadingStart();
            this._logService.trace(`ExtensionService#loadCommonJSModule ${module.toString(true)}`);
            this._logService.flush();
            const extensionId = extension?.identifier.value;
            if (extension) {
                await this._extHostLocalizationService.initializeLocalizedMessages(extension);
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
            if (!this._initData.remote.isRemote) {
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
    exports.ExtHostExtensionService = ExtHostExtensionService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEV4dGVuc2lvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL25vZGUvZXh0SG9zdEV4dGVuc2lvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFNLDRCQUE2QixTQUFRLDhDQUFrQjtRQUVsRCxtQkFBbUI7WUFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLE1BQU0sV0FBVyxHQUFRLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUM7WUFDaEUsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUN2QyxXQUFXLENBQUMsS0FBSyxHQUFHLFNBQVMsSUFBSSxDQUFDLE9BQWUsRUFBRSxNQUE0QixFQUFFLE1BQWU7Z0JBQy9GLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNsQyxPQUFPLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUMzQztnQkFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFDLElBQUksQ0FDeEMsT0FBTyxFQUNQLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBQSxzQkFBWSxFQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUN2QyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUM5RCxDQUFDO1lBQ0gsQ0FBQyxDQUFDO1lBRUYsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDO1lBQ3ZELFdBQVcsQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLE9BQWUsRUFBRSxNQUFlLEVBQUUsRUFBRTtnQkFDdEUsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN0RSxDQUFDLENBQUM7WUFFRixNQUFNLGlCQUFpQixHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUU7Z0JBQzdDLEtBQUssTUFBTSxxQkFBcUIsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO29CQUN2RCxNQUFNLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDbkQsSUFBSSxXQUFXLEVBQUU7d0JBQ2hCLE9BQU8sR0FBRyxXQUFXLENBQUM7d0JBQ3RCLE1BQU07cUJBQ047aUJBQ0Q7Z0JBQ0QsT0FBTyxPQUFPLENBQUM7WUFDaEIsQ0FBQyxDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBRUQsTUFBYSx1QkFBd0IsU0FBUSx5REFBK0I7UUFBNUU7O1lBRVUscUJBQWdCLEdBQUcsK0JBQWdCLENBQUMsSUFBSSxDQUFDO1FBNEVuRCxDQUFDO1FBMUVVLEtBQUssQ0FBQyxpQ0FBaUM7WUFDaEQsb0RBQW9EO1lBQ3BELElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLGlEQUF1QixDQUFDLENBQUM7WUFFM0QscUNBQXFDO1lBQ3JDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsb0RBQWlDLENBQUMsQ0FBQztZQUVqRyw0QkFBNEI7WUFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsK0NBQXNCLENBQUMsQ0FBQztZQUUxRCw4QkFBOEI7WUFDOUIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFO2dCQUN0RSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyw0QkFBUyxDQUFDLENBQUM7Z0JBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDO2FBQzdEO1lBRUQsc0NBQXNDO1lBQ3RDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLDZEQUE2QixDQUFDLENBQUM7WUFFakUsd0JBQXdCO1lBQ3hCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLDRCQUE0QixFQUFFLG1CQUFtQixFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ2hLLE1BQU0sV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVCLFdBQVcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUU1QyxxRkFBcUY7WUFDckYsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM1RSxNQUFNLElBQUEsb0NBQW9CLEVBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNJLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRVMsY0FBYyxDQUFDLG9CQUEyQztZQUNuRSxPQUFPLG9CQUFvQixDQUFDLElBQUksQ0FBQztRQUNsQyxDQUFDO1FBRVMsS0FBSyxDQUFDLG1CQUFtQixDQUFJLFNBQXVDLEVBQUUsTUFBVyxFQUFFLHNCQUF1RDtZQUNuSixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLE1BQU0sMkJBQTJCLENBQUMsQ0FBQzthQUN4RTtZQUNELElBQUksQ0FBQyxHQUFhLElBQUksQ0FBQztZQUN2QixzQkFBc0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLE1BQU0sV0FBVyxHQUFHLFNBQVMsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQ2hELElBQUksU0FBUyxFQUFFO2dCQUNkLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzlFO1lBQ0QsSUFBSTtnQkFDSCxJQUFJLFdBQVcsRUFBRTtvQkFDaEIsV0FBVyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsV0FBVyxFQUFFLENBQUMsQ0FBQztpQkFDdEU7Z0JBQ0QsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDL0M7b0JBQVM7Z0JBQ1QsSUFBSSxXQUFXLEVBQUU7b0JBQ2hCLFdBQVcsQ0FBQyxJQUFJLENBQUMscUNBQXFDLFdBQVcsRUFBRSxDQUFDLENBQUM7aUJBQ3JFO2dCQUNELHNCQUFzQixDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQ3pDO1lBQ0QsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO1FBRU0sS0FBSyxDQUFDLHFCQUFxQixDQUFDLEdBQXFDO1lBQ3ZFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BDLE9BQU87YUFDUDtZQUVELEtBQUssTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFO2dCQUN0QixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZCLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtvQkFDbkIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN4QjtxQkFBTTtvQkFDTixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztpQkFDekI7YUFDRDtRQUNGLENBQUM7S0FDRDtJQTlFRCwwREE4RUMifQ==