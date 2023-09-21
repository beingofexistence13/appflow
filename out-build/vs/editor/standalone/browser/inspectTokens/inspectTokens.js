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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/color", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/languages", "vs/editor/common/encodedTokenAttributes", "vs/editor/common/languages/nullTokenize", "vs/editor/common/languages/language", "vs/editor/standalone/common/standaloneTheme", "vs/editor/common/standaloneStrings", "vs/css!./inspectTokens"], function (require, exports, dom_1, color_1, lifecycle_1, editorExtensions_1, languages_1, encodedTokenAttributes_1, nullTokenize_1, language_1, standaloneTheme_1, standaloneStrings_1) {
    "use strict";
    var InspectTokensController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let InspectTokensController = class InspectTokensController extends lifecycle_1.$kc {
        static { InspectTokensController_1 = this; }
        static { this.ID = 'editor.contrib.inspectTokens'; }
        static get(editor) {
            return editor.getContribution(InspectTokensController_1.ID);
        }
        constructor(editor, standaloneColorService, languageService) {
            super();
            this.a = editor;
            this.b = languageService;
            this.c = null;
            this.B(this.a.onDidChangeModel((e) => this.stop()));
            this.B(this.a.onDidChangeModelLanguage((e) => this.stop()));
            this.B(languages_1.$bt.onDidChange((e) => this.stop()));
            this.B(this.a.onKeyUp((e) => e.keyCode === 9 /* KeyCode.Escape */ && this.stop()));
        }
        dispose() {
            this.stop();
            super.dispose();
        }
        launch() {
            if (this.c) {
                return;
            }
            if (!this.a.hasModel()) {
                return;
            }
            this.c = new InspectTokensWidget(this.a, this.b);
        }
        stop() {
            if (this.c) {
                this.c.dispose();
                this.c = null;
            }
        }
    };
    InspectTokensController = InspectTokensController_1 = __decorate([
        __param(1, standaloneTheme_1.$D8b),
        __param(2, language_1.$ct)
    ], InspectTokensController);
    class InspectTokens extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.inspectTokens',
                label: standaloneStrings_1.InspectTokensNLS.inspectTokensAction,
                alias: 'Developer: Inspect Tokens',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const controller = InspectTokensController.get(editor);
            controller?.launch();
        }
    }
    function renderTokenText(tokenText) {
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
    function getSafeTokenizationSupport(languageIdCodec, languageId) {
        const tokenizationSupport = languages_1.$bt.get(languageId);
        if (tokenizationSupport) {
            return tokenizationSupport;
        }
        const encodedLanguageId = languageIdCodec.encodeLanguageId(languageId);
        return {
            getInitialState: () => nullTokenize_1.$uC,
            tokenize: (line, hasEOL, state) => (0, nullTokenize_1.$vC)(languageId, state),
            tokenizeEncoded: (line, hasEOL, state) => (0, nullTokenize_1.$wC)(encodedLanguageId, state)
        };
    }
    class InspectTokensWidget extends lifecycle_1.$kc {
        static { this.a = 'editor.contrib.inspectTokensWidget'; }
        constructor(editor, languageService) {
            super();
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.b = editor;
            this.c = languageService;
            this.g = this.b.getModel();
            this.h = document.createElement('div');
            this.h.className = 'tokens-inspect-widget';
            this.f = getSafeTokenizationSupport(this.c.languageIdCodec, this.g.getLanguageId());
            this.j(this.b.getPosition());
            this.B(this.b.onDidChangeCursorPosition((e) => this.j(this.b.getPosition())));
            this.b.addContentWidget(this);
        }
        dispose() {
            this.b.removeContentWidget(this);
            super.dispose();
        }
        getId() {
            return InspectTokensWidget.a;
        }
        j(position) {
            const data = this.u(position.lineNumber);
            let token1Index = 0;
            for (let i = data.tokens1.length - 1; i >= 0; i--) {
                const t = data.tokens1[i];
                if (position.column - 1 >= t.offset) {
                    token1Index = i;
                    break;
                }
            }
            let token2Index = 0;
            for (let i = (data.tokens2.length >>> 1); i >= 0; i--) {
                if (position.column - 1 >= data.tokens2[(i << 1)]) {
                    token2Index = i;
                    break;
                }
            }
            const lineContent = this.g.getLineContent(position.lineNumber);
            let tokenText = '';
            if (token1Index < data.tokens1.length) {
                const tokenStartIndex = data.tokens1[token1Index].offset;
                const tokenEndIndex = token1Index + 1 < data.tokens1.length ? data.tokens1[token1Index + 1].offset : lineContent.length;
                tokenText = lineContent.substring(tokenStartIndex, tokenEndIndex);
            }
            (0, dom_1.$_O)(this.h, (0, dom_1.$)('h2.tm-token', undefined, renderTokenText(tokenText), (0, dom_1.$)('span.tm-token-length', undefined, `${tokenText.length} ${tokenText.length === 1 ? 'char' : 'chars'}`)));
            (0, dom_1.$0O)(this.h, (0, dom_1.$)('hr.tokens-inspect-separator', { 'style': 'clear:both' }));
            const metadata = (token2Index << 1) + 1 < data.tokens2.length ? this.m(data.tokens2[(token2Index << 1) + 1]) : null;
            (0, dom_1.$0O)(this.h, (0, dom_1.$)('table.tm-metadata-table', undefined, (0, dom_1.$)('tbody', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td.tm-metadata-key', undefined, 'language'), (0, dom_1.$)('td.tm-metadata-value', undefined, `${metadata ? metadata.languageId : '-?-'}`)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td.tm-metadata-key', undefined, 'token type'), (0, dom_1.$)('td.tm-metadata-value', undefined, `${metadata ? this.n(metadata.tokenType) : '-?-'}`)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td.tm-metadata-key', undefined, 'font style'), (0, dom_1.$)('td.tm-metadata-value', undefined, `${metadata ? this.s(metadata.fontStyle) : '-?-'}`)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td.tm-metadata-key', undefined, 'foreground'), (0, dom_1.$)('td.tm-metadata-value', undefined, `${metadata ? color_1.$Os.Format.CSS.formatHex(metadata.foreground) : '-?-'}`)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td.tm-metadata-key', undefined, 'background'), (0, dom_1.$)('td.tm-metadata-value', undefined, `${metadata ? color_1.$Os.Format.CSS.formatHex(metadata.background) : '-?-'}`)))));
            (0, dom_1.$0O)(this.h, (0, dom_1.$)('hr.tokens-inspect-separator'));
            if (token1Index < data.tokens1.length) {
                (0, dom_1.$0O)(this.h, (0, dom_1.$)('span.tm-token-type', undefined, data.tokens1[token1Index].type));
            }
            this.b.layoutContentWidget(this);
        }
        m(metadata) {
            const colorMap = languages_1.$bt.getColorMap();
            const languageId = encodedTokenAttributes_1.$Us.getLanguageId(metadata);
            const tokenType = encodedTokenAttributes_1.$Us.getTokenType(metadata);
            const fontStyle = encodedTokenAttributes_1.$Us.getFontStyle(metadata);
            const foreground = encodedTokenAttributes_1.$Us.getForeground(metadata);
            const background = encodedTokenAttributes_1.$Us.getBackground(metadata);
            return {
                languageId: this.c.languageIdCodec.decodeLanguageId(languageId),
                tokenType: tokenType,
                fontStyle: fontStyle,
                foreground: colorMap[foreground],
                background: colorMap[background]
            };
        }
        n(tokenType) {
            switch (tokenType) {
                case 0 /* StandardTokenType.Other */: return 'Other';
                case 1 /* StandardTokenType.Comment */: return 'Comment';
                case 2 /* StandardTokenType.String */: return 'String';
                case 3 /* StandardTokenType.RegEx */: return 'RegEx';
                default: return '??';
            }
        }
        s(fontStyle) {
            let r = '';
            if (fontStyle & 1 /* FontStyle.Italic */) {
                r += 'italic ';
            }
            if (fontStyle & 2 /* FontStyle.Bold */) {
                r += 'bold ';
            }
            if (fontStyle & 4 /* FontStyle.Underline */) {
                r += 'underline ';
            }
            if (fontStyle & 8 /* FontStyle.Strikethrough */) {
                r += 'strikethrough ';
            }
            if (r.length === 0) {
                r = '---';
            }
            return r;
        }
        u(lineNumber) {
            const stateBeforeLine = this.w(lineNumber);
            const tokenizationResult1 = this.f.tokenize(this.g.getLineContent(lineNumber), true, stateBeforeLine);
            const tokenizationResult2 = this.f.tokenizeEncoded(this.g.getLineContent(lineNumber), true, stateBeforeLine);
            return {
                startState: stateBeforeLine,
                tokens1: tokenizationResult1.tokens,
                tokens2: tokenizationResult2.tokens,
                endState: tokenizationResult1.endState
            };
        }
        w(lineNumber) {
            let state = this.f.getInitialState();
            for (let i = 1; i < lineNumber; i++) {
                const tokenizationResult = this.f.tokenize(this.g.getLineContent(i), true, state);
                state = tokenizationResult.endState;
            }
            return state;
        }
        getDomNode() {
            return this.h;
        }
        getPosition() {
            return {
                position: this.b.getPosition(),
                preference: [2 /* ContentWidgetPositionPreference.BELOW */, 1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
    }
    (0, editorExtensions_1.$AV)(InspectTokensController.ID, InspectTokensController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.$xV)(InspectTokens);
});
//# sourceMappingURL=inspectTokens.js.map