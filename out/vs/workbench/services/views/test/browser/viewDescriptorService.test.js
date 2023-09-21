/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/views", "vs/platform/registry/common/platform", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/views/browser/viewDescriptorService", "vs/base/common/types", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/base/common/uuid", "vs/base/common/strings", "vs/base/test/common/utils"], function (require, exports, assert, views_1, platform_1, workbenchTestServices_1, descriptors_1, viewDescriptorService_1, types_1, contextKeyService_1, contextkey_1, storage_1, uuid_1, strings_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ViewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    const ViewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
    const viewContainerIdPrefix = 'testViewContainer';
    const sidebarContainer = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.generateUuid)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
    const panelContainer = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.generateUuid)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 1 /* ViewContainerLocation.Panel */);
    suite('ViewDescriptorService', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        setup(() => {
            disposables.add(instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables));
            instantiationService.stub(contextkey_1.IContextKeyService, disposables.add(instantiationService.createInstance(contextKeyService_1.ContextKeyService)));
        });
        teardown(() => {
            for (const viewContainer of ViewContainersRegistry.all) {
                if (viewContainer.id.startsWith(viewContainerIdPrefix)) {
                    ViewsRegistry.deregisterViews(ViewsRegistry.getViews(viewContainer), viewContainer);
                }
            }
        });
        function aViewDescriptorService() {
            return disposables.add(instantiationService.createInstance(viewDescriptorService_1.ViewDescriptorService));
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
            const generatedPanel = (0, types_1.assertIsDefined)(testObject.getViewContainerByViewId(viewDescriptors[0].id));
            const generatedSidebar = (0, types_1.assertIsDefined)(testObject.getViewContainerByViewId(viewDescriptors[2].id));
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
            const generatedPanel = (0, types_1.assertIsDefined)(testObject.getViewContainerByViewId(viewDescriptors[0].id));
            const generatedSidebar = (0, types_1.assertIsDefined)(testObject.getViewContainerByViewId(viewDescriptors[2].id));
            testObject.reset();
            const sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            assert.deepStrictEqual(sidebarViews.allViewDescriptors.map(v => v.id), ['view1', 'view2']);
            const panelViews = testObject.getViewContainerModel(panelContainer);
            assert.deepStrictEqual(panelViews.allViewDescriptors.map(v => v.id), ['view3']);
            const actual = JSON.parse(instantiationService.get(storage_1.IStorageService).get('views.customizations', 0 /* StorageScope.PROFILE */));
            assert.deepStrictEqual(actual, { viewContainerLocations: {}, viewLocations: {}, viewContainerBadgeEnablementStates: {} });
            assert.deepStrictEqual(testObject.getViewContainerById(generatedPanel.id), null);
            assert.deepStrictEqual(testObject.getViewContainerById(generatedSidebar.id), null);
        });
        test('initialize with custom locations', async function () {
            const storageService = instantiationService.get(storage_1.IStorageService);
            const viewContainer1 = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.generateUuid)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const generateViewContainer1 = `workbench.views.service.${(0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.generateUuid)()}`;
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
            const viewContainer1 = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.generateUuid)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const generateViewContainer1 = `workbench.views.service.${(0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.generateUuid)()}`;
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
            instantiationService.get(storage_1.IStorageService).store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const sidebarViews = testObject.getViewContainerModel(sidebarContainer);
            assert.deepStrictEqual(sidebarViews.allViewDescriptors.map(v => v.id), ['view2', 'view3']);
            const generatedViewContainerViews = testObject.getViewContainerModel(testObject.getViewContainerById(generateViewContainer1));
            assert.deepStrictEqual(generatedViewContainerViews.allViewDescriptors.map(v => v.id), ['view1']);
            const viewContainer1Views = testObject.getViewContainerModel(viewContainer1);
            assert.deepStrictEqual(testObject.getViewContainerLocation(viewContainer1), 2 /* ViewContainerLocation.AuxiliaryBar */);
            assert.deepStrictEqual(viewContainer1Views.allViewDescriptors.map(v => v.id), ['view4']);
        });
        test('orphan views', async function () {
            const storageService = instantiationService.get(storage_1.IStorageService);
            const viewsCustomizations = {
                viewContainerLocations: {},
                viewLocations: {
                    'view1': `${viewContainerIdPrefix}-${(0, uuid_1.generateUuid)()}`
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
            const storageService = instantiationService.get(storage_1.IStorageService);
            const generatedViewContainerId = `workbench.views.service.${(0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.generateUuid)()}`;
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
            const storageService = instantiationService.get(storage_1.IStorageService);
            const viewContainer1 = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.generateUuid)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const generateViewContainer1 = `workbench.views.service.${(0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.generateUuid)()}`;
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
            const storageService = instantiationService.get(storage_1.IStorageService);
            const viewContainer1 = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.generateUuid)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const generateViewContainer1 = `workbench.views.service.${(0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */)}.${(0, uuid_1.generateUuid)()}`;
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
            const storageService = instantiationService.get(storage_1.IStorageService);
            const testObject = aViewDescriptorService();
            const generateViewContainerId = `workbench.views.service.${(0, views_1.ViewContainerLocationToString)(2 /* ViewContainerLocation.AuxiliaryBar */)}.${(0, uuid_1.generateUuid)()}`;
            const viewsCustomizations = {
                viewContainerLocations: {
                    [generateViewContainerId]: 2 /* ViewContainerLocation.AuxiliaryBar */,
                },
                viewLocations: {
                    'view1': generateViewContainerId
                }
            };
            storageService.store('views.customizations', JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const viewContainer = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.generateUuid)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
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
            const storageService = instantiationService.get(storage_1.IStorageService);
            const testObject = aViewDescriptorService();
            const viewContainer = ViewContainersRegistry.registerViewContainer({ id: `${viewContainerIdPrefix}-${(0, uuid_1.generateUuid)()}`, title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
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
            const generateViewContainerId = `workbench.views.service.${(0, views_1.ViewContainerLocationToString)(2 /* ViewContainerLocation.AuxiliaryBar */)}.${(0, uuid_1.generateUuid)()}`;
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
            assert.deepStrictEqual(viewContainer1Views.allViewDescriptors.map(v => v.id).sort((a, b) => (0, strings_1.compare)(a, b)), ['view1', 'view2']);
            assert.deepStrictEqual(viewContainer1Views.visibleViewDescriptors.map(v => v.id), ['view2']);
            assert.deepStrictEqual(generatedViewContainerModel.allViewDescriptors.map(v => v.id), []);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0Rlc2NyaXB0b3JTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdmlld3MvdGVzdC9icm93c2VyL3ZpZXdEZXNjcmlwdG9yU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBaUJoRyxNQUFNLGFBQWEsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsa0JBQXVCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekYsTUFBTSxzQkFBc0IsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBMEIsa0JBQXVCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNwSCxNQUFNLHFCQUFxQixHQUFHLG1CQUFtQixDQUFDO0lBQ2xELE1BQU0sZ0JBQWdCLEdBQUcsc0JBQXNCLENBQUMscUJBQXFCLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxxQkFBcUIsSUFBSSxJQUFBLG1CQUFZLEdBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLGNBQWMsRUFBRSxJQUFJLDRCQUFjLENBQU0sRUFBRSxDQUFDLEVBQUUsd0NBQWdDLENBQUM7SUFDcFAsTUFBTSxjQUFjLEdBQUcsc0JBQXNCLENBQUMscUJBQXFCLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxxQkFBcUIsSUFBSSxJQUFBLG1CQUFZLEdBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLGNBQWMsRUFBRSxJQUFJLDRCQUFjLENBQU0sRUFBRSxDQUFDLEVBQUUsc0NBQThCLENBQUM7SUFFaFAsS0FBSyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtRQUVuQyxNQUFNLFdBQVcsR0FBRyxJQUFB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