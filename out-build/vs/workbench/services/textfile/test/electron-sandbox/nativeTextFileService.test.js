/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/files/common/files", "vs/base/common/network", "vs/platform/instantiation/common/serviceCollection", "vs/base/common/lifecycle", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/workbench/test/electron-sandbox/workbenchTestServices", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/base/test/common/utils"], function (require, exports, assert, files_1, network_1, serviceCollection_1, lifecycle_1, fileService_1, log_1, workbenchTestServices_1, workingCopyFileService_1, workingCopyService_1, uriIdentityService_1, inMemoryFilesystemProvider_1, textFileEditorModel_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - NativeTextFileService', function () {
        const disposables = new lifecycle_1.$jc();
        let service;
        let instantiationService;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$zfc)(undefined, disposables);
            const logService = new log_1.$fj();
            const fileService = disposables.add(new fileService_1.$Dp(logService));
            const fileProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(network_1.Schemas.file, fileProvider));
            const collection = new serviceCollection_1.$zh();
            collection.set(files_1.$6j, fileService);
            collection.set(workingCopyFileService_1.$HD, disposables.add(new workingCopyFileService_1.$ID(fileService, disposables.add(new workingCopyService_1.$UC()), instantiationService, disposables.add(new uriIdentityService_1.$pr(fileService)))));
            service = disposables.add(instantiationService.createChild(collection).createInstance(workbenchTestServices_1.$Bfc));
            disposables.add(service.files);
        });
        teardown(() => {
            disposables.clear();
        });
        test('shutdown joins on pending saves', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.$Hyb, utils_1.$0S.call(this, '/path/index_async.txt'), 'utf8', undefined));
            await model.resolve();
            let pendingSaveAwaited = false;
            model.save().then(() => pendingSaveAwaited = true);
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$Afc);
            accessor.lifecycleService.fireShutdown();
            assert.ok(accessor.lifecycleService.shutdownJoiners.length > 0);
            await Promise.all(accessor.lifecycleService.shutdownJoiners);
            assert.strictEqual(pendingSaveAwaited, true);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=nativeTextFileService.test.js.map