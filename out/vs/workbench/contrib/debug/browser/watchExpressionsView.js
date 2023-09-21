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
define(["require", "exports", "vs/base/common/async", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/views/viewPane", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listView", "vs/workbench/contrib/debug/browser/variablesView", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/actions/common/actions", "vs/nls", "vs/base/common/codicons", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/contrib/debug/browser/linkDetector"], function (require, exports, async_1, debug_1, debugModel_1, contextView_1, instantiation_1, keybinding_1, baseDebugView_1, configuration_1, viewPane_1, listService_1, listView_1, variablesView_1, contextkey_1, views_1, opener_1, themeService_1, telemetry_1, debugIcons_1, actions_1, nls_1, codicons_1, menuEntryActionViewItem_1, linkDetector_1) {
    "use strict";
    var WatchExpressionsRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.REMOVE_WATCH_EXPRESSIONS_LABEL = exports.REMOVE_WATCH_EXPRESSIONS_COMMAND_ID = exports.ADD_WATCH_LABEL = exports.ADD_WATCH_ID = exports.WatchExpressionsView = void 0;
    const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
    let ignoreViewUpdates = false;
    let useCachedEvaluation = false;
    let WatchExpressionsView = class WatchExpressionsView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, telemetryService, menuService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.debugService = debugService;
            this.needsRefresh = false;
            this.menu = menuService.createMenu(actions_1.MenuId.DebugWatchContext, contextKeyService);
            this._register(this.menu);
            this.watchExpressionsUpdatedScheduler = new async_1.RunOnceScheduler(() => {
                this.needsRefresh = false;
                this.tree.updateChildren();
            }, 50);
            this.watchExpressionsExist = debug_1.CONTEXT_WATCH_EXPRESSIONS_EXIST.bindTo(contextKeyService);
            this.variableReadonly = debug_1.CONTEXT_VARIABLE_IS_READONLY.bindTo(contextKeyService);
            this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
            this.watchItemType = debug_1.CONTEXT_WATCH_ITEM_TYPE.bindTo(contextKeyService);
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-watch');
            const treeContainer = (0, baseDebugView_1.renderViewTree)(container);
            const expressionsRenderer = this.instantiationService.createInstance(WatchExpressionsRenderer);
            const linkeDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'WatchExpressions', treeContainer, new WatchExpressionsDelegate(), [expressionsRenderer, this.instantiationService.createInstance(variablesView_1.VariablesRenderer, linkeDetector)], new WatchExpressionsDataSource(), {
                accessibilityProvider: new WatchExpressionsAccessibilityProvider(),
                identityProvider: { getId: (element) => element.getId() },
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (e) => {
                        if (e === this.debugService.getViewModel().getSelectedExpression()?.expression) {
                            // Don't filter input box
                            return undefined;
                        }
                        return e.name;
                    }
                },
                dnd: new WatchExpressionsDragAndDrop(this.debugService),
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            this.tree.setInput(this.debugService);
            debug_1.CONTEXT_WATCH_EXPRESSIONS_FOCUSED.bindTo(this.tree.contextKeyService);
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            this._register(this.tree.onMouseDblClick(e => this.onMouseDblClick(e)));
            this._register(this.debugService.getModel().onDidChangeWatchExpressions(async (we) => {
                this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                }
                else {
                    if (we && !we.name) {
                        // We are adding a new input box, no need to re-evaluate watch expressions
                        useCachedEvaluation = true;
                    }
                    await this.tree.updateChildren();
                    useCachedEvaluation = false;
                    if (we instanceof debugModel_1.Expression) {
                        this.tree.reveal(we);
                    }
                }
            }));
            this._register(this.debugService.getViewModel().onDidFocusStackFrame(() => {
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                    return;
                }
                if (!this.watchExpressionsUpdatedScheduler.isScheduled()) {
                    this.watchExpressionsUpdatedScheduler.schedule();
                }
            }));
            this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
                if (!ignoreViewUpdates) {
                    this.tree.updateChildren();
                }
            }));
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.needsRefresh) {
                    this.watchExpressionsUpdatedScheduler.schedule();
                }
            }));
            let horizontalScrolling;
            this._register(this.debugService.getViewModel().onDidSelectExpression(e => {
                const expression = e?.expression;
                if (expression instanceof debugModel_1.Expression || (expression instanceof debugModel_1.Variable && e?.settingWatch)) {
                    horizontalScrolling = this.tree.options.horizontalScrolling;
                    if (horizontalScrolling) {
                        this.tree.updateOptions({ horizontalScrolling: false });
                    }
                    if (expression.name) {
                        // Only rerender if the input is already done since otherwise the tree is not yet aware of the new element
                        this.tree.rerender(expression);
                    }
                }
                else if (!expression && horizontalScrolling !== undefined) {
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
        onMouseDblClick(e) {
            if (e.browserEvent.target.className.indexOf('twistie') >= 0) {
                // Ignore double click events on twistie
                return;
            }
            const element = e.element;
            // double click on primitive value: open input box to be able to select and copy value.
            const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
            if (element instanceof debugModel_1.Expression && element !== selectedExpression?.expression) {
                this.debugService.getViewModel().setSelectedExpression(element, false);
            }
            else if (!element) {
                // Double click in watch panel triggers to add a new watch expression
                this.debugService.addWatchExpression();
            }
        }
        onContextMenu(e) {
            const element = e.element;
            const selection = this.tree.getSelection();
            this.watchItemType.set(element instanceof debugModel_1.Expression ? 'expression' : element instanceof debugModel_1.Variable ? 'variable' : undefined);
            const actions = [];
            const attributes = element instanceof debugModel_1.Variable ? element.presentationHint?.attributes : undefined;
            this.variableReadonly.set(!!attributes && attributes.indexOf('readOnly') >= 0 || !!element?.presentationHint?.lazy);
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(this.menu, { arg: element, shouldForwardArgs: true }, actions);
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => element && selection.includes(element) ? selection : element ? [element] : [],
            });
        }
    };
    exports.WatchExpressionsView = WatchExpressionsView;
    exports.WatchExpressionsView = WatchExpressionsView = __decorate([
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
        __param(11, actions_1.IMenuService)
    ], WatchExpressionsView);
    class WatchExpressionsDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.Expression) {
                return WatchExpressionsRenderer.ID;
            }
            // Variable
            return variablesView_1.VariablesRenderer.ID;
        }
    }
    function isDebugService(element) {
        return typeof element.getConfigurationManager === 'function';
    }
    class WatchExpressionsDataSource {
        hasChildren(element) {
            return isDebugService(element) || element.hasChildren;
        }
        getChildren(element) {
            if (isDebugService(element)) {
                const debugService = element;
                const watchExpressions = debugService.getModel().getWatchExpressions();
                const viewModel = debugService.getViewModel();
                return Promise.all(watchExpressions.map(we => !!we.name && !useCachedEvaluation
                    ? we.evaluate(viewModel.focusedSession, viewModel.focusedStackFrame, 'watch').then(() => we)
                    : Promise.resolve(we)));
            }
            return element.getChildren();
        }
    }
    let WatchExpressionsRenderer = class WatchExpressionsRenderer extends baseDebugView_1.AbstractExpressionsRenderer {
        static { WatchExpressionsRenderer_1 = this; }
        static { this.ID = 'watchexpression'; }
        constructor(menuService, contextKeyService, debugService, contextViewService) {
            super(debugService, contextViewService);
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
        }
        get templateId() {
            return WatchExpressionsRenderer_1.ID;
        }
        renderElement(node, index, data) {
            super.renderExpressionElement(node.element, node, data);
        }
        renderExpression(expression, data, highlights) {
            const text = typeof expression.value === 'string' ? `${expression.name}:` : expression.name;
            let title;
            if (expression.type) {
                title = expression.type === expression.value ?
                    expression.type :
                    `${expression.type}: ${expression.value}`;
            }
            else {
                title = expression.value;
            }
            data.label.set(text, highlights, title);
            (0, baseDebugView_1.renderExpressionValue)(expression, data.value, {
                showChanged: true,
                maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
                showHover: true,
                colorize: true
            });
        }
        getInputBoxOptions(expression, settingValue) {
            if (settingValue) {
                return {
                    initialValue: expression.value,
                    ariaLabel: (0, nls_1.localize)('typeNewValue', "Type new value"),
                    onFinish: async (value, success) => {
                        if (success && value) {
                            const focusedFrame = this.debugService.getViewModel().focusedStackFrame;
                            if (focusedFrame && (expression instanceof debugModel_1.Variable || expression instanceof debugModel_1.Expression)) {
                                await expression.setExpression(value, focusedFrame);
                                this.debugService.getViewModel().updateViews();
                            }
                        }
                    }
                };
            }
            return {
                initialValue: expression.name ? expression.name : '',
                ariaLabel: (0, nls_1.localize)('watchExpressionInputAriaLabel', "Type watch expression"),
                placeholder: (0, nls_1.localize)('watchExpressionPlaceholder', "Expression to watch"),
                onFinish: (value, success) => {
                    if (success && value) {
                        this.debugService.renameWatchExpression(expression.getId(), value);
                        ignoreViewUpdates = true;
                        this.debugService.getViewModel().updateViews();
                        ignoreViewUpdates = false;
                    }
                    else if (!expression.name) {
                        this.debugService.removeWatchExpressions(expression.getId());
                    }
                }
            };
        }
        renderActionBar(actionBar, expression) {
            const contextKeyService = getContextForWatchExpressionMenu(this.contextKeyService, expression);
            const menu = this.menuService.createMenu(actions_1.MenuId.DebugWatchContext, contextKeyService);
            const primary = [];
            const context = expression;
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { arg: context, shouldForwardArgs: false }, { primary, secondary: [] }, 'inline');
            actionBar.clear();
            actionBar.context = context;
            actionBar.push(primary, { icon: true, label: false });
        }
    };
    WatchExpressionsRenderer = WatchExpressionsRenderer_1 = __decorate([
        __param(0, actions_1.IMenuService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, debug_1.IDebugService),
        __param(3, contextView_1.IContextViewService)
    ], WatchExpressionsRenderer);
    /**
     * Gets a context key overlay that has context for the given expression.
     */
    function getContextForWatchExpressionMenu(parentContext, expression) {
        return parentContext.createOverlay([
            [debug_1.CONTEXT_CAN_VIEW_MEMORY.key, expression.memoryReference !== undefined],
            [debug_1.CONTEXT_WATCH_ITEM_TYPE.key, 'expression']
        ]);
    }
    class WatchExpressionsAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)({ comment: ['Debug is a noun in this context, not a verb.'], key: 'watchAriaTreeLabel' }, "Debug Watch Expressions");
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.Expression) {
                return (0, nls_1.localize)('watchExpressionAriaLabel', "{0}, value {1}", element.name, element.value);
            }
            // Variable
            return (0, nls_1.localize)('watchVariableAriaLabel', "{0}, value {1}", element.name, element.value);
        }
    }
    class WatchExpressionsDragAndDrop {
        constructor(debugService) {
            this.debugService = debugService;
        }
        onDragOver(data) {
            if (!(data instanceof listView_1.ElementsDragAndDropData)) {
                return false;
            }
            const expressions = data.elements;
            return expressions.length > 0 && expressions[0] instanceof debugModel_1.Expression;
        }
        getDragURI(element) {
            if (!(element instanceof debugModel_1.Expression) || element === this.debugService.getViewModel().getSelectedExpression()?.expression) {
                return null;
            }
            return element.getId();
        }
        getDragLabel(elements) {
            if (elements.length === 1) {
                return elements[0].name;
            }
            return undefined;
        }
        drop(data, targetElement) {
            if (!(data instanceof listView_1.ElementsDragAndDropData)) {
                return;
            }
            const draggedElement = data.elements[0];
            const watches = this.debugService.getModel().getWatchExpressions();
            const position = targetElement instanceof debugModel_1.Expression ? watches.indexOf(targetElement) : watches.length - 1;
            this.debugService.moveWatchExpression(draggedElement.getId(), position);
        }
    }
    (0, actions_1.registerAction2)(class Collapse extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'watch.collapse',
                viewId: debug_1.WATCH_VIEW_ID,
                title: (0, nls_1.localize)('collapse', "Collapse All"),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                precondition: debug_1.CONTEXT_WATCH_EXPRESSIONS_EXIST,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 30,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.WATCH_VIEW_ID)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    exports.ADD_WATCH_ID = 'workbench.debug.viewlet.action.addWatchExpression'; // Use old and long id for backwards compatibility
    exports.ADD_WATCH_LABEL = (0, nls_1.localize)('addWatchExpression', "Add Expression");
    (0, actions_1.registerAction2)(class AddWatchExpressionAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.ADD_WATCH_ID,
                title: exports.ADD_WATCH_LABEL,
                f1: false,
                icon: debugIcons_1.watchExpressionsAdd,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.WATCH_VIEW_ID)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.addWatchExpression();
        }
    });
    exports.REMOVE_WATCH_EXPRESSIONS_COMMAND_ID = 'workbench.debug.viewlet.action.removeAllWatchExpressions';
    exports.REMOVE_WATCH_EXPRESSIONS_LABEL = (0, nls_1.localize)('removeAllWatchExpressions', "Remove All Expressions");
    (0, actions_1.registerAction2)(class RemoveAllWatchExpressionsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.REMOVE_WATCH_EXPRESSIONS_COMMAND_ID,
                title: exports.REMOVE_WATCH_EXPRESSIONS_LABEL,
                f1: false,
                icon: debugIcons_1.watchExpressionsRemoveAll,
                precondition: debug_1.CONTEXT_WATCH_EXPRESSIONS_EXIST,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 20,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', debug_1.WATCH_VIEW_ID)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.removeWatchExpressions();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hFeHByZXNzaW9uc1ZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL3dhdGNoRXhwcmVzc2lvbnNWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQ2hHLE1BQU0sa0NBQWtDLEdBQUcsSUFBSSxDQUFDO0lBQ2hELElBQUksaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0lBQzlCLElBQUksbUJBQW1CLEdBQUcsS0FBSyxDQUFDO0lBRXpCLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsbUJBQVE7UUFVakQsWUFDQyxPQUE0QixFQUNQLGtCQUF1QyxFQUM3QyxZQUE0QyxFQUN2QyxpQkFBcUMsRUFDbEMsb0JBQTJDLEVBQzFDLHFCQUE2QyxFQUM5QyxvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQ3pDLGFBQTZCLEVBQzlCLFlBQTJCLEVBQ3ZCLGdCQUFtQyxFQUN4QyxXQUF5QjtZQUV2QyxLQUFLLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQVgzSixpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQVZwRCxpQkFBWSxHQUFHLEtBQUssQ0FBQztZQXVCNUIsSUFBSSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLGdCQUFNLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUU7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