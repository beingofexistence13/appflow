/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keybindings", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver", "vs/editor/contrib/codeAction/common/types", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, assert, keybindings_1, codeAction_1, codeActionKeybindingResolver_1, types_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CodeActionKeybindingResolver', () => {
        const refactorKeybinding = createCodeActionKeybinding(31 /* KeyCode.KeyA */, codeAction_1.$D1, { kind: types_1.$v1.Refactor.value });
        const refactorExtractKeybinding = createCodeActionKeybinding(32 /* KeyCode.KeyB */, codeAction_1.$D1, { kind: types_1.$v1.Refactor.append('extract').value });
        const organizeImportsKeybinding = createCodeActionKeybinding(33 /* KeyCode.KeyC */, codeAction_1.$G1, undefined);
        test('Should match refactor keybindings', async function () {
            const resolver = new codeActionKeybindingResolver_1.$K1(createMockKeyBindingService([refactorKeybinding])).getResolver();
            assert.strictEqual(resolver({ title: '' }), undefined);
            assert.strictEqual(resolver({ title: '', kind: types_1.$v1.Refactor.value }), refactorKeybinding.resolvedKeybinding);
            assert.strictEqual(resolver({ title: '', kind: types_1.$v1.Refactor.append('extract').value }), refactorKeybinding.resolvedKeybinding);
            assert.strictEqual(resolver({ title: '', kind: types_1.$v1.QuickFix.value }), undefined);
        });
        test('Should prefer most specific keybinding', async function () {
            const resolver = new codeActionKeybindingResolver_1.$K1(createMockKeyBindingService([refactorKeybinding, refactorExtractKeybinding, organizeImportsKeybinding])).getResolver();
            assert.strictEqual(resolver({ title: '', kind: types_1.$v1.Refactor.value }), refactorKeybinding.resolvedKeybinding);
            assert.strictEqual(resolver({ title: '', kind: types_1.$v1.Refactor.append('extract').value }), refactorExtractKeybinding.resolvedKeybinding);
        });
        test('Organize imports should still return a keybinding even though it does not have args', async function () {
            const resolver = new codeActionKeybindingResolver_1.$K1(createMockKeyBindingService([refactorKeybinding, refactorExtractKeybinding, organizeImportsKeybinding])).getResolver();
            assert.strictEqual(resolver({ title: '', kind: types_1.$v1.SourceOrganizeImports.value }), organizeImportsKeybinding.resolvedKeybinding);
        });
    });
    function createMockKeyBindingService(items) {
        return {
            getKeybindings: () => {
                return items;
            },
        };
    }
    function createCodeActionKeybinding(keycode, command, commandArgs) {
        return new resolvedKeybindingItem_1.$XD(new usLayoutResolvedKeybinding_1.$n3b([new keybindings_1.$yq(false, true, false, false, keycode)], 3 /* OperatingSystem.Linux */), command, commandArgs, undefined, false, null, false);
    }
});
//# sourceMappingURL=codeActionKeybindingResolver.test.js.map