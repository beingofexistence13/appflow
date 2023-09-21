/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, event_1, lifecycle_1, nls_1, extensions_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalQuickFixService = void 0;
    class TerminalQuickFixService {
        get providers() { return this._providers; }
        constructor() {
            this._selectors = new Map();
            this._providers = new Map();
            this._onDidRegisterProvider = new event_1.Emitter();
            this.onDidRegisterProvider = this._onDidRegisterProvider.event;
            this._onDidRegisterCommandSelector = new event_1.Emitter();
            this.onDidRegisterCommandSelector = this._onDidRegisterCommandSelector.event;
            this._onDidUnregisterProvider = new event_1.Emitter();
            this.onDidUnregisterProvider = this._onDidUnregisterProvider.event;
            this.extensionQuickFixes = new Promise((r) => quickFixExtensionPoint.setHandler(fixes => {
                r(fixes.filter(c => (0, extensions_1.isProposedApiEnabled)(c.description, 'terminalQuickFixProvider')).map(c => {
                    if (!c.value) {
                        return [];
                    }
                    return c.value.map(fix => { return { ...fix, extensionIdentifier: c.description.identifier.value }; });
                }).flat());
            }));
            this.extensionQuickFixes.then(selectors => {
                for (const selector of selectors) {
                    this.registerCommandSelector(selector);
                }
            });
        }
        registerCommandSelector(selector) {
            this._selectors.set(selector.id, selector);
            this._onDidRegisterCommandSelector.fire(selector);
        }
        registerQuickFixProvider(id, provider) {
            // This is more complicated than it looks like it should be because we need to return an
            // IDisposable synchronously but we must await ITerminalContributionService.quickFixes
            // asynchronously before actually registering the provider.
            let disposed = false;
            this.extensionQuickFixes.then(() => {
                if (disposed) {
                    return;
                }
                this._providers.set(id, provider);
                const selector = this._selectors.get(id);
                if (!selector) {
                    throw new Error(`No registered selector for ID: ${id}`);
                }
                this._onDidRegisterProvider.fire({ selector, provider });
            });
            return (0, lifecycle_1.toDisposable)(() => {
                disposed = true;
                this._providers.delete(id);
                const selector = this._selectors.get(id);
                if (selector) {
                    this._selectors.delete(id);
                    this._onDidUnregisterProvider.fire(selector.id);
                }
            });
        }
    }
    exports.TerminalQuickFixService = TerminalQuickFixService;
    const quickFixExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'terminalQuickFixes',
        defaultExtensionKind: ['workspace'],
        activationEventsGenerator: (terminalQuickFixes, result) => {
            for (const quickFixContrib of terminalQuickFixes ?? []) {
                result.push(`onTerminalQuickFixRequest:${quickFixContrib.id}`);
            }
        },
        jsonSchema: {
            description: (0, nls_1.localize)('vscode.extension.contributes.terminalQuickFixes', 'Contributes terminal quick fixes.'),
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'commandLineMatcher', 'outputMatcher', 'commandExitResult'],
                defaultSnippets: [{
                        body: {
                            id: '$1',
                            commandLineMatcher: '$2',
                            outputMatcher: '$3',
                            exitStatus: '$4'
                        }
                    }],
                properties: {
                    id: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.terminalQuickFixes.id', "The ID of the quick fix provider"),
                        type: 'string',
                    },
                    commandLineMatcher: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.terminalQuickFixes.commandLineMatcher', "A regular expression or string to test the command line against"),
                        type: 'string',
                    },
                    outputMatcher: {
                        markdownDescription: (0, nls_1.localize)('vscode.extension.contributes.terminalQuickFixes.outputMatcher', "A regular expression or string to match a single line of the output against, which provides groups to be referenced in terminalCommand and uri.\n\nFor example:\n\n `lineMatcher: /git push --set-upstream origin (?<branchName>[^\s]+)/;`\n\n`terminalCommand: 'git push --set-upstream origin ${group:branchName}';`\n"),
                        type: 'object',
                        required: ['lineMatcher', 'anchor', 'offset', 'length'],
                        properties: {
                            lineMatcher: {
                                description: 'A regular expression or string to test the command line against',
                                type: 'string'
                            },
                            anchor: {
                                description: 'Where the search should begin in the buffer',
                                enum: ['top', 'bottom']
                            },
                            offset: {
                                description: 'The number of lines vertically from the anchor in the buffer to start matching against',
                                type: 'number'
                            },
                            length: {
                                description: 'The number of rows to match against, this should be as small as possible for performance reasons',
                                type: 'number'
                            }
                        }
                    },
                    commandExitResult: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.terminalQuickFixes.commandExitResult', "The command exit result to match on"),
                        enum: ['success', 'error'],
                        enumDescriptions: [
                            'The command exited with an exit code of zero.',
                            'The command exited with a non-zero exit code.'
                        ]
                    },
                    kind: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.terminalQuickFixes.kind', "The kind of the resulting quick fix. This changes how the quick fix is presented. Defaults to {0}.", '`"fix"`'),
                        enum: ['default', 'explain'],
                        enumDescriptions: [
                            'A high confidence quick fix.',
                            'An explanation of the problem.'
                        ]
                    }
                },
            }
        },
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxRdWlja0ZpeFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvcXVpY2tGaXgvYnJvd3Nlci90ZXJtaW5hbFF1aWNrRml4U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBYSx1QkFBdUI7UUFNbkMsSUFBSSxTQUFTLEtBQTZDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFXbkY7WUFkUSxlQUFVLEdBQTBDLElBQUksR0FBRyxFQUFFLENBQUM7WUFFOUQsZUFBVSxHQUEyQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBR3RELDJCQUFzQixHQUFHLElBQUksZUFBTyxFQUFxQyxDQUFDO1lBQ2xGLDBCQUFxQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFDbEQsa0NBQTZCLEdBQUcsSUFBSSxlQUFPLEVBQTRCLENBQUM7WUFDaEYsaUNBQTRCLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssQ0FBQztZQUNoRSw2QkFBd0IsR0FBRyxJQUFJLGVBQU8sRUFBVSxDQUFDO1lBQ3pELDRCQUF1QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUM7WUFLdEUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3ZGLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSxpQ0FBb0IsRUFBQyxDQUFDLENBQUMsV0FBVyxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JB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