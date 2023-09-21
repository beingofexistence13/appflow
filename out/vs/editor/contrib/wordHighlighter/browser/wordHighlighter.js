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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/wordHighlighter/browser/highlightDecorations", "vs/base/common/iterator"], function (require, exports, aria_1, arrays, async_1, cancellation_1, errors_1, lifecycle_1, editorExtensions_1, range_1, editorContextKeys_1, languages_1, nls, contextkey_1, languageFeatures_1, highlightDecorations_1, iterator_1) {
    "use strict";
    var WordHighlighterContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WordHighlighterContribution = exports.getOccurrencesAtPosition = void 0;
    const ctxHasWordHighlights = new contextkey_1.RawContextKey('hasWordHighlights', false);
    function getOccurrencesAtPosition(registry, model, position, token) {
        const orderedByScore = registry.ordered(model);
        // in order of score ask the occurrences provider
        // until someone response with a good result
        // (good = none empty array)
        return (0, async_1.first)(orderedByScore.map(provider => () => {
            return Promise.resolve(provider.provideDocumentHighlights(model, position, token))
                .then(undefined, errors_1.onUnexpectedExternalError);
        }), arrays.isNonEmptyArray);
    }
    exports.getOccurrencesAtPosition = getOccurrencesAtPosition;
    class OccurenceAtPositionRequest {
        constructor(_model, _selection, _wordSeparators) {
            this._model = _model;
            this._selection = _selection;
            this._wordSeparators = _wordSeparators;
            this._wordRange = this._getCurrentWordRange(_model, _selection);
            this._result = null;
        }
        get result() {
            if (!this._result) {
                this._result = (0, async_1.createCancelablePromise)(token => this._compute(this._model, this._selection, this._wordSeparators, token));
            }
            return this._result;
        }
        _getCurrentWordRange(model, selection) {
            const word = model.getWordAtPosition(selection.getPosition());
            if (word) {
                return new range_1.Range(selection.startLineNumber, word.startColumn, selection.startLineNumber, word.endColumn);
            }
            return null;
        }
        isValid(model, selection, decorations) {
            const lineNumber = selection.startLineNumber;
            const startColumn = selection.startColumn;
            const endColumn = selection.endColumn;
            const currentWordRange = this._getCurrentWordRange(model, selection);
            let requestIsValid = Boolean(this._wordRange && this._wordRange.equalsRange(currentWordRange));
            // Even if we are on a different word, if that word is in the decorations ranges, the request is still valid
            // (Same symbol)
            for (let i = 0, len = decorations.length; !requestIsValid && i < len; i++) {
                const range = decorations.getRange(i);
                if (range && range.startLineNumber === lineNumber) {
                    if (range.startColumn <= startColumn && range.endColumn >= endColumn) {
                        requestIsValid = true;
                    }
                }
            }
            return requestIsValid;
        }
        cancel() {
            this.result.cancel();
        }
    }
    class SemanticOccurenceAtPositionRequest extends OccurenceAtPositionRequest {
        constructor(model, selection, wordSeparators, providers) {
            super(model, selection, wordSeparators);
            this._providers = providers;
        }
        _compute(model, selection, wordSeparators, token) {
            return getOccurrencesAtPosition(this._providers, model, selection.getPosition(), token).then(value => value || []);
        }
    }
    class TextualOccurenceAtPositionRequest extends OccurenceAtPositionRequest {
        constructor(model, selection, wordSeparators) {
            super(model, selection, wordSeparators);
            this._selectionIsEmpty = selection.isEmpty();
        }
        _compute(model, selection, wordSeparators, token) {
            return (0, async_1.timeout)(250, token).then(() => {
                if (!selection.isEmpty()) {
                    return [];
                }
                const word = model.getWordAtPosition(selection.getPosition());
                if (!word || word.word.length > 1000) {
                    return [];
                }
                const matches = model.findMatches(word.word, true, false, true, wordSeparators, false);
                return matches.map(m => {
                    return {
                        range: m.range,
                        kind: languages_1.DocumentHighlightKind.Text
                    };
                });
            });
        }
        isValid(model, selection, decorations) {
            const currentSelectionIsEmpty = selection.isEmpty();
            if (this._selectionIsEmpty !== currentSelectionIsEmpty) {
                return false;
            }
            return super.isValid(model, selection, decorations);
        }
    }
    function computeOccurencesAtPosition(registry, model, selection, wordSeparators) {
        if (registry.has(model)) {
            return new SemanticOccurenceAtPositionRequest(model, selection, wordSeparators, registry);
        }
        return new TextualOccurenceAtPositionRequest(model, selection, wordSeparators);
    }
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executeDocumentHighlights', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        return getOccurrencesAtPosition(languageFeaturesService.documentHighlightProvider, model, position, cancellation_1.CancellationToken.None);
    });
    class WordHighlighter {
        constructor(editor, providers, linkedHighlighters, contextKeyService) {
            this.toUnhook = new lifecycle_1.DisposableStore();
            this.workerRequestTokenId = 0;
            this.workerRequestCompleted = false;
            this.workerRequestValue = [];
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
            this.editor = editor;
            this.providers = providers;
            this.linkedHighlighters = linkedHighlighters;
            this._hasWordHighlights = ctxHasWordHighlights.bindTo(contextKeyService);
            this._ignorePositionChangeEvent = false;
            this.occurrencesHighlight = this.editor.getOption(80 /* EditorOption.occurrencesHighlight */);
            this.model = this.editor.getModel();
            this.toUnhook.add(editor.onDidChangeCursorPosition((e) => {
                if (this._ignorePositionChangeEvent) {
                    // We are changing the position => ignore this event
                    return;
                }
                if (!this.occurrencesHighlight) {
                    // Early exit if nothing needs to be done!
                    // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                    return;
                }
                this._onPositionChanged(e);
            }));
            this.toUnhook.add(editor.onDidChangeModelContent((e) => {
                this._stopAll();
            }));
            this.toUnhook.add(editor.onDidChangeConfiguration((e) => {
                const newValue = this.editor.getOption(80 /* EditorOption.occurrencesHighlight */);
                if (this.occurrencesHighlight !== newValue) {
                    this.occurrencesHighlight = newValue;
                    this._stopAll();
                }
            }));
            this.decorations = this.editor.createDecorationsCollection();
            this.workerRequestTokenId = 0;
            this.workerRequest = null;
            this.workerRequestCompleted = false;
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
        }
        hasDecorations() {
            return (this.decorations.length > 0);
        }
        restore() {
            if (!this.occurrencesHighlight) {
                return;
            }
            this._run();
        }
        stop() {
            if (!this.occurrencesHighlight) {
                return;
            }
            this._stopAll();
        }
        _getSortedHighlights() {
            return (this.decorations.getRanges()
                .sort(range_1.Range.compareRangesUsingStarts));
        }
        moveNext() {
            const highlights = this._getSortedHighlights();
            const index = highlights.findIndex((range) => range.containsPosition(this.editor.getPosition()));
            const newIndex = ((index + 1) % highlights.length);
            const dest = highlights[newIndex];
            try {
                this._ignorePositionChangeEvent = true;
                this.editor.setPosition(dest.getStartPosition());
                this.editor.revealRangeInCenterIfOutsideViewport(dest);
                const word = this._getWord();
                if (word) {
                    const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
                    (0, aria_1.alert)(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
                }
            }
            finally {
                this._ignorePositionChangeEvent = false;
            }
        }
        moveBack() {
            const highlights = this._getSortedHighlights();
            const index = highlights.findIndex((range) => range.containsPosition(this.editor.getPosition()));
            const newIndex = ((index - 1 + highlights.length) % highlights.length);
            const dest = highlights[newIndex];
            try {
                this._ignorePositionChangeEvent = true;
                this.editor.setPosition(dest.getStartPosition());
                this.editor.revealRangeInCenterIfOutsideViewport(dest);
                const word = this._getWord();
                if (word) {
                    const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
                    (0, aria_1.alert)(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
                }
            }
            finally {
                this._ignorePositionChangeEvent = false;
            }
        }
        _removeDecorations() {
            if (this.decorations.length > 0) {
                // remove decorations
                this.decorations.clear();
                this._hasWordHighlights.set(false);
            }
        }
        _stopAll() {
            // Remove any existing decorations
            this._removeDecorations();
            // Cancel any renderDecorationsTimer
            if (this.renderDecorationsTimer !== -1) {
                clearTimeout(this.renderDecorationsTimer);
                this.renderDecorationsTimer = -1;
            }
            // Cancel any worker request
            if (this.workerRequest !== null) {
                this.workerRequest.cancel();
                this.workerRequest = null;
            }
            // Invalidate any worker request callback
            if (!this.workerRequestCompleted) {
                this.workerRequestTokenId++;
                this.workerRequestCompleted = true;
            }
        }
        _onPositionChanged(e) {
            // disabled
            if (!this.occurrencesHighlight) {
                this._stopAll();
                return;
            }
            // ignore typing & other
            if (e.reason !== 3 /* CursorChangeReason.Explicit */) {
                this._stopAll();
                return;
            }
            this._run();
        }
        _getWord() {
            const editorSelection = this.editor.getSelection();
            const lineNumber = editorSelection.startLineNumber;
            const startColumn = editorSelection.startColumn;
            return this.model.getWordAtPosition({
                lineNumber: lineNumber,
                column: startColumn
            });
        }
        _run() {
            const editorSelection = this.editor.getSelection();
            // ignore multiline selection
            if (editorSelection.startLineNumber !== editorSelection.endLineNumber) {
                this._stopAll();
                return;
            }
            const startColumn = editorSelection.startColumn;
            const endColumn = editorSelection.endColumn;
            const word = this._getWord();
            // The selection must be inside a word or surround one word at most
            if (!word || word.startColumn > startColumn || word.endColumn < endColumn) {
                this._stopAll();
                return;
            }
            // All the effort below is trying to achieve this:
            // - when cursor is moved to a word, trigger immediately a findOccurrences request
            // - 250ms later after the last cursor move event, render the occurrences
            // - no flickering!
            const workerRequestIsValid = (this.workerRequest && this.workerRequest.isValid(this.model, editorSelection, this.decorations));
            // There are 4 cases:
            // a) old workerRequest is valid & completed, renderDecorationsTimer fired
            // b) old workerRequest is valid & completed, renderDecorationsTimer not fired
            // c) old workerRequest is valid, but not completed
            // d) old workerRequest is not valid
            // For a) no action is needed
            // For c), member 'lastCursorPositionChangeTime' will be used when installing the timer so no action is needed
            this.lastCursorPositionChangeTime = (new Date()).getTime();
            if (workerRequestIsValid) {
                if (this.workerRequestCompleted && this.renderDecorationsTimer !== -1) {
                    // case b)
                    // Delay the firing of renderDecorationsTimer by an extra 250 ms
                    clearTimeout(this.renderDecorationsTimer);
                    this.renderDecorationsTimer = -1;
                    this._beginRenderDecorations();
                }
            }
            else {
                // case d)
                // Stop all previous actions and start fresh
                this._stopAll();
                const myRequestId = ++this.workerRequestTokenId;
                this.workerRequestCompleted = false;
                this.workerRequest = computeOccurencesAtPosition(this.providers, this.model, this.editor.getSelection(), this.editor.getOption(129 /* EditorOption.wordSeparators */));
                this.workerRequest.result.then(data => {
                    if (myRequestId === this.workerRequestTokenId) {
                        this.workerRequestCompleted = true;
                        this.workerRequestValue = data || [];
                        this._beginRenderDecorations();
                    }
                }, errors_1.onUnexpectedError);
            }
        }
        _beginRenderDecorations() {
            const currentTime = (new Date()).getTime();
            const minimumRenderTime = this.lastCursorPositionChangeTime + 250;
            if (currentTime >= minimumRenderTime) {
                // Synchronous
                this.renderDecorationsTimer = -1;
                this.renderDecorations();
            }
            else {
                // Asynchronous
                this.renderDecorationsTimer = setTimeout(() => {
                    this.renderDecorations();
                }, (minimumRenderTime - currentTime));
            }
        }
        renderDecorations() {
            this.renderDecorationsTimer = -1;
            const decorations = [];
            for (const info of this.workerRequestValue) {
                if (info.range) {
                    decorations.push({
                        range: info.range,
                        options: (0, highlightDecorations_1.getHighlightDecorationOptions)(info.kind)
                    });
                }
            }
            this.decorations.set(decorations);
            this._hasWordHighlights.set(this.hasDecorations());
            // update decorators of friends
            for (const other of this.linkedHighlighters()) {
                if (other?.editor.getModel() === this.editor.getModel()) {
                    other._stopAll();
                    other.decorations.set(decorations);
                    other._hasWordHighlights.set(other.hasDecorations());
                }
            }
        }
        dispose() {
            this._stopAll();
            this.toUnhook.dispose();
        }
    }
    let WordHighlighterContribution = class WordHighlighterContribution extends lifecycle_1.Disposable {
        static { WordHighlighterContribution_1 = this; }
        static { this.ID = 'editor.contrib.wordHighlighter'; }
        static get(editor) {
            return editor.getContribution(WordHighlighterContribution_1.ID);
        }
        constructor(editor, contextKeyService, languageFeaturesService) {
            super();
            this.wordHighlighter = null;
            this.linkedContributions = new Set();
            const createWordHighlighterIfPossible = () => {
                if (editor.hasModel() && !editor.getModel().isTooLargeForTokenization()) {
                    this.wordHighlighter = new WordHighlighter(editor, languageFeaturesService.documentHighlightProvider, () => iterator_1.Iterable.map(this.linkedContributions, c => c.wordHighlighter), contextKeyService);
                }
            };
            this._register(editor.onDidChangeModel((e) => {
                if (this.wordHighlighter) {
                    this.wordHighlighter.dispose();
                    this.wordHighlighter = null;
                }
                createWordHighlighterIfPossible();
            }));
            createWordHighlighterIfPossible();
        }
        saveViewState() {
            if (this.wordHighlighter && this.wordHighlighter.hasDecorations()) {
                return true;
            }
            return false;
        }
        moveNext() {
            this.wordHighlighter?.moveNext();
        }
        moveBack() {
            this.wordHighlighter?.moveBack();
        }
        restoreViewState(state) {
            if (this.wordHighlighter && state) {
                this.wordHighlighter.restore();
            }
        }
        stopHighlighting() {
            this.wordHighlighter?.stop();
        }
        linkWordHighlighters(editor) {
            const other = WordHighlighterContribution_1.get(editor);
            if (!other) {
                return lifecycle_1.Disposable.None;
            }
            this.linkedContributions.add(other);
            other.linkedContributions.add(this);
            return (0, lifecycle_1.toDisposable)(() => {
                this.linkedContributions.delete(other);
                other.linkedContributions.delete(this);
            });
        }
        dispose() {
            if (this.wordHighlighter) {
                this.wordHighlighter.dispose();
                this.wordHighlighter = null;
            }
            super.dispose();
        }
    };
    exports.WordHighlighterContribution = WordHighlighterContribution;
    exports.WordHighlighterContribution = WordHighlighterContribution = WordHighlighterContribution_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, languageFeatures_1.ILanguageFeaturesService)
    ], WordHighlighterContribution);
    class WordHighlightNavigationAction extends editorExtensions_1.EditorAction {
        constructor(next, opts) {
            super(opts);
            this._isNext = next;
        }
        run(accessor, editor) {
            const controller = WordHighlighterContribution.get(editor);
            if (!controller) {
                return;
            }
            if (this._isNext) {
                controller.moveNext();
            }
            else {
                controller.moveBack();
            }
        }
    }
    class NextWordHighlightAction extends WordHighlightNavigationAction {
        constructor() {
            super(true, {
                id: 'editor.action.wordHighlight.next',
                label: nls.localize('wordHighlight.next.label', "Go to Next Symbol Highlight"),
                alias: 'Go to Next Symbol Highlight',
                precondition: ctxHasWordHighlights,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    class PrevWordHighlightAction extends WordHighlightNavigationAction {
        constructor() {
            super(false, {
                id: 'editor.action.wordHighlight.prev',
                label: nls.localize('wordHighlight.previous.label', "Go to Previous Symbol Highlight"),
                alias: 'Go to Previous Symbol Highlight',
                precondition: ctxHasWordHighlights,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    class TriggerWordHighlightAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.wordHighlight.trigger',
                label: nls.localize('wordHighlight.trigger.label', "Trigger Symbol Highlight"),
                alias: 'Trigger Symbol Highlight',
                precondition: ctxHasWordHighlights.toNegated(),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 0,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor, args) {
            const controller = WordHighlighterContribution.get(editor);
            if (!controller) {
                return;
            }
            controller.restoreViewState(true);
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(WordHighlighterContribution.ID, WordHighlighterContribution, 0 /* EditorContributionInstantiation.Eager */); // eager because it uses `saveViewState`/`restoreViewState`
    (0, editorExtensions_1.registerEditorAction)(NextWordHighlightAction);
    (0, editorExtensions_1.registerEditorAction)(PrevWordHighlightAction);
    (0, editorExtensions_1.registerEditorAction)(TriggerWordHighlightAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZEhpZ2hsaWdodGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvd29yZEhpZ2hsaWdodGVyL2Jyb3dzZXIvd29yZEhpZ2hsaWdodGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE4QmhHLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRXBGLFNBQWdCLHdCQUF3QixDQUFDLFFBQTRELEVBQUUsS0FBaUIsRUFBRSxRQUFrQixFQUFFLEtBQXdCO1FBRXJLLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFL0MsaURBQWlEO1FBQ2pELDRDQUE0QztRQUM1Qyw0QkFBNEI7UUFDNUIsT0FBTyxJQUFBLGFBQUssRUFBeUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRTtZQUN4RixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ2hGLElBQUksQ0FBQyxTQUFTLEVBQUUsa0NBQXlCLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQVhELDREQVdDO0lBUUQsTUFBZSwwQkFBMEI7UUFLeEMsWUFBNkIsTUFBa0IsRUFBbUIsVUFBcUIsRUFBbUIsZUFBdUI7WUFBcEcsV0FBTSxHQUFOLE1BQU0sQ0FBWTtZQUFtQixlQUFVLEdBQVYsVUFBVSxDQUFXO1lBQW1CLG9CQUFlLEdBQWYsZUFBZSxDQUFRO1lBQ2hJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDO1FBRUQsSUFBSSxNQUFNO1lBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBQSwrQkFBdUIsRUFBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUMxSDtZQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUVyQixDQUFDO1FBSU8sb0JBQW9CLENBQUMsS0FBaUIsRUFBRSxTQUFvQjtZQUNuRSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDOUQsSUFBSSxJQUFJLEVBQUU7Z0JBQ1QsT0FBTyxJQUFJLGFBQUssQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDekc7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxPQUFPLENBQUMsS0FBaUIsRUFBRSxTQUFvQixFQUFFLFdBQXlDO1lBRWhHLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUM7WUFDN0MsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUMxQyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVyRSxJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFFL0YsNEdBQTRHO1lBQzVHLGdCQUFnQjtZQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLGNBQWMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxRSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsZUFBZSxLQUFLLFVBQVUsRUFBRTtvQkFDbEQsSUFBSSxLQUFLLENBQUMsV0FBVyxJQUFJLFdBQVcsSUFBSSxLQUFLLENBQUMsU0FBUyxJQUFJLFNBQVMsRUFBRTt3QkFDckUsY0FBYyxHQUFHLElBQUksQ0FBQztxQkFDdEI7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sY0FBYyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxNQUFNO1lBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QixDQUFDO0tBQ0Q7SUFFRCxNQUFNLGtDQUFtQyxTQUFRLDBCQUEwQjtRQUkxRSxZQUFZLEtBQWlCLEVBQUUsU0FBb0IsRUFBRSxjQUFzQixFQUFFLFNBQTZEO1lBQ3pJLEtBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzdCLENBQUM7UUFFUyxRQUFRLENBQUMsS0FBaUIsRUFBRSxTQUFvQixFQUFFLGNBQXNCLEVBQUUsS0FBd0I7WUFDM0csT0FBTyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsV0FBVyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3BILENBQUM7S0FDRDtJQUVELE1BQU0saUNBQWtDLFNBQVEsMEJBQTBCO1FBSXpFLFlBQVksS0FBaUIsRUFBRSxTQUFvQixFQUFFLGNBQXNCO1lBQzFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVTLFFBQVEsQ0FBQyxLQUFpQixFQUFFLFNBQW9CLEVBQUUsY0FBc0IsRUFBRSxLQUF3QjtZQUMzRyxPQUFPLElBQUEsZUFBTyxFQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUN6QixPQUFPLEVBQUUsQ0FBQztpQkFDVjtnQkFFRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBRTlELElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFFO29CQUNyQyxPQUFPLEVBQUUsQ0FBQztpQkFDVjtnQkFDRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN2RixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3RCLE9BQU87d0JBQ04sS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO3dCQUNkLElBQUksRUFBRSxpQ0FBcUIsQ0FBQyxJQUFJO3FCQUNoQyxDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRWUsT0FBTyxDQUFDLEtBQWlCLEVBQUUsU0FBb0IsRUFBRSxXQUF5QztZQUN6RyxNQUFNLHVCQUF1QixHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsS0FBSyx1QkFBdUIsRUFBRTtnQkFDdkQsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3JELENBQUM7S0FDRDtJQUVELFNBQVMsMkJBQTJCLENBQUMsUUFBNEQsRUFBRSxLQUFpQixFQUFFLFNBQW9CLEVBQUUsY0FBc0I7UUFDakssSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sSUFBSSxrQ0FBa0MsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMxRjtRQUNELE9BQU8sSUFBSSxpQ0FBaUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRCxJQUFBLGtEQUErQixFQUFDLDRCQUE0QixFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUMzRixNQUFNLHVCQUF1QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkNBQXdCLENBQUMsQ0FBQztRQUN2RSxPQUFPLHdCQUF3QixDQUFDLHVCQUF1QixDQUFDLHlCQUF5QixFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLGVBQWU7UUFzQnBCLFlBQVksTUFBeUIsRUFBRSxTQUE2RCxFQUFFLGtCQUEwRCxFQUFFLGlCQUFxQztZQWZ0TCxhQUFRLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFMUMseUJBQW9CLEdBQVcsQ0FBQyxDQUFDO1lBRWpDLDJCQUFzQixHQUFZLEtBQUssQ0FBQztZQUN4Qyx1QkFBa0IsR0FBd0IsRUFBRSxDQUFDO1lBRTdDLGlDQUE0QixHQUFXLENBQUMsQ0FBQztZQUN6QywyQkFBc0IsR0FBUSxDQUFDLENBQUMsQ0FBQztZQVF4QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7WUFDN0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQywwQkFBMEIsR0FBRyxLQUFLLENBQUM7WUFDeEMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyw0Q0FBbUMsQ0FBQztZQUNyRixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBOEIsRUFBRSxFQUFFO2dCQUVyRixJQUFJLElBQUksQ0FBQywwQkFBMEIsRUFBRTtvQkFDcEMsb0RBQW9EO29CQUNwRCxPQUFPO2lCQUNQO2dCQUVELElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7b0JBQy9CLDBDQUEwQztvQkFDMUMsOEdBQThHO29CQUM5RyxPQUFPO2lCQUNQO2dCQUVELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3ZELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyw0Q0FBbUMsQ0FBQztnQkFDMUUsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEtBQUssUUFBUSxFQUFFO29CQUMzQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsUUFBUSxDQUFDO29CQUNyQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ2hCO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQzdELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQztZQUVwQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRU0sY0FBYztZQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVNLE9BQU87WUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMvQixPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDYixDQUFDO1FBRU0sSUFBSTtZQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQy9CLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRU8sb0JBQW9CO1lBQzNCLE9BQU8sQ0FDTixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRTtpQkFDMUIsSUFBSSxDQUFDLGFBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUN0QyxDQUFDO1FBQ0gsQ0FBQztRQUVNLFFBQVE7WUFDZCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUMvQyxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakcsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xDLElBQUk7Z0JBQ0gsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQztnQkFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztnQkFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM3QixJQUFJLElBQUksRUFBRTtvQkFDVCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ2hGLElBQUEsWUFBSyxFQUFDLEdBQUcsV0FBVyxLQUFLLFFBQVEsR0FBRyxDQUFDLE9BQU8sVUFBVSxDQUFDLE1BQU0sU0FBUyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztpQkFDcEY7YUFDRDtvQkFBUztnQkFDVCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsS0FBSyxDQUFDO2FBQ3hDO1FBQ0YsQ0FBQztRQUVNLFFBQVE7WUFDZCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUMvQyxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakcsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2RSxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEMsSUFBSTtnQkFDSCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzdCLElBQUksSUFBSSxFQUFFO29CQUNULE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDaEYsSUFBQSxZQUFLLEVBQUMsR0FBRyxXQUFXLEtBQUssUUFBUSxHQUFHLENBQUMsT0FBTyxVQUFVLENBQUMsTUFBTSxTQUFTLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2lCQUNwRjthQUNEO29CQUFTO2dCQUNULElBQUksQ0FBQywwQkFBMEIsR0FBRyxLQUFLLENBQUM7YUFDeEM7UUFDRixDQUFDO1FBRU8sa0JBQWtCO1lBQ3pCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNoQyxxQkFBcUI7Z0JBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbkM7UUFDRixDQUFDO1FBRU8sUUFBUTtZQUNmLGtDQUFrQztZQUNsQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUUxQixvQ0FBb0M7WUFDcEMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZDLFlBQVksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ2pDO1lBRUQsNEJBQTRCO1lBQzVCLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxJQUFJLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO2FBQzFCO1lBRUQseUNBQXlDO1lBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO2FBQ25DO1FBQ0YsQ0FBQztRQUVPLGtCQUFrQixDQUFDLENBQThCO1lBRXhELFdBQVc7WUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMvQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU87YUFDUDtZQUVELHdCQUF3QjtZQUN4QixJQUFJLENBQUMsQ0FBQyxNQUFNLHdDQUFnQyxFQUFFO2dCQUM3QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLENBQUM7UUFFTyxRQUFRO1lBQ2YsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNuRCxNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDO1lBQ25ELE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUM7WUFFaEQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO2dCQUNuQyxVQUFVLEVBQUUsVUFBVTtnQkFDdEIsTUFBTSxFQUFFLFdBQVc7YUFDbkIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLElBQUk7WUFDWCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRW5ELDZCQUE2QjtZQUM3QixJQUFJLGVBQWUsQ0FBQyxlQUFlLEtBQUssZUFBZSxDQUFDLGFBQWEsRUFBRTtnQkFDdEUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixPQUFPO2FBQ1A7WUFFRCxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDO1lBQ2hELE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUM7WUFFNUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTdCLG1FQUFtRTtZQUNuRSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxFQUFFO2dCQUMxRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU87YUFDUDtZQUVELGtEQUFrRDtZQUNsRCxrRkFBa0Y7WUFDbEYseUVBQXlFO1lBQ3pFLG1CQUFtQjtZQUVuQixNQUFNLG9CQUFvQixHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUUvSCxxQkFBcUI7WUFDckIsMEVBQTBFO1lBQzFFLDhFQUE4RTtZQUM5RSxtREFBbUQ7WUFDbkQsb0NBQW9DO1lBRXBDLDZCQUE2QjtZQUM3Qiw4R0FBOEc7WUFFOUcsSUFBSSxDQUFDLDRCQUE0QixHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRTNELElBQUksb0JBQW9CLEVBQUU7Z0JBQ3pCLElBQUksSUFBSSxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQyxzQkFBc0IsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDdEUsVUFBVTtvQkFDVixnRUFBZ0U7b0JBQ2hFLFlBQVksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztvQkFDMUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztpQkFDL0I7YUFDRDtpQkFBTTtnQkFDTixVQUFVO2dCQUNWLDRDQUE0QztnQkFDNUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUVoQixNQUFNLFdBQVcsR0FBRyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQztnQkFFcEMsSUFBSSxDQUFDLGFBQWEsR0FBRywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsdUNBQTZCLENBQUMsQ0FBQztnQkFFN0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNyQyxJQUFJLFdBQVcsS0FBSyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7d0JBQzlDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7d0JBQ25DLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO3dCQUNyQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztxQkFDL0I7Z0JBQ0YsQ0FBQyxFQUFFLDBCQUFpQixDQUFDLENBQUM7YUFDdEI7UUFDRixDQUFDO1FBRU8sdUJBQXVCO1lBQzlCLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzNDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixHQUFHLEdBQUcsQ0FBQztZQUVsRSxJQUFJLFdBQVcsSUFBSSxpQkFBaUIsRUFBRTtnQkFDckMsY0FBYztnQkFDZCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2FBQ3pCO2lCQUFNO2dCQUNOLGVBQWU7Z0JBQ2YsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQzdDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUMxQixDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0YsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxXQUFXLEdBQTRCLEVBQUUsQ0FBQztZQUNoRCxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDM0MsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNmLFdBQVcsQ0FBQyxJQUFJLENBQUM7d0JBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSzt3QkFDakIsT0FBTyxFQUFFLElBQUEsb0RBQTZCLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztxQkFDakQsQ0FBQyxDQUFDO2lCQUNIO2FBQ0Q7WUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBRW5ELCtCQUErQjtZQUMvQixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFO2dCQUM5QyxJQUFJLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDeEQsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNqQixLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDbkMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztpQkFDckQ7YUFDRDtRQUNGLENBQUM7UUFFTSxPQUFPO1lBQ2IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDekIsQ0FBQztLQUNEO0lBRU0sSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTs7aUJBRW5DLE9BQUUsR0FBRyxnQ0FBZ0MsQUFBbkMsQ0FBb0M7UUFFdEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUNwQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQThCLDZCQUEyQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVGLENBQUM7UUFLRCxZQUFZLE1BQW1CLEVBQXNCLGlCQUFxQyxFQUE0Qix1QkFBaUQ7WUFDdEssS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztZQUM1QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNyQyxNQUFNLCtCQUErQixHQUFHLEdBQUcsRUFBRTtnQkFDNUMsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMseUJBQXlCLEVBQUUsRUFBRTtvQkFDeEUsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLEVBQUUsdUJBQXVCLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7aUJBQy9MO1lBQ0YsQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDNUMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO29CQUN6QixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztpQkFDNUI7Z0JBQ0QsK0JBQStCLEVBQUUsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osK0JBQStCLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBRU0sYUFBYTtZQUNuQixJQUFJLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsRUFBRTtnQkFDbEUsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLFFBQVE7WUFDZCxJQUFJLENBQUMsZUFBZSxFQUFFLFFBQVEsRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFTSxRQUFRO1lBQ2QsSUFBSSxDQUFDLGVBQWUsRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRU0sZ0JBQWdCLENBQUMsS0FBMEI7WUFDakQsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLEtBQUssRUFBRTtnQkFDbEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUMvQjtRQUNGLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRU0sb0JBQW9CLENBQUMsTUFBbUI7WUFDOUMsTUFBTSxLQUFLLEdBQUcsNkJBQTJCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQzthQUN2QjtZQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1lBQ0QsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7O0lBMUVXLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBV0wsV0FBQSwrQkFBa0IsQ0FBQTtRQUF5QyxXQUFBLDJDQUF3QixDQUFBO09BWHpHLDJCQUEyQixDQTJFdkM7SUFHRCxNQUFNLDZCQUE4QixTQUFRLCtCQUFZO1FBSXZELFlBQVksSUFBYSxFQUFFLElBQW9CO1lBQzlDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFFTSxHQUFHLENBQUMsUUFBMEIsRUFBRSxNQUFtQjtZQUN6RCxNQUFNLFVBQVUsR0FBRywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsT0FBTzthQUNQO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDdEI7aUJBQU07Z0JBQ04sVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3RCO1FBQ0YsQ0FBQztLQUNEO0lBRUQsTUFBTSx1QkFBd0IsU0FBUSw2QkFBNkI7UUFDbEU7WUFDQyxLQUFLLENBQUMsSUFBSSxFQUFFO2dCQUNYLEVBQUUsRUFBRSxrQ0FBa0M7Z0JBQ3RDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLDZCQUE2QixDQUFDO2dCQUM5RSxLQUFLLEVBQUUsNkJBQTZCO2dCQUNwQyxZQUFZLEVBQUUsb0JBQW9CO2dCQUNsQyxNQUFNLEVBQUU7b0JBQ1AsTUFBTSxFQUFFLHFDQUFpQixDQUFDLGVBQWU7b0JBQ3pDLE9BQU8scUJBQVk7b0JBQ25CLE1BQU0sMENBQWdDO2lCQUN0QzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQUVELE1BQU0sdUJBQXdCLFNBQVEsNkJBQTZCO1FBQ2xFO1lBQ0MsS0FBSyxDQUFDLEtBQUssRUFBRTtnQkFDWixFQUFFLEVBQUUsa0NBQWtDO2dCQUN0QyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSxpQ0FBaUMsQ0FBQztnQkFDdEYsS0FBSyxFQUFFLGlDQUFpQztnQkFDeEMsWUFBWSxFQUFFLG9CQUFvQjtnQkFDbEMsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxlQUFlO29CQUN6QyxPQUFPLEVBQUUsNkNBQXlCO29CQUNsQyxNQUFNLDBDQUFnQztpQkFDdEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFFRCxNQUFNLDBCQUEyQixTQUFRLCtCQUFZO1FBQ3BEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxxQ0FBcUM7Z0JBQ3pDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLDBCQUEwQixDQUFDO2dCQUM5RSxLQUFLLEVBQUUsMEJBQTBCO2dCQUNqQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsU0FBUyxFQUFFO2dCQUM5QyxNQUFNLEVBQUU7b0JBQ1AsTUFBTSxFQUFFLHFDQUFpQixDQUFDLGVBQWU7b0JBQ3pDLE9BQU8sRUFBRSxDQUFDO29CQUNWLE1BQU0sMENBQWdDO2lCQUN0QzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxHQUFHLENBQUMsUUFBMEIsRUFBRSxNQUFtQixFQUFFLElBQVM7WUFDcEUsTUFBTSxVQUFVLEdBQUcsMkJBQTJCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hCLE9BQU87YUFDUDtZQUVELFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDO0tBQ0Q7SUFFRCxJQUFBLDZDQUEwQixFQUFDLDJCQUEyQixDQUFDLEVBQUUsRUFBRSwyQkFBMkIsZ0RBQXdDLENBQUMsQ0FBQywyREFBMkQ7SUFDM0wsSUFBQSx1Q0FBb0IsRUFBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzlDLElBQUEsdUNBQW9CLEVBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUM5QyxJQUFBLHVDQUFvQixFQUFDLDBCQUEwQixDQUFDLENBQUMifQ==