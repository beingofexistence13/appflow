/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/log/common/log", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/base/common/lifecycle", "vs/platform/instantiation/common/serviceCollection", "vs/platform/files/common/files", "vs/base/common/uri", "vs/base/common/path", "vs/workbench/services/textfile/common/encoding", "vs/base/common/buffer", "vs/workbench/services/textfile/test/common/fixtures/files", "vs/workbench/services/textfile/test/common/textFileService.io.test", "vs/base/common/platform", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/utils"], function (require, exports, workbenchTestServices_1, log_1, fileService_1, network_1, lifecycle_1, serviceCollection_1, files_1, uri_1, path_1, encoding_1, buffer_1, files_2, textFileService_io_test_1, platform_1, workingCopyFileService_1, workingCopyService_1, uriIdentityService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // optimization: we don't need to run this suite in native environment,
    // because we have nativeTextFileService.io.test.ts for it,
    // so our tests run faster
    if (platform_1.isWeb) {
        suite('Files - BrowserTextFileService i/o', function () {
            const disposables = new lifecycle_1.DisposableStore();
            let service;
            let fileProvider;
            const testDir = 'test';
            (0, textFileService_io_test_1.default)({
                setup: async () => {
                    const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
                    const logService = new log_1.NullLogService();
                    const fileService = disposables.add(new fileService_1.FileService(logService));
                    fileProvider = disposables.add(new workbenchTestServices_1.TestInMemoryFileSystemProvider());
                    disposables.add(fileService.registerProvider(network_1.Schemas.file, fileProvider));
                    const collection = new serviceCollection_1.ServiceCollection();
                    collection.set(files_1.IFileService, fileService);
                    collection.set(workingCopyFileService_1.IWorkingCopyFileService, disposables.add(new workingCopyFileService_1.WorkingCopyFileService(fileService, disposables.add(new workingCopyService_1.WorkingCopyService()), instantiationService, disposables.add(new uriIdentityService_1.UriIdentityService(fileService)))));
                    service = disposables.add(instantiationService.createChild(collection).createInstance(workbenchTestServices_1.TestBrowserTextFileServiceWithEncodingOverrides));
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
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlclRleHRGaWxlU2VydmljZS5pby50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRmaWxlL3Rlc3QvYnJvd3Nlci9icm93c2VyVGV4dEZpbGVTZXJ2aWNlLmlvLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUF1QmhHLHVFQUF1RTtJQUN2RSwyREFBMkQ7SUFDM0QsMEJBQTBCO0lBQzFCLElBQUksZ0JBQUssRUFBRTtRQUNWLEtBQUssQ0FBQyxvQ0FBb0MsRUFBRTtZQUMzQyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUUxQyxJQUFJLE9BQXlCLENBQUM7WUFDOUIsSUFBSSxZQUE0QyxDQUFDO1lBQ2pELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUV2QixJQUFBLGlDQUFXLEVBQUM7Z0JBQ1gsS0FBSyxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUNqQixNQUFNLG9CQUFvQixHQUFHLElBQUEscURBQTZCLEVBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUVuRixNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFjLEVBQUUsQ0FBQztvQkFDeEMsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHlCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFFakUsWUFBWSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxzREFBOEIsRUFBRSxDQUFDLENBQUM7b0JBQ3JFLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLGlCQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBRTFFLE1BQU0sVUFBVSxHQUFHLElBQUkscUNBQWlCLEVBQUUsQ0FBQztvQkFDM0MsVUFBVSxDQUFDLEdBQUcs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