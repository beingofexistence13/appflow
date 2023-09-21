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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture", "vs/editor/contrib/peekView/browser/peekView", "vs/nls", "vs/platform/contextkey/common/contextkey", "../goToCommands", "../goToSymbol", "vs/editor/common/services/languageFeatures", "vs/editor/common/model/textModel", "vs/css!./goToDefinitionAtPosition"], function (require, exports, async_1, errors_1, htmlContent_1, lifecycle_1, editorState_1, editorExtensions_1, range_1, language_1, resolverService_1, clickLinkGesture_1, peekView_1, nls, contextkey_1, goToCommands_1, goToSymbol_1, languageFeatures_1, textModel_1) {
    "use strict";
    var GotoDefinitionAtPositionEditorContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GotoDefinitionAtPositionEditorContribution = void 0;
    let GotoDefinitionAtPositionEditorContribution = class GotoDefinitionAtPositionEditorContribution {
        static { GotoDefinitionAtPositionEditorContribution_1 = this; }
        static { this.ID = 'editor.contrib.gotodefinitionatposition'; }
        static { this.MAX_SOURCE_PREVIEW_LINES = 8; }
        constructor(editor, textModelResolverService, languageService, languageFeaturesService) {
            this.textModelResolverService = textModelResolverService;
            this.languageService = languageService;
            this.languageFeaturesService = languageFeaturesService;
            this.toUnhook = new lifecycle_1.DisposableStore();
            this.toUnhookForKeyboard = new lifecycle_1.DisposableStore();
            this.currentWordAtPosition = null;
            this.previousPromise = null;
            this.editor = editor;
            this.linkDecorations = this.editor.createDecorationsCollection();
            const linkGesture = new clickLinkGesture_1.ClickLinkGesture(editor);
            this.toUnhook.add(linkGesture);
            this.toUnhook.add(linkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
                this.startFindDefinitionFromMouse(mouseEvent, keyboardEvent ?? undefined);
            }));
            this.toUnhook.add(linkGesture.onExecute((mouseEvent) => {
                if (this.isEnabled(mouseEvent)) {
                    this.gotoDefinition(mouseEvent.target.position, mouseEvent.hasSideBySideModifier)
                        .catch((error) => {
                        (0, errors_1.onUnexpectedError)(error);
                    })
                        .finally(() => {
                        this.removeLinkDecorations();
                    });
                }
            }));
            this.toUnhook.add(linkGesture.onCancel(() => {
                this.removeLinkDecorations();
                this.currentWordAtPosition = null;
            }));
        }
        static get(editor) {
            return editor.getContribution(GotoDefinitionAtPositionEditorContribution_1.ID);
        }
        async startFindDefinitionFromCursor(position) {
            // For issue: https://github.com/microsoft/vscode/issues/46257
            // equivalent to mouse move with meta/ctrl key
            // First find the definition and add decorations
            // to the editor to be shown with the content hover widget
            await this.startFindDefinition(position);
            // Add listeners for editor cursor move and key down events
            // Dismiss the "extended" editor decorations when the user hides
            // the hover widget. There is no event for the widget itself so these
            // serve as a best effort. After removing the link decorations, the hover
            // widget is clean and will only show declarations per next request.
            this.toUnhookForKeyboard.add(this.editor.onDidChangeCursorPosition(() => {
                this.currentWordAtPosition = null;
                this.removeLinkDecorations();
                this.toUnhookForKeyboard.clear();
            }));
            this.toUnhookForKeyboard.add(this.editor.onKeyDown((e) => {
                if (e) {
                    this.currentWordAtPosition = null;
                    this.removeLinkDecorations();
                    this.toUnhookForKeyboard.clear();
                }
            }));
        }
        startFindDefinitionFromMouse(mouseEvent, withKey) {
            // check if we are active and on a content widget
            if (mouseEvent.target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && this.linkDecorations.length > 0) {
                return;
            }
            if (!this.editor.hasModel() || !this.isEnabled(mouseEvent, withKey)) {
                this.currentWordAtPosition = null;
                this.removeLinkDecorations();
                return;
            }
            const position = mouseEvent.target.position;
            this.startFindDefinition(position);
        }
        async startFindDefinition(position) {
            // Dispose listeners for updating decorations when using keyboard to show definition hover
            this.toUnhookForKeyboard.clear();
            // Find word at mouse position
            const word = position ? this.editor.getModel()?.getWordAtPosition(position) : null;
            if (!word) {
                this.currentWordAtPosition = null;
                this.removeLinkDecorations();
                return;
            }
            // Return early if word at position is still the same
            if (this.currentWordAtPosition && this.currentWordAtPosition.startColumn === word.startColumn && this.currentWordAtPosition.endColumn === word.endColumn && this.currentWordAtPosition.word === word.word) {
                return;
            }
            this.currentWordAtPosition = word;
            // Find definition and decorate word if found
            const state = new editorState_1.EditorState(this.editor, 4 /* CodeEditorStateFlag.Position */ | 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */ | 8 /* CodeEditorStateFlag.Scroll */);
            if (this.previousPromise) {
                this.previousPromise.cancel();
                this.previousPromise = null;
            }
            this.previousPromise = (0, async_1.createCancelablePromise)(token => this.findDefinition(position, token));
            let results;
            try {
                results = await this.previousPromise;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                return;
            }
            if (!results || !results.length || !state.validate(this.editor)) {
                this.removeLinkDecorations();
                return;
            }
            const linkRange = results[0].originSelectionRange
                ? range_1.Range.lift(results[0].originSelectionRange)
                : new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
            // Multiple results
            if (results.length > 1) {
                let combinedRange = linkRange;
                for (const { originSelectionRange } of results) {
                    if (originSelectionRange) {
                        combinedRange = range_1.Range.plusRange(combinedRange, originSelectionRange);
                    }
                }
                this.addDecoration(combinedRange, new htmlContent_1.MarkdownString().appendText(nls.localize('multipleResults', "Click to show {0} definitions.", results.length)));
            }
            else {
                // Single result
                const result = results[0];
                if (!result.uri) {
                    return;
                }
                this.textModelResolverService.createModelReference(result.uri).then(ref => {
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
                    const previewValue = this.getPreviewValue(textEditorModel, startLineNumber, result);
                    const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(textEditorModel.uri);
                    this.addDecoration(linkRange, previewValue ? new htmlContent_1.MarkdownString().appendCodeblock(languageId ? languageId : '', previewValue) : undefined);
                    ref.dispose();
                });
            }
        }
        getPreviewValue(textEditorModel, startLineNumber, result) {
            let rangeToUse = result.range;
            const numberOfLinesInRange = rangeToUse.endLineNumber - rangeToUse.startLineNumber;
            if (numberOfLinesInRange >= GotoDefinitionAtPositionEditorContribution_1.MAX_SOURCE_PREVIEW_LINES) {
                rangeToUse = this.getPreviewRangeBasedOnIndentation(textEditorModel, startLineNumber);
            }
            const previewValue = this.stripIndentationFromPreviewRange(textEditorModel, startLineNumber, rangeToUse);
            return previewValue;
        }
        stripIndentationFromPreviewRange(textEditorModel, startLineNumber, previewRange) {
            const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
            let minIndent = startIndent;
            for (let endLineNumber = startLineNumber + 1; endLineNumber < previewRange.endLineNumber; endLineNumber++) {
                const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
                minIndent = Math.min(minIndent, endIndent);
            }
            const previewValue = textEditorModel.getValueInRange(previewRange).replace(new RegExp(`^\\s{${minIndent - 1}}`, 'gm'), '').trim();
            return previewValue;
        }
        getPreviewRangeBasedOnIndentation(textEditorModel, startLineNumber) {
            const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
            const maxLineNumber = Math.min(textEditorModel.getLineCount(), startLineNumber + GotoDefinitionAtPositionEditorContribution_1.MAX_SOURCE_PREVIEW_LINES);
            let endLineNumber = startLineNumber + 1;
            for (; endLineNumber < maxLineNumber; endLineNumber++) {
                const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
                if (startIndent === endIndent) {
                    break;
                }
            }
            return new range_1.Range(startLineNumber, 1, endLineNumber + 1, 1);
        }
        addDecoration(range, hoverMessage) {
            const newDecorations = {
                range: range,
                options: {
                    description: 'goto-definition-link',
                    inlineClassName: 'goto-definition-link',
                    hoverMessage
                }
            };
            this.linkDecorations.set([newDecorations]);
        }
        removeLinkDecorations() {
            this.linkDecorations.clear();
        }
        isEnabled(mouseEvent, withKey) {
            return this.editor.hasModel()
                && mouseEvent.isLeftClick
                && mouseEvent.isNoneOrSingleMouseDown
                && mouseEvent.target.type === 6 /* MouseTargetType.CONTENT_TEXT */
                && !(mouseEvent.target.detail.injectedText?.options instanceof textModel_1.ModelDecorationInjectedTextOptions)
                && (mouseEvent.hasTriggerModifier || (withKey ? withKey.keyCodeIsTriggerKey : false))
                && this.languageFeaturesService.definitionProvider.has(this.editor.getModel());
        }
        findDefinition(position, token) {
            const model = this.editor.getModel();
            if (!model) {
                return Promise.resolve(null);
            }
            return (0, goToSymbol_1.getDefinitionsAtPosition)(this.languageFeaturesService.definitionProvider, model, position, token);
        }
        gotoDefinition(position, openToSide) {
            this.editor.setPosition(position);
            return this.editor.invokeWithinContext((accessor) => {
                const canPeek = !openToSide && this.editor.getOption(87 /* EditorOption.definitionLinkOpensInPeek */) && !this.isInPeekEditor(accessor);
                const action = new goToCommands_1.DefinitionAction({ openToSide, openInPeek: canPeek, muteMessage: true }, { title: { value: '', original: '' }, id: '', precondition: undefined });
                return action.run(accessor);
            });
        }
        isInPeekEditor(accessor) {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            return peekView_1.PeekContext.inPeekEditor.getValue(contextKeyService);
        }
        dispose() {
            this.toUnhook.dispose();
            this.toUnhookForKeyboard.dispose();
        }
    };
    exports.GotoDefinitionAtPositionEditorContribution = GotoDefinitionAtPositionEditorContribution;
    exports.GotoDefinitionAtPositionEditorContribution = GotoDefinitionAtPositionEditorContribution = GotoDefinitionAtPositionEditorContribution_1 = __decorate([
        __param(1, resolverService_1.ITextModelService),
        __param(2, language_1.ILanguageService),
        __param(3, languageFeatures_1.ILanguageFeaturesService)
    ], GotoDefinitionAtPositionEditorContribution);
    (0, editorExtensions_1.registerEditorContribution)(GotoDefinitionAtPositionEditorContribution.ID, GotoDefinitionAtPositionEditorContribution, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29Ub0RlZmluaXRpb25BdFBvc2l0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZ290b1N5bWJvbC9icm93c2VyL2xpbmsvZ29Ub0RlZmluaXRpb25BdFBvc2l0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErQnpGLElBQU0sMENBQTBDLEdBQWhELE1BQU0sMENBQTBDOztpQkFFL0IsT0FBRSxHQUFHLHlDQUF5QyxBQUE1QyxDQUE2QztpQkFDdEQsNkJBQXdCLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFTN0MsWUFDQyxNQUFtQixFQUNBLHdCQUE0RCxFQUM3RCxlQUFrRCxFQUMxQyx1QkFBa0U7WUFGeEQsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUFtQjtZQUM1QyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDekIsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQVY1RSxhQUFRLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDakMsd0JBQW1CLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFckQsMEJBQXFCLEdBQTJCLElBQUksQ0FBQztZQUNyRCxvQkFBZSxHQUFvRCxJQUFJLENBQUM7WUFRL0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFFakUsTUFBTSxXQUFXLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUUvQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxh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