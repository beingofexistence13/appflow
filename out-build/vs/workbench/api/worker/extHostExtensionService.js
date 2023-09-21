/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.api.impl", "vs/workbench/api/common/extHostExtensionService", "vs/base/common/uri", "vs/workbench/api/common/extHostRequireInterceptor", "vs/workbench/api/common/extHostTypes", "vs/base/common/async", "vs/workbench/api/worker/extHostConsoleForwarder"], function (require, exports, extHost_api_impl_1, extHostExtensionService_1, uri_1, extHostRequireInterceptor_1, extHostTypes_1, async_1, extHostConsoleForwarder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kfc = void 0;
    class WorkerRequireInterceptor extends extHostRequireInterceptor_1.$edc {
        j() { }
        getModule(request, parent) {
            for (const alternativeModuleName of this.b) {
                const alternative = alternativeModuleName(request);
                if (alternative) {
                    request = alternative;
                    break;
                }
            }
            if (this.a.has(request)) {
                return this.a.get(request).load(request, parent, () => { throw new Error('CANNOT LOAD MODULE from here.'); });
            }
            return undefined;
        }
    }
    class $kfc extends extHostExtensionService_1.$Qbc {
        constructor() {
            super(...arguments);
            this.extensionRuntime = extHostTypes_1.ExtensionRuntime.Webworker;
        }
        async tb() {
            // make sure console.log calls make it to the render
            this.h.createInstance(extHostConsoleForwarder_1.$jfc);
            // initialize API and register actors
            const apiFactory = this.h.invokeFunction(extHost_api_impl_1.$adc);
            this.r = this.h.createInstance(WorkerRequireInterceptor, apiFactory, { mine: this.J, all: this.L });
            await this.r.install();
            performance.mark('code/extHost/didInitAPI');
            await this.zb();
        }
        ub(extensionDescription) {
            return extensionDescription.browser;
        }
        async vb(extension, module, activationTimesBuilder) {
            module = module.with({ path: ensureSuffix(module.path, '.js') });
            const extensionId = extension?.identifier.value;
            if (extensionId) {
                performance.mark(`code/extHost/willFetchExtensionCode/${extensionId}`);
            }
            // First resolve the extension entry point URI to something we can load using `fetch`
            // This needs to be done on the main thread due to a potential `resourceUriProvider` (workbench api)
            // which is only available in the main thread
            const browserUri = uri_1.URI.revive(await this.C.$asBrowserUri(module));
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
                await this.w.initializeLocalizedMessages(extension);
            }
            // define commonjs globals: `module`, `exports`, and `require`
            const _exports = {};
            const _module = { exports: _exports };
            const _require = (request) => {
                const result = this.r.getModule(request, module);
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
        async zb(waitTimeout = 5000) {
            // debugger attaches async, waiting for it fixes #106698 and #99222
            if (!this.f.environment.isExtensionDevelopmentDebug) {
                return;
            }
            const deadline = Date.now() + waitTimeout;
            while (Date.now() < deadline && !('__jsDebugIsReady' in globalThis)) {
                await (0, async_1.$Hg)(10);
            }
        }
    }
    exports.$kfc = $kfc;
    function ensureSuffix(path, suffix) {
        return path.endsWith(suffix) ? path : path + suffix;
    }
});
//# sourceMappingURL=extHostExtensionService.js.map