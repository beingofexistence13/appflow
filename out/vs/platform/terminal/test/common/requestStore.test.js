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
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(log_1.ILogService, new logService_1.LogService(new log_1.ConsoleLogger()));
        });
        teardown(() => {
            instantiationService.dispose();
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('should resolve requests', async () => {
            const store = disposables.add(instantiationService.createInstance((requestStore_1.RequestStore), undefined));
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
            const store = disposables.add(instantiationService.createInstance((requestStore_1.RequestStore), 1));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdFN0b3JlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC90ZXN0L2NvbW1vbi9yZXF1ZXN0U3RvcmUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtRQUMxQixJQUFJLFdBQTRCLENBQUM7UUFDakMsSUFBSSxvQkFBOEMsQ0FBQztRQUVuRCxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3BDLG9CQUFvQixHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUN0RCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaUJBQVcsRUFBRSxJQUFJLHVCQUFVLENBQUMsSUFBSSxtQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQy9CLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDMUMsTUFBTSxLQUFLLEdBQW9ELFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUEsMkJBQStDLENBQUEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2hMLElBQUksU0FBeUQsQ0FBQztZQUM5RCxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDcEQsSUFBQSxvQkFBVyxFQUFDLE9BQU8sU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRCxJQUFBLG9CQUFXLEVBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN6RCxNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQztZQUM3QixJQUFBLG9CQUFXLEVBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxzREFBc0QsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN2RSxNQUFNLEtBQUssR0FBb0QsV0FBVyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQSwyQkFBK0MsQ0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEssTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNsQixJQUFJO2dCQUNILE1BQU0sT0FBTyxDQUFDO2FBQ2Q7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxLQUFLLEdBQUcsSUFBSSxDQUFDO2FBQ2I7WUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLElBQUEsYUFBSSxHQUFFLENBQUM7YUFDUDtRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==