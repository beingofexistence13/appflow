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
        const ViewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
        class MockExtHostTreeViewsShape extends (0, mock_1.$rT)() {
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
        const disposables = (0, utils_1.$bT)();
        setup(async () => {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const viewDescriptorService = disposables.add(instantiationService.createInstance(viewDescriptorService_1.$xAb));
            instantiationService.stub(views_1.$_E, viewDescriptorService);
            container = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({ id: 'testContainer', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.$yh({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const viewDescriptor = {
                id: testTreeViewId,
                ctorDescriptor: null,
                name: 'Test View 1',
                treeView: disposables.add(instantiationService.createInstance(treeView_1.$9ub, 'testTree', 'Test Title', 'extension.id')),
            };
            ViewsRegistry.registerViews([viewDescriptor], container);
            const testExtensionService = new workbenchTestServices_2.$aec();
            extHostTreeViewsShape = new MockExtHostTreeViewsShape();
            mainThreadTreeViews = disposables.add(new mainThreadTreeViews_1.$7kb(new class {
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
            }, new workbenchTestServices_1.$Aec(), new testNotificationService_1.$I0b(), testExtensionService, new log_1.$fj()));
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
//# sourceMappingURL=mainThreadTreeViews.test.js.map