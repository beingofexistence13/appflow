/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom"], function (require, exports, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RowCache = void 0;
    function removeFromParent(element) {
        try {
            element.parentElement?.removeChild(element);
        }
        catch (e) {
            // this will throw if this happens due to a blur event, nasty business
        }
    }
    class RowCache {
        constructor(renderers) {
            this.renderers = renderers;
            this.cache = new Map();
            this.transactionNodesPendingRemoval = new Set();
            this.inTransaction = false;
        }
        /**
         * Returns a row either by creating a new one or reusing
         * a previously released row which shares the same templateId.
         *
         * @returns A row and `isReusingConnectedDomNode` if the row's node is already in the dom in a stale position.
         */
        alloc(templateId) {
            let result = this.getTemplateCache(templateId).pop();
            let isStale = false;
            if (result) {
                isStale = this.transactionNodesPendingRemoval.has(result.domNode);
                if (isStale) {
                    this.transactionNodesPendingRemoval.delete(result.domNode);
                }
            }
            else {
                const domNode = (0, dom_1.$)('.monaco-list-row');
                const renderer = this.getRenderer(templateId);
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
            this.releaseRow(row);
        }
        /**
         * Begin a set of changes that use the cache. This lets us skip work when a row is removed and then inserted again.
         */
        transact(makeChanges) {
            if (this.inTransaction) {
                throw new Error('Already in transaction');
            }
            this.inTransaction = true;
            try {
                makeChanges();
            }
            finally {
                for (const domNode of this.transactionNodesPendingRemoval) {
                    this.doRemoveNode(domNode);
                }
                this.transactionNodesPendingRemoval.clear();
                this.inTransaction = false;
            }
        }
        releaseRow(row) {
            const { domNode, templateId } = row;
            if (domNode) {
                if (this.inTransaction) {
                    this.transactionNodesPendingRemoval.add(domNode);
                }
                else {
                    this.doRemoveNode(domNode);
                }
            }
            const cache = this.getTemplateCache(templateId);
            cache.push(row);
        }
        doRemoveNode(domNode) {
            domNode.classList.remove('scrolling');
            removeFromParent(domNode);
        }
        getTemplateCache(templateId) {
            let result = this.cache.get(templateId);
            if (!result) {
                result = [];
                this.cache.set(templateId, result);
            }
            return result;
        }
        dispose() {
            this.cache.forEach((cachedRows, templateId) => {
                for (const cachedRow of cachedRows) {
                    const renderer = this.getRenderer(templateId);
                    renderer.disposeTemplate(cachedRow.templateData);
                    cachedRow.templateData = null;
                }
            });
            this.cache.clear();
            this.transactionNodesPendingRemoval.clear();
        }
        getRenderer(templateId) {
            const renderer = this.renderers.get(templateId);
            if (!renderer) {
                throw new Error(`No renderer found for ${templateId}`);
            }
            return renderer;
        }
    }
    exports.RowCache = RowCache;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93Q2FjaGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvbGlzdC9yb3dDYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFvQjtRQUM3QyxJQUFJO1lBQ0gsT0FBTyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLHNFQUFzRTtTQUN0RTtJQUNGLENBQUM7SUFFRCxNQUFhLFFBQVE7UUFPcEIsWUFBb0IsU0FBNkM7WUFBN0MsY0FBUyxHQUFULFNBQVMsQ0FBb0M7WUFMekQsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBRXpCLG1DQUE4QixHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7WUFDakUsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFFdUMsQ0FBQztRQUV0RTs7Ozs7V0FLRztRQUNILEtBQUssQ0FBQyxVQUFrQjtZQUN2QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFckQsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksTUFBTSxFQUFFO2dCQUNYLE9BQU8sR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxPQUFPLEVBQUU7b0JBQ1osSUFBSSxDQUFDLDhCQUE4QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzNEO2FBQ0Q7aUJBQU07Z0JBQ04sTUFBTSxPQUFPLEdBQUcsSUFBQSxPQUFDLEVBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxRQUFRLEdBQUcs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