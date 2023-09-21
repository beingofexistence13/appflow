/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/browser/workbenchTestServices", "vs/editor/common/core/range", "vs/workbench/contrib/comments/browser/commentsView", "vs/workbench/contrib/comments/browser/commentService", "vs/base/common/event", "vs/workbench/common/views", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, workbenchTestServices_1, range_1, commentsView_1, commentService_1, event_1, views_1, configuration_1, testConfigurationService_1, contextView_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestViewDescriptorService = void 0;
    class TestCommentThread {
        isDocumentCommentThread() {
            return true;
        }
        constructor(commentThreadHandle, controllerHandle, threadId, resource, range, comments) {
            this.commentThreadHandle = commentThreadHandle;
            this.controllerHandle = controllerHandle;
            this.threadId = threadId;
            this.resource = resource;
            this.range = range;
            this.comments = comments;
            this.onDidChangeComments = new event_1.Emitter().event;
            this.onDidChangeInitialCollapsibleState = new event_1.Emitter().event;
            this.canReply = false;
            this.onDidChangeInput = new event_1.Emitter().event;
            this.onDidChangeRange = new event_1.Emitter().event;
            this.onDidChangeLabel = new event_1.Emitter().event;
            this.onDidChangeCollapsibleState = new event_1.Emitter().event;
            this.onDidChangeState = new event_1.Emitter().event;
            this.onDidChangeCanReply = new event_1.Emitter().event;
            this.isDisposed = false;
            this.isTemplate = false;
            this.label = undefined;
            this.contextValue = undefined;
        }
    }
    class TestViewDescriptorService {
        constructor() {
            this.onDidChangeLocation = new event_1.Emitter().event;
        }
        getViewLocationById(id) {
            return 1 /* ViewContainerLocation.Panel */;
        }
        getViewDescriptorById(id) {
            return null;
        }
        getViewContainerByViewId(id) {
            return {
                id: 'comments',
                title: { value: 'Comments', original: 'Comments' },
                ctorDescriptor: {}
            };
        }
        getViewContainerModel(viewContainer) {
            const partialViewContainerModel = {
                onDidChangeContainerInfo: new event_1.Emitter().event
            };
            return partialViewContainerModel;
        }
        getDefaultContainerById(id) {
            return null;
        }
    }
    exports.TestViewDescriptorService = TestViewDescriptorService;
    suite('Comments View', function () {
        teardown(() => {
            instantiationService.dispose();
            commentService.dispose();
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let disposables;
        let instantiationService;
        let commentService;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({}, disposables);
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            instantiationService.stub(contextView_1.IContextViewService, {});
            instantiationService.stub(views_1.IViewDescriptorService, new TestViewDescriptorService());
            commentService = instantiationService.createInstance(commentService_1.CommentService);
            instantiationService.stub(commentService_1.ICommentService, commentService);
        });
        test('collapse all', async function () {
            const view = instantiationService.createInstance(commentsView_1.CommentsPanel, { id: 'comments', title: 'Comments' });
            view.render();
            commentService.setWorkspaceComments('test', [
                new TestCommentThread(1, 1, '1', 'test1', new range_1.Range(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
                new TestCommentThread(2, 1, '1', 'test2', new range_1.Range(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
            ]);
            assert.strictEqual(view.getFilterStats().total, 2);
            assert.strictEqual(view.areAllCommentsExpanded(), true);
            view.collapseAll();
            assert.strictEqual(view.isSomeCommentsExpanded(), false);
            view.dispose();
        });
        test('expand all', async function () {
            const view = instantiationService.createInstance(commentsView_1.CommentsPanel, { id: 'comments', title: 'Comments' });
            view.render();
            commentService.setWorkspaceComments('test', [
                new TestCommentThread(1, 1, '1', 'test1', new range_1.Range(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
                new TestCommentThread(2, 1, '1', 'test2', new range_1.Range(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
            ]);
            assert.strictEqual(view.getFilterStats().total, 2);
            view.collapseAll();
            assert.strictEqual(view.isSomeCommentsExpanded(), false);
            view.expandAll();
            assert.strictEqual(view.areAllCommentsExpanded(), true);
            view.dispose();
        });
        test('filter by text', async function () {
            const view = instantiationService.createInstance(commentsView_1.CommentsPanel, { id: 'comments', title: 'Comments' });
            view.setVisible(true);
            view.render();
            commentService.setWorkspaceComments('test', [
                new TestCommentThread(1, 1, '1', 'test1', new range_1.Range(1, 1, 1, 1), [{ body: 'This comment is a cat.', uniqueIdInThread: 1, userName: 'alex' }]),
                new TestCommentThread(2, 1, '1', 'test2', new range_1.Range(1, 1, 1, 1), [{ body: 'This comment is a dog.', uniqueIdInThread: 1, userName: 'alex' }]),
            ]);
            assert.strictEqual(view.getFilterStats().total, 2);
            assert.strictEqual(view.getFilterStats().filtered, 2);
            view.getFilterWidget().setFilterText('cat');
            // Setting showResolved causes the filter to trigger for the purposes of this test.
            view.filters.showResolved = false;
            assert.strictEqual(view.getFilterStats().total, 2);
            assert.strictEqual(view.getFilterStats().filtered, 1);
            view.clearFilterText();
            // Setting showResolved causes the filter to trigger for the purposes of this test.
            view.filters.showResolved = true;
            assert.strictEqual(view.getFilterStats().total, 2);
            assert.strictEqual(view.getFilterStats().filtered, 2);
            view.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNWaWV3LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy90ZXN0L2Jyb3dzZXIvY29tbWVudHNWaWV3LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFNLGlCQUFpQjtRQUN0Qix1QkFBdUI7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsWUFBNEIsbUJBQTJCLEVBQ3RDLGdCQUF3QixFQUN4QixRQUFnQixFQUNoQixRQUFnQixFQUNoQixLQUFhLEVBQ2IsUUFBbUI7WUFMUix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQVE7WUFDdEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFRO1lBQ3hCLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNoQixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsYUFBUSxHQUFSLFFBQVEsQ0FBVztZQUVwQyx3QkFBbUIsR0FBMEMsSUFBSSxlQUFPLEVBQWtDLENBQUMsS0FBSyxDQUFDO1lBQ2pILHVDQUFrQyxHQUFxRCxJQUFJLGVBQU8sRUFBNkMsQ0FBQyxLQUFLLENBQUM7WUFDdEosYUFBUSxHQUFZLEtBQUssQ0FBQztZQUMxQixxQkFBZ0IsR0FBb0MsSUFBSSxlQUFPLEVBQTRCLENBQUMsS0FBSyxDQUFDO1lBQ2xHLHFCQUFnQixHQUFrQixJQUFJLGVBQU8sRUFBVSxDQUFDLEtBQUssQ0FBQztZQUM5RCxxQkFBZ0IsR0FBOEIsSUFBSSxlQUFPLEVBQXNCLENBQUMsS0FBSyxDQUFDO1lBQ3RGLGdDQUEyQixHQUFxRCxJQUFJLGVBQU8sRUFBNkMsQ0FBQyxLQUFLLENBQUM7WUFDL0kscUJBQWdCLEdBQTBDLElBQUksZUFBTyxFQUFrQyxDQUFDLEtBQUssQ0FBQztZQUM5Ryx3QkFBbUIs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