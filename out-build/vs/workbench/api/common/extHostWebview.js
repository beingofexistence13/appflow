/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/uri", "vs/platform/extensions/common/extensionValidator", "vs/workbench/api/common/extHostWebviewMessaging", "vs/workbench/contrib/webview/common/webview", "./extHost.protocol"], function (require, exports, event_1, lifecycle_1, network_1, objects, uri_1, extensionValidator_1, extHostWebviewMessaging_1, webview_1, extHostProtocol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bcc = exports.$acc = exports.$_bc = exports.$$bc = exports.$0bc = void 0;
    class $0bc {
        #handle;
        #proxy;
        #deprecationService;
        #remoteInfo;
        #workspace;
        #extension;
        #html;
        #options;
        #isDisposed;
        #hasCalledAsWebviewUri;
        #serializeBuffersForPostMessage;
        #shouldRewriteOldResourceUris;
        constructor(handle, proxy, options, remoteInfo, workspace, extension, deprecationService) {
            this.#html = '';
            this.#isDisposed = false;
            this.#hasCalledAsWebviewUri = false;
            /* internal */ this._onMessageEmitter = new event_1.$fd();
            this.onDidReceiveMessage = this._onMessageEmitter.event;
            this.#onDidDisposeEmitter = new event_1.$fd();
            /* internal */ this._onDidDispose = this.#onDidDisposeEmitter.event;
            this.#handle = handle;
            this.#proxy = proxy;
            this.#options = options;
            this.#remoteInfo = remoteInfo;
            this.#workspace = workspace;
            this.#extension = extension;
            this.#serializeBuffersForPostMessage = $$bc(extension);
            this.#shouldRewriteOldResourceUris = shouldTryRewritingOldResourceUris(extension);
            this.#deprecationService = deprecationService;
        }
        #onDidDisposeEmitter;
        dispose() {
            this.#isDisposed = true;
            this.#onDidDisposeEmitter.fire();
            this.#onDidDisposeEmitter.dispose();
            this._onMessageEmitter.dispose();
        }
        asWebviewUri(resource) {
            this.#hasCalledAsWebviewUri = true;
            return (0, webview_1.$Yob)(resource, this.#remoteInfo);
        }
        get cspSource() {
            const extensionLocation = this.#extension.extensionLocation;
            if (extensionLocation.scheme === network_1.Schemas.https || extensionLocation.scheme === network_1.Schemas.http) {
                // The extension is being served up from a CDN.
                // Also include the CDN in the default csp.
                let extensionCspRule = extensionLocation.toString();
                if (!extensionCspRule.endsWith('/')) {
                    // Always treat the location as a directory so that we allow all content under it
                    extensionCspRule += '/';
                }
                return extensionCspRule + ' ' + webview_1.$Xob;
            }
            return webview_1.$Xob;
        }
        get html() {
            this.a();
            return this.#html;
        }
        set html(value) {
            this.a();
            if (this.#html !== value) {
                this.#html = value;
                if (this.#shouldRewriteOldResourceUris && !this.#hasCalledAsWebviewUri && /(["'])vscode-resource:([^\s'"]+?)(["'])/i.test(value)) {
                    this.#hasCalledAsWebviewUri = true;
                    this.#deprecationService.report('Webview vscode-resource: uris', this.#extension, `Please migrate to use the 'webview.asWebviewUri' api instead: https://aka.ms/vscode-webview-use-aswebviewuri`);
                }
                this.#proxy.$setHtml(this.#handle, this.b(value));
            }
        }
        get options() {
            this.a();
            return this.#options;
        }
        set options(newOptions) {
            this.a();
            if (!objects.$Zm(this.#options, newOptions)) {
                this.#proxy.$setOptions(this.#handle, $bcc(this.#extension, this.#workspace, newOptions));
            }
            this.#options = newOptions;
        }
        async postMessage(message) {
            if (this.#isDisposed) {
                return false;
            }
            const serialized = (0, extHostWebviewMessaging_1.$$bb)(message, { serializeBuffersForPostMessage: this.#serializeBuffersForPostMessage });
            return this.#proxy.$postMessage(this.#handle, serialized.message, ...serialized.buffers);
        }
        a() {
            if (this.#isDisposed) {
                throw new Error('Webview is disposed');
            }
        }
        b(value) {
            if (!this.#shouldRewriteOldResourceUris) {
                return value;
            }
            const isRemote = this.#extension.extensionLocation?.scheme === network_1.Schemas.vscodeRemote;
            const remoteAuthority = this.#extension.extensionLocation.scheme === network_1.Schemas.vscodeRemote ? this.#extension.extensionLocation.authority : undefined;
            return value
                .replace(/(["'])(?:vscode-resource):(\/\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_match, startQuote, _1, scheme, path, endQuote) => {
                const uri = uri_1.URI.from({
                    scheme: scheme || 'file',
                    path: decodeURIComponent(path),
                });
                const webviewUri = (0, webview_1.$Yob)(uri, { isRemote, authority: remoteAuthority }).toString();
                return `${startQuote}${webviewUri}${endQuote}`;
            })
                .replace(/(["'])(?:vscode-webview-resource):(\/\/[^\s\/'"]+\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_match, startQuote, _1, scheme, path, endQuote) => {
                const uri = uri_1.URI.from({
                    scheme: scheme || 'file',
                    path: decodeURIComponent(path),
                });
                const webviewUri = (0, webview_1.$Yob)(uri, { isRemote, authority: remoteAuthority }).toString();
                return `${startQuote}${webviewUri}${endQuote}`;
            });
        }
    }
    exports.$0bc = $0bc;
    function $$bc(extension) {
        try {
            const version = (0, extensionValidator_1.$Do)((0, extensionValidator_1.$Co)(extension.engines.vscode));
            return !!version && version.majorBase >= 1 && version.minorBase >= 57;
        }
        catch {
            return false;
        }
    }
    exports.$$bc = $$bc;
    function shouldTryRewritingOldResourceUris(extension) {
        try {
            const version = (0, extensionValidator_1.$Do)((0, extensionValidator_1.$Co)(extension.engines.vscode));
            if (!version) {
                return false;
            }
            return version.majorBase < 1 || (version.majorBase === 1 && version.minorBase < 60);
        }
        catch {
            return false;
        }
    }
    class $_bc extends lifecycle_1.$kc {
        constructor(mainContext, c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = new Map();
            this.a = mainContext.getProxy(extHostProtocol.$1J.MainThreadWebviews);
        }
        dispose() {
            super.dispose();
            for (const webview of this.b.values()) {
                webview.dispose();
            }
            this.b.clear();
        }
        $onMessage(handle, jsonMessage, buffers) {
            const webview = this.j(handle);
            if (webview) {
                const { message } = (0, extHostWebviewMessaging_1.$_bb)(jsonMessage, buffers.value);
                webview._onMessageEmitter.fire(message);
            }
        }
        $onMissingCsp(_handle, extensionId) {
            this.g.warn(`${extensionId} created a webview without a content security policy: https://aka.ms/vscode-webview-missing-csp`);
        }
        createNewWebview(handle, options, extension) {
            const webview = new $0bc(handle, this.a, reviveOptions(options), this.c, this.f, extension, this.h);
            this.b.set(handle, webview);
            const sub = webview._onDidDispose(() => {
                sub.dispose();
                this.deleteWebview(handle);
            });
            return webview;
        }
        deleteWebview(handle) {
            this.b.delete(handle);
        }
        j(handle) {
            return this.b.get(handle);
        }
    }
    exports.$_bc = $_bc;
    function $acc(extension) {
        return { id: extension.identifier, location: extension.extensionLocation };
    }
    exports.$acc = $acc;
    function $bcc(extension, workspace, options) {
        return {
            enableCommandUris: options.enableCommandUris,
            enableScripts: options.enableScripts,
            enableForms: options.enableForms,
            portMapping: options.portMapping,
            localResourceRoots: options.localResourceRoots || getDefaultLocalResourceRoots(extension, workspace)
        };
    }
    exports.$bcc = $bcc;
    function reviveOptions(options) {
        return {
            enableCommandUris: options.enableCommandUris,
            enableScripts: options.enableScripts,
            enableForms: options.enableForms,
            portMapping: options.portMapping,
            localResourceRoots: options.localResourceRoots?.map(components => uri_1.URI.from(components)),
        };
    }
    function getDefaultLocalResourceRoots(extension, workspace) {
        return [
            ...(workspace?.getWorkspaceFolders() || []).map(x => x.uri),
            extension.extensionLocation,
        ];
    }
});
//# sourceMappingURL=extHostWebview.js.map