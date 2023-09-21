/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/snippets/browser/snippets.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/extensions", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/snippets/browser/commands/configureSnippets", "vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets", "vs/workbench/contrib/snippets/browser/commands/insertSnippet", "vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet", "vs/workbench/contrib/snippets/browser/snippetCodeActionProvider", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/contrib/snippets/browser/snippetsService", "vs/platform/configuration/common/configurationRegistry", "vs/editor/common/config/editorConfigurationSchema", "vs/workbench/contrib/snippets/browser/tabCompletion"], function (require, exports, nls, actions_1, commands_1, extensions_1, JSONContributionRegistry, platform_1, contributions_1, configureSnippets_1, fileTemplateSnippets_1, insertSnippet_1, surroundWithSnippet_1, snippetCodeActionProvider_1, snippets_1, snippetsService_1, configurationRegistry_1, editorConfigurationSchema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // service
    (0, extensions_1.$mr)(snippets_1.$amb, snippetsService_1.$omb, 1 /* InstantiationType.Delayed */);
    // actions
    (0, actions_1.$Xu)(insertSnippet_1.$kYb);
    commands_1.$Gr.registerCommandAlias('editor.action.showSnippets', 'editor.action.insertSnippet');
    (0, actions_1.$Xu)(surroundWithSnippet_1.$mYb);
    (0, actions_1.$Xu)(fileTemplateSnippets_1.$bFb);
    (0, actions_1.$Xu)(configureSnippets_1.$iYb);
    // workbench contribs
    const workbenchContribRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContribRegistry.registerWorkbenchContribution(snippetCodeActionProvider_1.$nYb, 3 /* LifecyclePhase.Restored */);
    // config
    platform_1.$8m
        .as(configurationRegistry_1.$an.Configuration)
        .registerConfiguration({
        ...editorConfigurationSchema_1.$k1,
        'properties': {
            'editor.snippets.codeActions.enabled': {
                'description': nls.localize(0, null),
                'type': 'boolean',
                'default': true
            }
        }
    });
    // schema
    const languageScopeSchemaId = 'vscode://schemas/snippets';
    const snippetSchemaProperties = {
        prefix: {
            description: nls.localize(1, null),
            type: ['string', 'array']
        },
        isFileTemplate: {
            description: nls.localize(2, null),
            type: 'boolean'
        },
        body: {
            markdownDescription: nls.localize(3, null),
            type: ['string', 'array'],
            items: {
                type: 'string'
            }
        },
        description: {
            description: nls.localize(4, null),
            type: ['string', 'array']
        }
    };
    const languageScopeSchema = {
        id: languageScopeSchemaId,
        allowComments: true,
        allowTrailingCommas: true,
        defaultSnippets: [{
                label: nls.localize(5, null),
                body: { '${1:snippetName}': { 'prefix': '${2:prefix}', 'body': '${3:snippet}', 'description': '${4:description}' } }
            }],
        type: 'object',
        description: nls.localize(6, null),
        additionalProperties: {
            type: 'object',
            required: ['body'],
            properties: snippetSchemaProperties,
            additionalProperties: false
        }
    };
    const globalSchemaId = 'vscode://schemas/global-snippets';
    const globalSchema = {
        id: globalSchemaId,
        allowComments: true,
        allowTrailingCommas: true,
        defaultSnippets: [{
                label: nls.localize(7, null),
                body: { '${1:snippetName}': { 'scope': '${2:scope}', 'prefix': '${3:prefix}', 'body': '${4:snippet}', 'description': '${5:description}' } }
            }],
        type: 'object',
        description: nls.localize(8, null),
        additionalProperties: {
            type: 'object',
            required: ['body'],
            properties: {
                ...snippetSchemaProperties,
                scope: {
                    description: nls.localize(9, null),
                    type: 'string'
                }
            },
            additionalProperties: false
        }
    };
    const reg = platform_1.$8m.as(JSONContributionRegistry.$9m.JSONContribution);
    reg.registerSchema(languageScopeSchemaId, languageScopeSchema);
    reg.registerSchema(globalSchemaId, globalSchema);
});
//# sourceMappingURL=snippets.contribution.js.map