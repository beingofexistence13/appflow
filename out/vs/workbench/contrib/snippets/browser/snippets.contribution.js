/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/extensions", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/snippets/browser/commands/configureSnippets", "vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets", "vs/workbench/contrib/snippets/browser/commands/insertSnippet", "vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet", "vs/workbench/contrib/snippets/browser/snippetCodeActionProvider", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/contrib/snippets/browser/snippetsService", "vs/platform/configuration/common/configurationRegistry", "vs/editor/common/config/editorConfigurationSchema", "vs/workbench/contrib/snippets/browser/tabCompletion"], function (require, exports, nls, actions_1, commands_1, extensions_1, JSONContributionRegistry, platform_1, contributions_1, configureSnippets_1, fileTemplateSnippets_1, insertSnippet_1, surroundWithSnippet_1, snippetCodeActionProvider_1, snippets_1, snippetsService_1, configurationRegistry_1, editorConfigurationSchema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // service
    (0, extensions_1.registerSingleton)(snippets_1.ISnippetsService, snippetsService_1.SnippetsService, 1 /* InstantiationType.Delayed */);
    // actions
    (0, actions_1.registerAction2)(insertSnippet_1.InsertSnippetAction);
    commands_1.CommandsRegistry.registerCommandAlias('editor.action.showSnippets', 'editor.action.insertSnippet');
    (0, actions_1.registerAction2)(surroundWithSnippet_1.SurroundWithSnippetEditorAction);
    (0, actions_1.registerAction2)(fileTemplateSnippets_1.ApplyFileSnippetAction);
    (0, actions_1.registerAction2)(configureSnippets_1.ConfigureSnippetsAction);
    // workbench contribs
    const workbenchContribRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContribRegistry.registerWorkbenchContribution(snippetCodeActionProvider_1.SnippetCodeActions, 3 /* LifecyclePhase.Restored */);
    // config
    platform_1.Registry
        .as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        ...editorConfigurationSchema_1.editorConfigurationBaseNode,
        'properties': {
            'editor.snippets.codeActions.enabled': {
                'description': nls.localize('editor.snippets.codeActions.enabled', 'Controls if surround-with-snippets or file template snippets show as Code Actions.'),
                'type': 'boolean',
                'default': true
            }
        }
    });
    // schema
    const languageScopeSchemaId = 'vscode://schemas/snippets';
    const snippetSchemaProperties = {
        prefix: {
            description: nls.localize('snippetSchema.json.prefix', 'The prefix to use when selecting the snippet in intellisense'),
            type: ['string', 'array']
        },
        isFileTemplate: {
            description: nls.localize('snippetSchema.json.isFileTemplate', 'The snippet is meant to populate or replace a whole file'),
            type: 'boolean'
        },
        body: {
            markdownDescription: nls.localize('snippetSchema.json.body', 'The snippet content. Use `$1`, `${1:defaultText}` to define cursor positions, use `$0` for the final cursor position. Insert variable values with `${varName}` and `${varName:defaultText}`, e.g. `This is file: $TM_FILENAME`.'),
            type: ['string', 'array'],
            items: {
                type: 'string'
            }
        },
        description: {
            description: nls.localize('snippetSchema.json.description', 'The snippet description.'),
            type: ['string', 'array']
        }
    };
    const languageScopeSchema = {
        id: languageScopeSchemaId,
        allowComments: true,
        allowTrailingCommas: true,
        defaultSnippets: [{
                label: nls.localize('snippetSchema.json.default', "Empty snippet"),
                body: { '${1:snippetName}': { 'prefix': '${2:prefix}', 'body': '${3:snippet}', 'description': '${4:description}' } }
            }],
        type: 'object',
        description: nls.localize('snippetSchema.json', 'User snippet configuration'),
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
                label: nls.localize('snippetSchema.json.default', "Empty snippet"),
                body: { '${1:snippetName}': { 'scope': '${2:scope}', 'prefix': '${3:prefix}', 'body': '${4:snippet}', 'description': '${5:description}' } }
            }],
        type: 'object',
        description: nls.localize('snippetSchema.json', 'User snippet configuration'),
        additionalProperties: {
            type: 'object',
            required: ['body'],
            properties: {
                ...snippetSchemaProperties,
                scope: {
                    description: nls.localize('snippetSchema.json.scope', "A list of language names to which this snippet applies, e.g. 'typescript,javascript'."),
                    type: 'string'
                }
            },
            additionalProperties: false
        }
    };
    const reg = platform_1.Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
    reg.registerSchema(languageScopeSchemaId, languageScopeSchema);
    reg.registerSchema(globalSchemaId, globalSchema);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc25pcHBldHMvYnJvd3Nlci9zbmlwcGV0cy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUF1QmhHLFVBQVU7SUFDVixJQUFBLDhCQUFpQixFQUFDLDJCQUFnQixFQUFFLGlDQUFlLG9DQUE0QixDQUFDO0lBRWhGLFVBQVU7SUFDVixJQUFBLHlCQUFlLEVBQUMsbUNBQW1CLENBQUMsQ0FBQztJQUNyQywyQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyw0QkFBNEIsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO0lBQ25HLElBQUEseUJBQWUsRUFBQyxxREFBK0IsQ0FBQyxDQUFDO0lBQ2pELElBQUEseUJBQWUsRUFBQyw2Q0FBc0IsQ0FBQyxDQUFDO0lBQ3hDLElBQUEseUJBQWUsRUFBQywyQ0FBdUIsQ0FBQyxDQUFDO0lBRXpDLHFCQUFxQjtJQUNyQixNQUFNLHdCQUF3QixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3Ryx3QkFBd0IsQ0FBQyw2QkFBNkIsQ0FBQyw4Q0FBa0Isa0NBQTBCLENBQUM7SUFFcEcsU0FBUztJQUNULG1CQUFRO1NBQ04sRUFBRSxDQUF5QixrQ0FBVSxDQUFDLGFBQWEsQ0FBQztTQUNwRCxxQkFBcUIsQ0FBQztRQUN0QixHQUFHLHVEQUEyQjtRQUM5QixZQUFZLEVBQUU7WUFDYixxQ0FBcUMsRUFBRTtnQkFDdEMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUNBQXFDLEVBQUUsb0ZBQW9GLENBQUM7Z0JBQ3hKLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixTQUFTLEVBQUUsSUFBSTthQUNmO1NBQ0Q7S0FDRCxDQUFDLENBQUM7SUFHSixTQUFT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