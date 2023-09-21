/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/node/pfs"], function (require, exports, path_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildTelemetryMessage = void 0;
    async function buildTelemetryMessage(appRoot, extensionsPath) {
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
                    const fileStat = await pfs_1.Promises.stat((0, path_1.join)(extensionsPath, file));
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
                const files = (await pfs_1.Promises.readdir((0, path_1.join)(extensionsPath, dir))).filter(file => file === 'telemetry.json');
                if (files.length === 1) {
                    telemetryJsonFolders.push(dir); // // We know it contains a telemetry.json file so we add it to the list of folders which have one
                }
            }
            for (const folder of telemetryJsonFolders) {
                const contents = (await pfs_1.Promises.readFile((0, path_1.join)(extensionsPath, folder, 'telemetry.json'))).toString();
                mergeTelemetry(contents, folder);
            }
        }
        let contents = (await pfs_1.Promises.readFile((0, path_1.join)(appRoot, 'telemetry-core.json'))).toString();
        mergeTelemetry(contents, 'vscode-core');
        contents = (await pfs_1.Promises.readFile((0, path_1.join)(appRoot, 'telemetry-extensions.json'))).toString();
        mergeTelemetry(contents, 'vscode-extensions');
        return JSON.stringify(mergedTelemetry, null, 4);
    }
    exports.buildTelemetryMessage = buildTelemetryMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVsZW1ldHJ5L25vZGUvdGVsZW1ldHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUt6RixLQUFLLFVBQVUscUJBQXFCLENBQUMsT0FBZSxFQUFFLGNBQXVCO1FBQ25GLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUMsOERBQThEO1FBQzlELE1BQU0sY0FBYyxHQUFHLENBQUMsUUFBZ0IsRUFBRSxPQUFlLEVBQUUsRUFBRTtZQUM1RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxhQUFhLENBQUM7UUFDMUMsQ0FBQyxDQUFDO1FBRUYsSUFBSSxjQUFjLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEdBQWEsRUFBRSxDQUFDO1lBRTFCLE1BQU0sS0FBSyxHQUFHLE1BQU0sY0FBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNyRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsSUFBSTtvQkFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLGNBQVEsQ0FBQyxJQUFJLENBQUMsSUFBQSxXQUFJLEVBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2pFLElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFO3dCQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNoQjtpQkFDRDtnQkFBQyxNQUFNO29CQUNQLHNGQUFzRjtpQkFDdEY7YUFDRDtZQUVELE1BQU0sb0JBQW9CLEdBQWEsRUFBRSxDQUFDO1lBQzFDLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sY0FBUSxDQUFDLE9BQU8sQ0FBQyxJQUFBLFdBQUksRUFBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUM1RyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN2QixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxrR0FBa0c7aUJBQ2xJO2FBQ0Q7WUFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLG9CQUFvQixFQUFFO2dCQUMxQyxNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQU0sY0FBUSxDQUFDLFFBQVEsQ0FBQyxJQUFBLFdBQUksRUFBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0RyxjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ2pDO1NBQ0Q7UUFFRCxJQUFJLFFBQVEsR0FBRyxDQUFDLE1BQU0sY0FBUSxDQUFDLFFBQVEsQ0FBQyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUYsY0FBYyxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUV4QyxRQUFRLEdBQUcsQ0FBQyxNQUFNLGNBQVEsQ0FBQyxRQUFRLENBQUMsSUFBQSxXQUFJLEVBQUMsT0FBTyxFQUFFLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzVGLGNBQWMsQ0FBQyxRQUFRLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUU5QyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBN0NELHNEQTZDQyJ9