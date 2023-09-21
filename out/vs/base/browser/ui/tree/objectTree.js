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
define(["require", "exports", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/compressedObjectTreeModel", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/common/decorators", "vs/base/common/iterator"], function (require, exports, abstractTree_1, compressedObjectTreeModel_1, objectTreeModel_1, decorators_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompressibleObjectTree = exports.ObjectTree = void 0;
    class ObjectTree extends abstractTree_1.AbstractTree {
        get onDidChangeCollapseState() { return this.model.onDidChangeCollapseState; }
        constructor(user, container, delegate, renderers, options = {}) {
            super(user, container, delegate, renderers, options);
            this.user = user;
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options) {
            this.model.setChildren(element, children, options);
        }
        rerender(element) {
            if (element === undefined) {
                this.view.rerender();
                return;
            }
            this.model.rerender(element);
        }
        updateElementHeight(element, height) {
            this.model.updateElementHeight(element, height);
        }
        resort(element, recursive = true) {
            this.model.resort(element, recursive);
        }
        hasElement(element) {
            return this.model.has(element);
        }
        createModel(user, view, options) {
            return new objectTreeModel_1.ObjectTreeModel(user, view, options);
        }
    }
    exports.ObjectTree = ObjectTree;
    class CompressibleRenderer {
        get compressedTreeNodeProvider() {
            return this._compressedTreeNodeProvider();
        }
        constructor(_compressedTreeNodeProvider, renderer) {
            this._compressedTreeNodeProvider = _compressedTreeNodeProvider;
            this.renderer = renderer;
            this.templateId = renderer.templateId;
            if (renderer.onDidChangeTwistieState) {
                this.onDidChangeTwistieState = renderer.onDidChangeTwistieState;
            }
        }
        renderTemplate(container) {
            const data = this.renderer.renderTemplate(container);
            return { compressedTreeNode: undefined, data };
        }
        renderElement(node, index, templateData, height) {
            const compressedTreeNode = this.compressedTreeNodeProvider.getCompressedTreeNode(node.element);
            if (compressedTreeNode.element.elements.length === 1) {
                templateData.compressedTreeNode = undefined;
                this.renderer.renderElement(node, index, templateData.data, height);
            }
            else {
                templateData.compressedTreeNode = compressedTreeNode;
                this.renderer.renderCompressedElements(compressedTreeNode, index, templateData.data, height);
            }
        }
        disposeElement(node, index, templateData, height) {
            if (templateData.compressedTreeNode) {
                this.renderer.disposeCompressedElements?.(templateData.compressedTreeNode, index, templateData.data, height);
            }
            else {
                this.renderer.disposeElement?.(node, index, templateData.data, height);
            }
        }
        disposeTemplate(templateData) {
            this.renderer.disposeTemplate(templateData.data);
        }
        renderTwistie(element, twistieElement) {
            if (this.renderer.renderTwistie) {
                return this.renderer.renderTwistie(element, twistieElement);
            }
            return false;
        }
    }
    __decorate([
        decorators_1.memoize
    ], CompressibleRenderer.prototype, "compressedTreeNodeProvider", null);
    function asObjectTreeOptions(compressedTreeNodeProvider, options) {
        return options && {
            ...options,
            keyboardNavigationLabelProvider: options.keyboardNavigationLabelProvider && {
                getKeyboardNavigationLabel(e) {
                    let compressedTreeNode;
                    try {
                        compressedTreeNode = compressedTreeNodeProvider().getCompressedTreeNode(e);
                    }
                    catch {
                        return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e);
                    }
                    if (compressedTreeNode.element.elements.length === 1) {
                        return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e);
                    }
                    else {
                        return options.keyboardNavigationLabelProvider.getCompressedNodeKeyboardNavigationLabel(compressedTreeNode.element.elements);
                    }
                }
            }
        };
    }
    class CompressibleObjectTree extends ObjectTree {
        constructor(user, container, delegate, renderers, options = {}) {
            const compressedTreeNodeProvider = () => this;
            const compressibleRenderers = renderers.map(r => new CompressibleRenderer(compressedTreeNodeProvider, r));
            super(user, container, delegate, compressibleRenderers, asObjectTreeOptions(compressedTreeNodeProvider, options));
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options) {
            this.model.setChildren(element, children, options);
        }
        createModel(user, view, options) {
            return new compressedObjectTreeModel_1.CompressibleObjectTreeModel(user, view, options);
        }
        updateOptions(optionsUpdate = {}) {
            super.updateOptions(optionsUpdate);
            if (typeof optionsUpdate.compressionEnabled !== 'undefined') {
                this.model.setCompressionEnabled(optionsUpdate.compressionEnabled);
            }
        }
        getCompressedTreeNode(element = null) {
            return this.model.getCompressedTreeNode(element);
        }
    }
    exports.CompressibleObjectTree = CompressibleObjectTree;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0VHJlZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS90cmVlL29iamVjdFRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7O0lBbUNoRyxNQUFhLFVBQTJELFNBQVEsMkJBQTZDO1FBSTVILElBQWEsd0JBQXdCLEtBQThELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7UUFFaEosWUFDb0IsSUFBWSxFQUMvQixTQUFzQixFQUN0QixRQUFpQyxFQUNqQyxTQUErQyxFQUMvQyxVQUE4QyxFQUFFO1lBRWhELEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBb0QsQ0FBQyxDQUFDO1lBTi9FLFNBQUksR0FBSixJQUFJLENBQVE7UUFPaEMsQ0FBQztRQUVELFdBQVcsQ0FBQyxPQUFpQixFQUFFLFdBQTRDLG1CQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBMEM7WUFDdEksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsUUFBUSxDQUFDLE9BQVc7WUFDbkIsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO2dCQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNyQixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsbUJBQW1CLENBQUMsT0FBVSxFQUFFLE1BQTBCO1lBQ3pELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxNQUFNLENBQUMs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