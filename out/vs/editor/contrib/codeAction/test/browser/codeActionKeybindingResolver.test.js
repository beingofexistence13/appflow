/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keybindings", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver", "vs/editor/contrib/codeAction/common/types", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, assert, keybindings_1, codeAction_1, codeActionKeybindingResolver_1, types_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CodeActionKeybindingResolver', () => {
        const refactorKeybinding = createCodeActionKeybinding(31 /* KeyCode.KeyA */, codeAction_1.refactorCommandId, { kind: types_1.CodeActionKind.Refactor.value });
        const refactorExtractKeybinding = createCodeActionKeybinding(32 /* KeyCode.KeyB */, codeAction_1.refactorCommandId, { kind: types_1.CodeActionKind.Refactor.append('extract').value });
        const organizeImportsKeybinding = createCodeActionKeybinding(33 /* KeyCode.KeyC */, codeAction_1.organizeImportsCommandId, undefined);
        test('Should match refactor keybindings', async function () {
            const resolver = new codeActionKeybindingResolver_1.CodeActionKeybindingResolver(createMockKeyBindingService([refactorKeybinding])).getResolver();
            assert.strictEqual(resolver({ title: '' }), undefined);
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.Refactor.value }), refactorKeybinding.resolvedKeybinding);
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.Refactor.append('extract').value }), refactorKeybinding.resolvedKeybinding);
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.QuickFix.value }), undefined);
        });
        test('Should prefer most specific keybinding', async function () {
            const resolver = new codeActionKeybindingResolver_1.CodeActionKeybindingResolver(createMockKeyBindingService([refactorKeybinding, refactorExtractKeybinding, organizeImportsKeybinding])).getResolver();
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.Refactor.value }), refactorKeybinding.resolvedKeybinding);
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.Refactor.append('extract').value }), refactorExtractKeybinding.resolvedKeybinding);
        });
        test('Organize imports should still return a keybinding even though it does not have args', async function () {
            const resolver = new codeActionKeybindingResolver_1.CodeActionKeybindingResolver(createMockKeyBindingService([refactorKeybinding, refactorExtractKeybinding, organizeImportsKeybinding])).getResolver();
            assert.strictEqual(resolver({ title: '', kind: types_1.CodeActionKind.SourceOrganizeImports.value }), organizeImportsKeybinding.resolvedKeybinding);
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
        return new resolvedKeybindingItem_1.ResolvedKeybindingItem(new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding([new keybindings_1.KeyCodeChord(false, true, false, false, keycode)], 3 /* OperatingSystem.Linux */), command, commandArgs, undefined, false, null, false);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbktleWJpbmRpbmdSZXNvbHZlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29kZUFjdGlvbi90ZXN0L2Jyb3dzZXIvY29kZUFjdGlvbktleWJpbmRpbmdSZXNvbHZlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLEtBQUssQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7UUFDMUMsTUFBTSxrQkFBa0IsR0FBRywwQkFBMEIsd0JBRXBELDhCQUFpQixFQUNqQixFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRTFDLE1BQU0seUJBQXlCLEdBQUcsMEJBQTBCLHdCQUUzRCw4QkFBaUIsRUFDakIsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFNUQsTUFBTSx5QkFBeUIsR0FBRywwQkFBMEIsd0JBRTNELHFDQUF3QixFQUN4QixTQUFTLENBQUMsQ0FBQztRQUVaLElBQUksQ0FBQyxtQ0FBbUMsRUFBRSxLQUFLO1lBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksMkRBQTRCLENBQ2hELDJCQUEyQixDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUNqRCxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRWhCLE1BQU0sQ0FBQyxXQUFXLENBQ2pCLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixTQUFTLENBQUMsQ0FBQztZQUVaLE1BQU0sQ0FBQyxXQUFXLENBQ2pCLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLHNCQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQzVELGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLFdBQVcsQ0FDakIsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQzlFLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLFdBQVcsQ0FDakIsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDNUQsU0FBUyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxLQUFLO1lBQ25ELE1BQU0sUUFBUSxHQUFHLElBQUksMkRBQTRCLENBQ2hELDJCQUEyQixDQUFDLENBQUMsa0JBQWtCLEVBQUUseUJBQXlCLEVBQUUseUJBQXlCLENBQUMsQ0FBQyxDQUN2RyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRWhCLE1BQU0sQ0FBQyxXQUFXLENBQ2pCLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLHNCQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQzVELGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLFdBQVcsQ0FDakIsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQzlFLHlCQUF5QixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUZBQXFGLEVBQUUsS0FBSztZQUNoRyxNQUFNLFFBQVEsR0FBRyxJQUFJLDJEQUE0QixDQUNoRCwyQkFBMkIsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FDdkcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUVoQixNQUFNLENBQUMsV0FBVyxDQUNqQixRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxDQUFDLEVBQ3pFLHlCQUF5QixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsMkJBQTJCLENBQUMsS0FBK0I7UUFDbkUsT0FBMkI7WUFDMUIsY0FBYyxFQUFFLEdBQXNDLEVBQUU7Z0JBQ3ZELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztTQUNELENBQUM7SUFDSCxDQUFDO0lBRUQsU0FBUywwQkFBMEIsQ0FBQyxPQUFnQixFQUFFLE9BQWUsRUFBRSxXQUFnQjtRQUN0RixPQUFPLElBQUksK0NBQXNCLENBQ2hDLElBQUksdURBQTBCLENBQzdCLENBQUMsSUFBSSwwQkFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxnQ0FDaEMsRUFDdkIsT0FBTyxFQUNQLFdBQVcsRUFDWCxTQUFTLEVBQ1QsS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLENBQUMsQ0FBQztJQUNULENBQUMifQ==