/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/nls", "vs/platform/registry/common/platform"], function (require, exports, configurationRegistry_1, configuration_1, nls, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateContributedOpeners = exports.externalUriOpenersConfigurationNode = exports.externalUriOpenersSettingId = exports.defaultExternalUriOpenerId = void 0;
    exports.defaultExternalUriOpenerId = 'default';
    exports.externalUriOpenersSettingId = 'workbench.externalUriOpeners';
    const externalUriOpenerIdSchemaAddition = {
        type: 'string',
        enum: []
    };
    const exampleUriPatterns = `
- \`https://microsoft.com\`: Matches this specific domain using https
- \`https://microsoft.com:8080\`: Matches this specific domain on this port using https
- \`https://microsoft.com:*\`: Matches this specific domain on any port using https
- \`https://microsoft.com/foo\`: Matches \`https://microsoft.com/foo\` and \`https://microsoft.com/foo/bar\`, but not \`https://microsoft.com/foobar\` or \`https://microsoft.com/bar\`
- \`https://*.microsoft.com\`: Match all domains ending in \`microsoft.com\` using https
- \`microsoft.com\`: Match this specific domain using either http or https
- \`*.microsoft.com\`: Match all domains ending in \`microsoft.com\` using either http or https
- \`http://192.168.0.1\`: Matches this specific IP using http
- \`http://192.168.0.*\`: Matches all IP's with this prefix using http
- \`*\`: Match all domains using either http or https`;
    exports.externalUriOpenersConfigurationNode = {
        ...configuration_1.workbenchConfigurationNodeBase,
        properties: {
            [exports.externalUriOpenersSettingId]: {
                type: 'object',
                markdownDescription: nls.localize('externalUriOpeners', "Configure the opener to use for external URIs (http, https)."),
                defaultSnippets: [{
                        body: {
                            'example.com': '$1'
                        }
                    }],
                additionalProperties: {
                    anyOf: [
                        {
                            type: 'string',
                            markdownDescription: nls.localize('externalUriOpeners.uri', "Map URI pattern to an opener id.\nExample patterns: \n{0}", exampleUriPatterns),
                        },
                        {
                            type: 'string',
                            markdownDescription: nls.localize('externalUriOpeners.uri', "Map URI pattern to an opener id.\nExample patterns: \n{0}", exampleUriPatterns),
                            enum: [exports.defaultExternalUriOpenerId],
                            enumDescriptions: [nls.localize('externalUriOpeners.defaultId', "Open using VS Code's standard opener.")],
                        },
                        externalUriOpenerIdSchemaAddition
                    ]
                }
            }
        }
    };
    function updateContributedOpeners(enumValues, enumDescriptions) {
        externalUriOpenerIdSchemaAddition.enum = enumValues;
        externalUriOpenerIdSchemaAddition.enumDescriptions = enumDescriptions;
        platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
            .notifyConfigurationSchemaUpdated(exports.externalUriOpenersConfigurationNode);
    }
    exports.updateContributedOpeners = updateContributedOpeners;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVybmFsVXJpT3BlbmVyL2NvbW1vbi9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFuRixRQUFBLDBCQUEwQixHQUFHLFNBQVMsQ0FBQztJQUV2QyxRQUFBLDJCQUEyQixHQUFHLDhCQUE4QixDQUFDO0lBTTFFLE1BQU0saUNBQWlDLEdBQWdCO1FBQ3RELElBQUksRUFBRSxRQUFRO1FBQ2QsSUFBSSxFQUFFLEVBQUU7S0FDUixDQUFDO0lBRUYsTUFBTSxrQkFBa0IsR0FBRzs7Ozs7Ozs7OztzREFVMkIsQ0FBQztJQUUxQyxRQUFBLG1DQUFtQyxHQUF1QjtRQUN0RSxHQUFHLDhDQUE4QjtRQUNqQyxVQUFVLEVBQUU7WUFDWCxDQUFDLG1DQUEyQixDQUFDLEVBQUU7Z0JBQzlCLElBQUksRUFBRSxRQUFRO2dCQUNkLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsOERBQThELENBQUM7Z0JBQ3ZILGVBQWUsRUFBRSxDQUFDO3dCQUNqQixJQUFJLEVBQUU7NEJBQ0wsYUFBYSxFQUFFLElBQUk7eUJBQ25CO3FCQUNELENBQUM7Z0JBQ0Ysb0JBQW9CLEVBQUU7b0JBQ3JCLEtBQUssRUFBRTt3QkFDTjs0QkFDQyxJQUFJLEVBQUUsUUFBUTs0QkFDZCxtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLDJEQUEyRCxFQUFFLGtCQUFrQixDQUFDO3lCQUM1STt3QkFDRDs0QkFDQyxJQUFJLEVBQUUsUUFBUTs0QkFDZCxtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLDJEQUEyRCxFQUFFLGtCQUFrQixDQUFDOzRCQUM1SSxJQUFJLEVBQUUsQ0FBQyxrQ0FBMEIsQ0FBQzs0QkFDbEMsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLHVDQUF1QyxDQUFDLENBQUM7eUJBQ3pHO3dCQUNELGlDQUFpQztxQkFDakM7aUJBQ0Q7YUFDRDtTQUNEO0tBQ0QsQ0FBQztJQUVGLFNBQWdCLHdCQUF3QixDQUFDLFVBQW9CLEVBQUUsZ0JBQTBCO1FBQ3hGLGlDQUFpQyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7UUFDcEQsaUNBQWlDLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFFdEUsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUFVLENBQUMsYUFBYSxDQUFDO2FBQzNELGdDQUFnQyxDQUFDLDJDQUFtQyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQU5ELDREQU1DIn0=