/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/ast", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/concat23Trees", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, assert, utils_1, ast_1, concat23Trees_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Bracket Pair Colorizer - mergeItems', () => {
        (0, utils_1.$bT)();
        test('Clone', () => {
            const tree = ast_1.$cu.create([
                new ast_1.$du((0, length_1.$rt)(1, 1)),
                new ast_1.$du((0, length_1.$rt)(1, 1)),
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
            const node = ((0, concat23Trees_1.$KA)(lists.map(l => l.deepClone())) || ast_1.$cu.create([])).flattenLists();
            // This trivial merge does not maintain the (2,3) tree invariant.
            const referenceNode = ast_1.$cu.create(lists).flattenLists();
            assert.ok(equals(node, referenceNode), 'merge23Trees failed');
        }
        test('Empty List', () => {
            testMerge([]);
        });
        test('Same Height Lists', () => {
            const textNode = new ast_1.$du((0, length_1.$rt)(1, 1));
            const tree = ast_1.$cu.create([textNode.deepClone(), textNode.deepClone()]);
            testMerge([tree.deepClone(), tree.deepClone(), tree.deepClone(), tree.deepClone(), tree.deepClone()]);
        });
        test('Different Height Lists 1', () => {
            const textNode = new ast_1.$du((0, length_1.$rt)(1, 1));
            const tree1 = ast_1.$cu.create([textNode.deepClone(), textNode.deepClone()]);
            const tree2 = ast_1.$cu.create([tree1.deepClone(), tree1.deepClone()]);
            testMerge([tree1, tree2]);
        });
        test('Different Height Lists 2', () => {
            const textNode = new ast_1.$du((0, length_1.$rt)(1, 1));
            const tree1 = ast_1.$cu.create([textNode.deepClone(), textNode.deepClone()]);
            const tree2 = ast_1.$cu.create([tree1.deepClone(), tree1.deepClone()]);
            testMerge([tree2, tree1]);
        });
        test('Different Height Lists 3', () => {
            const textNode = new ast_1.$du((0, length_1.$rt)(1, 1));
            const tree1 = ast_1.$cu.create([textNode.deepClone(), textNode.deepClone()]);
            const tree2 = ast_1.$cu.create([tree1.deepClone(), tree1.deepClone()]);
            testMerge([tree2, tree1, tree1, tree2, tree2]);
        });
    });
});
//# sourceMappingURL=concat23Trees.test.js.map