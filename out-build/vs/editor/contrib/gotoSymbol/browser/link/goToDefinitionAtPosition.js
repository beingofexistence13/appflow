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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture", "vs/editor/contrib/peekView/browser/peekView", "vs/nls!vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition", "vs/platform/contextkey/common/contextkey", "../goToCommands", "../goToSymbol", "vs/editor/common/services/languageFeatures", "vs/editor/common/model/textModel", "vs/css!./goToDefinitionAtPosition"], function (require, exports, async_1, errors_1, htmlContent_1, lifecycle_1, editorState_1, editorExtensions_1, range_1, language_1, resolverService_1, clickLinkGesture_1, peekView_1, nls, contextkey_1, goToCommands_1, goToSymbol_1, languageFeatures_1, textModel_1) {
    "use strict";
    var $X4_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$X4 = void 0;
    let $X4 = class $X4 {
        static { $X4_1 = this; }
        static { this.ID = 'editor.contrib.gotodefinitionatposition'; }
        static { this.MAX_SOURCE_PREVIEW_LINES = 8; }
        constructor(editor, h, i, j) {
            this.h = h;
            this.i = i;
            this.j = j;
            this.b = new lifecycle_1.$jc();
            this.c = new lifecycle_1.$jc();
            this.f = null;
            this.g = null;
            this.a = editor;
            this.d = this.a.createDecorationsCollection();
            const linkGesture = new clickLinkGesture_1.$v3(editor);
            this.b.add(linkGesture);
            this.b.add(linkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
                this.k(mouseEvent, keyboardEvent ?? undefined);
            }));
            this.b.add(linkGesture.onExecute((mouseEvent) => {
                if (this.r(mouseEvent)) {
                    this.t(mouseEvent.target.position, mouseEvent.hasSideBySideModifier)
                        .catch((error) => {
                        (0, errors_1.$Y)(error);
                    })
                        .finally(() => {
                        this.q();
                    });
                }
            }));
            this.b.add(linkGesture.onCancel(() => {
                this.q();
                this.f = null;
            }));
        }
        static get(editor) {
            return editor.getContribution($X4_1.ID);
        }
        async startFindDefinitionFromCursor(position) {
            // For issue: https://github.com/microsoft/vscode/issues/46257
            // equivalent to mouse move with meta/ctrl key
            // First find the definition and add decorations
            // to the editor to be shown with the content hover widget
            await this.l(position);
            // Add listeners for editor cursor move and key down events
            // Dismiss the "extended" editor decorations when the user hides
            // the hover widget. There is no event for the widget itself so these
            // serve as a best effort. After removing the link decorations, the hover
            // widget is clean and will only show declarations per next request.
            this.c.add(this.a.onDidChangeCursorPosition(() => {
                this.f = null;
                this.q();
                this.c.clear();
            }));
            this.c.add(this.a.onKeyDown((e) => {
                if (e) {
                    this.f = null;
                    this.q();
                    this.c.clear();
                }
            }));
        }
        k(mouseEvent, withKey) {
            // check if we are active and on a content widget
            if (mouseEvent.target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && this.d.length > 0) {
                return;
            }
            if (!this.a.hasModel() || !this.r(mouseEvent, withKey)) {
                this.f = null;
                this.q();
                return;
            }
            const position = mouseEvent.target.position;
            this.l(position);
        }
        async l(position) {
            // Dispose listeners for updating decorations when using keyboard to show definition hover
            this.c.clear();
            // Find word at mouse position
            const word = position ? this.a.getModel()?.getWordAtPosition(position) : null;
            if (!word) {
                this.f = null;
                this.q();
                return;
            }
            // Return early if word at position is still the same
            if (this.f && this.f.startColumn === word.startColumn && this.f.endColumn === word.endColumn && this.f.word === word.word) {
                return;
            }
            this.f = word;
            // Find definition and decorate word if found
            const state = new editorState_1.$s1(this.a, 4 /* CodeEditorStateFlag.Position */ | 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */ | 8 /* CodeEditorStateFlag.Scroll */);
            if (this.g) {
                this.g.cancel();
                this.g = null;
            }
            this.g = (0, async_1.$ug)(token => this.s(position, token));
            let results;
            try {
                results = await this.g;
            }
            catch (error) {
                (0, errors_1.$Y)(error);
                return;
            }
            if (!results || !results.length || !state.validate(this.a)) {
                this.q();
                return;
            }
            const linkRange = results[0].originSelectionRange
                ? range_1.$ks.lift(results[0].originSelectionRange)
                : new range_1.$ks(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
            // Multiple results
            if (results.length > 1) {
                let combinedRange = linkRange;
                for (const { originSelectionRange } of results) {
                    if (originSelectionRange) {
                        combinedRange = range_1.$ks.plusRange(combinedRange, originSelectionRange);
                    }
                }
                this.p(combinedRange, new htmlContent_1.$Xj().appendText(nls.localize(0, null, results.length)));
            }
            else {
                // Single result
                const result = results[0];
                if (!result.uri) {
                    return;
                }
                this.h.createModelReference(result.uri).then(ref => {
                    if (!ref.object || !ref.object.textEditorModel) {
                        ref.dispose();
                        return;
                    }
                    const { object: { textEditorModel } } = ref;
                    const { startLineNumber } = result.range;
                    if (startLineNumber < 1 || startLineNumber > textEditorModel.getLineCount()) {
                        // invalid range
                        ref.dispose();
                        return;
                    }
                    const previewValue = this.m(textEditorModel, startLineNumber, result);
                    const languageId = this.i.guessLanguageIdByFilepathOrFirstLine(textEditorModel.uri);
                    this.p(linkRange, previewValue ? new htmlContent_1.$Xj().appendCodeblock(languageId ? languageId : '', previewValue) : undefined);
                    ref.dispose();
                });
            }
        }
        m(textEditorModel, startLineNumber, result) {
            let rangeToUse = result.range;
            const numberOfLinesInRange = rangeToUse.endLineNumber - rangeToUse.startLineNumber;
            if (numberOfLinesInRange >= $X4_1.MAX_SOURCE_PREVIEW_LINES) {
                rangeToUse = this.o(textEditorModel, startLineNumber);
            }
            const previewValue = this.n(textEditorModel, startLineNumber, rangeToUse);
            return previewValue;
        }
        n(textEditorModel, startLineNumber, previewRange) {
            const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
            let minIndent = startIndent;
            for (let endLineNumber = startLineNumber + 1; endLineNumber < previewRange.endLineNumber; endLineNumber++) {
                const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
                minIndent = Math.min(minIndent, endIndent);
            }
            const previewValue = textEditorModel.getValueInRange(previewRange).replace(new RegExp(`^\\s{${minIndent - 1}}`, 'gm'), '').trim();
            return previewValue;
        }
        o(textEditorModel, startLineNumber) {
            const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
            const maxLineNumber = Math.min(textEditorModel.getLineCount(), startLineNumber + $X4_1.MAX_SOURCE_PREVIEW_LINES);
            let endLineNumber = startLineNumber + 1;
            for (; endLineNumber < maxLineNumber; endLineNumber++) {
                const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
                if (startIndent === endIndent) {
                    break;
                }
            }
            return new range_1.$ks(startLineNumber, 1, endLineNumber + 1, 1);
        }
        p(range, hoverMessage) {
            const newDecorations = {
                range: range,
                options: {
                    description: 'goto-definition-link',
                    inlineClassName: 'goto-definition-link',
                    hoverMessage
                }
            };
            this.d.set([newDecorations]);
        }
        q() {
            this.d.clear();
        }
        r(mouseEvent, withKey) {
            return this.a.hasModel()
                && mouseEvent.isLeftClick
                && mouseEvent.isNoneOrSingleMouseDown
                && mouseEvent.target.type === 6 /* MouseTargetType.CONTENT_TEXT */
                && !(mouseEvent.target.detail.injectedText?.options instanceof textModel_1.$QC)
                && (mouseEvent.hasTriggerModifier || (withKey ? withKey.keyCodeIsTriggerKey : false))
                && this.j.definitionProvider.has(this.a.getModel());
        }
        s(position, token) {
            const model = this.a.getModel();
            if (!model) {
                return Promise.resolve(null);
            }
            return (0, goToSymbol_1.$P4)(this.j.definitionProvider, model, position, token);
        }
        t(position, openToSide) {
            this.a.setPosition(position);
            return this.a.invokeWithinContext((accessor) => {
                const canPeek = !openToSide && this.a.getOption(87 /* EditorOption.definitionLinkOpensInPeek */) && !this.u(accessor);
                const action = new goToCommands_1.$W4({ openToSide, openInPeek: canPeek, muteMessage: true }, { title: { value: '', original: '' }, id: '', precondition: undefined });
                return action.run(accessor);
            });
        }
        u(accessor) {
            const contextKeyService = accessor.get(contextkey_1.$3i);
            return peekView_1.PeekContext.inPeekEditor.getValue(contextKeyService);
        }
        dispose() {
            this.b.dispose();
            this.c.dispose();
        }
    };
    exports.$X4 = $X4;
    exports.$X4 = $X4 = $X4_1 = __decorate([
        __param(1, resolverService_1.$uA),
        __param(2, language_1.$ct),
        __param(3, languageFeatures_1.$hF)
    ], $X4);
    (0, editorExtensions_1.$AV)($X4.ID, $X4, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=goToDefinitionAtPosition.js.map