/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/checksum/node/checksumService", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/log/common/log"], function (require, exports, assert, network_1, uri_1, utils_1, checksumService_1, fileService_1, diskFileSystemProvider_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Checksum Service', () => {
        let diskFileSystemProvider;
        let fileService;
        setup(() => {
            const logService = new log_1.$fj();
            fileService = new fileService_1.$Dp(logService);
            diskFileSystemProvider = new diskFileSystemProvider_1.$3p(logService);
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
        });
        teardown(() => {
            diskFileSystemProvider.dispose();
            fileService.dispose();
        });
        test('checksum', async () => {
            const checksumService = new checksumService_1.$R7b(fileService);
            const checksum = await checksumService.checksum(uri_1.URI.file(network_1.$2f.asFileUri('vs/platform/checksum/test/node/fixtures/lorem.txt').fsPath));
            assert.ok(checksum === '8mi5KF8kcb817zmlal1kZA' || checksum === 'DnUKbJ1bHPPNZoHgHV25sg'); // depends on line endings git config
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=checksumService.test.js.map