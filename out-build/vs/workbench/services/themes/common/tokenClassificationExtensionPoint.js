/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/tokenClassificationExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/theme/common/tokenClassificationRegistry"], function (require, exports, nls, extensionsRegistry_1, tokenClassificationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1$ = void 0;
    const tokenClassificationRegistry = (0, tokenClassificationRegistry_1.$Y$)();
    const tokenTypeExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'semanticTokenTypes',
        jsonSchema: {
            description: nls.localize(0, null),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize(1, null),
                        pattern: tokenClassificationRegistry_1.$V$,
                        patternErrorMessage: nls.localize(2, null),
                    },
                    superType: {
                        type: 'string',
                        description: nls.localize(3, null),
                        pattern: tokenClassificationRegistry_1.$V$,
                        patternErrorMessage: nls.localize(4, null),
                    },
                    description: {
                        type: 'string',
                        description: nls.localize(5, null),
                    }
                }
            }
        }
    });
    const tokenModifierExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'semanticTokenModifiers',
        jsonSchema: {
            description: nls.localize(6, null),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize(7, null),
                        pattern: tokenClassificationRegistry_1.$V$,
                        patternErrorMessage: nls.localize(8, null)
                    },
                    description: {
                        description: nls.localize(9, null)
                    }
                }
            }
        }
    });
    const tokenStyleDefaultsExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'semanticTokenScopes',
        jsonSchema: {
            description: nls.localize(10, null),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    language: {
                        description: nls.localize(11, null),
                        type: 'string'
                    },
                    scopes: {
                        description: nls.localize(12, null),
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
    class $1$ {
        constructor() {
            function validateTypeOrModifier(contribution, extensionPoint, collector) {
                if (typeof contribution.id !== 'string' || contribution.id.length === 0) {
                    collector.error(nls.localize(13, null, extensionPoint));
                    return false;
                }
                if (!contribution.id.match(tokenClassificationRegistry_1.$V$)) {
                    collector.error(nls.localize(14, null, extensionPoint));
                    return false;
                }
                const superType = contribution.superType;
                if (superType && !superType.match(tokenClassificationRegistry_1.$V$)) {
                    collector.error(nls.localize(15, null, extensionPoint));
                    return false;
                }
                if (typeof contribution.description !== 'string' || contribution.id.length === 0) {
                    collector.error(nls.localize(16, null, extensionPoint));
                    return false;
                }
                return true;
            }
            tokenTypeExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize(17, null));
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
                        collector.error(nls.localize(18, null));
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
                        collector.error(nls.localize(19, null));
                        return;
                    }
                    for (const contribution of extensionValue) {
                        if (contribution.language && typeof contribution.language !== 'string') {
                            collector.error(nls.localize(20, null));
                            continue;
                        }
                        if (!contribution.scopes || typeof contribution.scopes !== 'object') {
                            collector.error(nls.localize(21, null));
                            continue;
                        }
                        for (const selectorString in contribution.scopes) {
                            const tmScopes = contribution.scopes[selectorString];
                            if (!Array.isArray(tmScopes) || tmScopes.some(l => typeof l !== 'string')) {
                                collector.error(nls.localize(22, null));
                                continue;
                            }
                            try {
                                const selector = tokenClassificationRegistry.parseTokenSelector(selectorString, contribution.language);
                                tokenClassificationRegistry.registerTokenStyleDefault(selector, { scopesToProbe: tmScopes.map(s => s.split(' ')) });
                            }
                            catch (e) {
                                collector.error(nls.localize(23, null, selectorString));
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
    exports.$1$ = $1$;
});
//# sourceMappingURL=tokenClassificationExtensionPoint.js.map