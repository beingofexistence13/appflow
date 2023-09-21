/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/editor/common/editorService", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions"], function (require, exports, nls_1, keybinding_1, editorService_1, actionCommonCategories_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InspectKeyMap extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.inspectKeyMappings',
                title: { value: (0, nls_1.localize)('workbench.action.inspectKeyMap', "Inspect Key Mappings"), original: 'Inspect Key Mappings' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor, editor) {
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const editorService = accessor.get(editorService_1.IEditorService);
            editorService.openEditor({ resource: undefined, contents: keybindingService._dumpDebugInfo(), options: { pinned: true } });
        }
    }
    (0, actions_1.registerAction2)(InspectKeyMap);
    class InspectKeyMapJSON extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.inspectKeyMappingsJSON',
                title: { value: (0, nls_1.localize)('workbench.action.inspectKeyMapJSON', "Inspect Key Mappings (JSON)"), original: 'Inspect Key Mappings (JSON)' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            await editorService.openEditor({ resource: undefined, contents: keybindingService._dumpDebugInfoJSON(), options: { pinned: true } });
        }
    }
    (0, actions_1.registerAction2)(InspectKeyMapJSON);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zcGVjdEtleWJpbmRpbmdzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL2luc3BlY3RLZXliaW5kaW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxNQUFNLGFBQWMsU0FBUSxpQkFBTztRQUVsQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUscUNBQXFDO2dCQUN6QyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0NBQWdDLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUU7Z0JBQ3RILFFBQVEsRUFBRSxtQ0FBVSxDQUFDLFNBQVM7Z0JBQzlCLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLE1BQW1CO1lBQ2xELE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBRW5ELGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVILENBQUM7S0FDRDtJQUVELElBQUEseUJBQWUsRUFBQyxhQUFhLENBQUMsQ0FBQztJQUUvQixNQUFNLGlCQUFrQixTQUFRLGlCQUFPO1FBRXRDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSx5Q0FBeUM7Z0JBQzdDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxvQ0FBb0MsRUFBRSw2QkFBNkIsQ0FBQyxFQUFFLFFBQVEsRUFBRSw2QkFBNkIsRUFBRTtnQkFDeEksUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztnQkFDOUIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUUzRCxNQUFNLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEksQ0FBQztLQUNEO0lBRUQsSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLENBQUMifQ==