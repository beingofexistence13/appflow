/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/color", "vs/base/common/event", "vs/nls", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform"], function (require, exports, async_1, color_1, event_1, nls, jsonContributionRegistry_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tokenStylingSchemaId = exports.getTokenClassificationRegistry = exports.parseClassifierString = exports.SemanticTokenRule = exports.TokenStyle = exports.typeAndModifierIdPattern = void 0;
    const TOKEN_TYPE_WILDCARD = '*';
    const TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR = ':';
    const CLASSIFIER_MODIFIER_SEPARATOR = '.';
    const idPattern = '\\w+[-_\\w+]*';
    exports.typeAndModifierIdPattern = `^${idPattern}$`;
    const selectorPattern = `^(${idPattern}|\\*)(\\${CLASSIFIER_MODIFIER_SEPARATOR}${idPattern})*(${TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR}${idPattern})?$`;
    const fontStylePattern = '^(\\s*(italic|bold|underline|strikethrough))*\\s*$';
    class TokenStyle {
        constructor(foreground, bold, underline, strikethrough, italic) {
            this.foreground = foreground;
            this.bold = bold;
            this.underline = underline;
            this.strikethrough = strikethrough;
            this.italic = italic;
        }
    }
    exports.TokenStyle = TokenStyle;
    (function (TokenStyle) {
        function toJSONObject(style) {
            return {
                _foreground: style.foreground === undefined ? null : color_1.Color.Format.CSS.formatHexA(style.foreground, true),
                _bold: style.bold === undefined ? null : style.bold,
                _underline: style.underline === undefined ? null : style.underline,
                _italic: style.italic === undefined ? null : style.italic,
                _strikethrough: style.strikethrough === undefined ? null : style.strikethrough,
            };
        }
        TokenStyle.toJSONObject = toJSONObject;
        function fromJSONObject(obj) {
            if (obj) {
                const boolOrUndef = (b) => (typeof b === 'boolean') ? b : undefined;
                const colorOrUndef = (s) => (typeof s === 'string') ? color_1.Color.fromHex(s) : undefined;
                return new TokenStyle(colorOrUndef(obj._foreground), boolOrUndef(obj._bold), boolOrUndef(obj._underline), boolOrUndef(obj._strikethrough), boolOrUndef(obj._italic));
            }
            return undefined;
        }
        TokenStyle.fromJSONObject = fromJSONObject;
        function equals(s1, s2) {
            if (s1 === s2) {
                return true;
            }
            return s1 !== undefined && s2 !== undefined
                && (s1.foreground instanceof color_1.Color ? s1.foreground.equals(s2.foreground) : s2.foreground === undefined)
                && s1.bold === s2.bold
                && s1.underline === s2.underline
                && s1.strikethrough === s2.strikethrough
                && s1.italic === s2.italic;
        }
        TokenStyle.equals = equals;
        function is(s) {
            return s instanceof TokenStyle;
        }
        TokenStyle.is = is;
        function fromData(data) {
            return new TokenStyle(data.foreground, data.bold, data.underline, data.strikethrough, data.italic);
        }
        TokenStyle.fromData = fromData;
        function fromSettings(foreground, fontStyle, bold, underline, strikethrough, italic) {
            let foregroundColor = undefined;
            if (foreground !== undefined) {
                foregroundColor = color_1.Color.fromHex(foreground);
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
            return new TokenStyle(foregroundColor, bold, underline, strikethrough, italic);
        }
        TokenStyle.fromSettings = fromSettings;
    })(TokenStyle || (exports.TokenStyle = TokenStyle = {}));
    var SemanticTokenRule;
    (function (SemanticTokenRule) {
        function fromJSONObject(registry, o) {
            if (o && typeof o._selector === 'string' && o._style) {
                const style = TokenStyle.fromJSONObject(o._style);
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
                _style: TokenStyle.toJSONObject(rule.style)
            };
        }
        SemanticTokenRule.toJSONObject = toJSONObject;
        function equals(r1, r2) {
            if (r1 === r2) {
                return true;
            }
            return r1 !== undefined && r2 !== undefined
                && r1.selector && r2.selector && r1.selector.id === r2.selector.id
                && TokenStyle.equals(r1.style, r2.style);
        }
        SemanticTokenRule.equals = equals;
        function is(r) {
            return r && r.selector && typeof r.selector.id === 'string' && TokenStyle.is(r.style);
        }
        SemanticTokenRule.is = is;
    })(SemanticTokenRule || (exports.SemanticTokenRule = SemanticTokenRule = {}));
    // TokenStyle registry
    const Extensions = {
        TokenClassificationContribution: 'base.contributions.tokenClassification'
    };
    class TokenClassificationRegistry {
        constructor() {
            this._onDidChangeSchema = new event_1.Emitter();
            this.onDidChangeSchema = this._onDidChangeSchema.event;
            this.currentTypeNumber = 0;
            this.currentModifierBit = 1;
            this.tokenStylingDefaultRules = [];
            this.tokenStylingSchema = {
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
                        description: nls.localize('schema.token.settings', 'Colors and styles for the token.'),
                        properties: {
                            foreground: {
                                type: 'string',
                                description: nls.localize('schema.token.foreground', 'Foreground color for the token.'),
                                format: 'color-hex',
                                default: '#ff0000'
                            },
                            background: {
                                type: 'string',
                                deprecationMessage: nls.localize('schema.token.background.warning', 'Token background colors are currently not supported.')
                            },
                            fontStyle: {
                                type: 'string',
                                description: nls.localize('schema.token.fontStyle', 'Sets the all font styles of the rule: \'italic\', \'bold\', \'underline\' or \'strikethrough\' or a combination. All styles that are not listed are unset. The empty string unsets all styles.'),
                                pattern: fontStylePattern,
                                patternErrorMessage: nls.localize('schema.fontStyle.error', 'Font style must be \'italic\', \'bold\', \'underline\' or \'strikethrough\' or a combination. The empty string unsets all styles.'),
                                defaultSnippets: [
                                    { label: nls.localize('schema.token.fontStyle.none', 'None (clear inherited style)'), bodyText: '""' },
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
                                description: nls.localize('schema.token.bold', 'Sets or unsets the font style to bold. Note, the presence of \'fontStyle\' overrides this setting.'),
                            },
                            italic: {
                                type: 'boolean',
                                description: nls.localize('schema.token.italic', 'Sets or unsets the font style to italic. Note, the presence of \'fontStyle\' overrides this setting.'),
                            },
                            underline: {
                                type: 'boolean',
                                description: nls.localize('schema.token.underline', 'Sets or unsets the font style to underline. Note, the presence of \'fontStyle\' overrides this setting.'),
                            },
                            strikethrough: {
                                type: 'boolean',
                                description: nls.localize('schema.token.strikethrough', 'Sets or unsets the font style to strikethrough. Note, the presence of \'fontStyle\' overrides this setting.'),
                            }
                        },
                        defaultSnippets: [{ body: { foreground: '${1:#FF0000}', fontStyle: '${2:bold}' } }]
                    }
                }
            };
            this.tokenTypeById = Object.create(null);
            this.tokenModifierById = Object.create(null);
            this.typeHierarchy = Object.create(null);
        }
        registerTokenType(id, description, superType, deprecationMessage) {
            if (!id.match(exports.typeAndModifierIdPattern)) {
                throw new Error('Invalid token type id.');
            }
            if (superType && !superType.match(exports.typeAndModifierIdPattern)) {
                throw new Error('Invalid token super type id.');
            }
            const num = this.currentTypeNumber++;
            const tokenStyleContribution = { num, id, superType, description, deprecationMessage };
            this.tokenTypeById[id] = tokenStyleContribution;
            const stylingSchemeEntry = getStylingSchemeEntry(description, deprecationMessage);
            this.tokenStylingSchema.properties[id] = stylingSchemeEntry;
            this.typeHierarchy = Object.create(null);
        }
        registerTokenModifier(id, description, deprecationMessage) {
            if (!id.match(exports.typeAndModifierIdPattern)) {
                throw new Error('Invalid token modifier id.');
            }
            const num = this.currentModifierBit;
            this.currentModifierBit = this.currentModifierBit * 2;
            const tokenStyleContribution = { num, id, description, deprecationMessage };
            this.tokenModifierById[id] = tokenStyleContribution;
            this.tokenStylingSchema.properties[`*.${id}`] = getStylingSchemeEntry(description, deprecationMessage);
        }
        parseTokenSelector(selectorString, language) {
            const selector = parseClassifierString(selectorString, language);
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
                        const hierarchy = this.getTypeHierarchy(type);
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
            this.tokenStylingDefaultRules.push({ selector, defaults });
        }
        deregisterTokenStyleDefault(selector) {
            const selectorString = selector.id;
            this.tokenStylingDefaultRules = this.tokenStylingDefaultRules.filter(r => r.selector.id !== selectorString);
        }
        deregisterTokenType(id) {
            delete this.tokenTypeById[id];
            delete this.tokenStylingSchema.properties[id];
            this.typeHierarchy = Object.create(null);
        }
        deregisterTokenModifier(id) {
            delete this.tokenModifierById[id];
            delete this.tokenStylingSchema.properties[`*.${id}`];
        }
        getTokenTypes() {
            return Object.keys(this.tokenTypeById).map(id => this.tokenTypeById[id]);
        }
        getTokenModifiers() {
            return Object.keys(this.tokenModifierById).map(id => this.tokenModifierById[id]);
        }
        getTokenStylingSchema() {
            return this.tokenStylingSchema;
        }
        getTokenStylingDefaultRules() {
            return this.tokenStylingDefaultRules;
        }
        getTypeHierarchy(typeId) {
            let hierarchy = this.typeHierarchy[typeId];
            if (!hierarchy) {
                this.typeHierarchy[typeId] = hierarchy = [typeId];
                let type = this.tokenTypeById[typeId];
                while (type && type.superType) {
                    hierarchy.push(type.superType);
                    type = this.tokenTypeById[type.superType];
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
            return Object.keys(this.tokenTypeById).sort(sorter).map(k => `- \`${k}\`: ${this.tokenTypeById[k].description}`).join('\n');
        }
    }
    const CHAR_LANGUAGE = TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR.charCodeAt(0);
    const CHAR_MODIFIER = CLASSIFIER_MODIFIER_SEPARATOR.charCodeAt(0);
    function parseClassifierString(s, defaultLanguage) {
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
    exports.parseClassifierString = parseClassifierString;
    const tokenClassificationRegistry = createDefaultTokenClassificationRegistry();
    platform.Registry.add(Extensions.TokenClassificationContribution, tokenClassificationRegistry);
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
        registerTokenType('comment', nls.localize('comment', "Style for comments."), [['comment']]);
        registerTokenType('string', nls.localize('string', "Style for strings."), [['string']]);
        registerTokenType('keyword', nls.localize('keyword', "Style for keywords."), [['keyword.control']]);
        registerTokenType('number', nls.localize('number', "Style for numbers."), [['constant.numeric']]);
        registerTokenType('regexp', nls.localize('regexp', "Style for expressions."), [['constant.regexp']]);
        registerTokenType('operator', nls.localize('operator', "Style for operators."), [['keyword.operator']]);
        registerTokenType('namespace', nls.localize('namespace', "Style for namespaces."), [['entity.name.namespace']]);
        registerTokenType('type', nls.localize('type', "Style for types."), [['entity.name.type'], ['support.type']]);
        registerTokenType('struct', nls.localize('struct', "Style for structs."), [['entity.name.type.struct']]);
        registerTokenType('class', nls.localize('class', "Style for classes."), [['entity.name.type.class'], ['support.class']]);
        registerTokenType('interface', nls.localize('interface', "Style for interfaces."), [['entity.name.type.interface']]);
        registerTokenType('enum', nls.localize('enum', "Style for enums."), [['entity.name.type.enum']]);
        registerTokenType('typeParameter', nls.localize('typeParameter', "Style for type parameters."), [['entity.name.type.parameter']]);
        registerTokenType('function', nls.localize('function', "Style for functions"), [['entity.name.function'], ['support.function']]);
        registerTokenType('member', nls.localize('member', "Style for member functions"), [], 'method', 'Deprecated use `method` instead');
        registerTokenType('method', nls.localize('method', "Style for method (member functions)"), [['entity.name.function.member'], ['support.function']]);
        registerTokenType('macro', nls.localize('macro', "Style for macros."), [['entity.name.function.preprocessor']]);
        registerTokenType('variable', nls.localize('variable', "Style for variables."), [['variable.other.readwrite'], ['entity.name.variable']]);
        registerTokenType('parameter', nls.localize('parameter', "Style for parameters."), [['variable.parameter']]);
        registerTokenType('property', nls.localize('property', "Style for properties."), [['variable.other.property']]);
        registerTokenType('enumMember', nls.localize('enumMember', "Style for enum members."), [['variable.other.enummember']]);
        registerTokenType('event', nls.localize('event', "Style for events."), [['variable.other.event']]);
        registerTokenType('decorator', nls.localize('decorator', "Style for decorators & annotations."), [['entity.name.decorator'], ['entity.name.function']]);
        registerTokenType('label', nls.localize('labels', "Style for labels. "), undefined);
        // default token modifiers
        registry.registerTokenModifier('declaration', nls.localize('declaration', "Style for all symbol declarations."), undefined);
        registry.registerTokenModifier('documentation', nls.localize('documentation', "Style to use for references in documentation."), undefined);
        registry.registerTokenModifier('static', nls.localize('static', "Style to use for symbols that are static."), undefined);
        registry.registerTokenModifier('abstract', nls.localize('abstract', "Style to use for symbols that are abstract."), undefined);
        registry.registerTokenModifier('deprecated', nls.localize('deprecated', "Style to use for symbols that are deprecated."), undefined);
        registry.registerTokenModifier('modification', nls.localize('modification', "Style to use for write accesses."), undefined);
        registry.registerTokenModifier('async', nls.localize('async', "Style to use for symbols that are async."), undefined);
        registry.registerTokenModifier('readonly', nls.localize('readonly', "Style to use for symbols that are read-only."), undefined);
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
    function getTokenClassificationRegistry() {
        return tokenClassificationRegistry;
    }
    exports.getTokenClassificationRegistry = getTokenClassificationRegistry;
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
    exports.tokenStylingSchemaId = 'vscode://schemas/token-styling';
    const schemaRegistry = platform.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(exports.tokenStylingSchemaId, tokenClassificationRegistry.getTokenStylingSchema());
    const delayer = new async_1.RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(exports.tokenStylingSchemaId), 200);
    tokenClassificationRegistry.onDidChangeSchema(() => {
        if (!delayer.isScheduled()) {
            delayer.schedule();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5DbGFzc2lmaWNhdGlvblJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGhlbWUvY29tbW9uL3Rva2VuQ2xhc3NpZmljYXRpb25SZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBTSxtQkFBbUIsR0FBRyxHQUFHLENBQUM7SUFDaEMsTUFBTSxtQ0FBbUMsR0FBRyxHQUFHLENBQUM7SUFDaEQsTUFBTSw2QkFBNkIsR0FBRyxHQUFHLENBQUM7SUFLMUMsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDO0lBQ3JCLFFBQUEsd0JBQXdCLEdBQUcsSUFBSSxTQUFTLEdBQUcsQ0FBQztJQUV6RCxNQUFNLGVBQWUsR0FBRyxLQUFLLFNBQVMsV0FBVyw2QkFBNkIsR0FBRyxTQUFTLE1BQU0sbUNBQW1DLEdBQUcsU0FBUyxLQUFLLENBQUM7SUFFckosTUFBTSxnQkFBZ0IsR0FBRyxvREFBb0QsQ0FBQztJQXdCOUUsTUFBYSxVQUFVO1FBQ3RCLFlBQ2lCLFVBQTZCLEVBQzdCLElBQXlCLEVBQ3pCLFNBQThCLEVBQzlCLGFBQWtDLEVBQ2xDLE1BQTJCO1lBSjNCLGVBQVUsR0FBVixVQUFVLENBQW1CO1lBQzdCLFNBQUksR0FBSixJQUFJLENBQXFCO1lBQ3pCLGNBQVMsR0FBVCxTQUFTLENBQXFCO1lBQzlCLGtCQUFhLEdBQWIsYUFBYSxDQUFxQjtZQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFxQjtRQUU1QyxDQUFDO0tBQ0Q7SUFURCxnQ0FTQztJQUVELFdBQWlCLFVBQVU7UUFDMUIsU0FBZ0IsWUFBWSxDQUFDLEtBQWlCO1lBQzdDLE9BQU87Z0JBQ04sV0FBVyxFQUFFLEtBQUssQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMs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