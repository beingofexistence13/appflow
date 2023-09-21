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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/debug/browser/variablesView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, dom, highlightedLabel_1, arrays_1, async_1, codicons_1, filters_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, actions_1, clipboardService_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, notification_1, opener_1, progress_1, telemetry_1, themeService_1, viewPane_1, views_1, baseDebugView_1, linkDetector_1, debug_1, debugModel_1, editorService_1, extensions_1) {
    "use strict";
    var $pRb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xRb = exports.$wRb = exports.$vRb = exports.$uRb = exports.$tRb = exports.$sRb = exports.$rRb = exports.$qRb = exports.$pRb = exports.$oRb = void 0;
    const $ = dom.$;
    let forgetScopes = true;
    let variableInternalContext;
    let dataBreakpointInfoResponse;
    let $oRb = class $oRb extends viewPane_1.$Ieb {
        constructor(options, contextMenuService, h, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, telemetryService, j) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.h = h;
            this.j = j;
            this.b = false;
            this.f = new Map();
            this.g = new Set();
            // Use scheduler to prevent unnecessary flashing
            this.a = new async_1.$Sg(async () => {
                const stackFrame = this.h.getViewModel().focusedStackFrame;
                this.b = false;
                const input = this.c.getInput();
                if (input) {
                    this.f.set(input.getId(), this.c.getViewState());
                }
                if (!stackFrame) {
                    await this.c.setInput(null);
                    return;
                }
                const viewState = this.f.get(stackFrame.getId());
                await this.c.setInput(stackFrame, viewState);
                // Automatically expand the first non-expensive scope
                const scopes = await stackFrame.getScopes();
                const toExpand = scopes.find(s => !s.expensive);
                // A race condition could be present causing the scopes here to be different from the scopes that the tree just retrieved.
                // If that happened, don't try to reveal anything, it will be straightened out on the next update
                if (toExpand && this.c.hasNode(toExpand)) {
                    this.g.add(toExpand.getId());
                    await this.c.expand(toExpand);
                }
            }, 400);
        }
        U(container) {
            super.U(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-variables');
            const treeContainer = (0, baseDebugView_1.$0Pb)(container);
            const linkeDetector = this.Bb.createInstance(linkDetector_1.$2Pb);
            this.c = this.Bb.createInstance(listService_1.$w4, 'VariablesView', treeContainer, new VariablesDelegate(), [this.Bb.createInstance($pRb, linkeDetector), new ScopesRenderer(), new ScopeErrorRenderer()], new VariablesDataSource(), {
                accessibilityProvider: new VariablesAccessibilityProvider(),
                identityProvider: { getId: (element) => element.getId() },
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.name },
                overrideStyles: {
                    listBackground: this.Rb()
                }
            });
            this.c.setInput(this.h.getViewModel().focusedStackFrame ?? null);
            debug_1.$FG.bindTo(this.c.contextKeyService);
            this.B(this.h.getViewModel().onDidFocusStackFrame(sf => {
                if (!this.isBodyVisible()) {
                    this.b = true;
                    return;
                }
                // Refresh the tree immediately if the user explictly changed stack frames.
                // Otherwise postpone the refresh until user stops stepping.
                const timeout = sf.explicit ? 0 : undefined;
                this.a.schedule(timeout);
            }));
            this.B(this.h.getViewModel().onWillUpdateViews(() => {
                const stackFrame = this.h.getViewModel().focusedStackFrame;
                if (stackFrame && forgetScopes) {
                    stackFrame.forgetScopes();
                }
                forgetScopes = true;
                this.c.updateChildren();
            }));
            this.B(this.c);
            this.B(this.c.onMouseDblClick(e => this.r(e)));
            this.B(this.c.onContextMenu(async (e) => await this.t(e)));
            this.B(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.b) {
                    this.a.schedule();
                }
            }));
            let horizontalScrolling;
            this.B(this.h.getViewModel().onDidSelectExpression(e => {
                const variable = e?.expression;
                if (variable instanceof debugModel_1.$JFb && !e?.settingWatch) {
                    horizontalScrolling = this.c.options.horizontalScrolling;
                    if (horizontalScrolling) {
                        this.c.updateOptions({ horizontalScrolling: false });
                    }
                    this.c.rerender(variable);
                }
                else if (!e && horizontalScrolling !== undefined) {
                    this.c.updateOptions({ horizontalScrolling: horizontalScrolling });
                    horizontalScrolling = undefined;
                }
            }));
            this.B(this.h.getViewModel().onDidEvaluateLazyExpression(async (e) => {
                if (e instanceof debugModel_1.$JFb && this.c.hasNode(e)) {
                    await this.c.updateChildren(e, false, true);
                    await this.c.expand(e);
                }
            }));
            this.B(this.h.onDidEndSession(() => {
                this.f.clear();
                this.g.clear();
            }));
        }
        W(width, height) {
            super.W(height, width);
            this.c.layout(width, height);
        }
        focus() {
            this.c.domFocus();
        }
        collapseAll() {
            this.c.collapseAll();
        }
        r(e) {
            const session = this.h.getViewModel().focusedSession;
            if (session && e.element instanceof debugModel_1.$JFb && session.capabilities.supportsSetVariable && !e.element.presentationHint?.attributes?.includes('readOnly') && !e.element.presentationHint?.lazy) {
                this.h.getViewModel().setSelectedExpression(e.element, false);
            }
        }
        async t(e) {
            const variable = e.element;
            if (!(variable instanceof debugModel_1.$JFb) || !variable.value) {
                return;
            }
            const toDispose = new lifecycle_1.$jc();
            try {
                const contextKeyService = await getContextForVariableMenuWithDataAccess(this.zb, variable);
                const menu = toDispose.add(this.j.createMenu(actions_1.$Ru.DebugVariablesContext, contextKeyService));
                const context = getVariablesContext(variable);
                const secondary = [];
                (0, menuEntryActionViewItem_1.$A3)(menu, { arg: context, shouldForwardArgs: false }, { primary: [], secondary }, 'inline');
                this.xb.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => secondary
                });
            }
            finally {
                toDispose.dispose();
            }
        }
    };
    exports.$oRb = $oRb;
    exports.$oRb = $oRb = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, debug_1.$nH),
        __param(3, keybinding_1.$2D),
        __param(4, configuration_1.$8h),
        __param(5, instantiation_1.$Ah),
        __param(6, views_1.$_E),
        __param(7, contextkey_1.$3i),
        __param(8, opener_1.$NT),
        __param(9, themeService_1.$gv),
        __param(10, telemetry_1.$9k),
        __param(11, actions_1.$Su)
    ], $oRb);
    const getVariablesContext = (variable) => ({
        sessionId: variable.getSession()?.getId(),
        container: variable.parent instanceof debugModel_1.$IFb
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
            contextKeys.push([debug_1.$5G.key, !!dataBreakpointId]);
        }
        else {
            for (const accessType of dataBreakpointAccessTypes) {
                switch (accessType) {
                    case 'read':
                        contextKeys.push([debug_1.$7G.key, !!dataBreakpointId]);
                        break;
                    case 'write':
                        contextKeys.push([debug_1.$5G.key, !!dataBreakpointId]);
                        break;
                    case 'readWrite':
                        contextKeys.push([debug_1.$6G.key, !!dataBreakpointId]);
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
            [debug_1.$2G.key, variable.variableMenuContext || ''],
            [debug_1.$0G.key, !!variable.evaluateName],
            [debug_1.$NG.key, !!session?.capabilities.supportsReadMemoryRequest && variable.memoryReference !== undefined],
            [debug_1.$$G.key, !!variable.presentationHint?.attributes?.includes('readOnly') || variable.presentationHint?.lazy],
            ...additionalContext,
        ];
        variableInternalContext = variable;
        return parentContext.createOverlay(contextKeys);
    }
    function isStackFrame(obj) {
        return obj instanceof debugModel_1.$MFb;
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
            if (element instanceof debugModel_1.$LFb) {
                return ScopeErrorRenderer.ID;
            }
            if (element instanceof debugModel_1.$KFb) {
                return ScopesRenderer.ID;
            }
            return $pRb.ID;
        }
    }
    class ScopesRenderer {
        static { this.ID = 'scope'; }
        get templateId() {
            return ScopesRenderer.ID;
        }
        renderTemplate(container) {
            const name = dom.$0O(container, $('.scope'));
            const label = new highlightedLabel_1.$JR(name);
            return { name, label };
        }
        renderElement(element, index, templateData) {
            templateData.label.set(element.element.name, (0, filters_1.$Hj)(element.filterData));
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
            const wrapper = dom.$0O(container, $('.scope'));
            const error = dom.$0O(wrapper, $('.error'));
            return { error };
        }
        renderElement(element, index, templateData) {
            templateData.error.innerText = element.element.name;
        }
        disposeTemplate() {
            // noop
        }
    }
    let $pRb = class $pRb extends baseDebugView_1.$aQb {
        static { $pRb_1 = this; }
        static { this.ID = 'variable'; }
        constructor(h, i, j, debugService, contextViewService) {
            super(debugService, contextViewService);
            this.h = h;
            this.i = i;
            this.j = j;
        }
        get templateId() {
            return $pRb_1.ID;
        }
        d(expression, data, highlights) {
            (0, baseDebugView_1.$_Pb)(expression, data, true, highlights, this.h);
        }
        renderElement(node, index, data) {
            super.c(node.element, node, data);
        }
        f(expression) {
            const variable = expression;
            return {
                initialValue: expression.value,
                ariaLabel: (0, nls_1.localize)(0, null),
                validationOptions: {
                    validation: () => variable.errorMessage ? ({ content: variable.errorMessage }) : null
                },
                onFinish: (value, success) => {
                    variable.errorMessage = undefined;
                    const focusedStackFrame = this.a.getViewModel().focusedStackFrame;
                    if (success && variable.value !== value && focusedStackFrame) {
                        variable.setVariable(value, focusedStackFrame)
                            // Need to force watch expressions and variables to update since a variable change can have an effect on both
                            .then(() => {
                            // Do not refresh scopes due to a node limitation #15520
                            forgetScopes = false;
                            this.a.getViewModel().updateViews();
                        });
                    }
                }
            };
        }
        g(actionBar, expression) {
            const variable = expression;
            const contextKeyService = getContextForVariableMenu(this.j, variable);
            const menu = this.i.createMenu(actions_1.$Ru.DebugVariablesContext, contextKeyService);
            const primary = [];
            const context = getVariablesContext(variable);
            (0, menuEntryActionViewItem_1.$A3)(menu, { arg: context, shouldForwardArgs: false }, { primary, secondary: [] }, 'inline');
            actionBar.clear();
            actionBar.context = context;
            actionBar.push(primary, { icon: true, label: false });
        }
    };
    exports.$pRb = $pRb;
    exports.$pRb = $pRb = $pRb_1 = __decorate([
        __param(1, actions_1.$Su),
        __param(2, contextkey_1.$3i),
        __param(3, debug_1.$nH),
        __param(4, contextView_1.$VZ)
    ], $pRb);
    class VariablesAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(1, null);
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.$KFb) {
                return (0, nls_1.localize)(2, null, element.name);
            }
            if (element instanceof debugModel_1.$JFb) {
                return (0, nls_1.localize)(3, null, element.name, element.value);
            }
            return null;
        }
    }
    exports.$qRb = 'debug.setVariable';
    commands_1.$Gr.registerCommand({
        id: exports.$qRb,
        handler: (accessor) => {
            const debugService = accessor.get(debug_1.$nH);
            debugService.getViewModel().setSelectedExpression(variableInternalContext, false);
        }
    });
    exports.$rRb = 'workbench.debug.viewlet.action.copyValue';
    commands_1.$Gr.registerCommand({
        id: exports.$rRb,
        handler: async (accessor, arg, ctx) => {
            const debugService = accessor.get(debug_1.$nH);
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            let elementContext = '';
            let elements;
            if (arg instanceof debugModel_1.$JFb || arg instanceof debugModel_1.$IFb) {
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
            const toEvaluate = elements.map(element => element instanceof debugModel_1.$JFb ? (element.evaluateName || element.value) : element.name);
            try {
                const evaluations = await Promise.all(toEvaluate.map(expr => session.evaluate(expr, stackFrame.frameId, evalContext)));
                const result = (0, arrays_1.$Fb)(evaluations).map(evaluation => evaluation.body.result);
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
    exports.$sRb = 'workbench.debug.viewlet.action.viewMemory';
    const HEX_EDITOR_EXTENSION_ID = 'ms-vscode.hexeditor';
    const HEX_EDITOR_EDITOR_ID = 'hexEditor.hexedit';
    commands_1.$Gr.registerCommand({
        id: exports.$sRb,
        handler: async (accessor, arg, ctx) => {
            const debugService = accessor.get(debug_1.$nH);
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
            const commandService = accessor.get(commands_1.$Fr);
            const editorService = accessor.get(editorService_1.$9C);
            const notifications = accessor.get(notification_1.$Yu);
            const progressService = accessor.get(progress_1.$2u);
            const extensionService = accessor.get(extensions_1.$MF);
            const telemetryService = accessor.get(telemetry_1.$9k);
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
                    resource: (0, debugModel_1.$OFb)(sessionId, memoryReference),
                    options: {
                        revealIfOpened: true,
                        override: HEX_EDITOR_EDITOR_ID,
                    },
                }, editorService_1.$$C);
            }
        }
    });
    function tryInstallHexEditor(notifications, progressService, extensionService, commandService) {
        return new Promise(resolve => {
            let installing = false;
            const handle = notifications.prompt(notification_1.Severity.Info, (0, nls_1.localize)(4, null), [
                {
                    label: (0, nls_1.localize)(5, null),
                    run: () => resolve(false),
                },
                {
                    label: (0, nls_1.localize)(6, null),
                    run: async () => {
                        installing = true;
                        try {
                            await progressService.withProgress({
                                location: 15 /* ProgressLocation.Notification */,
                                title: (0, nls_1.localize)(7, null),
                            }, async () => {
                                await commandService.executeCommand('workbench.extensions.installExtension', HEX_EDITOR_EXTENSION_ID);
                                // it seems like the extension is not registered immediately on install --
                                // wait for it to appear before returning.
                                while (!(await extensionService.getExtension(HEX_EDITOR_EXTENSION_ID))) {
                                    await (0, async_1.$Hg)(30);
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
    exports.$tRb = 'debug.breakWhenValueChanges';
    commands_1.$Gr.registerCommand({
        id: exports.$tRb,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.$nH);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'write');
            }
        }
    });
    exports.$uRb = 'debug.breakWhenValueIsAccessed';
    commands_1.$Gr.registerCommand({
        id: exports.$uRb,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.$nH);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'readWrite');
            }
        }
    });
    exports.$vRb = 'debug.breakWhenValueIsRead';
    commands_1.$Gr.registerCommand({
        id: exports.$vRb,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.$nH);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'read');
            }
        }
    });
    exports.$wRb = 'debug.copyEvaluatePath';
    commands_1.$Gr.registerCommand({
        id: exports.$wRb,
        handler: async (accessor, context) => {
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            await clipboardService.writeText(context.variable.evaluateName);
        }
    });
    exports.$xRb = 'debug.addToWatchExpressions';
    commands_1.$Gr.registerCommand({
        id: exports.$xRb,
        handler: async (accessor, context) => {
            const debugService = accessor.get(debug_1.$nH);
            debugService.addWatchExpression(context.variable.evaluateName);
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'variables.collapse',
                viewId: debug_1.$kG,
                title: (0, nls_1.localize)(8, null),
                f1: false,
                icon: codicons_1.$Pj.collapseAll,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', debug_1.$kG)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
});
//# sourceMappingURL=variablesView.js.map