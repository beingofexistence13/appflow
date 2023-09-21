/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, nls_1, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsConfigurationInitialContent = exports.ExtensionsConfigurationSchema = exports.ExtensionsConfigurationSchemaId = void 0;
    exports.ExtensionsConfigurationSchemaId = 'vscode://schemas/extensions';
    exports.ExtensionsConfigurationSchema = {
        id: exports.ExtensionsConfigurationSchemaId,
        allowComments: true,
        allowTrailingCommas: true,
        type: 'object',
        title: (0, nls_1.localize)('app.extensions.json.title', "Extensions"),
        additionalProperties: false,
        properties: {
            recommendations: {
                type: 'array',
                description: (0, nls_1.localize)('app.extensions.json.recommendations', "List of extensions which should be recommended for users of this workspace. The identifier of an extension is always '${publisher}.${name}'. For example: 'vscode.csharp'."),
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN,
                    errorMessage: (0, nls_1.localize)('app.extension.identifier.errorMessage', "Expected format '${publisher}.${name}'. Example: 'vscode.csharp'.")
                },
            },
            unwantedRecommendations: {
                type: 'array',
                description: (0, nls_1.localize)('app.extensions.json.unwantedRecommendations', "List of extensions recommended by VS Code that should not be recommended for users of this workspace. The identifier of an extension is always '${publisher}.${name}'. For example: 'vscode.csharp'."),
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN,
                    errorMessage: (0, nls_1.localize)('app.extension.identifier.errorMessage', "Expected format '${publisher}.${name}'. Example: 'vscode.csharp'.")
                },
            },
        }
    };
    exports.ExtensionsConfigurationInitialContent = [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=827846 to learn about workspace recommendations.',
        '\t// Extension identifier format: ${publisher}.${name}. Example: vscode.csharp',
        '',
        '\t// List of extensions which should be recommended for users of this workspace.',
        '\t"recommendations": [',
        '\t\t',
        '\t],',
        '\t// List of extensions recommended by VS Code that should not be recommended for users of this workspace.',
        '\t"unwantedRecommendations": [',
        '\t\t',
        '\t]',
        '}'
    ].join('\n');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0ZpbGVUZW1wbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvY29tbW9uL2V4dGVuc2lvbnNGaWxlVGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTW5GLFFBQUEsK0JBQStCLEdBQUcsNkJBQTZCLENBQUM7SUFDaEUsUUFBQSw2QkFBNkIsR0FBZ0I7UUFDekQsRUFBRSxFQUFFLHVDQUErQjtRQUNuQyxhQUFhLEVBQUUsSUFBSTtRQUNuQixtQkFBbUIsRUFBRSxJQUFJO1FBQ3pCLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLFlBQVksQ0FBQztRQUMxRCxvQkFBb0IsRUFBRSxLQUFLO1FBQzNCLFVBQVUsRUFBRTtZQUNYLGVBQWUsRUFBRTtnQkFDaEIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHFDQUFxQyxFQUFFLDRLQUE0SyxDQUFDO2dCQUMxTyxLQUFLLEVBQUU7b0JBQ04sSUFBSSxFQUFFLFFBQVE7b0JBQ2QsT0FBTyxFQUFFLGtEQUE0QjtvQkFDckMsWUFBWSxFQUFFLElBQUEsY0FBUSxFQUFDLHVDQUF1QyxFQUFFLG1FQUFtRSxDQUFDO2lCQUNwSTthQUNEO1lBQ0QsdUJBQXVCLEVBQUU7Z0JBQ3hCLElBQUksRUFBRSxPQUFPO2dCQUNiLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyw2Q0FBNkMsRUFBRSxzTUFBc00sQ0FBQztnQkFDNVEsS0FBSyxFQUFFO29CQUNOLElBQUksRUFBRSxRQUFRO29CQUNkLE9BQU8sRUFBRSxrREFBNEI7b0JBQ3JDLFlBQVksRUFBRSxJQUFBLGNBQVEsRUFBQyx1Q0FBdUMsRUFBRSxtRUFBbUUsQ0FBQztpQkFDcEk7YUFDRDtTQUNEO0tBQ0QsQ0FBQztJQUVXLFFBQUEscUNBQXFDLEdBQVc7UUFDNUQsR0FBRztRQUNILG1HQUFtRztRQUNuRyxnRkFBZ0Y7UUFDaEYsRUFBRTtRQUNGLGtGQUFrRjtRQUNsRix3QkFBd0I7UUFDeEIsTUFBTTtRQUNOLE1BQU07UUFDTiw0R0FBNEc7UUFDNUcsZ0NBQWdDO1FBQ2hDLE1BQU07UUFDTixLQUFLO1FBQ0wsR0FBRztLQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDIn0=