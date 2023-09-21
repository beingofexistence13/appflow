/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/services/bulkEditService"], function (require, exports, bulkEditService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sortEditsByYieldTo = exports.createCombinedWorkspaceEdit = void 0;
    function createCombinedWorkspaceEdit(uri, ranges, edit) {
        return {
            edits: [
                ...ranges.map(range => new bulkEditService_1.ResourceTextEdit(uri, typeof edit.insertText === 'string'
                    ? { range, text: edit.insertText, insertAsSnippet: false }
                    : { range, text: edit.insertText.snippet, insertAsSnippet: true })),
                ...(edit.additionalEdit?.edits ?? [])
            ]
        };
    }
    exports.createCombinedWorkspaceEdit = createCombinedWorkspaceEdit;
    function sortEditsByYieldTo(edits) {
        function yieldsTo(yTo, other) {
            return ('providerId' in yTo && yTo.providerId === other.providerId)
                || ('mimeType' in yTo && yTo.mimeType === other.handledMimeType);
        }
        // Build list of nodes each node yields to
        const yieldsToMap = new Map();
        for (const edit of edits) {
            for (const yTo of edit.yieldTo ?? []) {
                for (const other of edits) {
                    if (other === edit) {
                        continue;
                    }
                    if (yieldsTo(yTo, other)) {
                        let arr = yieldsToMap.get(edit);
                        if (!arr) {
                            arr = [];
                            yieldsToMap.set(edit, arr);
                        }
                        arr.push(other);
                    }
                }
            }
        }
        if (!yieldsToMap.size) {
            return Array.from(edits);
        }
        // Topological sort
        const visited = new Set();
        const tempStack = [];
        function visit(nodes) {
            if (!nodes.length) {
                return [];
            }
            const node = nodes[0];
            if (tempStack.includes(node)) {
                console.warn(`Yield to cycle detected for ${node.providerId}`);
                return nodes;
            }
            if (visited.has(node)) {
                return visit(nodes.slice(1));
            }
            let pre = [];
            const yTo = yieldsToMap.get(node);
            if (yTo) {
                tempStack.push(node);
                pre = visit(yTo);
                tempStack.pop();
            }
            visited.add(node);
            return [...pre, node, ...visit(nodes.slice(1))];
        }
        return visit(Array.from(edits));
    }
    exports.sortEditsByYieldTo = sortEditsByYieldTo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2Ryb3BPclBhc3RlSW50by9icm93c2VyL2VkaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLFNBQWdCLDJCQUEyQixDQUFDLEdBQVEsRUFBRSxNQUF3QixFQUFFLElBQXFCO1FBQ3BHLE9BQU87WUFDTixLQUFLLEVBQUU7Z0JBQ04sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQ3JCLElBQUksa0NBQWdCLENBQUMsR0FBRyxFQUN2QixPQUFPLElBQUksQ0FBQyxVQUFVLEtBQUssUUFBUTtvQkFDbEMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUU7b0JBQzFELENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUNsRSxDQUFDO2dCQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUM7YUFDckM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQVpELGtFQVlDO0lBRUQsU0FBZ0Isa0JBQWtCLENBSS9CLEtBQW1CO1FBQ3JCLFNBQVMsUUFBUSxDQUFDLEdBQWdCLEVBQUUsS0FBUTtZQUMzQyxPQUFPLENBQUMsWUFBWSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxVQUFVLENBQUM7bUJBQy9ELENBQUMsVUFBVSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsMENBQTBDO1FBQzFDLE1BQU0s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