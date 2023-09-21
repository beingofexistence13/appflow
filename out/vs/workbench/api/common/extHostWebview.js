/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/uri", "vs/platform/extensions/common/extensionValidator", "vs/workbench/api/common/extHostWebviewMessaging", "vs/workbench/contrib/webview/common/webview", "./extHost.protocol"], function (require, exports, event_1, lifecycle_1, network_1, objects, uri_1, extensionValidator_1, extHostWebviewMessaging_1, webview_1, extHostProtocol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serializeWebviewOptions = exports.toExtensionData = exports.ExtHostWebviews = exports.shouldSerializeBuffersForPostMessage = exports.ExtHostWebview = void 0;
    class ExtHostWebview {
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
            /* internal */ this._onMessageEmitter = new event_1.Emitter();
            this.onDidReceiveMessage = this._onMessageEmitter.event;
            this.#onDidDisposeEmitter = new event_1.Emitter();
            /* internal */ this._onDidDispose = this.#onDidDisposeEmitter.event;
            this.#handle = handle;
            this.#proxy = proxy;
            this.#options = options;
            this.#remoteInfo = remoteInfo;
            this.#workspace = workspace;
            this.#extension = extension;
            this.#serializeBuffersForPostMessage = shouldSerializeBuffersForPostMessage(extension);
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
            return (0, webview_1.asWebviewUri)(resource, this.#remoteInfo);
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
                return extensionCspRule + ' ' + webview_1.webviewGenericCspSource;
            }
            return webview_1.webviewGenericCspSource;
        }
        get html() {
            this.assertNotDisposed();
            return this.#html;
        }
        set html(value) {
            this.assertNotDisposed();
            if (this.#html !== value) {
                this.#html = value;
                if (this.#shouldRewriteOldResourceUris && !this.#hasCalledAsWebviewUri && /(["'])vscode-resource:([^\s'"]+?)(["'])/i.test(value)) {
                    this.#hasCalledAsWebviewUri = true;
                    this.#deprecationService.report('Webview vscode-resource: uris', this.#extension, `Please migrate to use the 'webview.asWebviewUri' api instead: https://aka.ms/vscode-webview-use-aswebviewuri`);
                }
                this.#proxy.$setHtml(this.#handle, this.rewriteOldResourceUrlsIfNeeded(value));
            }
        }
        get options() {
            this.assertNotDisposed();
            return this.#options;
        }
        set options(newOptions) {
            this.assertNotDisposed();
            if (!objects.equals(this.#options, newOptions)) {
                this.#proxy.$setOptions(this.#handle, serializeWebviewOptions(this.#extension, this.#workspace, newOptions));
            }
            this.#options = newOptions;
        }
        async postMessage(message) {
            if (this.#isDisposed) {
                return false;
            }
            const serialized = (0, extHostWebviewMessaging_1.serializeWebviewMessage)(message, { serializeBuffersForPostMessage: this.#serializeBuffersForPostMessage });
            return this.#proxy.$postMessage(this.#handle, serialized.message, ...serialized.buffers);
        }
        assertNotDisposed() {
            if (this.#isDisposed) {
                throw new Error('Webview is disposed');
            }
        }
        rewriteOldResourceUrlsIfNeeded(value) {
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
                const webviewUri = (0, webview_1.asWebviewUri)(uri, { isRemote, authority: remoteAuthority }).toString();
                return `${startQuote}${webviewUri}${endQuote}`;
            })
                .replace(/(["'])(?:vscode-webview-resource):(\/\/[^\s\/'"]+\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_match, startQuote, _1, scheme, path, endQuote) => {
                const uri = uri_1.URI.from({
                    scheme: scheme || 'file',
                    path: decodeURIComponent(path),
                });
                const webviewUri = (0, webview_1.asWebviewUri)(uri, { isRemote, authority: remoteAuthority }).toString();
                return `${startQuote}${webviewUri}${endQuote}`;
            });
        }
    }
    exports.ExtHostWebview = ExtHostWebview;
    function shouldSerializeBuffersForPostMessage(extension) {
        try {
            const version = (0, extensionValidator_1.normalizeVersion)((0, extensionValidator_1.parseVersion)(extension.engines.vscode));
            return !!version && version.majorBase >= 1 && version.minorBase >= 57;
        }
        catch {
            return false;
        }
    }
    exports.shouldSerializeBuffersForPostMessage = shouldSerializeBuffersForPostMessage;
    function shouldTryRewritingOldResourceUris(extension) {
        try {
            const version = (0, extensionValidator_1.normalizeVersion)((0, extensionValidator_1.parseVersion)(extension.engines.vscode));
            if (!version) {
                return false;
            }
            return version.majorBase < 1 || (version.majorBase === 1 && version.minorBase < 60);
        }
        catch {
            return false;
        }
    }
    class ExtHostWebviews extends lifecycle_1.Disposable {
        constructor(mainContext, remoteInfo, workspace, _logService, _deprecationService) {
            super();
            this.remoteInfo = remoteInfo;
            this.workspace = workspace;
            this._logService = _logService;
            this._deprecationService = _deprecationService;
            this._webviews = new Map();
            this._webviewProxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadWebviews);
        }
        dispose() {
            super.dispose();
            for (const webview of this._webviews.values()) {
                webview.dispose();
            }
            this._webviews.clear();
        }
        $onMessage(handle, jsonMessage, buffers) {
            const webview = this.getWebview(handle);
            if (webview) {
                const { message } = (0, extHostWebviewMessaging_1.deserializeWebviewMessage)(jsonMessage, buffers.value);
                webview._onMessageEmitter.fire(message);
            }
        }
        $onMissingCsp(_handle, extensionId) {
            this._logService.warn(`${extensionId} created a webview without a content security policy: https://aka.ms/vscode-webview-missing-csp`);
        }
        createNewWebview(handle, options, extension) {
            const webview = new ExtHostWebview(handle, this._webviewProxy, reviveOptions(options), this.remoteInfo, this.workspace, extension, this._deprecationService);
            this._webviews.set(handle, webview);
            const sub = webview._onDidDispose(() => {
                sub.dispose();
                this.deleteWebview(handle);
            });
            return webview;
        }
        deleteWebview(handle) {
            this._webviews.delete(handle);
        }
        getWebview(handle) {
            return this._webviews.get(handle);
        }
    }
    exports.ExtHostWebviews = ExtHostWebviews;
    function toExtensionData(extension) {
        return { id: extension.identifier, location: extension.extensionLocation };
    }
    exports.toExtensionData = toExtensionData;
    function serializeWebviewOptions(extension, workspace, options) {
        return {
            enableCommandUris: options.enableCommandUris,
            enableScripts: options.enableScripts,
            enableForms: options.enableForms,
            portMapping: options.portMapping,
            localResourceRoots: options.localResourceRoots || getDefaultLocalResourceRoots(extension, workspace)
        };
    }
    exports.serializeWebviewOptions = serializeWebviewOptions;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdlYnZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0V2Vidmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQmhHLE1BQWEsY0FBYztRQUVqQixPQUFPLENBQWdDO1FBQ3ZDLE1BQU0sQ0FBMEM7UUFDaEQsbUJBQW1CLENBQWdDO1FBRW5ELFdBQVcsQ0FBb0I7UUFDL0IsVUFBVSxDQUFnQztRQUMxQyxVQUFVLENBQXdCO1FBRTNDLEtBQUssQ0FBYztRQUNuQixRQUFRLENBQXdCO1FBQ2hDLFdBQVcsQ0FBa0I7UUFDN0Isc0JBQXNCLENBQVM7UUFFL0IsK0JBQStCLENBQVU7UUFDekMsNkJBQTZCLENBQVU7UUFFdkMsWUFDQyxNQUFxQyxFQUNyQyxLQUE4QyxFQUM5QyxPQUE4QixFQUM5QixVQUE2QixFQUM3QixTQUF3QyxFQUN4QyxTQUFnQyxFQUNoQyxrQkFBaUQ7WUFmbEQsVUFBSyxHQUFXLEVBQUUsQ0FBQztZQUVuQixnQkFBVyxHQUFZLEtBQUssQ0FBQztZQUM3QiwyQkFBc0IsR0FBRyxLQUFLLENBQUM7WUF5Qi9CLGNBQWMsQ0FBVSxzQkFBaUIsR0FBRyxJQUFJLGVBQU8sRUFBTyxDQUFDO1lBQy9DLHdCQUFtQixHQUFlLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7WUFFdEUseUJBQW9CLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUNwRCxjQUFjLENBQVUsa0JBQWEsR0FBZ0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQztZQWZwRixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMs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