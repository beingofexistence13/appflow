/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/callHierarchy/common/callHierarchy", "vs/base/common/cancellation", "vs/base/common/filters", "vs/base/browser/ui/iconLabel/iconLabel", "vs/editor/common/languages", "vs/base/common/strings", "vs/editor/common/core/range", "vs/nls!vs/workbench/contrib/callHierarchy/browser/callHierarchyTree", "vs/base/common/themables"], function (require, exports, callHierarchy_1, cancellation_1, filters_1, iconLabel_1, languages_1, strings_1, range_1, nls_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iZb = exports.$hZb = exports.$gZb = exports.$fZb = exports.$eZb = exports.$dZb = exports.Call = void 0;
    class Call {
        constructor(item, locations, model, parent) {
            this.item = item;
            this.locations = locations;
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
    exports.Call = Call;
    class $dZb {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        hasChildren() {
            return true;
        }
        async getChildren(element) {
            if (element instanceof callHierarchy_1.$fF) {
                return element.roots.map(root => new Call(root, undefined, element, undefined));
            }
            const { model, item } = element;
            if (this.getDirection() === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */) {
                return (await model.resolveOutgoingCalls(item, cancellation_1.CancellationToken.None)).map(call => {
                    return new Call(call.to, call.fromRanges.map(range => ({ range, uri: item.uri })), model, element);
                });
            }
            else {
                return (await model.resolveIncomingCalls(item, cancellation_1.CancellationToken.None)).map(call => {
                    return new Call(call.from, call.fromRanges.map(range => ({ range, uri: call.from.uri })), model, element);
                });
            }
        }
    }
    exports.$dZb = $dZb;
    class $eZb {
        compare(element, otherElement) {
            return Call.compare(element, otherElement);
        }
    }
    exports.$eZb = $eZb;
    class $fZb {
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
    exports.$fZb = $fZb;
    class CallRenderingTemplate {
        constructor(icon, label) {
            this.icon = icon;
            this.label = label;
        }
    }
    class $gZb {
        constructor() {
            this.templateId = $gZb.id;
        }
        static { this.id = 'CallRenderer'; }
        renderTemplate(container) {
            container.classList.add('callhierarchy-element');
            const icon = document.createElement('div');
            container.appendChild(icon);
            const label = new iconLabel_1.$KR(container, { supportHighlights: true });
            return new CallRenderingTemplate(icon, label);
        }
        renderElement(node, _index, template) {
            const { element, filterData } = node;
            const deprecated = element.item.tags?.includes(1 /* SymbolTag.Deprecated */);
            template.icon.className = '';
            template.icon.classList.add('inline', ...themables_1.ThemeIcon.asClassNameArray(languages_1.SymbolKinds.toIcon(element.item.kind)));
            template.label.setLabel(element.item.name, element.item.detail, { labelEscapeNewLines: true, matches: (0, filters_1.$Hj)(filterData), strikethrough: deprecated });
        }
        disposeTemplate(template) {
            template.label.dispose();
        }
    }
    exports.$gZb = $gZb;
    class $hZb {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(_element) {
            return $gZb.id;
        }
    }
    exports.$hZb = $hZb;
    class $iZb {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getAriaLabel(element) {
            if (this.getDirection() === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */) {
                return (0, nls_1.localize)(1, null, element.item.name);
            }
            else {
                return (0, nls_1.localize)(2, null, element.item.name);
            }
        }
    }
    exports.$iZb = $iZb;
});
//# sourceMappingURL=callHierarchyTree.js.map