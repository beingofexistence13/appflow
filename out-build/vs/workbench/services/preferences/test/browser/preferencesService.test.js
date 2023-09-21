/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/editor/test/browser/editorTestServices", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/common/editor", "vs/workbench/services/configuration/common/jsonEditing", "vs/workbench/services/configuration/test/common/testServices", "vs/workbench/services/preferences/browser/preferencesService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, lifecycle_1, editorTestServices_1, commands_1, descriptors_1, serviceCollection_1, editor_1, jsonEditing_1, testServices_1, preferencesService_1, preferences_1, remoteAgentService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('PreferencesService', () => {
        let disposables;
        let testInstantiationService;
        let testObject;
        let editorService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            editorService = new TestEditorService2();
            testInstantiationService = (0, workbenchTestServices_1.$lec)({
                editorService: () => editorService
            }, disposables);
            testInstantiationService.stub(jsonEditing_1.$$fb, testServices_1.$bgc);
            testInstantiationService.stub(remoteAgentService_1.$jm, workbenchTestServices_1.$bfc);
            testInstantiationService.stub(commands_1.$Fr, editorTestServices_1.$C0b);
            // PreferencesService creates a PreferencesEditorInput which depends on IPreferencesService, add the real one, not a stub
            const collection = new serviceCollection_1.$zh();
            collection.set(preferences_1.$BE, new descriptors_1.$yh(preferencesService_1.$Fyb));
            const instantiationService = testInstantiationService.createChild(collection);
            testObject = instantiationService.createInstance(preferencesService_1.$Fyb);
        });
        teardown(() => {
            disposables.dispose();
        });
        test('options are preserved when calling openEditor', async () => {
            testObject.openSettings({ jsonEditor: false, query: 'test query' });
            const options = editorService.lastOpenEditorOptions;
            assert.strictEqual(options.focusSearch, true);
            assert.strictEqual(options.override, editor_1.$HE.id);
            assert.strictEqual(options.query, 'test query');
        });
    });
    class TestEditorService2 extends workbenchTestServices_1.$Eec {
        async openEditor(editor, optionsOrGroup) {
            this.lastOpenEditorOptions = optionsOrGroup;
            return undefined;
        }
    }
});
//# sourceMappingURL=preferencesService.test.js.map