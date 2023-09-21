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
    exports.$nS = exports.$mS = void 0;
    class $mS extends abstractTree_1.$fS {
        get onDidChangeCollapseState() { return this.o.onDidChangeCollapseState; }
        constructor(K, container, delegate, renderers, options = {}) {
            super(K, container, delegate, renderers, options);
            this.K = K;
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options) {
            this.o.setChildren(element, children, options);
        }
        rerender(element) {
            if (element === undefined) {
                this.j.rerender();
                return;
            }
            this.o.rerender(element);
        }
        updateElementHeight(element, height) {
            this.o.updateElementHeight(element, height);
        }
        resort(element, recursive = true) {
            this.o.resort(element, recursive);
        }
        hasElement(element) {
            return this.o.has(element);
        }
        I(user, view, options) {
            return new objectTreeModel_1.$gS(user, view, options);
        }
    }
    exports.$mS = $mS;
    class CompressibleRenderer {
        get a() {
            return this.b();
        }
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.templateId = c.templateId;
            if (c.onDidChangeTwistieState) {
                this.onDidChangeTwistieState = c.onDidChangeTwistieState;
            }
        }
        renderTemplate(container) {
            const data = this.c.renderTemplate(container);
            return { compressedTreeNode: undefined, data };
        }
        renderElement(node, index, templateData, height) {
            const compressedTreeNode = this.a.getCompressedTreeNode(node.element);
            if (compressedTreeNode.element.elements.length === 1) {
                templateData.compressedTreeNode = undefined;
                this.c.renderElement(node, index, templateData.data, height);
            }
            else {
                templateData.compressedTreeNode = compressedTreeNode;
                this.c.renderCompressedElements(compressedTreeNode, index, templateData.data, height);
            }
        }
        disposeElement(node, index, templateData, height) {
            if (templateData.compressedTreeNode) {
                this.c.disposeCompressedElements?.(templateData.compressedTreeNode, index, templateData.data, height);
            }
            else {
                this.c.disposeElement?.(node, index, templateData.data, height);
            }
        }
        disposeTemplate(templateData) {
            this.c.disposeTemplate(templateData.data);
        }
        renderTwistie(element, twistieElement) {
            if (this.c.renderTwistie) {
                return this.c.renderTwistie(element, twistieElement);
            }
            return false;
        }
    }
    __decorate([
        decorators_1.$6g
    ], CompressibleRenderer.prototype, "a", null);
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
    class $nS extends $mS {
        constructor(user, container, delegate, renderers, options = {}) {
            const compressedTreeNodeProvider = () => this;
            const compressibleRenderers = renderers.map(r => new CompressibleRenderer(compressedTreeNodeProvider, r));
            super(user, container, delegate, compressibleRenderers, asObjectTreeOptions(compressedTreeNodeProvider, options));
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options) {
            this.o.setChildren(element, children, options);
        }
        I(user, view, options) {
            return new compressedObjectTreeModel_1.$lS(user, view, options);
        }
        updateOptions(optionsUpdate = {}) {
            super.updateOptions(optionsUpdate);
            if (typeof optionsUpdate.compressionEnabled !== 'undefined') {
                this.o.setCompressionEnabled(optionsUpdate.compressionEnabled);
            }
        }
        getCompressedTreeNode(element = null) {
            return this.o.getCompressedTreeNode(element);
        }
    }
    exports.$nS = $nS;
});
//# sourceMappingURL=objectTree.js.map