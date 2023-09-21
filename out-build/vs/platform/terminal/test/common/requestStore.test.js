/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/log/common/logService", "vs/platform/terminal/common/requestStore"], function (require, exports, assert_1, lifecycle_1, utils_1, instantiationServiceMock_1, log_1, logService_1, requestStore_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('RequestStore', () => {
        let disposables;
        let instantiationService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = new instantiationServiceMock_1.$L0b();
            instantiationService.stub(log_1.$5i, new logService_1.$mN(new log_1.$aj()));
        });
        teardown(() => {
            instantiationService.dispose();
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('should resolve requests', async () => {
            const store = disposables.add(instantiationService.createInstance((requestStore_1.$4q), undefined));
            let eventArgs;
            disposables.add(store.onCreateRequest(e => eventArgs = e));
            const request = store.createRequest({ arg: 'foo' });
            (0, assert_1.strictEqual)(typeof eventArgs?.requestId, 'number');
            (0, assert_1.strictEqual)(eventArgs?.arg, 'foo');
            store.acceptReply(eventArgs.requestId, { data: 'bar' });
            const result = await request;
            (0, assert_1.strictEqual)(result.data, 'bar');
        });
        test('should reject the promise when the request times out', async () => {
            const store = disposables.add(instantiationService.createInstance((requestStore_1.$4q), 1));
            const request = store.createRequest({ arg: 'foo' });
            let threw = false;
            try {
                await request;
            }
            catch (e) {
                threw = true;
            }
            if (!threw) {
                (0, assert_1.fail)();
            }
        });
    });
});
//# sourceMappingURL=requestStore.test.js.map