/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/performance", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/rpcProtocol", "vs/platform/log/common/log", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/api/common/extHostInitDataService", "vs/platform/instantiation/common/instantiationService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostUriTransformerService", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostTelemetry"], function (require, exports, errors, performance, uri_1, extHost_protocol_1, rpcProtocol_1, log_1, extensions_1, serviceCollection_1, extHostInitDataService_1, instantiationService_1, extHostRpcService_1, extHostUriTransformerService_1, extHostExtensionService_1, extHostTelemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gdc = exports.$fdc = void 0;
    class $fdc {
        static async installEarlyHandler(accessor) {
            // increase number of stack frames (from 10, https://github.com/v8/v8/wiki/Stack-Trace-API)
            Error.stackTraceLimit = 100;
            // does NOT dependent of extension information, can be installed immediately, and simply forwards
            // to the log service and main thread errors
            const logService = accessor.get(log_1.$5i);
            const rpcService = accessor.get(extHostRpcService_1.$2L);
            const mainThreadErrors = rpcService.getProxy(extHost_protocol_1.$1J.MainThreadErrors);
            errors.setUnexpectedErrorHandler(err => {
                logService.error(err);
                const data = errors.$1(err);
                mainThreadErrors.$onUnexpectedError(data);
            });
        }
        static async installFullHandler(accessor) {
            // uses extension knowledges to correlate errors with extensions
            const logService = accessor.get(log_1.$5i);
            const rpcService = accessor.get(extHostRpcService_1.$2L);
            const extensionService = accessor.get(extHostExtensionService_1.$Rbc);
            const extensionTelemetry = accessor.get(extHostTelemetry_1.$jM);
            const mainThreadExtensions = rpcService.getProxy(extHost_protocol_1.$1J.MainThreadExtensionService);
            const mainThreadErrors = rpcService.getProxy(extHost_protocol_1.$1J.MainThreadErrors);
            const map = await extensionService.getExtensionPathIndex();
            const extensionErrors = new WeakMap();
            // PART 1
            // set the prepareStackTrace-handle and use it as a side-effect to associate errors
            // with extensions - this works by looking up callsites in the extension path index
            function prepareStackTraceAndFindExtension(error, stackTrace) {
                if (extensionErrors.has(error)) {
                    return extensionErrors.get(error).stack;
                }
                let stackTraceMessage = '';
                let extension;
                let fileName;
                for (const call of stackTrace) {
                    stackTraceMessage += `\n\tat ${call.toString()}`;
                    fileName = call.getFileName();
                    if (!extension && fileName) {
                        extension = map.findSubstr(uri_1.URI.file(fileName));
                    }
                }
                const result = `${error.name || 'Error'}: ${error.message || ''}${stackTraceMessage}`;
                extensionErrors.set(error, { extensionIdentifier: extension?.identifier, stack: result });
                return result;
            }
            const _wasWrapped = Symbol('prepareStackTrace wrapped');
            let _prepareStackTrace = prepareStackTraceAndFindExtension;
            Object.defineProperty(Error, 'prepareStackTrace', {
                configurable: false,
                get() {
                    return _prepareStackTrace;
                },
                set(v) {
                    if (v === prepareStackTraceAndFindExtension || !v || v[_wasWrapped]) {
                        _prepareStackTrace = v || prepareStackTraceAndFindExtension;
                        return;
                    }
                    _prepareStackTrace = function (error, stackTrace) {
                        prepareStackTraceAndFindExtension(error, stackTrace);
                        return v.call(Error, error, stackTrace);
                    };
                    Object.assign(_prepareStackTrace, { [_wasWrapped]: true });
                },
            });
            // PART 2
            // set the unexpectedErrorHandler and check for extensions that have been identified as
            // having caused the error. Note that the runtime order is actually reversed, the code
            // below accesses the stack-property which triggers the code above
            errors.setUnexpectedErrorHandler(err => {
                logService.error(err);
                const errorData = errors.$1(err);
                const stackData = extensionErrors.get(err);
                if (!stackData?.extensionIdentifier) {
                    mainThreadErrors.$onUnexpectedError(errorData);
                    return;
                }
                mainThreadExtensions.$onExtensionRuntimeError(stackData.extensionIdentifier, errorData);
                const reported = extensionTelemetry.onExtensionError(stackData.extensionIdentifier, err);
                logService.trace('forwarded error to extension?', reported, stackData);
            });
        }
    }
    exports.$fdc = $fdc;
    class $gdc {
        constructor(protocol, initData, hostUtils, uriTransformer, messagePorts) {
            this.a = hostUtils;
            this.b = new rpcProtocol_1.$H3b(protocol, null, uriTransformer);
            // ensure URIs are transformed and revived
            initData = $gdc.e(initData, this.b);
            // bootstrap services
            const services = new serviceCollection_1.$zh(...(0, extensions_1.$nr)());
            services.set(extHostInitDataService_1.$fM, { _serviceBrand: undefined, ...initData, messagePorts });
            services.set(extHostRpcService_1.$2L, new extHostRpcService_1.$3L(this.b));
            services.set(extHostUriTransformerService_1.$gbc, new extHostUriTransformerService_1.$hbc(uriTransformer));
            services.set(extHostExtensionService_1.$Pbc, hostUtils);
            const instaService = new instantiationService_1.$6p(services, true);
            instaService.invokeFunction($fdc.installEarlyHandler);
            // ugly self - inject
            this.d = instaService.invokeFunction(accessor => accessor.get(log_1.$5i));
            performance.mark(`code/extHost/didCreateServices`);
            if (this.a.pid) {
                this.d.info(`Extension host with pid ${this.a.pid} started`);
            }
            else {
                this.d.info(`Extension host started`);
            }
            this.d.trace('initData', initData);
            // ugly self - inject
            // must call initialize *after* creating the extension service
            // because `initialize` itself creates instances that depend on it
            this.c = instaService.invokeFunction(accessor => accessor.get(extHostExtensionService_1.$Rbc));
            this.c.initialize();
            // install error handler that is extension-aware
            instaService.invokeFunction($fdc.installFullHandler);
        }
        async asBrowserUri(uri) {
            const mainThreadExtensionsProxy = this.b.getProxy(extHost_protocol_1.$1J.MainThreadExtensionService);
            return uri_1.URI.revive(await mainThreadExtensionsProxy.$asBrowserUri(uri));
        }
        terminate(reason) {
            this.c.terminate(reason);
        }
        static e(initData, rpcProtocol) {
            initData.extensions.allExtensions.forEach((ext) => {
                ext.extensionLocation = uri_1.URI.revive(rpcProtocol.transformIncomingURIs(ext.extensionLocation));
            });
            initData.environment.appRoot = uri_1.URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.appRoot));
            const extDevLocs = initData.environment.extensionDevelopmentLocationURI;
            if (extDevLocs) {
                initData.environment.extensionDevelopmentLocationURI = extDevLocs.map(url => uri_1.URI.revive(rpcProtocol.transformIncomingURIs(url)));
            }
            initData.environment.extensionTestsLocationURI = uri_1.URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.extensionTestsLocationURI));
            initData.environment.globalStorageHome = uri_1.URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.globalStorageHome));
            initData.environment.workspaceStorageHome = uri_1.URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.workspaceStorageHome));
            initData.environment.extensionTelemetryLogResource = uri_1.URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.extensionTelemetryLogResource));
            initData.nlsBaseUrl = uri_1.URI.revive(rpcProtocol.transformIncomingURIs(initData.nlsBaseUrl));
            initData.logsLocation = uri_1.URI.revive(rpcProtocol.transformIncomingURIs(initData.logsLocation));
            initData.workspace = rpcProtocol.transformIncomingURIs(initData.workspace);
            return initData;
        }
    }
    exports.$gdc = $gdc;
});
//# sourceMappingURL=extensionHostMain.js.map