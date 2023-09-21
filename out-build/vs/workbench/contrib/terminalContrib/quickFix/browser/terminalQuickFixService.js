/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, event_1, lifecycle_1, nls_1, extensions_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fXb = void 0;
    class $fXb {
        get providers() { return this.b; }
        constructor() {
            this.a = new Map();
            this.b = new Map();
            this.d = new event_1.$fd();
            this.onDidRegisterProvider = this.d.event;
            this.e = new event_1.$fd();
            this.onDidRegisterCommandSelector = this.e.event;
            this.f = new event_1.$fd();
            this.onDidUnregisterProvider = this.f.event;
            this.extensionQuickFixes = new Promise((r) => quickFixExtensionPoint.setHandler(fixes => {
                r(fixes.filter(c => (0, extensions_1.$PF)(c.description, 'terminalQuickFixProvider')).map(c => {
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
            this.a.set(selector.id, selector);
            this.e.fire(selector);
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
                this.b.set(id, provider);
                const selector = this.a.get(id);
                if (!selector) {
                    throw new Error(`No registered selector for ID: ${id}`);
                }
                this.d.fire({ selector, provider });
            });
            return (0, lifecycle_1.$ic)(() => {
                disposed = true;
                this.b.delete(id);
                const selector = this.a.get(id);
                if (selector) {
                    this.a.delete(id);
                    this.f.fire(selector.id);
                }
            });
        }
    }
    exports.$fXb = $fXb;
    const quickFixExtensionPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'terminalQuickFixes',
        defaultExtensionKind: ['workspace'],
        activationEventsGenerator: (terminalQuickFixes, result) => {
            for (const quickFixContrib of terminalQuickFixes ?? []) {
                result.push(`onTerminalQuickFixRequest:${quickFixContrib.id}`);
            }
        },
        jsonSchema: {
            description: (0, nls_1.localize)(0, null),
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
                        description: (0, nls_1.localize)(1, null),
                        type: 'string',
                    },
                    commandLineMatcher: {
                        description: (0, nls_1.localize)(2, null),
                        type: 'string',
                    },
                    outputMatcher: {
                        markdownDescription: (0, nls_1.localize)(3, null),
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
                        description: (0, nls_1.localize)(4, null),
                        enum: ['success', 'error'],
                        enumDescriptions: [
                            'The command exited with an exit code of zero.',
                            'The command exited with a non-zero exit code.'
                        ]
                    },
                    kind: {
                        description: (0, nls_1.localize)(5, null, '`"fix"`'),
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
//# sourceMappingURL=terminalQuickFixService.js.map