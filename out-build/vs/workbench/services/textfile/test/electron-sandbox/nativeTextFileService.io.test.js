/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/base/common/lifecycle", "vs/platform/instantiation/common/serviceCollection", "vs/platform/files/common/files", "vs/base/common/uri", "vs/base/common/path", "vs/workbench/services/textfile/common/encoding", "vs/base/common/buffer", "vs/workbench/services/textfile/test/common/fixtures/files", "vs/workbench/services/textfile/test/common/textFileService.io.test", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/electron-sandbox/workbenchTestServices", "vs/base/test/common/utils"], function (require, exports, log_1, fileService_1, network_1, lifecycle_1, serviceCollection_1, files_1, uri_1, path_1, encoding_1, buffer_1, files_2, textFileService_io_test_1, workingCopyFileService_1, workingCopyService_1, uriIdentityService_1, workbenchTestServices_1, workbenchTestServices_2, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - NativeTextFileService i/o', function () {
        const disposables = new lifecycle_1.$jc();
        let service;
        let fileProvider;
        const testDir = 'test';
        (0, textFileService_io_test_1.default)({
            setup: async () => {
                const instantiationService = (0, workbenchTestServices_2.$zfc)(undefined, disposables);
                const logService = new log_1.$fj();
                const fileService = disposables.add(new fileService_1.$Dp(logService));
                fileProvider = disposables.add(new workbenchTestServices_1.$Pec());
                disposables.add(fileService.registerProvider(network_1.Schemas.file, fileProvider));
                const collection = new serviceCollection_1.$zh();
                collection.set(files_1.$6j, fileService);
                collection.set(workingCopyFileService_1.$HD, disposables.add(new workingCopyFileService_1.$ID(fileService, disposables.add(new workingCopyService_1.$UC()), instantiationService, disposables.add(new uriIdentityService_1.$pr(fileService)))));
                service = disposables.add(instantiationService.createChild(collection).createInstance(workbenchTestServices_2.$Bfc));
                disposables.add(service.files);
                await fileProvider.mkdir(uri_1.URI.file(testDir));
                for (const fileName in files_2.default) {
                    await fileProvider.writeFile(uri_1.URI.file((0, path_1.$9d)(testDir, fileName)), files_2.default[fileName], { create: true, overwrite: false, unlock: false, atomic: false });
                }
                return { service, testDir };
            },
            teardown: async () => {
                disposables.clear();
            },
            exists,
            stat,
            readFile,
            detectEncodingByBOM
        });
        async function exists(fsPath) {
            try {
                await fileProvider.readFile(uri_1.URI.file(fsPath));
                return true;
            }
            catch (e) {
                return false;
            }
        }
        async function readFile(fsPath, encoding) {
            const file = await fileProvider.readFile(uri_1.URI.file(fsPath));
            if (!encoding) {
                return buffer_1.$Fd.wrap(file);
            }
            return new TextDecoder((0, encoding_1.$pD)(encoding)).decode(file);
        }
        async function stat(fsPath) {
            return fileProvider.stat(uri_1.URI.file(fsPath));
        }
        async function detectEncodingByBOM(fsPath) {
            try {
                const buffer = await readFile(fsPath);
                return (0, encoding_1.$oD)(buffer.slice(0, 3), 3);
            }
            catch (error) {
                return null; // ignore errors (like file not found)
            }
        }
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=nativeTextFileService.io.test.js.map