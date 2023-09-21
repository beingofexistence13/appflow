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
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, nls_1, platform_1, actions_1, configuration_1, contextkey_1, platform_2, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleMultiCursorModifierAction = void 0;
    class ToggleMultiCursorModifierAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleMultiCursorModifier'; }
        static { this.multiCursorModifierConfigurationKey = 'editor.multiCursorModifier'; }
        constructor() {
            super({
                id: ToggleMultiCursorModifierAction.ID,
                title: { value: (0, nls_1.localize)('toggleLocation', "Toggle Multi-Cursor Modifier"), original: 'Toggle Multi-Cursor Modifier' },
                f1: true
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const editorConf = configurationService.getValue('editor');
            const newValue = (editorConf.multiCursorModifier === 'ctrlCmd' ? 'alt' : 'ctrlCmd');
            return configurationService.updateValue(ToggleMultiCursorModifierAction.multiCursorModifierConfigurationKey, newValue);
        }
    }
    exports.ToggleMultiCursorModifierAction = ToggleMultiCursorModifierAction;
    const multiCursorModifier = new contextkey_1.RawContextKey('multiCursorModifier', 'altKey');
    let MultiCursorModifierContextKeyController = class MultiCursorModifierContextKeyController {
        constructor(configurationService, contextKeyService) {
            this.configurationService = configurationService;
            this._multiCursorModifier = multiCursorModifier.bindTo(contextKeyService);
            this._update();
            configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('editor.multiCursorModifier')) {
                    this._update();
                }
            });
        }
        _update() {
            const editorConf = this.configurationService.getValue('editor');
            const value = (editorConf.multiCursorModifier === 'ctrlCmd' ? 'ctrlCmd' : 'altKey');
            this._multiCursorModifier.set(value);
        }
    };
    MultiCursorModifierContextKeyController = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, contextkey_1.IContextKeyService)
    ], MultiCursorModifierContextKeyController);
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(MultiCursorModifierContextKeyController, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.registerAction2)(ToggleMultiCursorModifierAction);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSelectionMenu, {
        group: '4_config',
        command: {
            id: ToggleMultiCursorModifierAction.ID,
            title: (0, nls_1.localize)('miMultiCursorAlt', "Switch to Alt+Click for Multi-Cursor")
        },
        when: multiCursorModifier.isEqualTo('ctrlCmd'),
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSelectionMenu, {
        group: '4_config',
        command: {
            id: ToggleMultiCursorModifierAction.ID,
            title: (platform_1.isMacintosh
                ? (0, nls_1.localize)('miMultiCursorCmd', "Switch to Cmd+Click for Multi-Cursor")
                : (0, nls_1.localize)('miMultiCursorCtrl', "Switch to Ctrl+Click for Multi-Cursor"))
        },
        when: multiCursorModifier.isEqualTo('altKey'),
        order: 1
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlTXVsdGlDdXJzb3JNb2RpZmllci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci90b2dnbGVNdWx0aUN1cnNvck1vZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVloRyxNQUFhLCtCQUFnQyxTQUFRLGlCQUFPO2lCQUUzQyxPQUFFLEdBQUcsNENBQTRDLENBQUM7aUJBRTFDLHdDQUFtQyxHQUFHLDRCQUE0QixDQUFDO1FBRTNGO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwrQkFBK0IsQ0FBQyxFQUFFO2dCQUN0QyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsOEJBQThCLENBQUMsRUFBRSxRQUFRLEVBQUUsOEJBQThCLEVBQUU7Z0JBQ3RILEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEdBQUcsQ0FBQyxRQUEwQjtZQUN0QyxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUVqRSxNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQTZDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZHLE1BQU0sUUFBUSxHQUFzQixDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdkcsT0FBTyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsK0JBQStCLENBQUMsbUNBQW1DLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEgsQ0FBQzs7SUFyQkYsMEVBc0JDO0lBRUQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLDBCQUFhLENBQVMscUJBQXFCLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFdkYsSUFBTSx1Q0FBdUMsR0FBN0MsTUFBTSx1Q0FBdUM7UUFJNUMsWUFDeUMsb0JBQTJDLEVBQy9ELGlCQUFxQztZQURqQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBR25GLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUUxRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNuRCxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFO29CQUN6RCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ2Y7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxPQUFPO1lBQ2QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBNkMsUUFBUSxDQUFDLENBQUM7WUFDNUcsTUFBTSxLQUFLLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQztLQUNELENBQUE7SUF2QkssdUNBQXVDO1FBSzFDLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSwrQkFBa0IsQ0FBQTtPQU5mLHVDQUF1QyxDQXVCNUM7SUFFRCxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsdUNBQXVDLGtDQUEwQixDQUFDO0lBRTVLLElBQUEseUJBQWUsRUFBQywrQkFBK0IsQ0FBQyxDQUFDO0lBRWpELHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsb0JBQW9CLEVBQUU7UUFDeEQsS0FBSyxFQUFFLFVBQVU7UUFDakIsT0FBTyxFQUFFO1lBQ1IsRUFBRSxFQUFFLCtCQUErQixDQUFDLEVBQUU7WUFDdEMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLHNDQUFzQyxDQUFDO1NBQzNFO1FBQ0QsSUFBSSxFQUFFLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFDOUMsS0FBSyxFQUFFLENBQUM7S0FDUixDQUFDLENBQUM7SUFDSCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLG9CQUFvQixFQUFFO1FBQ3hELEtBQUssRUFBRSxVQUFVO1FBQ2pCLE9BQU8sRUFBRTtZQUNSLEVBQUUsRUFBRSwrQkFBK0IsQ0FBQyxFQUFFO1lBQ3RDLEtBQUssRUFBRSxDQUNOLHNCQUFXO2dCQUNWLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxzQ0FBc0MsQ0FBQztnQkFDdEUsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLHVDQUF1QyxDQUFDLENBQ3pFO1NBQ0Q7UUFDRCxJQUFJLEVBQUUsbUJBQW1CLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUM3QyxLQUFLLEVBQUUsQ0FBQztLQUNSLENBQUMsQ0FBQyJ9