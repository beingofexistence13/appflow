/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom"], function (require, exports, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iQ = void 0;
    function removeFromParent(element) {
        try {
            element.parentElement?.removeChild(element);
        }
        catch (e) {
            // this will throw if this happens due to a blur event, nasty business
        }
    }
    class $iQ {
        constructor(d) {
            this.d = d;
            this.a = new Map();
            this.b = new Set();
            this.c = false;
        }
        /**
         * Returns a row either by creating a new one or reusing
         * a previously released row which shares the same templateId.
         *
         * @returns A row and `isReusingConnectedDomNode` if the row's node is already in the dom in a stale position.
         */
        alloc(templateId) {
            let result = this.h(templateId).pop();
            let isStale = false;
            if (result) {
                isStale = this.b.has(result.domNode);
                if (isStale) {
                    this.b.delete(result.domNode);
                }
            }
            else {
                const domNode = (0, dom_1.$)('.monaco-list-row');
                const renderer = this.i(templateId);
                const templateData = renderer.renderTemplate(domNode);
                result = { domNode, templateId, templateData };
            }
            return { row: result, isReusingConnectedDomNode: isStale };
        }
        /**
         * Releases the row for eventual reuse.
         */
        release(row) {
            if (!row) {
                return;
            }
            this.f(row);
        }
        /**
         * Begin a set of changes that use the cache. This lets us skip work when a row is removed and then inserted again.
         */
        transact(makeChanges) {
            if (this.c) {
                throw new Error('Already in transaction');
            }
            this.c = true;
            try {
                makeChanges();
            }
            finally {
                for (const domNode of this.b) {
                    this.g(domNode);
                }
                this.b.clear();
                this.c = false;
            }
        }
        f(row) {
            const { domNode, templateId } = row;
            if (domNode) {
                if (this.c) {
                    this.b.add(domNode);
                }
                else {
                    this.g(domNode);
                }
            }
            const cache = this.h(templateId);
            cache.push(row);
        }
        g(domNode) {
            domNode.classList.remove('scrolling');
            removeFromParent(domNode);
        }
        h(templateId) {
            let result = this.a.get(templateId);
            if (!result) {
                result = [];
                this.a.set(templateId, result);
            }
            return result;
        }
        dispose() {
            this.a.forEach((cachedRows, templateId) => {
                for (const cachedRow of cachedRows) {
                    const renderer = this.i(templateId);
                    renderer.disposeTemplate(cachedRow.templateData);
                    cachedRow.templateData = null;
                }
            });
            this.a.clear();
            this.b.clear();
        }
        i(templateId) {
            const renderer = this.d.get(templateId);
            if (!renderer) {
                throw new Error(`No renderer found for ${templateId}`);
            }
            return renderer;
        }
    }
    exports.$iQ = $iQ;
});
//# sourceMappingURL=rowCache.js.map