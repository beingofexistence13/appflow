/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/theme/common/tokenClassificationRegistry"], function (require, exports, nls, extensionsRegistry_1, tokenClassificationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenClassificationExtensionPoints = void 0;
    const tokenClassificationRegistry = (0, tokenClassificationRegistry_1.getTokenClassificationRegistry)();
    const tokenTypeExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'semanticTokenTypes',
        jsonSchema: {
            description: nls.localize('contributes.semanticTokenTypes', 'Contributes semantic token types.'),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize('contributes.semanticTokenTypes.id', 'The identifier of the semantic token type'),
                        pattern: tokenClassificationRegistry_1.typeAndModifierIdPattern,
                        patternErrorMessage: nls.localize('contributes.semanticTokenTypes.id.format', 'Identifiers should be in the form letterOrDigit[_-letterOrDigit]*'),
                    },
                    superType: {
                        type: 'string',
                        description: nls.localize('contributes.semanticTokenTypes.superType', 'The super type of the semantic token type'),
                        pattern: tokenClassificationRegistry_1.typeAndModifierIdPattern,
                        patternErrorMessage: nls.localize('contributes.semanticTokenTypes.superType.format', 'Super types should be in the form letterOrDigit[_-letterOrDigit]*'),
                    },
                    description: {
                        type: 'string',
                        description: nls.localize('contributes.color.description', 'The description of the semantic token type'),
                    }
                }
            }
        }
    });
    const tokenModifierExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'semanticTokenModifiers',
        jsonSchema: {
            description: nls.localize('contributes.semanticTokenModifiers', 'Contributes semantic token modifiers.'),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize('contributes.semanticTokenModifiers.id', 'The identifier of the semantic token modifier'),
                        pattern: tokenClassificationRegistry_1.typeAndModifierIdPattern,
                        patternErrorMessage: nls.localize('contributes.semanticTokenModifiers.id.format', 'Identifiers should be in the form letterOrDigit[_-letterOrDigit]*')
                    },
                    description: {
                        description: nls.localize('contributes.semanticTokenModifiers.description', 'The description of the semantic token modifier')
                    }
                }
            }
        }
    });
    const tokenStyleDefaultsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'semanticTokenScopes',
        jsonSchema: {
            description: nls.localize('contributes.semanticTokenScopes', 'Contributes semantic token scope maps.'),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    language: {
                        description: nls.localize('contributes.semanticTokenScopes.languages', 'Lists the languge for which the defaults are.'),
                        type: 'string'
                    },
                    scopes: {
                        description: nls.localize('contributes.semanticTokenScopes.scopes', 'Maps a semantic token (described by semantic token selector) to one or more textMate scopes used to represent that token.'),
                        type: 'object',
                        additionalProperties: {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        }
                    }
                }
            }
        }
    });
    class TokenClassificationExtensionPoints {
        constructor() {
            function validateTypeOrModifier(contribution, extensionPoint, collector) {
                if (typeof contribution.id !== 'string' || contribution.id.length === 0) {
                    collector.error(nls.localize('invalid.id', "'configuration.{0}.id' must be defined and can not be empty", extensionPoint));
                    return false;
                }
                if (!contribution.id.match(tokenClassificationRegistry_1.typeAndModifierIdPattern)) {
                    collector.error(nls.localize('invalid.id.format', "'configuration.{0}.id' must follow the pattern letterOrDigit[-_letterOrDigit]*", extensionPoint));
                    return false;
                }
                const superType = contribution.superType;
                if (superType && !superType.match(tokenClassificationRegistry_1.typeAndModifierIdPattern)) {
                    collector.error(nls.localize('invalid.superType.format', "'configuration.{0}.superType' must follow the pattern letterOrDigit[-_letterOrDigit]*", extensionPoint));
                    return false;
                }
                if (typeof contribution.description !== 'string' || contribution.id.length === 0) {
                    collector.error(nls.localize('invalid.description', "'configuration.{0}.description' must be defined and can not be empty", extensionPoint));
                    return false;
                }
                return true;
            }
            tokenTypeExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize('invalid.semanticTokenTypeConfiguration', "'configuration.semanticTokenType' must be an array"));
                        return;
                    }
                    for (const contribution of extensionValue) {
                        if (validateTypeOrModifier(contribution, 'semanticTokenType', collector)) {
                            tokenClassificationRegistry.registerTokenType(contribution.id, contribution.description, contribution.superType);
                        }
                    }
                }
                for (const extension of delta.removed) {
                    const extensionValue = extension.value;
                    for (const contribution of extensionValue) {
                        tokenClassificationRegistry.deregisterTokenType(contribution.id);
                    }
                }
            });
            tokenModifierExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize('invalid.semanticTokenModifierConfiguration', "'configuration.semanticTokenModifier' must be an array"));
                        return;
                    }
                    for (const contribution of extensionValue) {
                        if (validateTypeOrModifier(contribution, 'semanticTokenModifier', collector)) {
                            tokenClassificationRegistry.registerTokenModifier(contribution.id, contribution.description);
                        }
                    }
                }
                for (const extension of delta.removed) {
                    const extensionValue = extension.value;
                    for (const contribution of extensionValue) {
                        tokenClassificationRegistry.deregisterTokenModifier(contribution.id);
                    }
                }
            });
            tokenStyleDefaultsExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize('invalid.semanticTokenScopes.configuration', "'configuration.semanticTokenScopes' must be an array"));
                        return;
                    }
                    for (const contribution of extensionValue) {
                        if (contribution.language && typeof contribution.language !== 'string') {
                            collector.error(nls.localize('invalid.semanticTokenScopes.language', "'configuration.semanticTokenScopes.language' must be a string"));
                            continue;
                        }
                        if (!contribution.scopes || typeof contribution.scopes !== 'object') {
                            collector.error(nls.localize('invalid.semanticTokenScopes.scopes', "'configuration.semanticTokenScopes.scopes' must be defined as an object"));
                            continue;
                        }
                        for (const selectorString in contribution.scopes) {
                            const tmScopes = contribution.scopes[selectorString];
                            if (!Array.isArray(tmScopes) || tmScopes.some(l => typeof l !== 'string')) {
                                collector.error(nls.localize('invalid.semanticTokenScopes.scopes.value', "'configuration.semanticTokenScopes.scopes' values must be an array of strings"));
                                continue;
                            }
                            try {
                                const selector = tokenClassificationRegistry.parseTokenSelector(selectorString, contribution.language);
                                tokenClassificationRegistry.registerTokenStyleDefault(selector, { scopesToProbe: tmScopes.map(s => s.split(' ')) });
                            }
                            catch (e) {
                                collector.error(nls.localize('invalid.semanticTokenScopes.scopes.selector', "configuration.semanticTokenScopes.scopes': Problems parsing selector {0}.", selectorString));
                                // invalid selector, ignore
                            }
                        }
                    }
                }
                for (const extension of delta.removed) {
                    const extensionValue = extension.value;
                    for (const contribution of extensionValue) {
                        for (const selectorString in contribution.scopes) {
                            const tmScopes = contribution.scopes[selectorString];
                            try {
                                const selector = tokenClassificationRegistry.parseTokenSelector(selectorString, contribution.language);
                                tokenClassificationRegistry.registerTokenStyleDefault(selector, { scopesToProbe: tmScopes.map(s => s.split(' ')) });
                            }
                            catch (e) {
                                // invalid selector, ignore
                            }
                        }
                    }
                }
            });
        }
    }
    exports.TokenClassificationExtensionPoints = TokenClassificationExtensionPoints;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5DbGFzc2lmaWNhdGlvbkV4dGVuc2lvblBvaW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RoZW1lcy9jb21tb24vdG9rZW5DbGFzc2lmaWNhdGlvbkV4dGVuc2lvblBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNCaEcsTUFBTSwyQkFBMkIsR0FBaUMsSUFBQSw0REFBOEIsR0FBRSxDQUFDO0lBRW5HLE1BQU0saUJBQWlCLEdBQUcsdUNBQWtCLENBQUMsc0JBQXNCLENBQTZCO1FBQy9GLGNBQWMsRUFBRSxvQkFBb0I7UUFDcEMsVUFBVSxFQUFFO1lBQ1gsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsbUNBQW1DLENBQUM7WUFDaEcsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsVUFBVSxFQUFFO29CQUNYLEVBQUUsRUFBRTt3QkFDSCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQ0FBbUMsRUFBRSwyQ0FBMkMsQ0FBQzt3QkFDM0csT0FBTyxFQUFFLHNEQUF3Qjt3QkFDakMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQ0FBMEMsRUFBRSxtRUFBbUUsQ0FBQztxQkFDbEo7b0JBQ0QsU0FBUyxFQUFFO3dCQUNWLElBQUksRUFBRSxRQUFRO3dCQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDBDQUEwQyxFQUFFLDJDQUEyQyxDQUFDO3dCQUNsSCxPQUFPLEVBQUUsc0RBQXdCO3dCQUNqQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGlEQUFpRCxFQUFFLG1FQUFtRSxDQUFDO3FCQUN6SjtvQkFDRCxXQUFXLEVBQUU7d0JB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