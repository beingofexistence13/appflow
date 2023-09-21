/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/views", "vs/platform/registry/common/platform", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/views/browser/viewDescriptorService", "vs/base/common/types", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/base/common/uuid", "vs/base/common/strings", "vs/base/test/common/utils"], function (require, exports, assert, views_1, platform_1, workbenchTestServices_1, descriptors_1, viewDescriptorService_1, types_1, contextKeyService_1, contextkey_1, storage_1, uuid_1, strings_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ViewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
    const ViewContainersRegistry = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry);
    const viewContainerIdPrefix = 'testViewContainer';
    const sidebarContainer = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.$4f)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.$yh({}) }, 0 /* ViewContainerLocation.Sidebar */);
    const panelContainer = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.$4f)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.$yh({}) }, 1 /* ViewContainerLocation.Panel */);
    suite('ViewDescriptorService', () => {
        const disposables = (0, utils_1.$bT)();
        let instantiationService;
        setup(() => {
            disposables.add(instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables));
            instantiationService.stub(contextkey_1.$3i, disposables.add(instantiationService.createInstance(contextKeyService_1.$xtb)));
        });
        teardown(() => {
            for (const viewContainer of ViewContainersRegistry.all) {
                if (viewContainer.id.startsWith(viewContainerIdPrefix)) {
                    ViewsRegistry.deregisterViews(ViewsRegistry.getViews(viewContainer), viewContainer);
                }
            }
        });
        function aViewDescriptorService() {
            return disposables.add(instantiationService.createInstance(viewDescriptorService_1.$xAb));
        }
        test('Empty Containers', function () {
            const testObject = aViewDescriptorService();
            const sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            const panelViews = testObject.getViewContainerModel(panelContainer);
            assert.strictEqual(sidebarViews.allViewDescriptors.length, 0, 'The sidebar container should have no views yet.');
            assert.strictEqual(panelViews.allViewDescriptors.length, 0, 'The panel container should have no views yet.');
        });
        test('Register/Deregister', () => {
            const testObject = aViewDescriptorService();
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true
                },
                {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canMoveView: true
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors.slice(0, 2), sidebarContainer);
            ViewsRegistry.registerViews(viewDescriptors.slice(2), panelContainer);
            let sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            let panelViews = testObject.getViewContainerModel(panelContainer);
            assert.strictEqual(sidebarViews.activeViewDescriptors.length, 2, 'Sidebar should have 2 views');
            assert.strictEqual(panelViews.activeViewDescriptors.length, 1, 'Panel should have 1 view');
            ViewsRegistry.deregisterViews(viewDescriptors.slice(0, 2), sidebarContainer);
            ViewsRegistry.deregisterViews(viewDescriptors.slice(2), panelContainer);
            sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            panelViews = testObject.getViewContainerModel(panelContainer);
            assert.strictEqual(sidebarViews.activeViewDescriptors.length, 0, 'Sidebar should have no views');
            assert.strictEqual(panelViews.activeViewDescriptors.length, 0, 'Panel should have no views');
        });
        test('move views to existing containers', async function () {
            const testObject = aViewDescriptorService();
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true
                },
                {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canMoveView: true
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors.slice(0, 2), sidebarContainer);
            ViewsRegistry.registerViews(viewDescriptors.slice(2), panelContainer);
            testObject.moveViewsToContainer(viewDescriptors.slice(2), sidebarContainer);
            testObject.moveViewsToContainer(viewDescriptors.slice(0, 2), panelContainer);
            const sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            const panelViews = testObject.getViewContainerModel(panelContainer);
            assert.strictEqual(sidebarViews.activeViewDescriptors.length, 1, 'Sidebar should have 2 views');
            assert.strictEqual(panelViews.activeViewDescriptors.length, 2, 'Panel should have 1 view');
            assert.notStrictEqual(sidebarViews.activeViewDescriptors.indexOf(viewDescriptors[2]), -1, `Sidebar should have ${viewDescriptors[2].name}`);
            assert.notStrictEqual(panelViews.activeViewDescriptors.indexOf(viewDescriptors[0]), -1, `Panel should have ${viewDescriptors[0].name}`);
            assert.notStrictEqual(panelViews.activeViewDescriptors.indexOf(viewDescriptors[1]), -1, `Panel should have ${viewDescriptors[1].name}`);
        });
        test('move views to generated containers', async function () {
            const testObject = aViewDescriptorService();
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true
                },
                {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canMoveView: true
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors.slice(0, 2), sidebarContainer);
            ViewsRegistry.registerViews(viewDescriptors.slice(2), panelContainer);
            testObject.moveViewToLocation(viewDescriptors[0], 1 /* ViewContainerLocation.Panel */);
            testObject.moveViewToLocation(viewDescriptors[2], 0 /* ViewContainerLocation.Sidebar */);
            let sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            let panelViews = testObject.getViewContainerModel(panelContainer);
            assert.strictEqual(sidebarViews.activeViewDescriptors.length, 1, 'Sidebar container should have 1 view');
            assert.strictEqual(panelViews.activeViewDescriptors.length, 0, 'Panel container should have no views');
            const generatedPanel = (0, types_1.$uf)(testObject.getViewContainerByViewId(viewDescriptors[0].id));
            const generatedSidebar = (0, types_1.$uf)(testObject.getViewContainerByViewId(viewDescriptors[2].id));
            assert.strictEqual(testObject.getViewContainerLocation(generatedPanel), 1 /* ViewContainerLocation.Panel */, 'Generated Panel should be in located in the panel');
            assert.strictEqual(testObject.getViewContainerLocation(generatedSidebar), 0 /* ViewContainerLocation.Sidebar */, 'Generated Sidebar should be in located in the sidebar');
            assert.strictEqual(testObject.getViewContainerLocation(generatedPanel), testObject.getViewLocationById(viewDescriptors[0].id), 'Panel view location and container location should match');
            assert.strictEqual(testObject.getViewContainerLocation(generatedSidebar), testObject.getViewLocationById(viewDescriptors[2].id), 'Sidebar view location and container location should match');
            assert.strictEqual(testObject.getDefaultContainerById(viewDescriptors[2].id), panelContainer, `${viewDescriptors[2].name} has wrong default container`);
            assert.strictEqual(testObject.getDefaultContainerById(viewDescriptors[0].id), sidebarContainer, `${viewDescriptors[0].name} has wrong default container`);
            testObject.moveViewToLocation(viewDescriptors[0], 0 /* ViewContainerLocation.Sidebar */);
            testObject.moveViewToLocation(viewDescriptors[2], 1 /* ViewContainerLocation.Panel */);
            sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            panelViews = testObject.getViewContainerModel(panelContainer);
            assert.strictEqual(sidebarViews.activeViewDescriptors.length, 1, 'Sidebar should have 2 views');
            assert.strictEqual(panelViews.activeViewDescriptors.length, 0, 'Panel should have 1 view');
            assert.strictEqual(testObject.getViewLocationById(viewDescriptors[0].id), 0 /* ViewContainerLocation.Sidebar */, 'View should be located in the sidebar');
            assert.strictEqual(testObject.getViewLocationById(viewDescriptors[2].id), 1 /* ViewContainerLocation.Panel */, 'View should be located in the panel');
        });
        test('move view events', async function () {
            const testObject = aViewDescriptorService();
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true
                },
                {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canMoveView: true
                }
            ];
            let expectedSequence = '';
            let actualSequence = '';
            const containerMoveString = (view, from, to) => {
                return `Moved ${view.id} from ${from.id} to ${to.id}\n`;
            };
            const locationMoveString = (view, from, to) => {
                return `Moved ${view.id} from ${from === 0 /* ViewContainerLocation.Sidebar */ ? 'Sidebar' : 'Panel'} to ${to === 0 /* ViewContainerLocation.Sidebar */ ? 'Sidebar' : 'Panel'}\n`;
            };
            disposables.add(testObject.onDidChangeContainer(({ views, from, to }) => {
                views.forEach(view => {
                    actualSequence += containerMoveString(view, from, to);
                });
            }));
            disposables.add(testObject.onDidChangeLocation(({ views, from, to }) => {
                views.forEach(view => {
                    actualSequence += locationMoveString(view, from, to);
                });
            }));
            ViewsRegistry.registerViews(viewDescriptors.slice(0, 2), sidebarContainer);
            ViewsRegistry.registerViews(viewDescriptors.slice(2), panelContainer);
            expectedSequence += locationMoveString(viewDescriptors[0], 0 /* ViewContainerLocation.Sidebar */, 1 /* ViewContainerLocation.Panel */);
            testObject.moveViewToLocation(viewDescriptors[0], 1 /* ViewContainerLocation.Panel */);
            expectedSequence += containerMoveString(viewDescriptors[0], sidebarContainer, testObject.getViewContainerByViewId(viewDescriptors[0].id));
            expectedSequence += locationMoveString(viewDescriptors[2], 1 /* ViewContainerLocation.Panel */, 0 /* ViewContainerLocation.Sidebar */);
            testObject.moveViewToLocation(viewDescriptors[2], 0 /* ViewContainerLocation.Sidebar */);
            expectedSequence += containerMoveString(viewDescriptors[2], panelContainer, testObject.getViewContainerByViewId(viewDescriptors[2].id));
            expectedSequence += locationMoveString(viewDescriptors[0], 1 /* ViewContainerLocation.Panel */, 0 /* ViewContainerLocation.Sidebar */);
            expectedSequence += containerMoveString(viewDescriptors[0], testObject.getViewContainerByViewId(viewDescriptors[0].id), sidebarContainer);
            testObject.moveViewsToContainer([viewDescriptors[0]], sidebarContainer);
            expectedSequence += locationMoveString(viewDescriptors[2], 0 /* ViewContainerLocation.Sidebar */, 1 /* ViewContainerLocation.Panel */);
            expectedSequence += containerMoveString(viewDescriptors[2], testObject.getViewContainerByViewId(viewDescriptors[2].id), panelContainer);
            testObject.moveViewsToContainer([viewDescriptors[2]], panelContainer);
            expectedSequence += locationMoveString(viewDescriptors[0], 0 /* ViewContainerLocation.Sidebar */, 1 /* ViewContainerLocation.Panel */);
            expectedSequence += containerMoveString(viewDescriptors[0], sidebarContainer, panelContainer);
            testObject.moveViewsToContainer([viewDescriptors[0]], panelContainer);
            expectedSequence += locationMoveString(viewDescriptors[2], 1 /* ViewContainerLocation.Panel */, 0 /* ViewContainerLocation.Sidebar */);
            expectedSequence += containerMoveString(viewDescriptors[2], panelContainer, sidebarContainer);
            testObject.moveViewsToContainer([viewDescriptors[2]], sidebarContainer);
            expectedSequence += locationMoveString(viewDescriptors[1], 0 /* ViewContainerLocation.Sidebar */, 1 /* ViewContainerLocation.Panel */);
            expectedSequence += locationMoveString(viewDescriptors[2], 0 /* ViewContainerLocation.Sidebar */, 1 /* ViewContainerLocation.Panel */);
            expectedSequence += containerMoveString(viewDescriptors[1], sidebarContainer, panelContainer);
            expectedSequence += containerMoveString(viewDescriptors[2], sidebarContainer, panelContainer);
            testObject.moveViewsToContainer([viewDescriptors[1], viewDescriptors[2]], panelContainer);
            assert.strictEqual(actualSequence, expectedSequence, 'Event sequence not matching expected sequence');
        });
        test('reset', async function () {
            const testObject = aViewDescriptorService();
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true,
                    order: 1
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true,
                    order: 2
                },
                {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canMoveView: true,
                    order: 3
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors.slice(0, 2), sidebarContainer);
            ViewsRegistry.registerViews(viewDescriptors.slice(2), panelContainer);
            testObject.moveViewToLocation(viewDescriptors[0], 1 /* ViewContainerLocation.Panel */);
            testObject.moveViewsToContainer([viewDescriptors[1]], panelContainer);
            testObject.moveViewToLocation(viewDescriptors[2], 0 /* ViewContainerLocation.Sidebar */);
            const generatedPanel = (0, types_1.$uf)(testObject.getViewContainerByViewId(viewDescriptors[0].id));
            const generatedSidebar = (0, types_1.$uf)(testObject.getViewContainerByViewId(viewDescriptors[2].id));
            testObject.reset();
            const sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            assert.deepStrictEqual(sidebarViews.allViewDescriptors.map(v => v.id), ['view1', 'view2']);
            const panelViews = testObject.getViewContainerModel(panelContainer);
            assert.deepStrictEqual(panelViews.allViewDescriptors.map(v => v.id), ['view3']);
            const actual = JSON.parse(instantiationService.get(storage_1.$Vo).get('views.customizations', 0 /* StorageScope.PROFILE */));
            assert.deepStrictEqual(actual, { viewContainerLocations: {}, viewLocations: {}, viewContainerBadgeEnablementStates: {} });
            assert.deepStrictEqual(testObject.getViewContainerById(generatedPanel.id), null);
            assert.deepStrictEqual(testObject.getViewContainerById(generatedSidebar.id), null);
        });
        test('initialize with custom locations', async function () {
            const storageService = instantiationService.get(storage_1.$Vo);
            const viewContainer1 = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.$4f)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.$yh({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const generateViewContainer1 = `workbench.views.service.${(0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.$4f)()}`;
            const viewsCustomizations = {
                viewContainerLocations: {
                    [generateViewContainer1]: 0 /* ViewContainerLocation.Sidebar */,
                    [viewContainer1.id]: 2 /* ViewContainerLocation.AuxiliaryBar */
                },
                viewLocations: {
                    'view1': generateViewContainer1
                }
            };
            storageService.store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true
                },
                {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canMoveView: true
                },
                {
                    id: 'view4',
                    ctorDescriptor: null,
                    name: 'Test View 4',
                    canMoveView: true
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors.slice(0, 3), sidebarContainer);
            ViewsRegistry.registerViews(viewDescriptors.slice(3), viewContainer1);
            const testObject = aViewDescriptorService();
            const sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            assert.deepStrictEqual(sidebarViews.allViewDescriptors.map(v => v.id), ['view2', 'view3']);
            const generatedViewContainerViews = testObject.getViewContainerModel(testObject.getViewContainerById(generateViewContainer1));
            assert.deepStrictEqual(generatedViewContainerViews.allViewDescriptors.map(v => v.id), ['view1']);
            const viewContainer1Views = testObject.getViewContainerModel(viewContainer1);
            assert.deepStrictEqual(testObject.getViewContainerLocation(viewContainer1), 2 /* ViewContainerLocation.AuxiliaryBar */);
            assert.deepStrictEqual(viewContainer1Views.allViewDescriptors.map(v => v.id), ['view4']);
        });
        test('storage change', async function () {
            const testObject = aViewDescriptorService();
            const viewContainer1 = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.$4f)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.$yh({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const generateViewContainer1 = `workbench.views.service.${(0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.$4f)()}`;
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true
                },
                {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canMoveView: true
                },
                {
                    id: 'view4',
                    ctorDescriptor: null,
                    name: 'Test View 4',
                    canMoveView: true
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors.slice(0, 3), sidebarContainer);
            ViewsRegistry.registerViews(viewDescriptors.slice(3), viewContainer1);
            const viewsCustomizations = {
                viewContainerLocations: {
                    [generateViewContainer1]: 0 /* ViewContainerLocation.Sidebar */,
                    [viewContainer1.id]: 2 /* ViewContainerLocation.AuxiliaryBar */
                },
                viewLocations: {
                    'view1': generateViewContainer1
                }
            };
            instantiationService.get(storage_1.$Vo).store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            assert.deepStrictEqual(sidebarViews.allViewDescriptors.map(v => v.id), ['view2', 'view3']);
            const generatedViewContainerViews = testObject.getViewContainerModel(testObject.getViewContainerById(generateViewContainer1));
            assert.deepStrictEqual(generatedViewContainerViews.allViewDescriptors.map(v => v.id), ['view1']);
            const viewContainer1Views = testObject.getViewContainerModel(viewContainer1);
            assert.deepStrictEqual(testObject.getViewContainerLocation(viewContainer1), 2 /* ViewContainerLocation.AuxiliaryBar */);
            assert.deepStrictEqual(viewContainer1Views.allViewDescriptors.map(v => v.id), ['view4']);
        });
        test('orphan views', async function () {
            const storageService = instantiationService.get(storage_1.$Vo);
            const viewsCustomizations = {
                viewContainerLocations: {},
                viewLocations: {
                    'view1': `${viewContainerIdPrefix}-${(0, uuid_1.$4f)()}`
                }
            };
            storageService.store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true,
                    order: 1
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true,
                    order: 2
                },
                {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canMoveView: true,
                    order: 3
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors, sidebarContainer);
            const testObject = aViewDescriptorService();
            const sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            assert.deepStrictEqual(sidebarViews.allViewDescriptors.map(v => v.id), ['view2', 'view3']);
            testObject.whenExtensionsRegistered();
            assert.deepStrictEqual(sidebarViews.allViewDescriptors.map(v => v.id), ['view1', 'view2', 'view3']);
        });
        test('orphan view containers', async function () {
            const storageService = instantiationService.get(storage_1.$Vo);
            const generatedViewContainerId = `workbench.views.service.${(0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.$4f)()}`;
            const viewsCustomizations = {
                viewContainerLocations: {
                    [generatedViewContainerId]: 0 /* ViewContainerLocation.Sidebar */
                },
                viewLocations: {}
            };
            storageService.store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true,
                    order: 1
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors, sidebarContainer);
            const testObject = aViewDescriptorService();
            testObject.whenExtensionsRegistered();
            assert.deepStrictEqual(testObject.getViewContainerById(generatedViewContainerId), null);
            assert.deepStrictEqual(testObject.isViewContainerRemovedPermanently(generatedViewContainerId), true);
            const actual = JSON.parse(storageService.get('views.customizations', 0 /* StorageScope.PROFILE */));
            assert.deepStrictEqual(actual, { viewContainerLocations: {}, viewLocations: {}, viewContainerBadgeEnablementStates: {} });
        });
        test('custom locations take precedence when default view container of views change', async function () {
            const storageService = instantiationService.get(storage_1.$Vo);
            const viewContainer1 = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.$4f)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.$yh({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const generateViewContainer1 = `workbench.views.service.${(0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.$4f)()}`;
            const viewsCustomizations = {
                viewContainerLocations: {
                    [generateViewContainer1]: 0 /* ViewContainerLocation.Sidebar */,
                    [viewContainer1.id]: 2 /* ViewContainerLocation.AuxiliaryBar */
                },
                viewLocations: {
                    'view1': generateViewContainer1
                }
            };
            storageService.store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true
                },
                {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canMoveView: true
                },
                {
                    id: 'view4',
                    ctorDescriptor: null,
                    name: 'Test View 4',
                    canMoveView: true
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors.slice(0, 3), sidebarContainer);
            ViewsRegistry.registerViews(viewDescriptors.slice(3), viewContainer1);
            const testObject = aViewDescriptorService();
            ViewsRegistry.moveViews([viewDescriptors[0], viewDescriptors[1]], panelContainer);
            const sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            assert.deepStrictEqual(sidebarViews.allViewDescriptors.map(v => v.id), ['view3']);
            const panelViews = testObject.getViewContainerModel(panelContainer);
            assert.deepStrictEqual(panelViews.allViewDescriptors.map(v => v.id), ['view2']);
            const generatedViewContainerViews = testObject.getViewContainerModel(testObject.getViewContainerById(generateViewContainer1));
            assert.deepStrictEqual(generatedViewContainerViews.allViewDescriptors.map(v => v.id), ['view1']);
            const viewContainer1Views = testObject.getViewContainerModel(viewContainer1);
            assert.deepStrictEqual(testObject.getViewContainerLocation(viewContainer1), 2 /* ViewContainerLocation.AuxiliaryBar */);
            assert.deepStrictEqual(viewContainer1Views.allViewDescriptors.map(v => v.id), ['view4']);
        });
        test('view containers with not existing views are not removed from customizations', async function () {
            const storageService = instantiationService.get(storage_1.$Vo);
            const viewContainer1 = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.$4f)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.$yh({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const generateViewContainer1 = `workbench.views.service.${(0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.$4f)()}`;
            const viewsCustomizations = {
                viewContainerLocations: {
                    [generateViewContainer1]: 0 /* ViewContainerLocation.Sidebar */,
                    [viewContainer1.id]: 2 /* ViewContainerLocation.AuxiliaryBar */
                },
                viewLocations: {
                    'view5': generateViewContainer1
                }
            };
            storageService.store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors, viewContainer1);
            const testObject = aViewDescriptorService();
            testObject.whenExtensionsRegistered();
            const viewContainer1Views = testObject.getViewContainerModel(viewContainer1);
            assert.deepStrictEqual(testObject.getViewContainerLocation(viewContainer1), 2 /* ViewContainerLocation.AuxiliaryBar */);
            assert.deepStrictEqual(viewContainer1Views.allViewDescriptors.map(v => v.id), ['view1']);
            const actual = JSON.parse(storageService.get('views.customizations', 0 /* StorageScope.PROFILE */));
            assert.deepStrictEqual(actual, viewsCustomizations);
        });
        test('storage change also updates locations even if views do not exists and views are registered later', async function () {
            const storageService = instantiationService.get(storage_1.$Vo);
            const testObject = aViewDescriptorService();
            const generateViewContainerId = `workbench.views.service.${(0, views_1.$0E)(2 /* ViewContainerLocation.AuxiliaryBar */)}.${(0, uuid_1.$4f)()}`;
            const viewsCustomizations = {
                viewContainerLocations: {
                    [generateViewContainerId]: 2 /* ViewContainerLocation.AuxiliaryBar */,
                },
                viewLocations: {
                    'view1': generateViewContainerId
                }
            };
            storageService.store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const viewContainer = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.$4f)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.$yh({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors, viewContainer);
            testObject.whenExtensionsRegistered();
            const viewContainer1Views = testObject.getViewContainerModel(viewContainer);
            assert.deepStrictEqual(viewContainer1Views.allViewDescriptors.map(v => v.id), ['view2']);
            const generateViewContainer = testObject.getViewContainerById(generateViewContainerId);
            assert.deepStrictEqual(testObject.getViewContainerLocation(generateViewContainer), 2 /* ViewContainerLocation.AuxiliaryBar */);
            const generatedViewContainerModel = testObject.getViewContainerModel(generateViewContainer);
            assert.deepStrictEqual(generatedViewContainerModel.allViewDescriptors.map(v => v.id), ['view1']);
        });
        test('storage change move views and retain visibility state', async function () {
            const storageService = instantiationService.get(storage_1.$Vo);
            const testObject = aViewDescriptorService();
            const viewContainer = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.$4f)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.$yh({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const viewDescriptors = [
                {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canMoveView: true,
                    canToggleVisibility: true
                },
                {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canMoveView: true
                }
            ];
            ViewsRegistry.registerViews(viewDescriptors, viewContainer);
            testObject.whenExtensionsRegistered();
            const viewContainer1Views = testObject.getViewContainerModel(viewContainer);
            viewContainer1Views.setVisible('view1', false);
            const generateViewContainerId = `workbench.views.service.${(0, views_1.$0E)(2 /* ViewContainerLocation.AuxiliaryBar */)}.${(0, uuid_1.$4f)()}`;
            const viewsCustomizations = {
                viewContainerLocations: {
                    [generateViewContainerId]: 2 /* ViewContainerLocation.AuxiliaryBar */,
                },
                viewLocations: {
                    'view1': generateViewContainerId
                }
            };
            storageService.store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const generateViewContainer = testObject.getViewContainerById(generateViewContainerId);
            const generatedViewContainerModel = testObject.getViewContainerModel(generateViewContainer);
            assert.deepStrictEqual(viewContainer1Views.allViewDescriptors.map(v => v.id), ['view2']);
            assert.deepStrictEqual(testObject.getViewContainerLocation(generateViewContainer), 2 /* ViewContainerLocation.AuxiliaryBar */);
            assert.deepStrictEqual(generatedViewContainerModel.allViewDescriptors.map(v => v.id), ['view1']);
            storageService.store('views.customizations', JSON.stringify({}), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            assert.deepStrictEqual(viewContainer1Views.allViewDescriptors.map(v => v.id).sort((a, b) => (0, strings_1.$Fe)(a, b)), ['view1', 'view2']);
            assert.deepStrictEqual(viewContainer1Views.visibleViewDescriptors.map(v => v.id), ['view2']);
            assert.deepStrictEqual(generatedViewContainerModel.allViewDescriptors.map(v => v.id), []);
        });
    });
});
//# sourceMappingURL=viewDescriptorService.test.js.map