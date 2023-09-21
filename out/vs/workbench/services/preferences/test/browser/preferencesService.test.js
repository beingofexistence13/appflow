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
            disposables = new lifecycle_1.DisposableStore();
            editorService = new TestEditorService2();
            testInstantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({
                editorService: () => editorService
            }, disposables);
            testInstantiationService.stub(jsonEditing_1.IJSONEditingService, testServices_1.TestJSONEditingService);
            testInstantiationService.stub(remoteAgentService_1.IRemoteAgentService, workbenchTestServices_1.TestRemoteAgentService);
            testInstantiationService.stub(commands_1.ICommandService, editorTestServices_1.TestCommandService);
            // PreferencesService creates a PreferencesEditorInput which depends on IPreferencesService, add the real one, not a stub
            const collection = new serviceCollection_1.ServiceCollection();
            collection.set(preferences_1.IPreferencesService, new descriptors_1.SyncDescriptor(preferencesService_1.PreferencesService));
            const instantiationService = testInstantiationService.createChild(collection);
            testObject = instantiationService.createInstance(preferencesService_1.PreferencesService);
        });
        teardown(() => {
            disposables.dispose();
        });
        test('options are preserved when calling openEditor', async () => {
            testObject.openSettings({ jsonEditor: false, query: 'test query' });
            const options = editorService.lastOpenEditorOptions;
            assert.strictEqual(options.focusSearch, true);
            assert.strictEqual(options.override, editor_1.DEFAULT_EDITOR_ASSOCIATION.id);
            assert.strictEqual(options.query, 'test query');
        });
    });
    class TestEditorService2 extends workbenchTestServices_1.TestEditorService {
        async openEditor(editor, optionsOrGroup) {
            this.lastOpenEditorOptions = optionsOrGroup;
            return undefined;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcHJlZmVyZW5jZXMvdGVzdC9icm93c2VyL3ByZWZlcmVuY2VzU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZ0JoRyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBRWhDLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLHdCQUFtRCxDQUFDO1FBQ3hELElBQUksVUFBOEIsQ0FBQztRQUNuQyxJQUFJLGFBQWlDLENBQUM7UUFFdEMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNwQyxhQUFhLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3pDLHdCQUF3QixHQUFHLElBQUEscURBQTZCLEVBQUM7Z0JBQ3hELGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxhQUFhO2FBQ2xDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFaEIsd0JBQXdCLENBQUMsSUFBSSxDQUFDLGlDQUFtQixFQUFFLHFDQUFzQixDQUFDLENBQUM7WUFDM0Usd0JBQXdCLENBQUMsSUFBSSxDQUFDLHdDQUFtQixFQUFFLDhDQUFzQixDQUFDLENBQUM7WUFDM0Usd0JBQXdCLENBQUMsSUFBSSxDQUFDLDBCQUFlLEVBQUUsdUNBQWtCLENBQUMsQ0FBQztZQUVuRSx5SEFBeUg7WUFDekgsTUFBTSxVQUFVLEdBQUcsSUFBSSxxQ0FBaUIsRUFBRSxDQUFDO1lBQzNDLFVBQVUsQ0FBQyxHQUFHLENBQUMsaUNBQW1CLEVBQUUsSUFBSSw0QkFBYyxDQUFDLHVDQUFrQixDQUFDLENBQUMsQ0FBQztZQUM1RSxNQUFNLG9CQUFvQixHQUFHLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5RSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVDQUFrQixDQUFDLENBQUM7UUFDdEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLCtDQUErQyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2hFLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxxQkFBK0MsQ0FBQztZQUM5RSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLG1DQUEwQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxrQkFBbUIsU0FBUSx5Q0FBaUI7UUFHeEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFXLEVBQUUsY0FBb0I7WUFDMUQsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGNBQWMsQ0FBQztZQUM1QyxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO0tBQ0QifQ==