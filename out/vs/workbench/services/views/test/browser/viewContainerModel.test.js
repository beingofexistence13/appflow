/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/workbench/common/views", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/browser/contextKeyService", "vs/workbench/services/views/browser/viewDescriptorService", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/platform/storage/common/storage", "vs/base/common/event", "vs/workbench/services/views/common/viewContainerModel", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, sinon, views_1, lifecycle_1, arrays_1, workbenchTestServices_1, contextkey_1, contextKeyService_1, viewDescriptorService_1, platform_1, descriptors_1, storage_1, event_1, viewContainerModel_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ViewContainerRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
    const ViewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    class ViewDescriptorSequence {
        constructor(model) {
            this.disposables = [];
            this.elements = [...model.visibleViewDescriptors];
            model.onDidAddVisibleViewDescriptors(added => added.forEach(({ viewDescriptor, index }) => this.elements.splice(index, 0, viewDescriptor)), null, this.disposables);
            model.onDidRemoveVisibleViewDescriptors(removed => removed.sort((a, b) => b.index - a.index).forEach(({ index }) => this.elements.splice(index, 1)), null, this.disposables);
            model.onDidMoveVisibleViewDescriptors(({ from, to }) => (0, arrays_1.move)(this.elements, from.index, to.index), null, this.disposables);
        }
        dispose() {
            this.disposables = (0, lifecycle_1.dispose)(this.disposables);
        }
    }
    suite('ViewContainerModel', () => {
        let container;
        const disposableStore = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let contextKeyService;
        let viewDescriptorService;
        let storageService;
        setup(() => {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposableStore);
            contextKeyService = disposableStore.add(instantiationService.createInstance(contextKeyService_1.ContextKeyService));
            instantiationService.stub(contextkey_1.IContextKeyService, contextKeyService);
            storageService = instantiationService.get(storage_1.IStorageService);
            viewDescriptorService = disposableStore.add(instantiationService.createInstance(viewDescriptorService_1.ViewDescriptorService));
        });
        teardown(() => {
            ViewsRegistry.deregisterViews(ViewsRegistry.getViews(container), container);
            ViewContainerRegistry.deregisterViewContainer(container);
        });
        test('empty model', function () {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
        });
        test('register/unregister', () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1'
            };
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 1);
            assert.strictEqual(target.elements.length, 1);
            assert.deepStrictEqual(testObject.visibleViewDescriptors[0], viewDescriptor);
            assert.deepStrictEqual(target.elements[0], viewDescriptor);
            ViewsRegistry.deregisterViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
        });
        test('when contexts', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                when: contextkey_1.ContextKeyExpr.equals('showview1', true)
            };
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should not appear since context isnt in');
            assert.strictEqual(target.elements.length, 0);
            const key = contextKeyService.createKey('showview1', false);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should still not appear since showview1 isnt true');
            assert.strictEqual(target.elements.length, 0);
            key.set(true);
            await new Promise(c => setTimeout(c, 30));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 1, 'view should appear');
            assert.strictEqual(target.elements.length, 1);
            assert.deepStrictEqual(testObject.visibleViewDescriptors[0], viewDescriptor);
            assert.strictEqual(target.elements[0], viewDescriptor);
            key.set(false);
            await new Promise(c => setTimeout(c, 30));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should disappear');
            assert.strictEqual(target.elements.length, 0);
            ViewsRegistry.deregisterViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should not be there anymore');
            assert.strictEqual(target.elements.length, 0);
            key.set(true);
            await new Promise(c => setTimeout(c, 30));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should not be there anymore');
            assert.strictEqual(target.elements.length, 0);
        }));
        test('when contexts - multiple', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const view1 = { id: 'view1', ctorDescriptor: null, name: 'Test View 1' };
            const view2 = { id: 'view2', ctorDescriptor: null, name: 'Test View 2', when: contextkey_1.ContextKeyExpr.equals('showview2', true) };
            ViewsRegistry.registerViews([view1, view2], container);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1], 'only view1 should be visible');
            assert.deepStrictEqual(target.elements, [view1], 'only view1 should be visible');
            const key = contextKeyService.createKey('showview2', false);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1], 'still only view1 should be visible');
            assert.deepStrictEqual(target.elements, [view1], 'still only view1 should be visible');
            key.set(true);
            await new Promise(c => setTimeout(c, 30));
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view2], 'both views should be visible');
            assert.deepStrictEqual(target.elements, [view1, view2], 'both views should be visible');
            ViewsRegistry.deregisterViews([view1, view2], container);
        }));
        test('when contexts - multiple 2', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const view1 = { id: 'view1', ctorDescriptor: null, name: 'Test View 1', when: contextkey_1.ContextKeyExpr.equals('showview1', true) };
            const view2 = { id: 'view2', ctorDescriptor: null, name: 'Test View 2' };
            ViewsRegistry.registerViews([view1, view2], container);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view2], 'only view2 should be visible');
            assert.deepStrictEqual(target.elements, [view2], 'only view2 should be visible');
            const key = contextKeyService.createKey('showview1', false);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view2], 'still only view2 should be visible');
            assert.deepStrictEqual(target.elements, [view2], 'still only view2 should be visible');
            key.set(true);
            await new Promise(c => setTimeout(c, 30));
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view2], 'both views should be visible');
            assert.deepStrictEqual(target.elements, [view1, view2], 'both views should be visible');
            ViewsRegistry.deregisterViews([view1, view2], container);
        }));
        test('setVisible', () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const view1 = { id: 'view1', ctorDescriptor: null, name: 'Test View 1', canToggleVisibility: true };
            const view2 = { id: 'view2', ctorDescriptor: null, name: 'Test View 2', canToggleVisibility: true };
            const view3 = { id: 'view3', ctorDescriptor: null, name: 'Test View 3', canToggleVisibility: true };
            ViewsRegistry.registerViews([view1, view2, view3], container);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view2, view3]);
            assert.deepStrictEqual(target.elements, [view1, view2, view3]);
            testObject.setVisible('view2', true);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view2, view3], 'nothing should happen');
            assert.deepStrictEqual(target.elements, [view1, view2, view3]);
            testObject.setVisible('view2', false);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view3], 'view2 should hide');
            assert.deepStrictEqual(target.elements, [view1, view3]);
            testObject.setVisible('view1', false);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view3], 'view1 should hide');
            assert.deepStrictEqual(target.elements, [view3]);
            testObject.setVisible('view3', false);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [], 'view3 shoud hide');
            assert.deepStrictEqual(target.elements, []);
            testObject.setVisible('view1', true);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1], 'view1 should show');
            assert.deepStrictEqual(target.elements, [view1]);
            testObject.setVisible('view3', true);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view3], 'view3 should show');
            assert.deepStrictEqual(target.elements, [view1, view3]);
            testObject.setVisible('view2', true);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view2, view3], 'view2 should show');
            assert.deepStrictEqual(target.elements, [view1, view2, view3]);
            ViewsRegistry.deregisterViews([view1, view2, view3], container);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, []);
            assert.deepStrictEqual(target.elements, []);
        });
        test('move', () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const view1 = { id: 'view1', ctorDescriptor: null, name: 'Test View 1' };
            const view2 = { id: 'view2', ctorDescriptor: null, name: 'Test View 2' };
            const view3 = { id: 'view3', ctorDescriptor: null, name: 'Test View 3' };
            ViewsRegistry.registerViews([view1, view2, view3], container);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view2, view3], 'model views should be OK');
            assert.deepStrictEqual(target.elements, [view1, view2, view3], 'sql views should be OK');
            testObject.move('view3', 'view1');
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view3, view1, view2], 'view3 should go to the front');
            assert.deepStrictEqual(target.elements, [view3, view1, view2]);
            testObject.move('view1', 'view2');
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view3, view2, view1], 'view1 should go to the end');
            assert.deepStrictEqual(target.elements, [view3, view2, view1]);
            testObject.move('view1', 'view3');
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view3, view2], 'view1 should go to the front');
            assert.deepStrictEqual(target.elements, [view1, view3, view2]);
            testObject.move('view2', 'view3');
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view1, view2, view3], 'view2 should go to the middle');
            assert.deepStrictEqual(target.elements, [view1, view2, view3]);
        });
        test('view states', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            storageService.store(`${container.id}.state.hidden`, JSON.stringify([{ id: 'view1', isHidden: true }]), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1'
            };
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should not appear since it was set not visible in view state');
            assert.strictEqual(target.elements.length, 0);
        }));
        test('view states and when contexts', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            storageService.store(`${container.id}.state.hidden`, JSON.stringify([{ id: 'view1', isHidden: true }]), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                when: contextkey_1.ContextKeyExpr.equals('showview1', true)
            };
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should not appear since context isnt in');
            assert.strictEqual(target.elements.length, 0);
            const key = contextKeyService.createKey('showview1', false);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should still not appear since showview1 isnt true');
            assert.strictEqual(target.elements.length, 0);
            key.set(true);
            await new Promise(c => setTimeout(c, 30));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should still not appear since it was set not visible in view state');
            assert.strictEqual(target.elements.length, 0);
        }));
        test('view states and when contexts multiple views', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            storageService.store(`${container.id}.state.hidden`, JSON.stringify([{ id: 'view1', isHidden: true }]), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const view1 = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                when: contextkey_1.ContextKeyExpr.equals('showview', true)
            };
            const view2 = {
                id: 'view2',
                ctorDescriptor: null,
                name: 'Test View 2',
            };
            const view3 = {
                id: 'view3',
                ctorDescriptor: null,
                name: 'Test View 3',
                when: contextkey_1.ContextKeyExpr.equals('showview', true)
            };
            ViewsRegistry.registerViews([view1, view2, view3], container);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view2], 'Only view2 should be visible');
            assert.deepStrictEqual(target.elements, [view2]);
            const key = contextKeyService.createKey('showview', false);
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view2], 'Only view2 should be visible');
            assert.deepStrictEqual(target.elements, [view2]);
            key.set(true);
            await new Promise(c => setTimeout(c, 30));
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view2, view3], 'view3 should be visible');
            assert.deepStrictEqual(target.elements, [view2, view3]);
            key.set(false);
            await new Promise(c => setTimeout(c, 30));
            assert.deepStrictEqual(testObject.visibleViewDescriptors, [view2], 'Only view2 should be visible');
            assert.deepStrictEqual(target.elements, [view2]);
        }));
        test('remove event is not triggered if view was hidden and removed', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                when: contextkey_1.ContextKeyExpr.equals('showview1', true),
                canToggleVisibility: true
            };
            ViewsRegistry.registerViews([viewDescriptor], container);
            const key = contextKeyService.createKey('showview1', true);
            await new Promise(c => setTimeout(c, 30));
            assert.strictEqual(testObject.visibleViewDescriptors.length, 1, 'view should appear after context is set');
            assert.strictEqual(target.elements.length, 1);
            testObject.setVisible('view1', false);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0, 'view should disappear after setting visibility to false');
            assert.strictEqual(target.elements.length, 0);
            const targetEvent = sinon.spy();
            disposableStore.add(testObject.onDidRemoveVisibleViewDescriptors(targetEvent));
            key.set(false);
            await new Promise(c => setTimeout(c, 30));
            assert.ok(!targetEvent.called, 'remove event should not be called since it is already hidden');
        }));
        test('add event is not triggered if view was set visible (when visible) and not active', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                when: contextkey_1.ContextKeyExpr.equals('showview1', true),
                canToggleVisibility: true
            };
            const key = contextKeyService.createKey('showview1', true);
            key.set(false);
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const targetEvent = sinon.spy();
            disposableStore.add(testObject.onDidAddVisibleViewDescriptors(targetEvent));
            testObject.setVisible('view1', true);
            assert.ok(!targetEvent.called, 'add event should not be called since it is already visible');
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
        }));
        test('remove event is not triggered if view was hidden and not active', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                when: contextkey_1.ContextKeyExpr.equals('showview1', true),
                canToggleVisibility: true
            };
            const key = contextKeyService.createKey('showview1', true);
            key.set(false);
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const targetEvent = sinon.spy();
            disposableStore.add(testObject.onDidAddVisibleViewDescriptors(targetEvent));
            testObject.setVisible('view1', false);
            assert.ok(!targetEvent.called, 'add event should not be called since it is disabled');
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
        }));
        test('add event is not triggered if view was set visible (when not visible) and not active', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                when: contextkey_1.ContextKeyExpr.equals('showview1', true),
                canToggleVisibility: true
            };
            const key = contextKeyService.createKey('showview1', true);
            key.set(false);
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            testObject.setVisible('view1', false);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const targetEvent = sinon.spy();
            disposableStore.add(testObject.onDidAddVisibleViewDescriptors(targetEvent));
            testObject.setVisible('view1', true);
            assert.ok(!targetEvent.called, 'add event should not be called since it is disabled');
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
        }));
        test('added view descriptors are in ascending order in the event', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            ViewsRegistry.registerViews([{
                    id: 'view5',
                    ctorDescriptor: null,
                    name: 'Test View 5',
                    canToggleVisibility: true,
                    order: 5
                }, {
                    id: 'view2',
                    ctorDescriptor: null,
                    name: 'Test View 2',
                    canToggleVisibility: true,
                    order: 2
                }], container);
            assert.strictEqual(target.elements.length, 2);
            assert.strictEqual(target.elements[0].id, 'view2');
            assert.strictEqual(target.elements[1].id, 'view5');
            ViewsRegistry.registerViews([{
                    id: 'view4',
                    ctorDescriptor: null,
                    name: 'Test View 4',
                    canToggleVisibility: true,
                    order: 4
                }, {
                    id: 'view3',
                    ctorDescriptor: null,
                    name: 'Test View 3',
                    canToggleVisibility: true,
                    order: 3
                }, {
                    id: 'view1',
                    ctorDescriptor: null,
                    name: 'Test View 1',
                    canToggleVisibility: true,
                    order: 1
                }], container);
            assert.strictEqual(target.elements.length, 5);
            assert.strictEqual(target.elements[0].id, 'view1');
            assert.strictEqual(target.elements[1].id, 'view2');
            assert.strictEqual(target.elements[2].id, 'view3');
            assert.strictEqual(target.elements[3].id, 'view4');
            assert.strictEqual(target.elements[4].id, 'view5');
        }));
        test('add event is triggered only once when view is set visible while it is set active', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                when: contextkey_1.ContextKeyExpr.equals('showview1', true),
                canToggleVisibility: true
            };
            const key = contextKeyService.createKey('showview1', true);
            key.set(false);
            ViewsRegistry.registerViews([viewDescriptor], container);
            testObject.setVisible('view1', false);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const targetEvent = sinon.spy();
            disposableStore.add(testObject.onDidAddVisibleViewDescriptors(targetEvent));
            disposableStore.add(event_1.Event.once(testObject.onDidChangeActiveViewDescriptors)(() => testObject.setVisible('view1', true)));
            key.set(true);
            await new Promise(c => setTimeout(c, 30));
            assert.strictEqual(targetEvent.callCount, 1);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 1);
            assert.strictEqual(target.elements.length, 1);
            assert.strictEqual(target.elements[0].id, 'view1');
        }));
        test('add event is not triggered only when view is set hidden while it is set active', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                when: contextkey_1.ContextKeyExpr.equals('showview1', true),
                canToggleVisibility: true
            };
            const key = contextKeyService.createKey('showview1', true);
            key.set(false);
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
            const targetEvent = sinon.spy();
            disposableStore.add(testObject.onDidAddVisibleViewDescriptors(targetEvent));
            disposableStore.add(event_1.Event.once(testObject.onDidChangeActiveViewDescriptors)(() => testObject.setVisible('view1', false)));
            key.set(true);
            await new Promise(c => setTimeout(c, 30));
            assert.strictEqual(targetEvent.callCount, 0);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
            assert.strictEqual(target.elements.length, 0);
        }));
        test('#142087: view descriptor visibility is not reset', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                canToggleVisibility: true
            };
            storageService.store((0, viewContainerModel_1.getViewsStateStorageId)('test.state'), JSON.stringify([{
                    id: viewDescriptor.id,
                    isHidden: true,
                    order: undefined
                }]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.isVisible(viewDescriptor.id), false);
            assert.strictEqual(testObject.activeViewDescriptors[0].id, viewDescriptor.id);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
        }));
        test('remove event is triggered properly if mutliple views are hidden at the same time', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const viewDescriptor1 = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                canToggleVisibility: true
            };
            const viewDescriptor2 = {
                id: 'view2',
                ctorDescriptor: null,
                name: 'Test View 2',
                canToggleVisibility: true
            };
            const viewDescriptor3 = {
                id: 'view3',
                ctorDescriptor: null,
                name: 'Test View 3',
                canToggleVisibility: true
            };
            ViewsRegistry.registerViews([viewDescriptor1, viewDescriptor2, viewDescriptor3], container);
            const remomveEvent = sinon.spy();
            disposableStore.add(testObject.onDidRemoveVisibleViewDescriptors(remomveEvent));
            const addEvent = sinon.spy();
            disposableStore.add(testObject.onDidAddVisibleViewDescriptors(addEvent));
            storageService.store((0, viewContainerModel_1.getViewsStateStorageId)('test.state'), JSON.stringify([{
                    id: viewDescriptor1.id,
                    isHidden: false,
                    order: undefined
                }, {
                    id: viewDescriptor2.id,
                    isHidden: true,
                    order: undefined
                }, {
                    id: viewDescriptor3.id,
                    isHidden: true,
                    order: undefined
                }]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            assert.ok(!addEvent.called, 'add event should not be called');
            assert.ok(remomveEvent.calledOnce, 'remove event should be called');
            assert.deepStrictEqual(remomveEvent.args[0][0], [{
                    viewDescriptor: viewDescriptor3,
                    index: 2
                }, {
                    viewDescriptor: viewDescriptor2,
                    index: 1
                }]);
            assert.strictEqual(target.elements.length, 1);
            assert.strictEqual(target.elements[0].id, viewDescriptor1.id);
        }));
        test('add event is triggered properly if mutliple views are hidden at the same time', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const viewDescriptor1 = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                canToggleVisibility: true
            };
            const viewDescriptor2 = {
                id: 'view2',
                ctorDescriptor: null,
                name: 'Test View 2',
                canToggleVisibility: true
            };
            const viewDescriptor3 = {
                id: 'view3',
                ctorDescriptor: null,
                name: 'Test View 3',
                canToggleVisibility: true
            };
            ViewsRegistry.registerViews([viewDescriptor1, viewDescriptor2, viewDescriptor3], container);
            testObject.setVisible(viewDescriptor1.id, false);
            testObject.setVisible(viewDescriptor3.id, false);
            const removeEvent = sinon.spy();
            disposableStore.add(testObject.onDidRemoveVisibleViewDescriptors(removeEvent));
            const addEvent = sinon.spy();
            disposableStore.add(testObject.onDidAddVisibleViewDescriptors(addEvent));
            storageService.store((0, viewContainerModel_1.getViewsStateStorageId)('test.state'), JSON.stringify([{
                    id: viewDescriptor1.id,
                    isHidden: false,
                    order: undefined
                }, {
                    id: viewDescriptor2.id,
                    isHidden: false,
                    order: undefined
                }, {
                    id: viewDescriptor3.id,
                    isHidden: false,
                    order: undefined
                }]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            assert.ok(!removeEvent.called, 'remove event should not be called');
            assert.ok(addEvent.calledOnce, 'add event should be called once');
            assert.deepStrictEqual(addEvent.args[0][0], [{
                    viewDescriptor: viewDescriptor1,
                    index: 0,
                    collapsed: false,
                    size: undefined
                }, {
                    viewDescriptor: viewDescriptor3,
                    index: 2,
                    collapsed: false,
                    size: undefined
                }]);
            assert.strictEqual(target.elements.length, 3);
            assert.strictEqual(target.elements[0].id, viewDescriptor1.id);
            assert.strictEqual(target.elements[1].id, viewDescriptor2.id);
            assert.strictEqual(target.elements[2].id, viewDescriptor3.id);
        }));
        test('add and remove events are triggered properly if mutliple views are hidden and added at the same time', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            const target = disposableStore.add(new ViewDescriptorSequence(testObject));
            const viewDescriptor1 = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                canToggleVisibility: true
            };
            const viewDescriptor2 = {
                id: 'view2',
                ctorDescriptor: null,
                name: 'Test View 2',
                canToggleVisibility: true
            };
            const viewDescriptor3 = {
                id: 'view3',
                ctorDescriptor: null,
                name: 'Test View 3',
                canToggleVisibility: true
            };
            const viewDescriptor4 = {
                id: 'view4',
                ctorDescriptor: null,
                name: 'Test View 4',
                canToggleVisibility: true
            };
            ViewsRegistry.registerViews([viewDescriptor1, viewDescriptor2, viewDescriptor3, viewDescriptor4], container);
            testObject.setVisible(viewDescriptor1.id, false);
            const removeEvent = sinon.spy();
            disposableStore.add(testObject.onDidRemoveVisibleViewDescriptors(removeEvent));
            const addEvent = sinon.spy();
            disposableStore.add(testObject.onDidAddVisibleViewDescriptors(addEvent));
            storageService.store((0, viewContainerModel_1.getViewsStateStorageId)('test.state'), JSON.stringify([{
                    id: viewDescriptor1.id,
                    isHidden: false,
                    order: undefined
                }, {
                    id: viewDescriptor2.id,
                    isHidden: true,
                    order: undefined
                }, {
                    id: viewDescriptor3.id,
                    isHidden: false,
                    order: undefined
                }, {
                    id: viewDescriptor4.id,
                    isHidden: true,
                    order: undefined
                }]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            assert.ok(removeEvent.calledOnce, 'remove event should be called once');
            assert.deepStrictEqual(removeEvent.args[0][0], [{
                    viewDescriptor: viewDescriptor4,
                    index: 2
                }, {
                    viewDescriptor: viewDescriptor2,
                    index: 0
                }]);
            assert.ok(addEvent.calledOnce, 'add event should be called once');
            assert.deepStrictEqual(addEvent.args[0][0], [{
                    viewDescriptor: viewDescriptor1,
                    index: 0,
                    collapsed: false,
                    size: undefined
                }]);
            assert.strictEqual(target.elements.length, 2);
            assert.strictEqual(target.elements[0].id, viewDescriptor1.id);
            assert.strictEqual(target.elements[1].id, viewDescriptor3.id);
        }));
        test('newly added view descriptor is hidden if it was toggled hidden in storage before adding', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            container = ViewContainerRegistry.registerViewContainer({ id: 'test', title: { value: 'test', original: 'test' }, ctorDescriptor: new descriptors_1.SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
            const viewDescriptor = {
                id: 'view1',
                ctorDescriptor: null,
                name: 'Test View 1',
                canToggleVisibility: true
            };
            storageService.store((0, viewContainerModel_1.getViewsStateStorageId)('test.state'), JSON.stringify([{
                    id: viewDescriptor.id,
                    isHidden: false,
                    order: undefined
                }]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const testObject = viewDescriptorService.getViewContainerModel(container);
            storageService.store((0, viewContainerModel_1.getViewsStateStorageId)('test.state'), JSON.stringify([{
                    id: viewDescriptor.id,
                    isHidden: true,
                    order: undefined
                }]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            ViewsRegistry.registerViews([viewDescriptor], container);
            assert.strictEqual(testObject.isVisible(viewDescriptor.id), false);
            assert.strictEqual(testObject.activeViewDescriptors[0].id, viewDescriptor.id);
            assert.strictEqual(testObject.visibleViewDescriptors.length, 0);
        }));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0NvbnRhaW5lck1vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdmlld3MvdGVzdC9icm93c2VyL3ZpZXdDb250YWluZXJNb2RlbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBb0JoRyxNQUFNLHFCQUFxQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUEwQixrQkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ25ILE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUV6RixNQUFNLHNCQUFzQjtRQUszQixZQUFZLEtBQTBCO1lBRjlCLGdCQUFXLEdBQWtCLEVBQUUsQ0FBQztZQUd2QyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNsRCxLQUFLLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BLLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxJ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