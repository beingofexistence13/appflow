/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/console", "vs/base/common/path"], function (require, exports, assert, console_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Console', () => {
        test('getFirstFrame', () => {
            let stack = 'at vscode.commands.registerCommand (/Users/someone/Desktop/test-ts/out/src/extension.js:18:17)';
            let frame = (0, console_1.$Pp)(stack);
            assert.strictEqual(frame.uri.fsPath, (0, path_1.$7d)('/Users/someone/Desktop/test-ts/out/src/extension.js'));
            assert.strictEqual(frame.line, 18);
            assert.strictEqual(frame.column, 17);
            stack = 'at /Users/someone/Desktop/test-ts/out/src/extension.js:18:17';
            frame = (0, console_1.$Pp)(stack);
            assert.strictEqual(frame.uri.fsPath, (0, path_1.$7d)('/Users/someone/Desktop/test-ts/out/src/extension.js'));
            assert.strictEqual(frame.line, 18);
            assert.strictEqual(frame.column, 17);
            stack = 'at c:\\Users\\someone\\Desktop\\end-js\\extension.js:18:17';
            frame = (0, console_1.$Pp)(stack);
            assert.strictEqual(frame.uri.fsPath, 'c:\\Users\\someone\\Desktop\\end-js\\extension.js');
            assert.strictEqual(frame.line, 18);
            assert.strictEqual(frame.column, 17);
            stack = 'at e.$executeContributedCommand(c:\\Users\\someone\\Desktop\\end-js\\extension.js:18:17)';
            frame = (0, console_1.$Pp)(stack);
            assert.strictEqual(frame.uri.fsPath, 'c:\\Users\\someone\\Desktop\\end-js\\extension.js');
            assert.strictEqual(frame.line, 18);
            assert.strictEqual(frame.column, 17);
            stack = 'at /Users/someone/Desktop/test-ts/out/src/extension.js:18:17\nat /Users/someone/Desktop/test-ts/out/src/other.js:28:27\nat /Users/someone/Desktop/test-ts/out/src/more.js:38:37';
            frame = (0, console_1.$Pp)(stack);
            assert.strictEqual(frame.uri.fsPath, (0, path_1.$7d)('/Users/someone/Desktop/test-ts/out/src/extension.js'));
            assert.strictEqual(frame.line, 18);
            assert.strictEqual(frame.column, 17);
        });
    });
});
//# sourceMappingURL=console.test.js.map