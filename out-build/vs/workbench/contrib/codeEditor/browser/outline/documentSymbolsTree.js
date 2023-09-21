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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/filters", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/nls!vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree", "vs/base/browser/ui/iconLabel/iconLabel", "vs/platform/configuration/common/configuration", "vs/platform/markers/common/markers", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/common/async", "vs/editor/common/services/textResourceConfiguration", "vs/base/common/themables", "vs/css!./documentSymbolsTree", "vs/editor/contrib/symbolIcons/browser/symbolIcons"], function (require, exports, dom, highlightedLabel_1, filters_1, range_1, languages_1, outlineModel_1, nls_1, iconLabel_1, configuration_1, markers_1, themeService_1, colorRegistry_1, async_1, textResourceConfiguration_1, themables_1) {
    "use strict";
    var $yZb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zZb = exports.$yZb = exports.$xZb = exports.$wZb = exports.$vZb = exports.$uZb = exports.$tZb = exports.$sZb = void 0;
    class $sZb {
        getKeyboardNavigationLabel(element) {
            if (element instanceof outlineModel_1.$P8) {
                return element.label;
            }
            else {
                return element.symbol.name;
            }
        }
    }
    exports.$sZb = $sZb;
    class $tZb {
        constructor(c) {
            this.c = c;
        }
        getWidgetAriaLabel() {
            return this.c;
        }
        getAriaLabel(element) {
            if (element instanceof outlineModel_1.$P8) {
                return element.label;
            }
            else {
                return (0, languages_1.$0s)(element.symbol.name, element.symbol.kind);
            }
        }
    }
    exports.$tZb = $tZb;
    class $uZb {
        getId(element) {
            return element.id;
        }
    }
    exports.$uZb = $uZb;
    class DocumentSymbolGroupTemplate {
        static { this.id = 'DocumentSymbolGroupTemplate'; }
        constructor(labelContainer, label) {
            this.labelContainer = labelContainer;
            this.label = label;
        }
    }
    class DocumentSymbolTemplate {
        static { this.id = 'DocumentSymbolTemplate'; }
        constructor(container, iconLabel, iconClass, decoration) {
            this.container = container;
            this.iconLabel = iconLabel;
            this.iconClass = iconClass;
            this.decoration = decoration;
        }
    }
    class $vZb {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            return element instanceof outlineModel_1.$P8
                ? DocumentSymbolGroupTemplate.id
                : DocumentSymbolTemplate.id;
        }
    }
    exports.$vZb = $vZb;
    class $wZb {
        constructor() {
            this.templateId = DocumentSymbolGroupTemplate.id;
        }
        renderTemplate(container) {
            const labelContainer = dom.$('.outline-element-label');
            container.classList.add('outline-element');
            dom.$0O(container, labelContainer);
            return new DocumentSymbolGroupTemplate(labelContainer, new highlightedLabel_1.$JR(labelContainer));
        }
        renderElement(node, _index, template) {
            template.label.set(node.element.label, (0, filters_1.$Hj)(node.filterData));
        }
        disposeTemplate(_template) {
            // nothing
        }
    }
    exports.$wZb = $wZb;
    let $xZb = class $xZb {
        constructor(c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.templateId = DocumentSymbolTemplate.id;
        }
        renderTemplate(container) {
            container.classList.add('outline-element');
            const iconLabel = new iconLabel_1.$KR(container, { supportHighlights: true });
            const iconClass = dom.$('.outline-element-icon');
            const decoration = dom.$('.outline-element-decoration');
            container.prepend(iconClass);
            container.appendChild(decoration);
            return new DocumentSymbolTemplate(container, iconLabel, iconClass, decoration);
        }
        renderElement(node, _index, template) {
            const { element } = node;
            const extraClasses = ['nowrap'];
            const options = {
                matches: (0, filters_1.$Hj)(node.filterData),
                labelEscapeNewLines: true,
                extraClasses,
                title: (0, nls_1.localize)(0, null, element.symbol.name, languages_1.$9s[element.symbol.kind])
            };
            if (this.d.getValue("outline.icons" /* OutlineConfigKeys.icons */)) {
                // add styles for the icons
                template.iconClass.className = '';
                template.iconClass.classList.add('outline-element-icon', 'inline', ...themables_1.ThemeIcon.asClassNameArray(languages_1.SymbolKinds.toIcon(element.symbol.kind)));
            }
            if (element.symbol.tags.indexOf(1 /* SymbolTag.Deprecated */) >= 0) {
                extraClasses.push(`deprecated`);
                options.matches = [];
            }
            template.iconLabel.setLabel(element.symbol.name, element.symbol.detail, options);
            if (this.c) {
                this.f(element, template);
            }
        }
        f(element, template) {
            if (!element.marker) {
                dom.$eP(template.decoration);
                template.container.style.removeProperty('--outline-element-color');
                return;
            }
            const { count, topSev } = element.marker;
            const color = this.e.getColorTheme().getColor(topSev === markers_1.MarkerSeverity.Error ? colorRegistry_1.$Mx : colorRegistry_1.$Nx);
            const cssColor = color ? color.toString() : 'inherit';
            // color of the label
            if (this.d.getValue("outline.problems.colors" /* OutlineConfigKeys.problemsColors */)) {
                template.container.style.setProperty('--outline-element-color', cssColor);
            }
            else {
                template.container.style.removeProperty('--outline-element-color');
            }
            // badge with color/rollup
            if (!this.d.getValue("outline.problems.badges" /* OutlineConfigKeys.problemsBadges */)) {
                dom.$eP(template.decoration);
            }
            else if (count > 0) {
                dom.$dP(template.decoration);
                template.decoration.classList.remove('bubble');
                template.decoration.innerText = count < 10 ? count.toString() : '+9';
                template.decoration.title = count === 1 ? (0, nls_1.localize)(1, null) : (0, nls_1.localize)(2, null, count);
                template.decoration.style.setProperty('--outline-element-color', cssColor);
            }
            else {
                dom.$dP(template.decoration);
                template.decoration.classList.add('bubble');
                template.decoration.innerText = '\uea71';
                template.decoration.title = (0, nls_1.localize)(3, null);
                template.decoration.style.setProperty('--outline-element-color', cssColor);
            }
        }
        disposeTemplate(_template) {
            _template.iconLabel.dispose();
        }
    };
    exports.$xZb = $xZb;
    exports.$xZb = $xZb = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, themeService_1.$gv)
    ], $xZb);
    let $yZb = class $yZb {
        static { $yZb_1 = this; }
        static { this.kindToConfigName = Object.freeze({
            [0 /* SymbolKind.File */]: 'showFiles',
            [1 /* SymbolKind.Module */]: 'showModules',
            [2 /* SymbolKind.Namespace */]: 'showNamespaces',
            [3 /* SymbolKind.Package */]: 'showPackages',
            [4 /* SymbolKind.Class */]: 'showClasses',
            [5 /* SymbolKind.Method */]: 'showMethods',
            [6 /* SymbolKind.Property */]: 'showProperties',
            [7 /* SymbolKind.Field */]: 'showFields',
            [8 /* SymbolKind.Constructor */]: 'showConstructors',
            [9 /* SymbolKind.Enum */]: 'showEnums',
            [10 /* SymbolKind.Interface */]: 'showInterfaces',
            [11 /* SymbolKind.Function */]: 'showFunctions',
            [12 /* SymbolKind.Variable */]: 'showVariables',
            [13 /* SymbolKind.Constant */]: 'showConstants',
            [14 /* SymbolKind.String */]: 'showStrings',
            [15 /* SymbolKind.Number */]: 'showNumbers',
            [16 /* SymbolKind.Boolean */]: 'showBooleans',
            [17 /* SymbolKind.Array */]: 'showArrays',
            [18 /* SymbolKind.Object */]: 'showObjects',
            [19 /* SymbolKind.Key */]: 'showKeys',
            [20 /* SymbolKind.Null */]: 'showNull',
            [21 /* SymbolKind.EnumMember */]: 'showEnumMembers',
            [22 /* SymbolKind.Struct */]: 'showStructs',
            [23 /* SymbolKind.Event */]: 'showEvents',
            [24 /* SymbolKind.Operator */]: 'showOperators',
            [25 /* SymbolKind.TypeParameter */]: 'showTypeParameters',
        }); }
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        filter(element) {
            const outline = outlineModel_1.$Q8.get(element);
            if (!(element instanceof outlineModel_1.$O8)) {
                return true;
            }
            const configName = $yZb_1.kindToConfigName[element.symbol.kind];
            const configKey = `${this.c}.${configName}`;
            return this.d.getValue(outline?.uri, configKey);
        }
    };
    exports.$yZb = $yZb;
    exports.$yZb = $yZb = $yZb_1 = __decorate([
        __param(1, textResourceConfiguration_1.$FA)
    ], $yZb);
    class $zZb {
        constructor() {
            this.c = new async_1.$Xg(() => new Intl.Collator(undefined, { numeric: true }));
        }
        compareByPosition(a, b) {
            if (a instanceof outlineModel_1.$P8 && b instanceof outlineModel_1.$P8) {
                return a.order - b.order;
            }
            else if (a instanceof outlineModel_1.$O8 && b instanceof outlineModel_1.$O8) {
                return range_1.$ks.compareRangesUsingStarts(a.symbol.range, b.symbol.range) || this.c.value.compare(a.symbol.name, b.symbol.name);
            }
            return 0;
        }
        compareByType(a, b) {
            if (a instanceof outlineModel_1.$P8 && b instanceof outlineModel_1.$P8) {
                return a.order - b.order;
            }
            else if (a instanceof outlineModel_1.$O8 && b instanceof outlineModel_1.$O8) {
                return a.symbol.kind - b.symbol.kind || this.c.value.compare(a.symbol.name, b.symbol.name);
            }
            return 0;
        }
        compareByName(a, b) {
            if (a instanceof outlineModel_1.$P8 && b instanceof outlineModel_1.$P8) {
                return a.order - b.order;
            }
            else if (a instanceof outlineModel_1.$O8 && b instanceof outlineModel_1.$O8) {
                return this.c.value.compare(a.symbol.name, b.symbol.name) || range_1.$ks.compareRangesUsingStarts(a.symbol.range, b.symbol.range);
            }
            return 0;
        }
    }
    exports.$zZb = $zZb;
});
//# sourceMappingURL=documentSymbolsTree.js.map