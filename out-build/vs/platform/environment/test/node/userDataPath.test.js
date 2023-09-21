/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/environment/node/argv", "vs/platform/environment/node/userDataPath", "vs/platform/product/common/product"], function (require, exports, assert, argv_1, userDataPath_1, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('User data path', () => {
        test('getUserDataPath - default', () => {
            const path = (0, userDataPath_1.getUserDataPath)((0, argv_1.$zl)(process.argv, argv_1.$yl), product_1.default.nameShort);
            assert.ok(path.length > 0);
        });
        test('getUserDataPath - portable mode', () => {
            const origPortable = process.env['VSCODE_PORTABLE'];
            try {
                const portableDir = 'portable-dir';
                process.env['VSCODE_PORTABLE'] = portableDir;
                const path = (0, userDataPath_1.getUserDataPath)((0, argv_1.$zl)(process.argv, argv_1.$yl), product_1.default.nameShort);
                assert.ok(path.includes(portableDir));
            }
            finally {
                if (typeof origPortable === 'string') {
                    process.env['VSCODE_PORTABLE'] = origPortable;
                }
                else {
                    delete process.env['VSCODE_PORTABLE'];
                }
            }
        });
        test('getUserDataPath - --user-data-dir', () => {
            const cliUserDataDir = 'cli-data-dir';
            const args = (0, argv_1.$zl)(process.argv, argv_1.$yl);
            args['user-data-dir'] = cliUserDataDir;
            const path = (0, userDataPath_1.getUserDataPath)(args, product_1.default.nameShort);
            assert.ok(path.includes(cliUserDataDir));
        });
        test('getUserDataPath - VSCODE_APPDATA', () => {
            const origAppData = process.env['VSCODE_APPDATA'];
            try {
                const appDataDir = 'appdata-dir';
                process.env['VSCODE_APPDATA'] = appDataDir;
                const path = (0, userDataPath_1.getUserDataPath)((0, argv_1.$zl)(process.argv, argv_1.$yl), product_1.default.nameShort);
                assert.ok(path.includes(appDataDir));
            }
            finally {
                if (typeof origAppData === 'string') {
                    process.env['VSCODE_APPDATA'] = origAppData;
                }
                else {
                    delete process.env['VSCODE_APPDATA'];
                }
            }
        });
    });
});
//# sourceMappingURL=userDataPath.test.js.map