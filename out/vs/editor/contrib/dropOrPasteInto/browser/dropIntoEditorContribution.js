/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorConfigurationSchema", "vs/editor/common/editorFeatures", "vs/editor/contrib/dropOrPasteInto/browser/defaultProviders", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "./dropIntoEditorController"], function (require, exports, editorExtensions_1, editorConfigurationSchema_1, editorFeatures_1, defaultProviders_1, nls, configurationRegistry_1, platform_1, dropIntoEditorController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.registerEditorContribution)(dropIntoEditorController_1.DropIntoEditorController.ID, dropIntoEditorController_1.DropIntoEditorController, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorCommand)(new class extends editorExtensions_1.EditorCommand {
        constructor() {
            super({
                id: dropIntoEditorController_1.changeDropTypeCommandId,
                precondition: dropIntoEditorController_1.dropWidgetVisibleCtx,
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
                }
            });
        }
        runEditorCommand(_accessor, editor, _args) {
            dropIntoEditorController_1.DropIntoEditorController.get(editor)?.changeDropType();
        }
    });
    (0, editorFeatures_1.registerEditorFeature)(defaultProviders_1.DefaultDropProvidersFeature);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        ...editorConfigurationSchema_1.editorConfigurationBaseNode,
        properties: {
            [dropIntoEditorController_1.defaultProviderConfig]: {
                type: 'object',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                description: nls.localize('defaultProviderDescription', "Configures the default drop provider to use for content of a given mime type."),
                default: {},
                additionalProperties: {
                    type: 'string',
                },
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcEludG9FZGl0b3JDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9kcm9wT3JQYXN0ZUludG8vYnJvd3Nlci9kcm9wSW50b0VkaXRvckNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWNoRyxJQUFBLDZDQUEwQixFQUFDLG1EQUF3QixDQUFDLEVBQUUsRUFBRSxtREFBd0IsaUVBQXlELENBQUM7SUFFMUksSUFBQSx3Q0FBcUIsRUFBQyxJQUFJLEtBQU0sU0FBUSxnQ0FBYTtRQUNwRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsa0RBQXVCO2dCQUMzQixZQUFZLEVBQUUsK0NBQW9CO2dCQUNsQyxNQUFNLEVBQUU7b0JBQ1AsTUFBTSwwQ0FBZ0M7b0JBQ3RDLE9BQU8sRUFBRSxtREFBK0I7aUJBQ3hDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVlLGdCQUFnQixDQUFDLFNBQWtDLEVBQUUsTUFBbUIsRUFBRSxLQUFVO1lBQ25HLG1EQUF3QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBQztRQUN4RCxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSxzQ0FBcUIsRUFBQyw4Q0FBMkIsQ0FBQyxDQUFDO0lBRW5ELG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztRQUNoRyxHQUFHLHVEQUEyQjtRQUM5QixVQUFVLEVBQUU7WUFDWCxDQUFDLGdEQUFxQixDQUFDLEVBQUU7Z0JBQ3hCLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssaURBQXlDO2dCQUM5QyxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSwrRUFBK0UsQ0FBQztnQkFDeEksT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsb0JBQW9CLEVBQUU7b0JBQ3JCLElBQUksRUFBRSxRQUFRO2lCQUNkO2FBQ0Q7U0FDRDtLQUNELENBQUMsQ0FBQyJ9