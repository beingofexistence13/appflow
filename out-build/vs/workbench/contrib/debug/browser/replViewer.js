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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/list/list", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/severity", "vs/nls!vs/workbench/contrib/debug/browser/replViewer", "vs/platform/contextview/browser/contextView", "vs/platform/label/common/label", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/debugANSIHandling", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom, countBadge_1, highlightedLabel_1, list_1, filters_1, lifecycle_1, path_1, severity_1, nls_1, contextView_1, label_1, defaultStyles_1, themeService_1, themables_1, baseDebugView_1, debugANSIHandling_1, debugIcons_1, debug_1, debugModel_1, replModel_1, editorService_1) {
    "use strict";
    var $$Rb_1, $aSb_1, $bSb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fSb = exports.$eSb = exports.$dSb = exports.$cSb = exports.$bSb = exports.$aSb = exports.$_Rb = exports.$$Rb = exports.$0Rb = void 0;
    const $ = dom.$;
    class $0Rb {
        static { this.ID = 'replEvaluationInput'; }
        get templateId() {
            return $0Rb.ID;
        }
        renderTemplate(container) {
            dom.$0O(container, $('span.arrow' + themables_1.ThemeIcon.asCSSSelector(debugIcons_1.$ynb)));
            const input = dom.$0O(container, $('.expression'));
            const label = new highlightedLabel_1.$JR(input);
            return { label };
        }
        renderElement(element, index, templateData) {
            const evaluation = element.element;
            templateData.label.set(evaluation.value, (0, filters_1.$Hj)(element.filterData));
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    exports.$0Rb = $0Rb;
    let $$Rb = class $$Rb {
        static { $$Rb_1 = this; }
        static { this.ID = 'replGroup'; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        get templateId() {
            return $$Rb_1.ID;
        }
        renderTemplate(container) {
            const label = dom.$0O(container, $('.expression'));
            return { label };
        }
        renderElement(element, _index, templateData) {
            const replGroup = element.element;
            dom.$lO(templateData.label);
            const result = (0, debugANSIHandling_1.$7Rb)(replGroup.name, this.a, this.b, undefined);
            templateData.label.appendChild(result);
        }
        disposeTemplate(_templateData) {
            // noop
        }
    };
    exports.$$Rb = $$Rb;
    exports.$$Rb = $$Rb = $$Rb_1 = __decorate([
        __param(1, themeService_1.$gv)
    ], $$Rb);
    class $_Rb {
        static { this.ID = 'replEvaluationResult'; }
        get templateId() {
            return $_Rb.ID;
        }
        constructor(a) {
            this.a = a;
        }
        renderTemplate(container) {
            const output = dom.$0O(container, $('.evaluation-result.expression'));
            const value = dom.$0O(output, $('span.value'));
            return { value };
        }
        renderElement(element, index, templateData) {
            const expression = element.element;
            (0, baseDebugView_1.$$Pb)(expression, templateData.value, {
                showHover: false,
                colorize: true,
                linkDetector: this.a
            });
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    exports.$_Rb = $_Rb;
    let $aSb = class $aSb {
        static { $aSb_1 = this; }
        static { this.ID = 'outputReplElement'; }
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        get templateId() {
            return $aSb_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            container.classList.add('output');
            const expression = dom.$0O(container, $('.output.expression.value-and-source'));
            data.container = container;
            data.countContainer = dom.$0O(expression, $('.count-badge-wrapper'));
            data.count = new countBadge_1.$nR(data.countContainer, {}, defaultStyles_1.$v2);
            data.value = dom.$0O(expression, $('span.value'));
            data.source = dom.$0O(expression, $('.source'));
            data.toDispose = [];
            data.toDispose.push(dom.$nO(data.source, 'click', e => {
                e.preventDefault();
                e.stopPropagation();
                const source = data.getReplElementSource();
                if (source) {
                    source.source.openInEditor(this.b, {
                        startLineNumber: source.lineNumber,
                        startColumn: source.column,
                        endLineNumber: source.lineNumber,
                        endColumn: source.column
                    });
                }
            }));
            return data;
        }
        renderElement({ element }, index, templateData) {
            this.f(element, templateData);
            templateData.elementListener = element.onDidChangeCount(() => this.f(element, templateData));
            // value
            dom.$lO(templateData.value);
            // Reset classes to clear ansi decorations since templates are reused
            templateData.value.className = 'value';
            templateData.value.appendChild((0, debugANSIHandling_1.$7Rb)(element.value, this.a, this.d, element.session.root));
            templateData.value.classList.add((element.severity === severity_1.default.Warning) ? 'warn' : (element.severity === severity_1.default.Error) ? 'error' : (element.severity === severity_1.default.Ignore) ? 'ignore' : 'info');
            templateData.source.textContent = element.sourceData ? `${(0, path_1.$ae)(element.sourceData.source.name)}:${element.sourceData.lineNumber}` : '';
            templateData.source.title = element.sourceData ? `${this.c.getUriLabel(element.sourceData.source.uri)}:${element.sourceData.lineNumber}` : '';
            templateData.getReplElementSource = () => element.sourceData;
        }
        f(element, templateData) {
            if (element.count >= 2) {
                templateData.count.setCount(element.count);
                templateData.countContainer.hidden = false;
            }
            else {
                templateData.countContainer.hidden = true;
            }
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.toDispose);
        }
        disposeElement(_element, _index, templateData) {
            templateData.elementListener.dispose();
        }
    };
    exports.$aSb = $aSb;
    exports.$aSb = $aSb = $aSb_1 = __decorate([
        __param(1, editorService_1.$9C),
        __param(2, label_1.$Vz),
        __param(3, themeService_1.$gv)
    ], $aSb);
    let $bSb = class $bSb extends baseDebugView_1.$aQb {
        static { $bSb_1 = this; }
        static { this.ID = 'replVariable'; }
        get templateId() {
            return $bSb_1.ID;
        }
        constructor(h, debugService, contextViewService) {
            super(debugService, contextViewService);
            this.h = h;
        }
        renderElement(node, _index, data) {
            const element = node.element;
            super.c(element instanceof replModel_1.$4Pb ? element.expression : element, node, data);
        }
        d(expression, data, highlights) {
            const isReplVariable = expression instanceof replModel_1.$4Pb;
            if (isReplVariable || !expression.name) {
                data.label.set('');
                (0, baseDebugView_1.$$Pb)(isReplVariable ? expression.expression : expression, data.value, { showHover: false, colorize: true, linkDetector: this.h });
                data.expression.classList.remove('nested-variable');
            }
            else {
                (0, baseDebugView_1.$_Pb)(expression, data, true, highlights, this.h);
                data.expression.classList.toggle('nested-variable', isNestedVariable(expression));
            }
        }
        f(expression) {
            return undefined;
        }
    };
    exports.$bSb = $bSb;
    exports.$bSb = $bSb = $bSb_1 = __decorate([
        __param(1, debug_1.$nH),
        __param(2, contextView_1.$VZ)
    ], $bSb);
    class $cSb {
        static { this.ID = 'rawObject'; }
        constructor(a) {
            this.a = a;
        }
        get templateId() {
            return $cSb.ID;
        }
        renderTemplate(container) {
            container.classList.add('output');
            const expression = dom.$0O(container, $('.output.expression'));
            const name = dom.$0O(expression, $('span.name'));
            const label = new highlightedLabel_1.$JR(name);
            const value = dom.$0O(expression, $('span.value'));
            return { container, expression, name, label, value };
        }
        renderElement(node, index, templateData) {
            // key
            const element = node.element;
            templateData.label.set(element.name ? `${element.name}:` : '', (0, filters_1.$Hj)(node.filterData));
            if (element.name) {
                templateData.name.textContent = `${element.name}:`;
            }
            else {
                templateData.name.textContent = '';
            }
            // value
            (0, baseDebugView_1.$$Pb)(element.value, templateData.value, {
                showHover: false,
                linkDetector: this.a
            });
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    exports.$cSb = $cSb;
    function isNestedVariable(element) {
        return element instanceof debugModel_1.$JFb && (element.parent instanceof replModel_1.$7Pb || element.parent instanceof debugModel_1.$JFb);
    }
    class $dSb extends list_1.$dQ {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        getHeight(element) {
            const config = this.a.getValue('debug');
            if (!config.console.wordWrap) {
                return this.d(element, true);
            }
            return super.getHeight(element);
        }
        /**
         * With wordWrap enabled, this is an estimate. With wordWrap disabled, this is the real height that the list will use.
         */
        d(element, ignoreValueLength = false) {
            const lineHeight = this.b.replConfiguration.lineHeight;
            const countNumberOfLines = (str) => str.match(/\n/g)?.length ?? 0;
            const hasValue = (e) => typeof e.value === 'string';
            if (hasValue(element) && !isNestedVariable(element)) {
                const value = element.value;
                const valueRows = countNumberOfLines(value)
                    + (ignoreValueLength ? 0 : Math.floor(value.length / 70)) // Make an estimate for wrapping
                    + (element instanceof replModel_1.$3Pb ? 0 : 1); // A SimpleReplElement ends in \n if it's a complete line
                return Math.max(valueRows, 1) * lineHeight;
            }
            return lineHeight;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.$JFb || element instanceof replModel_1.$4Pb) {
                return $bSb.ID;
            }
            if (element instanceof replModel_1.$7Pb) {
                return $_Rb.ID;
            }
            if (element instanceof replModel_1.$6Pb) {
                return $0Rb.ID;
            }
            if (element instanceof replModel_1.$3Pb) {
                return $aSb.ID;
            }
            if (element instanceof replModel_1.$8Pb) {
                return $$Rb.ID;
            }
            return $cSb.ID;
        }
        hasDynamicHeight(element) {
            if (isNestedVariable(element)) {
                // Nested variables should always be in one line #111843
                return false;
            }
            // Empty elements should not have dynamic height since they will be invisible
            return element.toString().length > 0;
        }
    }
    exports.$dSb = $dSb;
    function isDebugSession(obj) {
        return typeof obj.getReplElements === 'function';
    }
    class $eSb {
        hasChildren(element) {
            if (isDebugSession(element)) {
                return true;
            }
            return !!element.hasChildren;
        }
        getChildren(element) {
            if (isDebugSession(element)) {
                return Promise.resolve(element.getReplElements());
            }
            return Promise.resolve(element.getChildren());
        }
    }
    exports.$eSb = $eSb;
    class $fSb {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.$JFb) {
                return (0, nls_1.localize)(1, null, element.name, element.value);
            }
            if (element instanceof replModel_1.$3Pb || element instanceof replModel_1.$6Pb || element instanceof replModel_1.$7Pb) {
                return element.value + (element instanceof replModel_1.$3Pb && element.count > 1 ? (0, nls_1.localize)(2, null, element.count) : '');
            }
            if (element instanceof replModel_1.$5Pb) {
                return (0, nls_1.localize)(3, null, element.name, element.value);
            }
            if (element instanceof replModel_1.$8Pb) {
                return (0, nls_1.localize)(4, null, element.name);
            }
            return '';
        }
    }
    exports.$fSb = $fSb;
});
//# sourceMappingURL=replViewer.js.map