/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/environment/node/argv", "vs/platform/environment/node/userDataPath", "vs/platform/product/common/product"], function (require, exports, assert, argv_1, userDataPath_1, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('User data path', () => {
        test('getUserDataPath - default', () => {
            const path = (0, userDataPath_1.getUserDataPath)((0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS), product_1.default.nameShort);
            assert.ok(path.length > 0);
        });
        test('getUserDataPath - portable mode', () => {
            const origPortable = process.env['VSCODE_PORTABLE'];
            try {
                const portableDir = 'portable-dir';
                process.env['VSCODE_PORTABLE'] = portableDir;
                const path = (0, userDataPath_1.getUserDataPath)((0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS), product_1.default.nameShort);
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
            const args = (0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS);
            args['user-data-dir'] = cliUserDataDir;
            const path = (0, userDataPath_1.getUserDataPath)(args, product_1.default.nameShort);
            assert.ok(path.includes(cliUserDataDir));
        });
        test('getUserDataPath - VSCODE_APPDATA', () => {
            const origAppData = process.env['VSCODE_APPDATA'];
            try {
                const appDataDir = 'appdata-dir';
                process.env['VSCODE_APPDATA'] = appDataDir;
                const path = (0, userDataPath_1.getUserDataPath)((0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS), product_1.default.nameShort);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQYXRoLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9lbnZpcm9ubWVudC90ZXN0L25vZGUvdXNlckRhdGFQYXRoLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtRQUU1QixJQUFJLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxHQUFHLElBQUEsOEJBQWUsRUFBQyxJQUFBLGdCQUFTLEVBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxjQUFPLENBQUMsRUFBRSxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7WUFDNUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3BELElBQUk7Z0JBQ0gsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO2dCQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsV0FBVyxDQUFDO2dCQUU3QyxNQUFNLElBQUksR0FBRyxJQUFBLDhCQUFlLEVBQUMsSUFBQSxnQkFBUyxFQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsY0FBTyxDQUFDLEVBQUUsaUJBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEYsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDdEM7b0JBQVM7Z0JBQ1QsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7b0JBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsR0FBRyxZQUFZLENBQUM7aUJBQzlDO3FCQUFNO29CQUNOLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lCQUN0QzthQUNEO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO1lBQzlDLE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQztZQUN0QyxNQUFNLElBQUksR0FBRyxJQUFBLGdCQUFTLEVBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxjQUFPLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsY0FBYyxDQUFDO1lBRXZDLE1BQU0sSUFBSSxHQUFHLElBQUEsOEJBQWUsRUFBQyxJQUFJLEVBQUUsaUJBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7WUFDN0MsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xELElBQUk7Z0JBQ0gsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDO2dCQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsVUFBVSxDQUFDO2dCQUUzQyxNQUFNLElBQUksR0FBRyxJQUFBLDhCQUFlLEVBQUMsSUFBQSxnQkFBUyxFQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsY0FBTyxDQUFDLEVBQUUsaUJBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEYsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7YUFDckM7b0JBQVM7Z0JBQ1QsSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLEVBQUU7b0JBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxXQUFXLENBQUM7aUJBQzVDO3FCQUFNO29CQUNOLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUNyQzthQUNEO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9