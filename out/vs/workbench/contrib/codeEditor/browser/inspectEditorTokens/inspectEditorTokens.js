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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/color", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/encodedTokenAttributes", "vs/editor/common/languages/language", "vs/platform/notification/common/notification", "vs/workbench/services/textMate/common/TMHelper", "vs/workbench/services/textMate/browser/textMateTokenizationFeature", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/cancellation", "vs/platform/theme/common/tokenClassificationRegistry", "vs/platform/configuration/common/configuration", "vs/editor/contrib/semanticTokens/common/semanticTokensConfig", "vs/base/common/network", "vs/editor/common/services/languageFeatures", "vs/css!./inspectEditorTokens"], function (require, exports, nls, dom, color_1, lifecycle_1, editorExtensions_1, range_1, encodedTokenAttributes_1, language_1, notification_1, TMHelper_1, textMateTokenizationFeature_1, workbenchThemeService_1, cancellation_1, tokenClassificationRegistry_1, configuration_1, semanticTokensConfig_1, network_1, languageFeatures_1) {
    "use strict";
    var InspectEditorTokensController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const $ = dom.$;
    let InspectEditorTokensController = class InspectEditorTokensController extends lifecycle_1.Disposable {
        static { InspectEditorTokensController_1 = this; }
        static { this.ID = 'editor.contrib.inspectEditorTokens'; }
        static get(editor) {
            return editor.getContribution(InspectEditorTokensController_1.ID);
        }
        constructor(editor, textMateService, languageService, themeService, notificationService, configurationService, languageFeaturesService) {
            super();
            this._editor = editor;
            this._textMateService = textMateService;
            this._themeService = themeService;
            this._languageService = languageService;
            this._notificationService = notificationService;
            this._configurationService = configurationService;
            this._languageFeaturesService = languageFeaturesService;
            this._widget = null;
            this._register(this._editor.onDidChangeModel((e) => this.stop()));
            this._register(this._editor.onDidChangeModelLanguage((e) => this.stop()));
            this._register(this._editor.onKeyUp((e) => e.keyCode === 9 /* KeyCode.Escape */ && this.stop()));
        }
        dispose() {
            this.stop();
            super.dispose();
        }
        launch() {
            if (this._widget) {
                return;
            }
            if (!this._editor.hasModel()) {
                return;
            }
            if (this._editor.getModel().uri.scheme === network_1.Schemas.vscodeNotebookCell) {
                // disable in notebooks
                return;
            }
            this._widget = new InspectEditorTokensWidget(this._editor, this._textMateService, this._languageService, this._themeService, this._notificationService, this._configurationService, this._languageFeaturesService);
        }
        stop() {
            if (this._widget) {
                this._widget.dispose();
                this._widget = null;
            }
        }
        toggle() {
            if (!this._widget) {
                this.launch();
            }
            else {
                this.stop();
            }
        }
    };
    InspectEditorTokensController = InspectEditorTokensController_1 = __decorate([
        __param(1, textMateTokenizationFeature_1.ITextMateTokenizationService),
        __param(2, language_1.ILanguageService),
        __param(3, workbenchThemeService_1.IWorkbenchThemeService),
        __param(4, notification_1.INotificationService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, languageFeatures_1.ILanguageFeaturesService)
    ], InspectEditorTokensController);
    class InspectEditorTokens extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.inspectTMScopes',
                label: nls.localize('inspectEditorTokens', "Developer: Inspect Editor Tokens and Scopes"),
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
    class InspectEditorTokensWidget extends lifecycle_1.Disposable {
        static { this._ID = 'editor.contrib.inspectEditorTokensWidget'; }
        constructor(editor, textMateService, languageService, themeService, notificationService, configurationService, languageFeaturesService) {
            super();
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this._isDisposed = false;
            this._editor = editor;
            this._languageService = languageService;
            this._themeService = themeService;
            this._textMateService = textMateService;
            this._notificationService = notificationService;
            this._configurationService = configurationService;
            this._languageFeaturesService = languageFeaturesService;
            this._model = this._editor.getModel();
            this._domNode = document.createElement('div');
            this._domNode.className = 'token-inspect-widget';
            this._currentRequestCancellationTokenSource = new cancellation_1.CancellationTokenSource();
            this._beginCompute(this._editor.getPosition());
            this._register(this._editor.onDidChangeCursorPosition((e) => this._beginCompute(this._editor.getPosition())));
            this._register(themeService.onDidColorThemeChange(_ => this._beginCompute(this._editor.getPosition())));
            this._register(configurationService.onDidChangeConfiguration(e => e.affectsConfiguration('editor.semanticHighlighting.enabled') && this._beginCompute(this._editor.getPosition())));
            this._editor.addContentWidget(this);
        }
        dispose() {
            this._isDisposed = true;
            this._editor.removeContentWidget(this);
            this._currentRequestCancellationTokenSource.cancel();
            super.dispose();
        }
        getId() {
            return InspectEditorTokensWidget._ID;
        }
        _beginCompute(position) {
            const grammar = this._textMateService.createTokenizer(this._model.getLanguageId());
            const semanticTokens = this._computeSemanticTokens(position);
            dom.clearNode(this._domNode);
            this._domNode.appendChild(document.createTextNode(nls.localize('inspectTMScopesWidget.loading', "Loading...")));
            Promise.all([grammar, semanticTokens]).then(([grammar, semanticTokens]) => {
                if (this._isDisposed) {
                    return;
                }
                this._compute(grammar, semanticTokens, position);
                this._domNode.style.maxWidth = `${Math.max(this._editor.getLayoutInfo().width * 0.66, 500)}px`;
                this._editor.layoutContentWidget(this);
            }, (err) => {
                this._notificationService.warn(err);
                setTimeout(() => {
                    InspectEditorTokensController.get(this._editor)?.stop();
                });
            });
        }
        _isSemanticColoringEnabled() {
            const setting = this._configurationService.getValue(semanticTokensConfig_1.SEMANTIC_HIGHLIGHTING_SETTING_ID, { overrideIdentifier: this._model.getLanguageId(), resource: this._model.uri })?.enabled;
            if (typeof setting === 'boolean') {
                return setting;
            }
            return this._themeService.getColorTheme().semanticHighlighting;
        }
        _compute(grammar, semanticTokens, position) {
            const textMateTokenInfo = grammar && this._getTokensAtPosition(grammar, position);
            const semanticTokenInfo = semanticTokens && this._getSemanticTokenAtPosition(semanticTokens, position);
            if (!textMateTokenInfo && !semanticTokenInfo) {
                dom.reset(this._domNode, 'No grammar or semantic tokens available.');
                return;
            }
            const tmMetadata = textMateTokenInfo?.metadata;
            const semMetadata = semanticTokenInfo?.metadata;
            const semTokenText = semanticTokenInfo && renderTokenText(this._model.getValueInRange(semanticTokenInfo.range));
            const tmTokenText = textMateTokenInfo && renderTokenText(this._model.getLineContent(position.lineNumber).substring(textMateTokenInfo.token.startIndex, textMateTokenInfo.token.endIndex));
            const tokenText = semTokenText || tmTokenText || '';
            dom.reset(this._domNode, $('h2.tiw-token', undefined, tokenText, $('span.tiw-token-length', undefined, `${tokenText.length} ${tokenText.length === 1 ? 'char' : 'chars'}`)));
            dom.append(this._domNode, $('hr.tiw-metadata-separator', { 'style': 'clear:both' }));
            dom.append(this._domNode, $('table.tiw-metadata-table', undefined, $('tbody', undefined, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'language'), $('td.tiw-metadata-value', undefined, tmMetadata?.languageId || '')), $('tr', undefined, $('td.tiw-metadata-key', undefined, 'standard token type'), $('td.tiw-metadata-value', undefined, this._tokenTypeToString(tmMetadata?.tokenType || 0 /* StandardTokenType.Other */))), ...this._formatMetadata(semMetadata, tmMetadata))));
            if (semanticTokenInfo) {
                dom.append(this._domNode, $('hr.tiw-metadata-separator'));
                const table = dom.append(this._domNode, $('table.tiw-metadata-table', undefined));
                const tbody = dom.append(table, $('tbody', undefined, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'semantic token type'), $('td.tiw-metadata-value', undefined, semanticTokenInfo.type))));
                if (semanticTokenInfo.modifiers.length) {
                    dom.append(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'modifiers'), $('td.tiw-metadata-value', undefined, semanticTokenInfo.modifiers.join(' '))));
                }
                if (semanticTokenInfo.metadata) {
                    const properties = ['foreground', 'bold', 'italic', 'underline', 'strikethrough'];
                    const propertiesByDefValue = {};
                    const allDefValues = new Array(); // remember the order
                    // first collect to detect when the same rule is used for multiple properties
                    for (const property of properties) {
                        if (semanticTokenInfo.metadata[property] !== undefined) {
                            const definition = semanticTokenInfo.definitions[property];
                            const defValue = this._renderTokenStyleDefinition(definition, property);
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
                        dom.append(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, propertiesByDefValue[defValueStr].join(', ')), $('td.tiw-metadata-value', undefined, ...defValue)));
                    }
                }
            }
            if (textMateTokenInfo) {
                const theme = this._themeService.getColorTheme();
                dom.append(this._domNode, $('hr.tiw-metadata-separator'));
                const table = dom.append(this._domNode, $('table.tiw-metadata-table'));
                const tbody = dom.append(table, $('tbody'));
                if (tmTokenText && tmTokenText !== tokenText) {
                    dom.append(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'textmate token'), $('td.tiw-metadata-value', undefined, `${tmTokenText} (${tmTokenText.length})`)));
                }
                const scopes = new Array();
                for (let i = textMateTokenInfo.token.scopes.length - 1; i >= 0; i--) {
                    scopes.push(textMateTokenInfo.token.scopes[i]);
                    if (i > 0) {
                        scopes.push($('br'));
                    }
                }
                dom.append(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'textmate scopes'), $('td.tiw-metadata-value.tiw-metadata-scopes', undefined, ...scopes)));
                const matchingRule = (0, TMHelper_1.findMatchingThemeRule)(theme, textMateTokenInfo.token.scopes, false);
                const semForeground = semanticTokenInfo?.metadata?.foreground;
                if (matchingRule) {
                    if (semForeground !== textMateTokenInfo.metadata.foreground) {
                        let defValue = $('code.tiw-theme-selector', undefined, matchingRule.rawSelector, $('br'), JSON.stringify(matchingRule.settings, null, '\t'));
                        if (semForeground) {
                            defValue = $('s', undefined, defValue);
                        }
                        dom.append(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'foreground'), $('td.tiw-metadata-value', undefined, defValue)));
                    }
                }
                else if (!semForeground) {
                    dom.append(tbody, $('tr', undefined, $('td.tiw-metadata-key', undefined, 'foreground'), $('td.tiw-metadata-value', undefined, 'No theme selector')));
                }
            }
        }
        _formatMetadata(semantic, tm) {
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
                const backgroundColor = color_1.Color.fromHex(background), foregroundColor = color_1.Color.fromHex(foreground);
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
        _decodeMetadata(metadata) {
            const colorMap = this._themeService.getColorTheme().tokenColorMap;
            const languageId = encodedTokenAttributes_1.TokenMetadata.getLanguageId(metadata);
            const tokenType = encodedTokenAttributes_1.TokenMetadata.getTokenType(metadata);
            const fontStyle = encodedTokenAttributes_1.TokenMetadata.getFontStyle(metadata);
            const foreground = encodedTokenAttributes_1.TokenMetadata.getForeground(metadata);
            const background = encodedTokenAttributes_1.TokenMetadata.getBackground(metadata);
            return {
                languageId: this._languageService.languageIdCodec.decodeLanguageId(languageId),
                tokenType: tokenType,
                bold: (fontStyle & 2 /* FontStyle.Bold */) ? true : undefined,
                italic: (fontStyle & 1 /* FontStyle.Italic */) ? true : undefined,
                underline: (fontStyle & 4 /* FontStyle.Underline */) ? true : undefined,
                strikethrough: (fontStyle & 8 /* FontStyle.Strikethrough */) ? true : undefined,
                foreground: colorMap[foreground],
                background: colorMap[background]
            };
        }
        _tokenTypeToString(tokenType) {
            switch (tokenType) {
                case 0 /* StandardTokenType.Other */: return 'Other';
                case 1 /* StandardTokenType.Comment */: return 'Comment';
                case 2 /* StandardTokenType.String */: return 'String';
                case 3 /* StandardTokenType.RegEx */: return 'RegEx';
                default: return '??';
            }
        }
        _getTokensAtPosition(grammar, position) {
            const lineNumber = position.lineNumber;
            const stateBeforeLine = this._getStateBeforeLine(grammar, lineNumber);
            const tokenizationResult1 = grammar.tokenizeLine(this._model.getLineContent(lineNumber), stateBeforeLine);
            const tokenizationResult2 = grammar.tokenizeLine2(this._model.getLineContent(lineNumber), stateBeforeLine);
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
                metadata: this._decodeMetadata(tokenizationResult2.tokens[(token2Index << 1) + 1])
            };
        }
        _getStateBeforeLine(grammar, lineNumber) {
            let state = null;
            for (let i = 1; i < lineNumber; i++) {
                const tokenizationResult = grammar.tokenizeLine(this._model.getLineContent(i), state);
                state = tokenizationResult.ruleStack;
            }
            return state;
        }
        isSemanticTokens(token) {
            return token && token.data;
        }
        async _computeSemanticTokens(position) {
            if (!this._isSemanticColoringEnabled()) {
                return null;
            }
            const tokenProviders = this._languageFeaturesService.documentSemanticTokensProvider.ordered(this._model);
            if (tokenProviders.length) {
                const provider = tokenProviders[0];
                const tokens = await Promise.resolve(provider.provideDocumentSemanticTokens(this._model, null, this._currentRequestCancellationTokenSource.token));
                if (this.isSemanticTokens(tokens)) {
                    return { tokens, legend: provider.getLegend() };
                }
            }
            const rangeTokenProviders = this._languageFeaturesService.documentRangeSemanticTokensProvider.ordered(this._model);
            if (rangeTokenProviders.length) {
                const provider = rangeTokenProviders[0];
                const lineNumber = position.lineNumber;
                const range = new range_1.Range(lineNumber, 1, lineNumber, this._model.getLineMaxColumn(lineNumber));
                const tokens = await Promise.resolve(provider.provideDocumentRangeSemanticTokens(this._model, range, this._currentRequestCancellationTokenSource.token));
                if (this.isSemanticTokens(tokens)) {
                    return { tokens, legend: provider.getLegend() };
                }
            }
            return null;
        }
        _getSemanticTokenAtPosition(semanticTokens, pos) {
            const tokenData = semanticTokens.tokens.data;
            const defaultLanguage = this._model.getLanguageId();
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
                    const range = new range_1.Range(line + 1, character + 1, line + 1, character + 1 + len);
                    const definitions = {};
                    const colorMap = this._themeService.getColorTheme().tokenColorMap;
                    const theme = this._themeService.getColorTheme();
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
        _renderTokenStyleDefinition(definition, property) {
            const elements = new Array();
            if (definition === undefined) {
                return elements;
            }
            const theme = this._themeService.getColorTheme();
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
                    elements.push(`User settings: ${definition.selector.id} - ${this._renderStyleProperty(definition.style, property)}`);
                    return elements;
                }
                else if (scope === 'theme') {
                    elements.push(`Color theme: ${definition.selector.id} - ${this._renderStyleProperty(definition.style, property)}`);
                    return elements;
                }
                return elements;
            }
            else {
                const style = theme.resolveTokenStyleValue(definition);
                elements.push(`Default: ${style ? this._renderStyleProperty(style, property) : ''}`);
                return elements;
            }
        }
        _renderStyleProperty(style, property) {
            switch (property) {
                case 'foreground': return style.foreground ? color_1.Color.Format.CSS.formatHexA(style.foreground, true) : '';
                default: return style[property] !== undefined ? String(style[property]) : '';
            }
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return {
                position: this._editor.getPosition(),
                preference: [2 /* ContentWidgetPositionPreference.BELOW */, 1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(InspectEditorTokensController.ID, InspectEditorTokensController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.registerEditorAction)(InspectEditorTokens);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zcGVjdEVkaXRvclRva2Vucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9pbnNwZWN0RWRpdG9yVG9rZW5zL2luc3BlY3RFZGl0b3JUb2tlbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBK0JoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQThCLFNBQVEsc0JBQVU7O2lCQUU5QixPQUFFLEdBQUcsb0NBQW9DLEFBQXZDLENBQXdDO1FBRTFELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDcEMsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUFnQywrQkFBNkIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRyxDQUFDO1FBV0QsWUFDQyxNQUFtQixFQUNXLGVBQTZDLEVBQ3pELGVBQWlDLEVBQzNCLFlBQW9DLEVBQ3RDLG1CQUF5QyxFQUN4QyxvQkFBMkMsRUFDeEMsdUJBQWlEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztZQUN4QyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztZQUNsQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztZQUNoRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7WUFDbEQsSUFBSSxDQUFDLHdCQUF3QixHQUFHLHVCQUF1QixDQUFDO1lBQ3hELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBRXBCLElBQUksQ0FBQyxTQUFT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