/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.api.impl", "vs/workbench/api/common/extHostExtensionService", "vs/base/common/uri", "vs/workbench/api/common/extHostRequireInterceptor", "vs/workbench/api/common/extHostTypes", "vs/base/common/async", "vs/workbench/api/worker/extHostConsoleForwarder"], function (require, exports, extHost_api_impl_1, extHostExtensionService_1, uri_1, extHostRequireInterceptor_1, extHostTypes_1, async_1, extHostConsoleForwarder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostExtensionService = void 0;
    class WorkerRequireInterceptor extends extHostRequireInterceptor_1.RequireInterceptor {
        _installInterceptor() { }
        getModule(request, parent) {
            for (const alternativeModuleName of this._alternatives) {
                const alternative = alternativeModuleName(request);
                if (alternative) {
                    request = alternative;
                    break;
                }
            }
            if (this._factories.has(request)) {
                return this._factories.get(request).load(request, parent, () => { throw new Error('CANNOT LOAD MODULE from here.'); });
            }
            return undefined;
        }
    }
    class ExtHostExtensionService extends extHostExtensionService_1.AbstractExtHostExtensionService {
        constructor() {
            super(...arguments);
            this.extensionRuntime = extHostTypes_1.ExtensionRuntime.Webworker;
        }
        async _beforeAlmostReadyToRunExtensions() {
            // make sure console.log calls make it to the render
            this._instaService.createInstance(extHostConsoleForwarder_1.ExtHostConsoleForwarder);
            // initialize API and register actors
            const apiFactory = this._instaService.invokeFunction(extHost_api_impl_1.createApiFactoryAndRegisterActors);
            this._fakeModules = this._instaService.createInstance(WorkerRequireInterceptor, apiFactory, { mine: this._myRegistry, all: this._globalRegistry });
            await this._fakeModules.install();
            performance.mark('code/extHost/didInitAPI');
            await this._waitForDebuggerAttachment();
        }
        _getEntryPoint(extensionDescription) {
            return extensionDescription.browser;
        }
        async _loadCommonJSModule(extension, module, activationTimesBuilder) {
            module = module.with({ path: ensureSuffix(module.path, '.js') });
            const extensionId = extension?.identifier.value;
            if (extensionId) {
                performance.mark(`code/extHost/willFetchExtensionCode/${extensionId}`);
            }
            // First resolve the extension entry point URI to something we can load using `fetch`
            // This needs to be done on the main thread due to a potential `resourceUriProvider` (workbench api)
            // which is only available in the main thread
            const browserUri = uri_1.URI.revive(await this._mainThreadExtensionsProxy.$asBrowserUri(module));
            const response = await fetch(browserUri.toString(true));
            if (extensionId) {
                performance.mark(`code/extHost/didFetchExtensionCode/${extensionId}`);
            }
            if (response.status !== 200) {
                throw new Error(response.statusText);
            }
            // fetch JS sources as text and create a new function around it
            const source = await response.text();
            // Here we append #vscode-extension to serve as a marker, such that source maps
            // can be adjusted for the extra wrapping function.
            const sourceURL = `${module.toString(true)}#vscode-extension`;
            const fullSource = `${source}\n//# sourceURL=${sourceURL}`;
            let initFn;
            try {
                initFn = new Function('module', 'exports', 'require', fullSource); // CodeQL [SM01632] js/eval-call there is no alternative until we move to ESM
            }
            catch (err) {
                if (extensionId) {
                    console.error(`Loading code for extension ${extensionId} failed: ${err.message}`);
                }
                else {
                    console.error(`Loading code failed: ${err.message}`);
                }
                console.error(`${module.toString(true)}${typeof err.line === 'number' ? ` line ${err.line}` : ''}${typeof err.column === 'number' ? ` column ${err.column}` : ''}`);
                console.error(err);
                throw err;
            }
            if (extension) {
                await this._extHostLocalizationService.initializeLocalizedMessages(extension);
            }
            // define commonjs globals: `module`, `exports`, and `require`
            const _exports = {};
            const _module = { exports: _exports };
            const _require = (request) => {
                const result = this._fakeModules.getModule(request, module);
                if (result === undefined) {
                    throw new Error(`Cannot load module '${request}'`);
                }
                return result;
            };
            try {
                activationTimesBuilder.codeLoadingStart();
                if (extensionId) {
                    performance.mark(`code/extHost/willLoadExtensionCode/${extensionId}`);
                }
                initFn(_module, _exports, _require);
                return (_module.exports !== _exports ? _module.exports : _exports);
            }
            finally {
                if (extensionId) {
                    performance.mark(`code/extHost/didLoadExtensionCode/${extensionId}`);
                }
                activationTimesBuilder.codeLoadingStop();
            }
        }
        async $setRemoteEnvironment(_env) {
            return;
        }
        async _waitForDebuggerAttachment(waitTimeout = 5000) {
            // debugger attaches async, waiting for it fixes #106698 and #99222
            if (!this._initData.environment.isExtensionDevelopmentDebug) {
                return;
            }
            const deadline = Date.now() + waitTimeout;
            while (Date.now() < deadline && !('__jsDebugIsReady' in globalThis)) {
                await (0, async_1.timeout)(10);
            }
        }
    }
    exports.ExtHostExtensionService = ExtHostExtensionService;
    function ensureSuffix(path, suffix) {
        return path.endsWith(suffix) ? path : path + suffix;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEV4dGVuc2lvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3dvcmtlci9leHRIb3N0RXh0ZW5zaW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBTSx3QkFBeUIsU0FBUSw4Q0FBa0I7UUFFOUMsbUJBQW1CLEtBQUssQ0FBQztRQUVuQyxTQUFTLENBQUMsT0FBZSxFQUFFLE1BQVc7WUFDckMsS0FBSyxNQUFNLHFCQUFxQixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZELE1BQU0sV0FBVyxHQUFHLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLFdBQVcsRUFBRTtvQkFDaEIsT0FBTyxHQUFHLFdBQVcsQ0FBQztvQkFDdEIsTUFBTTtpQkFDTjthQUNEO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDakMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4SDtZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7S0FDRDtJQUVELE1BQWEsdUJBQXdCLFNBQVEseURBQStCO1FBQTVFOztZQUNVLHFCQUFnQixHQUFHLCtCQUFnQixDQUFDLFNBQVMsQ0FBQztRQTBHeEQsQ0FBQztRQXRHVSxLQUFLLENBQUMsaUNBQWlDO1lBQ2hELG9EQUFvRDtZQUNwRCxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxpREFBdUIsQ0FBQyxDQUFDO1lBRTNELHFDQUFxQztZ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