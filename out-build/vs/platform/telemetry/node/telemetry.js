/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/node/pfs"], function (require, exports, path_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J7b = void 0;
    async function $J7b(appRoot, extensionsPath) {
        const mergedTelemetry = Object.create(null);
        // Simple function to merge the telemetry into one json object
        const mergeTelemetry = (contents, dirName) => {
            const telemetryData = JSON.parse(contents);
            mergedTelemetry[dirName] = telemetryData;
        };
        if (extensionsPath) {
            const dirs = [];
            const files = await pfs_1.Promises.readdir(extensionsPath);
            for (const file of files) {
                try {
                    const fileStat = await pfs_1.Promises.stat((0, path_1.$9d)(extensionsPath, file));
                    if (fileStat.isDirectory()) {
                        dirs.push(file);
                    }
                }
                catch {
                    // This handles case where broken symbolic links can cause statSync to throw and error
                }
            }
            const telemetryJsonFolders = [];
            for (const dir of dirs) {
                const files = (await pfs_1.Promises.readdir((0, path_1.$9d)(extensionsPath, dir))).filter(file => file === 'telemetry.json');
                if (files.length === 1) {
                    telemetryJsonFolders.push(dir); // // We know it contains a telemetry.json file so we add it to the list of folders which have one
                }
            }
            for (const folder of telemetryJsonFolders) {
                const contents = (await pfs_1.Promises.readFile((0, path_1.$9d)(extensionsPath, folder, 'telemetry.json'))).toString();
                mergeTelemetry(contents, folder);
            }
        }
        let contents = (await pfs_1.Promises.readFile((0, path_1.$9d)(appRoot, 'telemetry-core.json'))).toString();
        mergeTelemetry(contents, 'vscode-core');
        contents = (await pfs_1.Promises.readFile((0, path_1.$9d)(appRoot, 'telemetry-extensions.json'))).toString();
        mergeTelemetry(contents, 'vscode-extensions');
        return JSON.stringify(mergedTelemetry, null, 4);
    }
    exports.$J7b = $J7b;
});
//# sourceMappingURL=telemetry.js.map