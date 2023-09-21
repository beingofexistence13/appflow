/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/processes", "vs/base/test/common/utils"], function (require, exports, assert, processes, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Processes', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
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
            processes.sanitizeProcessEnvironment(env);
            assert.strictEqual(env['FOO'], 'bar');
            assert.strictEqual(env['VSCODE_SHELL_LOGIN'], '1');
            assert.strictEqual(env['VSCODE_PORTABLE'], '3');
            assert.strictEqual(Object.keys(env).length, 3);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc2VzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL3Byb2Nlc3Nlcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBTWhHLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO1FBQ3ZCLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1lBQ3ZDLE1BQU0sR0FBRyxHQUFHO2dCQUNYLEdBQUcsRUFBRSxLQUFLO2dCQUNWLDZCQUE2QixFQUFFLEdBQUc7Z0JBQ2xDLHVCQUF1QixFQUFFLEdBQUc7Z0JBQzVCLGdCQUFnQixFQUFFLEdBQUc7Z0JBQ3JCLDBCQUEwQixFQUFFLEdBQUc7Z0JBQy9CLG9CQUFvQixFQUFFLEdBQUc7Z0JBQ3pCLFVBQVUsRUFBRSxHQUFHO2dCQUNmLFVBQVUsRUFBRSxHQUFHO2dCQUNmLGVBQWUsRUFBRSxHQUFHO2dCQUNwQixpQkFBaUIsRUFBRSxHQUFHO2dCQUN0QixlQUFlLEVBQUUsR0FBRztnQkFDcEIsVUFBVSxFQUFFLEdBQUc7Z0JBQ2Ysa0JBQWtCLEVBQUUsR0FBRztnQkFDdkIsc0JBQXNCLEVBQUUsR0FBRztnQkFDM0IsY0FBYyxFQUFFLEdBQUc7Z0JBQ25CLHNCQUFzQixFQUFFLEdBQUc7Z0JBQzNCLG9CQUFvQixFQUFFLEdBQUc7YUFDekIsQ0FBQztZQUNGLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=