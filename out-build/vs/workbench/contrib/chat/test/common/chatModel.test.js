/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/test/common/utils", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/services/extensions/common/extensions", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, async_1, utils_1, instantiationServiceMock_1, log_1, storage_1, chatAgents_1, chatModel_1, extensions_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ChatModel', () => {
        const testDisposables = (0, utils_1.$bT)();
        let instantiationService;
        setup(async () => {
            instantiationService = testDisposables.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(storage_1.$Vo, testDisposables.add(new workbenchTestServices_1.$7dc()));
            instantiationService.stub(log_1.$5i, new log_1.$fj());
            instantiationService.stub(extensions_1.$MF, new workbenchTestServices_1.$aec());
            instantiationService.stub(chatAgents_1.$rH, testDisposables.add(instantiationService.createInstance(chatAgents_1.$sH)));
        });
        test('Waits for initialization', async () => {
            const model = testDisposables.add(instantiationService.createInstance(chatModel_1.$AH, 'provider', undefined));
            let hasInitialized = false;
            model.waitForInitialization().then(() => {
                hasInitialized = true;
            });
            await (0, async_1.$Hg)(0);
            assert.strictEqual(hasInitialized, false);
            model.initialize({}, undefined);
            await (0, async_1.$Hg)(0);
            assert.strictEqual(hasInitialized, true);
        });
        test('Initialization fails when model is disposed', async () => {
            const model = testDisposables.add(instantiationService.createInstance(chatModel_1.$AH, 'provider', undefined));
            model.dispose();
            await assert.rejects(() => model.waitForInitialization());
        });
    });
});
//# sourceMappingURL=chatModel.test.js.map