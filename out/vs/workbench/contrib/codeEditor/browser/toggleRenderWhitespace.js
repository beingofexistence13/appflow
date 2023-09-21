/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, actions_1, configuration_1, contextkey_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToggleRenderWhitespaceAction extends actions_1.Action2 {
        static { this.ID = 'editor.action.toggleRenderWhitespace'; }
        constructor() {
            super({
                id: ToggleRenderWhitespaceAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleRenderWhitespace', "Toggle Render Whitespace"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miToggleRenderWhitespace', comment: ['&& denotes a mnemonic'] }, "&&Render Whitespace"),
                    original: 'Toggle Render Whitespace'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkey_1.ContextKeyExpr.notEquals('config.editor.renderWhitespace', 'none'),
                menu: {
                    id: actions_1.MenuId.MenubarAppearanceMenu,
                    group: '4_editor',
                    order: 4
                }
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const renderWhitespace = configurationService.getValue('editor.renderWhitespace');
            let newRenderWhitespace;
            if (renderWhitespace === 'none') {
                newRenderWhitespace = 'all';
            }
            else {
                newRenderWhitespace = 'none';
            }
            return configurationService.updateValue('editor.renderWhitespace', newRenderWhitespace);
        }
    }
    (0, actions_1.registerAction2)(ToggleRenderWhitespaceAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlUmVuZGVyV2hpdGVzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci90b2dnbGVSZW5kZXJXaGl0ZXNwYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLE1BQU0sNEJBQTZCLFNBQVEsaUJBQU87aUJBRWpDLE9BQUUsR0FBRyxzQ0FBc0MsQ0FBQztRQUU1RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNEJBQTRCLENBQUMsRUFBRTtnQkFDbkMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx3QkFBd0IsRUFBRSwwQkFBMEIsQ0FBQztvQkFDckUsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLDBCQUEwQixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQztvQkFDdkgsUUFBUSxFQUFFLDBCQUEwQjtpQkFDcEM7Z0JBQ0QsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsT0FBTyxFQUFFLDJCQUFjLENBQUMsU0FBUyxDQUFDLGdDQUFnQyxFQUFFLE1BQU0sQ0FBQztnQkFDM0UsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLHFCQUFxQjtvQkFDaEMsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLEtBQUssRUFBRSxDQUFDO2lCQUNSO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEdBQUcsQ0FBQyxRQUEwQjtZQUN0QyxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUVqRSxNQUFNLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBUyx5QkFBeUIsQ0FBQyxDQUFDO1lBRTFGLElBQUksbUJBQTJCLENBQUM7WUFDaEMsSUFBSSxnQkFBZ0IsS0FBSyxNQUFNLEVBQUU7Z0JBQ2hDLG1CQUFtQixHQUFHLEtBQUssQ0FBQzthQUM1QjtpQkFBTTtnQkFDTixtQkFBbUIsR0FBRyxNQUFNLENBQUM7YUFDN0I7WUFFRCxPQUFPLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7O0lBR0YsSUFBQSx5QkFBZSxFQUFDLDRCQUE0QixDQUFDLENBQUMifQ==