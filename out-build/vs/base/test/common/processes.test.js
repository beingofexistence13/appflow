/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/processes", "vs/base/test/common/utils"], function (require, exports, assert, processes, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Processes', () => {
        (0, utils_1.$bT)();
        test('sanitizeProcessEnvironment', () => {
            const env = {
                FOO: 'bar',
                ELECTRON_ENABLE_STACK_DUMPING: 'x',
                ELECTRON_ENABLE_LOGGING: 'x',
                ELECTRON_NO_ASAR: 'x',
                ELECTRON_NO_ATTACH_CONSOLE: 'x',
                ELECTRON_RUN_AS_NODE: 'x',
                VSCODE_CLI: 'x',
                VSCODE_DEV: 'x',
                VSCODE_IPC_HOOK: 'x',
                VSCODE_NLS_CONFIG: 'x',
                VSCODE_PORTABLE: '3',
                VSCODE_PID: 'x',
                VSCODE_SHELL_LOGIN: '1',
                VSCODE_CODE_CACHE_PATH: 'x',
                VSCODE_NEW_VAR: 'x',
                GDK_PIXBUF_MODULE_FILE: 'x',
                GDK_PIXBUF_MODULEDIR: 'x'
            };
            processes.$sl(env);
            assert.strictEqual(env['FOO'], 'bar');
            assert.strictEqual(env['VSCODE_SHELL_LOGIN'], '1');
            assert.strictEqual(env['VSCODE_PORTABLE'], '3');
            assert.strictEqual(Object.keys(env).length, 3);
        });
    });
});
//# sourceMappingURL=processes.test.js.map