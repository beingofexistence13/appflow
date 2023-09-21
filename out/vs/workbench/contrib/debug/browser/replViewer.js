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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/list/list", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/severity", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/label/common/label", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/debugANSIHandling", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom, countBadge_1, highlightedLabel_1, list_1, filters_1, lifecycle_1, path_1, severity_1, nls_1, contextView_1, label_1, defaultStyles_1, themeService_1, themables_1, baseDebugView_1, debugANSIHandling_1, debugIcons_1, debug_1, debugModel_1, replModel_1, editorService_1) {
    "use strict";
    var ReplGroupRenderer_1, ReplOutputElementRenderer_1, ReplVariablesRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplAccessibilityProvider = exports.ReplDataSource = exports.ReplDelegate = exports.ReplRawObjectsRenderer = exports.ReplVariablesRenderer = exports.ReplOutputElementRenderer = exports.ReplEvaluationResultsRenderer = exports.ReplGroupRenderer = exports.ReplEvaluationInputsRenderer = void 0;
    const $ = dom.$;
    class ReplEvaluationInputsRenderer {
        static { this.ID = 'replEvaluationInput'; }
        get templateId() {
            return ReplEvaluationInputsRenderer.ID;
        }
        renderTemplate(container) {
            dom.append(container, $('span.arrow' + themables_1.ThemeIcon.asCSSSelector(debugIcons_1.debugConsoleEvaluationInput)));
            const input = dom.append(container, $('.expression'));
            const label = new highlightedLabel_1.HighlightedLabel(input);
            return { label };
        }
        renderElement(element, index, templateData) {
            const evaluation = element.element;
            templateData.label.set(evaluation.value, (0, filters_1.createMatches)(element.filterData));
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    exports.ReplEvaluationInputsRenderer = ReplEvaluationInputsRenderer;
    let ReplGroupRenderer = class ReplGroupRenderer {
        static { ReplGroupRenderer_1 = this; }
        static { this.ID = 'replGroup'; }
        constructor(linkDetector, themeService) {
            this.linkDetector = linkDetector;
            this.themeService = themeService;
        }
        get templateId() {
            return ReplGroupRenderer_1.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, $('.expression'));
            return { label };
        }
        renderElement(element, _index, templateData) {
            const replGroup = element.element;
            dom.clearNode(templateData.label);
            const result = (0, debugANSIHandling_1.handleANSIOutput)(replGroup.name, this.linkDetector, this.themeService, undefined);
            templateData.label.appendChild(result);
        }
        disposeTemplate(_templateData) {
            // noop
        }
    };
    exports.ReplGroupRenderer = ReplGroupRenderer;
    exports.ReplGroupRenderer = ReplGroupRenderer = ReplGroupRenderer_1 = __decorate([
        __param(1, themeService_1.IThemeService)
    ], ReplGroupRenderer);
    class ReplEvaluationResultsRenderer {
        static { this.ID = 'replEvaluationResult'; }
        get templateId() {
            return ReplEvaluationResultsRenderer.ID;
        }
        constructor(linkDetector) {
            this.linkDetector = linkDetector;
        }
        renderTemplate(container) {
            const output = dom.append(container, $('.evaluation-result.expression'));
            const value = dom.append(output, $('span.value'));
            return { value };
        }
        renderElement(element, index, templateData) {
            const expression = element.element;
            (0, baseDebugView_1.renderExpressionValue)(expression, templateData.value, {
                showHover: false,
                colorize: true,
                linkDetector: this.linkDetector
            });
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    exports.ReplEvaluationResultsRenderer = ReplEvaluationResultsRenderer;
    let ReplOutputElementRenderer = class ReplOutputElementRenderer {
        static { ReplOutputElementRenderer_1 = this; }
        static { this.ID = 'outputReplElement'; }
        constructor(linkDetector, editorService, labelService, themeService) {
            this.linkDetector = linkDetector;
            this.editorService = editorService;
            this.labelService = labelService;
            this.themeService = themeService;
        }
        get templateId() {
            return ReplOutputElementRenderer_1.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            container.classList.add('output');
            const expression = dom.append(container, $('.output.expression.value-and-source'));
            data.container = container;
            data.countContainer = dom.append(expression, $('.count-badge-wrapper'));
            data.count = new countBadge_1.CountBadge(data.countContainer, {}, defaultStyles_1.defaultCountBadgeStyles);
            data.value = dom.append(expression, $('span.value'));
            data.source = dom.append(expression, $('.source'));
            data.toDispose = [];
            data.toDispose.push(dom.addDisposableListener(data.source, 'click', e => {
                e.preventDefault();
                e.stopPropagation();
                const source = data.getReplElementSource();
                if (source) {
                    source.source.openInEditor(this.editorService, {
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
            this.setElementCount(element, templateData);
            templateData.elementListener = element.onDidChangeCount(() => this.setElementCount(element, templateData));
            // value
            dom.clearNode(templateData.value);
            // Reset classes to clear ansi decorations since templates are reused
            templateData.value.className = 'value';
            templateData.value.appendChild((0, debugANSIHandling_1.handleANSIOutput)(element.value, this.linkDetector, this.themeService, element.session.root));
            templateData.value.classList.add((element.severity === severity_1.default.Warning) ? 'warn' : (element.severity === severity_1.default.Error) ? 'error' : (element.severity === severity_1.default.Ignore) ? 'ignore' : 'info');
            templateData.source.textContent = element.sourceData ? `${(0, path_1.basename)(element.sourceData.source.name)}:${element.sourceData.lineNumber}` : '';
            templateData.source.title = element.sourceData ? `${this.labelService.getUriLabel(element.sourceData.source.uri)}:${element.sourceData.lineNumber}` : '';
            templateData.getReplElementSource = () => element.sourceData;
        }
        setElementCount(element, templateData) {
            if (element.count >= 2) {
                templateData.count.setCount(element.count);
                templateData.countContainer.hidden = false;
            }
            else {
                templateData.countContainer.hidden = true;
            }
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
        disposeElement(_element, _index, templateData) {
            templateData.elementListener.dispose();
        }
    };
    exports.ReplOutputElementRenderer = ReplOutputElementRenderer;
    exports.ReplOutputElementRenderer = ReplOutputElementRenderer = ReplOutputElementRenderer_1 = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, label_1.ILabelService),
        __param(3, themeService_1.IThemeService)
    ], ReplOutputElementRenderer);
    let ReplVariablesRenderer = class ReplVariablesRenderer extends baseDebugView_1.AbstractExpressionsRenderer {
        static { ReplVariablesRenderer_1 = this; }
        static { this.ID = 'replVariable'; }
        get templateId() {
            return ReplVariablesRenderer_1.ID;
        }
        constructor(linkDetector, debugService, contextViewService) {
            super(debugService, contextViewService);
            this.linkDetector = linkDetector;
        }
        renderElement(node, _index, data) {
            const element = node.element;
            super.renderExpressionElement(element instanceof replModel_1.ReplVariableElement ? element.expression : element, node, data);
        }
        renderExpression(expression, data, highlights) {
            const isReplVariable = expression instanceof replModel_1.ReplVariableElement;
            if (isReplVariable || !expression.name) {
                data.label.set('');
                (0, baseDebugView_1.renderExpressionValue)(isReplVariable ? expression.expression : expression, data.value, { showHover: false, colorize: true, linkDetector: this.linkDetector });
                data.expression.classList.remove('nested-variable');
            }
            else {
                (0, baseDebugView_1.renderVariable)(expression, data, true, highlights, this.linkDetector);
                data.expression.classList.toggle('nested-variable', isNestedVariable(expression));
            }
        }
        getInputBoxOptions(expression) {
            return undefined;
        }
    };
    exports.ReplVariablesRenderer = ReplVariablesRenderer;
    exports.ReplVariablesRenderer = ReplVariablesRenderer = ReplVariablesRenderer_1 = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, contextView_1.IContextViewService)
    ], ReplVariablesRenderer);
    class ReplRawObjectsRenderer {
        static { this.ID = 'rawObject'; }
        constructor(linkDetector) {
            this.linkDetector = linkDetector;
        }
        get templateId() {
            return ReplRawObjectsRenderer.ID;
        }
        renderTemplate(container) {
            container.classList.add('output');
            const expression = dom.append(container, $('.output.expression'));
            const name = dom.append(expression, $('span.name'));
            const label = new highlightedLabel_1.HighlightedLabel(name);
            const value = dom.append(expression, $('span.value'));
            return { container, expression, name, label, value };
        }
        renderElement(node, index, templateData) {
            // key
            const element = node.element;
            templateData.label.set(element.name ? `${element.name}:` : '', (0, filters_1.createMatches)(node.filterData));
            if (element.name) {
                templateData.name.textContent = `${element.name}:`;
            }
            else {
                templateData.name.textContent = '';
            }
            // value
            (0, baseDebugView_1.renderExpressionValue)(element.value, templateData.value, {
                showHover: false,
                linkDetector: this.linkDetector
            });
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    exports.ReplRawObjectsRenderer = ReplRawObjectsRenderer;
    function isNestedVariable(element) {
        return element instanceof debugModel_1.Variable && (element.parent instanceof replModel_1.ReplEvaluationResult || element.parent instanceof debugModel_1.Variable);
    }
    class ReplDelegate extends list_1.CachedListVirtualDelegate {
        constructor(configurationService, replOptions) {
            super();
            this.configurationService = configurationService;
            this.replOptions = replOptions;
        }
        getHeight(element) {
            const config = this.configurationService.getValue('debug');
            if (!config.console.wordWrap) {
                return this.estimateHeight(element, true);
            }
            return super.getHeight(element);
        }
        /**
         * With wordWrap enabled, this is an estimate. With wordWrap disabled, this is the real height that the list will use.
         */
        estimateHeight(element, ignoreValueLength = false) {
            const lineHeight = this.replOptions.replConfiguration.lineHeight;
            const countNumberOfLines = (str) => str.match(/\n/g)?.length ?? 0;
            const hasValue = (e) => typeof e.value === 'string';
            if (hasValue(element) && !isNestedVariable(element)) {
                const value = element.value;
                const valueRows = countNumberOfLines(value)
                    + (ignoreValueLength ? 0 : Math.floor(value.length / 70)) // Make an estimate for wrapping
                    + (element instanceof replModel_1.ReplOutputElement ? 0 : 1); // A SimpleReplElement ends in \n if it's a complete line
                return Math.max(valueRows, 1) * lineHeight;
            }
            return lineHeight;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.Variable || element instanceof replModel_1.ReplVariableElement) {
                return ReplVariablesRenderer.ID;
            }
            if (element instanceof replModel_1.ReplEvaluationResult) {
                return ReplEvaluationResultsRenderer.ID;
            }
            if (element instanceof replModel_1.ReplEvaluationInput) {
                return ReplEvaluationInputsRenderer.ID;
            }
            if (element instanceof replModel_1.ReplOutputElement) {
                return ReplOutputElementRenderer.ID;
            }
            if (element instanceof replModel_1.ReplGroup) {
                return ReplGroupRenderer.ID;
            }
            return ReplRawObjectsRenderer.ID;
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
    exports.ReplDelegate = ReplDelegate;
    function isDebugSession(obj) {
        return typeof obj.getReplElements === 'function';
    }
    class ReplDataSource {
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
    exports.ReplDataSource = ReplDataSource;
    class ReplAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('debugConsole', "Debug Console");
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.Variable) {
                return (0, nls_1.localize)('replVariableAriaLabel', "Variable {0}, value {1}", element.name, element.value);
            }
            if (element instanceof replModel_1.ReplOutputElement || element instanceof replModel_1.ReplEvaluationInput || element instanceof replModel_1.ReplEvaluationResult) {
                return element.value + (element instanceof replModel_1.ReplOutputElement && element.count > 1 ? (0, nls_1.localize)({ key: 'occurred', comment: ['Front will the value of the debug console element. Placeholder will be replaced by a number which represents occurrance count.'] }, ", occurred {0} times", element.count) : '');
            }
            if (element instanceof replModel_1.RawObjectReplElement) {
                return (0, nls_1.localize)('replRawObjectAriaLabel', "Debug console variable {0}, value {1}", element.name, element.value);
            }
            if (element instanceof replModel_1.ReplGroup) {
                return (0, nls_1.localize)('replGroup', "Debug console group {0}", element.name);
            }
            return '';
        }
    }
    exports.ReplAccessibilityProvider = ReplAccessibilityProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbFZpZXdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvcmVwbFZpZXdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNEJoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBaUNoQixNQUFhLDRCQUE0QjtpQkFDeEIsT0FBRSxHQUFHLHFCQUFxQixDQUFDO1FBRTNDLElBQUksVUFBVTtZQUNiLE9BQU8sNEJBQTRCLENBQUMsRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFFRCxjQUFjLENBQUMsU0FBc0I7WUFDcEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFlBQVksR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyx3Q0FBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNLEtBQUssR0FBRyxJQUFJLG1DQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUNsQixDQUFDO1FBRUQsYUFBYSxDQUFDLE9BQW1ELEVBQUUsS0FBYSxFQUFFLFlBQThDO1lBQy9ILE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDbkMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFBLHVCQUFhLEVBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVELGVBQWUsQ0FBQyxZQUE4QztZQUM3RCxPQUFPO1FBQ1IsQ0FBQzs7SUFyQkYsb0VBc0JDO0lB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