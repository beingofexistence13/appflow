/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "fs/promises", "readline", "vs/base/common/platform"], function (require, exports, fs_1, promises_1, readline_1, Platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOSReleaseInfo = void 0;
    async function getOSReleaseInfo(errorLogger) {
        if (Platform.isMacintosh || Platform.isWindows) {
            return;
        }
        // Extract release information on linux based systems
        // using the identifiers specified in
        // https://www.freedesktop.org/software/systemd/man/os-release.html
        let handle;
        for (const filePath of ['/etc/os-release', '/usr/lib/os-release', '/etc/lsb-release']) {
            try {
                handle = await (0, promises_1.open)(filePath, fs_1.constants.R_OK);
                break;
            }
            catch (err) { }
        }
        if (!handle) {
            errorLogger('Unable to retrieve release information from known identifier paths.');
            return;
        }
        try {
            const osReleaseKeys = new Set([
                'ID',
                'DISTRIB_ID',
                'ID_LIKE',
                'VERSION_ID',
                'DISTRIB_RELEASE',
            ]);
            const releaseInfo = {
                id: 'unknown'
            };
            for await (const line of (0, readline_1.createInterface)({ input: handle.createReadStream(), crlfDelay: Infinity })) {
                if (!line.includes('=')) {
                    continue;
                }
                const key = line.split('=')[0].toUpperCase().trim();
                if (osReleaseKeys.has(key)) {
                    const value = line.split('=')[1].replace(/"/g, '').toLowerCase().trim();
                    if (key === 'ID' || key === 'DISTRIB_ID') {
                        releaseInfo.id = value;
                    }
                    else if (key === 'ID_LIKE') {
                        releaseInfo.id_like = value;
                    }
                    else if (key === 'VERSION_ID' || key === 'DISTRIB_RELEASE') {
                        releaseInfo.version_id = value;
                    }
                }
            }
            return releaseInfo;
        }
        catch (err) {
            errorLogger(err);
        }
        return;
    }
    exports.getOSReleaseInfo = getOSReleaseInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3NSZWxlYXNlSW5mby5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2Uvbm9kZS9vc1JlbGVhc2VJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWF6RixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsV0FBaUM7UUFDdkUsSUFBSSxRQUFRLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7WUFDL0MsT0FBTztTQUNQO1FBRUQscURBQXFEO1FBQ3JELHFDQUFxQztRQUNyQyxtRUFBbUU7UUFDbkUsSUFBSSxNQUE4QixDQUFDO1FBQ25DLEtBQUssTUFBTSxRQUFRLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO1lBQ3RGLElBQUk7Z0JBQ0gsTUFBTSxHQUFHLE1BQU0sSUFBQSxlQUFJLEVBQUMsUUFBUSxFQUFFLGNBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEQsTUFBTTthQUNOO1lBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRztTQUNqQjtRQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWixXQUFXLENBQUMscUVBQXFFLENBQUMsQ0FBQztZQUNuRixPQUFPO1NBQ1A7UUFFRCxJQUFJO1lBQ0gsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUM7Z0JBQzdCLElBQUk7Z0JBQ0osWUFBWTtnQkFDWixTQUFTO2dCQUNULFlBQVk7Z0JBQ1osaUJBQWlCO2FBQ2pCLENBQUMsQ0FBQztZQUNILE1BQU0sV0FBVyxHQUFnQjtnQkFDaEMsRUFBRSxFQUFFLFNBQVM7YUFDYixDQUFDO1lBRUYsSUFBSSxLQUFLLEVBQUUsTUFBTSxJQUFJLElBQUksSUFBQSwwQkFBUyxFQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFO2dCQUM5RixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDeEIsU0FBUztpQkFDVDtnQkFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwRCxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzNCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDeEUsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxZQUFZLEVBQUU7d0JBQ3pDLFdBQVcsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO3FCQUN2Qjt5QkFBTSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7d0JBQzdCLFdBQVcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO3FCQUM1Qjt5QkFBTSxJQUFJLEdBQUcsS0FBSyxZQUFZLElBQUksR0FBRyxLQUFLLGlCQUFpQixFQUFFO3dCQUM3RCxXQUFXLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztxQkFDL0I7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sV0FBVyxDQUFDO1NBQ25CO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDakI7UUFFRCxPQUFPO0lBQ1IsQ0FBQztJQXhERCw0Q0F3REMifQ==