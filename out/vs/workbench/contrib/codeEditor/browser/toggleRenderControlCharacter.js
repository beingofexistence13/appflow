/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, actions_1, configuration_1, contextkey_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleRenderControlCharacterAction = void 0;
    class ToggleRenderControlCharacterAction extends actions_1.Action2 {
        static { this.ID = 'editor.action.toggleRenderControlCharacter'; }
        constructor() {
            super({
                id: ToggleRenderControlCharacterAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleRenderControlCharacters', "Toggle Control Characters"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miToggleRenderControlCharacters', comment: ['&& denotes a mnemonic'] }, "Render &&Control Characters"),
                    original: 'Toggle Control Characters'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkey_1.ContextKeyExpr.equals('config.editor.renderControlCharacters', true),
                menu: {
                    id: actions_1.MenuId.MenubarAppearanceMenu,
                    group: '4_editor',
                    order: 5
                }
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newRenderControlCharacters = !configurationService.getValue('editor.renderControlCharacters');
            return configurationService.updateValue('editor.renderControlCharacters', newRenderControlCharacters);
        }
    }
    exports.ToggleRenderControlCharacterAction = ToggleRenderControlCharacterAction;
    (0, actions_1.registerAction2)(ToggleRenderControlCharacterAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlUmVuZGVyQ29udHJvbENoYXJhY3Rlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci90b2dnbGVSZW5kZXJDb250cm9sQ2hhcmFjdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLGtDQUFtQyxTQUFRLGlCQUFPO2lCQUU5QyxPQUFFLEdBQUcsNENBQTRDLENBQUM7UUFFbEU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtDQUFrQyxDQUFDLEVBQUU7Z0JBQ3pDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsK0JBQStCLEVBQUUsMkJBQTJCLENBQUM7b0JBQzdFLGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxpQ0FBaUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsNkJBQTZCLENBQUM7b0JBQ3RJLFFBQVEsRUFBRSwyQkFBMkI7aUJBQ3JDO2dCQUNELFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7Z0JBQ3pCLEVBQUUsRUFBRSxJQUFJO2dCQUNSLE9BQU8sRUFBRSwyQkFBYyxDQUFDLE1BQU0sQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUM7Z0JBQzdFLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxxQkFBcUI7b0JBQ2hDLEtBQUssRUFBRSxVQUFVO29CQUNqQixLQUFLLEVBQUUsQ0FBQztpQkFDUjthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxHQUFHLENBQUMsUUFBMEI7WUFDdEMsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7WUFFakUsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBVSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQzdHLE9BQU8sb0JBQW9CLENBQUMsV0FBVyxDQUFDLGdDQUFnQyxFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFDdkcsQ0FBQzs7SUE1QkYsZ0ZBNkJDO0lBRUQsSUFBQSx5QkFBZSxFQUFDLGtDQUFrQyxDQUFDLENBQUMifQ==