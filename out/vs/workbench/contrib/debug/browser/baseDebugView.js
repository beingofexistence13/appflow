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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/filters", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/replModel"], function (require, exports, dom, actionbar_1, highlightedLabel_1, inputBox_1, codicons_1, themables_1, filters_1, functional_1, lifecycle_1, nls_1, contextView_1, defaultStyles_1, debug_1, debugModel_1, replModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractExpressionsRenderer = exports.renderVariable = exports.renderExpressionValue = exports.renderViewTree = void 0;
    const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
    const booleanRegex = /^(true|false)$/i;
    const stringRegex = /^(['"]).*\1$/;
    const $ = dom.$;
    function renderViewTree(container) {
        const treeContainer = $('.');
        treeContainer.classList.add('debug-view-content');
        container.appendChild(treeContainer);
        return treeContainer;
    }
    exports.renderViewTree = renderViewTree;
    function renderExpressionValue(expressionOrValue, container, options) {
        let value = typeof expressionOrValue === 'string' ? expressionOrValue : expressionOrValue.value;
        // remove stale classes
        container.className = 'value';
        // when resolving expressions we represent errors from the server as a variable with name === null.
        if (value === null || ((expressionOrValue instanceof debugModel_1.Expression || expressionOrValue instanceof debugModel_1.Variable || expressionOrValue instanceof replModel_1.ReplEvaluationResult) && !expressionOrValue.available)) {
            container.classList.add('unavailable');
            if (value !== debugModel_1.Expression.DEFAULT_VALUE) {
                container.classList.add('error');
            }
        }
        else {
            if ((expressionOrValue instanceof debugModel_1.ExpressionContainer) && options.showChanged && expressionOrValue.valueChanged && value !== debugModel_1.Expression.DEFAULT_VALUE) {
                // value changed color has priority over other colors.
                container.className = 'value changed';
                expressionOrValue.valueChanged = false;
            }
            if (options.colorize && typeof expressionOrValue !== 'string') {
                if (expressionOrValue.type === 'number' || expressionOrValue.type === 'boolean' || expressionOrValue.type === 'string') {
                    container.classList.add(expressionOrValue.type);
                }
                else if (!isNaN(+value)) {
                    container.classList.add('number');
                }
                else if (booleanRegex.test(value)) {
                    container.classList.add('boolean');
                }
                else if (stringRegex.test(value)) {
                    container.classList.add('string');
                }
            }
        }
        if (options.maxValueLength && value && value.length > options.maxValueLength) {
            value = value.substring(0, options.maxValueLength) + '...';
        }
        if (!value) {
            value = '';
        }
        if (options.linkDetector) {
            container.textContent = '';
            const session = (expressionOrValue instanceof debugModel_1.ExpressionContainer) ? expressionOrValue.getSession() : undefined;
            container.appendChild(options.linkDetector.linkify(value, false, session ? session.root : undefined, true));
        }
        else {
            container.textContent = value;
        }
        if (options.showHover) {
            container.title = value || '';
        }
    }
    exports.renderExpressionValue = renderExpressionValue;
    function renderVariable(variable, data, showChanged, highlights, linkDetector) {
        if (variable.available) {
            let text = variable.name;
            if (variable.value && typeof variable.name === 'string') {
                text += ':';
            }
            data.label.set(text, highlights, variable.type ? variable.type : variable.name);
            data.name.classList.toggle('virtual', variable.presentationHint?.kind === 'virtual');
            data.name.classList.toggle('internal', variable.presentationHint?.visibility === 'internal');
        }
        else if (variable.value && typeof variable.name === 'string' && variable.name) {
            data.label.set(':');
        }
        data.expression.classList.toggle('lazy', !!variable.presentationHint?.lazy);
        renderExpressionValue(variable, data.value, {
            showChanged,
            maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
            showHover: true,
            colorize: true,
            linkDetector
        });
    }
    exports.renderVariable = renderVariable;
    let AbstractExpressionsRenderer = class AbstractExpressionsRenderer {
        constructor(debugService, contextViewService) {
            this.debugService = debugService;
            this.contextViewService = contextViewService;
        }
        renderTemplate(container) {
            const expression = dom.append(container, $('.expression'));
            const name = dom.append(expression, $('span.name'));
            const lazyButton = dom.append(expression, $('span.lazy-button'));
            lazyButton.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.eye));
            lazyButton.title = (0, nls_1.localize)('debug.lazyButton.tooltip', "Click to expand");
            const value = dom.append(expression, $('span.value'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            const inputBoxContainer = dom.append(expression, $('.inputBoxContainer'));
            const templateDisposable = new lifecycle_1.DisposableStore();
            let actionBar;
            if (this.renderActionBar) {
                dom.append(expression, $('.span.actionbar-spacer'));
                actionBar = templateDisposable.add(new actionbar_1.ActionBar(expression));
            }
            const template = { expression, name, value, label, inputBoxContainer, actionBar, elementDisposable: [], templateDisposable, lazyButton, currentElement: undefined };
            templateDisposable.add(dom.addDisposableListener(lazyButton, dom.EventType.CLICK, () => {
                if (template.currentElement) {
                    this.debugService.getViewModel().evaluateLazyExpression(template.currentElement);
                }
            }));
            return template;
        }
        renderExpressionElement(element, node, data) {
            data.currentElement = element;
            this.renderExpression(node.element, data, (0, filters_1.createMatches)(node.filterData));
            if (data.actionBar) {
                this.renderActionBar(data.actionBar, element, data);
            }
            const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
            if (element === selectedExpression?.expression || (element instanceof debugModel_1.Variable && element.errorMessage)) {
                const options = this.getInputBoxOptions(element, !!selectedExpression?.settingWatch);
                if (options) {
                    data.elementDisposable.push(this.renderInputBox(data.name, data.value, data.inputBoxContainer, options));
                }
            }
        }
        renderInputBox(nameElement, valueElement, inputBoxContainer, options) {
            nameElement.style.display = 'none';
            valueElement.style.display = 'none';
            inputBoxContainer.style.display = 'initial';
            dom.clearNode(inputBoxContainer);
            const inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, { ...options, inputBoxStyles: defaultStyles_1.defaultInputBoxStyles });
            inputBox.value = options.initialValue;
            inputBox.focus();
            inputBox.select();
            const done = (0, functional_1.once)((success, finishEditing) => {
                nameElement.style.display = '';
                valueElement.style.display = '';
                inputBoxContainer.style.display = 'none';
                const value = inputBox.value;
                (0, lifecycle_1.dispose)(toDispose);
                if (finishEditing) {
                    this.debugService.getViewModel().setSelectedExpression(undefined, false);
                    options.onFinish(value, success);
                }
            });
            const toDispose = [
                inputBox,
                dom.addStandardDisposableListener(inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => {
                    const isEscape = e.equals(9 /* KeyCode.Escape */);
                    const isEnter = e.equals(3 /* KeyCode.Enter */);
                    if (isEscape || isEnter) {
                        e.preventDefault();
                        e.stopPropagation();
                        done(isEnter, true);
                    }
                }),
                dom.addDisposableListener(inputBox.inputElement, dom.EventType.BLUR, () => {
                    done(true, true);
                }),
                dom.addDisposableListener(inputBox.inputElement, dom.EventType.CLICK, e => {
                    // Do not expand / collapse selected elements
                    e.preventDefault();
                    e.stopPropagation();
                })
            ];
            return (0, lifecycle_1.toDisposable)(() => {
                done(false, false);
            });
        }
        disposeElement(node, index, templateData) {
            (0, lifecycle_1.dispose)(templateData.elementDisposable);
            templateData.elementDisposable = [];
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.elementDisposable);
            templateData.templateDisposable.dispose();
        }
    };
    exports.AbstractExpressionsRenderer = AbstractExpressionsRenderer;
    exports.AbstractExpressionsRenderer = AbstractExpressionsRenderer = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, contextView_1.IContextViewService)
    ], AbstractExpressionsRenderer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZURlYnVnVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvYmFzZURlYnVnVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLE1BQU0sa0NBQWtDLEdBQUcsSUFBSSxDQUFDO0lBQ2hELE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDO0lBQ3ZDLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQztJQUNuQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBa0JoQixTQUFnQixjQUFjLENBQUMsU0FBc0I7UUFDcEQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDbEQsU0FBUyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyQyxPQUFPLGFBQWEsQ0FBQztJQUN0QixDQUFDO0lBTEQsd0NBS0M7SUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxpQkFBZ0QsRUFBRSxTQUFzQixFQUFFLE9BQTRCO1FBQzNJLElBQUksS0FBSyxHQUFHLE9BQU8saUJBQWlCLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1FBRWhHLHVCQUF1QjtRQUN2QixTQUFTLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUM5QixtR0FBbUc7UUFDbkcsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsWUFBWSx1QkFBVSxJQUFJLGlCQUFpQixZQUFZLHFCQUFRLElBQUksaUJBQWlCLFlBQVksZ0NBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFD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