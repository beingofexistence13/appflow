/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/test/common/utils", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/lifecycle", "vs/workbench/services/editor/browser/editorService", "vs/workbench/browser/parts/editor/editorAutoSave", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/common/editor", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/test/common/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentityService"], function (require, exports, assert, event_1, utils_1, editorService_1, workbenchTestServices_1, editorGroupsService_1, lifecycle_1, editorService_2, editorAutoSave_1, configuration_1, testConfigurationService_1, filesConfigurationService_1, mockKeybindingService_1, editor_1, testWorkspace_1, workbenchTestServices_2, uriIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorAutoSave', () => {
        const disposables = new lifecycle_1.$jc();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.$Wec)());
        });
        teardown(() => {
            disposables.clear();
        });
        async function createEditorAutoSave(autoSaveConfig) {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const configurationService = new testConfigurationService_1.$G0b();
            configurationService.setUserConfiguration('files', autoSaveConfig);
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(filesConfigurationService_1.$yD, disposables.add(new workbenchTestServices_1.$Sec(instantiationService.createInstance(mockKeybindingService_1.$S0b), configurationService, new workbenchTestServices_2.$6dc(testWorkspace_1.$$0b), workbenchTestServices_1.$qec, disposables.add(new uriIdentityService_1.$pr(disposables.add(new workbenchTestServices_1.$Fec()))), disposables.add(new workbenchTestServices_1.$Fec()))));
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.$Lyb));
            instantiationService.stub(editorService_1.$9C, editorService);
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            disposables.add(accessor.textFileService.files);
            disposables.add(instantiationService.createInstance(editorAutoSave_1.$rxb));
            return accessor;
        }
        test('editor auto saves after short delay if configured', async function () {
            const accessor = await createEditorAutoSave({ autoSave: 'afterDelay', autoSaveDelay: 1 });
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const model = disposables.add(await accessor.textFileService.files.resolve(resource));
            model.textEditorModel?.setValue('Super Good');
            assert.ok(model.isDirty());
            await awaitModelSaved(model);
            assert.strictEqual(model.isDirty(), false);
        });
        test('editor auto saves on focus change if configured', async function () {
            const accessor = await createEditorAutoSave({ autoSave: 'onFocusChange' });
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { override: editor_1.$HE.id } });
            const model = disposables.add(await accessor.textFileService.files.resolve(resource));
            model.textEditorModel?.setValue('Super Good');
            assert.ok(model.isDirty());
            const editorPane = await accessor.editorService.openEditor({ resource: utils_1.$0S.call(this, '/path/index_other.txt') });
            await awaitModelSaved(model);
            assert.strictEqual(model.isDirty(), false);
            await editorPane?.group?.closeAllEditors();
        });
        function awaitModelSaved(model) {
            return event_1.Event.toPromise(event_1.Event.once(model.onDidChangeDirty));
        }
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=editorAutoSave.test.js.map