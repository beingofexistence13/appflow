/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/language/common/languageService"], function (require, exports, nls, extensionsRegistry_1, languageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.customEditorsExtensionPoint = void 0;
    const Fields = Object.freeze({
        viewType: 'viewType',
        displayName: 'displayName',
        selector: 'selector',
        priority: 'priority',
    });
    const CustomEditorsContribution = {
        description: nls.localize('contributes.customEditors', 'Contributed custom editors.'),
        type: 'array',
        defaultSnippets: [{
                body: [{
                        [Fields.viewType]: '$1',
                        [Fields.displayName]: '$2',
                        [Fields.selector]: [{
                                filenamePattern: '$3'
                            }],
                    }]
            }],
        items: {
            type: 'object',
            required: [
                Fields.viewType,
                Fields.displayName,
                Fields.selector,
            ],
            properties: {
                [Fields.viewType]: {
                    type: 'string',
                    markdownDescription: nls.localize('contributes.viewType', 'Identifier for the custom editor. This must be unique across all custom editors, so we recommend including your extension id as part of `viewType`. The `viewType` is used when registering custom editors with `vscode.registerCustomEditorProvider` and in the `onCustomEditor:${id}` [activation event](https://code.visualstudio.com/api/references/activation-events).'),
                },
                [Fields.displayName]: {
                    type: 'string',
                    description: nls.localize('contributes.displayName', 'Human readable name of the custom editor. This is displayed to users when selecting which editor to use.'),
                },
                [Fields.selector]: {
                    type: 'array',
                    description: nls.localize('contributes.selector', 'Set of globs that the custom editor is enabled for.'),
                    items: {
                        type: 'object',
                        defaultSnippets: [{
                                body: {
                                    filenamePattern: '$1',
                                }
                            }],
                        properties: {
                            filenamePattern: {
                                type: 'string',
                                description: nls.localize('contributes.selector.filenamePattern', 'Glob that the custom editor is enabled for.'),
                            },
                        }
                    }
                },
                [Fields.priority]: {
                    type: 'string',
                    markdownDeprecationMessage: nls.localize('contributes.priority', 'Controls if the custom editor is enabled automatically when the user opens a file. This may be overridden by users using the `workbench.editorAssociations` setting.'),
                    enum: [
                        "default" /* CustomEditorPriority.default */,
                        "option" /* CustomEditorPriority.option */,
                    ],
                    markdownEnumDescriptions: [
                        nls.localize('contributes.priority.default', 'The editor is automatically used when the user opens a resource, provided that no other default custom editors are registered for that resource.'),
                        nls.localize('contributes.priority.option', 'The editor is not automatically used when the user opens a resource, but a user can switch to the editor using the `Reopen With` command.'),
                    ],
                    default: 'default'
                }
            }
        }
    };
    exports.customEditorsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'customEditors',
        deps: [languageService_1.languagesExtPoint],
        jsonSchema: CustomEditorsContribution,
        activationEventsGenerator: (contribs, result) => {
            for (const contrib of contribs) {
                const viewType = contrib[Fields.viewType];
                if (viewType) {
                    result.push(`onCustomEditor:${viewType}`);
                }
            }
        },
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUG9pbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jdXN0b21FZGl0b3IvY29tbW9uL2V4dGVuc2lvblBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFdBQVcsRUFBRSxhQUFhO1FBQzFCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFFBQVEsRUFBRSxVQUFVO0tBQ3BCLENBQUMsQ0FBQztJQVNILE1BQU0seUJBQXlCLEdBQWdCO1FBQzlDLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLDZCQUE2QixDQUFDO1FBQ3JGLElBQUksRUFBRSxPQUFPO1FBQ2IsZUFBZSxFQUFFLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxDQUFDO3dCQUNOLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUk7d0JBQ3ZCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUk7d0JBQzFCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0NBQ25CLGVBQWUsRUFBRSxJQUFJOzZCQUNyQixDQUFDO3FCQUNGLENBQUM7YUFDRixDQUFDO1FBQ0YsS0FBSyxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLEVBQUU7Z0JBQ1QsTUFBTSxDQUFDLFFBQVE7Z0JBQ2YsTUFBTSxDQUFDLFdBQVc7Z0JBQ2xCLE1BQU0sQ0FBQyxRQUFRO2FBQ2Y7WUFDRCxVQUFVLEVBQUU7Z0JBQ1gsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ2xCLElBQUksRUFBRSxRQUFRO29CQUNkLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsNldBQTZXLENBQUM7aUJBQ3hhO2dCQUNELENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUNyQixJQUFJLEVBQUUsUUFBUTtvQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSwwR0FBMEcsQ0FBQztpQkFDaEs7Z0JBQ0QsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ2xCLElBQUksRUFBRSxPQUFPO29CQUNiLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLHFEQUFxRCxDQUFDO29CQUN4RyxLQUFLLEVBQUU7d0JBQ04sSUFBSSxFQUFFLFFBQVE7d0JBQ2QsZUFBZSxFQUFFLENBQUM7Z0NBQ2pCLElBQUksRUFBRTtvQ0FDTCxlQUFlLEVBQUUsSUFBSTtpQ0FDckI7NkJBQ0QsQ0FBQzt3QkFDRixVQUFVLEVBQUU7NEJBQ1gsZUFBZSxFQUFFO2dDQUNoQixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsRUFBRSw2Q0FBNkMsQ0FBQzs2QkFDaEg7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7Z0JBQ0QsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ2xCLElBQUksRUFBRSxRQUFRO29CQUNkLDBCQUEwQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsc0tBQXNLLENBQUM7b0JBQ3hPLElBQUksRUFBRTs7O3FCQUdMO29CQUNELHdCQUF3QixFQUFFO3dCQUN6QixHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLGtKQUFrSixDQUFDO3dCQUNoTSxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLDJJQUEySSxDQUFDO3FCQUN4TDtvQkFDRCxPQUFPLEVBQUUsU0FBUztpQkFDbEI7YUFDRDtTQUNEO0tBQ0QsQ0FBQztJQUVXLFFBQUEsMkJBQTJCLEdBQUcsdUNBQWtCLENBQUMsc0JBQXNCLENBQWlDO1FBQ3BILGNBQWMsRUFBRSxlQUFlO1FBQy9CLElBQUksRUFBRSxDQUFDLG1DQUFpQixDQUFDO1FBQ3pCLFVBQVUsRUFBRSx5QkFBeUI7UUFDckMseUJBQXlCLEVBQUUsQ0FBQyxRQUF3QyxFQUFFLE1BQW9DLEVBQUUsRUFBRTtZQUM3RyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtnQkFDL0IsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsUUFBUSxFQUFFLENBQUMsQ0FBQztpQkFDMUM7YUFDRDtRQUNGLENBQUM7S0FDRCxDQUFDLENBQUMifQ==