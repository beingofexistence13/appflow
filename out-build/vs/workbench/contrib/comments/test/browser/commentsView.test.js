/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/browser/workbenchTestServices", "vs/editor/common/core/range", "vs/workbench/contrib/comments/browser/commentsView", "vs/workbench/contrib/comments/browser/commentService", "vs/base/common/event", "vs/workbench/common/views", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, workbenchTestServices_1, range_1, commentsView_1, commentService_1, event_1, views_1, configuration_1, testConfigurationService_1, contextView_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nfc = void 0;
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
            this.onDidChangeComments = new event_1.$fd().event;
            this.onDidChangeInitialCollapsibleState = new event_1.$fd().event;
            this.canReply = false;
            this.onDidChangeInput = new event_1.$fd().event;
            this.onDidChangeRange = new event_1.$fd().event;
            this.onDidChangeLabel = new event_1.$fd().event;
            this.onDidChangeCollapsibleState = new event_1.$fd().event;
            this.onDidChangeState = new event_1.$fd().event;
            this.onDidChangeCanReply = new event_1.$fd().event;
            this.isDisposed = false;
            this.isTemplate = false;
            this.label = undefined;
            this.contextValue = undefined;
        }
    }
    class $nfc {
        constructor() {
            this.onDidChangeLocation = new event_1.$fd().event;
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
                onDidChangeContainerInfo: new event_1.$fd().event
            };
            return partialViewContainerModel;
        }
        getDefaultContainerById(id) {
            return null;
        }
    }
    exports.$nfc = $nfc;
    suite('Comments View', function () {
        teardown(() => {
            instantiationService.dispose();
            commentService.dispose();
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        let disposables;
        let instantiationService;
        let commentService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, workbenchTestServices_1.$lec)({}, disposables);
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
            instantiationService.stub(contextView_1.$VZ, {});
            instantiationService.stub(views_1.$_E, new $nfc());
            commentService = instantiationService.createInstance(commentService_1.$Jlb);
            instantiationService.stub(commentService_1.$Ilb, commentService);
        });
        test('collapse all', async function () {
            const view = instantiationService.createInstance(commentsView_1.$Mmb, { id: 'comments', title: 'Comments' });
            view.render();
            commentService.setWorkspaceComments('test', [
                new TestCommentThread(1, 1, '1', 'test1', new range_1.$ks(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
                new TestCommentThread(2, 1, '1', 'test2', new range_1.$ks(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
            ]);
            assert.strictEqual(view.getFilterStats().total, 2);
            assert.strictEqual(view.areAllCommentsExpanded(), true);
            view.collapseAll();
            assert.strictEqual(view.isSomeCommentsExpanded(), false);
            view.dispose();
        });
        test('expand all', async function () {
            const view = instantiationService.createInstance(commentsView_1.$Mmb, { id: 'comments', title: 'Comments' });
            view.render();
            commentService.setWorkspaceComments('test', [
                new TestCommentThread(1, 1, '1', 'test1', new range_1.$ks(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
                new TestCommentThread(2, 1, '1', 'test2', new range_1.$ks(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
            ]);
            assert.strictEqual(view.getFilterStats().total, 2);
            view.collapseAll();
            assert.strictEqual(view.isSomeCommentsExpanded(), false);
            view.expandAll();
            assert.strictEqual(view.areAllCommentsExpanded(), true);
            view.dispose();
        });
        test('filter by text', async function () {
            const view = instantiationService.createInstance(commentsView_1.$Mmb, { id: 'comments', title: 'Comments' });
            view.setVisible(true);
            view.render();
            commentService.setWorkspaceComments('test', [
                new TestCommentThread(1, 1, '1', 'test1', new range_1.$ks(1, 1, 1, 1), [{ body: 'This comment is a cat.', uniqueIdInThread: 1, userName: 'alex' }]),
                new TestCommentThread(2, 1, '1', 'test2', new range_1.$ks(1, 1, 1, 1), [{ body: 'This comment is a dog.', uniqueIdInThread: 1, userName: 'alex' }]),
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
//# sourceMappingURL=commentsView.test.js.map