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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/electron-sandbox/extensions.contribution", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/workbench/common/contributions", "vs/platform/instantiation/common/descriptors", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/editor", "vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor", "vs/workbench/contrib/extensions/electron-sandbox/debugExtensionHostAction", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/extensions/electron-sandbox/extensionsActions", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/ipc/electron-sandbox/services", "vs/platform/extensionRecommendations/common/extensionRecommendationsIpc", "vs/base/common/codicons", "vs/workbench/contrib/extensions/electron-sandbox/remoteExtensionsInit", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/extensions/electron-sandbox/extensionProfileService", "vs/workbench/contrib/extensions/electron-sandbox/extensionsAutoProfiler"], function (require, exports, nls_1, platform_1, actions_1, contributions_1, descriptors_1, commands_1, instantiation_1, editor_1, runtimeExtensionsEditor_1, debugExtensionHostAction_1, editor_2, contextkeys_1, runtimeExtensionsInput_1, contextkey_1, extensionsActions_1, extensionRecommendations_1, services_1, extensionRecommendationsIpc_1, codicons_1, remoteExtensionsInit_1, extensions_1, extensionProfileService_1, extensionsAutoProfiler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Singletons
    (0, extensions_1.$mr)(runtimeExtensionsEditor_1.$kac, extensionProfileService_1.$wac, 1 /* InstantiationType.Delayed */);
    // Running Extensions Editor
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(runtimeExtensionsEditor_1.$nac, runtimeExtensionsEditor_1.$nac.ID, (0, nls_1.localize)(0, null)), [new descriptors_1.$yh(runtimeExtensionsInput_1.$5Ub)]);
    class RuntimeExtensionsInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '';
        }
        deserialize(instantiationService) {
            return runtimeExtensionsInput_1.$5Ub.instance;
        }
    }
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(runtimeExtensionsInput_1.$5Ub.ID, RuntimeExtensionsInputSerializer);
    // Global actions
    let ExtensionsContributions = class ExtensionsContributions {
        constructor(extensionRecommendationNotificationService, sharedProcessService) {
            sharedProcessService.registerChannel('extensionRecommendationNotification', new extensionRecommendationsIpc_1.$i8b(extensionRecommendationNotificationService));
            (0, actions_1.$Xu)(extensionsActions_1.$sac);
            (0, actions_1.$Xu)(extensionsActions_1.$tac);
        }
    };
    ExtensionsContributions = __decorate([
        __param(0, extensionRecommendations_1.$TUb),
        __param(1, services_1.$A7b)
    ], ExtensionsContributions);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsAutoProfiler_1.$xac, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(remoteExtensionsInit_1.$uac, 3 /* LifecyclePhase.Restored */);
    // Register Commands
    commands_1.$Gr.registerCommand(debugExtensionHostAction_1.$rac.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.$Ah);
        instantiationService.createInstance(debugExtensionHostAction_1.$rac).run();
    });
    commands_1.$Gr.registerCommand(runtimeExtensionsEditor_1.$oac.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.$Ah);
        instantiationService.createInstance(runtimeExtensionsEditor_1.$oac, runtimeExtensionsEditor_1.$oac.ID, runtimeExtensionsEditor_1.$oac.LABEL).run();
    });
    commands_1.$Gr.registerCommand(runtimeExtensionsEditor_1.$pac.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.$Ah);
        instantiationService.createInstance(runtimeExtensionsEditor_1.$pac, runtimeExtensionsEditor_1.$pac.ID, runtimeExtensionsEditor_1.$pac.LABEL).run();
    });
    commands_1.$Gr.registerCommand(runtimeExtensionsEditor_1.$qac.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.$Ah);
        instantiationService.createInstance(runtimeExtensionsEditor_1.$qac, runtimeExtensionsEditor_1.$qac.ID, runtimeExtensionsEditor_1.$qac.LABEL).run();
    });
    // Running extensions
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: debugExtensionHostAction_1.$rac.ID,
            title: debugExtensionHostAction_1.$rac.LABEL,
            icon: codicons_1.$Pj.debugStart
        },
        group: 'navigation',
        when: contextkeys_1.$$cb.isEqualTo(runtimeExtensionsEditor_1.$nac.ID)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: runtimeExtensionsEditor_1.$oac.ID,
            title: runtimeExtensionsEditor_1.$oac.LABEL,
            icon: codicons_1.$Pj.circleFilled
        },
        group: 'navigation',
        when: contextkey_1.$Ii.and(contextkeys_1.$$cb.isEqualTo(runtimeExtensionsEditor_1.$nac.ID), runtimeExtensionsEditor_1.$lac.notEqualsTo('running'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: runtimeExtensionsEditor_1.$pac.ID,
            title: runtimeExtensionsEditor_1.$pac.LABEL,
            icon: codicons_1.$Pj.debugStop
        },
        group: 'navigation',
        when: contextkey_1.$Ii.and(contextkeys_1.$$cb.isEqualTo(runtimeExtensionsEditor_1.$nac.ID), runtimeExtensionsEditor_1.$lac.isEqualTo('running'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: runtimeExtensionsEditor_1.$qac.ID,
            title: runtimeExtensionsEditor_1.$qac.LABEL,
            icon: codicons_1.$Pj.saveAll,
            precondition: runtimeExtensionsEditor_1.$mac
        },
        group: 'navigation',
        when: contextkey_1.$Ii.and(contextkeys_1.$$cb.isEqualTo(runtimeExtensionsEditor_1.$nac.ID))
    });
});
//# sourceMappingURL=extensions.contribution.js.map