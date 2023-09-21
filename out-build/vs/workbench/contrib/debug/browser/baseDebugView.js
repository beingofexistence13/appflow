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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/filters", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/debug/browser/baseDebugView", "vs/platform/contextview/browser/contextView", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/replModel"], function (require, exports, dom, actionbar_1, highlightedLabel_1, inputBox_1, codicons_1, themables_1, filters_1, functional_1, lifecycle_1, nls_1, contextView_1, defaultStyles_1, debug_1, debugModel_1, replModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aQb = exports.$_Pb = exports.$$Pb = exports.$0Pb = void 0;
    const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
    const booleanRegex = /^(true|false)$/i;
    const stringRegex = /^(['"]).*\1$/;
    const $ = dom.$;
    function $0Pb(container) {
        const treeContainer = $('.');
        treeContainer.classList.add('debug-view-content');
        container.appendChild(treeContainer);
        return treeContainer;
    }
    exports.$0Pb = $0Pb;
    function $$Pb(expressionOrValue, container, options) {
        let value = typeof expressionOrValue === 'string' ? expressionOrValue : expressionOrValue.value;
        // remove stale classes
        container.className = 'value';
        // when resolving expressions we represent errors from the server as a variable with name === null.
        if (value === null || ((expressionOrValue instanceof debugModel_1.$IFb || expressionOrValue instanceof debugModel_1.$JFb || expressionOrValue instanceof replModel_1.$7Pb) && !expressionOrValue.available)) {
            container.classList.add('unavailable');
            if (value !== debugModel_1.$IFb.DEFAULT_VALUE) {
                container.classList.add('error');
            }
        }
        else {
            if ((expressionOrValue instanceof debugModel_1.$HFb) && options.showChanged && expressionOrValue.valueChanged && value !== debugModel_1.$IFb.DEFAULT_VALUE) {
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
            const session = (expressionOrValue instanceof debugModel_1.$HFb) ? expressionOrValue.getSession() : undefined;
            container.appendChild(options.linkDetector.linkify(value, false, session ? session.root : undefined, true));
        }
        else {
            container.textContent = value;
        }
        if (options.showHover) {
            container.title = value || '';
        }
    }
    exports.$$Pb = $$Pb;
    function $_Pb(variable, data, showChanged, highlights, linkDetector) {
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
        $$Pb(variable, data.value, {
            showChanged,
            maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
            showHover: true,
            colorize: true,
            linkDetector
        });
    }
    exports.$_Pb = $_Pb;
    let $aQb = class $aQb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        renderTemplate(container) {
            const expression = dom.$0O(container, $('.expression'));
            const name = dom.$0O(expression, $('span.name'));
            const lazyButton = dom.$0O(expression, $('span.lazy-button'));
            lazyButton.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.eye));
            lazyButton.title = (0, nls_1.localize)(0, null);
            const value = dom.$0O(expression, $('span.value'));
            const label = new highlightedLabel_1.$JR(name);
            const inputBoxContainer = dom.$0O(expression, $('.inputBoxContainer'));
            const templateDisposable = new lifecycle_1.$jc();
            let actionBar;
            if (this.g) {
                dom.$0O(expression, $('.span.actionbar-spacer'));
                actionBar = templateDisposable.add(new actionbar_1.$1P(expression));
            }
            const template = { expression, name, value, label, inputBoxContainer, actionBar, elementDisposable: [], templateDisposable, lazyButton, currentElement: undefined };
            templateDisposable.add(dom.$nO(lazyButton, dom.$3O.CLICK, () => {
                if (template.currentElement) {
                    this.a.getViewModel().evaluateLazyExpression(template.currentElement);
                }
            }));
            return template;
        }
        c(element, node, data) {
            data.currentElement = element;
            this.d(node.element, data, (0, filters_1.$Hj)(node.filterData));
            if (data.actionBar) {
                this.g(data.actionBar, element, data);
            }
            const selectedExpression = this.a.getViewModel().getSelectedExpression();
            if (element === selectedExpression?.expression || (element instanceof debugModel_1.$JFb && element.errorMessage)) {
                const options = this.f(element, !!selectedExpression?.settingWatch);
                if (options) {
                    data.elementDisposable.push(this.renderInputBox(data.name, data.value, data.inputBoxContainer, options));
                }
            }
        }
        renderInputBox(nameElement, valueElement, inputBoxContainer, options) {
            nameElement.style.display = 'none';
            valueElement.style.display = 'none';
            inputBoxContainer.style.display = 'initial';
            dom.$lO(inputBoxContainer);
            const inputBox = new inputBox_1.$sR(inputBoxContainer, this.b, { ...options, inputBoxStyles: defaultStyles_1.$s2 });
            inputBox.value = options.initialValue;
            inputBox.focus();
            inputBox.select();
            const done = (0, functional_1.$bb)((success, finishEditing) => {
                nameElement.style.display = '';
                valueElement.style.display = '';
                inputBoxContainer.style.display = 'none';
                const value = inputBox.value;
                (0, lifecycle_1.$fc)(toDispose);
                if (finishEditing) {
                    this.a.getViewModel().setSelectedExpression(undefined, false);
                    options.onFinish(value, success);
                }
            });
            const toDispose = [
                inputBox,
                dom.$oO(inputBox.inputElement, dom.$3O.KEY_DOWN, (e) => {
                    const isEscape = e.equals(9 /* KeyCode.Escape */);
                    const isEnter = e.equals(3 /* KeyCode.Enter */);
                    if (isEscape || isEnter) {
                        e.preventDefault();
                        e.stopPropagation();
                        done(isEnter, true);
                    }
                }),
                dom.$nO(inputBox.inputElement, dom.$3O.BLUR, () => {
                    done(true, true);
                }),
                dom.$nO(inputBox.inputElement, dom.$3O.CLICK, e => {
                    // Do not expand / collapse selected elements
                    e.preventDefault();
                    e.stopPropagation();
                })
            ];
            return (0, lifecycle_1.$ic)(() => {
                done(false, false);
            });
        }
        disposeElement(node, index, templateData) {
            (0, lifecycle_1.$fc)(templateData.elementDisposable);
            templateData.elementDisposable = [];
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.elementDisposable);
            templateData.templateDisposable.dispose();
        }
    };
    exports.$aQb = $aQb;
    exports.$aQb = $aQb = __decorate([
        __param(0, debug_1.$nH),
        __param(1, contextView_1.$VZ)
    ], $aQb);
});
//# sourceMappingURL=baseDebugView.js.map