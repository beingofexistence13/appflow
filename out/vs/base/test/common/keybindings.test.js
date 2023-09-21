/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keybindings"], function (require, exports, assert, keybindings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('keyCodes', () => {
        test('issue #173325: wrong interpretations of special keys (e.g. [Equal] is mistaken for V)', () => {
            const a = new keybindings_1.KeyCodeChord(true, false, false, false, 52 /* KeyCode.KeyV */);
            const b = new keybindings_1.ScanCodeChord(true, false, false, false, 52 /* ScanCode.Equal */);
            assert.strictEqual(a.getHashCode() === b.getHashCode(), false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3MudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9jb21tb24va2V5YmluZGluZ3MudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRyxLQUFLLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtRQUV0QixJQUFJLENBQUMsdUZBQXVGLEVBQUUsR0FBRyxFQUFFO1lBQ2xHLE1BQU0sQ0FBQyxHQUFHLElBQUksMEJBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLHdCQUFlLENBQUM7WUFDcEUsTUFBTSxDQUFDLEdBQUcsSUFBSSwyQkFBYSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssMEJBQWlCLENBQUM7WUFDdkUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO0lBRUosQ0FBQyxDQUFDLENBQUMifQ==