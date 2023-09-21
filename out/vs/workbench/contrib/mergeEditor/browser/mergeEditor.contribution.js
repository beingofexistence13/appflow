/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/descriptors", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/mergeEditor/browser/commands/commands", "vs/workbench/contrib/mergeEditor/browser/commands/devCommands", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "./mergeEditorSerializer"], function (require, exports, nls_1, actions_1, configurationRegistry_1, descriptors_1, platform_1, editor_1, contributions_1, editor_2, commands_1, devCommands_1, mergeEditorInput_1, mergeEditor_1, mergeEditorSerializer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(mergeEditor_1.MergeEditor, mergeEditor_1.MergeEditor.ID, (0, nls_1.localize)('name', "Merge Editor")), [
        new descriptors_1.SyncDescriptor(mergeEditorInput_1.MergeEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(mergeEditorInput_1.MergeEditorInput.ID, mergeEditorSerializer_1.MergeEditorSerializer);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        properties: {
            'mergeEditor.diffAlgorithm': {
                type: 'string',
                enum: ['legacy', 'advanced'],
                default: 'advanced',
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('diffAlgorithm.legacy', "Uses the legacy diffing algorithm."),
                    (0, nls_1.localize)('diffAlgorithm.advanced', "Uses the advanced diffing algorithm."),
                ]
            },
            'mergeEditor.showDeletionMarkers': {
                type: 'boolean',
                default: true,
                description: 'Controls if deletions in base or one of the inputs should be indicated by a vertical bar.',
            },
        }
    });
    (0, actions_1.registerAction2)(commands_1.OpenResultResource);
    (0, actions_1.registerAction2)(commands_1.SetMixedLayout);
    (0, actions_1.registerAction2)(commands_1.SetColumnLayout);
    (0, actions_1.registerAction2)(commands_1.OpenMergeEditor);
    (0, actions_1.registerAction2)(commands_1.OpenBaseFile);
    (0, actions_1.registerAction2)(commands_1.ShowNonConflictingChanges);
    (0, actions_1.registerAction2)(commands_1.ShowHideBase);
    (0, actions_1.registerAction2)(commands_1.ShowHideTopBase);
    (0, actions_1.registerAction2)(commands_1.ShowHideCenterBase);
    (0, actions_1.registerAction2)(commands_1.GoToNextUnhandledConflict);
    (0, actions_1.registerAction2)(commands_1.GoToPreviousUnhandledConflict);
    (0, actions_1.registerAction2)(commands_1.ToggleActiveConflictInput1);
    (0, actions_1.registerAction2)(commands_1.ToggleActiveConflictInput2);
    (0, actions_1.registerAction2)(commands_1.CompareInput1WithBaseCommand);
    (0, actions_1.registerAction2)(commands_1.CompareInput2WithBaseCommand);
    (0, actions_1.registerAction2)(commands_1.AcceptAllInput1);
    (0, actions_1.registerAction2)(commands_1.AcceptAllInput2);
    (0, actions_1.registerAction2)(commands_1.ResetToBaseAndAutoMergeCommand);
    (0, actions_1.registerAction2)(commands_1.AcceptMerge);
    (0, actions_1.registerAction2)(commands_1.ResetCloseWithConflictsChoice);
    // Dev Commands
    (0, actions_1.registerAction2)(devCommands_1.MergeEditorCopyContentsToJSON);
    (0, actions_1.registerAction2)(devCommands_1.MergeEditorSaveContentsToFolder);
    (0, actions_1.registerAction2)(devCommands_1.MergeEditorLoadContentsFromFolder);
    platform_1.Registry
        .as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(mergeEditor_1.MergeEditorOpenHandlerContribution, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry
        .as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(mergeEditor_1.MergeEditorResolverContribution, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VFZGl0b3IuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci9tZXJnZUVkaXRvci5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFzQmhHLG1CQUFRLENBQUMsRUFBRSxDQUFzQix5QkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxrQkFBa0IsQ0FDL0UsNkJBQW9CLENBQUMsTUFBTSxDQUMxQix5QkFBVyxFQUNYLHlCQUFXLENBQUMsRUFBRSxFQUNkLElBQUEsY0FBUSxFQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FDaEMsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyxtQ0FBZ0IsQ0FBQztLQUNwQyxDQUNELENBQUM7SUFFRixtQkFBUSxDQUFDLEVBQUUsQ0FBeUIseUJBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsd0JBQXdCLENBQzNGLG1DQUFnQixDQUFDLEVBQUUsRUFDbkIsNkNBQXFCLENBQ3JCLENBQUM7SUFFRixtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztRQUNuRixVQUFVLEVBQUU7WUFDWCwyQkFBMkIsRUFBRTtnQkFDNUIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQztnQkFDNUIsT0FBTyxFQUFFLFVBQVU7Z0JBQ25CLHdCQUF3QixFQUFFO29CQUN6QixJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxvQ0FBb0MsQ0FBQztvQkFDdEUsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsc0NBQXNDLENBQUM7aUJBQzFFO2FBQ0Q7WUFDRCxpQ0FBaUMsRUFBRTtnQkFDbEMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsV0FBVyxFQUFFLDJGQUEyRjthQUN4RztTQUNEO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLDZCQUFrQixDQUFDLENBQUM7SUFDcEMsSUFBQSx5QkFBZSxFQUFDLHlCQUFjLENBQUMsQ0FBQztJQUNoQyxJQUFBLHlCQUFlLEVBQUMsMEJBQWUsQ0FBQyxDQUFDO0lBQ2pDLElBQUEseUJBQWUsRUFBQywwQkFBZSxDQUFDLENBQUM7SUFDakMsSUFBQSx5QkFBZSxFQUFDLHVCQUFZLENBQUMsQ0FBQztJQUM5QixJQUFBLHlCQUFlLEVBQUMsb0NBQXlCLENBQUMsQ0FBQztJQUMzQyxJQUFBLHlCQUFlLEVBQUMsdUJBQVksQ0FBQyxDQUFDO0lBQzlCLElBQUEseUJBQWUsRUFBQywwQkFBZSxDQUFDLENBQUM7SUFDakMsSUFBQSx5QkFBZSxFQUFDLDZCQUFrQixDQUFDLENBQUM7SUFFcEMsSUFBQSx5QkFBZSxFQUFDLG9DQUF5QixDQUFDLENBQUM7SUFDM0MsSUFBQSx5QkFBZSxFQUFDLHdDQUE2QixDQUFDLENBQUM7SUFFL0MsSUFBQSx5QkFBZSxFQUFDLHFDQUEwQixDQUFDLENBQUM7SUFDNUMsSUFBQSx5QkFBZSxFQUFDLHFDQUEwQixDQUFDLENBQUM7SUFFNUMsSUFBQSx5QkFBZSxFQUFDLHVDQUE0QixDQUFDLENBQUM7SUFDOUMsSUFBQSx5QkFBZSxFQUFDLHVDQUE0QixDQUFDLENBQUM7SUFFOUMsSUFBQSx5QkFBZSxFQUFDLDBCQUFlLENBQUMsQ0FBQztJQUNqQyxJQUFBLHlCQUFlLEVBQUMsMEJBQWUsQ0FBQyxDQUFDO0lBRWpDLElBQUEseUJBQWUsRUFBQyx5Q0FBOEIsQ0FBQyxDQUFDO0lBRWhELElBQUEseUJBQWUsRUFBQyxzQkFBVyxDQUFDLENBQUM7SUFDN0IsSUFBQSx5QkFBZSxFQUFDLHdDQUE2QixDQUFDLENBQUM7SUFFL0MsZUFBZTtJQUNmLElBQUEseUJBQWUsRUFBQywyQ0FBNkIsQ0FBQyxDQUFDO0lBQy9DLElBQUEseUJBQWUsRUFBQyw2Q0FBK0IsQ0FBQyxDQUFDO0lBQ2pELElBQUEseUJBQWUsRUFBQywrQ0FBaUMsQ0FBQyxDQUFDO0lBRW5ELG1CQUFRO1NBQ04sRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUM7U0FDbEUsNkJBQTZCLENBQUMsZ0RBQWtDLGtDQUEwQixDQUFDO0lBRTdGLG1CQUFRO1NBQ04sRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUM7U0FDbEUsNkJBQTZCLENBQUMsNkNBQStCLGtDQUEwQixDQUFDIn0=