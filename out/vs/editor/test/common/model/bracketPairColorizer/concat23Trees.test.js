/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/ast", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/concat23Trees", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, assert, utils_1, ast_1, concat23Trees_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Bracket Pair Colorizer - mergeItems', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Clone', () => {
            const tree = ast_1.ListAstNode.create([
                new ast_1.TextAstNode((0, length_1.toLength)(1, 1)),
                new ast_1.TextAstNode((0, length_1.toLength)(1, 1)),
            ]);
            assert.ok(equals(tree, tree.deepClone()));
        });
        function equals(node1, node2) {
            if (node1.length !== node2.length) {
                return false;
            }
            if (node1.children.length !== node2.children.length) {
                return false;
            }
            for (let i = 0; i < node1.children.length; i++) {
                if (!equals(node1.children[i], node2.children[i])) {
                    return false;
                }
            }
            if (!node1.missingOpeningBracketIds.equals(node2.missingOpeningBracketIds)) {
                return false;
            }
            if (node1.kind === 2 /* AstNodeKind.Pair */ && node2.kind === 2 /* AstNodeKind.Pair */) {
                return true;
            }
            else if (node1.kind === node2.kind) {
                return true;
            }
            return false;
        }
        function testMerge(lists) {
            const node = ((0, concat23Trees_1.concat23Trees)(lists.map(l => l.deepClone())) || ast_1.ListAstNode.create([])).flattenLists();
            // This trivial merge does not maintain the (2,3) tree invariant.
            const referenceNode = ast_1.ListAstNode.create(lists).flattenLists();
            assert.ok(equals(node, referenceNode), 'merge23Trees failed');
        }
        test('Empty List', () => {
            testMerge([]);
        });
        test('Same Height Lists', () => {
            const textNode = new ast_1.TextAstNode((0, length_1.toLength)(1, 1));
            const tree = ast_1.ListAstNode.create([textNode.deepClone(), textNode.deepClone()]);
            testMerge([tree.deepClone(), tree.deepClone(), tree.deepClone(), tree.deepClone(), tree.deepClone()]);
        });
        test('Different Height Lists 1', () => {
            const textNode = new ast_1.TextAstNode((0, length_1.toLength)(1, 1));
            const tree1 = ast_1.ListAstNode.create([textNode.deepClone(), textNode.deepClone()]);
            const tree2 = ast_1.ListAstNode.create([tree1.deepClone(), tree1.deepClone()]);
            testMerge([tree1, tree2]);
        });
        test('Different Height Lists 2', () => {
            const textNode = new ast_1.TextAstNode((0, length_1.toLength)(1, 1));
            const tree1 = ast_1.ListAstNode.create([textNode.deepClone(), textNode.deepClone()]);
            const tree2 = ast_1.ListAstNode.create([tree1.deepClone(), tree1.deepClone()]);
            testMerge([tree2, tree1]);
        });
        test('Different Height Lists 3', () => {
            const textNode = new ast_1.TextAstNode((0, length_1.toLength)(1, 1));
            const tree1 = ast_1.ListAstNode.create([textNode.deepClone(), textNode.deepClone()]);
            const tree2 = ast_1.ListAstNode.create([tree1.deepClone(), tree1.deepClone()]);
            testMerge([tree2, tree1, tree1, tree2, tree2]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uY2F0MjNUcmVlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL21vZGVsL2JyYWNrZXRQYWlyQ29sb3JpemVyL2NvbmNhdDIzVHJlZXMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVFoRyxLQUFLLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO1FBRWpELElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUNsQixNQUFNLElBQUksR0FBRyxpQkFBVyxDQUFDLE1BQU0sQ0FBQztnQkFDL0IsSUFBSSxpQkFBVyxDQUFDLElBQUEsaUJBQVEsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLElBQUksaUJBQVcsQ0FBQyxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9CLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBRUgsU0FBUyxNQUFNLENBQUMsS0FBYyxFQUFFLEtBQWM7WUFDN0MsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQ2xDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUNwRCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxF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