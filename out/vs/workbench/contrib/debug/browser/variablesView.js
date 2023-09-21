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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, dom, highlightedLabel_1, arrays_1, async_1, codicons_1, filters_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, actions_1, clipboardService_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, notification_1, opener_1, progress_1, telemetry_1, themeService_1, viewPane_1, views_1, baseDebugView_1, linkDetector_1, debug_1, debugModel_1, editorService_1, extensions_1) {
    "use strict";
    var VariablesRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ADD_TO_WATCH_ID = exports.COPY_EVALUATE_PATH_ID = exports.BREAK_WHEN_VALUE_IS_READ_ID = exports.BREAK_WHEN_VALUE_IS_ACCESSED_ID = exports.BREAK_WHEN_VALUE_CHANGES_ID = exports.VIEW_MEMORY_ID = exports.COPY_VALUE_ID = exports.SET_VARIABLE_ID = exports.VariablesRenderer = exports.VariablesView = void 0;
    const $ = dom.$;
    let forgetScopes = true;
    let variableInternalContext;
    let dataBreakpointInfoResponse;
    let VariablesView = class VariablesView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, telemetryService, menuService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.debugService = debugService;
            this.menuService = menuService;
            this.needsRefresh = false;
            this.savedViewState = new Map();
            this.autoExpandedScopes = new Set();
            // Use scheduler to prevent unnecessary flashing
            this.updateTreeScheduler = new async_1.RunOnceScheduler(async () => {
                const stackFrame = this.debugService.getViewModel().focusedStackFrame;
                this.needsRefresh = false;
                const input = this.tree.getInput();
                if (input) {
                    this.savedViewState.set(input.getId(), this.tree.getViewState());
                }
                if (!stackFrame) {
                    await this.tree.setInput(null);
                    return;
                }
                const viewState = this.savedViewState.get(stackFrame.getId());
                await this.tree.setInput(stackFrame, viewState);
                // Automatically expand the first non-expensive scope
                const scopes = await stackFrame.getScopes();
                const toExpand = scopes.find(s => !s.expensive);
                // A race condition could be present causing the scopes here to be different from the scopes that the tree just retrieved.
                // If that happened, don't try to reveal anything, it will be straightened out on the next update
                if (toExpand && this.tree.hasNode(toExpand)) {
                    this.autoExpandedScopes.add(toExpand.getId());
                    await this.tree.expand(toExpand);
                }
            }, 400);
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-variables');
            const treeContainer = (0, baseDebugView_1.renderViewTree)(container);
            const linkeDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'VariablesView', treeContainer, new VariablesDelegate(), [this.instantiationService.createInstance(VariablesRenderer, linkeDetector), new ScopesRenderer(), new ScopeErrorRenderer()], new VariablesDataSource(), {
                accessibilityProvider: new VariablesAccessibilityProvider(),
                identityProvider: { getId: (element) => element.getId() },
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.name },
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            this.tree.setInput(this.debugService.getViewModel().focusedStackFrame ?? null);
            debug_1.CONTEXT_VARIABLES_FOCUSED.bindTo(this.tree.contextKeyService);
            this._register(this.debugService.getViewModel().onDidFocusStackFrame(sf => {
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                    return;
                }
                // Refresh the tree immediately if the user explictly changed stack frames.
                // Otherwise postpone the refresh until user stops stepping.
                const timeout = sf.explicit ? 0 : undefined;
                this.updateTreeScheduler.schedule(timeout);
            }));
            this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
                const stackFrame = this.debugService.getViewModel().focusedStackFrame;
                if (stackFrame && forgetScopes) {
                    stackFrame.forgetScopes();
                }
                forgetScopes = true;
                this.tree.updateChildren();
            }));
            this._register(this.tree);
            this._register(this.tree.onMouseDblClick(e => this.onMouseDblClick(e)));
            this._register(this.tree.onContextMenu(async (e) => await this.onContextMenu(e)));
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.needsRefresh) {
                    this.updateTreeScheduler.schedule();
                }
            }));
            let horizontalScrolling;
            this._register(this.debugService.getViewModel().onDidSelectExpression(e => {
                const variable = e?.expression;
                if (variable instanceof debugModel_1.Variable && !e?.settingWatch) {
                    horizontalScrolling = this.tree.options.horizontalScrolling;
                    if (horizontalScrolling) {
                        this.tree.updateOptions({ horizontalScrolling: false });
                    }
                    this.tree.rerender(variable);
                }
                else if (!e && horizontalScrolling !== undefined) {
                    this.tree.updateOptions({ horizontalScrolling: horizontalScrolling });
                    horizontalScrolling = undefined;
                }
            }));
            this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
                if (e instanceof debugModel_1.Variable && this.tree.hasNode(e)) {
                    await this.tree.updateChildren(e, false, true);
                    await this.tree.expand(e);
                }
            }));
            this._register(this.debugService.onDidEndSession(() => {
                this.savedViewState.clear();
                this.autoExpandedScopes.clear();
            }));
        }
        layoutBody(width, height) {
            super.layoutBody(height, width);
            this.tree.layout(width, height);
        }
        focus() {
            this.tree.domFocus();
        }
        collapseAll() {
            this.tree.collapseAll();
        }
        onMouseDblClick(e) {
            const session = this.debugService.getViewModel().focusedSession;
            if (session && e.element instanceof debugModel_1.Variable && session.capabilities.supportsSetVariable && !e.element.presentationHint?.attributes?.includes('readOnly') && !e.element.presentationHint?.lazy) {
                this.debugService.getViewModel().setSelectedExpression(e.element, false);
            }
        }
        async onContextMenu(e) {
            const variable = e.element;
            if (!(variable instanceof debugModel_1.Variable) || !variable.value) {
                return;
            }
            const toDispose = new lifecycle_1.DisposableStore();
            try {
                const contextKeyService = await getContextForVariableMenuWithDataAccess(this.contextKeyService, variable);
                const menu = toDispose.add(this.menuService.createMenu(actions_1.MenuId.DebugVariablesContext, contextKeyService));
                const context = getVariablesContext(variable);
                const secondary = [];
                (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { arg: context, shouldForwardArgs: false }, { primary: [], secondary }, 'inline');
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => secondary
                });
            }
            finally {
                toDispose.dispose();
            }
        }
    };
    exports.VariablesView = VariablesView;
    exports.VariablesView = VariablesView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, debug_1.IDebugService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, actions_1.IMenuService)
    ], VariablesView);
    const getVariablesContext = (variable) => ({
        sessionId: variable.getSession()?.getId(),
        container: variable.parent instanceof debugModel_1.Expression
            ? { expression: variable.parent.name }
            : variable.parent.toDebugProtocolObject(),
        variable: variable.toDebugProtocolObject()
    });
    /**
     * Gets a context key overlay that has context for the given variable, including data access info.
     */
    async function getContextForVariableMenuWithDataAccess(parentContext, variable) {
        const session = variable.getSession();
        if (!session || !session.capabilities.supportsDataBreakpoints) {
            return getContextForVariableMenu(parentContext, variable);
        }
        const contextKeys = [];
        dataBreakpointInfoResponse = await session.dataBreakpointInfo(variable.name, variable.parent.reference);
        const dataBreakpointId = dataBreakpointInfoResponse?.dataId;
        const dataBreakpointAccessTypes = dataBreakpointInfoResponse?.accessTypes;
        if (!dataBreakpointAccessTypes) {
            contextKeys.push([debug_1.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED.key, !!dataBreakpointId]);
        }
        else {
            for (const accessType of dataBreakpointAccessTypes) {
                switch (accessType) {
                    case 'read':
                        contextKeys.push([debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED.key, !!dataBreakpointId]);
                        break;
                    case 'write':
                        contextKeys.push([debug_1.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED.key, !!dataBreakpointId]);
                        break;
                    case 'readWrite':
                        contextKeys.push([debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED.key, !!dataBreakpointId]);
                        break;
                }
            }
        }
        return getContextForVariableMenu(parentContext, variable, contextKeys);
    }
    /**
     * Gets a context key overlay that has context for the given variable.
     */
    function getContextForVariableMenu(parentContext, variable, additionalContext = []) {
        const session = variable.getSession();
        const contextKeys = [
            [debug_1.CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT.key, variable.variableMenuContext || ''],
            [debug_1.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT.key, !!variable.evaluateName],
            [debug_1.CONTEXT_CAN_VIEW_MEMORY.key, !!session?.capabilities.supportsReadMemoryRequest && variable.memoryReference !== undefined],
            [debug_1.CONTEXT_VARIABLE_IS_READONLY.key, !!variable.presentationHint?.attributes?.includes('readOnly') || variable.presentationHint?.lazy],
            ...additionalContext,
        ];
        variableInternalContext = variable;
        return parentContext.createOverlay(contextKeys);
    }
    function isStackFrame(obj) {
        return obj instanceof debugModel_1.StackFrame;
    }
    class VariablesDataSource {
        hasChildren(element) {
            if (!element) {
                return false;
            }
            if (isStackFrame(element)) {
                return true;
            }
            return element.hasChildren;
        }
        getChildren(element) {
            if (isStackFrame(element)) {
                return element.getScopes();
            }
            return element.getChildren();
        }
    }
    class VariablesDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.ErrorScope) {
                return ScopeErrorRenderer.ID;
            }
            if (element instanceof debugModel_1.Scope) {
                return ScopesRenderer.ID;
            }
            return VariablesRenderer.ID;
        }
    }
    class ScopesRenderer {
        static { this.ID = 'scope'; }
        get templateId() {
            return ScopesRenderer.ID;
        }
        renderTemplate(container) {
            const name = dom.append(container, $('.scope'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            return { name, label };
        }
        renderElement(element, index, templateData) {
            templateData.label.set(element.element.name, (0, filters_1.createMatches)(element.filterData));
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class ScopeErrorRenderer {
        static { this.ID = 'scopeError'; }
        get templateId() {
            return ScopeErrorRenderer.ID;
        }
        renderTemplate(container) {
            const wrapper = dom.append(container, $('.scope'));
            const error = dom.append(wrapper, $('.error'));
            return { error };
        }
        renderElement(element, index, templateData) {
            templateData.error.innerText = element.element.name;
        }
        disposeTemplate() {
            // noop
        }
    }
    let VariablesRenderer = class VariablesRenderer extends baseDebugView_1.AbstractExpressionsRenderer {
        static { VariablesRenderer_1 = this; }
        static { this.ID = 'variable'; }
        constructor(linkDetector, menuService, contextKeyService, debugService, contextViewService) {
            super(debugService, contextViewService);
            this.linkDetector = linkDetector;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
        }
        get templateId() {
            return VariablesRenderer_1.ID;
        }
        renderExpression(expression, data, highlights) {
            (0, baseDebugView_1.renderVariable)(expression, data, true, highlights, this.linkDetector);
        }
        renderElement(node, index, data) {
            super.renderExpressionElement(node.element, node, data);
        }
        getInputBoxOptions(expression) {
            const variable = expression;
            return {
                initialValue: expression.value,
                ariaLabel: (0, nls_1.localize)('variableValueAriaLabel', "Type new variable value"),
                validationOptions: {
                    validation: () => variable.errorMessage ? ({ content: variable.errorMessage }) : null
                },
                onFinish: (value, success) => {
                    variable.errorMessage = undefined;
                    const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                    if (success && variable.value !== value && focusedStackFrame) {
                        variable.setVariable(value, focusedStackFrame)
                            // Need to force watch expressions and variables to update since a variable change can have an effect on both
                            .then(() => {
                            // Do not refresh scopes due to a node limitation #15520
                            forgetScopes = false;
                            this.debugService.getViewModel().updateViews();
                        });
                    }
                }
            };
        }
        renderActionBar(actionBar, expression) {
            const variable = expression;
            const contextKeyService = getContextForVariableMenu(this.contextKeyService, variable);
            const menu = this.menuService.createMenu(actions_1.MenuId.DebugVariablesContext, contextKeyService);
            const primary = [];
            const context = getVariablesContext(variable);
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { arg: context, shouldForwardArgs: false }, { primary, secondary: [] }, 'inline');
            actionBar.clear();
            actionBar.context = context;
            actionBar.push(primary, { icon: true, label: false });
        }
    };
    exports.VariablesRenderer = VariablesRenderer;
    exports.VariablesRenderer = VariablesRenderer = VariablesRenderer_1 = __decorate([
        __param(1, actions_1.IMenuService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, debug_1.IDebugService),
        __param(4, contextView_1.IContextViewService)
    ], VariablesRenderer);
    class VariablesAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('variablesAriaTreeLabel', "Debug Variables");
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.Scope) {
                return (0, nls_1.localize)('variableScopeAriaLabel', "Scope {0}", element.name);
            }
            if (element instanceof debugModel_1.Variable) {
                return (0, nls_1.localize)({ key: 'variableAriaLabel', comment: ['Placeholders are variable name and variable value respectivly. They should not be translated.'] }, "{0}, value {1}", element.name, element.value);
            }
            return null;
        }
    }
    exports.SET_VARIABLE_ID = 'debug.setVariable';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SET_VARIABLE_ID,
        handler: (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.getViewModel().setSelectedExpression(variableInternalContext, false);
        }
    });
    exports.COPY_VALUE_ID = 'workbench.debug.viewlet.action.copyValue';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COPY_VALUE_ID,
        handler: async (accessor, arg, ctx) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            let elementContext = '';
            let elements;
            if (arg instanceof debugModel_1.Variable || arg instanceof debugModel_1.Expression) {
                elementContext = 'watch';
                elements = ctx ? ctx : [];
            }
            else {
                elementContext = 'variables';
                elements = variableInternalContext ? [variableInternalContext] : [];
            }
            const stackFrame = debugService.getViewModel().focusedStackFrame;
            const session = debugService.getViewModel().focusedSession;
            if (!stackFrame || !session || elements.length === 0) {
                return;
            }
            const evalContext = session.capabilities.supportsClipboardContext ? 'clipboard' : elementContext;
            const toEvaluate = elements.map(element => element instanceof debugModel_1.Variable ? (element.evaluateName || element.value) : element.name);
            try {
                const evaluations = await Promise.all(toEvaluate.map(expr => session.evaluate(expr, stackFrame.frameId, evalContext)));
                const result = (0, arrays_1.coalesce)(evaluations).map(evaluation => evaluation.body.result);
                if (result.length) {
                    clipboardService.writeText(result.join('\n'));
                }
            }
            catch (e) {
                const result = elements.map(element => element.value);
                clipboardService.writeText(result.join('\n'));
            }
        }
    });
    exports.VIEW_MEMORY_ID = 'workbench.debug.viewlet.action.viewMemory';
    const HEX_EDITOR_EXTENSION_ID = 'ms-vscode.hexeditor';
    const HEX_EDITOR_EDITOR_ID = 'hexEditor.hexedit';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.VIEW_MEMORY_ID,
        handler: async (accessor, arg, ctx) => {
            const debugService = accessor.get(debug_1.IDebugService);
            let sessionId;
            let memoryReference;
            if ('sessionId' in arg) { // IVariablesContext
                if (!arg.sessionId || !arg.variable.memoryReference) {
                    return;
                }
                sessionId = arg.sessionId;
                memoryReference = arg.variable.memoryReference;
            }
            else { // IExpression
                if (!arg.memoryReference) {
                    return;
                }
                const focused = debugService.getViewModel().focusedSession;
                if (!focused) {
                    return;
                }
                sessionId = focused.getId();
                memoryReference = arg.memoryReference;
            }
            const commandService = accessor.get(commands_1.ICommandService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const notifications = accessor.get(notification_1.INotificationService);
            const progressService = accessor.get(progress_1.IProgressService);
            const extensionService = accessor.get(extensions_1.IExtensionService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            const ext = await extensionService.getExtension(HEX_EDITOR_EXTENSION_ID);
            if (ext || await tryInstallHexEditor(notifications, progressService, extensionService, commandService)) {
                /* __GDPR__
                    "debug/didViewMemory" : {
                        "owner": "connor4312",
                        "debugType" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                telemetryService.publicLog('debug/didViewMemory', {
                    debugType: debugService.getModel().getSession(sessionId)?.configuration.type,
                });
                await editorService.openEditor({
                    resource: (0, debugModel_1.getUriForDebugMemory)(sessionId, memoryReference),
                    options: {
                        revealIfOpened: true,
                        override: HEX_EDITOR_EDITOR_ID,
                    },
                }, editorService_1.SIDE_GROUP);
            }
        }
    });
    function tryInstallHexEditor(notifications, progressService, extensionService, commandService) {
        return new Promise(resolve => {
            let installing = false;
            const handle = notifications.prompt(notification_1.Severity.Info, (0, nls_1.localize)("viewMemory.prompt", "Inspecting binary data requires the Hex Editor extension. Would you like to install it now?"), [
                {
                    label: (0, nls_1.localize)("cancel", "Cancel"),
                    run: () => resolve(false),
                },
                {
                    label: (0, nls_1.localize)("install", "Install"),
                    run: async () => {
                        installing = true;
                        try {
                            await progressService.withProgress({
                                location: 15 /* ProgressLocation.Notification */,
                                title: (0, nls_1.localize)("viewMemory.install.progress", "Installing the Hex Editor..."),
                            }, async () => {
                                await commandService.executeCommand('workbench.extensions.installExtension', HEX_EDITOR_EXTENSION_ID);
                                // it seems like the extension is not registered immediately on install --
                                // wait for it to appear before returning.
                                while (!(await extensionService.getExtension(HEX_EDITOR_EXTENSION_ID))) {
                                    await (0, async_1.timeout)(30);
                                }
                            });
                            resolve(true);
                        }
                        catch (e) {
                            notifications.error(e);
                            resolve(false);
                        }
                    }
                },
            ], { sticky: true });
            handle.onDidClose(e => {
                if (!installing) {
                    resolve(false);
                }
            });
        });
    }
    exports.BREAK_WHEN_VALUE_CHANGES_ID = 'debug.breakWhenValueChanges';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.BREAK_WHEN_VALUE_CHANGES_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'write');
            }
        }
    });
    exports.BREAK_WHEN_VALUE_IS_ACCESSED_ID = 'debug.breakWhenValueIsAccessed';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.BREAK_WHEN_VALUE_IS_ACCESSED_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'readWrite');
            }
        }
    });
    exports.BREAK_WHEN_VALUE_IS_READ_ID = 'debug.breakWhenValueIsRead';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.BREAK_WHEN_VALUE_IS_READ_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'read');
            }
        }
    });
    exports.COPY_EVALUATE_PATH_ID = 'debug.copyEvaluatePath';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COPY_EVALUATE_PATH_ID,
        handler: async (accessor, context) => {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            await clipboardService.writeText(context.variable.evaluateName);
        }
    });
    exports.ADD_TO_WATCH_ID = 'debug.addToWatchExpressions';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.ADD_TO_WATCH_ID,
        handler: async (accessor, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.addWatchExpression(context.variable.evaluateName);
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'variables.collapse',
                viewId: debug_1.VARIABLES_VIEW_ID,
                title: (0, nls_1.localize)('collapse', "Collapse All"),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.VARIABLES_VIEW_ID)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVzVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvdmFyaWFibGVzVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUNoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQztJQUV4QixJQUFJLHVCQUE2QyxDQUFDO0lBQ2xELElBQUksMEJBQW1FLENBQUM7SUFRakUsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLG1CQUFRO1FBUTFDLFlBQ0MsT0FBNEIsRUFDUCxrQkFBdUMsRUFDN0MsWUFBNEMsRUFDdkMsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUMzQyxvQkFBMkMsRUFDMUMscUJBQTZDLEVBQ2pELGlCQUFxQyxFQUN6QyxhQUE2QixFQUM5QixZQUEyQixFQUN2QixnQkFBbUMsRUFDeEMsV0FBMEM7WUFFeEQsS0FBSyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFYM0osaUJBQVksR0FBWixZQUFZLENBQWU7WUFTNUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFqQmpELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1lBRXJCLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQW1DLENBQUM7WUFDNUQsdUJBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQWtCOUMsZ0RBQWdEO1lBQ2hELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLHdCQUFnQixDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUMxRCxNQUFNLFVB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