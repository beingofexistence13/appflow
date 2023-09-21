/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/instantiation/common/descriptors", "vs/platform/log/common/log", "vs/platform/notification/test/common/testNotificationService", "vs/platform/registry/common/platform", "vs/workbench/api/browser/mainThreadTreeViews", "vs/workbench/browser/parts/views/treeView", "vs/workbench/common/views", "vs/workbench/services/views/browser/viewDescriptorService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, mock_1, utils_1, descriptors_1, log_1, testNotificationService_1, platform_1, mainThreadTreeViews_1, treeView_1, views_1, viewDescriptorService_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadHostTreeView', function () {
        const testTreeViewId = 'testTreeView';
        const customValue = 'customValue';
        const ViewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
        class MockExtHostTreeViewsShape extends (0, mock_1.mock)() {
            async $getChildren(treeViewId, treeItemHandle) {
                return [{ handle: 'testItem1', collapsibleState: views_1.TreeItemCollapsibleState.Expanded, customProp: customValue }];
            }
            async $hasResolve() {
                return false;
            }
            $setVisible() { }
        }
        let container;
        let mainThreadTreeViews;
        let extHostTreeViewsShape;
        teardown(() => {
            ViewsRegistry.deregisterViews(ViewsRegistry.getViews(container), container);
        });
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(async () => {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const viewDescriptorService = disposables.add(instantiationService.createInstance(viewDescriptorService_1.ViewDescriptorService));
            instantiationService.stub(views_1.IViewDescriptorService, viewDescriptorService);
            container = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({ id: 'testContainer', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const viewDescriptor = {
                id: testTreeViewId,
                ctorDescriptor: null,
                name: 'Test View 1',
                treeView: disposables.add(instantiationService.createInstance(treeView_1.CustomTreeView, 'testTree', 'Test Title', 'extension.id')),
            };
            ViewsRegistry.registerViews([viewDescriptor], container);
            const testExtensionService = new workbenchTestServices_2.TestExtensionService();
            extHostTreeViewsShape = new MockExtHostTreeViewsShape();
            mainThreadTreeViews = disposables.add(new mainThreadTreeViews_1.MainThreadTreeViews(new class {
                constructor() {
                    this.remoteAuthority = '';
                    this.extensionHostKind = 1 /* ExtensionHostKind.LocalProcess */;
                }
                dispose() { }
                assertRegistered() { }
                set(v) { return null; }
                getProxy() {
                    return extHostTreeViewsShape;
                }
                drain() { return null; }
            }, new workbenchTestServices_1.TestViewsService(), new testNotificationService_1.TestNotificationService(), testExtensionService, new log_1.NullLogService()));
            mainThreadTreeViews.$registerTreeViewDataProvider(testTreeViewId, { showCollapseAll: false, canSelectMany: false, dropMimeTypes: [], dragMimeTypes: [], hasHandleDrag: false, hasHandleDrop: false, manuallyManageCheckboxes: false });
            await testExtensionService.whenInstalledExtensionsRegistered();
        });
        test('getChildren keeps custom properties', async () => {
            const treeView = ViewsRegistry.getView(testTreeViewId).treeView;
            const children = await treeView.dataProvider?.getChildren({ handle: 'root', collapsibleState: views_1.TreeItemCollapsibleState.Expanded });
            assert(children.length === 1, 'Exactly one child should be returned');
            assert(children[0].customProp === customValue, 'Tree Items should keep custom properties');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFRyZWVWaWV3cy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvbWFpblRocmVhZFRyZWVWaWV3cy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBb0JoRyxLQUFLLENBQUMsd0JBQXdCLEVBQUU7UUFDL0IsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3RDLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQztRQUNsQyxNQUFNLGFBQWEsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsa0JBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQU01RSxNQUFNLHlCQUEwQixTQUFRLElBQUEsV0FBSSxHQUF5QjtZQUMzRCxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQWtCLEVBQUUsY0FBdUI7Z0JBQ3RFLE9BQU8sQ0FBaUIsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLGdDQUF3QixDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUNoSSxDQUFDO1lBRVEsS0FBSyxDQUFDLFdBQVc7Z0JBQ3pCLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVRLFdBQVcsS0FBVyxDQUFDO1NBQ2hDO1FBRUQsSUFBSSxTQUF3QixDQUFDO1FBQzdCLElBQUksbUJBQXdDLENBQUM7UUFDN0MsSUFBSSxxQkFBZ0QsQ0FBQztRQUVyRCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsYUFBYSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxXQUFXLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTlELEtBQUssQ0FBQyxLQUFLLElB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