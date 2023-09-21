/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorConfigurationSchema", "vs/editor/contrib/codeAction/browser/codeActionCommands", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/editor/contrib/codeAction/browser/lightBulbWidget", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, editorExtensions_1, editorConfigurationSchema_1, codeActionCommands_1, codeActionController_1, lightBulbWidget_1, nls, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.registerEditorContribution)(codeActionController_1.CodeActionController.ID, codeActionController_1.CodeActionController, 3 /* EditorContributionInstantiation.Eventually */);
    (0, editorExtensions_1.registerEditorContribution)(lightBulbWidget_1.LightBulbWidget.ID, lightBulbWidget_1.LightBulbWidget, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.registerEditorAction)(codeActionCommands_1.QuickFixAction);
    (0, editorExtensions_1.registerEditorAction)(codeActionCommands_1.RefactorAction);
    (0, editorExtensions_1.registerEditorAction)(codeActionCommands_1.SourceAction);
    (0, editorExtensions_1.registerEditorAction)(codeActionCommands_1.OrganizeImportsAction);
    (0, editorExtensions_1.registerEditorAction)(codeActionCommands_1.AutoFixAction);
    (0, editorExtensions_1.registerEditorAction)(codeActionCommands_1.FixAllAction);
    (0, editorExtensions_1.registerEditorCommand)(new codeActionCommands_1.CodeActionCommand());
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        ...editorConfigurationSchema_1.editorConfigurationBaseNode,
        properties: {
            'editor.codeActionWidget.showHeaders': {
                type: 'boolean',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                description: nls.localize('showCodeActionHeaders', "Enable/disable showing group headers in the Code Action menu."),
                default: true,
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbkNvbnRyaWJ1dGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2RlQWN0aW9uL2Jyb3dzZXIvY29kZUFjdGlvbkNvbnRyaWJ1dGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFXaEcsSUFBQSw2Q0FBMEIsRUFBQywyQ0FBb0IsQ0FBQyxFQUFFLEVBQUUsMkNBQW9CLHFEQUE2QyxDQUFDO0lBQ3RILElBQUEsNkNBQTBCLEVBQUMsaUNBQWUsQ0FBQyxFQUFFLEVBQUUsaUNBQWUsK0NBQXVDLENBQUM7SUFDdEcsSUFBQSx1Q0FBb0IsRUFBQyxtQ0FBYyxDQUFDLENBQUM7SUFDckMsSUFBQSx1Q0FBb0IsRUFBQyxtQ0FBYyxDQUFDLENBQUM7SUFDckMsSUFBQSx1Q0FBb0IsRUFBQyxpQ0FBWSxDQUFDLENBQUM7SUFDbkMsSUFBQSx1Q0FBb0IsRUFBQywwQ0FBcUIsQ0FBQyxDQUFDO0lBQzVDLElBQUEsdUNBQW9CLEVBQUMsa0NBQWEsQ0FBQyxDQUFDO0lBQ3BDLElBQUEsdUNBQW9CLEVBQUMsaUNBQVksQ0FBQyxDQUFDO0lBQ25DLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxzQ0FBaUIsRUFBRSxDQUFDLENBQUM7SUFFL0MsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUFVLENBQUMsYUFBYSxDQUFDLENBQUMscUJBQXFCLENBQUM7UUFDbkYsR0FBRyx1REFBMkI7UUFDOUIsVUFBVSxFQUFFO1lBQ1gscUNBQXFDLEVBQUU7Z0JBQ3RDLElBQUksRUFBRSxTQUFTO2dCQUNmLEtBQUssaURBQXlDO2dCQUM5QyxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSwrREFBK0QsQ0FBQztnQkFDbkgsT0FBTyxFQUFFLElBQUk7YUFDYjtTQUNEO0tBQ0QsQ0FBQyxDQUFDIn0=