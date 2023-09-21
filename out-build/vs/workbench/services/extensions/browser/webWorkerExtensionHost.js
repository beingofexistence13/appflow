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
    exports.$u3b = void 0;
    let $u3b = class $u3b extends lifecycle_1.$kc {
        constructor(runningLocation, startup, h, j, m, n, r, s, t, u, w, y, z) {
            super();
            this.runningLocation = runningLocation;
            this.startup = startup;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.remoteAuthority = null;
            this.extensions = null;
            this.a = this.B(new event_1.$fd());
            this.onExit = this.a.event;
            this.b = false;
            this.c = null;
            this.f = null;
            this.g = (0, resources_1.$ig)(this.t.extHostLogsPath, 'webWorker');
        }
        async C() {
            const suffixSearchParams = new URLSearchParams();
            if (this.t.debugExtensionHost && this.t.debugRenderer) {
                suffixSearchParams.set('debugged', '1');
            }
            network_1.COI.addSearchParam(suffixSearchParams, true, true);
            const suffix = `?${suffixSearchParams.toString()}`;
            const iframeModulePath = 'vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html';
            if (platform.$o) {
                const webEndpointUrlTemplate = this.w.webEndpointUrlTemplate;
                const commit = this.w.commit;
                const quality = this.w.quality;
                if (webEndpointUrlTemplate && commit && quality) {
                    // Try to keep the web worker extension host iframe origin stable by storing it in workspace storage
                    const key = 'webWorkerExtensionHostIframeStableOriginUUID';
                    let stableOriginUUID = this.z.get(key, 1 /* StorageScope.WORKSPACE */);
                    if (typeof stableOriginUUID === 'undefined') {
                        stableOriginUUID = (0, uuid_1.$4f)();
                        this.z.store(key, stableOriginUUID, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                    }
                    const hash = await (0, iframe_1.$dO)(window.origin, stableOriginUUID);
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
            const relativeExtensionHostIframeSrc = network_1.$2f.asBrowserUri(iframeModulePath);
            return `${relativeExtensionHostIframeSrc.toString(true)}${suffix}`;
        }
        async start() {
            if (!this.c) {
                this.c = this.D();
                this.c.then(protocol => this.f = protocol);
            }
            return this.c;
        }
        async D() {
            const webWorkerExtensionHostIframeSrc = await this.C();
            const emitter = this.B(new event_1.$fd());
            const iframe = document.createElement('iframe');
            iframe.setAttribute('class', 'web-worker-ext-host-iframe');
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
            iframe.setAttribute('allow', 'usb; serial; hid; cross-origin-isolated;');
            iframe.setAttribute('aria-hidden', 'true');
            iframe.style.display = 'none';
            const vscodeWebWorkerExtHostId = (0, uuid_1.$4f)();
            iframe.setAttribute('src', `${webWorkerExtensionHostIframeSrc}&vscodeWebWorkerExtHostId=${vscodeWebWorkerExtHostId}`);
            const barrier = new async_1.$Fg();
            let port;
            let barrierError = null;
            let barrierHasError = false;
            let startTimeout = null;
            const rejectBarrier = (exitCode, error) => {
                barrierError = error;
                barrierHasError = true;
                (0, errors_1.$Y)(barrierError);
                clearTimeout(startTimeout);
                this.a.fire([81 /* ExtensionHostExitCode.UnexpectedError */, barrierError.message]);
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
            this.B(dom.$nO(window, 'message', (event) => {
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
            this.y.container.appendChild(iframe);
            this.B((0, lifecycle_1.$ic)(() => iframe.remove()));
            // await MessagePort and use it to directly communicate
            // with the worker extension host
            await barrier.wait();
            if (barrierHasError) {
                throw barrierError;
            }
            // Send over message ports for extension API
            const messagePorts = this.t.options?.messagePorts ?? new Map();
            iframe.contentWindow.postMessage({ type: 'vscode.init', data: messagePorts }, '*', [...messagePorts.values()]);
            port.onmessage = (event) => {
                const { data } = event;
                if (!(data instanceof ArrayBuffer)) {
                    console.warn('UNKNOWN data received', data);
                    this.a.fire([77, 'UNKNOWN data received']);
                    return;
                }
                emitter.fire(buffer_1.$Fd.wrap(new Uint8Array(data, 0, data.byteLength)));
            };
            const protocol = {
                onMessage: emitter.event,
                send: vsbuf => {
                    const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                    port.postMessage(data, [data]);
                }
            };
            return this.F(protocol);
        }
        async F(protocol) {
            // extension host handshake happens below
            // (1) <== wait for: Ready
            // (2) ==> send: init data
            // (3) <== wait for: Initialized
            await event_1.Event.toPromise(event_1.Event.filter(protocol.onMessage, msg => (0, extensionHostProtocol_1.$5l)(msg, 1 /* MessageType.Ready */)));
            if (this.b) {
                throw (0, errors_1.$4)();
            }
            protocol.send(buffer_1.$Fd.fromString(JSON.stringify(await this.G())));
            if (this.b) {
                throw (0, errors_1.$4)();
            }
            await event_1.Event.toPromise(event_1.Event.filter(protocol.onMessage, msg => (0, extensionHostProtocol_1.$5l)(msg, 0 /* MessageType.Initialized */)));
            if (this.b) {
                throw (0, errors_1.$4)();
            }
            return protocol;
        }
        dispose() {
            if (this.b) {
                return;
            }
            this.b = true;
            this.f?.send((0, extensionHostProtocol_1.$4l)(2 /* MessageType.Terminate */));
            super.dispose();
        }
        getInspectPort() {
            return undefined;
        }
        enableInspectPort() {
            return Promise.resolve(false);
        }
        async G() {
            const initData = await this.h.getInitData();
            this.extensions = initData.extensions;
            const workspace = this.m.getWorkspace();
            const nlsBaseUrl = this.w.extensionsGallery?.nlsBaseUrl;
            let nlsUrlWithDetails = undefined;
            // Only use the nlsBaseUrl if we are using a language other than the default, English.
            if (nlsBaseUrl && this.w.commit && !platform.Language.isDefaultVariant()) {
                nlsUrlWithDetails = uri_1.URI.joinPath(uri_1.URI.parse(nlsBaseUrl), this.w.commit, this.w.version, platform.Language.value());
            }
            return {
                commit: this.w.commit,
                version: this.w.version,
                quality: this.w.quality,
                parentPid: 0,
                environment: {
                    isExtensionDevelopmentDebug: this.t.debugRenderer,
                    appName: this.w.nameLong,
                    appHost: this.w.embedderIdentifier ?? (platform.$o ? 'web' : 'desktop'),
                    appUriScheme: this.w.urlProtocol,
                    appLanguage: platform.$v,
                    extensionTelemetryLogResource: this.t.extHostTelemetryLogFile,
                    isExtensionTelemetryLoggingOnly: (0, telemetryUtils_1.$io)(this.w, this.t),
                    extensionDevelopmentLocationURI: this.t.extensionDevelopmentLocationURI,
                    extensionTestsLocationURI: this.t.extensionTestsLocationURI,
                    globalStorageHome: this.u.defaultProfile.globalStorageHome,
                    workspaceStorageHome: this.t.workspaceStorageHome,
                    extensionLogLevel: this.t.extensionLogLevel
                },
                workspace: this.m.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? undefined : {
                    configuration: workspace.configuration || undefined,
                    id: workspace.id,
                    name: this.n.getWorkspaceLabel(workspace),
                    transient: workspace.transient
                },
                consoleForward: {
                    includeStack: false,
                    logNative: this.t.debugRenderer
                },
                extensions: this.extensions.toSnapshot(),
                nlsBaseUrl: nlsUrlWithDetails,
                telemetryInfo: {
                    sessionId: this.j.sessionId,
                    machineId: this.j.machineId,
                    firstSessionDate: this.j.firstSessionDate,
                    msftInternal: this.j.msftInternal
                },
                logLevel: this.r.getLevel(),
                loggers: [...this.s.getRegisteredLoggers()],
                logsLocation: this.g,
                autoStart: (this.startup === 1 /* ExtensionHostStartup.EagerAutoStart */),
                remote: {
                    authority: this.t.remoteAuthority,
                    connectionData: null,
                    isRemote: false
                },
                uiKind: platform.$o ? extensionHostProtocol_1.UIKind.Web : extensionHostProtocol_1.UIKind.Desktop
            };
        }
    };
    exports.$u3b = $u3b;
    exports.$u3b = $u3b = __decorate([
        __param(3, telemetry_1.$9k),
        __param(4, workspace_1.$Kh),
        __param(5, label_1.$Vz),
        __param(6, log_1.$5i),
        __param(7, log_1.$6i),
        __param(8, environmentService_1.$LT),
        __param(9, userDataProfile_1.$Ek),
        __param(10, productService_1.$kj),
        __param(11, layoutService_1.$XT),
        __param(12, storage_1.$Vo)
    ], $u3b);
});
//# sourceMappingURL=webWorkerExtensionHost.js.map