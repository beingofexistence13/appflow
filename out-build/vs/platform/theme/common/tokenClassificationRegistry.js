/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/color", "vs/base/common/event", "vs/nls!vs/platform/theme/common/tokenClassificationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform"], function (require, exports, async_1, color_1, event_1, nls, jsonContributionRegistry_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Z$ = exports.$Y$ = exports.$X$ = exports.SemanticTokenRule = exports.$W$ = exports.$V$ = void 0;
    const TOKEN_TYPE_WILDCARD = '*';
    const TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR = ':';
    const CLASSIFIER_MODIFIER_SEPARATOR = '.';
    const idPattern = '\\w+[-_\\w+]*';
    exports.$V$ = `^${idPattern}$`;
    const selectorPattern = `^(${idPattern}|\\*)(\\${CLASSIFIER_MODIFIER_SEPARATOR}${idPattern})*(${TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR}${idPattern})?$`;
    const fontStylePattern = '^(\\s*(italic|bold|underline|strikethrough))*\\s*$';
    class $W$ {
        constructor(foreground, bold, underline, strikethrough, italic) {
            this.foreground = foreground;
            this.bold = bold;
            this.underline = underline;
            this.strikethrough = strikethrough;
            this.italic = italic;
        }
    }
    exports.$W$ = $W$;
    (function ($W$) {
        function toJSONObject(style) {
            return {
                _foreground: style.foreground === undefined ? null : color_1.$Os.Format.CSS.formatHexA(style.foreground, true),
                _bold: style.bold === undefined ? null : style.bold,
                _underline: style.underline === undefined ? null : style.underline,
                _italic: style.italic === undefined ? null : style.italic,
                _strikethrough: style.strikethrough === undefined ? null : style.strikethrough,
            };
        }
        $W$.toJSONObject = toJSONObject;
        function fromJSONObject(obj) {
            if (obj) {
                const boolOrUndef = (b) => (typeof b === 'boolean') ? b : undefined;
                const colorOrUndef = (s) => (typeof s === 'string') ? color_1.$Os.fromHex(s) : undefined;
                return new $W$(colorOrUndef(obj._foreground), boolOrUndef(obj._bold), boolOrUndef(obj._underline), boolOrUndef(obj._strikethrough), boolOrUndef(obj._italic));
            }
            return undefined;
        }
        $W$.fromJSONObject = fromJSONObject;
        function equals(s1, s2) {
            if (s1 === s2) {
                return true;
            }
            return s1 !== undefined && s2 !== undefined
                && (s1.foreground instanceof color_1.$Os ? s1.foreground.equals(s2.foreground) : s2.foreground === undefined)
                && s1.bold === s2.bold
                && s1.underline === s2.underline
                && s1.strikethrough === s2.strikethrough
                && s1.italic === s2.italic;
        }
        $W$.equals = equals;
        function is(s) {
            return s instanceof $W$;
        }
        $W$.is = is;
        function fromData(data) {
            return new $W$(data.foreground, data.bold, data.underline, data.strikethrough, data.italic);
        }
        $W$.fromData = fromData;
        function fromSettings(foreground, fontStyle, bold, underline, strikethrough, italic) {
            let foregroundColor = undefined;
            if (foreground !== undefined) {
                foregroundColor = color_1.$Os.fromHex(foreground);
            }
            if (fontStyle !== undefined) {
                bold = italic = underline = strikethrough = false;
                const expression = /italic|bold|underline|strikethrough/g;
                let match;
                while ((match = expression.exec(fontStyle))) {
                    switch (match[0]) {
                        case 'bold':
                            bold = true;
                            break;
                        case 'italic':
                            italic = true;
                            break;
                        case 'underline':
                            underline = true;
                            break;
                        case 'strikethrough':
                            strikethrough = true;
                            break;
                    }
                }
            }
            return new $W$(foregroundColor, bold, underline, strikethrough, italic);
        }
        $W$.fromSettings = fromSettings;
    })($W$ || (exports.$W$ = $W$ = {}));
    var SemanticTokenRule;
    (function (SemanticTokenRule) {
        function fromJSONObject(registry, o) {
            if (o && typeof o._selector === 'string' && o._style) {
                const style = $W$.fromJSONObject(o._style);
                if (style) {
                    try {
                        return { selector: registry.parseTokenSelector(o._selector), style };
                    }
                    catch (_ignore) {
                    }
                }
            }
            return undefined;
        }
        SemanticTokenRule.fromJSONObject = fromJSONObject;
        function toJSONObject(rule) {
            return {
                _selector: rule.selector.id,
                _style: $W$.toJSONObject(rule.style)
            };
        }
        SemanticTokenRule.toJSONObject = toJSONObject;
        function equals(r1, r2) {
            if (r1 === r2) {
                return true;
            }
            return r1 !== undefined && r2 !== undefined
                && r1.selector && r2.selector && r1.selector.id === r2.selector.id
                && $W$.equals(r1.style, r2.style);
        }
        SemanticTokenRule.equals = equals;
        function is(r) {
            return r && r.selector && typeof r.selector.id === 'string' && $W$.is(r.style);
        }
        SemanticTokenRule.is = is;
    })(SemanticTokenRule || (exports.SemanticTokenRule = SemanticTokenRule = {}));
    // TokenStyle registry
    const Extensions = {
        TokenClassificationContribution: 'base.contributions.tokenClassification'
    };
    class TokenClassificationRegistry {
        constructor() {
            this.c = new event_1.$fd();
            this.onDidChangeSchema = this.c.event;
            this.d = 0;
            this.f = 1;
            this.j = [];
            this.m = {
                type: 'object',
                properties: {},
                patternProperties: {
                    [selectorPattern]: getStylingSchemeEntry()
                },
                //errorMessage: nls.localize('schema.token.errors', 'Valid token selectors have the form (*|tokenType)(.tokenModifier)*(:tokenLanguage)?.'),
                additionalProperties: false,
                definitions: {
                    style: {
                        type: 'object',
                        description: nls.localize(0, null),
                        properties: {
                            foreground: {
                                type: 'string',
                                description: nls.localize(1, null),
                                format: 'color-hex',
                                default: '#ff0000'
                            },
                            background: {
                                type: 'string',
                                deprecationMessage: nls.localize(2, null)
                            },
                            fontStyle: {
                                type: 'string',
                                description: nls.localize(3, null),
                                pattern: fontStylePattern,
                                patternErrorMessage: nls.localize(4, null),
                                defaultSnippets: [
                                    { label: nls.localize(5, null), bodyText: '""' },
                                    { body: 'italic' },
                                    { body: 'bold' },
                                    { body: 'underline' },
                                    { body: 'strikethrough' },
                                    { body: 'italic bold' },
                                    { body: 'italic underline' },
                                    { body: 'italic strikethrough' },
                                    { body: 'bold underline' },
                                    { body: 'bold strikethrough' },
                                    { body: 'underline strikethrough' },
                                    { body: 'italic bold underline' },
                                    { body: 'italic bold strikethrough' },
                                    { body: 'italic underline strikethrough' },
                                    { body: 'bold underline strikethrough' },
                                    { body: 'italic bold underline strikethrough' }
                                ]
                            },
                            bold: {
                                type: 'boolean',
                                description: nls.localize(6, null),
                            },
                            italic: {
                                type: 'boolean',
                                description: nls.localize(7, null),
                            },
                            underline: {
                                type: 'boolean',
                                description: nls.localize(8, null),
                            },
                            strikethrough: {
                                type: 'boolean',
                                description: nls.localize(9, null),
                            }
                        },
                        defaultSnippets: [{ body: { foreground: '${1:#FF0000}', fontStyle: '${2:bold}' } }]
                    }
                }
            };
            this.g = Object.create(null);
            this.h = Object.create(null);
            this.l = Object.create(null);
        }
        registerTokenType(id, description, superType, deprecationMessage) {
            if (!id.match(exports.$V$)) {
                throw new Error('Invalid token type id.');
            }
            if (superType && !superType.match(exports.$V$)) {
                throw new Error('Invalid token super type id.');
            }
            const num = this.d++;
            const tokenStyleContribution = { num, id, superType, description, deprecationMessage };
            this.g[id] = tokenStyleContribution;
            const stylingSchemeEntry = getStylingSchemeEntry(description, deprecationMessage);
            this.m.properties[id] = stylingSchemeEntry;
            this.l = Object.create(null);
        }
        registerTokenModifier(id, description, deprecationMessage) {
            if (!id.match(exports.$V$)) {
                throw new Error('Invalid token modifier id.');
            }
            const num = this.f;
            this.f = this.f * 2;
            const tokenStyleContribution = { num, id, description, deprecationMessage };
            this.h[id] = tokenStyleContribution;
            this.m.properties[`*.${id}`] = getStylingSchemeEntry(description, deprecationMessage);
        }
        parseTokenSelector(selectorString, language) {
            const selector = $X$(selectorString, language);
            if (!selector.type) {
                return {
                    match: () => -1,
                    id: '$invalid'
                };
            }
            return {
                match: (type, modifiers, language) => {
                    let score = 0;
                    if (selector.language !== undefined) {
                        if (selector.language !== language) {
                            return -1;
                        }
                        score += 10;
                    }
                    if (selector.type !== TOKEN_TYPE_WILDCARD) {
                        const hierarchy = this.n(type);
                        const level = hierarchy.indexOf(selector.type);
                        if (level === -1) {
                            return -1;
                        }
                        score += (100 - level);
                    }
                    // all selector modifiers must be present
                    for (const selectorModifier of selector.modifiers) {
                        if (modifiers.indexOf(selectorModifier) === -1) {
                            return -1;
                        }
                    }
                    return score + selector.modifiers.length * 100;
                },
                id: `${[selector.type, ...selector.modifiers.sort()].join('.')}${selector.language !== undefined ? ':' + selector.language : ''}`
            };
        }
        registerTokenStyleDefault(selector, defaults) {
            this.j.push({ selector, defaults });
        }
        deregisterTokenStyleDefault(selector) {
            const selectorString = selector.id;
            this.j = this.j.filter(r => r.selector.id !== selectorString);
        }
        deregisterTokenType(id) {
            delete this.g[id];
            delete this.m.properties[id];
            this.l = Object.create(null);
        }
        deregisterTokenModifier(id) {
            delete this.h[id];
            delete this.m.properties[`*.${id}`];
        }
        getTokenTypes() {
            return Object.keys(this.g).map(id => this.g[id]);
        }
        getTokenModifiers() {
            return Object.keys(this.h).map(id => this.h[id]);
        }
        getTokenStylingSchema() {
            return this.m;
        }
        getTokenStylingDefaultRules() {
            return this.j;
        }
        n(typeId) {
            let hierarchy = this.l[typeId];
            if (!hierarchy) {
                this.l[typeId] = hierarchy = [typeId];
                let type = this.g[typeId];
                while (type && type.superType) {
                    hierarchy.push(type.superType);
                    type = this.g[type.superType];
                }
            }
            return hierarchy;
        }
        toString() {
            const sorter = (a, b) => {
                const cat1 = a.indexOf('.') === -1 ? 0 : 1;
                const cat2 = b.indexOf('.') === -1 ? 0 : 1;
                if (cat1 !== cat2) {
                    return cat1 - cat2;
                }
                return a.localeCompare(b);
            };
            return Object.keys(this.g).sort(sorter).map(k => `- \`${k}\`: ${this.g[k].description}`).join('\n');
        }
    }
    const CHAR_LANGUAGE = TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR.charCodeAt(0);
    const CHAR_MODIFIER = CLASSIFIER_MODIFIER_SEPARATOR.charCodeAt(0);
    function $X$(s, defaultLanguage) {
        let k = s.length;
        let language = defaultLanguage;
        const modifiers = [];
        for (let i = k - 1; i >= 0; i--) {
            const ch = s.charCodeAt(i);
            if (ch === CHAR_LANGUAGE || ch === CHAR_MODIFIER) {
                const segment = s.substring(i + 1, k);
                k = i;
                if (ch === CHAR_LANGUAGE) {
                    language = segment;
                }
                else {
                    modifiers.push(segment);
                }
            }
        }
        const type = s.substring(0, k);
        return { type, modifiers, language };
    }
    exports.$X$ = $X$;
    const tokenClassificationRegistry = createDefaultTokenClassificationRegistry();
    platform.$8m.add(Extensions.TokenClassificationContribution, tokenClassificationRegistry);
    function createDefaultTokenClassificationRegistry() {
        const registry = new TokenClassificationRegistry();
        function registerTokenType(id, description, scopesToProbe = [], superType, deprecationMessage) {
            registry.registerTokenType(id, description, superType, deprecationMessage);
            if (scopesToProbe) {
                registerTokenStyleDefault(id, scopesToProbe);
            }
            return id;
        }
        function registerTokenStyleDefault(selectorString, scopesToProbe) {
            try {
                const selector = registry.parseTokenSelector(selectorString);
                registry.registerTokenStyleDefault(selector, { scopesToProbe });
            }
            catch (e) {
                console.log(e);
            }
        }
        // default token types
        registerTokenType('comment', nls.localize(10, null), [['comment']]);
        registerTokenType('string', nls.localize(11, null), [['string']]);
        registerTokenType('keyword', nls.localize(12, null), [['keyword.control']]);
        registerTokenType('number', nls.localize(13, null), [['constant.numeric']]);
        registerTokenType('regexp', nls.localize(14, null), [['constant.regexp']]);
        registerTokenType('operator', nls.localize(15, null), [['keyword.operator']]);
        registerTokenType('namespace', nls.localize(16, null), [['entity.name.namespace']]);
        registerTokenType('type', nls.localize(17, null), [['entity.name.type'], ['support.type']]);
        registerTokenType('struct', nls.localize(18, null), [['entity.name.type.struct']]);
        registerTokenType('class', nls.localize(19, null), [['entity.name.type.class'], ['support.class']]);
        registerTokenType('interface', nls.localize(20, null), [['entity.name.type.interface']]);
        registerTokenType('enum', nls.localize(21, null), [['entity.name.type.enum']]);
        registerTokenType('typeParameter', nls.localize(22, null), [['entity.name.type.parameter']]);
        registerTokenType('function', nls.localize(23, null), [['entity.name.function'], ['support.function']]);
        registerTokenType('member', nls.localize(24, null), [], 'method', 'Deprecated use `method` instead');
        registerTokenType('method', nls.localize(25, null), [['entity.name.function.member'], ['support.function']]);
        registerTokenType('macro', nls.localize(26, null), [['entity.name.function.preprocessor']]);
        registerTokenType('variable', nls.localize(27, null), [['variable.other.readwrite'], ['entity.name.variable']]);
        registerTokenType('parameter', nls.localize(28, null), [['variable.parameter']]);
        registerTokenType('property', nls.localize(29, null), [['variable.other.property']]);
        registerTokenType('enumMember', nls.localize(30, null), [['variable.other.enummember']]);
        registerTokenType('event', nls.localize(31, null), [['variable.other.event']]);
        registerTokenType('decorator', nls.localize(32, null), [['entity.name.decorator'], ['entity.name.function']]);
        registerTokenType('label', nls.localize(33, null), undefined);
        // default token modifiers
        registry.registerTokenModifier('declaration', nls.localize(34, null), undefined);
        registry.registerTokenModifier('documentation', nls.localize(35, null), undefined);
        registry.registerTokenModifier('static', nls.localize(36, null), undefined);
        registry.registerTokenModifier('abstract', nls.localize(37, null), undefined);
        registry.registerTokenModifier('deprecated', nls.localize(38, null), undefined);
        registry.registerTokenModifier('modification', nls.localize(39, null), undefined);
        registry.registerTokenModifier('async', nls.localize(40, null), undefined);
        registry.registerTokenModifier('readonly', nls.localize(41, null), undefined);
        registerTokenStyleDefault('variable.readonly', [['variable.other.constant']]);
        registerTokenStyleDefault('property.readonly', [['variable.other.constant.property']]);
        registerTokenStyleDefault('type.defaultLibrary', [['support.type']]);
        registerTokenStyleDefault('class.defaultLibrary', [['support.class']]);
        registerTokenStyleDefault('interface.defaultLibrary', [['support.class']]);
        registerTokenStyleDefault('variable.defaultLibrary', [['support.variable'], ['support.other.variable']]);
        registerTokenStyleDefault('variable.defaultLibrary.readonly', [['support.constant']]);
        registerTokenStyleDefault('property.defaultLibrary', [['support.variable.property']]);
        registerTokenStyleDefault('property.defaultLibrary.readonly', [['support.constant.property']]);
        registerTokenStyleDefault('function.defaultLibrary', [['support.function']]);
        registerTokenStyleDefault('member.defaultLibrary', [['support.function']]);
        return registry;
    }
    function $Y$() {
        return tokenClassificationRegistry;
    }
    exports.$Y$ = $Y$;
    function getStylingSchemeEntry(description, deprecationMessage) {
        return {
            description,
            deprecationMessage,
            defaultSnippets: [{ body: '${1:#ff0000}' }],
            anyOf: [
                {
                    type: 'string',
                    format: 'color-hex'
                },
                {
                    $ref: '#/definitions/style'
                }
            ]
        };
    }
    exports.$Z$ = 'vscode://schemas/token-styling';
    const schemaRegistry = platform.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
    schemaRegistry.registerSchema(exports.$Z$, tokenClassificationRegistry.getTokenStylingSchema());
    const delayer = new async_1.$Sg(() => schemaRegistry.notifySchemaChanged(exports.$Z$), 200);
    tokenClassificationRegistry.onDidChangeSchema(() => {
        if (!delayer.isScheduled()) {
            delayer.schedule();
        }
    });
});
//# sourceMappingURL=tokenClassificationRegistry.js.map