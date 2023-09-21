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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/platform", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/services/languageFeatures", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/contrib/debug/browser/variablesView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, dom, scrollableElement_1, arrays_1, cancellation_1, lifecycle, numbers_1, platform_1, range_1, textModel_1, languageFeatures_1, nls, instantiation_1, listService_1, log_1, colorRegistry_1, baseDebugView_1, linkDetector_1, variablesView_1, debug_1, debugModel_1, debugUtils_1) {
    "use strict";
    var DebugHoverWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugHoverWidget = exports.findExpressionInStackFrame = exports.ShowDebugHoverResult = void 0;
    const $ = dom.$;
    var ShowDebugHoverResult;
    (function (ShowDebugHoverResult) {
        ShowDebugHoverResult[ShowDebugHoverResult["NOT_CHANGED"] = 0] = "NOT_CHANGED";
        ShowDebugHoverResult[ShowDebugHoverResult["NOT_AVAILABLE"] = 1] = "NOT_AVAILABLE";
        ShowDebugHoverResult[ShowDebugHoverResult["CANCELLED"] = 2] = "CANCELLED";
    })(ShowDebugHoverResult || (exports.ShowDebugHoverResult = ShowDebugHoverResult = {}));
    async function doFindExpression(container, namesToFind) {
        if (!container) {
            return null;
        }
        const children = await container.getChildren();
        // look for our variable in the list. First find the parents of the hovered variable if there are any.
        const filtered = children.filter(v => namesToFind[0] === v.name);
        if (filtered.length !== 1) {
            return null;
        }
        if (namesToFind.length === 1) {
            return filtered[0];
        }
        else {
            return doFindExpression(filtered[0], namesToFind.slice(1));
        }
    }
    async function findExpressionInStackFrame(stackFrame, namesToFind) {
        const scopes = await stackFrame.getScopes();
        const nonExpensive = scopes.filter(s => !s.expensive);
        const expressions = (0, arrays_1.coalesce)(await Promise.all(nonExpensive.map(scope => doFindExpression(scope, namesToFind))));
        // only show if all expressions found have the same value
        return expressions.length > 0 && expressions.every(e => e.value === expressions[0].value) ? expressions[0] : undefined;
    }
    exports.findExpressionInStackFrame = findExpressionInStackFrame;
    let DebugHoverWidget = class DebugHoverWidget {
        static { DebugHoverWidget_1 = this; }
        static { this.ID = 'debug.hoverWidget'; }
        constructor(editor, debugService, instantiationService) {
            this.editor = editor;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
            // editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.highlightDecorations = this.editor.createDecorationsCollection();
            this.isUpdatingTree = false;
            this.toDispose = [];
            this._isVisible = false;
            this.showAtPosition = null;
            this.positionPreference = [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */];
            this.debugHoverComputer = this.instantiationService.createInstance(DebugHoverComputer, this.editor);
        }
        create() {
            this.domNode = $('.debug-hover-widget');
            this.complexValueContainer = dom.append(this.domNode, $('.complex-value'));
            this.complexValueTitle = dom.append(this.complexValueContainer, $('.title'));
            this.treeContainer = dom.append(this.complexValueContainer, $('.debug-hover-tree'));
            this.treeContainer.setAttribute('role', 'tree');
            const tip = dom.append(this.complexValueContainer, $('.tip'));
            tip.textContent = nls.localize({ key: 'quickTip', comment: ['"switch to editor language hover" means to show the programming language hover widget instead of the debug hover'] }, 'Hold {0} key to switch to editor language hover', platform_1.isMacintosh ? 'Option' : 'Alt');
            const dataSource = new DebugHoverDataSource();
            const linkeDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'DebugHover', this.treeContainer, new DebugHoverDelegate(), [this.instantiationService.createInstance(variablesView_1.VariablesRenderer, linkeDetector)], dataSource, {
                accessibilityProvider: new DebugHoverAccessibilityProvider(),
                mouseSupport: false,
                horizontalScrolling: true,
                useShadows: false,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.name },
                overrideStyles: {
                    listBackground: colorRegistry_1.editorHoverBackground
                }
            });
            this.valueContainer = $('.value');
            this.valueContainer.tabIndex = 0;
            this.valueContainer.setAttribute('role', 'tooltip');
            this.scrollbar = new scrollableElement_1.DomScrollableElement(this.valueContainer, { horizontal: 2 /* ScrollbarVisibility.Hidden */ });
            this.domNode.appendChild(this.scrollbar.getDomNode());
            this.toDispose.push(this.scrollbar);
            this.editor.applyFontInfo(this.domNode);
            this.domNode.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorHoverBackground);
            this.domNode.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorHoverBorder)}`;
            this.domNode.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorHoverForeground);
            this.toDispose.push(this.tree.onDidChangeContentHeight(() => {
                if (!this.isUpdatingTree) {
                    // Don't do a layout in the middle of the async setInput
                    this.layoutTreeAndContainer();
                }
            }));
            this.toDispose.push(this.tree.onDidChangeContentWidth(() => {
                if (!this.isUpdatingTree) {
                    // Don't do a layout in the middle of the async setInput
                    this.layoutTreeAndContainer();
                }
            }));
            this.registerListeners();
            this.editor.addContentWidget(this);
        }
        registerListeners() {
            this.toDispose.push(dom.addStandardDisposableListener(this.domNode, 'keydown', (e) => {
                if (e.equals(9 /* KeyCode.Escape */)) {
                    this.hide();
                }
            }));
            this.toDispose.push(this.editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.editor.applyFontInfo(this.domNode);
                }
            }));
            this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
                if (e instanceof debugModel_1.Variable && this.tree.hasNode(e)) {
                    await this.tree.updateChildren(e, false, true);
                    await this.tree.expand(e);
                }
            }));
        }
        isHovered() {
            return !!this.domNode?.matches(':hover');
        }
        isVisible() {
            return this._isVisible;
        }
        willBeVisible() {
            return !!this.showCancellationSource;
        }
        getId() {
            return DebugHoverWidget_1.ID;
        }
        getDomNode() {
            return this.domNode;
        }
        async showAt(position, focus) {
            this.showCancellationSource?.cancel();
            const cancellationSource = this.showCancellationSource = new cancellation_1.CancellationTokenSource();
            const session = this.debugService.getViewModel().focusedSession;
            if (!session || !this.editor.hasModel()) {
                this.hide();
                return 1 /* ShowDebugHoverResult.NOT_AVAILABLE */;
            }
            const result = await this.debugHoverComputer.compute(position, cancellationSource.token);
            if (cancellationSource.token.isCancellationRequested) {
                this.hide();
                return 2 /* ShowDebugHoverResult.CANCELLED */;
            }
            if (!result.range) {
                this.hide();
                return 1 /* ShowDebugHoverResult.NOT_AVAILABLE */;
            }
            if (this.isVisible() && !result.rangeChanged) {
                return 0 /* ShowDebugHoverResult.NOT_CHANGED */;
            }
            const expression = await this.debugHoverComputer.evaluate(session);
            if (cancellationSource.token.isCancellationRequested) {
                this.hide();
                return 2 /* ShowDebugHoverResult.CANCELLED */;
            }
            if (!expression || (expression instanceof debugModel_1.Expression && !expression.available)) {
                this.hide();
                return 1 /* ShowDebugHoverResult.NOT_AVAILABLE */;
            }
            this.highlightDecorations.set([{
                    range: result.range,
                    options: DebugHoverWidget_1._HOVER_HIGHLIGHT_DECORATION_OPTIONS
                }]);
            return this.doShow(result.range.getStartPosition(), expression, focus);
        }
        static { this._HOVER_HIGHLIGHT_DECORATION_OPTIONS = textModel_1.ModelDecorationOptions.register({
            description: 'bdebug-hover-highlight',
            className: 'hoverHighlight'
        }); }
        async doShow(position, expression, focus, forceValueHover = false) {
            if (!this.domNode) {
                this.create();
            }
            this.showAtPosition = position;
            this._isVisible = true;
            if (!expression.hasChildren || forceValueHover) {
                this.complexValueContainer.hidden = true;
                this.valueContainer.hidden = false;
                (0, baseDebugView_1.renderExpressionValue)(expression, this.valueContainer, {
                    showChanged: false,
                    colorize: true
                });
                this.valueContainer.title = '';
                this.editor.layoutContentWidget(this);
                this.scrollbar.scanDomNode();
                if (focus) {
                    this.editor.render();
                    this.valueContainer.focus();
                }
                return undefined;
            }
            this.valueContainer.hidden = true;
            this.expressionToRender = expression;
            this.complexValueTitle.textContent = expression.value;
            this.complexValueTitle.title = expression.value;
            this.editor.layoutContentWidget(this);
            this.tree.scrollTop = 0;
            this.tree.scrollLeft = 0;
            this.complexValueContainer.hidden = false;
            if (focus) {
                this.editor.render();
                this.tree.domFocus();
            }
        }
        layoutTreeAndContainer() {
            this.layoutTree();
            this.editor.layoutContentWidget(this);
        }
        layoutTree() {
            const scrollBarHeight = 10;
            const treeHeight = Math.min(Math.max(266, this.editor.getLayoutInfo().height * 0.55), this.tree.contentHeight + scrollBarHeight);
            const realTreeWidth = this.tree.contentWidth;
            const treeWidth = (0, numbers_1.clamp)(realTreeWidth, 400, 550);
            this.tree.layout(treeHeight, treeWidth);
            this.treeContainer.style.height = `${treeHeight}px`;
            this.scrollbar.scanDomNode();
        }
        beforeRender() {
            // beforeRender will be called each time the hover size changes, and the content widget is layed out again.
            if (this.expressionToRender) {
                const expression = this.expressionToRender;
                this.expressionToRender = undefined;
                // Do this in beforeRender once the content widget is no longer display=none so that its elements' sizes will be measured correctly.
                this.isUpdatingTree = true;
                this.tree.setInput(expression).finally(() => {
                    this.isUpdatingTree = false;
                });
            }
            return null;
        }
        afterRender(positionPreference) {
            if (positionPreference) {
                // Remember where the editor placed you to keep position stable #109226
                this.positionPreference = [positionPreference];
            }
        }
        hide() {
            if (this.showCancellationSource) {
                this.showCancellationSource.cancel();
                this.showCancellationSource = undefined;
            }
            if (!this._isVisible) {
                return;
            }
            if (dom.isAncestor(document.activeElement, this.domNode)) {
                this.editor.focus();
            }
            this._isVisible = false;
            this.highlightDecorations.clear();
            this.editor.layoutContentWidget(this);
            this.positionPreference = [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */];
        }
        getPosition() {
            return this._isVisible ? {
                position: this.showAtPosition,
                preference: this.positionPreference
            } : null;
        }
        dispose() {
            this.toDispose = lifecycle.dispose(this.toDispose);
        }
    };
    exports.DebugHoverWidget = DebugHoverWidget;
    exports.DebugHoverWidget = DebugHoverWidget = DebugHoverWidget_1 = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, instantiation_1.IInstantiationService)
    ], DebugHoverWidget);
    class DebugHoverAccessibilityProvider {
        getWidgetAriaLabel() {
            return nls.localize('treeAriaLabel', "Debug Hover");
        }
        getAriaLabel(element) {
            return nls.localize({ key: 'variableAriaLabel', comment: ['Do not translate placeholders. Placeholders are name and value of a variable.'] }, "{0}, value {1}, variables, debug", element.name, element.value);
        }
    }
    class DebugHoverDataSource {
        hasChildren(element) {
            return element.hasChildren;
        }
        getChildren(element) {
            return element.getChildren();
        }
    }
    class DebugHoverDelegate {
        getHeight(element) {
            return 18;
        }
        getTemplateId(element) {
            return variablesView_1.VariablesRenderer.ID;
        }
    }
    let DebugHoverComputer = class DebugHoverComputer {
        constructor(editor, debugService, languageFeaturesService, logService) {
            this.editor = editor;
            this.debugService = debugService;
            this.languageFeaturesService = languageFeaturesService;
            this.logService = logService;
        }
        async compute(position, token) {
            const session = this.debugService.getViewModel().focusedSession;
            if (!session || !this.editor.hasModel()) {
                return { rangeChanged: false };
            }
            const model = this.editor.getModel();
            const result = await (0, debugUtils_1.getEvaluatableExpressionAtPosition)(this.languageFeaturesService, model, position, token);
            if (!result) {
                return { rangeChanged: false };
            }
            const { range, matchingExpression } = result;
            const rangeChanged = this._currentRange ?
                !this._currentRange.equalsRange(range) :
                true;
            this._currentExpression = matchingExpression;
            this._currentRange = range_1.Range.lift(range);
            return { rangeChanged, range: this._currentRange };
        }
        async evaluate(session) {
            if (!this._currentExpression) {
                this.logService.error('No expression to evaluate');
                return;
            }
            if (session.capabilities.supportsEvaluateForHovers) {
                const expression = new debugModel_1.Expression(this._currentExpression);
                await expression.evaluate(session, this.debugService.getViewModel().focusedStackFrame, 'hover');
                return expression;
            }
            else {
                const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                if (focusedStackFrame) {
                    return await findExpressionInStackFrame(focusedStackFrame, (0, arrays_1.coalesce)(this._currentExpression.split('.').map(word => word.trim())));
                }
            }
            return undefined;
        }
    };
    DebugHoverComputer = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, languageFeatures_1.ILanguageFeaturesService),
        __param(3, log_1.ILogService)
    ], DebugHoverComputer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdIb3Zlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvZGVidWdIb3Zlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUNoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLElBQWtCLG9CQUlqQjtJQUpELFdBQWtCLG9CQUFvQjtRQUNyQyw2RUFBVyxDQUFBO1FBQ1gsaUZBQWEsQ0FBQTtRQUNiLHlFQUFTLENBQUE7SUFDVixDQUFDLEVBSmlCLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBSXJDO0lBRUQsS0FBSyxVQUFVLGdCQUFnQixDQUFDLFNBQStCLEVBQUUsV0FBcUI7UUFDckYsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNmLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQyxzR0FBc0c7UUFDdEcsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakUsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM3QixPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuQjthQUFNO1lBQ04sT0FBTyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNEO0lBQ0YsQ0FBQztJQUVNLEtB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