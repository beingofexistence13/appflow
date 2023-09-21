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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/iframe", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/label/common/label", "vs/platform/layout/browser/layoutService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/extensions/common/extensionHostProtocol"], function (require, exports, dom, iframe_1, async_1, buffer_1, errors_1, event_1, lifecycle_1, network_1, platform, resources_1, uri_1, uuid_1, label_1, layoutService_1, log_1, productService_1, storage_1, telemetry_1, telemetryUtils_1, userDataProfile_1, workspace_1, environmentService_1, extensionHostProtocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebWorkerExtensionHost = void 0;
    let WebWorkerExtensionHost = class WebWorkerExtensionHost extends lifecycle_1.Disposable {
        constructor(runningLocation, startup, _initDataProvider, _telemetryService, _contextService, _labelService, _logService, _loggerService, _environmentService, _userDataProfilesService, _productService, _layoutService, _storageService) {
            super();
            this.runningLocation = runningLocation;
            this.startup = startup;
            this._initDataProvider = _initDataProvider;
            this._telemetryService = _telemetryService;
            this._contextService = _contextService;
            this._labelService = _labelService;
            this._logService = _logService;
            this._loggerService = _loggerService;
            this._environmentService = _environmentService;
            this._userDataProfilesService = _userDataProfilesService;
            this._productService = _productService;
            this._layoutService = _layoutService;
            this._storageService = _storageService;
            this.remoteAuthority = null;
            this.extensions = null;
            this._onDidExit = this._register(new event_1.Emitter());
            this.onExit = this._onDidExit.event;
            this._isTerminating = false;
            this._protocolPromise = null;
            this._protocol = null;
            this._extensionHostLogsLocation = (0, resources_1.joinPath)(this._environmentService.extHostLogsPath, 'webWorker');
        }
        async _getWebWorkerExtensionHostIframeSrc() {
            const suffixSearchParams = new URLSearchParams();
            if (this._environmentService.debugExtensionHost && this._environmentService.debugRenderer) {
                suffixSearchParams.set('debugged', '1');
            }
            network_1.COI.addSearchParam(suffixSearchParams, true, true);
            const suffix = `?${suffixSearchParams.toString()}`;
            const iframeModulePath = 'vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html';
            if (platform.isWeb) {
                const webEndpointUrlTemplate = this._productService.webEndpointUrlTemplate;
                const commit = this._productService.commit;
                const quality = this._productService.quality;
                if (webEndpointUrlTemplate && commit && quality) {
                    // Try to keep the web worker extension host iframe origin stable by storing it in workspace storage
                    const key = 'webWorkerExtensionHostIframeStableOriginUUID';
                    let stableOriginUUID = this._storageService.get(key, 1 /* StorageScope.WORKSPACE */);
                    if (typeof stableOriginUUID === 'undefined') {
                        stableOriginUUID = (0, uuid_1.generateUuid)();
                        this._storageService.store(key, stableOriginUUID, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                    }
                    const hash = await (0, iframe_1.parentOriginHash)(window.origin, stableOriginUUID);
                    const baseUrl = (webEndpointUrlTemplate
                        .replace('{{uuid}}', `v--${hash}`) // using `v--` as a marker to require `parentOrigin`/`salt` verification
                        .replace('{{commit}}', commit)
                        .replace('{{quality}}', quality));
                    const res = new URL(`${baseUrl}/out/${iframeModulePath}${suffix}`);
                    res.searchParams.set('parentOrigin', window.origin);
                    res.searchParams.set('salt', stableOriginUUID);
                    return res.toString();
                }
                console.warn(`The web worker extension host is started in a same-origin iframe!`);
            }
            const relativeExtensionHostIframeSrc = network_1.FileAccess.asBrowserUri(iframeModulePath);
            return `${relativeExtensionHostIframeSrc.toString(true)}${suffix}`;
        }
        async start() {
            if (!this._protocolPromise) {
                this._protocolPromise = this._startInsideIframe();
                this._protocolPromise.then(protocol => this._protocol = protocol);
            }
            return this._protocolPromise;
        }
        async _startInsideIframe() {
            const webWorkerExtensionHostIframeSrc = await this._getWebWorkerExtensionHostIframeSrc();
            const emitter = this._register(new event_1.Emitter());
            const iframe = document.createElement('iframe');
            iframe.setAttribute('class', 'web-worker-ext-host-iframe');
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
            iframe.setAttribute('allow', 'usb; serial; hid; cross-origin-isolated;');
            iframe.setAttribute('aria-hidden', 'true');
            iframe.style.display = 'none';
            const vscodeWebWorkerExtHostId = (0, uuid_1.generateUuid)();
            iframe.setAttribute('src', `${webWorkerExtensionHostIframeSrc}&vscodeWebWorkerExtHostId=${vscodeWebWorkerExtHostId}`);
            const barrier = new async_1.Barrier();
            let port;
            let barrierError = null;
            let barrierHasError = false;
            let startTimeout = null;
            const rejectBarrier = (exitCode, error) => {
                barrierError = error;
                barrierHasError = true;
                (0, errors_1.onUnexpectedError)(barrierError);
                clearTimeout(startTimeout);
                this._onDidExit.fire([81 /* ExtensionHostExitCode.UnexpectedError */, barrierError.message]);
                barrier.open();
            };
            const resolveBarrier = (messagePort) => {
                port = messagePort;
                clearTimeout(startTimeout);
                barrier.open();
            };
            startTimeout = setTimeout(() => {
                console.warn(`The Web Worker Extension Host did not start in 60s, that might be a problem.`);
            }, 60000);
            this._register(dom.addDisposableListener(window, 'message', (event) => {
                if (event.source !== iframe.contentWindow) {
                    return;
                }
                if (event.data.vscodeWebWorkerExtHostId !== vscodeWebWorkerExtHostId) {
                    return;
                }
                if (event.data.error) {
                    const { name, message, stack } = event.data.error;
                    const err = new Error();
                    err.message = message;
                    err.name = name;
                    err.stack = stack;
                    return rejectBarrier(81 /* ExtensionHostExitCode.UnexpectedError */, err);
                }
                const { data } = event.data;
                if (barrier.isOpen() || !(data instanceof MessagePort)) {
                    console.warn('UNEXPECTED message', event);
                    const err = new Error('UNEXPECTED message');
                    return rejectBarrier(81 /* ExtensionHostExitCode.UnexpectedError */, err);
                }
                resolveBarrier(data);
            }));
            this._layoutService.container.appendChild(iframe);
            this._register((0, lifecycle_1.toDisposable)(() => iframe.remove()));
            // await MessagePort and use it to directly communicate
            // with the worker extension host
            await barrier.wait();
            if (barrierHasError) {
                throw barrierError;
            }
            // Send over message ports for extension API
            const messagePorts = this._environmentService.options?.messagePorts ?? new Map();
            iframe.contentWindow.postMessage({ type: 'vscode.init', data: messagePorts }, '*', [...messagePorts.values()]);
            port.onmessage = (event) => {
                const { data } = event;
                if (!(data instanceof ArrayBuffer)) {
                    console.warn('UNKNOWN data received', data);
                    this._onDidExit.fire([77, 'UNKNOWN data received']);
                    return;
                }
                emitter.fire(buffer_1.VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength)));
            };
            const protocol = {
                onMessage: emitter.event,
                send: vsbuf => {
                    const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                    port.postMessage(data, [data]);
                }
            };
            return this._performHandshake(protocol);
        }
        async _performHandshake(protocol) {
            // extension host handshake happens below
            // (1) <== wait for: Ready
            // (2) ==> send: init data
            // (3) <== wait for: Initialized
            await event_1.Event.toPromise(event_1.Event.filter(protocol.onMessage, msg => (0, extensionHostProtocol_1.isMessageOfType)(msg, 1 /* MessageType.Ready */)));
            if (this._isTerminating) {
                throw (0, errors_1.canceled)();
            }
            protocol.send(buffer_1.VSBuffer.fromString(JSON.stringify(await this._createExtHostInitData())));
            if (this._isTerminating) {
                throw (0, errors_1.canceled)();
            }
            await event_1.Event.toPromise(event_1.Event.filter(protocol.onMessage, msg => (0, extensionHostProtocol_1.isMessageOfType)(msg, 0 /* MessageType.Initialized */)));
            if (this._isTerminating) {
                throw (0, errors_1.canceled)();
            }
            return protocol;
        }
        dispose() {
            if (this._isTerminating) {
                return;
            }
            this._isTerminating = true;
            this._protocol?.send((0, extensionHostProtocol_1.createMessageOfType)(2 /* MessageType.Terminate */));
            super.dispose();
        }
        getInspectPort() {
            return undefined;
        }
        enableInspectPort() {
            return Promise.resolve(false);
        }
        async _createExtHostInitData() {
            const initData = await this._initDataProvider.getInitData();
            this.extensions = initData.extensions;
            const workspace = this._contextService.getWorkspace();
            const nlsBaseUrl = this._productService.extensionsGallery?.nlsBaseUrl;
            let nlsUrlWithDetails = undefined;
            // Only use the nlsBaseUrl if we are using a language other than the default, English.
            if (nlsBaseUrl && this._productService.commit && !platform.Language.isDefaultVariant()) {
                nlsUrlWithDetails = uri_1.URI.joinPath(uri_1.URI.parse(nlsBaseUrl), this._productService.commit, this._productService.version, platform.Language.value());
            }
            return {
                commit: this._productService.commit,
                version: this._productService.version,
                quality: this._productService.quality,
                parentPid: 0,
                environment: {
                    isExtensionDevelopmentDebug: this._environmentService.debugRenderer,
                    appName: this._productService.nameLong,
                    appHost: this._productService.embedderIdentifier ?? (platform.isWeb ? 'web' : 'desktop'),
                    appUriScheme: this._productService.urlProtocol,
                    appLanguage: platform.language,
                    extensionTelemetryLogResource: this._environmentService.extHostTelemetryLogFile,
                    isExtensionTelemetryLoggingOnly: (0, telemetryUtils_1.isLoggingOnly)(this._productService, this._environmentService),
                    extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                    extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                    globalStorageHome: this._userDataProfilesService.defaultProfile.globalStorageHome,
                    workspaceStorageHome: this._environmentService.workspaceStorageHome,
                    extensionLogLevel: this._environmentService.extensionLogLevel
                },
                workspace: this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? undefined : {
                    configuration: workspace.configuration || undefined,
                    id: workspace.id,
                    name: this._labelService.getWorkspaceLabel(workspace),
                    transient: workspace.transient
                },
                consoleForward: {
                    includeStack: false,
                    logNative: this._environmentService.debugRenderer
                },
                extensions: this.extensions.toSnapshot(),
                nlsBaseUrl: nlsUrlWithDetails,
                telemetryInfo: {
                    sessionId: this._telemetryService.sessionId,
                    machineId: this._telemetryService.machineId,
                    firstSessionDate: this._telemetryService.firstSessionDate,
                    msftInternal: this._telemetryService.msftInternal
                },
                logLevel: this._logService.getLevel(),
                loggers: [...this._loggerService.getRegisteredLoggers()],
                logsLocation: this._extensionHostLogsLocation,
                autoStart: (this.startup === 1 /* ExtensionHostStartup.EagerAutoStart */),
                remote: {
                    authority: this._environmentService.remoteAuthority,
                    connectionData: null,
                    isRemote: false
                },
                uiKind: platform.isWeb ? extensionHostProtocol_1.UIKind.Web : extensionHostProtocol_1.UIKind.Desktop
            };
        }
    };
    exports.WebWorkerExtensionHost = WebWorkerExtensionHost;
    exports.WebWorkerExtensionHost = WebWorkerExtensionHost = __decorate([
        __param(3, telemetry_1.ITelemetryService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, label_1.ILabelService),
        __param(6, log_1.ILogService),
        __param(7, log_1.ILoggerService),
        __param(8, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(9, userDataProfile_1.IUserDataProfilesService),
        __param(10, productService_1.IProductService),
        __param(11, layoutService_1.ILayoutService),
        __param(12, storage_1.IStorageService)
    ], WebWorkerExtensionHost);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViV29ya2VyRXh0ZW5zaW9uSG9zdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2Jyb3dzZXIvd2ViV29ya2VyRXh0ZW5zaW9uSG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQ3pGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsc0JBQVU7UUFjckQsWUFDaUIsZUFBOEMsRUFDOUMsT0FBNkIsRUFDNUIsaUJBQXNELEVBQ3BELGlCQUFxRCxFQUM5QyxlQUEwRCxFQUNyRSxhQUE2QyxFQUMvQyxXQUF5QyxFQUN0QyxjQUErQyxFQUMxQixtQkFBeUUsRUFDcEYsd0JBQW1FLEVBQzVFLGVBQWlELEVBQ2xELGNBQStDLEVBQzlDLGVBQWlEO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBZFEsb0JBQWUsR0FBZixlQUFlLENBQStCO1lBQzlDLFlBQU8sR0FBUCxPQUFPLENBQXNCO1lBQzVCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBcUM7WUFDbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUM3QixvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7WUFDcEQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDOUIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDckIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ1Qsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQztZQUNuRSw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQzNELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNqQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDN0Isb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBekJuRCxvQkFBZSxHQUFHLElBQUksQ0FBQztZQUNoQyxlQUFVLEdBQW1DLElBQUksQ0FBQztZQUV4QyxlQUFV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