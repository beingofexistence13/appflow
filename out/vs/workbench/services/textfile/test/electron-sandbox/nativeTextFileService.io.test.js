/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/base/common/lifecycle", "vs/platform/instantiation/common/serviceCollection", "vs/platform/files/common/files", "vs/base/common/uri", "vs/base/common/path", "vs/workbench/services/textfile/common/encoding", "vs/base/common/buffer", "vs/workbench/services/textfile/test/common/fixtures/files", "vs/workbench/services/textfile/test/common/textFileService.io.test", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/electron-sandbox/workbenchTestServices", "vs/base/test/common/utils"], function (require, exports, log_1, fileService_1, network_1, lifecycle_1, serviceCollection_1, files_1, uri_1, path_1, encoding_1, buffer_1, files_2, textFileService_io_test_1, workingCopyFileService_1, workingCopyService_1, uriIdentityService_1, workbenchTestServices_1, workbenchTestServices_2, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - NativeTextFileService i/o', function () {
        const disposables = new lifecycle_1.DisposableStore();
        let service;
        let fileProvider;
        const testDir = 'test';
        (0, textFileService_io_test_1.default)({
            setup: async () => {
                const instantiationService = (0, workbenchTestServices_2.workbenchInstantiationService)(undefined, disposables);
                const logService = new log_1.NullLogService();
                const fileService = disposables.add(new fileService_1.FileService(logService));
                fileProvider = disposables.add(new workbenchTestServices_1.TestInMemoryFileSystemProvider());
                disposables.add(fileService.registerProvider(network_1.Schemas.file, fileProvider));
                const collection = new serviceCollection_1.ServiceCollection();
                collection.set(files_1.IFileService, fileService);
                collection.set(workingCopyFileService_1.IWorkingCopyFileService, disposables.add(new workingCopyFileService_1.WorkingCopyFileService(fileService, disposables.add(new workingCopyService_1.WorkingCopyService()), instantiationService, disposables.add(new uriIdentityService_1.UriIdentityService(fileService)))));
                service = disposables.add(instantiationService.createChild(collection).createInstance(workbenchTestServices_2.TestNativeTextFileServiceWithEncodingOverrides));
                disposables.add(service.files);
                await fileProvider.mkdir(uri_1.URI.file(testDir));
                for (const fileName in files_2.default) {
                    await fileProvider.writeFile(uri_1.URI.file((0, path_1.join)(testDir, fileName)), files_2.default[fileName], { create: true, overwrite: false, unlock: false, atomic: false });
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
                return buffer_1.VSBuffer.wrap(file);
            }
            return new TextDecoder((0, encoding_1.toCanonicalName)(encoding)).decode(file);
        }
        async function stat(fsPath) {
            return fileProvider.stat(uri_1.URI.file(fsPath));
        }
        async function detectEncodingByBOM(fsPath) {
            try {
                const buffer = await readFile(fsPath);
                return (0, encoding_1.detectEncodingByBOMFromBuffer)(buffer.slice(0, 3), 3);
            }
            catch (error) {
                return null; // ignore errors (like file not found)
            }
        }
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlVGV4dEZpbGVTZXJ2aWNlLmlvLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dGZpbGUvdGVzdC9lbGVjdHJvbi1zYW5kYm94L25hdGl2ZVRleHRGaWxlU2VydmljZS5pby50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBdUJoRyxLQUFLLENBQUMsbUNBQW1DLEVBQUU7UUFDMUMsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFFMUMsSUFBSSxPQUF5QixDQUFDO1FBQzlCLElBQUksWUFBNEMsQ0FBQztRQUNqRCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFFdkIsSUFBQSxpQ0FBVyxFQUFDO1lBQ1gsS0FBSyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNqQixNQUFNLG9CQUFvQixHQUFHLElBQUEscURBQTZCLEVBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFjLEVBQUUsQ0FBQztnQkFDeEMsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHlCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFFakUsWUFBWSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxzREFBOEIsRUFBRSxDQUFDLENBQUM7Z0JBQ3JFLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLGlCQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBRTFFLE1BQU0sVUFBVSxHQUFHLElBQUkscUNBQWlCLEVBQUUsQ0FBQztnQkFDM0MsVUFBVSxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMxQyxVQUFVLENBQUMsR0FBRyxD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