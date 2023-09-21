/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/callHierarchy/common/callHierarchy", "vs/base/common/cancellation", "vs/base/common/filters", "vs/base/browser/ui/iconLabel/iconLabel", "vs/editor/common/languages", "vs/base/common/strings", "vs/editor/common/core/range", "vs/nls", "vs/base/common/themables"], function (require, exports, callHierarchy_1, cancellation_1, filters_1, iconLabel_1, languages_1, strings_1, range_1, nls_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibilityProvider = exports.VirtualDelegate = exports.CallRenderer = exports.IdentityProvider = exports.Sorter = exports.DataSource = exports.Call = void 0;
    class Call {
        constructor(item, locations, model, parent) {
            this.item = item;
            this.locations = locations;
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
    exports.Call = Call;
    class DataSource {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        hasChildren() {
            return true;
        }
        async getChildren(element) {
            if (element instanceof callHierarchy_1.CallHierarchyModel) {
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
    exports.DataSource = DataSource;
    class Sorter {
        compare(element, otherElement) {
            return Call.compare(element, otherElement);
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
    class CallRenderingTemplate {
        constructor(icon, label) {
            this.icon = icon;
            this.label = label;
        }
    }
    class CallRenderer {
        constructor() {
            this.templateId = CallRenderer.id;
        }
        static { this.id = 'CallRenderer'; }
        renderTemplate(container) {
            container.classList.add('callhierarchy-element');
            const icon = document.createElement('div');
            container.appendChild(icon);
            const label = new iconLabel_1.IconLabel(container, { supportHighlights: true });
            return new CallRenderingTemplate(icon, label);
        }
        renderElement(node, _index, template) {
            const { element, filterData } = node;
            const deprecated = element.item.tags?.includes(1 /* SymbolTag.Deprecated */);
            template.icon.className = '';
            template.icon.classList.add('inline', ...themables_1.ThemeIcon.asClassNameArray(languages_1.SymbolKinds.toIcon(element.item.kind)));
            template.label.setLabel(element.item.name, element.item.detail, { labelEscapeNewLines: true, matches: (0, filters_1.createMatches)(filterData), strikethrough: deprecated });
        }
        disposeTemplate(template) {
            template.label.dispose();
        }
    }
    exports.CallRenderer = CallRenderer;
    class VirtualDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(_element) {
            return CallRenderer.id;
        }
    }
    exports.VirtualDelegate = VirtualDelegate;
    class AccessibilityProvider {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('tree.aria', "Call Hierarchy");
        }
        getAriaLabel(element) {
            if (this.getDirection() === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */) {
                return (0, nls_1.localize)('from', "calls from {0}", element.item.name);
            }
            else {
                return (0, nls_1.localize)('to', "callers of {0}", element.item.name);
            }
        }
    }
    exports.AccessibilityProvider = AccessibilityProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbEhpZXJhcmNoeVRyZWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jYWxsSGllcmFyY2h5L2Jyb3dzZXIvY2FsbEhpZXJhcmNoeVRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLE1BQWEsSUFBSTtRQUNoQixZQUNVLElBQXVCLEVBQ3ZCLFNBQWlDLEVBQ2pDLEtBQXlCLEVBQ3pCLE1BQXdCO1lBSHhCLFNBQUksR0FBSixJQUFJLENBQW1CO1lBQ3ZCLGNBQVMsR0FBVCxTQUFTLENBQXdCO1lBQ2pDLFVBQUssR0FBTCxLQUFLLENBQW9CO1lBQ3pCLFdBQU0sR0FBTixNQUFNLENBQWtCO1FBQzlCLENBQUM7UUFFTCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQU8sRUFBRSxDQUFPO1lBQzlCLElBQUksR0FBRyxHQUFHLElBQUEsaUJBQU8sRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtnQkFDZCxHQUFHLEdBQUcsYUFBSyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakU7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7S0FDRDtJQWZELG9CQWVDO0lBRUQsTUFBYSxVQUFVO1FBRXRCLFlBQ1EsWUFBMEM7WUFBMUMsaUJBQVksR0FBWixZQUFZLENBQThCO1FBQzlDLENBQUM7UUFFTCxXQUFXO1lBQ1YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFrQztZQUNu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