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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/strings", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/debugToolBar", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, dom, actionbar_1, highlightedLabel_1, actions_1, async_1, codicons_1, event_1, filters_1, lifecycle_1, path_1, strings_1, nls_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, label_1, listService_1, notification_1, opener_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, viewPane_1, views_1, baseDebugView_1, debugCommands_1, icons, debugToolBar_1, debug_1, debugModel_1, debugUtils_1) {
    "use strict";
    var SessionsRenderer_1, ThreadsRenderer_1, StackFramesRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallStackView = exports.getSpecificSourceName = exports.getContextForContributedActions = exports.getContext = void 0;
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
    function getContext(element) {
        if (element instanceof debugModel_1.StackFrame) {
            return assignStackFrameContext(element, {});
        }
        else if (element instanceof debugModel_1.Thread) {
            return assignThreadContext(element, {});
        }
        else if (isDebugSession(element)) {
            return assignSessionContext(element, {});
        }
        else {
            return undefined;
        }
    }
    exports.getContext = getContext;
    // Extensions depend on this context, should not be changed even though it is not fully deterministic
    function getContextForContributedActions(element) {
        if (element instanceof debugModel_1.StackFrame) {
            if (element.source.inMemory) {
                return element.source.raw.path || element.source.reference || element.source.name;
            }
            return element.source.uri.toString();
        }
        if (element instanceof debugModel_1.Thread) {
            return element.threadId;
        }
        if (isDebugSession(element)) {
            return element.getId();
        }
        return '';
    }
    exports.getContextForContributedActions = getContextForContributedActions;
    function getSpecificSourceName(stackFrame) {
        // To reduce flashing of the path name and the way we fetch stack frames
        // We need to compute the source name based on the other frames in the stale call stack
        let callStack = stackFrame.thread.getStaleCallStack();
        callStack = callStack.length > 0 ? callStack : stackFrame.thread.getCallStack();
        const otherSources = callStack.map(sf => sf.source).filter(s => s !== stackFrame.source);
        let suffixLength = 0;
        otherSources.forEach(s => {
            if (s.name === stackFrame.source.name) {
                suffixLength = Math.max(suffixLength, (0, strings_1.commonSuffixLength)(stackFrame.source.uri.path, s.uri.path));
            }
        });
        if (suffixLength === 0) {
            return stackFrame.source.name;
        }
        const from = Math.max(0, stackFrame.source.uri.path.lastIndexOf(path_1.posix.sep, stackFrame.source.uri.path.length - suffixLength - 1));
        return (from > 0 ? '...' : '') + stackFrame.source.uri.path.substring(from);
    }
    exports.getSpecificSourceName = getSpecificSourceName;
    async function expandTo(session, tree) {
        if (session.parentSession) {
            await expandTo(session.parentSession, tree);
        }
        await tree.expand(session);
    }
    let CallStackView = class CallStackView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, telemetryService, menuService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.options = options;
            this.debugService = debugService;
            this.menuService = menuService;
            this.needsRefresh = false;
            this.ignoreSelectionChangedEvent = false;
            this.ignoreFocusStackFrameEvent = false;
            this.autoExpandedSessions = new Set();
            this.selectionNeedsUpdate = false;
            // Create scheduler to prevent unnecessary flashing of tree when reacting to changes
            this.onCallStackChangeScheduler = this._register(new async_1.RunOnceScheduler(async () => {
                // Only show the global pause message if we do not display threads.
                // Otherwise there will be a pause message per thread and there is no need for a global one.
                const sessions = this.debugService.getModel().getSessions();
                if (sessions.length === 0) {
                    this.autoExpandedSessions.clear();
                }
                const thread = sessions.length === 1 && sessions[0].getAllThreads().length === 1 ? sessions[0].getAllThreads()[0] : undefined;
                const stoppedDetails = sessions.length === 1 ? sessions[0].getStoppedDetails() : undefined;
                if (stoppedDetails && (thread || typeof stoppedDetails.threadId !== 'number')) {
                    this.stateMessageLabel.textContent = stoppedDescription(stoppedDetails);
                    this.stateMessageLabel.title = stoppedText(stoppedDetails);
                    this.stateMessageLabel.classList.toggle('exception', stoppedDetails.reason === 'exception');
                    this.stateMessage.hidden = false;
                }
                else if (sessions.length === 1 && sessions[0].state === 3 /* State.Running */) {
                    this.stateMessageLabel.textContent = (0, nls_1.localize)({ key: 'running', comment: ['indicates state'] }, "Running");
                    this.stateMessageLabel.title = sessions[0].getLabel();
                    this.stateMessageLabel.classList.remove('exception');
                    this.stateMessage.hidden = false;
                }
                else {
                    this.stateMessage.hidden = true;
                }
                this.updateActions();
                this.needsRefresh = false;
                this.dataSource.deemphasizedStackFramesToShow = [];
                await this.tree.updateChildren();
                try {
                    const toExpand = new Set();
                    sessions.forEach(s => {
                        // Automatically expand sessions that have children, but only do this once.
                        if (s.parentSession && !this.autoExpandedSessions.has(s.parentSession)) {
                            toExpand.add(s.parentSession);
                        }
                    });
                    for (const session of toExpand) {
                        await expandTo(session, this.tree);
                        this.autoExpandedSessions.add(session);
                    }
                }
                catch (e) {
                    // Ignore tree expand errors if element no longer present
                }
                if (this.selectionNeedsUpdate) {
                    this.selectionNeedsUpdate = false;
                    await this.updateTreeSelection();
                }
            }, 50));
        }
        renderHeaderTitle(container) {
            super.renderHeaderTitle(container, this.options.title);
            this.stateMessage = dom.append(container, $('span.call-stack-state-message'));
            this.stateMessage.hidden = true;
            this.stateMessageLabel = dom.append(this.stateMessage, $('span.label'));
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-call-stack');
            const treeContainer = (0, baseDebugView_1.renderViewTree)(container);
            this.dataSource = new CallStackDataSource(this.debugService);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleAsyncDataTree, 'CallStackView', treeContainer, new CallStackDelegate(), new CallStackCompressionDelegate(this.debugService), [
                this.instantiationService.createInstance(SessionsRenderer),
                this.instantiationService.createInstance(ThreadsRenderer),
                this.instantiationService.createInstance(StackFramesRenderer),
                new ErrorsRenderer(),
                new LoadMoreRenderer(),
                new ShowMoreRenderer()
            ], this.dataSource, {
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
                        if (e instanceof debugModel_1.Thread) {
                            return `${e.name} ${e.stateLabel}`;
                        }
                        if (e instanceof debugModel_1.StackFrame || typeof e === 'string') {
                            return e;
                        }
                        if (e instanceof debugModel_1.ThreadAndSessionIds) {
                            return LoadMoreRenderer.LABEL;
                        }
                        return (0, nls_1.localize)('showMoreStackFrames2', "Show More Stack Frames");
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
                    listBackground: this.getBackgroundColor()
                }
            });
            this.tree.setInput(this.debugService.getModel());
            this._register(this.tree);
            this._register(this.tree.onDidOpen(async (e) => {
                if (this.ignoreSelectionChangedEvent) {
                    return;
                }
                const focusStackFrame = (stackFrame, thread, session, options = {}) => {
                    this.ignoreFocusStackFrameEvent = true;
                    try {
                        this.debugService.focusStackFrame(stackFrame, thread, session, { ...options, ...{ explicit: true } });
                    }
                    finally {
                        this.ignoreFocusStackFrameEvent = false;
                    }
                };
                const element = e.element;
                if (element instanceof debugModel_1.StackFrame) {
                    const opts = {
                        preserveFocus: e.editorOptions.preserveFocus,
                        sideBySide: e.sideBySide,
                        pinned: e.editorOptions.pinned
                    };
                    focusStackFrame(element, element.thread, element.thread.session, opts);
                }
                if (element instanceof debugModel_1.Thread) {
                    focusStackFrame(undefined, element, element.session);
                }
                if (isDebugSession(element)) {
                    focusStackFrame(undefined, undefined, element);
                }
                if (element instanceof debugModel_1.ThreadAndSessionIds) {
                    const session = this.debugService.getModel().getSession(element.sessionId);
                    const thread = session && session.getThread(element.threadId);
                    if (thread) {
                        const totalFrames = thread.stoppedDetails?.totalFrames;
                        const remainingFramesCount = typeof totalFrames === 'number' ? (totalFrames - thread.getCallStack().length) : undefined;
                        // Get all the remaining frames
                        await thread.fetchCallStack(remainingFramesCount);
                        await this.tree.updateChildren();
                    }
                }
                if (element instanceof Array) {
                    this.dataSource.deemphasizedStackFramesToShow.push(...element);
                    this.tree.updateChildren();
                }
            }));
            this._register(this.debugService.getModel().onDidChangeCallStack(() => {
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                    return;
                }
                if (!this.onCallStackChangeScheduler.isScheduled()) {
                    this.onCallStackChangeScheduler.schedule();
                }
            }));
            const onFocusChange = event_1.Event.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getViewModel().onDidFocusSession);
            this._register(onFocusChange(async () => {
                if (this.ignoreFocusStackFrameEvent) {
                    return;
                }
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                    return;
                }
                if (this.onCallStackChangeScheduler.isScheduled()) {
                    this.selectionNeedsUpdate = true;
                    return;
                }
                await this.updateTreeSelection();
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            // Schedule the update of the call stack tree if the viewlet is opened after a session started #14684
            if (this.debugService.state === 2 /* State.Stopped */) {
                this.onCallStackChangeScheduler.schedule(0);
            }
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.needsRefresh) {
                    this.onCallStackChangeScheduler.schedule();
                }
            }));
            this._register(this.debugService.onDidNewSession(s => {
                const sessionListeners = [];
                sessionListeners.push(s.onDidChangeName(() => {
                    // this.tree.updateChildren is called on a delay after a session is added,
                    // so don't rerender if the tree doesn't have the node yet
                    if (this.tree.hasNode(s)) {
                        this.tree.rerender(s);
                    }
                }));
                sessionListeners.push(s.onDidEndAdapter(() => (0, lifecycle_1.dispose)(sessionListeners)));
                if (s.parentSession) {
                    // A session we already expanded has a new child session, allow to expand it again.
                    this.autoExpandedSessions.delete(s.parentSession);
                }
            }));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree.layout(height, width);
        }
        focus() {
            this.tree.domFocus();
        }
        collapseAll() {
            this.tree.collapseAll();
        }
        async updateTreeSelection() {
            if (!this.tree || !this.tree.getInput()) {
                // Tree not initialized yet
                return;
            }
            const updateSelectionAndReveal = (element) => {
                this.ignoreSelectionChangedEvent = true;
                try {
                    this.tree.setSelection([element]);
                    // If the element is outside of the screen bounds,
                    // position it in the middle
                    if (this.tree.getRelativeTop(element) === null) {
                        this.tree.reveal(element, 0.5);
                    }
                    else {
                        this.tree.reveal(element);
                    }
                }
                catch (e) { }
                finally {
                    this.ignoreSelectionChangedEvent = false;
                }
            };
            const thread = this.debugService.getViewModel().focusedThread;
            const session = this.debugService.getViewModel().focusedSession;
            const stackFrame = this.debugService.getViewModel().focusedStackFrame;
            if (!thread) {
                if (!session) {
                    this.tree.setSelection([]);
                }
                else {
                    updateSelectionAndReveal(session);
                }
            }
            else {
                // Ignore errors from this expansions because we are not aware if we rendered the threads and sessions or we hide them to declutter the view
                try {
                    await expandTo(thread.session, this.tree);
                }
                catch (e) { }
                try {
                    await this.tree.expand(thread);
                }
                catch (e) { }
                const toReveal = stackFrame || session;
                if (toReveal) {
                    updateSelectionAndReveal(toReveal);
                }
            }
        }
        onContextMenu(e) {
            const element = e.element;
            let overlay = [];
            if (isDebugSession(element)) {
                overlay = getSessionContextOverlay(element);
            }
            else if (element instanceof debugModel_1.Thread) {
                overlay = getThreadContextOverlay(element);
            }
            else if (element instanceof debugModel_1.StackFrame) {
                overlay = getStackFrameContextOverlay(element);
            }
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            const contextKeyService = this.contextKeyService.createOverlay(overlay);
            const menu = this.menuService.createMenu(actions_2.MenuId.DebugCallStackContext, contextKeyService);
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { arg: getContextForContributedActions(element), shouldForwardArgs: true }, result, 'inline');
            menu.dispose();
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => result.secondary,
                getActionsContext: () => getContext(element)
            });
        }
    };
    exports.CallStackView = CallStackView;
    exports.CallStackView = CallStackView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, debug_1.IDebugService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, actions_2.IMenuService)
    ], CallStackView);
    function getSessionContextOverlay(session) {
        return [
            [debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.key, 'session'],
            [debug_1.CONTEXT_CALLSTACK_SESSION_IS_ATTACH.key, (0, debugUtils_1.isSessionAttach)(session)],
            [debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED.key, session.state === 2 /* State.Stopped */],
            [debug_1.CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD.key, session.getAllThreads().length === 1],
        ];
    }
    let SessionsRenderer = class SessionsRenderer {
        static { SessionsRenderer_1 = this; }
        static { this.ID = 'session'; }
        constructor(instantiationService, contextKeyService, menuService) {
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
        }
        get templateId() {
            return SessionsRenderer_1.ID;
        }
        renderTemplate(container) {
            const session = dom.append(container, $('.session'));
            dom.append(session, $(themables_1.ThemeIcon.asCSSSelector(icons.callstackViewSession)));
            const name = dom.append(session, $('.name'));
            const stateLabel = dom.append(session, $('span.state.label.monaco-count-badge.long'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            const templateDisposable = new lifecycle_1.DisposableStore();
            const stopActionViewItemDisposables = templateDisposable.add(new lifecycle_1.DisposableStore());
            const actionBar = templateDisposable.add(new actionbar_1.ActionBar(session, {
                actionViewItemProvider: action => {
                    if ((action.id === debugCommands_1.STOP_ID || action.id === debugCommands_1.DISCONNECT_ID) && action instanceof actions_2.MenuItemAction) {
                        stopActionViewItemDisposables.clear();
                        const item = this.instantiationService.invokeFunction(accessor => (0, debugToolBar_1.createDisconnectMenuItemAction)(action, stopActionViewItemDisposables, accessor));
                        if (item) {
                            return item;
                        }
                    }
                    if (action instanceof actions_2.MenuItemAction) {
                        return this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined);
                    }
                    else if (action instanceof actions_2.SubmenuItemAction) {
                        return this.instantiationService.createInstance(menuEntryActionViewItem_1.SubmenuEntryActionViewItem, action, undefined);
                    }
                    return undefined;
                }
            }));
            const elementDisposable = templateDisposable.add(new lifecycle_1.DisposableStore());
            return { session, name, stateLabel, label, actionBar, elementDisposable, templateDisposable };
        }
        renderElement(element, _, data) {
            this.doRenderElement(element.element, (0, filters_1.createMatches)(element.filterData), data);
        }
        renderCompressedElements(node, _index, templateData) {
            const lastElement = node.element.elements[node.element.elements.length - 1];
            const matches = (0, filters_1.createMatches)(node.filterData);
            this.doRenderElement(lastElement, matches, templateData);
        }
        doRenderElement(session, matches, data) {
            data.session.title = (0, nls_1.localize)({ key: 'session', comment: ['Session is a noun'] }, "Session");
            data.label.set(session.getLabel(), matches);
            const stoppedDetails = session.getStoppedDetails();
            const thread = session.getAllThreads().find(t => t.stopped);
            const contextKeyService = this.contextKeyService.createOverlay(getSessionContextOverlay(session));
            const menu = data.elementDisposable.add(this.menuService.createMenu(actions_2.MenuId.DebugCallStackContext, contextKeyService));
            const setupActionBar = () => {
                data.actionBar.clear();
                const primary = [];
                const secondary = [];
                const result = { primary, secondary };
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { arg: getContextForContributedActions(session), shouldForwardArgs: true }, result, 'inline');
                data.actionBar.push(primary, { icon: true, label: false });
                // We need to set our internal context on the action bar, since our commands depend on that one
                // While the external context our extensions rely on
                data.actionBar.context = getContext(session);
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
                data.stateLabel.textContent = (0, nls_1.localize)({ key: 'running', comment: ['indicates state'] }, "Running");
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
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, actions_2.IMenuService)
    ], SessionsRenderer);
    function getThreadContextOverlay(thread) {
        return [
            [debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.key, 'thread'],
            [debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED.key, thread.stopped]
        ];
    }
    let ThreadsRenderer = class ThreadsRenderer {
        static { ThreadsRenderer_1 = this; }
        static { this.ID = 'thread'; }
        constructor(contextKeyService, menuService) {
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
        }
        get templateId() {
            return ThreadsRenderer_1.ID;
        }
        renderTemplate(container) {
            const thread = dom.append(container, $('.thread'));
            const name = dom.append(thread, $('.name'));
            const stateLabel = dom.append(thread, $('span.state.label.monaco-count-badge.long'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            const templateDisposable = new lifecycle_1.DisposableStore();
            const actionBar = templateDisposable.add(new actionbar_1.ActionBar(thread));
            const elementDisposable = templateDisposable.add(new lifecycle_1.DisposableStore());
            return { thread, name, stateLabel, label, actionBar, elementDisposable, templateDisposable };
        }
        renderElement(element, _index, data) {
            const thread = element.element;
            data.thread.title = thread.name;
            data.label.set(thread.name, (0, filters_1.createMatches)(element.filterData));
            data.stateLabel.textContent = thread.stateLabel;
            data.stateLabel.classList.toggle('exception', thread.stoppedDetails?.reason === 'exception');
            const contextKeyService = this.contextKeyService.createOverlay(getThreadContextOverlay(thread));
            const menu = data.elementDisposable.add(this.menuService.createMenu(actions_2.MenuId.DebugCallStackContext, contextKeyService));
            const setupActionBar = () => {
                data.actionBar.clear();
                const primary = [];
                const secondary = [];
                const result = { primary, secondary };
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { arg: getContextForContributedActions(thread), shouldForwardArgs: true }, result, 'inline');
                data.actionBar.push(primary, { icon: true, label: false });
                // We need to set our internal context on the action bar, since our commands depend on that one
                // While the external context our extensions rely on
                data.actionBar.context = getContext(thread);
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
        __param(0, contextkey_1.IContextKeyService),
        __param(1, actions_2.IMenuService)
    ], ThreadsRenderer);
    function getStackFrameContextOverlay(stackFrame) {
        return [
            [debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.key, 'stackFrame'],
            [debug_1.CONTEXT_STACK_FRAME_SUPPORTS_RESTART.key, stackFrame.canRestart]
        ];
    }
    let StackFramesRenderer = class StackFramesRenderer {
        static { StackFramesRenderer_1 = this; }
        static { this.ID = 'stackFrame'; }
        constructor(labelService, notificationService) {
            this.labelService = labelService;
            this.notificationService = notificationService;
        }
        get templateId() {
            return StackFramesRenderer_1.ID;
        }
        renderTemplate(container) {
            const stackFrame = dom.append(container, $('.stack-frame'));
            const labelDiv = dom.append(stackFrame, $('span.label.expression'));
            const file = dom.append(stackFrame, $('.file'));
            const fileName = dom.append(file, $('span.file-name'));
            const wrapper = dom.append(file, $('span.line-number-wrapper'));
            const lineNumber = dom.append(wrapper, $('span.line-number.monaco-count-badge'));
            const label = new highlightedLabel_1.HighlightedLabel(labelDiv);
            const templateDisposable = new lifecycle_1.DisposableStore();
            const actionBar = templateDisposable.add(new actionbar_1.ActionBar(stackFrame));
            return { file, fileName, label, lineNumber, stackFrame, actionBar, templateDisposable };
        }
        renderElement(element, index, data) {
            const stackFrame = element.element;
            data.stackFrame.classList.toggle('disabled', !stackFrame.source || !stackFrame.source.available || isDeemphasized(stackFrame));
            data.stackFrame.classList.toggle('label', stackFrame.presentationHint === 'label');
            data.stackFrame.classList.toggle('subtle', stackFrame.presentationHint === 'subtle');
            const hasActions = !!stackFrame.thread.session.capabilities.supportsRestartFrame && stackFrame.presentationHint !== 'label' && stackFrame.presentationHint !== 'subtle' && stackFrame.canRestart;
            data.stackFrame.classList.toggle('has-actions', hasActions);
            data.file.title = stackFrame.source.inMemory ? stackFrame.source.uri.path : this.labelService.getUriLabel(stackFrame.source.uri);
            if (stackFrame.source.raw.origin) {
                data.file.title += `\n${stackFrame.source.raw.origin}`;
            }
            data.label.set(stackFrame.name, (0, filters_1.createMatches)(element.filterData), stackFrame.name);
            data.fileName.textContent = getSpecificSourceName(stackFrame);
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
                const action = new actions_1.Action('debug.callStack.restartFrame', (0, nls_1.localize)('restartFrame', "Restart Frame"), themables_1.ThemeIcon.asClassName(icons.debugRestartFrame), true, async () => {
                    try {
                        await stackFrame.restart();
                    }
                    catch (e) {
                        this.notificationService.error(e);
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
        __param(0, label_1.ILabelService),
        __param(1, notification_1.INotificationService)
    ], StackFramesRenderer);
    class ErrorsRenderer {
        static { this.ID = 'error'; }
        get templateId() {
            return ErrorsRenderer.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, $('.error'));
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
        static { this.LABEL = (0, nls_1.localize)('loadAllStackFrames', "Load More Stack Frames"); }
        constructor() { }
        get templateId() {
            return LoadMoreRenderer.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, $('.load-all'));
            label.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.textLinkForeground);
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
            const label = dom.append(container, $('.show-more'));
            label.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.textLinkForeground);
            return { label };
        }
        renderElement(element, index, data) {
            const stackFrames = element.element;
            if (stackFrames.every(sf => !!(sf.source && sf.source.origin && sf.source.origin === stackFrames[0].source.origin))) {
                data.label.textContent = (0, nls_1.localize)('showMoreAndOrigin', "Show {0} More: {1}", stackFrames.length, stackFrames[0].source.origin);
            }
            else {
                data.label.textContent = (0, nls_1.localize)('showMoreStackFrames', "Show {0} More Stack Frames", stackFrames.length);
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
            if (element instanceof debugModel_1.StackFrame && element.presentationHint === 'label') {
                return 16;
            }
            if (element instanceof debugModel_1.ThreadAndSessionIds || element instanceof Array) {
                return 16;
            }
            return 22;
        }
        getTemplateId(element) {
            if (isDebugSession(element)) {
                return SessionsRenderer.ID;
            }
            if (element instanceof debugModel_1.Thread) {
                return ThreadsRenderer.ID;
            }
            if (element instanceof debugModel_1.StackFrame) {
                return StackFramesRenderer.ID;
            }
            if (typeof element === 'string') {
                return ErrorsRenderer.ID;
            }
            if (element instanceof debugModel_1.ThreadAndSessionIds) {
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
            (stoppedDetails.reason ? (0, nls_1.localize)({ key: 'pausedOn', comment: ['indicates reason for program being paused'] }, "Paused on {0}", stoppedDetails.reason) : (0, nls_1.localize)('paused', "Paused"));
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
        constructor(debugService) {
            this.debugService = debugService;
            this.deemphasizedStackFramesToShow = [];
        }
        hasChildren(element) {
            if (isDebugSession(element)) {
                const threads = element.getAllThreads();
                return (threads.length > 1) || (threads.length === 1 && threads[0].stopped) || !!(this.debugService.getModel().getSessions().find(s => s.parentSession === element));
            }
            return isDebugModel(element) || (element instanceof debugModel_1.Thread && element.stopped);
        }
        async getChildren(element) {
            if (isDebugModel(element)) {
                const sessions = element.getSessions();
                if (sessions.length === 0) {
                    return Promise.resolve([]);
                }
                if (sessions.length > 1 || this.debugService.getViewModel().isMultiSessionView()) {
                    return Promise.resolve(sessions.filter(s => !s.parentSession));
                }
                const threads = sessions[0].getAllThreads();
                // Only show the threads in the call stack if there is more than 1 thread.
                return threads.length === 1 ? this.getThreadChildren(threads[0]) : Promise.resolve(threads);
            }
            else if (isDebugSession(element)) {
                const childSessions = this.debugService.getModel().getSessions().filter(s => s.parentSession === element);
                const threads = element.getAllThreads();
                if (threads.length === 1) {
                    // Do not show thread when there is only one to be compact.
                    const children = await this.getThreadChildren(threads[0]);
                    return children.concat(childSessions);
                }
                return Promise.resolve(threads.concat(childSessions));
            }
            else {
                return this.getThreadChildren(element);
            }
        }
        getThreadChildren(thread) {
            return this.getThreadCallstack(thread).then(children => {
                // Check if some stack frames should be hidden under a parent element since they are deemphasized
                const result = [];
                children.forEach((child, index) => {
                    if (child instanceof debugModel_1.StackFrame && child.source && isDeemphasized(child)) {
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
                            if (nextChild instanceof debugModel_1.StackFrame && nextChild.source && isDeemphasized(nextChild)) {
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
        async getThreadCallstack(thread) {
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
                callStack = callStack.concat([new debugModel_1.ThreadAndSessionIds(thread.session.getId(), thread.threadId)]);
            }
            return callStack;
        }
    }
    class CallStackAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)({ comment: ['Debug is a noun in this context, not a verb.'], key: 'callStackAriaLabel' }, "Debug Call Stack");
        }
        getWidgetRole() {
            // Use treegrid as a role since each element can have additional actions inside #146210
            return 'treegrid';
        }
        getRole(_element) {
            return 'row';
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.Thread) {
                return (0, nls_1.localize)({ key: 'threadAriaLabel', comment: ['Placeholders stand for the thread name and the thread state.For example "Thread 1" and "Stopped'] }, "Thread {0} {1}", element.name, element.stateLabel);
            }
            if (element instanceof debugModel_1.StackFrame) {
                return (0, nls_1.localize)('stackFrameAriaLabel', "Stack Frame {0}, line {1}, {2}", element.name, element.range.startLineNumber, getSpecificSourceName(element));
            }
            if (isDebugSession(element)) {
                const thread = element.getAllThreads().find(t => t.stopped);
                const state = thread ? thread.stateLabel : (0, nls_1.localize)({ key: 'running', comment: ['indicates state'] }, "Running");
                return (0, nls_1.localize)({ key: 'sessionLabel', comment: ['Placeholders stand for the session name and the session state. For example "Launch Program" and "Running"'] }, "Session {0} {1}", element.getLabel(), state);
            }
            if (typeof element === 'string') {
                return element;
            }
            if (element instanceof Array) {
                return (0, nls_1.localize)('showMoreStackFrames', "Show {0} More Stack Frames", element.length);
            }
            // element instanceof ThreadAndSessionIds
            return LoadMoreRenderer.LABEL;
        }
    }
    class CallStackCompressionDelegate {
        constructor(debugService) {
            this.debugService = debugService;
        }
        isIncompressible(stat) {
            if (isDebugSession(stat)) {
                if (stat.compact) {
                    return false;
                }
                const sessions = this.debugService.getModel().getSessions();
                if (sessions.some(s => s.parentSession === stat && s.compact)) {
                    return false;
                }
                return true;
            }
            return true;
        }
    }
    (0, actions_2.registerAction2)(class Collapse extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'callStack.collapse',
                viewId: debug_1.CALLSTACK_VIEW_ID,
                title: (0, nls_1.localize)('collapse', "Collapse All"),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo((0, debug_1.getStateLabel)(2 /* State.Stopped */)),
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 10,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.CALLSTACK_VIEW_ID)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    function registerCallStackInlineMenuItem(id, title, icon, when, order, precondition) {
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugCallStackContext, {
            group: 'inline',
            order,
            when,
            command: { id, title, icon, precondition }
        });
    }
    const threadOrSessionWithOneThread = contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), debug_1.CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD));
    registerCallStackInlineMenuItem(debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, icons.debugPause, contextkey_1.ContextKeyExpr.and(threadOrSessionWithOneThread, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED.toNegated()), 10);
    registerCallStackInlineMenuItem(debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, icons.debugContinue, contextkey_1.ContextKeyExpr.and(threadOrSessionWithOneThread, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED), 10);
    registerCallStackInlineMenuItem(debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, icons.debugStepOver, threadOrSessionWithOneThread, 20, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED);
    registerCallStackInlineMenuItem(debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, icons.debugStepInto, threadOrSessionWithOneThread, 30, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED);
    registerCallStackInlineMenuItem(debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, icons.debugStepOut, threadOrSessionWithOneThread, 40, debug_1.CONTEXT_CALLSTACK_ITEM_STOPPED);
    registerCallStackInlineMenuItem(debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL, icons.debugRestart, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), 50);
    registerCallStackInlineMenuItem(debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, icons.debugStop, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session')), 60);
    registerCallStackInlineMenuItem(debugCommands_1.DISCONNECT_ID, debugCommands_1.DISCONNECT_LABEL, icons.debugDisconnect, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_SESSION_IS_ATTACH, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session')), 60);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbFN0YWNrVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvY2FsbFN0YWNrVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0RoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBSWhCLFNBQVMsb0JBQW9CLENBQUMsT0FBc0IsRUFBRSxPQUFZO1FBQ2pFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BDLE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxTQUFTLG1CQUFtQixDQUFDLE9BQWdCLEVBQUUsT0FBWTtRQUMxRCxPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxTQUFTLHVCQUF1QixDQUFDLE9BQW1CLEVBQUUsT0FBWTtRQUNqRSxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsQyxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDakMsT0FBTyxDQUFDLGFBQWEsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdFLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0MsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxPQUE2QjtRQUN2RCxJ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