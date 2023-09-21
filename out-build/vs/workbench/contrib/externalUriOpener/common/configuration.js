/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/nls!vs/workbench/contrib/externalUriOpener/common/configuration", "vs/platform/registry/common/platform"], function (require, exports, configurationRegistry_1, configuration_1, nls, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$clb = exports.$blb = exports.$alb = exports.$_kb = void 0;
    exports.$_kb = 'default';
    exports.$alb = 'workbench.externalUriOpeners';
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
    exports.$blb = {
        ...configuration_1.$$y,
        properties: {
            [exports.$alb]: {
                type: 'object',
                markdownDescription: nls.localize(0, null),
                defaultSnippets: [{
                        body: {
                            'example.com': '$1'
                        }
                    }],
                additionalProperties: {
                    anyOf: [
                        {
                            type: 'string',
                            markdownDescription: nls.localize(1, null, exampleUriPatterns),
                        },
                        {
                            type: 'string',
                            markdownDescription: nls.localize(2, null, exampleUriPatterns),
                            enum: [exports.$_kb],
                            enumDescriptions: [nls.localize(3, null)],
                        },
                        externalUriOpenerIdSchemaAddition
                    ]
                }
            }
        }
    };
    function $clb(enumValues, enumDescriptions) {
        externalUriOpenerIdSchemaAddition.enum = enumValues;
        externalUriOpenerIdSchemaAddition.enumDescriptions = enumDescriptions;
        platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
            .notifyConfigurationSchemaUpdated(exports.$blb);
    }
    exports.$clb = $clb;
});
//# sourceMappingURL=configuration.js.map