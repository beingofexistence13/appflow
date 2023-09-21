/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/typeHierarchy/common/typeHierarchy", "vs/base/common/cancellation", "vs/base/common/filters", "vs/base/browser/ui/iconLabel/iconLabel", "vs/editor/common/languages", "vs/base/common/strings", "vs/editor/common/core/range", "vs/nls!vs/workbench/contrib/typeHierarchy/browser/typeHierarchyTree", "vs/base/common/themables"], function (require, exports, typeHierarchy_1, cancellation_1, filters_1, iconLabel_1, languages_1, strings_1, range_1, nls_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qZb = exports.$pZb = exports.$oZb = exports.$nZb = exports.$mZb = exports.$lZb = exports.Type = void 0;
    class Type {
        constructor(item, model, parent) {
            this.item = item;
            this.model = model;
            this.parent = parent;
        }
        static compare(a, b) {
            let res = (0, strings_1.$Fe)(a.item.uri.toString(), b.item.uri.toString());
            if (res === 0) {
                res = range_1.$ks.compareRangesUsingStarts(a.item.range, b.item.range);
            }
            return res;
        }
    }
    exports.Type = Type;
    class $lZb {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        hasChildren() {
            return true;
        }
        async getChildren(element) {
            if (element instanceof typeHierarchy_1.$2I) {
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
    exports.$lZb = $lZb;
    class $mZb {
        compare(element, otherElement) {
            return Type.compare(element, otherElement);
        }
    }
    exports.$mZb = $mZb;
    class $nZb {
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
    exports.$nZb = $nZb;
    class TypeRenderingTemplate {
        constructor(icon, label) {
            this.icon = icon;
            this.label = label;
        }
    }
    class $oZb {
        constructor() {
            this.templateId = $oZb.id;
        }
        static { this.id = 'TypeRenderer'; }
        renderTemplate(container) {
            container.classList.add('typehierarchy-element');
            const icon = document.createElement('div');
            container.appendChild(icon);
            const label = new iconLabel_1.$KR(container, { supportHighlights: true });
            return new TypeRenderingTemplate(icon, label);
        }
        renderElement(node, _index, template) {
            const { element, filterData } = node;
            const deprecated = element.item.tags?.includes(1 /* SymbolTag.Deprecated */);
            template.icon.classList.add('inline', ...themables_1.ThemeIcon.asClassNameArray(languages_1.SymbolKinds.toIcon(element.item.kind)));
            template.label.setLabel(element.item.name, element.item.detail, { labelEscapeNewLines: true, matches: (0, filters_1.$Hj)(filterData), strikethrough: deprecated });
        }
        disposeTemplate(template) {
            template.label.dispose();
        }
    }
    exports.$oZb = $oZb;
    class $pZb {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(_element) {
            return $oZb.id;
        }
    }
    exports.$pZb = $pZb;
    class $qZb {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getAriaLabel(element) {
            if (this.getDirection() === "supertypes" /* TypeHierarchyDirection.Supertypes */) {
                return (0, nls_1.localize)(1, null, element.item.name);
            }
            else {
                return (0, nls_1.localize)(2, null, element.item.name);
            }
        }
    }
    exports.$qZb = $qZb;
});
//# sourceMappingURL=typeHierarchyTree.js.map