/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/language/common/languageService"], function (require, exports, nls, languageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.documentationExtensionPointDescriptor = void 0;
    var DocumentationExtensionPointFields;
    (function (DocumentationExtensionPointFields) {
        DocumentationExtensionPointFields["when"] = "when";
        DocumentationExtensionPointFields["title"] = "title";
        DocumentationExtensionPointFields["command"] = "command";
    })(DocumentationExtensionPointFields || (DocumentationExtensionPointFields = {}));
    const documentationExtensionPointSchema = Object.freeze({
        type: 'object',
        description: nls.localize('contributes.documentation', "Contributed documentation."),
        properties: {
            'refactoring': {
                type: 'array',
                description: nls.localize('contributes.documentation.refactorings', "Contributed documentation for refactorings."),
                items: {
                    type: 'object',
                    description: nls.localize('contributes.documentation.refactoring', "Contributed documentation for refactoring."),
                    required: [
                        DocumentationExtensionPointFields.title,
                        DocumentationExtensionPointFields.when,
                        DocumentationExtensionPointFields.command
                    ],
                    properties: {
                        [DocumentationExtensionPointFields.title]: {
                            type: 'string',
                            description: nls.localize('contributes.documentation.refactoring.title', "Label for the documentation used in the UI."),
                        },
                        [DocumentationExtensionPointFields.when]: {
                            type: 'string',
                            description: nls.localize('contributes.documentation.refactoring.when', "When clause."),
                        },
                        [DocumentationExtensionPointFields.command]: {
                            type: 'string',
                            description: nls.localize('contributes.documentation.refactoring.command', "Command executed."),
                        },
                    },
                }
            }
        }
    });
    exports.documentationExtensionPointDescriptor = {
        extensionPoint: 'documentation',
        deps: [languageService_1.languagesExtPoint],
        jsonSchema: documentationExtensionPointSchema
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRhdGlvbkV4dGVuc2lvblBvaW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUFjdGlvbnMvY29tbW9uL2RvY3VtZW50YXRpb25FeHRlbnNpb25Qb2ludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsSUFBSyxpQ0FJSjtJQUpELFdBQUssaUNBQWlDO1FBQ3JDLGtEQUFhLENBQUE7UUFDYixvREFBZSxDQUFBO1FBQ2Ysd0RBQW1CLENBQUE7SUFDcEIsQ0FBQyxFQUpJLGlDQUFpQyxLQUFqQyxpQ0FBaUMsUUFJckM7SUFZRCxNQUFNLGlDQUFpQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQStCO1FBQ3JGLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsNEJBQTRCLENBQUM7UUFDcEYsVUFBVSxFQUFFO1lBQ1gsYUFBYSxFQUFFO2dCQUNkLElBQUksRUFBRSxPQUFPO2dCQUNiLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHdDQUF3QyxFQUFFLDZDQUE2QyxDQUFDO2dCQUNsSCxLQUFLLEVBQUU7b0JBQ04sSUFBSSxFQUFFLFFBQVE7b0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUNBQXVDLEVBQUUsNENBQTRDLENBQUM7b0JBQ2hILFFBQVEsRUFBRTt3QkFDVCxpQ0FBaUMsQ0FBQyxLQUFLO3dCQUN2QyxpQ0FBaUMsQ0FBQyxJQUFJO3dCQUN0QyxpQ0FBaUMsQ0FBQyxPQUFPO3FCQUN6QztvQkFDRCxVQUFVLEVBQUU7d0JBQ1gsQ0FBQyxpQ0FBaUMsQ0FBQyxLQUFLLENBQUMsRUFBRTs0QkFDMUMsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkNBQTZDLEVBQUUsNkNBQTZDLENBQUM7eUJBQ3ZIO3dCQUNELENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ3pDLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDRDQUE0QyxFQUFFLGNBQWMsQ0FBQzt5QkFDdkY7d0JBQ0QsQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsRUFBRTs0QkFDNUMsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0NBQStDLEVBQUUsbUJBQW1CLENBQUM7eUJBQy9GO3FCQUNEO2lCQUNEO2FBQ0Q7U0FDRDtLQUNELENBQUMsQ0FBQztJQUVVLFFBQUEscUNBQXFDLEdBQUc7UUFDcEQsY0FBYyxFQUFFLGVBQWU7UUFDL0IsSUFBSSxFQUFFLENBQUMsbUNBQWlCLENBQUM7UUFDekIsVUFBVSxFQUFFLGlDQUFpQztLQUM3QyxDQUFDIn0=