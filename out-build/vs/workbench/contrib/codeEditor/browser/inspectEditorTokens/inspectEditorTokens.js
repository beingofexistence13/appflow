/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/inspectEditorTokens/inspectEditorTokens", "vs/base/browser/dom", "vs/base/common/color", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/encodedTokenAttributes", "vs/editor/common/languages/language", "vs/platform/notification/common/notification", "vs/workbench/services/textMate/common/TMHelper", "vs/workbench/services/textMate/browser/textMateTokenizationFeature", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/cancellation", "vs/platform/theme/common/tokenClassificationRegistry", "vs/platform/configuration/common/configuration", "vs/editor/contrib/semanticTokens/common/semanticTokensConfig", "vs/base/common/network", "vs/editor/common/services/languageFeatures", "vs/css!./inspectEditorTokens"], function (require, exports, nls, dom, color_1, lifecycle_1, editorExtensions_1, range_1, encodedTokenAttributes_1, language_1, notification_1, TMHelper_1, textMateTokenizationFeature_1, workbenchThemeService_1, cancellation_1, tokenClassificationRegistry_1, configuration_1, semanticTokensConfig_1, network_1, languageFeatures_1) {
    "use strict";
    var InspectEditorTokensController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const $ = dom.$;
    let InspectEditorTokensController = class InspectEditorTokensController extends lifecycle_1.$kc {
        static { InspectEditorTokensController_1 = this; }
        static { this.ID = 'editor.contrib.inspectEditorTokens'; }
        static get(editor) {
            return editor.getContribution(InspectEditorTokensController_1.ID);
        }
        constructor(editor, textMateService, languageService, themeService, notificationService, configurationService, languageFeaturesService) {
            super();
            this.a = editor;
            this.b = textMateService;
            this.c = themeService;
            this.f = languageService;
            this.g = notificationService;
            this.h = configurationService;
            this.j = languageFeaturesService;
            this.m = null;
            this.B(this.a.onDidChangeModel((e) => this.stop()));
            this.B(this.a.onDidChangeModelLanguage((e) => this.stop()));
            this.B(this.a.onKeyUp((e) => e.keyCode === 9 /* KeyCode.Escape */ && this.stop()));
        }
        dispose() {
            this.stop();
            super.dispose();
        }
        launch() {
            if (this.m) {
                return;
            }
            if (!this.a.hasModel()) {
                return;
            }
            if (this.a.getModel().uri.scheme === network_1.Schemas.vscodeNotebookCell) {
                // disable in notebooks
                return;
            }
            this.m = new InspectEditorTokensWidget(this.a, this.b, this.f, this.c, this.g, this.h, this.j);
        }
        stop() {
            if (this.m) {
                this.m.dispose();
                this.m = null;
            }
        }
        toggle() {
            if (!this.m) {
                this.launch();
            }
            else {
                this.stop();
            }
        }
    };
    InspectEditorTokensController = InspectEditorTokensController_1 = __decorate([
        __param(1, textMateTokenizationFeature_1.$qBb),
        __param(2, language_1.$ct),
        __param(3, workbenchThemeService_1.$egb),
        __param(4, notification_1.$Yu),
        __param(5, configuration_1.$8h),
        __param(6, languageFeatures_1.$hF)
    ], InspectEditorTokensController);
    class InspectEditorTokens extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.inspectTMScopes',
                label: nls.localize(0, null),
                alias: 'Developer: Inspect Editor Tokens and Scopes',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const controller = InspectEditorTokensController.get(editor);
            controller?.toggle();
        }
    }
    function renderTokenText(tokenText) {
        if (tokenText.length > 40) {
            tokenText = tokenText.substr(0, 20) + '…' + tokenText.substr(tokenText.length - 20);
        }
        let result = '';
        for (let charIndex = 0, len = tokenText.length; charIndex < len; charIndex++) {
            const charCode = tokenText.charCodeAt(charIndex);
            switch (charCode) {
                case 9 /* CharCode.Tab */:
                    result += '\u2192'; // &rarr;
                    break;
                case 32 /* CharCode.Space */:
                    result += '\u00B7'; // &middot;
                    break;
                default:
                    result += String.fromCharCode(charCode);
            }
        }
        return result;
    }
    class InspectEditorTokensWidget extends lifecycle_1.$kc {
        static { this.a = 'editor.contrib.inspectEditorTokensWidget'; }
        constructor(editor, textMateService, languageService, themeService, notificationService, configurationService, languageFeaturesService) {
            super();
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.b = false;
            this.c = editor;
            this.f = languageService;
            this.g = themeService;
            this.h = textMateService;
            this.j = notificationService;
            this.m = configurationService;
            this.n = languageFeaturesService;
            this.r = this.c.getModel();
            this.s = document.createElement('div');
            this.s.className = 'token-inspect-widget';
            this.u = new cancellation_1.$pd();
            this.w(this.c.getPosition());
            this.B(this.c.onDidChangeCursorPosition((e) => this.w(this.c.getPosition())));
            this.B(themeService.onDidColorThemeChange(_ => this.w(this.c.getPosition())));
            this.B(configurationService.onDidChangeConfiguration(e => e.affectsConfiguration('editor.semanticHighlighting.enabled') && this.w(this.c.getPosition())));
            this.c.addContentWidget(this);
        }
        dispose() {
            this.b = true;
            this.c.removeContentWidget(this);
            this.u.cancel();
            super.dispose();
        }
        getId() {
            return InspectEditorTokensWidget.a;
        }
        w(position) {
            const grammar = this.h.createTokenizer(this.r.getLanguageId());
            const semanticTokens = this.J(position);
            dom.$lO(this.s);
            this.s.appendChild(document.createTextNode(nls.localize(1, null)));
            Promise.all([grammar, semanticTokens]).then(([grammar, semanticTokens]) => {
                if (this.b) {
                    return;
                }
                this.z(grammar, semanticTokens, position);
                this.s.style.maxWidth = `${Math.max(this.c.getLayoutInfo().width * 0.66, 500)}px`;
                this.c.layoutContentWidget(this);
            }, (err) => {
                this.j.warn(err);
                setTimeout(() => {
                    InspectEditorTokensController.get(this.c)?.stop();
                });
            });
        }
        y() {
            const setting = this.m.getValue(semanticTokensConfig_1.$F0, { overrideIdentifier: this.r.getLanguageId(), resource: this.r.uri })?.enabled;
            if (typeof setting === 'boolean') {
                return setting;
            }
            return this.g.getColorTheme().semanticHighlighting;
        }
        z(grammar, semanticTokens, position) {
            const textMateTokenInfo = grammar && this.G(grammar, position);
            const semanticTokenInfo = semanticTokens && this.L(semanticTokens, position);
            if (!textMateTokenInfo && !semanticTokenInfo) {
                dom.$_O(this.s, 'No grammar or semantic tokens available.');
                return;
            }
            const tmMetadata = textMateTokenInfo?.metadata;
            const semMetadata = semanticTokenInfo?.metadata;
            const semTokenText = semanticTokenInfo && renderTokenText(this.r.getValueInRange(semanticTokenInfo.range));
            const tmTokenText = textMateTokenInfo && renderTokenText(this.r.getLineContent(position.lineNumber).substring(textMateTokenInfo.token.startIndex, textMateTokenInfo.token.endIndex));
            const tokenText = semTokenText || tmTokenText || '';
            dom.$_O(this.s, $('h2.tiw-token', undefined, tokenText, $('span.tiw-token-length', undefined, `${tokenText.length} ${tokenText.length === 1 ? 'char' : 'chars'}`)));
            dom.$0O(this.s, $('hr.tiw-metadata-separator', { 'style': 'clear:both' }));
            dom.$0O(this.s, $('table.tiw-metadata-table', undefined, $('tbody', undefined, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'language'), $('td.tiw-metadata-value', undefined, tmMetadata?.languageId || '')), $('tr', undefined, $('td.tiw-metadata-key', undefined, 'standard token type'), $('td.tiw-metadata-value', undefined, this.F(tmMetadata?.tokenType || 0 /* StandardTokenType.Other */))), ...this.C(semMetadata, tmMetadata))));
            if (semanticTokenInfo) {
                dom.$0O(this.s, $('hr.tiw-metadata-separator'));
                const table = dom.$0O(this.s, $('table.tiw-metadata-table', undefined));
                const tbody = dom.$0O(table, $('tbody', undefined, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'semantic token type'), $('td.tiw-metadata-value', undefined, semanticTokenInfo.type))));
                if (semanticTokenInfo.modifiers.length) {
                    dom.$0O(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'modifiers'), $('td.tiw-metadata-value', undefined, semanticTokenInfo.modifiers.join(' '))));
                }
                if (semanticTokenInfo.metadata) {
                    const properties = ['foreground', 'bold', 'italic', 'underline', 'strikethrough'];
                    const propertiesByDefValue = {};
                    const allDefValues = new Array(); // remember the order
                    // first collect to detect when the same rule is used for multiple properties
                    for (const property of properties) {
                        if (semanticTokenInfo.metadata[property] !== undefined) {
                            const definition = semanticTokenInfo.definitions[property];
                            const defValue = this.M(definition, property);
                            const defValueStr = defValue.map(el => el instanceof HTMLElement ? el.outerHTML : el).join();
                            let properties = propertiesByDefValue[defValueStr];
                            if (!properties) {
                                propertiesByDefValue[defValueStr] = properties = [];
                                allDefValues.push([defValue, defValueStr]);
                            }
                            properties.push(property);
                        }
                    }
                    for (const [defValue, defValueStr] of allDefValues) {
                        dom.$0O(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, propertiesByDefValue[defValueStr].join(', ')), $('td.tiw-metadata-value', undefined, ...defValue)));
                    }
                }
            }
            if (textMateTokenInfo) {
                const theme = this.g.getColorTheme();
                dom.$0O(this.s, $('hr.tiw-metadata-separator'));
                const table = dom.$0O(this.s, $('table.tiw-metadata-table'));
                const tbody = dom.$0O(table, $('tbody'));
                if (tmTokenText && tmTokenText !== tokenText) {
                    dom.$0O(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'textmate token'), $('td.tiw-metadata-value', undefined, `${tmTokenText} (${tmTokenText.length})`)));
                }
                const scopes = new Array();
                for (let i = textMateTokenInfo.token.scopes.length - 1; i >= 0; i--) {
                    scopes.push(textMateTokenInfo.token.scopes[i]);
                    if (i > 0) {
                        scopes.push($('br'));
                    }
                }
                dom.$0O(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'textmate scopes'), $('td.tiw-metadata-value.tiw-metadata-scopes', undefined, ...scopes)));
                const matchingRule = (0, TMHelper_1.$8Xb)(theme, textMateTokenInfo.token.scopes, false);
                const semForeground = semanticTokenInfo?.metadata?.foreground;
                if (matchingRule) {
                    if (semForeground !== textMateTokenInfo.metadata.foreground) {
                        let defValue = $('code.tiw-theme-selector', undefined, matchingRule.rawSelector, $('br'), JSON.stringify(matchingRule.settings, null, '\t'));
                        if (semForeground) {
                            defValue = $('s', undefined, defValue);
                        }
                        dom.$0O(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'foreground'), $('td.tiw-metadata-value', undefined, defValue)));
                    }
                }
                else if (!semForeground) {
                    dom.$0O(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'foreground'), $('td.tiw-metadata-value', undefined, 'No theme selector')));
                }
            }
        }
        C(semantic, tm) {
            const elements = new Array();
            function render(property) {
                const value = semantic?.[property] || tm?.[property];
                if (value !== undefined) {
                    const semanticStyle = semantic?.[property] ? 'tiw-metadata-semantic' : '';
                    elements.push($('tr', undefined, $('td.tiw-metadata-key', undefined, property), $(`td.tiw-metadata-value.${semanticStyle}`, undefined, value)));
                }
                return value;
            }
            const foreground = render('foreground');
            const background = render('background');
            if (foreground && background) {
                const backgroundColor = color_1.$Os.fromHex(background), foregroundColor = color_1.$Os.fromHex(foreground);
                if (backgroundColor.isOpaque()) {
                    elements.push($('tr', undefined, $('td.tiw-metadata-key', undefined, 'contrast ratio'), $('td.tiw-metadata-value', undefined, backgroundColor.getContrastRatio(foregroundColor.makeOpaque(backgroundColor)).toFixed(2))));
                }
                else {
                    elements.push($('tr', undefined, $('td.tiw-metadata-key', undefined, 'Contrast ratio cannot be precise for background colors that use transparency'), $('td.tiw-metadata-value')));
                }
            }
            const fontStyleLabels = new Array();
            function addStyle(key) {
                let label;
                if (semantic && semantic[key]) {
                    label = $('span.tiw-metadata-semantic', undefined, key);
                }
                else if (tm && tm[key]) {
                    label = key;
                }
                if (label) {
                    if (fontStyleLabels.length) {
                        fontStyleLabels.push(' ');
                    }
                    fontStyleLabels.push(label);
                }
            }
            addStyle('bold');
            addStyle('italic');
            addStyle('underline');
            addStyle('strikethrough');
            if (fontStyleLabels.length) {
                elements.push($('tr', undefined, $('td.tiw-metadata-key', undefined, 'font style'), $('td.tiw-metadata-value', undefined, ...fontStyleLabels)));
            }
            return elements;
        }
        D(metadata) {
            const colorMap = this.g.getColorTheme().tokenColorMap;
            const languageId = encodedTokenAttributes_1.$Us.getLanguageId(metadata);
            const tokenType = encodedTokenAttributes_1.$Us.getTokenType(metadata);
            const fontStyle = encodedTokenAttributes_1.$Us.getFontStyle(metadata);
            const foreground = encodedTokenAttributes_1.$Us.getForeground(metadata);
            const background = encodedTokenAttributes_1.$Us.getBackground(metadata);
            return {
                languageId: this.f.languageIdCodec.decodeLanguageId(languageId),
                tokenType: tokenType,
                bold: (fontStyle & 2 /* FontStyle.Bold */) ? true : undefined,
                italic: (fontStyle & 1 /* FontStyle.Italic */) ? true : undefined,
                underline: (fontStyle & 4 /* FontStyle.Underline */) ? true : undefined,
                strikethrough: (fontStyle & 8 /* FontStyle.Strikethrough */) ? true : undefined,
                foreground: colorMap[foreground],
                background: colorMap[background]
            };
        }
        F(tokenType) {
            switch (tokenType) {
                case 0 /* StandardTokenType.Other */: return 'Other';
                case 1 /* StandardTokenType.Comment */: return 'Comment';
                case 2 /* StandardTokenType.String */: return 'String';
                case 3 /* StandardTokenType.RegEx */: return 'RegEx';
                default: return '??';
            }
        }
        G(grammar, position) {
            const lineNumber = position.lineNumber;
            const stateBeforeLine = this.H(grammar, lineNumber);
            const tokenizationResult1 = grammar.tokenizeLine(this.r.getLineContent(lineNumber), stateBeforeLine);
            const tokenizationResult2 = grammar.tokenizeLine2(this.r.getLineContent(lineNumber), stateBeforeLine);
            let token1Index = 0;
            for (let i = tokenizationResult1.tokens.length - 1; i >= 0; i--) {
                const t = tokenizationResult1.tokens[i];
                if (position.column - 1 >= t.startIndex) {
                    token1Index = i;
                    break;
                }
            }
            let token2Index = 0;
            for (let i = (tokenizationResult2.tokens.length >>> 1); i >= 0; i--) {
                if (position.column - 1 >= tokenizationResult2.tokens[(i << 1)]) {
                    token2Index = i;
                    break;
                }
            }
            return {
                token: tokenizationResult1.tokens[token1Index],
                metadata: this.D(tokenizationResult2.tokens[(token2Index << 1) + 1])
            };
        }
        H(grammar, lineNumber) {
            let state = null;
            for (let i = 1; i < lineNumber; i++) {
                const tokenizationResult = grammar.tokenizeLine(this.r.getLineContent(i), state);
                state = tokenizationResult.ruleStack;
            }
            return state;
        }
        I(token) {
            return token && token.data;
        }
        async J(position) {
            if (!this.y()) {
                return null;
            }
            const tokenProviders = this.n.documentSemanticTokensProvider.ordered(this.r);
            if (tokenProviders.length) {
                const provider = tokenProviders[0];
                const tokens = await Promise.resolve(provider.provideDocumentSemanticTokens(this.r, null, this.u.token));
                if (this.I(tokens)) {
                    return { tokens, legend: provider.getLegend() };
                }
            }
            const rangeTokenProviders = this.n.documentRangeSemanticTokensProvider.ordered(this.r);
            if (rangeTokenProviders.length) {
                const provider = rangeTokenProviders[0];
                const lineNumber = position.lineNumber;
                const range = new range_1.$ks(lineNumber, 1, lineNumber, this.r.getLineMaxColumn(lineNumber));
                const tokens = await Promise.resolve(provider.provideDocumentRangeSemanticTokens(this.r, range, this.u.token));
                if (this.I(tokens)) {
                    return { tokens, legend: provider.getLegend() };
                }
            }
            return null;
        }
        L(semanticTokens, pos) {
            const tokenData = semanticTokens.tokens.data;
            const defaultLanguage = this.r.getLanguageId();
            let lastLine = 0;
            let lastCharacter = 0;
            const posLine = pos.lineNumber - 1, posCharacter = pos.column - 1; // to 0-based position
            for (let i = 0; i < tokenData.length; i += 5) {
                const lineDelta = tokenData[i], charDelta = tokenData[i + 1], len = tokenData[i + 2], typeIdx = tokenData[i + 3], modSet = tokenData[i + 4];
                const line = lastLine + lineDelta; // 0-based
                const character = lineDelta === 0 ? lastCharacter + charDelta : charDelta; // 0-based
                if (posLine === line && character <= posCharacter && posCharacter < character + len) {
                    const type = semanticTokens.legend.tokenTypes[typeIdx] || 'not in legend (ignored)';
                    const modifiers = [];
                    let modifierSet = modSet;
                    for (let modifierIndex = 0; modifierSet > 0 && modifierIndex < semanticTokens.legend.tokenModifiers.length; modifierIndex++) {
                        if (modifierSet & 1) {
                            modifiers.push(semanticTokens.legend.tokenModifiers[modifierIndex]);
                        }
                        modifierSet = modifierSet >> 1;
                    }
                    if (modifierSet > 0) {
                        modifiers.push('not in legend (ignored)');
                    }
                    const range = new range_1.$ks(line + 1, character + 1, line + 1, character + 1 + len);
                    const definitions = {};
                    const colorMap = this.g.getColorTheme().tokenColorMap;
                    const theme = this.g.getColorTheme();
                    const tokenStyle = theme.getTokenStyleMetadata(type, modifiers, defaultLanguage, true, definitions);
                    let metadata = undefined;
                    if (tokenStyle) {
                        metadata = {
                            languageId: undefined,
                            tokenType: 0 /* StandardTokenType.Other */,
                            bold: tokenStyle?.bold,
                            italic: tokenStyle?.italic,
                            underline: tokenStyle?.underline,
                            strikethrough: tokenStyle?.strikethrough,
                            foreground: colorMap[tokenStyle?.foreground || 0 /* ColorId.None */],
                            background: undefined
                        };
                    }
                    return { type, modifiers, range, metadata, definitions };
                }
                lastLine = line;
                lastCharacter = character;
            }
            return null;
        }
        M(definition, property) {
            const elements = new Array();
            if (definition === undefined) {
                return elements;
            }
            const theme = this.g.getColorTheme();
            if (Array.isArray(definition)) {
                const scopesDefinition = {};
                theme.resolveScopes(definition, scopesDefinition);
                const matchingRule = scopesDefinition[property];
                if (matchingRule && scopesDefinition.scope) {
                    const scopes = $('ul.tiw-metadata-values');
                    const strScopes = Array.isArray(matchingRule.scope) ? matchingRule.scope : [String(matchingRule.scope)];
                    for (const strScope of strScopes) {
                        scopes.appendChild($('li.tiw-metadata-value.tiw-metadata-scopes', undefined, strScope));
                    }
                    elements.push(scopesDefinition.scope.join(' '), scopes, $('code.tiw-theme-selector', undefined, JSON.stringify(matchingRule.settings, null, '\t')));
                    return elements;
                }
                return elements;
            }
            else if (tokenClassificationRegistry_1.SemanticTokenRule.is(definition)) {
                const scope = theme.getTokenStylingRuleScope(definition);
                if (scope === 'setting') {
                    elements.push(`User settings: ${definition.selector.id} - ${this.N(definition.style, property)}`);
                    return elements;
                }
                else if (scope === 'theme') {
                    elements.push(`Color theme: ${definition.selector.id} - ${this.N(definition.style, property)}`);
                    return elements;
                }
                return elements;
            }
            else {
                const style = theme.resolveTokenStyleValue(definition);
                elements.push(`Default: ${style ? this.N(style, property) : ''}`);
                return elements;
            }
        }
        N(style, property) {
            switch (property) {
                case 'foreground': return style.foreground ? color_1.$Os.Format.CSS.formatHexA(style.foreground, true) : '';
                default: return style[property] !== undefined ? String(style[property]) : '';
            }
        }
        getDomNode() {
            return this.s;
        }
        getPosition() {
            return {
                position: this.c.getPosition(),
                preference: [2 /* ContentWidgetPositionPreference.BELOW */, 1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
    }
    (0, editorExtensions_1.$AV)(InspectEditorTokensController.ID, InspectEditorTokensController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.$xV)(InspectEditorTokens);
});
//# sourceMappingURL=inspectEditorTokens.js.map