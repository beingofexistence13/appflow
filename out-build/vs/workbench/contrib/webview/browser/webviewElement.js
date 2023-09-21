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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls!vs/workbench/contrib/webview/browser/webviewElement", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/telemetry/common/telemetry", "vs/platform/tunnel/common/tunnel", "vs/platform/webview/common/webviewPortMapping", "vs/base/browser/iframe", "vs/workbench/contrib/webview/browser/resourceLoading", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/browser/webviewFindWidget", "vs/workbench/contrib/webview/common/webview", "vs/workbench/services/environment/common/environmentService"], function (require, exports, browser_1, dom_1, async_1, buffer_1, cancellation_1, event_1, lifecycle_1, network_1, uri_1, uuid_1, nls_1, accessibility_1, actions_1, configuration_1, contextView_1, files_1, instantiation_1, log_1, notification_1, remoteAuthorityResolver_1, telemetry_1, tunnel_1, webviewPortMapping_1, iframe_1, resourceLoading_1, webview_1, webviewFindWidget_1, webview_2, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$64b = void 0;
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
    let $64b = class $64b extends lifecycle_1.$kc {
        get f() { return 'browser'; }
        get j() { return this.h; }
        get isFocused() {
            if (!this.m) {
                return false;
            }
            if (document.activeElement && document.activeElement !== this.j) {
                // looks like https://github.com/microsoft/vscode/issues/132641
                // where the focus is actually not in the `<iframe>`
                return false;
            }
            return true;
        }
        constructor(initInfo, M, configurationService, contextMenuService, notificationService, N, O, P, Q, R, S, instantiationService, U) {
            super();
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.a = (0, uuid_1.$4f)();
            this.g = 4; // Keep this in sync with the version in service-worker.js
            this.n = new WebviewState.Initializing([]);
            this.u = this.B(new cancellation_1.$pd());
            this.C = this.B(new async_1.$Eg(50));
            this.D = this.B(new event_1.$fd());
            this.F = this.D.event;
            this.H = new Map();
            this.checkImeCompletionState = true;
            this.J = false;
            this.W = this.B(new event_1.$fd());
            this.onMissingCsp = this.W.event;
            this.X = this.B(new event_1.$fd());
            this.onDidClickLink = this.X.event;
            this.Y = this.B(new event_1.$fd());
            this.onDidReload = this.Y.event;
            this.Z = this.B(new event_1.$fd());
            this.onMessage = this.Z.event;
            this.$ = this.B(new event_1.$fd());
            this.onDidScroll = this.$.event;
            this.ab = this.B(new event_1.$fd());
            this.onDidWheel = this.ab.event;
            this.bb = this.B(new event_1.$fd());
            this.onDidUpdateState = this.bb.event;
            this.cb = this.B(new event_1.$fd());
            this.onDidFocus = this.cb.event;
            this.db = this.B(new event_1.$fd());
            this.onDidBlur = this.db.event;
            this.eb = this.B(new event_1.$fd());
            this.onFatalError = this.eb.event;
            this.fb = this.B(new event_1.$fd());
            this.onDidDispose = this.fb.event;
            this.pb = false;
            this.Ab = this.B(new event_1.$fd());
            this.hasFindResult = this.Ab.event;
            this.Bb = this.B(new event_1.$fd());
            this.onDidStopFind = this.Bb.event;
            this.providedViewType = initInfo.providedViewType;
            this.origin = initInfo.origin ?? this.a;
            this.b = (0, iframe_1.$dO)(window.origin, this.origin).then(id => this.c = id);
            this.L = initInfo.options;
            this.extension = initInfo.extension;
            this.s = {
                html: '',
                title: initInfo.title,
                options: initInfo.contentOptions,
                state: undefined
            };
            this.t = this.B(new webviewPortMapping_1.$Hbb(() => this.extension?.location, () => this.s.options.portMapping || [], this.S));
            this.h = this.hb(initInfo.options, initInfo.contentOptions);
            const subscription = this.B((0, dom_1.$nO)(window, 'message', (e) => {
                if (!this.c || e?.data?.target !== this.a) {
                    return;
                }
                if (e.origin !== this.mb(this.c)) {
                    console.log(`Skipped renderer receiving message due to mismatched origins: ${e.origin} ${this.mb}`);
                    return;
                }
                if (e.data.channel === 'webview-ready') {
                    if (this.G) {
                        return;
                    }
                    this.P.debug(`Webview(${this.a}): webview ready`);
                    this.G = e.ports[0];
                    this.G.onmessage = (e) => {
                        const handlers = this.H.get(e.data.channel);
                        if (!handlers) {
                            console.log(`No handlers found for '${e.data.channel}'`);
                            return;
                        }
                        handlers?.forEach(handler => handler(e.data.data, e));
                    };
                    this.j?.classList.add('ready');
                    if (this.n.type === 0 /* WebviewState.Type.Initializing */) {
                        this.n.pendingMessages.forEach(({ channel, data }) => this.nb(channel, data));
                    }
                    this.n = WebviewState.Ready;
                    subscription.dispose();
                }
            }));
            this.B(this.ob('no-csp-found', () => {
                this.qb();
            }));
            this.B(this.ob('did-click-link', ({ uri }) => {
                this.X.fire(uri);
            }));
            this.B(this.ob('onmessage', ({ message, transfer }) => {
                this.Z.fire({ message, transfer });
            }));
            this.B(this.ob('did-scroll', ({ scrollYPercentage }) => {
                this.$.fire({ scrollYPercentage });
            }));
            this.B(this.ob('do-reload', () => {
                this.reload();
            }));
            this.B(this.ob('do-update-state', (state) => {
                this.state = state;
                this.bb.fire(state);
            }));
            this.B(this.ob('did-focus', () => {
                this.tb(true);
            }));
            this.B(this.ob('did-blur', () => {
                this.tb(false);
            }));
            this.B(this.ob('did-scroll-wheel', (event) => {
                this.ab.fire(event);
            }));
            this.B(this.ob('did-find', ({ didFind }) => {
                this.Ab.fire(didFind);
            }));
            this.B(this.ob('fatal-error', (e) => {
                notificationService.error((0, nls_1.localize)(0, null, e.message));
                this.eb.fire({ message: e.message });
            }));
            this.B(this.ob('did-keydown', (data) => {
                // Electron: workaround for https://github.com/electron/electron/issues/14258
                // We have to detect keyboard events in the <webview> and dispatch them to our
                // keybinding service because these events do not bubble to the parent window anymore.
                this.ub('keydown', data);
            }));
            this.B(this.ob('did-keyup', (data) => {
                this.ub('keyup', data);
            }));
            this.B(this.ob('did-context-menu', (data) => {
                if (!this.j) {
                    return;
                }
                if (!this.w) {
                    return;
                }
                const elementBox = this.j.getBoundingClientRect();
                const contextKeyService = this.w.createOverlay([
                    ...Object.entries(data.context),
                    [webviewIdContext, this.providedViewType],
                ]);
                contextMenuService.showContextMenu({
                    menuId: actions_1.$Ru.WebviewContext,
                    menuActionOptions: { shouldForwardArgs: true },
                    contextKeyService,
                    getActionsContext: () => ({ ...data.context, webview: this.providedViewType }),
                    getAnchor: () => ({
                        x: elementBox.x + data.clientX,
                        y: elementBox.y + data.clientY
                    })
                });
            }));
            this.B(this.ob('load-resource', async (entry) => {
                try {
                    // Restore the authority we previously encoded
                    const authority = (0, webview_2.$Zob)(entry.authority);
                    const uri = uri_1.URI.from({
                        scheme: entry.scheme,
                        authority: authority,
                        path: decodeURIComponent(entry.path),
                        query: entry.query ? decodeURIComponent(entry.query) : entry.query,
                    });
                    this.wb(entry.id, uri, entry.ifNoneMatch);
                }
                catch (e) {
                    this.gb('did-load-resource', {
                        id: entry.id,
                        status: 404,
                        path: entry.path,
                    });
                }
            }));
            this.B(this.ob('load-localhost', (entry) => {
                this.yb(entry.id, entry.origin);
            }));
            this.B(event_1.Event.runAndSubscribe(M.onThemeDataChanged, () => this.sb()));
            this.B(U.onDidChangeReducedMotion(() => this.sb()));
            this.B(U.onDidChangeScreenReaderOptimized(() => this.sb()));
            this.B(contextMenuService.onDidShowContextMenu(() => this.gb('set-context-menu-visible', { visible: true })));
            this.B(contextMenuService.onDidHideContextMenu(() => this.gb('set-context-menu-visible', { visible: false })));
            this.z = configurationService.getValue('window.confirmBeforeClose');
            this.B(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.confirmBeforeClose')) {
                    this.z = configurationService.getValue('window.confirmBeforeClose');
                    this.gb('set-confirm-before-close', this.z);
                }
            }));
            this.B(this.ob('drag-start', () => {
                this.jb();
            }));
            if (initInfo.options.enableFindWidget) {
                this.I = this.B(instantiationService.createInstance(webviewFindWidget_1.$54b, this));
            }
            this.b.then(encodedWebviewOrigin => {
                if (!this.J) {
                    this.ib(encodedWebviewOrigin, this.extension, this.L);
                }
            });
        }
        dispose() {
            this.J = true;
            this.j?.remove();
            this.h = undefined;
            this.G = undefined;
            if (this.n.type === 0 /* WebviewState.Type.Initializing */) {
                for (const message of this.n.pendingMessages) {
                    message.resolve(false);
                }
                this.n.pendingMessages = [];
            }
            this.fb.fire();
            this.u.dispose(true);
            super.dispose();
        }
        setContextKeyService(contextKeyService) {
            this.w = contextKeyService;
        }
        postMessage(message, transfer) {
            return this.gb('message', { message, transfer });
        }
        async gb(channel, data, _createElement = []) {
            if (this.n.type === 0 /* WebviewState.Type.Initializing */) {
                let resolve;
                const promise = new Promise(r => resolve = r);
                this.n.pendingMessages.push({ channel, data, transferable: _createElement, resolve: resolve });
                return promise;
            }
            else {
                return this.nb(channel, data, _createElement);
            }
        }
        hb(options, _contentOptions) {
            // Do not start loading the webview yet.
            // Wait the end of the ctor when all listeners have been hooked up.
            const element = document.createElement('iframe');
            element.name = this.a;
            element.className = `webview ${options.customClasses || ''}`;
            element.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms', 'allow-pointer-lock', 'allow-downloads');
            const allowRules = ['cross-origin-isolated', 'autoplay'];
            if (!browser_1.$5N) {
                allowRules.push('clipboard-read', 'clipboard-write');
            }
            element.setAttribute('allow', allowRules.join('; '));
            element.style.border = 'none';
            element.style.width = '100%';
            element.style.height = '100%';
            element.focus = () => {
                this.zb();
            };
            return element;
        }
        ib(encodedWebviewOrigin, extension, options) {
            // The extensionId and purpose in the URL are used for filtering in js-debug:
            const params = {
                id: this.a,
                origin: this.origin,
                swVersion: String(this.g),
                extensionId: extension?.id.value ?? '',
                platform: this.f,
                'vscode-resource-base-authority': webview_2.$Wob,
                parentOrigin: window.origin,
            };
            if (this.L.disableServiceWorker) {
                params.disableServiceWorker = 'true';
            }
            if (this.N.remoteAuthority) {
                params.remoteAuthority = this.N.remoteAuthority;
            }
            if (options.purpose) {
                params.purpose = options.purpose;
            }
            network_1.COI.addSearchParam(params, true, true);
            const queryString = new URLSearchParams(params).toString();
            // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1754872
            const fileName = browser_1.$5N ? 'index-no-csp.html' : 'index.html';
            this.j.setAttribute('src', `${this.lb(encodedWebviewOrigin)}/${fileName}?${queryString}`);
        }
        mountTo(element) {
            if (!this.j) {
                return;
            }
            if (this.I) {
                element.appendChild(this.I.getDomNode());
            }
            for (const eventName of [dom_1.$3O.MOUSE_DOWN, dom_1.$3O.MOUSE_MOVE, dom_1.$3O.DROP]) {
                this.B((0, dom_1.$nO)(element, eventName, () => {
                    this.kb();
                }));
            }
            for (const node of [element, window]) {
                this.B((0, dom_1.$nO)(node, dom_1.$3O.DRAG_END, () => {
                    this.kb();
                }));
            }
            element.id = this.a; // This is used by aria-flow for accessibility order
            element.appendChild(this.j);
        }
        jb() {
            if (this.j) {
                this.j.style.pointerEvents = 'none';
            }
        }
        kb() {
            if (this.j) {
                this.j.style.pointerEvents = 'auto';
            }
        }
        lb(encodedWebviewOrigin) {
            const webviewExternalEndpoint = this.N.webviewExternalEndpoint;
            if (!webviewExternalEndpoint) {
                throw new Error(`'webviewExternalEndpoint' has not been configured. Webviews will not work!`);
            }
            const endpoint = webviewExternalEndpoint.replace('{{uuid}}', encodedWebviewOrigin);
            if (endpoint[endpoint.length - 1] === '/') {
                return endpoint.slice(0, endpoint.length - 1);
            }
            return endpoint;
        }
        mb(encodedWebviewOrigin) {
            const uri = uri_1.URI.parse(this.lb(encodedWebviewOrigin));
            return uri.scheme + '://' + uri.authority.toLowerCase();
        }
        nb(channel, data, transferable = []) {
            if (this.j && this.G) {
                this.G.postMessage({ channel, args: data }, transferable);
                return true;
            }
            return false;
        }
        ob(channel, handler) {
            let handlers = this.H.get(channel);
            if (!handlers) {
                handlers = new Set();
                this.H.set(channel, handlers);
            }
            handlers.add(handler);
            return (0, lifecycle_1.$ic)(() => {
                this.H.get(channel)?.delete(handler);
            });
        }
        qb() {
            if (this.pb) {
                return;
            }
            this.pb = true;
            if (this.extension?.id) {
                if (this.N.isExtensionDevelopment) {
                    this.W.fire(this.extension.id);
                }
                const payload = {
                    extension: this.extension.id.value
                };
                this.R.publicLog2('webviewMissingCsp', payload);
            }
        }
        reload() {
            this.rb(this.s);
            const subscription = this.B(this.ob('did-load', () => {
                this.Y.fire();
                subscription.dispose();
            }));
        }
        setHtml(html) {
            this.rb({ ...this.s, html });
            this.D.fire(html);
        }
        setTitle(title) {
            this.s = { ...this.s, title };
            this.gb('set-title', title);
        }
        set contentOptions(options) {
            this.P.debug(`Webview(${this.a}): will update content options`);
            if ((0, webview_1.$Mbb)(options, this.s.options)) {
                this.P.debug(`Webview(${this.a}): skipping content options update`);
                return;
            }
            this.rb({ ...this.s, options });
        }
        set localResourcesRoot(resources) {
            this.s = {
                ...this.s,
                options: { ...this.s.options, localResourceRoots: resources }
            };
        }
        set state(state) {
            this.s = { ...this.s, state };
        }
        set initialScrollProgress(value) {
            this.gb('initial-scroll-position', value);
        }
        rb(newContent) {
            this.P.debug(`Webview(${this.a}): will update content`);
            this.s = newContent;
            const allowScripts = !!this.s.options.allowScripts;
            this.gb('content', {
                contents: this.s.html,
                title: this.s.title,
                options: {
                    allowMultipleAPIAcquire: !!this.s.options.allowMultipleAPIAcquire,
                    allowScripts: allowScripts,
                    allowForms: this.s.options.allowForms ?? allowScripts, // For back compat, we allow forms by default when scripts are enabled
                },
                state: this.s.state,
                cspSource: webview_2.$Xob,
                confirmBeforeClose: this.z,
            });
        }
        sb() {
            let { styles, activeTheme, themeLabel, themeId } = this.M.getWebviewThemeData();
            if (this.L.transformCssVariables) {
                styles = this.L.transformCssVariables(styles);
            }
            const reduceMotion = this.U.isMotionReduced();
            const screenReader = this.U.isScreenReaderOptimized();
            this.gb('styles', { styles, activeTheme, themeId, themeLabel, reduceMotion, screenReader });
        }
        tb(isFocused) {
            this.m = isFocused;
            if (isFocused) {
                this.cb.fire();
            }
            else {
                this.db.fire();
            }
        }
        ub(type, event) {
            // Create a fake KeyboardEvent from the data provided
            const emulatedKeyboardEvent = new KeyboardEvent(type, event);
            // Force override the target
            Object.defineProperty(emulatedKeyboardEvent, 'target', {
                get: () => this.j,
            });
            // And re-dispatch
            window.dispatchEvent(emulatedKeyboardEvent);
        }
        windowDidDragStart() {
            // Webview break drag and dropping around the main window (no events are generated when you are over them)
            // Work around this by disabling pointer events during the drag.
            // https://github.com/electron/electron/issues/18226
            this.jb();
        }
        windowDidDragEnd() {
            this.kb();
        }
        selectAll() {
            this.vb('selectAll');
        }
        copy() {
            this.vb('copy');
        }
        paste() {
            this.vb('paste');
        }
        cut() {
            this.vb('cut');
        }
        undo() {
            this.vb('undo');
        }
        redo() {
            this.vb('redo');
        }
        vb(command) {
            if (this.j) {
                this.gb('execCommand', command);
            }
        }
        async wb(id, uri, ifNoneMatch) {
            try {
                const result = await (0, resourceLoading_1.$44b)(uri, {
                    ifNoneMatch,
                    roots: this.s.options.localResourceRoots || [],
                }, this.O, this.P, this.u.token);
                switch (result.type) {
                    case resourceLoading_1.WebviewResourceResponse.Type.Success: {
                        const buffer = await this.xb(result.stream);
                        return this.gb('did-load-resource', {
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
                        return this.gb('did-load-resource', {
                            id,
                            status: 304,
                            path: uri.path,
                            mime: result.mimeType,
                            mtime: result.mtime
                        });
                    }
                    case resourceLoading_1.WebviewResourceResponse.Type.AccessDenied: {
                        return this.gb('did-load-resource', {
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
            return this.gb('did-load-resource', {
                id,
                status: 404,
                path: uri.path,
            });
        }
        async xb(stream) {
            const vsBuffer = await (0, buffer_1.$Rd)(stream);
            return vsBuffer.buffer.buffer;
        }
        async yb(id, origin) {
            const authority = this.N.remoteAuthority;
            const resolveAuthority = authority ? await this.Q.resolveAuthority(authority) : undefined;
            const redirect = resolveAuthority ? await this.t.getRedirect(resolveAuthority.authority, origin) : undefined;
            return this.gb('did-load-localhost', {
                id,
                origin,
                location: redirect
            });
        }
        focus() {
            this.zb();
            // Handle focus change programmatically (do not rely on event from <webview>)
            this.tb(true);
        }
        zb() {
            if (!this.j) {
                return;
            }
            try {
                this.j.contentWindow?.focus();
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
            this.C.trigger(async () => {
                if (!this.isFocused || !this.j) {
                    return;
                }
                if (document.activeElement && document.activeElement !== this.j && document.activeElement?.tagName !== 'BODY') {
                    return;
                }
                this.gb('focus', undefined);
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
            if (!this.j) {
                return;
            }
            this.gb('find', { value, previous });
        }
        updateFind(value) {
            if (!value || !this.j) {
                return;
            }
            this.gb('find', { value });
        }
        stopFind(keepSelection) {
            if (!this.j) {
                return;
            }
            this.gb('find-stop', { clearSelection: !keepSelection });
            this.Bb.fire();
        }
        showFind(animated = true) {
            this.I?.reveal(undefined, animated);
        }
        hideFind(animated = true) {
            this.I?.hide(animated);
        }
        runFindAction(previous) {
            this.I?.find(previous);
        }
    };
    exports.$64b = $64b;
    exports.$64b = $64b = __decorate([
        __param(2, configuration_1.$8h),
        __param(3, contextView_1.$WZ),
        __param(4, notification_1.$Yu),
        __param(5, environmentService_1.$hJ),
        __param(6, files_1.$6j),
        __param(7, log_1.$5i),
        __param(8, remoteAuthorityResolver_1.$Jk),
        __param(9, telemetry_1.$9k),
        __param(10, tunnel_1.$Wz),
        __param(11, instantiation_1.$Ah),
        __param(12, accessibility_1.$1r)
    ], $64b);
});
//# sourceMappingURL=webviewElement.js.map