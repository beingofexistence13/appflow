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
            const logService = new log_1.NullLogService();
            fileService = new fileService_1.FileService(logService);
            diskFileSystemProvider = new diskFileSystemProvider_1.DiskFileSystemProvider(logService);
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
        });
        teardown(() => {
            diskFileSystemProvider.dispose();
            fileService.dispose();
        });
        test('checksum', async () => {
            const checksumService = new checksumService_1.ChecksumService(fileService);
            const checksum = await checksumService.checksum(uri_1.URI.file(network_1.FileAccess.asFileUri('vs/platform/checksum/test/node/fixtures/lorem.txt').fsPath));
            assert.ok(checksum === '8mi5KF8kcb817zmlal1kZA' || checksum === 'DnUKbJ1bHPPNZoHgHV25sg'); // depends on line endings git config
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tzdW1TZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9jaGVja3N1bS90ZXN0L25vZGUvY2hlY2tzdW1TZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUU5QixJQUFJLHNCQUE4QyxDQUFDO1FBQ25ELElBQUksV0FBeUIsQ0FBQztRQUU5QixLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBYyxFQUFFLENBQUM7WUFDeEMsV0FBVyxHQUFHLElBQUkseUJBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUxQyxzQkFBc0IsR0FBRyxJQUFJLCtDQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hFLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDM0IsTUFBTSxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXpELE1BQU0sUUFBUSxHQUFHLE1BQU0sZUFBZSxDQUFDLFFBQVEsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLG1EQUFtRCxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1SSxNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsS0FBSyx3QkFBd0IsSUFBSSxRQUFRLEtBQUssd0JBQXdCLENBQUMsQ0FBQyxDQUFDLHFDQUFxQztRQUNqSSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQyJ9