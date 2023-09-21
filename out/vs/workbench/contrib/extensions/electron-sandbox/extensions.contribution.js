/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/workbench/common/contributions", "vs/platform/instantiation/common/descriptors", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/editor", "vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor", "vs/workbench/contrib/extensions/electron-sandbox/debugExtensionHostAction", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/extensions/electron-sandbox/extensionsActions", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/ipc/electron-sandbox/services", "vs/platform/extensionRecommendations/common/extensionRecommendationsIpc", "vs/base/common/codicons", "vs/workbench/contrib/extensions/electron-sandbox/remoteExtensionsInit", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/extensions/electron-sandbox/extensionProfileService", "vs/workbench/contrib/extensions/electron-sandbox/extensionsAutoProfiler"], function (require, exports, nls_1, platform_1, actions_1, contributions_1, descriptors_1, commands_1, instantiation_1, editor_1, runtimeExtensionsEditor_1, debugExtensionHostAction_1, editor_2, contextkeys_1, runtimeExtensionsInput_1, contextkey_1, extensionsActions_1, extensionRecommendations_1, services_1, extensionRecommendationsIpc_1, codicons_1, remoteExtensionsInit_1, extensions_1, extensionProfileService_1, extensionsAutoProfiler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Singletons
    (0, extensions_1.registerSingleton)(runtimeExtensionsEditor_1.IExtensionHostProfileService, extensionProfileService_1.ExtensionHostProfileService, 1 /* InstantiationType.Delayed */);
    // Running Extensions Editor
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(runtimeExtensionsEditor_1.RuntimeExtensionsEditor, runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID, (0, nls_1.localize)('runtimeExtension', "Running Extensions")), [new descriptors_1.SyncDescriptor(runtimeExtensionsInput_1.RuntimeExtensionsInput)]);
    class RuntimeExtensionsInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '';
        }
        deserialize(instantiationService) {
            return runtimeExtensionsInput_1.RuntimeExtensionsInput.instance;
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(runtimeExtensionsInput_1.RuntimeExtensionsInput.ID, RuntimeExtensionsInputSerializer);
    // Global actions
    let ExtensionsContributions = class ExtensionsContributions {
        constructor(extensionRecommendationNotificationService, sharedProcessService) {
            sharedProcessService.registerChannel('extensionRecommendationNotification', new extensionRecommendationsIpc_1.ExtensionRecommendationNotificationServiceChannel(extensionRecommendationNotificationService));
            (0, actions_1.registerAction2)(extensionsActions_1.OpenExtensionsFolderAction);
            (0, actions_1.registerAction2)(extensionsActions_1.CleanUpExtensionsFolderAction);
        }
    };
    ExtensionsContributions = __decorate([
        __param(0, extensionRecommendations_1.IExtensionRecommendationNotificationService),
        __param(1, services_1.ISharedProcessService)
    ], ExtensionsContributions);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsAutoProfiler_1.ExtensionsAutoProfiler, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(remoteExtensionsInit_1.RemoteExtensionsInitializerContribution, 3 /* LifecyclePhase.Restored */);
    // Register Commands
    commands_1.CommandsRegistry.registerCommand(debugExtensionHostAction_1.DebugExtensionHostAction.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        instantiationService.createInstance(debugExtensionHostAction_1.DebugExtensionHostAction).run();
    });
    commands_1.CommandsRegistry.registerCommand(runtimeExtensionsEditor_1.StartExtensionHostProfileAction.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        instantiationService.createInstance(runtimeExtensionsEditor_1.StartExtensionHostProfileAction, runtimeExtensionsEditor_1.StartExtensionHostProfileAction.ID, runtimeExtensionsEditor_1.StartExtensionHostProfileAction.LABEL).run();
    });
    commands_1.CommandsRegistry.registerCommand(runtimeExtensionsEditor_1.StopExtensionHostProfileAction.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        instantiationService.createInstance(runtimeExtensionsEditor_1.StopExtensionHostProfileAction, runtimeExtensionsEditor_1.StopExtensionHostProfileAction.ID, runtimeExtensionsEditor_1.StopExtensionHostProfileAction.LABEL).run();
    });
    commands_1.CommandsRegistry.registerCommand(runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        instantiationService.createInstance(runtimeExtensionsEditor_1.SaveExtensionHostProfileAction, runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.ID, runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.LABEL).run();
    });
    // Running extensions
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: debugExtensionHostAction_1.DebugExtensionHostAction.ID,
            title: debugExtensionHostAction_1.DebugExtensionHostAction.LABEL,
            icon: codicons_1.Codicon.debugStart
        },
        group: 'navigation',
        when: contextkeys_1.ActiveEditorContext.isEqualTo(runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: runtimeExtensionsEditor_1.StartExtensionHostProfileAction.ID,
            title: runtimeExtensionsEditor_1.StartExtensionHostProfileAction.LABEL,
            icon: codicons_1.Codicon.circleFilled
        },
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ActiveEditorContext.isEqualTo(runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID), runtimeExtensionsEditor_1.CONTEXT_PROFILE_SESSION_STATE.notEqualsTo('running'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: runtimeExtensionsEditor_1.StopExtensionHostProfileAction.ID,
            title: runtimeExtensionsEditor_1.StopExtensionHostProfileAction.LABEL,
            icon: codicons_1.Codicon.debugStop
        },
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ActiveEditorContext.isEqualTo(runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID), runtimeExtensionsEditor_1.CONTEXT_PROFILE_SESSION_STATE.isEqualTo('running'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.ID,
            title: runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.LABEL,
            icon: codicons_1.Codicon.saveAll,
            precondition: runtimeExtensionsEditor_1.CONTEXT_EXTENSION_HOST_PROFILE_RECORDED
        },
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ActiveEditorContext.isEqualTo(runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID))
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2VsZWN0cm9uLXNhbmRib3gvZXh0ZW5zaW9ucy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUE0QmhHLGFBQWE7SUFDYixJQUFBLDhCQUFpQixFQUFDLHNEQUE0QixFQUFFLHFEQUEyQixvQ0FBNEIsQ0FBQztJQUV4Ryw0QkFBNEI7SUFDNUIsbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQUMsaURBQXVCLEVBQUUsaURBQXVCLENBQUMsRUFBRSxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLENBQUMsRUFDcEksQ0FBQyxJQUFJLDRCQUFjLENBQUMsK0NBQXNCLENBQUMsQ0FBQyxDQUM1QyxDQUFDO0lBRUYsTUFBTSxnQ0FBZ0M7UUFDckMsWUFBWSxDQUFDLFdBQXdCO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELFNBQVMsQ0FBQyxXQUF3QjtZQUNqQyxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFDRCxXQUFXLENBQUMsb0JBQTJDO1lBQ3RELE9BQU8sK0NBQXNCLENBQUMsUUFBUSxDQUFDO1FBQ3hDLENBQUM7S0FDRDtJQUVELG1CQUFRLENBQUMsRUFBRSxDQUF5Qix5QkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQywrQ0FBc0IsQ0FBQyxFQUFFLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztJQUcxSixpQkFBaUI7SUFFakIsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBdUI7UUFFNUIsWUFDOEMsMENBQXVG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