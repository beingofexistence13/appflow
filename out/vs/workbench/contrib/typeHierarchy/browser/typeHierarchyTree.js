/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/typeHierarchy/common/typeHierarchy", "vs/base/common/cancellation", "vs/base/common/filters", "vs/base/browser/ui/iconLabel/iconLabel", "vs/editor/common/languages", "vs/base/common/strings", "vs/editor/common/core/range", "vs/nls", "vs/base/common/themables"], function (require, exports, typeHierarchy_1, cancellation_1, filters_1, iconLabel_1, languages_1, strings_1, range_1, nls_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibilityProvider = exports.VirtualDelegate = exports.TypeRenderer = exports.IdentityProvider = exports.Sorter = exports.DataSource = exports.Type = void 0;
    class Type {
        constructor(item, model, parent) {
            this.item = item;
            this.model = model;
            this.parent = parent;
        }
        static compare(a, b) {
            let res = (0, strings_1.compare)(a.item.uri.toString(), b.item.uri.toString());
            if (res === 0) {
                res = range_1.Range.compareRangesUsingStarts(a.item.range, b.item.range);
            }
            return res;
        }
    }
    exports.Type = Type;
    class DataSource {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        hasChildren() {
            return true;
        }
        async getChildren(element) {
            if (element instanceof typeHierarchy_1.TypeHierarchyModel) {
                return element.roots.map(root => new Type(root, element, undefined));
            }
            const { model, item } = element;
            if (this.getDirection() === "supertypes" /* TypeHierarchyDirection.Supertypes */) {
                return (await model.provideSupertypes(item, cancellation_1.CancellationToken.None)).map(item => {
                    return new Type(item, model, element);
                });
            }
            else {
                return (await model.provideSubtypes(item, cancellation_1.CancellationToken.None)).map(item => {
                    return new Type(item, model, element);
                });
            }
        }
    }
    exports.DataSource = DataSource;
    class Sorter {
        compare(element, otherElement) {
            return Type.compare(element, otherElement);
        }
    }
    exports.Sorter = Sorter;
    class IdentityProvider {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        getId(element) {
            let res = this.getDirection() + JSON.stringify(element.item.uri) + JSON.stringify(element.item.range);
            if (element.parent) {
                res += this.getId(element.parent);
            }
            return res;
        }
    }
    exports.IdentityProvider = IdentityProvider;
    class TypeRenderingTemplate {
        constructor(icon, label) {
            this.icon = icon;
            this.label = label;
        }
    }
    class TypeRenderer {
        constructor() {
            this.templateId = TypeRenderer.id;
        }
        static { this.id = 'TypeRenderer'; }
        renderTemplate(container) {
            container.classList.add('typehierarchy-element');
            const icon = document.createElement('div');
            container.appendChild(icon);
            const label = new iconLabel_1.IconLabel(container, { supportHighlights: true });
            return new TypeRenderingTemplate(icon, label);
        }
        renderElement(node, _index, template) {
            const { element, filterData } = node;
            const deprecated = element.item.tags?.includes(1 /* SymbolTag.Deprecated */);
            template.icon.classList.add('inline', ...themables_1.ThemeIcon.asClassNameArray(languages_1.SymbolKinds.toIcon(element.item.kind)));
            template.label.setLabel(element.item.name, element.item.detail, { labelEscapeNewLines: true, matches: (0, filters_1.createMatches)(filterData), strikethrough: deprecated });
        }
        disposeTemplate(template) {
            template.label.dispose();
        }
    }
    exports.TypeRenderer = TypeRenderer;
    class VirtualDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(_element) {
            return TypeRenderer.id;
        }
    }
    exports.VirtualDelegate = VirtualDelegate;
    class AccessibilityProvider {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('tree.aria', "Type Hierarchy");
        }
        getAriaLabel(element) {
            if (this.getDirection() === "supertypes" /* TypeHierarchyDirection.Supertypes */) {
                return (0, nls_1.localize)('supertypes', "supertypes of {0}", element.item.name);
            }
            else {
                return (0, nls_1.localize)('subtypes', "subtypes of {0}", element.item.name);
            }
        }
    }
    exports.AccessibilityProvider = AccessibilityProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZUhpZXJhcmNoeVRyZWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90eXBlSGllcmFyY2h5L2Jyb3dzZXIvdHlwZUhpZXJhcmNoeVRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLE1BQWEsSUFBSTtRQUNoQixZQUNVLElBQXVCLEVBQ3ZCLEtBQXlCLEVBQ3pCLE1BQXdCO1lBRnhCLFNBQUksR0FBSixJQUFJLENBQW1CO1lBQ3ZCLFVBQUssR0FBTCxLQUFLLENBQW9CO1lBQ3pCLFdBQU0sR0FBTixNQUFNLENBQWtCO1FBQzlCLENBQUM7UUFFTCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQU8sRUFBRSxDQUFPO1lBQzlCLElBQUksR0FBRyxHQUFHLElBQUEsaUJBQU8sRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtnQkFDZCxHQUFHLEdBQUcsYUFBSyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakU7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7S0FDRDtJQWRELG9CQWNDO0lBRUQsTUFBYSxVQUFVO1FBRXRCLFlBQ1EsWUFBMEM7WUFBMUMsaUJBQVksR0FBWixZQUFZLENBQThCO1FBQzlDLENBQUM7UUFFTCxXQUFXO1lBQ1YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFrQztZQUNuRCxJQUFJLE9BQU8sWUFBWSxrQ0FBa0IsRUFBRTtnQkFDMUMsT0FB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