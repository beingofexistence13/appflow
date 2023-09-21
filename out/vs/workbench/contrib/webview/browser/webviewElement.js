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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/telemetry/common/telemetry", "vs/platform/tunnel/common/tunnel", "vs/platform/webview/common/webviewPortMapping", "vs/base/browser/iframe", "vs/workbench/contrib/webview/browser/resourceLoading", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/browser/webviewFindWidget", "vs/workbench/contrib/webview/common/webview", "vs/workbench/services/environment/common/environmentService"], function (require, exports, browser_1, dom_1, async_1, buffer_1, cancellation_1, event_1, lifecycle_1, network_1, uri_1, uuid_1, nls_1, accessibility_1, actions_1, configuration_1, contextView_1, files_1, instantiation_1, log_1, notification_1, remoteAuthorityResolver_1, telemetry_1, tunnel_1, webviewPortMapping_1, iframe_1, resourceLoading_1, webview_1, webviewFindWidget_1, webview_2, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewElement = void 0;
    var WebviewState;
    (function (WebviewState) {
        let Type;
        (function (Type) {
            Type[Type["Initializing"] = 0] = "Initializing";
            Type[Type["Ready"] = 1] = "Ready";
        })(Type = WebviewState.Type || (WebviewState.Type = {}));
        class Initializing {
            constructor(pendingMessages) {
                this.pendingMessages = pendingMessages;
                this.type = 0 /* Type.Initializing */;
            }
        }
        WebviewState.Initializing = Initializing;
        WebviewState.Ready = { type: 1 /* Type.Ready */ };
    })(WebviewState || (WebviewState = {}));
    const webviewIdContext = 'webviewId';
    let WebviewElement = class WebviewElement extends lifecycle_1.Disposable {
        get platform() { return 'browser'; }
        get element() { return this._element; }
        get isFocused() {
            if (!this._focused) {
                return false;
            }
            if (document.activeElement && document.activeElement !== this.element) {
                // looks like https://github.com/microsoft/vscode/issues/132641
                // where the focus is actually not in the `<iframe>`
                return false;
            }
            return true;
        }
        constructor(initInfo, webviewThemeDataProvider, configurationService, contextMenuService, notificationService, _environmentService, _fileService, _logService, _remoteAuthorityResolverService, _telemetryService, _tunnelService, instantiationService, _accessibilityService) {
            super();
            this.webviewThemeDataProvider = webviewThemeDataProvider;
            this._environmentService = _environmentService;
            this._fileService = _fileService;
            this._logService = _logService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._telemetryService = _telemetryService;
            this._tunnelService = _tunnelService;
            this._accessibilityService = _accessibilityService;
            this.id = (0, uuid_1.generateUuid)();
            this._expectedServiceWorkerVersion = 4; // Keep this in sync with the version in service-worker.js
            this._state = new WebviewState.Initializing([]);
            this._resourceLoadingCts = this._register(new cancellation_1.CancellationTokenSource());
            this._focusDelayer = this._register(new async_1.ThrottledDelayer(50));
            this._onDidHtmlChange = this._register(new event_1.Emitter());
            this.onDidHtmlChange = this._onDidHtmlChange.event;
            this._messageHandlers = new Map();
            this.checkImeCompletionState = true;
            this._disposed = false;
            this._onMissingCsp = this._register(new event_1.Emitter());
            this.onMissingCsp = this._onMissingCsp.event;
            this._onDidClickLink = this._register(new event_1.Emitter());
            this.onDidClickLink = this._onDidClickLink.event;
            this._onDidReload = this._register(new event_1.Emitter());
            this.onDidReload = this._onDidReload.event;
            this._onMessage = this._register(new event_1.Emitter());
            this.onMessage = this._onMessage.event;
            this._onDidScroll = this._register(new event_1.Emitter());
            this.onDidScroll = this._onDidScroll.event;
            this._onDidWheel = this._register(new event_1.Emitter());
            this.onDidWheel = this._onDidWheel.event;
            this._onDidUpdateState = this._register(new event_1.Emitter());
            this.onDidUpdateState = this._onDidUpdateState.event;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onFatalError = this._register(new event_1.Emitter());
            this.onFatalError = this._onFatalError.event;
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            this._hasAlertedAboutMissingCsp = false;
            this._hasFindResult = this._register(new event_1.Emitter());
            this.hasFindResult = this._hasFindResult.event;
            this._onDidStopFind = this._register(new event_1.Emitter());
            this.onDidStopFind = this._onDidStopFind.event;
            this.providedViewType = initInfo.providedViewType;
            this.origin = initInfo.origin ?? this.id;
            this._encodedWebviewOriginPromise = (0, iframe_1.parentOriginHash)(window.origin, this.origin).then(id => this._encodedWebviewOrigin = id);
            this._options = initInfo.options;
            this.extension = initInfo.extension;
            this._content = {
                html: '',
                title: initInfo.title,
                options: initInfo.contentOptions,
                state: undefined
            };
            this._portMappingManager = this._register(new webviewPortMapping_1.WebviewPortMappingManager(() => this.extension?.location, () => this._content.options.portMapping || [], this._tunnelService));
            this._element = this._createElement(initInfo.options, initInfo.contentOptions);
            const subscription = this._register((0, dom_1.addDisposableListener)(window, 'message', (e) => {
                if (!this._encodedWebviewOrigin || e?.data?.target !== this.id) {
                    return;
                }
                if (e.origin !== this._webviewContentOrigin(this._encodedWebviewOrigin)) {
                    console.log(`Skipped renderer receiving message due to mismatched origins: ${e.origin} ${this._webviewContentOrigin}`);
                    return;
                }
                if (e.data.channel === 'webview-ready') {
                    if (this._messagePort) {
                        return;
                    }
                    this._logService.debug(`Webview(${this.id}): webview ready`);
                    this._messagePort = e.ports[0];
                    this._messagePort.onmessage = (e) => {
                        const handlers = this._messageHandlers.get(e.data.channel);
                        if (!handlers) {
                            console.log(`No handlers found for '${e.data.channel}'`);
                            return;
                        }
                        handlers?.forEach(handler => handler(e.data.data, e));
                    };
                    this.element?.classList.add('ready');
                    if (this._state.type === 0 /* WebviewState.Type.Initializing */) {
                        this._state.pendingMessages.forEach(({ channel, data }) => this.doPostMessage(channel, data));
                    }
                    this._state = WebviewState.Ready;
                    subscription.dispose();
                }
            }));
            this._register(this.on('no-csp-found', () => {
                this.handleNoCspFound();
            }));
            this._register(this.on('did-click-link', ({ uri }) => {
                this._onDidClickLink.fire(uri);
            }));
            this._register(this.on('onmessage', ({ message, transfer }) => {
                this._onMessage.fire({ message, transfer });
            }));
            this._register(this.on('did-scroll', ({ scrollYPercentage }) => {
                this._onDidScroll.fire({ scrollYPercentage });
            }));
            this._register(this.on('do-reload', () => {
                this.reload();
            }));
            this._register(this.on('do-update-state', (state) => {
                this.state = state;
                this._onDidUpdateState.fire(state);
            }));
            this._register(this.on('did-focus', () => {
                this.handleFocusChange(true);
            }));
            this._register(this.on('did-blur', () => {
                this.handleFocusChange(false);
            }));
            this._register(this.on('did-scroll-wheel', (event) => {
                this._onDidWheel.fire(event);
            }));
            this._register(this.on('did-find', ({ didFind }) => {
                this._hasFindResult.fire(didFind);
            }));
            this._register(this.on('fatal-error', (e) => {
                notificationService.error((0, nls_1.localize)('fatalErrorMessage', "Error loading webview: {0}", e.message));
                this._onFatalError.fire({ message: e.message });
            }));
            this._register(this.on('did-keydown', (data) => {
                // Electron: workaround for https://github.com/electron/electron/issues/14258
                // We have to detect keyboard events in the <webview> and dispatch them to our
                // keybinding service because these events do not bubble to the parent window anymore.
                this.handleKeyEvent('keydown', data);
            }));
            this._register(this.on('did-keyup', (data) => {
                this.handleKeyEvent('keyup', data);
            }));
            this._register(this.on('did-context-menu', (data) => {
                if (!this.element) {
                    return;
                }
                if (!this._contextKeyService) {
                    return;
                }
                const elementBox = this.element.getBoundingClientRect();
                const contextKeyService = this._contextKeyService.createOverlay([
                    ...Object.entries(data.context),
                    [webviewIdContext, this.providedViewType],
                ]);
                contextMenuService.showContextMenu({
                    menuId: actions_1.MenuId.WebviewContext,
                    menuActionOptions: { shouldForwardArgs: true },
                    contextKeyService,
                    getActionsContext: () => ({ ...data.context, webview: this.providedViewType }),
                    getAnchor: () => ({
                        x: elementBox.x + data.clientX,
                        y: elementBox.y + data.clientY
                    })
                });
            }));
            this._register(this.on('load-resource', async (entry) => {
                try {
                    // Restore the authority we previously encoded
                    const authority = (0, webview_2.decodeAuthority)(entry.authority);
                    const uri = uri_1.URI.from({
                        scheme: entry.scheme,
                        authority: authority,
                        path: decodeURIComponent(entry.path),
                        query: entry.query ? decodeURIComponent(entry.query) : entry.query,
                    });
                    this.loadResource(entry.id, uri, entry.ifNoneMatch);
                }
                catch (e) {
                    this._send('did-load-resource', {
                        id: entry.id,
                        status: 404,
                        path: entry.path,
                    });
                }
            }));
            this._register(this.on('load-localhost', (entry) => {
                this.localLocalhost(entry.id, entry.origin);
            }));
            this._register(event_1.Event.runAndSubscribe(webviewThemeDataProvider.onThemeDataChanged, () => this.style()));
            this._register(_accessibilityService.onDidChangeReducedMotion(() => this.style()));
            this._register(_accessibilityService.onDidChangeScreenReaderOptimized(() => this.style()));
            this._register(contextMenuService.onDidShowContextMenu(() => this._send('set-context-menu-visible', { visible: true })));
            this._register(contextMenuService.onDidHideContextMenu(() => this._send('set-context-menu-visible', { visible: false })));
            this._confirmBeforeClose = configurationService.getValue('window.confirmBeforeClose');
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.confirmBeforeClose')) {
                    this._confirmBeforeClose = configurationService.getValue('window.confirmBeforeClose');
                    this._send('set-confirm-before-close', this._confirmBeforeClose);
                }
            }));
            this._register(this.on('drag-start', () => {
                this._startBlockingIframeDragEvents();
            }));
            if (initInfo.options.enableFindWidget) {
                this._webviewFindWidget = this._register(instantiationService.createInstance(webviewFindWidget_1.WebviewFindWidget, this));
            }
            this._encodedWebviewOriginPromise.then(encodedWebviewOrigin => {
                if (!this._disposed) {
                    this._initElement(encodedWebviewOrigin, this.extension, this._options);
                }
            });
        }
        dispose() {
            this._disposed = true;
            this.element?.remove();
            this._element = undefined;
            this._messagePort = undefined;
            if (this._state.type === 0 /* WebviewState.Type.Initializing */) {
                for (const message of this._state.pendingMessages) {
                    message.resolve(false);
                }
                this._state.pendingMessages = [];
            }
            this._onDidDispose.fire();
            this._resourceLoadingCts.dispose(true);
            super.dispose();
        }
        setContextKeyService(contextKeyService) {
            this._contextKeyService = contextKeyService;
        }
        postMessage(message, transfer) {
            return this._send('message', { message, transfer });
        }
        async _send(channel, data, _createElement = []) {
            if (this._state.type === 0 /* WebviewState.Type.Initializing */) {
                let resolve;
                const promise = new Promise(r => resolve = r);
                this._state.pendingMessages.push({ channel, data, transferable: _createElement, resolve: resolve });
                return promise;
            }
            else {
                return this.doPostMessage(channel, data, _createElement);
            }
        }
        _createElement(options, _contentOptions) {
            // Do not start loading the webview yet.
            // Wait the end of the ctor when all listeners have been hooked up.
            const element = document.createElement('iframe');
            element.name = this.id;
            element.className = `webview ${options.customClasses || ''}`;
            element.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms', 'allow-pointer-lock', 'allow-downloads');
            const allowRules = ['cross-origin-isolated', 'autoplay'];
            if (!browser_1.isFirefox) {
                allowRules.push('clipboard-read', 'clipboard-write');
            }
            element.setAttribute('allow', allowRules.join('; '));
            element.style.border = 'none';
            element.style.width = '100%';
            element.style.height = '100%';
            element.focus = () => {
                this._doFocus();
            };
            return element;
        }
        _initElement(encodedWebviewOrigin, extension, options) {
            // The extensionId and purpose in the URL are used for filtering in js-debug:
            const params = {
                id: this.id,
                origin: this.origin,
                swVersion: String(this._expectedServiceWorkerVersion),
                extensionId: extension?.id.value ?? '',
                platform: this.platform,
                'vscode-resource-base-authority': webview_2.webviewRootResourceAuthority,
                parentOrigin: window.origin,
            };
            if (this._options.disableServiceWorker) {
                params.disableServiceWorker = 'true';
            }
            if (this._environmentService.remoteAuthority) {
                params.remoteAuthority = this._environmentService.remoteAuthority;
            }
            if (options.purpose) {
                params.purpose = options.purpose;
            }
            network_1.COI.addSearchParam(params, true, true);
            const queryString = new URLSearchParams(params).toString();
            // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1754872
            const fileName = browser_1.isFirefox ? 'index-no-csp.html' : 'index.html';
            this.element.setAttribute('src', `${this.webviewContentEndpoint(encodedWebviewOrigin)}/${fileName}?${queryString}`);
        }
        mountTo(element) {
            if (!this.element) {
                return;
            }
            if (this._webviewFindWidget) {
                element.appendChild(this._webviewFindWidget.getDomNode());
            }
            for (const eventName of [dom_1.EventType.MOUSE_DOWN, dom_1.EventType.MOUSE_MOVE, dom_1.EventType.DROP]) {
                this._register((0, dom_1.addDisposableListener)(element, eventName, () => {
                    this._stopBlockingIframeDragEvents();
                }));
            }
            for (const node of [element, window]) {
                this._register((0, dom_1.addDisposableListener)(node, dom_1.EventType.DRAG_END, () => {
                    this._stopBlockingIframeDragEvents();
                }));
            }
            element.id = this.id; // This is used by aria-flow for accessibility order
            element.appendChild(this.element);
        }
        _startBlockingIframeDragEvents() {
            if (this.element) {
                this.element.style.pointerEvents = 'none';
            }
        }
        _stopBlockingIframeDragEvents() {
            if (this.element) {
                this.element.style.pointerEvents = 'auto';
            }
        }
        webviewContentEndpoint(encodedWebviewOrigin) {
            const webviewExternalEndpoint = this._environmentService.webviewExternalEndpoint;
            if (!webviewExternalEndpoint) {
                throw new Error(`'webviewExternalEndpoint' has not been configured. Webviews will not work!`);
            }
            const endpoint = webviewExternalEndpoint.replace('{{uuid}}', encodedWebviewOrigin);
            if (endpoint[endpoint.length - 1] === '/') {
                return endpoint.slice(0, endpoint.length - 1);
            }
            return endpoint;
        }
        _webviewContentOrigin(encodedWebviewOrigin) {
            const uri = uri_1.URI.parse(this.webviewContentEndpoint(encodedWebviewOrigin));
            return uri.scheme + '://' + uri.authority.toLowerCase();
        }
        doPostMessage(channel, data, transferable = []) {
            if (this.element && this._messagePort) {
                this._messagePort.postMessage({ channel, args: data }, transferable);
                return true;
            }
            return false;
        }
        on(channel, handler) {
            let handlers = this._messageHandlers.get(channel);
            if (!handlers) {
                handlers = new Set();
                this._messageHandlers.set(channel, handlers);
            }
            handlers.add(handler);
            return (0, lifecycle_1.toDisposable)(() => {
                this._messageHandlers.get(channel)?.delete(handler);
            });
        }
        handleNoCspFound() {
            if (this._hasAlertedAboutMissingCsp) {
                return;
            }
            this._hasAlertedAboutMissingCsp = true;
            if (this.extension?.id) {
                if (this._environmentService.isExtensionDevelopment) {
                    this._onMissingCsp.fire(this.extension.id);
                }
                const payload = {
                    extension: this.extension.id.value
                };
                this._telemetryService.publicLog2('webviewMissingCsp', payload);
            }
        }
        reload() {
            this.doUpdateContent(this._content);
            const subscription = this._register(this.on('did-load', () => {
                this._onDidReload.fire();
                subscription.dispose();
            }));
        }
        setHtml(html) {
            this.doUpdateContent({ ...this._content, html });
            this._onDidHtmlChange.fire(html);
        }
        setTitle(title) {
            this._content = { ...this._content, title };
            this._send('set-title', title);
        }
        set contentOptions(options) {
            this._logService.debug(`Webview(${this.id}): will update content options`);
            if ((0, webview_1.areWebviewContentOptionsEqual)(options, this._content.options)) {
                this._logService.debug(`Webview(${this.id}): skipping content options update`);
                return;
            }
            this.doUpdateContent({ ...this._content, options });
        }
        set localResourcesRoot(resources) {
            this._content = {
                ...this._content,
                options: { ...this._content.options, localResourceRoots: resources }
            };
        }
        set state(state) {
            this._content = { ...this._content, state };
        }
        set initialScrollProgress(value) {
            this._send('initial-scroll-position', value);
        }
        doUpdateContent(newContent) {
            this._logService.debug(`Webview(${this.id}): will update content`);
            this._content = newContent;
            const allowScripts = !!this._content.options.allowScripts;
            this._send('content', {
                contents: this._content.html,
                title: this._content.title,
                options: {
                    allowMultipleAPIAcquire: !!this._content.options.allowMultipleAPIAcquire,
                    allowScripts: allowScripts,
                    allowForms: this._content.options.allowForms ?? allowScripts, // For back compat, we allow forms by default when scripts are enabled
                },
                state: this._content.state,
                cspSource: webview_2.webviewGenericCspSource,
                confirmBeforeClose: this._confirmBeforeClose,
            });
        }
        style() {
            let { styles, activeTheme, themeLabel, themeId } = this.webviewThemeDataProvider.getWebviewThemeData();
            if (this._options.transformCssVariables) {
                styles = this._options.transformCssVariables(styles);
            }
            const reduceMotion = this._accessibilityService.isMotionReduced();
            const screenReader = this._accessibilityService.isScreenReaderOptimized();
            this._send('styles', { styles, activeTheme, themeId, themeLabel, reduceMotion, screenReader });
        }
        handleFocusChange(isFocused) {
            this._focused = isFocused;
            if (isFocused) {
                this._onDidFocus.fire();
            }
            else {
                this._onDidBlur.fire();
            }
        }
        handleKeyEvent(type, event) {
            // Create a fake KeyboardEvent from the data provided
            const emulatedKeyboardEvent = new KeyboardEvent(type, event);
            // Force override the target
            Object.defineProperty(emulatedKeyboardEvent, 'target', {
                get: () => this.element,
            });
            // And re-dispatch
            window.dispatchEvent(emulatedKeyboardEvent);
        }
        windowDidDragStart() {
            // Webview break drag and dropping around the main window (no events are generated when you are over them)
            // Work around this by disabling pointer events during the drag.
            // https://github.com/electron/electron/issues/18226
            this._startBlockingIframeDragEvents();
        }
        windowDidDragEnd() {
            this._stopBlockingIframeDragEvents();
        }
        selectAll() {
            this.execCommand('selectAll');
        }
        copy() {
            this.execCommand('copy');
        }
        paste() {
            this.execCommand('paste');
        }
        cut() {
            this.execCommand('cut');
        }
        undo() {
            this.execCommand('undo');
        }
        redo() {
            this.execCommand('redo');
        }
        execCommand(command) {
            if (this.element) {
                this._send('execCommand', command);
            }
        }
        async loadResource(id, uri, ifNoneMatch) {
            try {
                const result = await (0, resourceLoading_1.loadLocalResource)(uri, {
                    ifNoneMatch,
                    roots: this._content.options.localResourceRoots || [],
                }, this._fileService, this._logService, this._resourceLoadingCts.token);
                switch (result.type) {
                    case resourceLoading_1.WebviewResourceResponse.Type.Success: {
                        const buffer = await this.streamToBuffer(result.stream);
                        return this._send('did-load-resource', {
                            id,
                            status: 200,
                            path: uri.path,
                            mime: result.mimeType,
                            data: buffer,
                            etag: result.etag,
                            mtime: result.mtime
                        }, [buffer]);
                    }
                    case resourceLoading_1.WebviewResourceResponse.Type.NotModified: {
                        return this._send('did-load-resource', {
                            id,
                            status: 304,
                            path: uri.path,
                            mime: result.mimeType,
                            mtime: result.mtime
                        });
                    }
                    case resourceLoading_1.WebviewResourceResponse.Type.AccessDenied: {
                        return this._send('did-load-resource', {
                            id,
                            status: 401,
                            path: uri.path,
                        });
                    }
                }
            }
            catch {
                // noop
            }
            return this._send('did-load-resource', {
                id,
                status: 404,
                path: uri.path,
            });
        }
        async streamToBuffer(stream) {
            const vsBuffer = await (0, buffer_1.streamToBuffer)(stream);
            return vsBuffer.buffer.buffer;
        }
        async localLocalhost(id, origin) {
            const authority = this._environmentService.remoteAuthority;
            const resolveAuthority = authority ? await this._remoteAuthorityResolverService.resolveAuthority(authority) : undefined;
            const redirect = resolveAuthority ? await this._portMappingManager.getRedirect(resolveAuthority.authority, origin) : undefined;
            return this._send('did-load-localhost', {
                id,
                origin,
                location: redirect
            });
        }
        focus() {
            this._doFocus();
            // Handle focus change programmatically (do not rely on event from <webview>)
            this.handleFocusChange(true);
        }
        _doFocus() {
            if (!this.element) {
                return;
            }
            try {
                this.element.contentWindow?.focus();
            }
            catch {
                // noop
            }
            // Workaround for https://github.com/microsoft/vscode/issues/75209
            // Focusing the inner webview is async so for a sequence of actions such as:
            //
            // 1. Open webview
            // 1. Show quick pick from command palette
            //
            // We end up focusing the webview after showing the quick pick, which causes
            // the quick pick to instantly dismiss.
            //
            // Workaround this by debouncing the focus and making sure we are not focused on an input
            // when we try to re-focus.
            this._focusDelayer.trigger(async () => {
                if (!this.isFocused || !this.element) {
                    return;
                }
                if (document.activeElement && document.activeElement !== this.element && document.activeElement?.tagName !== 'BODY') {
                    return;
                }
                this._send('focus', undefined);
            });
        }
        /**
         * Webviews expose a stateful find API.
         * Successive calls to find will move forward or backward through onFindResults
         * depending on the supplied options.
         *
         * @param value The string to search for. Empty strings are ignored.
         */
        find(value, previous) {
            if (!this.element) {
                return;
            }
            this._send('find', { value, previous });
        }
        updateFind(value) {
            if (!value || !this.element) {
                return;
            }
            this._send('find', { value });
        }
        stopFind(keepSelection) {
            if (!this.element) {
                return;
            }
            this._send('find-stop', { clearSelection: !keepSelection });
            this._onDidStopFind.fire();
        }
        showFind(animated = true) {
            this._webviewFindWidget?.reveal(undefined, animated);
        }
        hideFind(animated = true) {
            this._webviewFindWidget?.hide(animated);
        }
        runFindAction(previous) {
            this._webviewFindWidget?.find(previous);
        }
    };
    exports.WebviewElement = WebviewElement;
    exports.WebviewElement = WebviewElement = __decorate([
        __param(2, configuration_1.IConfigurationService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, notification_1.INotificationService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, files_1.IFileService),
        __param(7, log_1.ILogService),
        __param(8, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, tunnel_1.ITunnelService),
        __param(11, instantiation_1.IInstantiationService),
        __param(12, accessibility_1.IAccessibilityService)
    ], WebviewElement);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0VsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2Jyb3dzZXIvd2Vidmlld0VsZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNENoRyxJQUFVLFlBQVksQ0FtQnJCO0lBbkJELFdBQVUsWUFBWTtRQUNyQixJQUFrQixJQUE0QjtRQUE5QyxXQUFrQixJQUFJO1lBQUcsK0NBQVksQ0FBQTtZQUFFLGlDQUFLLENBQUE7UUFBQyxDQUFDLEVBQTVCLElBQUksR0FBSixpQkFBSSxLQUFKLGlCQUFJLFFBQXdCO1FBRTlDLE1BQWEsWUFBWTtZQUd4QixZQUNRLGVBS0w7Z0JBTEssb0JBQWUsR0FBZixlQUFlLENBS3BCO2dCQVJNLFNBQUksNkJBQXFCO1lBUzlCLENBQUM7U0FDTDtRQVhZLHlCQUFZLGVBV3hCLENBQUE7UUFFWSxrQkFBSyxHQUFHLEVBQUUsSUFBSSxvQkFBWSxFQUFXLENBQUM7SUFHcEQsQ0FBQyxFQW5CUyxZQUFZLEtBQVosWUFBWSxRQW1CckI7SUFPRCxNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQztJQUU5QixJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsc0JBQVU7UUFpQjdDLElBQWMsUUFBUSxLQUFhLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUt0RCxJQUFjLE9BQU8sS0FBb0MsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUdoRixJQUFXLFNBQVM7WUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxJQUFJLFFBQVEsQ0FBQyxhQUFhLElBQUksUUFBUSxDQUFDLGFBQWEsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN0RSwrREFBK0Q7Z0JBQy9ELG9EQUFvRDtnQkFDcEQsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQStCRCxZQUNDLFFBQXlCLEVBQ04sd0JBQWtELEVBQzlDLG9CQUEyQyxFQUM3QyxrQkFBdUMsRUFDdEMsbUJBQXlDLEVBQ2pDLG1CQUFrRSxFQUNsRixZQUEyQyxFQUM1QyxXQUF5QyxFQUNyQiwrQkFBaUYsRUFDL0YsaUJBQXFELEVBQ3hELGNBQStDLEVBQ3hDLG9CQUEyQyxFQUMzQyxxQkFBNkQ7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFiVyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBSXRCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBOEI7WUFDakUsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDM0IsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDSixvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWlDO1lBQzlFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDdkMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBRXZCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUE3RWxFLE9BQUUsR0FBRyxJQUFBLG1CQUFZLEdBQUUsQ0FBQztZQWlCdEIsa0NBQTZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsMERBQTBEO1lBa0J0RyxXQUFNLEdBQXVCLElBQUksWUFBWSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQU10RCx3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksc0NBQXVCLEVBQUUsQ0FBQyxDQUFDO1lBTXBFLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFekQscUJBQWdCLEdBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVUsQ0FBQyxDQUFDO1lBQ3hFLG9CQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUdoRCxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBcUQsQ0FBQztZQUdqRiw0QkFBdUIsR0FBRyxJQUFJLENBQUM7WUFFdkMsY0FBUyxHQUFHLEtBQUssQ0FBQztZQXNQVCxrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXVCLENBQUMsQ0FBQztZQUNwRSxpQkFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBRXZDLG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVSxDQUFDLENBQUM7WUFDekQsbUJBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQztZQUUzQyxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3BELGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFFckMsZUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQStCLENBQUMsQ0FBQztZQUN6RSxjQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFFakMsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUEwQyxDQUFDLENBQUM7WUFDdEYsZ0JBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUVyQyxnQkFBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW9CLENBQUMsQ0FBQztZQUMvRCxlQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFFbkMsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBc0IsQ0FBQyxDQUFDO1lBQ3ZFLHFCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7WUFFL0MsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNuRCxlQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFFbkMsZUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2xELGNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUVqQyxrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWdDLENBQUMsQ0FBQztZQUM3RSxpQkFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBRXZDLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDckQsaUJBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztZQXlKaEQsK0JBQTBCLEdBQUcsS0FBSyxDQUFDO1lBK1F4QixtQkFBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVcsQ0FBQyxDQUFDO1lBQzNELGtCQUFhLEdBQW1CLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO1lBRXZELG1CQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDeEQsa0JBQWEsR0FBZ0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7WUExcUJ0RSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDO1lBQ2xELElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDO1lBRXpDLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFBLHlCQUFnQixFQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUU3SCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO1lBRXBDLElBQUksQ0FBQyxRQUFRLEdBQUc7Z0JBQ2YsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO2dCQUNyQixPQUFPLEVBQUUsUUFBUSxDQUFDLGNBQWM7Z0JBQ2hDLEtBQUssRUFBRSxTQUFTO2FBQ2hCLENBQUM7WUFFRixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDhDQUF5QixDQUN0RSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFDOUIsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLEVBQUUsRUFDN0MsSUFBSSxDQUFDLGNBQWMsQ0FDbkIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRy9FLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBZSxFQUFFLEVBQUU7Z0JBQ2hHLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEtBQUssSUFBSSxDQUFDLEVBQUUsRUFBRTtvQkFDL0QsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO29CQUN4RSxPQUFPLENBQUMsR0FBRyxDQUFDLGlFQUFpRSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7b0JBQ3ZILE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxlQUFlLEVBQUU7b0JBQ3ZDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTt3QkFDdEIsT0FBTztxQkFDUDtvQkFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7b0JBRTdELElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRTt3QkFDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMzRCxJQUFJLENBQUMsUUFBUSxFQUFFOzRCQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzs0QkFDekQsT0FBTzt5QkFDUDt3QkFDRCxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZELENBQUMsQ0FBQztvQkFFRixJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRXJDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLDJDQUFtQyxFQUFFO3dCQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDOUY7b0JBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO29CQUVqQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ3ZCO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO2dCQUNwRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUU7Z0JBQzdELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDN0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLEVBQUUsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7WUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO2dCQUN4QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUNuQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzNDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSw0QkFBNEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDbEcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDOUMsNkVBQTZFO2dCQUM3RSw4RUFBOEU7Z0JBQzlFLHNGQUFzRjtnQkFDdEYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDbEIsT0FBTztpQkFDUDtnQkFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFO29CQUM3QixPQUFPO2lCQUNQO2dCQUNELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDeEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQW1CLENBQUMsYUFBYSxDQUFDO29CQUNoRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDL0IsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUM7aUJBQ3pDLENBQUMsQ0FBQztnQkFDSCxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7b0JBQ2xDLE1BQU0sRUFBRSxnQkFBTSxDQUFDLGNBQWM7b0JBQzdCLGlCQUFpQixFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFO29CQUM5QyxpQkFBaUI7b0JBQ2pCLGlCQUFpQixFQUFFLEdBQXlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDcEcsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7d0JBQ2pCLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPO3dCQUM5QixDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTztxQkFDOUIsQ0FBQztpQkFDRixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ3ZELElBQUk7b0JBQ0gsOENBQThDO29CQUM5QyxNQUFNLFNBQVMsR0FBRyxJQUFBLHlCQUFlLEVBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNuRCxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDO3dCQUNwQixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07d0JBQ3BCLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixJQUFJLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzt3QkFDcEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUs7cUJBQ2xFLENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDcEQ7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1gsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRTt3QkFDL0IsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO3dCQUNaLE1BQU0sRUFBRSxHQUFHO3dCQUNYLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtxQkFDaEIsQ0FBQyxDQUFDO2lCQUNIO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNsRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxlQUFlLENBQUMsd0JBQXdCLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNGLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6SCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFMUgsSUFBSSxDQUFDLG1CQUFtQixHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBUywyQkFBMkIsQ0FBQyxDQUFDO1lBRTlGLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLDJCQUEyQixDQUFDLEVBQUU7b0JBQ3hELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQztvQkFDdEYsSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztpQkFDakU7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxxQ0FBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ3ZHO1lBRUQsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO2dCQUM3RCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDcEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdkU7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFFdEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztZQUUxQixJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztZQUU5QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSwyQ0FBbUMsRUFBRTtnQkFDeEQsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtvQkFDbEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDdkI7Z0JBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO2FBQ2pDO1lBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUUxQixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRUQsb0JBQW9CLENBQUMsaUJBQXFDO1lBQ3pELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztRQUM3QyxDQUFDO1FBbUNNLFdBQVcsQ0FBQyxPQUFZLEVBQUUsUUFBd0I7WUFDeEQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFTyxLQUFLLENBQUMsS0FBSyxDQUFtQyxPQUFVLEVBQUUsSUFBeUIsRUFBRSxpQkFBaUMsRUFBRTtZQUMvSCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSwyQ0FBbUMsRUFBRTtnQkFDeEQsSUFBSSxPQUE2QixDQUFDO2dCQUNsQyxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBVSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxPQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRyxPQUFPLE9BQU8sQ0FBQzthQUNmO2lCQUFNO2dCQUNOLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2FBQ3pEO1FBQ0YsQ0FBQztRQUVPLGNBQWMsQ0FBQyxPQUF1QixFQUFFLGVBQXNDO1lBQ3JGLHdDQUF3QztZQUN4QyxtRUFBbUU7WUFDbkUsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqRCxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdkIsT0FBTyxDQUFDLFNBQVMsR0FBRyxXQUFXLE9BQU8sQ0FBQyxhQUFhLElBQUksRUFBRSxFQUFFLENBQUM7WUFDN0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLG1CQUFtQixFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBRWxILE1BQU0sVUFBVSxHQUFHLENBQUMsdUJBQXVCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLG1CQUFTLEVBQUU7Z0JBQ2YsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3JEO1lBQ0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXJELE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDN0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBRTlCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFO2dCQUNwQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakIsQ0FBQyxDQUFDO1lBRUYsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVPLFlBQVksQ0FBQyxvQkFBNEIsRUFBRSxTQUFrRCxFQUFFLE9BQXVCO1lBQzdILDZFQUE2RTtZQUM3RSxNQUFNLE1BQU0sR0FBOEI7Z0JBQ3pDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDWCxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ25CLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDO2dCQUNyRCxXQUFXLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDdEMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUN2QixnQ0FBZ0MsRUFBRSxzQ0FBNEI7Z0JBQzlELFlBQVksRUFBRSxNQUFNLENBQUMsTUFBTTthQUMzQixDQUFDO1lBRUYsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFO2dCQUN2QyxNQUFNLENBQUMsb0JBQW9CLEdBQUcsTUFBTSxDQUFDO2FBQ3JDO1lBRUQsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFO2dCQUM3QyxNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUM7YUFDbEU7WUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7Z0JBQ3BCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQzthQUNqQztZQUVELGFBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUV2QyxNQUFNLFdBQVcsR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUzRCxzRUFBc0U7WUFDdEUsTUFBTSxRQUFRLEdBQUcsbUJBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUVoRSxJQUFJLENBQUMsT0FBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsSUFBSSxRQUFRLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQztRQUN0SCxDQUFDO1FBRU0sT0FBTyxDQUFDLE9BQW9CO1lBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNsQixPQUFPO2FBQ1A7WUFFRCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDNUIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzthQUMxRDtZQUVELEtBQUssTUFBTSxTQUFTLElBQUksQ0FBQyxlQUFTLENBQUMsVUFBVSxFQUFFLGVBQVMsQ0FBQyxVQUFVLEVBQUUsZUFBUyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNyRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUU7b0JBQzdELElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO2dCQUN0QyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsSUFBSSxFQUFFLGVBQVMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO29CQUNuRSxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztnQkFDdEMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsb0RBQW9EO1lBRTFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTyw4QkFBOEI7WUFDckMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO2FBQzFDO1FBQ0YsQ0FBQztRQUVPLDZCQUE2QjtZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7YUFDMUM7UUFDRixDQUFDO1FBRVMsc0JBQXNCLENBQUMsb0JBQTRCO1lBQzVELE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHVCQUF1QixDQUFDO1lBQ2pGLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO2FBQzlGO1lBRUQsTUFBTSxRQUFRLEdBQUcsdUJBQXVCLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ25GLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO2dCQUMxQyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDOUM7WUFDRCxPQUFPLFFBQVEsQ0FBQztRQUNqQixDQUFDO1FBRU8scUJBQXFCLENBQUMsb0JBQTRCO1lBQ3pELE1BQU0sR0FBRyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUN6RSxPQUFPLEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekQsQ0FBQztRQUVPLGFBQWEsQ0FBQyxPQUFlLEVBQUUsSUFBVSxFQUFFLGVBQStCLEVBQUU7WUFDbkYsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDckUsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVPLEVBQUUsQ0FBcUMsT0FBVSxFQUFFLE9BQStEO1lBQ3pILElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDN0M7WUFFRCxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBR08sZ0JBQWdCO1lBQ3ZCLElBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO2dCQUNwQyxPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO1lBRXZDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUU7Z0JBQ3ZCLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLHNCQUFzQixFQUFFO29CQUNwRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUMzQztnQkFFRCxNQUFNLE9BQU8sR0FBRztvQkFDZixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSztpQkFDekIsQ0FBQztnQkFRWCxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFpQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNoRztRQUNGLENBQUM7UUFFTSxNQUFNO1lBQ1osSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFcEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3pCLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVNLE9BQU8sQ0FBQyxJQUFZO1lBQzFCLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTSxRQUFRLENBQUMsS0FBYTtZQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxJQUFXLGNBQWMsQ0FBQyxPQUE4QjtZQUN2RCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFFM0UsSUFBSSxJQUFBLHVDQUE2QixFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNsRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7Z0JBQy9FLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsSUFBVyxrQkFBa0IsQ0FBQyxTQUF5QjtZQUN0RCxJQUFJLENBQUMsUUFBUSxHQUFHO2dCQUNmLEdBQUcsSUFBSSxDQUFDLFFBQVE7Z0JBQ2hCLE9BQU8sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFO2FBQ3BFLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBVyxLQUFLLENBQUMsS0FBeUI7WUFDekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRUQsSUFBVyxxQkFBcUIsQ0FBQyxLQUFhO1lBQzdDLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVPLGVBQWUsQ0FBQyxVQUEwQjtZQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxFQUFFLHdCQUF3QixDQUFDLENBQUM7WUFFbkUsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7WUFFM0IsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUMxRCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtnQkFDckIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTtnQkFDNUIsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSztnQkFDMUIsT0FBTyxFQUFFO29CQUNSLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUI7b0JBQ3hFLFlBQVksRUFBRSxZQUFZO29CQUMxQixVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLFlBQVksRUFBRSxzRUFBc0U7aUJBQ3BJO2dCQUNELEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUs7Z0JBQzFCLFNBQVMsRUFBRSxpQ0FBdUI7Z0JBQ2xDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxtQkFBbUI7YUFDNUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVTLEtBQUs7WUFDZCxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDdkcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFO2dCQUN4QyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNyRDtZQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNsRSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUUxRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNoRyxDQUFDO1FBR1MsaUJBQWlCLENBQUMsU0FBa0I7WUFDN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFDMUIsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUN4QjtpQkFBTTtnQkFDTixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3ZCO1FBQ0YsQ0FBQztRQUVPLGNBQWMsQ0FBQyxJQUF5QixFQUFFLEtBQWU7WUFDaEUscURBQXFEO1lBQ3JELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzdELDRCQUE0QjtZQUM1QixNQUFNLENBQUMsY0FBYyxDQUFDLHFCQUFxQixFQUFFLFFBQVEsRUFBRTtnQkFDdEQsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPO2FBQ3ZCLENBQUMsQ0FBQztZQUNILGtCQUFrQjtZQUNsQixNQUFNLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELGtCQUFrQjtZQUNqQiwwR0FBMEc7WUFDMUcsZ0VBQWdFO1lBQ2hFLG9EQUFvRDtZQUNwRCxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7UUFDdEMsQ0FBQztRQUVNLFNBQVM7WUFDZixJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTSxJQUFJO1lBQ1YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRU0sS0FBSztZQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVNLEdBQUc7WUFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFTSxJQUFJO1lBQ1YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRU0sSUFBSTtZQUNWLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVPLFdBQVcsQ0FBQyxPQUFlO1lBQ2xDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDbkM7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFVLEVBQUUsR0FBUSxFQUFFLFdBQStCO1lBQy9FLElBQUk7Z0JBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLG1DQUFpQixFQUFDLEdBQUcsRUFBRTtvQkFDM0MsV0FBVztvQkFDWCxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLElBQUksRUFBRTtpQkFDckQsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV4RSxRQUFRLE1BQU0sQ0FBQyxJQUFJLEVBQUU7b0JBQ3BCLEtBQUsseUNBQXVCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMxQyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUN4RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7NEJBQ3RDLEVBQUU7NEJBQ0YsTUFBTSxFQUFFLEdBQUc7NEJBQ1gsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJOzRCQUNkLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUTs0QkFDckIsSUFBSSxFQUFFLE1BQU07NEJBQ1osSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJOzRCQUNqQixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7eUJBQ25CLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3FCQUNiO29CQUNELEtBQUsseUNBQXVCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUM5QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7NEJBQ3RDLEVBQUU7NEJBQ0YsTUFBTSxFQUFFLEdBQUc7NEJBQ1gsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJOzRCQUNkLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUTs0QkFDckIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO3lCQUNuQixDQUFDLENBQUM7cUJBQ0g7b0JBQ0QsS0FBSyx5Q0FBdUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQy9DLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRTs0QkFDdEMsRUFBRTs0QkFDRixNQUFNLEVBQUUsR0FBRzs0QkFDWCxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7eUJBQ2QsQ0FBQyxDQUFDO3FCQUNIO2lCQUNEO2FBQ0Q7WUFBQyxNQUFNO2dCQUNQLE9BQU87YUFDUDtZQUVELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRTtnQkFDdEMsRUFBRTtnQkFDRixNQUFNLEVBQUUsR0FBRztnQkFDWCxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7YUFDZCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUE4QjtZQUM1RCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsdUJBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQy9CLENBQUM7UUFFTyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQVUsRUFBRSxNQUFjO1lBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUM7WUFDM0QsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLCtCQUErQixDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDeEgsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUMvSCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUU7Z0JBQ3ZDLEVBQUU7Z0JBQ0YsTUFBTTtnQkFDTixRQUFRLEVBQUUsUUFBUTthQUNsQixDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sS0FBSztZQUNYLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVoQiw2RUFBNkU7WUFDN0UsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFTyxRQUFRO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLE9BQU87YUFDUDtZQUVELElBQUk7Z0JBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDcEM7WUFBQyxNQUFNO2dCQUNQLE9BQU87YUFDUDtZQUVELGtFQUFrRTtZQUNsRSw0RUFBNEU7WUFDNUUsRUFBRTtZQUNGLGtCQUFrQjtZQUNsQiwwQ0FBMEM7WUFDMUMsRUFBRTtZQUNGLDRFQUE0RTtZQUM1RSx1Q0FBdUM7WUFDdkMsRUFBRTtZQUNGLHlGQUF5RjtZQUN6RiwyQkFBMkI7WUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDckMsT0FBTztpQkFDUDtnQkFFRCxJQUFJLFFBQVEsQ0FBQyxhQUFhLElBQUksUUFBUSxDQUFDLGFBQWEsS0FBSyxJQUFJLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxLQUFLLE1BQU0sRUFBRTtvQkFDcEgsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFRRDs7Ozs7O1dBTUc7UUFDSSxJQUFJLENBQUMsS0FBYSxFQUFFLFFBQWlCO1lBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNsQixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFTSxVQUFVLENBQUMsS0FBYTtZQUM5QixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDNUIsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTSxRQUFRLENBQUMsYUFBdUI7WUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTSxRQUFRLENBQUMsUUFBUSxHQUFHLElBQUk7WUFDOUIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVNLFFBQVEsQ0FBQyxRQUFRLEdBQUcsSUFBSTtZQUM5QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFTSxhQUFhLENBQUMsUUFBaUI7WUFDckMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0QsQ0FBQTtJQXh5Qlksd0NBQWM7NkJBQWQsY0FBYztRQXFFeEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsbUNBQW9CLENBQUE7UUFDcEIsV0FBQSxpREFBNEIsQ0FBQTtRQUM1QixXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLHlEQUErQixDQUFBO1FBQy9CLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsWUFBQSx1QkFBYyxDQUFBO1FBQ2QsWUFBQSxxQ0FBcUIsQ0FBQTtRQUNyQixZQUFBLHFDQUFxQixDQUFBO09BL0VYLGNBQWMsQ0F3eUIxQiJ9