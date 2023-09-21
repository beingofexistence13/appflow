/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/language/common/languageService"], function (require, exports, nls, languageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.codeActionsExtensionPointDescriptor = void 0;
    var CodeActionExtensionPointFields;
    (function (CodeActionExtensionPointFields) {
        CodeActionExtensionPointFields["languages"] = "languages";
        CodeActionExtensionPointFields["actions"] = "actions";
        CodeActionExtensionPointFields["kind"] = "kind";
        CodeActionExtensionPointFields["title"] = "title";
        CodeActionExtensionPointFields["description"] = "description";
    })(CodeActionExtensionPointFields || (CodeActionExtensionPointFields = {}));
    const codeActionsExtensionPointSchema = Object.freeze({
        type: 'array',
        markdownDescription: nls.localize('contributes.codeActions', "Configure which editor to use for a resource."),
        items: {
            type: 'object',
            required: [CodeActionExtensionPointFields.languages, CodeActionExtensionPointFields.actions],
            properties: {
                [CodeActionExtensionPointFields.languages]: {
                    type: 'array',
                    description: nls.localize('contributes.codeActions.languages', "Language modes that the code actions are enabled for."),
                    items: { type: 'string' }
                },
                [CodeActionExtensionPointFields.actions]: {
                    type: 'object',
                    required: [CodeActionExtensionPointFields.kind, CodeActionExtensionPointFields.title],
                    properties: {
                        [CodeActionExtensionPointFields.kind]: {
                            type: 'string',
                            markdownDescription: nls.localize('contributes.codeActions.kind', "`CodeActionKind` of the contributed code action."),
                        },
                        [CodeActionExtensionPointFields.title]: {
                            type: 'string',
                            description: nls.localize('contributes.codeActions.title', "Label for the code action used in the UI."),
                        },
                        [CodeActionExtensionPointFields.description]: {
                            type: 'string',
                            description: nls.localize('contributes.codeActions.description', "Description of what the code action does."),
                        },
                    }
                }
            }
        }
    });
    exports.codeActionsExtensionPointDescriptor = {
        extensionPoint: 'codeActions',
        deps: [languageService_1.languagesExtPoint],
        jsonSchema: codeActionsExtensionPointSchema
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbnNFeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVBY3Rpb25zL2NvbW1vbi9jb2RlQWN0aW9uc0V4dGVuc2lvblBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxJQUFLLDhCQU1KO0lBTkQsV0FBSyw4QkFBOEI7UUFDbEMseURBQXVCLENBQUE7UUFDdkIscURBQW1CLENBQUE7UUFDbkIsK0NBQWEsQ0FBQTtRQUNiLGlEQUFlLENBQUE7UUFDZiw2REFBMkIsQ0FBQTtJQUM1QixDQUFDLEVBTkksOEJBQThCLEtBQTlCLDhCQUE4QixRQU1sQztJQWFELE1BQU0sK0JBQStCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBK0I7UUFDbkYsSUFBSSxFQUFFLE9BQU87UUFDYixtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLCtDQUErQyxDQUFDO1FBQzdHLEtBQUssRUFBRTtZQUNOLElBQUksRUFBRSxRQUFRO1lBQ2QsUUFBUSxFQUFFLENBQUMsOEJBQThCLENBQUMsU0FBUyxFQUFFLDhCQUE4QixDQUFDLE9BQU8sQ0FBQztZQUM1RixVQUFVLEVBQUU7Z0JBQ1gsQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDM0MsSUFBSSxFQUFFLE9BQU87b0JBQ2IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUNBQW1DLEVBQUUsdURBQXVELENBQUM7b0JBQ3ZILEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7aUJBQ3pCO2dCQUNELENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3pDLElBQUksRUFBRSxRQUFRO29CQUNkLFFBQVEsRUFBRSxDQUFDLDhCQUE4QixDQUFDLElBQUksRUFBRSw4QkFBOEIsQ0FBQyxLQUFLLENBQUM7b0JBQ3JGLFVBQVUsRUFBRTt3QkFDWCxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUN0QyxJQUFJLEVBQUUsUUFBUTs0QkFDZCxtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLGtEQUFrRCxDQUFDO3lCQUNySDt3QkFDRCxDQUFDLDhCQUE4QixDQUFDLEtBQUssQ0FBQyxFQUFFOzRCQUN2QyxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSwyQ0FBMkMsQ0FBQzt5QkFDdkc7d0JBQ0QsQ0FBQyw4QkFBOEIsQ0FBQyxXQUFXLENBQUMsRUFBRTs0QkFDN0MsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUNBQXFDLEVBQUUsMkNBQTJDLENBQUM7eUJBQzdHO3FCQUNEO2lCQUNEO2FBQ0Q7U0FDRDtLQUNELENBQUMsQ0FBQztJQUVVLFFBQUEsbUNBQW1DLEdBQUc7UUFDbEQsY0FBYyxFQUFFLGFBQWE7UUFDN0IsSUFBSSxFQUFFLENBQUMsbUNBQWlCLENBQUM7UUFDekIsVUFBVSxFQUFFLCtCQUErQjtLQUMzQyxDQUFDIn0=