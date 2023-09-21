/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughActions", "vs/workbench/contrib/welcomeWalkthrough/common/walkThroughContentProvider", "vs/workbench/contrib/welcomeWalkthrough/browser/editor/editorWalkThrough", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/platform/instantiation/common/descriptors", "vs/platform/actions/common/actions", "vs/workbench/common/contributions", "vs/workbench/browser/editor", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, nls_1, walkThroughInput_1, walkThroughPart_1, walkThroughActions_1, walkThroughContentProvider_1, editorWalkThrough_1, platform_1, editor_1, descriptors_1, actions_1, contributions_1, editor_2, keybindingsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(editor_1.EditorExtensions.EditorPane)
        .registerEditorPane(editor_2.EditorPaneDescriptor.create(walkThroughPart_1.WalkThroughPart, walkThroughPart_1.WalkThroughPart.ID, (0, nls_1.localize)('walkThrough.editor.label', "Playground")), [new descriptors_1.SyncDescriptor(walkThroughInput_1.WalkThroughInput)]);
    (0, actions_1.registerAction2)(editorWalkThrough_1.EditorWalkThroughAction);
    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer(editorWalkThrough_1.EditorWalkThroughInputSerializer.ID, editorWalkThrough_1.EditorWalkThroughInputSerializer);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(walkThroughContentProvider_1.WalkThroughSnippetContentProvider, 2 /* LifecyclePhase.Ready */);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(walkThroughActions_1.WalkThroughArrowUp);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(walkThroughActions_1.WalkThroughArrowDown);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(walkThroughActions_1.WalkThroughPageUp);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(walkThroughActions_1.WalkThroughPageDown);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
        group: '1_welcome',
        command: {
            id: 'workbench.action.showInteractivePlayground',
            title: (0, nls_1.localize)({ key: 'miPlayground', comment: ['&& denotes a mnemonic'] }, "Editor Playgrou&&nd")
        },
        order: 3
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Fsa1Rocm91Z2guY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2VsY29tZVdhbGt0aHJvdWdoL2Jyb3dzZXIvd2Fsa1Rocm91Z2guY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBaUJoRyxtQkFBUSxDQUFDLEVBQUUsQ0FBc0IseUJBQWdCLENBQUMsVUFBVSxDQUFDO1NBQzNELGtCQUFrQixDQUFDLDZCQUFvQixDQUFDLE1BQU0sQ0FDOUMsaUNBQWUsRUFDZixpQ0FBZSxDQUFDLEVBQUUsRUFDbEIsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsWUFBWSxDQUFDLENBQ2xELEVBQ0EsQ0FBQyxJQUFJLDRCQUFjLENBQUMsbUNBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFMUMsSUFBQSx5QkFBZSxFQUFDLDJDQUF1QixDQUFDLENBQUM7SUFFekMsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLHlCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLG9EQUFnQyxDQUFDLEVBQUUsRUFBRSxvREFBZ0MsQ0FBQyxDQUFDO0lBRXBLLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUM7U0FDekUsNkJBQTZCLENBQUMsOERBQWlDLCtCQUFxRyxDQUFDO0lBRXZLLHlDQUFtQixDQUFDLGdDQUFnQyxDQUFDLHVDQUFrQixDQUFDLENBQUM7SUFFekUseUNBQW1CLENBQUMsZ0NBQWdDLENBQUMseUNBQW9CLENBQUMsQ0FBQztJQUUzRSx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQyxzQ0FBaUIsQ0FBQyxDQUFDO0lBRXhFLHlDQUFtQixDQUFDLGdDQUFnQyxDQUFDLHdDQUFtQixDQUFDLENBQUM7SUFFMUUsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxlQUFlLEVBQUU7UUFDbkQsS0FBSyxFQUFFLFdBQVc7UUFDbEIsT0FBTyxFQUFFO1lBQ1IsRUFBRSxFQUFFLDRDQUE0QztZQUNoRCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQztTQUNuRztRQUNELEtBQUssRUFBRSxDQUFDO0tBQ1IsQ0FBQyxDQUFDIn0=