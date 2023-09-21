/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/extensions/common/extensions", "sinon", "vs/workbench/contrib/notebook/browser/services/notebookRendererMessagingServiceImpl", "assert", "vs/base/common/async", "vs/base/test/common/utils"], function (require, exports, extensions_1, sinon_1, notebookRendererMessagingServiceImpl_1, assert, async_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookRendererMessaging', () => {
        let extService;
        let m;
        let sent = [];
        const ds = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            sent = [];
            extService = new extensions_1.NullExtensionService();
            m = ds.add(new notebookRendererMessagingServiceImpl_1.NotebookRendererMessagingService(extService));
            ds.add(m.onShouldPostMessage(e => sent.push(e)));
        });
        test('activates on prepare', () => {
            const activate = (0, sinon_1.stub)(extService, 'activateByEvent').returns(Promise.resolve());
            m.prepare('foo');
            m.prepare('foo');
            m.prepare('foo');
            assert.deepStrictEqual(activate.args, [['onRenderer:foo']]);
        });
        test('buffers and then plays events', async () => {
            (0, sinon_1.stub)(extService, 'activateByEvent').returns(Promise.resolve());
            const scoped = m.getScoped('some-editor');
            scoped.postMessage('foo', 1);
            scoped.postMessage('foo', 2);
            assert.deepStrictEqual(sent, []);
            await (0, async_1.timeout)(0);
            const expected = [
                { editorId: 'some-editor', rendererId: 'foo', message: 1 },
                { editorId: 'some-editor', rendererId: 'foo', message: 2 }
            ];
            assert.deepStrictEqual(sent, expected);
            scoped.postMessage('foo', 3);
            assert.deepStrictEqual(sent, [
                ...expected,
                { editorId: 'some-editor', rendererId: 'foo', message: 3 }
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tSZW5kZXJlck1lc3NhZ2luZ1NlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL3Rlc3QvYnJvd3Nlci9ub3RlYm9va1JlbmRlcmVyTWVzc2FnaW5nU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7UUFDdkMsSUFBSSxVQUFnQyxDQUFDO1FBQ3JDLElBQUksQ0FBbUMsQ0FBQztRQUN4QyxJQUFJLElBQUksR0FBYyxFQUFFLENBQUM7UUFFekIsTUFBTSxFQUFFLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXJELEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ1YsVUFBVSxHQUFHLElBQUksaUNBQW9CLEVBQUUsQ0FBQztZQUN4QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLHVFQUFnQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7WUFDakMsTUFBTSxRQUFRLEdBQUcsSUFBQSxZQUFJLEVBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQixDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWpCLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsK0JBQStCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDaEQsSUFBQSxZQUFJLEVBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRS9ELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFakMsTUFBTSxJQUFBLGVBQU8sRUFBQyxDQUFDLENBQUMsQ0FBQztZQUVqQixNQUFNLFFBQVEsR0FBRztnQkFDaEIsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtnQkFDMUQsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTthQUMxRCxDQUFDO1lBRUYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFdkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFN0IsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCLEdBQUcsUUFBUTtnQkFDWCxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO2FBQzFELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==