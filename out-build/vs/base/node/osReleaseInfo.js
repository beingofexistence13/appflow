/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "fs/promises", "readline", "vs/base/common/platform"], function (require, exports, fs_1, promises_1, readline_1, Platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5f = void 0;
    async function $5f(errorLogger) {
        if (Platform.$j || Platform.$i) {
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
    exports.$5f = $5f;
});
//# sourceMappingURL=osReleaseInfo.js.map