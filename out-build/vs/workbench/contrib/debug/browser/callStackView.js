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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/strings", "vs/nls!vs/workbench/contrib/debug/browser/callStackView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/debugToolBar", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, dom, actionbar_1, highlightedLabel_1, actions_1, async_1, codicons_1, event_1, filters_1, lifecycle_1, path_1, strings_1, nls_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, label_1, listService_1, notification_1, opener_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, viewPane_1, views_1, baseDebugView_1, debugCommands_1, icons, debugToolBar_1, debug_1, debugModel_1, debugUtils_1) {
    "use strict";
    var SessionsRenderer_1, ThreadsRenderer_1, StackFramesRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jRb = exports.$iRb = exports.$hRb = exports.$gRb = void 0;
    const $ = dom.$;
    function assignSessionContext(element, context) {
        context.sessionId = element.getId();
        return context;
    }
    function assignThreadContext(element, context) {
        context.threadId = element.getId();
        assignSessionContext(element.session, context);
        return context;
    }
    function assignStackFrameContext(element, context) {
        context.frameId = element.getId();
        context.frameName = element.name;
        context.frameLocation = { range: element.range, source: element.source.raw };
        assignThreadContext(element.thread, context);
        return context;
    }
    function $gRb(element) {
        if (element instanceof debugModel_1.$MFb) {
            return assignStackFrameContext(element, {});
        }
        else if (element instanceof debugModel_1.$NFb) {
            return assignThreadContext(element, {});
        }
        else if (isDebugSession(element)) {
            return assignSessionContext(element, {});
        }
        else {
            return undefined;
        }
    }
    exports.$gRb = $gRb;
    // Extensions depend on this context, should not be changed even though it is not fully deterministic
    function $hRb(element) {
        if (element instanceof debugModel_1.$MFb) {
            if (element.source.inMemory) {
                return element.source.raw.path || element.source.reference || element.source.name;
            }
            return element.source.uri.toString();
        }
        if (element instanceof debugModel_1.$NFb) {
            return element.threadId;
        }
        if (isDebugSession(element)) {
            return element.getId();
        }
        return '';
    }
    exports.$hRb = $hRb;
    function $iRb(stackFrame) {
        // To reduce flashing of the path name and the way we fetch stack frames
        // We need to compute the source name based on the other frames in the stale call stack
        let callStack = stackFrame.thread.getStaleCallStack();
        callStack = callStack.length > 0 ? callStack : stackFrame.thread.getCallStack();
        const otherSources = callStack.map(sf => sf.source).filter(s => s !== stackFrame.source);
        let suffixLength = 0;
        otherSources.forEach(s => {
            if (s.name === stackFrame.source.name) {
                suffixLength = Math.max(suffixLength, (0, strings_1.$Pe)(stackFrame.source.uri.path, s.uri.path));
            }
        });
        if (suffixLength === 0) {
            return stackFrame.source.name;
        }
        const from = Math.max(0, stackFrame.source.uri.path.lastIndexOf(path_1.$6d.sep, stackFrame.source.uri.path.length - suffixLength - 1));
        return (from > 0 ? '...' : '') + stackFrame.source.uri.path.substring(from);
    }
    exports.$iRb = $iRb;
    async function expandTo(session, tree) {
        if (session.parentSession) {
            await expandTo(session.parentSession, tree);
        }
        await tree.expand(session);
    }
    let $jRb = class $jRb extends viewPane_1.$Ieb {
        constructor(L, contextMenuService, ab, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, telemetryService, sb) {
            super(L, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.L = L;
            this.ab = ab;
            this.sb = sb;
            this.f = false;
            this.g = false;
            this.h = false;
            this.n = new Set();
            this.r = false;
            // Create scheduler to prevent unnecessary flashing of tree when reacting to changes
            this.c = this.B(new async_1.$Sg(async () => {
                // Only show the global pause message if we do not display threads.
                // Otherwise there will be a pause message per thread and there is no need for a global one.
                const sessions = this.ab.getModel().getSessions();
                if (sessions.length === 0) {
                    this.n.clear();
                }
                const thread = sessions.length === 1 && sessions[0].getAllThreads().length === 1 ? sessions[0].getAllThreads()[0] : undefined;
                const stoppedDetails = sessions.length === 1 ? sessions[0].getStoppedDetails() : undefined;
                if (stoppedDetails && (thread || typeof stoppedDetails.threadId !== 'number')) {
                    this.b.textContent = stoppedDescription(stoppedDetails);
                    this.b.title = stoppedText(stoppedDetails);
                    this.b.classList.toggle('exception', stoppedDetails.reason === 'exception');
                    this.a.hidden = false;
                }
                else if (sessions.length === 1 && sessions[0].state === 3 /* State.Running */) {
                    this.b.textContent = (0, nls_1.localize)(0, null);
                    this.b.title = sessions[0].getLabel();
                    this.b.classList.remove('exception');
                    this.a.hidden = false;
                }
                else {
                    this.a.hidden = true;
                }
                this.Ub();
                this.f = false;
                this.j.deemphasizedStackFramesToShow = [];
                await this.m.updateChildren();
                try {
                    const toExpand = new Set();
                    sessions.forEach(s => {
                        // Automatically expand sessions that have children, but only do this once.
                        if (s.parentSession && !this.n.has(s.parentSession)) {
                            toExpand.add(s.parentSession);
                        }
                    });
                    for (const session of toExpand) {
                        await expandTo(session, this.m);
                        this.n.add(session);
                    }
                }
                catch (e) {
                    // Ignore tree expand errors if element no longer present
                }
                if (this.r) {
                    this.r = false;
                    await this.Zb();
                }
            }, 50));
        }
        Ib(container) {
            super.Ib(container, this.L.title);
            this.a = dom.$0O(container, $('span.call-stack-state-message'));
            this.a.hidden = true;
            this.b = dom.$0O(this.a, $('span.label'));
        }
        U(container) {
            super.U(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-call-stack');
            const treeContainer = (0, baseDebugView_1.$0Pb)(container);
            this.j = new CallStackDataSource(this.ab);
            this.m = this.Bb.createInstance(listService_1.$x4, 'CallStackView', treeContainer, new CallStackDelegate(), new CallStackCompressionDelegate(this.ab), [
                this.Bb.createInstance(SessionsRenderer),
                this.Bb.createInstance(ThreadsRenderer),
                this.Bb.createInstance(StackFramesRenderer),
                new ErrorsRenderer(),
                new LoadMoreRenderer(),
                new ShowMoreRenderer()
            ], this.j, {
                accessibilityProvider: new CallStackAccessibilityProvider(),
                compressionEnabled: true,
                autoExpandSingleChildren: true,
                identityProvider: {
                    getId: (element) => {
                        if (typeof element === 'string') {
                            return element;
                        }
                        if (element instanceof Array) {
                            return `showMore ${element[0].getId()}`;
                        }
                        return element.getId();
                    }
                },
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (e) => {
                        if (isDebugSession(e)) {
                            return e.getLabel();
                        }
                        if (e instanceof debugModel_1.$NFb) {
                            return `${e.name} ${e.stateLabel}`;
                        }
                        if (e instanceof debugModel_1.$MFb || typeof e === 'string') {
                            return e;
                        }
                        if (e instanceof debugModel_1.$XFb) {
                            return LoadMoreRenderer.LABEL;
                        }
                        return (0, nls_1.localize)(1, null);
                    },
                    getCompressedNodeKeyboardNavigationLabel: (e) => {
                        const firstItem = e[0];
                        if (isDebugSession(firstItem)) {
                            return firstItem.getLabel();
                        }
                        return '';
                    }
                },
                expandOnlyOnTwistieClick: true,
                overrideStyles: {
                    listBackground: this.Rb()
                }
            });
            this.m.setInput(this.ab.getModel());
            this.B(this.m);
            this.B(this.m.onDidOpen(async (e) => {
                if (this.g) {
                    return;
                }
                const focusStackFrame = (stackFrame, thread, session, options = {}) => {
                    this.h = true;
                    try {
                        this.ab.focusStackFrame(stackFrame, thread, session, { ...options, ...{ explicit: true } });
                    }
                    finally {
                        this.h = false;
                    }
                };
                const element = e.element;
                if (element instanceof debugModel_1.$MFb) {
                    const opts = {
                        preserveFocus: e.editorOptions.preserveFocus,
                        sideBySide: e.sideBySide,
                        pinned: e.editorOptions.pinned
                    };
                    focusStackFrame(element, element.thread, element.thread.session, opts);
                }
                if (element instanceof debugModel_1.$NFb) {
                    focusStackFrame(undefined, element, element.session);
                }
                if (isDebugSession(element)) {
                    focusStackFrame(undefined, undefined, element);
                }
                if (element instanceof debugModel_1.$XFb) {
                    const session = this.ab.getModel().getSession(element.sessionId);
                    const thread = session && session.getThread(element.threadId);
                    if (thread) {
                        const totalFrames = thread.stoppedDetails?.totalFrames;
                        const remainingFramesCount = typeof totalFrames === 'number' ? (totalFrames - thread.getCallStack().length) : undefined;
                        // Get all the remaining frames
                        await thread.fetchCallStack(remainingFramesCount);
                        await this.m.updateChildren();
                    }
                }
                if (element instanceof Array) {
                    this.j.deemphasizedStackFramesToShow.push(...element);
                    this.m.updateChildren();
                }
            }));
            this.B(this.ab.getModel().onDidChangeCallStack(() => {
                if (!this.isBodyVisible()) {
                    this.f = true;
                    return;
                }
                if (!this.c.isScheduled()) {
                    this.c.schedule();
                }
            }));
            const onFocusChange = event_1.Event.any(this.ab.getViewModel().onDidFocusStackFrame, this.ab.getViewModel().onDidFocusSession);
            this.B(onFocusChange(async () => {
                if (this.h) {
                    return;
                }
                if (!this.isBodyVisible()) {
                    this.f = true;
                    return;
                }
                if (this.c.isScheduled()) {
                    this.r = true;
                    return;
                }
                await this.Zb();
            }));
            this.B(this.m.onContextMenu(e => this.$b(e)));
            // Schedule the update of the call stack tree if the viewlet is opened after a session started #14684
            if (this.ab.state === 2 /* State.Stopped */) {
                this.c.schedule(0);
            }
            this.B(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.f) {
                    this.c.schedule();
                }
            }));
            this.B(this.ab.onDidNewSession(s => {
                const sessionListeners = [];
                sessionListeners.push(s.onDidChangeName(() => {
                    // this.tree.updateChildren is called on a delay after a session is added,
                    // so don't rerender if the tree doesn't have the node yet
                    if (this.m.hasNode(s)) {
                        this.m.rerender(s);
                    }
                }));
                sessionListeners.push(s.onDidEndAdapter(() => (0, lifecycle_1.$fc)(sessionListeners)));
                if (s.parentSession) {
                    // A session we already expanded has a new child session, allow to expand it again.
                    this.n.delete(s.parentSession);
                }
            }));
        }
        W(height, width) {
            super.W(height, width);
            this.m.layout(height, width);
        }
        focus() {
            this.m.domFocus();
        }
        collapseAll() {
            this.m.collapseAll();
        }
        async Zb() {
            if (!this.m || !this.m.getInput()) {
                // Tree not initialized yet
                return;
            }
            const updateSelectionAndReveal = (element) => {
                this.g = true;
                try {
                    this.m.setSelection([element]);
                    // If the element is outside of the screen bounds,
                    // position it in the middle
                    if (this.m.getRelativeTop(element) === null) {
                        this.m.reveal(element, 0.5);
                    }
                    else {
                        this.m.reveal(element);
                    }
                }
                catch (e) { }
                finally {
                    this.g = false;
                }
            };
            const thread = this.ab.getViewModel().focusedThread;
            const session = this.ab.getViewModel().focusedSession;
            const stackFrame = this.ab.getViewModel().focusedStackFrame;
            if (!thread) {
                if (!session) {
                    this.m.setSelection([]);
                }
                else {
                    updateSelectionAndReveal(session);
                }
            }
            else {
                // Ignore errors from this expansions because we are not aware if we rendered the threads and sessions or we hide them to declutter the view
                try {
                    await expandTo(thread.session, this.m);
                }
                catch (e) { }
                try {
                    await this.m.expand(thread);
                }
                catch (e) { }
                const toReveal = stackFrame || session;
                if (toReveal) {
                    updateSelectionAndReveal(toReveal);
                }
            }
        }
        $b(e) {
            const element = e.element;
            let overlay = [];
            if (isDebugSession(element)) {
                overlay = getSessionContextOverlay(element);
            }
            else if (element instanceof debugModel_1.$NFb) {
                overlay = getThreadContextOverlay(element);
            }
            else if (element instanceof debugModel_1.$MFb) {
                overlay = getStackFrameContextOverlay(element);
            }
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            const contextKeyService = this.zb.createOverlay(overlay);
            const menu = this.sb.createMenu(actions_2.$Ru.DebugCallStackContext, contextKeyService);
            (0, menuEntryActionViewItem_1.$A3)(menu, { arg: $hRb(element), shouldForwardArgs: true }, result, 'inline');
            menu.dispose();
            this.xb.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => result.secondary,
                getActionsContext: () => $gRb(element)
            });
        }
    };
    exports.$jRb = $jRb;
    exports.$jRb = $jRb = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, debug_1.$nH),
        __param(3, keybinding_1.$2D),
        __param(4, instantiation_1.$Ah),
        __param(5, views_1.$_E),
        __param(6, configuration_1.$8h),
        __param(7, contextkey_1.$3i),
        __param(8, opener_1.$NT),
        __param(9, themeService_1.$gv),
        __param(10, telemetry_1.$9k),
        __param(11, actions_2.$Su)
    ], $jRb);
    function getSessionContextOverlay(session) {
        return [
            [debug_1.$IG.key, 'session'],
            [debug_1.$JG.key, (0, debugUtils_1.$kF)(session)],
            [debug_1.$KG.key, session.state === 2 /* State.Stopped */],
            [debug_1.$LG.key, session.getAllThreads().length === 1],
        ];
    }
    let SessionsRenderer = class SessionsRenderer {
        static { SessionsRenderer_1 = this; }
        static { this.ID = 'session'; }
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        get templateId() {
            return SessionsRenderer_1.ID;
        }
        renderTemplate(container) {
            const session = dom.$0O(container, $('.session'));
            dom.$0O(session, $(themables_1.ThemeIcon.asCSSSelector(icons.$qnb)));
            const name = dom.$0O(session, $('.name'));
            const stateLabel = dom.$0O(session, $('span.state.label.monaco-count-badge.long'));
            const label = new highlightedLabel_1.$JR(name);
            const templateDisposable = new lifecycle_1.$jc();
            const stopActionViewItemDisposables = templateDisposable.add(new lifecycle_1.$jc());
            const actionBar = templateDisposable.add(new actionbar_1.$1P(session, {
                actionViewItemProvider: action => {
                    if ((action.id === debugCommands_1.$rQb || action.id === debugCommands_1.$pQb) && action instanceof actions_2.$Vu) {
                        stopActionViewItemDisposables.clear();
                        const item = this.a.invokeFunction(accessor => (0, debugToolBar_1.$fRb)(action, stopActionViewItemDisposables, accessor));
                        if (item) {
                            return item;
                        }
                    }
                    if (action instanceof actions_2.$Vu) {
                        return this.a.createInstance(menuEntryActionViewItem_1.$C3, action, undefined);
                    }
                    else if (action instanceof actions_2.$Uu) {
                        return this.a.createInstance(menuEntryActionViewItem_1.$D3, action, undefined);
                    }
                    return undefined;
                }
            }));
            const elementDisposable = templateDisposable.add(new lifecycle_1.$jc());
            return { session, name, stateLabel, label, actionBar, elementDisposable, templateDisposable };
        }
        renderElement(element, _, data) {
            this.d(element.element, (0, filters_1.$Hj)(element.filterData), data);
        }
        renderCompressedElements(node, _index, templateData) {
            const lastElement = node.element.elements[node.element.elements.length - 1];
            const matches = (0, filters_1.$Hj)(node.filterData);
            this.d(lastElement, matches, templateData);
        }
        d(session, matches, data) {
            data.session.title = (0, nls_1.localize)(2, null);
            data.label.set(session.getLabel(), matches);
            const stoppedDetails = session.getStoppedDetails();
            const thread = session.getAllThreads().find(t => t.stopped);
            const contextKeyService = this.b.createOverlay(getSessionContextOverlay(session));
            const menu = data.elementDisposable.add(this.c.createMenu(actions_2.$Ru.DebugCallStackContext, contextKeyService));
            const setupActionBar = () => {
                data.actionBar.clear();
                const primary = [];
                const secondary = [];
                const result = { primary, secondary };
                (0, menuEntryActionViewItem_1.$B3)(menu, { arg: $hRb(session), shouldForwardArgs: true }, result, 'inline');
                data.actionBar.push(primary, { icon: true, label: false });
                // We need to set our internal context on the action bar, since our commands depend on that one
                // While the external context our extensions rely on
                data.actionBar.context = $gRb(session);
            };
            data.elementDisposable.add(menu.onDidChange(() => setupActionBar()));
            setupActionBar();
            data.stateLabel.style.display = '';
            if (stoppedDetails) {
                data.stateLabel.textContent = stoppedDescription(stoppedDetails);
                data.session.title = `${session.getLabel()}: ${stoppedText(stoppedDetails)}`;
                data.stateLabel.classList.toggle('exception', stoppedDetails.reason === 'exception');
            }
            else if (thread && thread.stoppedDetails) {
                data.stateLabel.textContent = stoppedDescription(thread.stoppedDetails);
                data.session.title = `${session.getLabel()}: ${stoppedText(thread.stoppedDetails)}`;
                data.stateLabel.classList.toggle('exception', thread.stoppedDetails.reason === 'exception');
            }
            else {
                data.stateLabel.textContent = (0, nls_1.localize)(3, null);
                data.stateLabel.classList.remove('exception');
            }
        }
        disposeTemplate(templateData) {
            templateData.templateDisposable.dispose();
        }
        disposeElement(_element, _, templateData) {
            templateData.elementDisposable.clear();
        }
        disposeCompressedElements(node, index, templateData, height) {
            templateData.elementDisposable.clear();
        }
    };
    SessionsRenderer = SessionsRenderer_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, contextkey_1.$3i),
        __param(2, actions_2.$Su)
    ], SessionsRenderer);
    function getThreadContextOverlay(thread) {
        return [
            [debug_1.$IG.key, 'thread'],
            [debug_1.$KG.key, thread.stopped]
        ];
    }
    let ThreadsRenderer = class ThreadsRenderer {
        static { ThreadsRenderer_1 = this; }
        static { this.ID = 'thread'; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        get templateId() {
            return ThreadsRenderer_1.ID;
        }
        renderTemplate(container) {
            const thread = dom.$0O(container, $('.thread'));
            const name = dom.$0O(thread, $('.name'));
            const stateLabel = dom.$0O(thread, $('span.state.label.monaco-count-badge.long'));
            const label = new highlightedLabel_1.$JR(name);
            const templateDisposable = new lifecycle_1.$jc();
            const actionBar = templateDisposable.add(new actionbar_1.$1P(thread));
            const elementDisposable = templateDisposable.add(new lifecycle_1.$jc());
            return { thread, name, stateLabel, label, actionBar, elementDisposable, templateDisposable };
        }
        renderElement(element, _index, data) {
            const thread = element.element;
            data.thread.title = thread.name;
            data.label.set(thread.name, (0, filters_1.$Hj)(element.filterData));
            data.stateLabel.textContent = thread.stateLabel;
            data.stateLabel.classList.toggle('exception', thread.stoppedDetails?.reason === 'exception');
            const contextKeyService = this.a.createOverlay(getThreadContextOverlay(thread));
            const menu = data.elementDisposable.add(this.b.createMenu(actions_2.$Ru.DebugCallStackContext, contextKeyService));
            const setupActionBar = () => {
                data.actionBar.clear();
                const primary = [];
                const secondary = [];
                const result = { primary, secondary };
                (0, menuEntryActionViewItem_1.$B3)(menu, { arg: $hRb(thread), shouldForwardArgs: true }, result, 'inline');
                data.actionBar.push(primary, { icon: true, label: false });
                // We need to set our internal context on the action bar, since our commands depend on that one
                // While the external context our extensions rely on
                data.actionBar.context = $gRb(thread);
            };
            data.elementDisposable.add(menu.onDidChange(() => setupActionBar()));
            setupActionBar();
        }
        renderCompressedElements(_node, _index, _templateData, _height) {
            throw new Error('Method not implemented.');
        }
        disposeElement(_element, _index, templateData) {
            templateData.elementDisposable.clear();
        }
        disposeTemplate(templateData) {
            templateData.templateDisposable.dispose();
        }
    };
    ThreadsRenderer = ThreadsRenderer_1 = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, actions_2.$Su)
    ], ThreadsRenderer);
    function getStackFrameContextOverlay(stackFrame) {
        return [
            [debug_1.$IG.key, 'stackFrame'],
            [debug_1.$VG.key, stackFrame.canRestart]
        ];
    }
    let StackFramesRenderer = class StackFramesRenderer {
        static { StackFramesRenderer_1 = this; }
        static { this.ID = 'stackFrame'; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        get templateId() {
            return StackFramesRenderer_1.ID;
        }
        renderTemplate(container) {
            const stackFrame = dom.$0O(container, $('.stack-frame'));
            const labelDiv = dom.$0O(stackFrame, $('span.label.expression'));
            const file = dom.$0O(stackFrame, $('.file'));
            const fileName = dom.$0O(file, $('span.file-name'));
            const wrapper = dom.$0O(file, $('span.line-number-wrapper'));
            const lineNumber = dom.$0O(wrapper, $('span.line-number.monaco-count-badge'));
            const label = new highlightedLabel_1.$JR(labelDiv);
            const templateDisposable = new lifecycle_1.$jc();
            const actionBar = templateDisposable.add(new actionbar_1.$1P(stackFrame));
            return { file, fileName, label, lineNumber, stackFrame, actionBar, templateDisposable };
        }
        renderElement(element, index, data) {
            const stackFrame = element.element;
            data.stackFrame.classList.toggle('disabled', !stackFrame.source || !stackFrame.source.available || isDeemphasized(stackFrame));
            data.stackFrame.classList.toggle('label', stackFrame.presentationHint === 'label');
            data.stackFrame.classList.toggle('subtle', stackFrame.presentationHint === 'subtle');
            const hasActions = !!stackFrame.thread.session.capabilities.supportsRestartFrame && stackFrame.presentationHint !== 'label' && stackFrame.presentationHint !== 'subtle' && stackFrame.canRestart;
            data.stackFrame.classList.toggle('has-actions', hasActions);
            data.file.title = stackFrame.source.inMemory ? stackFrame.source.uri.path : this.a.getUriLabel(stackFrame.source.uri);
            if (stackFrame.source.raw.origin) {
                data.file.title += `\n${stackFrame.source.raw.origin}`;
            }
            data.label.set(stackFrame.name, (0, filters_1.$Hj)(element.filterData), stackFrame.name);
            data.fileName.textContent = $iRb(stackFrame);
            if (stackFrame.range.startLineNumber !== undefined) {
                data.lineNumber.textContent = `${stackFrame.range.startLineNumber}`;
                if (stackFrame.range.startColumn) {
                    data.lineNumber.textContent += `:${stackFrame.range.startColumn}`;
                }
                data.lineNumber.classList.remove('unavailable');
            }
            else {
                data.lineNumber.classList.add('unavailable');
            }
            data.actionBar.clear();
            if (hasActions) {
                const action = new actions_1.$gi('debug.callStack.restartFrame', (0, nls_1.localize)(4, null), themables_1.ThemeIcon.asClassName(icons.$_mb), true, async () => {
                    try {
                        await stackFrame.restart();
                    }
                    catch (e) {
                        this.b.error(e);
                    }
                });
                data.actionBar.push(action, { icon: true, label: false });
            }
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Method not implemented.');
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
        }
    };
    StackFramesRenderer = StackFramesRenderer_1 = __decorate([
        __param(0, label_1.$Vz),
        __param(1, notification_1.$Yu)
    ], StackFramesRenderer);
    class ErrorsRenderer {
        static { this.ID = 'error'; }
        get templateId() {
            return ErrorsRenderer.ID;
        }
        renderTemplate(container) {
            const label = dom.$0O(container, $('.error'));
            return { label };
        }
        renderElement(element, index, data) {
            const error = element.element;
            data.label.textContent = error;
            data.label.title = error;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Method not implemented.');
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class LoadMoreRenderer {
        static { this.ID = 'loadMore'; }
        static { this.LABEL = (0, nls_1.localize)(5, null); }
        constructor() { }
        get templateId() {
            return LoadMoreRenderer.ID;
        }
        renderTemplate(container) {
            const label = dom.$0O(container, $('.load-all'));
            label.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$Ev);
            return { label };
        }
        renderElement(element, index, data) {
            data.label.textContent = LoadMoreRenderer.LABEL;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Method not implemented.');
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class ShowMoreRenderer {
        static { this.ID = 'showMore'; }
        constructor() { }
        get templateId() {
            return ShowMoreRenderer.ID;
        }
        renderTemplate(container) {
            const label = dom.$0O(container, $('.show-more'));
            label.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$Ev);
            return { label };
        }
        renderElement(element, index, data) {
            const stackFrames = element.element;
            if (stackFrames.every(sf => !!(sf.source && sf.source.origin && sf.source.origin === stackFrames[0].source.origin))) {
                data.label.textContent = (0, nls_1.localize)(6, null, stackFrames.length, stackFrames[0].source.origin);
            }
            else {
                data.label.textContent = (0, nls_1.localize)(7, null, stackFrames.length);
            }
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Method not implemented.');
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class CallStackDelegate {
        getHeight(element) {
            if (element instanceof debugModel_1.$MFb && element.presentationHint === 'label') {
                return 16;
            }
            if (element instanceof debugModel_1.$XFb || element instanceof Array) {
                return 16;
            }
            return 22;
        }
        getTemplateId(element) {
            if (isDebugSession(element)) {
                return SessionsRenderer.ID;
            }
            if (element instanceof debugModel_1.$NFb) {
                return ThreadsRenderer.ID;
            }
            if (element instanceof debugModel_1.$MFb) {
                return StackFramesRenderer.ID;
            }
            if (typeof element === 'string') {
                return ErrorsRenderer.ID;
            }
            if (element instanceof debugModel_1.$XFb) {
                return LoadMoreRenderer.ID;
            }
            // element instanceof Array
            return ShowMoreRenderer.ID;
        }
    }
    function stoppedText(stoppedDetails) {
        return stoppedDetails.text ?? stoppedDescription(stoppedDetails);
    }
    function stoppedDescription(stoppedDetails) {
        return stoppedDetails.description ||
            (stoppedDetails.reason ? (0, nls_1.localize)(8, null, stoppedDetails.reason) : (0, nls_1.localize)(9, null));
    }
    function isDebugModel(obj) {
        return typeof obj.getSessions === 'function';
    }
    function isDebugSession(obj) {
        return obj && typeof obj.getAllThreads === 'function';
    }
    function isDeemphasized(frame) {
        return frame.source.presentationHint === 'deemphasize' || frame.presentationHint === 'deemphasize';
    }
    class CallStackDataSource {
        constructor(a) {
            this.a = a;
            this.deemphasizedStackFramesToShow = [];
        }
        hasChildren(element) {
            if (isDebugSession(element)) {
                const threads = element.getAllThreads();
                return (threads.length > 1) || (threads.length === 1 && threads[0].stopped) || !!(this.a.getModel().getSessions().find(s => s.parentSession === element));
            }
            return isDebugModel(element) || (element instanceof debugModel_1.$NFb && element.stopped);
        }
        async getChildren(element) {
            if (isDebugModel(element)) {
                const sessions = element.getSessions();
                if (sessions.length === 0) {
                    return Promise.resolve([]);
                }
                if (sessions.length > 1 || this.a.getViewModel().isMultiSessionView()) {
                    return Promise.resolve(sessions.filter(s => !s.parentSession));
                }
                const threads = sessions[0].getAllThreads();
                // Only show the threads in the call stack if there is more than 1 thread.
                return threads.length === 1 ? this.b(threads[0]) : Promise.resolve(threads);
            }
            else if (isDebugSession(element)) {
                const childSessions = this.a.getModel().getSessions().filter(s => s.parentSession === element);
                const threads = element.getAllThreads();
                if (threads.length === 1) {
                    // Do not show thread when there is only one to be compact.
                    const children = await this.b(threads[0]);
                    return children.concat(childSessions);
                }
                return Promise.resolve(threads.concat(childSessions));
            }
            else {
                return this.b(element);
            }
        }
        b(thread) {
            return this.c(thread).then(children => {
                // Check if some stack frames should be hidden under a parent element since they are deemphasized
                const result = [];
                children.forEach((child, index) => {
                    if (child instanceof debugModel_1.$MFb && child.source && isDeemphasized(child)) {
                        // Check if the user clicked to show the deemphasized source
                        if (this.deemphasizedStackFramesToShow.indexOf(child) === -1) {
                            if (result.length) {
                                const last = result[result.length - 1];
                                if (last instanceof Array) {
                                    // Collect all the stackframes that will be "collapsed"
                                    last.push(child);
                                    return;
                                }
                            }
                            const nextChild = index < children.length - 1 ? children[index + 1] : undefined;
                            if (nextChild instanceof debugModel_1.$MFb && nextChild.source && isDeemphasized(nextChild)) {
                                // Start collecting stackframes that will be "collapsed"
                                result.push([child]);
                                return;
                            }
                        }
                    }
                    result.push(child);
                });
                return result;
            });
        }
        async c(thread) {
            let callStack = thread.getCallStack();
            if (!callStack || !callStack.length) {
                await thread.fetchCallStack();
                callStack = thread.getCallStack();
            }
            if (callStack.length === 1 && thread.session.capabilities.supportsDelayedStackTraceLoading && thread.stoppedDetails && thread.stoppedDetails.totalFrames && thread.stoppedDetails.totalFrames > 1) {
                // To reduce flashing of the call stack view simply append the stale call stack
                // once we have the correct data the tree will refresh and we will no longer display it.
                callStack = callStack.concat(thread.getStaleCallStack().slice(1));
            }
            if (thread.stoppedDetails && thread.stoppedDetails.framesErrorMessage) {
                callStack = callStack.concat([thread.stoppedDetails.framesErrorMessage]);
            }
            if (!thread.reachedEndOfCallStack && thread.stoppedDetails) {
                callStack = callStack.concat([new debugModel_1.$XFb(thread.session.getId(), thread.threadId)]);
            }
            return callStack;
        }
    }
    class CallStackAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(10, null);
        }
        getWidgetRole() {
            // Use treegrid as a role since each element can have additional actions inside #146210
            return 'treegrid';
        }
        getRole(_element) {
            return 'row';
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.$NFb) {
                return (0, nls_1.localize)(11, null, element.name, element.stateLabel);
            }
            if (element instanceof debugModel_1.$MFb) {
                return (0, nls_1.localize)(12, null, element.name, element.range.startLineNumber, $iRb(element));
            }
            if (isDebugSession(element)) {
                const thread = element.getAllThreads().find(t => t.stopped);
                const state = thread ? thread.stateLabel : (0, nls_1.localize)(13, null);
                return (0, nls_1.localize)(14, null, element.getLabel(), state);
            }
            if (typeof element === 'string') {
                return element;
            }
            if (element instanceof Array) {
                return (0, nls_1.localize)(15, null, element.length);
            }
            // element instanceof ThreadAndSessionIds
            return LoadMoreRenderer.LABEL;
        }
    }
    class CallStackCompressionDelegate {
        constructor(a) {
            this.a = a;
        }
        isIncompressible(stat) {
            if (isDebugSession(stat)) {
                if (stat.compact) {
                    return false;
                }
                const sessions = this.a.getModel().getSessions();
                if (sessions.some(s => s.parentSession === stat && s.compact)) {
                    return false;
                }
                return true;
            }
            return true;
        }
    }
    (0, actions_2.$Xu)(class Collapse extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'callStack.collapse',
                viewId: debug_1.$mG,
                title: (0, nls_1.localize)(16, null),
                f1: false,
                icon: codicons_1.$Pj.collapseAll,
                precondition: debug_1.$uG.isEqualTo((0, debug_1.$lH)(2 /* State.Stopped */)),
                menu: {
                    id: actions_2.$Ru.ViewTitle,
                    order: 10,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', debug_1.$mG)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    function registerCallStackInlineMenuItem(id, title, icon, when, order, precondition) {
        actions_2.$Tu.appendMenuItem(actions_2.$Ru.DebugCallStackContext, {
            group: 'inline',
            order,
            when,
            command: { id, title, icon, precondition }
        });
    }
    const threadOrSessionWithOneThread = contextkey_1.$Ii.or(debug_1.$IG.isEqualTo('thread'), contextkey_1.$Ii.and(debug_1.$IG.isEqualTo('session'), debug_1.$LG));
    registerCallStackInlineMenuItem(debugCommands_1.$oQb, debugCommands_1.$TQb, icons.$hnb, contextkey_1.$Ii.and(threadOrSessionWithOneThread, debug_1.$KG.toNegated()), 10);
    registerCallStackInlineMenuItem(debugCommands_1.$tQb, debugCommands_1.$XQb, icons.$inb, contextkey_1.$Ii.and(threadOrSessionWithOneThread, debug_1.$KG), 10);
    registerCallStackInlineMenuItem(debugCommands_1.$kQb, debugCommands_1.$PQb, icons.$dnb, threadOrSessionWithOneThread, 20, debug_1.$KG);
    registerCallStackInlineMenuItem(debugCommands_1.$lQb, debugCommands_1.$QQb, icons.$enb, threadOrSessionWithOneThread, 30, debug_1.$KG);
    registerCallStackInlineMenuItem(debugCommands_1.$nQb, debugCommands_1.$SQb, icons.$fnb, threadOrSessionWithOneThread, 40, debug_1.$KG);
    registerCallStackInlineMenuItem(debugCommands_1.$iQb, debugCommands_1.$OQb, icons.$cnb, debug_1.$IG.isEqualTo('session'), 50);
    registerCallStackInlineMenuItem(debugCommands_1.$rQb, debugCommands_1.$WQb, icons.$anb, contextkey_1.$Ii.and(debug_1.$JG.toNegated(), debug_1.$IG.isEqualTo('session')), 60);
    registerCallStackInlineMenuItem(debugCommands_1.$pQb, debugCommands_1.$UQb, icons.$bnb, contextkey_1.$Ii.and(debug_1.$JG, debug_1.$IG.isEqualTo('session')), 60);
});
//# sourceMappingURL=callStackView.js.map