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
define(["require", "exports", "vs/base/common/async", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/views/viewPane", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listView", "vs/workbench/contrib/debug/browser/variablesView", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/contrib/debug/browser/watchExpressionsView", "vs/base/common/codicons", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/contrib/debug/browser/linkDetector"], function (require, exports, async_1, debug_1, debugModel_1, contextView_1, instantiation_1, keybinding_1, baseDebugView_1, configuration_1, viewPane_1, listService_1, listView_1, variablesView_1, contextkey_1, views_1, opener_1, themeService_1, telemetry_1, debugIcons_1, actions_1, nls_1, codicons_1, menuEntryActionViewItem_1, linkDetector_1) {
    "use strict";
    var WatchExpressionsRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rSb = exports.$qSb = exports.$pSb = exports.$oSb = exports.$nSb = void 0;
    const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
    let ignoreViewUpdates = false;
    let useCachedEvaluation = false;
    let $nSb = class $nSb extends viewPane_1.$Ieb {
        constructor(options, contextMenuService, m, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, telemetryService, menuService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.m = m;
            this.b = false;
            this.j = menuService.createMenu(actions_1.$Ru.DebugWatchContext, contextKeyService);
            this.B(this.j);
            this.a = new async_1.$Sg(() => {
                this.b = false;
                this.c.updateChildren();
            }, 50);
            this.f = debug_1.$EG.bindTo(contextKeyService);
            this.h = debug_1.$$G.bindTo(contextKeyService);
            this.f.set(this.m.getModel().getWatchExpressions().length > 0);
            this.g = debug_1.$MG.bindTo(contextKeyService);
        }
        U(container) {
            super.U(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-watch');
            const treeContainer = (0, baseDebugView_1.$0Pb)(container);
            const expressionsRenderer = this.Bb.createInstance(WatchExpressionsRenderer);
            const linkeDetector = this.Bb.createInstance(linkDetector_1.$2Pb);
            this.c = this.Bb.createInstance(listService_1.$w4, 'WatchExpressions', treeContainer, new WatchExpressionsDelegate(), [expressionsRenderer, this.Bb.createInstance(variablesView_1.$pRb, linkeDetector)], new WatchExpressionsDataSource(), {
                accessibilityProvider: new WatchExpressionsAccessibilityProvider(),
                identityProvider: { getId: (element) => element.getId() },
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (e) => {
                        if (e === this.m.getViewModel().getSelectedExpression()?.expression) {
                            // Don't filter input box
                            return undefined;
                        }
                        return e.name;
                    }
                },
                dnd: new WatchExpressionsDragAndDrop(this.m),
                overrideStyles: {
                    listBackground: this.Rb()
                }
            });
            this.c.setInput(this.m);
            debug_1.$DG.bindTo(this.c.contextKeyService);
            this.B(this.c.onContextMenu(e => this.t(e)));
            this.B(this.c.onMouseDblClick(e => this.s(e)));
            this.B(this.m.getModel().onDidChangeWatchExpressions(async (we) => {
                this.f.set(this.m.getModel().getWatchExpressions().length > 0);
                if (!this.isBodyVisible()) {
                    this.b = true;
                }
                else {
                    if (we && !we.name) {
                        // We are adding a new input box, no need to re-evaluate watch expressions
                        useCachedEvaluation = true;
                    }
                    await this.c.updateChildren();
                    useCachedEvaluation = false;
                    if (we instanceof debugModel_1.$IFb) {
                        this.c.reveal(we);
                    }
                }
            }));
            this.B(this.m.getViewModel().onDidFocusStackFrame(() => {
                if (!this.isBodyVisible()) {
                    this.b = true;
                    return;
                }
                if (!this.a.isScheduled()) {
                    this.a.schedule();
                }
            }));
            this.B(this.m.getViewModel().onWillUpdateViews(() => {
                if (!ignoreViewUpdates) {
                    this.c.updateChildren();
                }
            }));
            this.B(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.b) {
                    this.a.schedule();
                }
            }));
            let horizontalScrolling;
            this.B(this.m.getViewModel().onDidSelectExpression(e => {
                const expression = e?.expression;
                if (expression instanceof debugModel_1.$IFb || (expression instanceof debugModel_1.$JFb && e?.settingWatch)) {
                    horizontalScrolling = this.c.options.horizontalScrolling;
                    if (horizontalScrolling) {
                        this.c.updateOptions({ horizontalScrolling: false });
                    }
                    if (expression.name) {
                        // Only rerender if the input is already done since otherwise the tree is not yet aware of the new element
                        this.c.rerender(expression);
                    }
                }
                else if (!expression && horizontalScrolling !== undefined) {
                    this.c.updateOptions({ horizontalScrolling: horizontalScrolling });
                    horizontalScrolling = undefined;
                }
            }));
            this.B(this.m.getViewModel().onDidEvaluateLazyExpression(async (e) => {
                if (e instanceof debugModel_1.$JFb && this.c.hasNode(e)) {
                    await this.c.updateChildren(e, false, true);
                    await this.c.expand(e);
                }
            }));
        }
        W(height, width) {
            super.W(height, width);
            this.c.layout(height, width);
        }
        focus() {
            this.c.domFocus();
        }
        collapseAll() {
            this.c.collapseAll();
        }
        s(e) {
            if (e.browserEvent.target.className.indexOf('twistie') >= 0) {
                // Ignore double click events on twistie
                return;
            }
            const element = e.element;
            // double click on primitive value: open input box to be able to select and copy value.
            const selectedExpression = this.m.getViewModel().getSelectedExpression();
            if (element instanceof debugModel_1.$IFb && element !== selectedExpression?.expression) {
                this.m.getViewModel().setSelectedExpression(element, false);
            }
            else if (!element) {
                // Double click in watch panel triggers to add a new watch expression
                this.m.addWatchExpression();
            }
        }
        t(e) {
            const element = e.element;
            const selection = this.c.getSelection();
            this.g.set(element instanceof debugModel_1.$IFb ? 'expression' : element instanceof debugModel_1.$JFb ? 'variable' : undefined);
            const actions = [];
            const attributes = element instanceof debugModel_1.$JFb ? element.presentationHint?.attributes : undefined;
            this.h.set(!!attributes && attributes.indexOf('readOnly') >= 0 || !!element?.presentationHint?.lazy);
            (0, menuEntryActionViewItem_1.$A3)(this.j, { arg: element, shouldForwardArgs: true }, actions);
            this.xb.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => element && selection.includes(element) ? selection : element ? [element] : [],
            });
        }
    };
    exports.$nSb = $nSb;
    exports.$nSb = $nSb = __decorate([
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
        __param(11, actions_1.$Su)
    ], $nSb);
    class WatchExpressionsDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.$IFb) {
                return WatchExpressionsRenderer.ID;
            }
            // Variable
            return variablesView_1.$pRb.ID;
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
    let WatchExpressionsRenderer = class WatchExpressionsRenderer extends baseDebugView_1.$aQb {
        static { WatchExpressionsRenderer_1 = this; }
        static { this.ID = 'watchexpression'; }
        constructor(h, i, debugService, contextViewService) {
            super(debugService, contextViewService);
            this.h = h;
            this.i = i;
        }
        get templateId() {
            return WatchExpressionsRenderer_1.ID;
        }
        renderElement(node, index, data) {
            super.c(node.element, node, data);
        }
        d(expression, data, highlights) {
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
            (0, baseDebugView_1.$$Pb)(expression, data.value, {
                showChanged: true,
                maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
                showHover: true,
                colorize: true
            });
        }
        f(expression, settingValue) {
            if (settingValue) {
                return {
                    initialValue: expression.value,
                    ariaLabel: (0, nls_1.localize)(0, null),
                    onFinish: async (value, success) => {
                        if (success && value) {
                            const focusedFrame = this.a.getViewModel().focusedStackFrame;
                            if (focusedFrame && (expression instanceof debugModel_1.$JFb || expression instanceof debugModel_1.$IFb)) {
                                await expression.setExpression(value, focusedFrame);
                                this.a.getViewModel().updateViews();
                            }
                        }
                    }
                };
            }
            return {
                initialValue: expression.name ? expression.name : '',
                ariaLabel: (0, nls_1.localize)(1, null),
                placeholder: (0, nls_1.localize)(2, null),
                onFinish: (value, success) => {
                    if (success && value) {
                        this.a.renameWatchExpression(expression.getId(), value);
                        ignoreViewUpdates = true;
                        this.a.getViewModel().updateViews();
                        ignoreViewUpdates = false;
                    }
                    else if (!expression.name) {
                        this.a.removeWatchExpressions(expression.getId());
                    }
                }
            };
        }
        g(actionBar, expression) {
            const contextKeyService = getContextForWatchExpressionMenu(this.i, expression);
            const menu = this.h.createMenu(actions_1.$Ru.DebugWatchContext, contextKeyService);
            const primary = [];
            const context = expression;
            (0, menuEntryActionViewItem_1.$A3)(menu, { arg: context, shouldForwardArgs: false }, { primary, secondary: [] }, 'inline');
            actionBar.clear();
            actionBar.context = context;
            actionBar.push(primary, { icon: true, label: false });
        }
    };
    WatchExpressionsRenderer = WatchExpressionsRenderer_1 = __decorate([
        __param(0, actions_1.$Su),
        __param(1, contextkey_1.$3i),
        __param(2, debug_1.$nH),
        __param(3, contextView_1.$VZ)
    ], WatchExpressionsRenderer);
    /**
     * Gets a context key overlay that has context for the given expression.
     */
    function getContextForWatchExpressionMenu(parentContext, expression) {
        return parentContext.createOverlay([
            [debug_1.$NG.key, expression.memoryReference !== undefined],
            [debug_1.$MG.key, 'expression']
        ]);
    }
    class WatchExpressionsAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(3, null);
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.$IFb) {
                return (0, nls_1.localize)(4, null, element.name, element.value);
            }
            // Variable
            return (0, nls_1.localize)(5, null, element.name, element.value);
        }
    }
    class WatchExpressionsDragAndDrop {
        constructor(a) {
            this.a = a;
        }
        onDragOver(data) {
            if (!(data instanceof listView_1.$jQ)) {
                return false;
            }
            const expressions = data.elements;
            return expressions.length > 0 && expressions[0] instanceof debugModel_1.$IFb;
        }
        getDragURI(element) {
            if (!(element instanceof debugModel_1.$IFb) || element === this.a.getViewModel().getSelectedExpression()?.expression) {
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
            if (!(data instanceof listView_1.$jQ)) {
                return;
            }
            const draggedElement = data.elements[0];
            const watches = this.a.getModel().getWatchExpressions();
            const position = targetElement instanceof debugModel_1.$IFb ? watches.indexOf(targetElement) : watches.length - 1;
            this.a.moveWatchExpression(draggedElement.getId(), position);
        }
    }
    (0, actions_1.$Xu)(class Collapse extends viewPane_1.$Keb {
        constructor() {
            super({
                id: 'watch.collapse',
                viewId: debug_1.$lG,
                title: (0, nls_1.localize)(6, null),
                f1: false,
                icon: codicons_1.$Pj.collapseAll,
                precondition: debug_1.$EG,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    order: 30,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', debug_1.$lG)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    exports.$oSb = 'workbench.debug.viewlet.action.addWatchExpression'; // Use old and long id for backwards compatibility
    exports.$pSb = (0, nls_1.localize)(7, null);
    (0, actions_1.$Xu)(class AddWatchExpressionAction extends actions_1.$Wu {
        constructor() {
            super({
                id: exports.$oSb,
                title: exports.$pSb,
                f1: false,
                icon: debugIcons_1.$unb,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', debug_1.$lG)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.$nH);
            debugService.addWatchExpression();
        }
    });
    exports.$qSb = 'workbench.debug.viewlet.action.removeAllWatchExpressions';
    exports.$rSb = (0, nls_1.localize)(8, null);
    (0, actions_1.$Xu)(class RemoveAllWatchExpressionsAction extends actions_1.$Wu {
        constructor() {
            super({
                id: exports.$qSb,
                title: exports.$rSb,
                f1: false,
                icon: debugIcons_1.$snb,
                precondition: debug_1.$EG,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    order: 20,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', debug_1.$lG)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.$nH);
            debugService.removeWatchExpressions();
        }
    });
});
//# sourceMappingURL=watchExpressionsView.js.map