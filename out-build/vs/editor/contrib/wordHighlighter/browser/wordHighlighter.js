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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/nls!vs/editor/contrib/wordHighlighter/browser/wordHighlighter", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/wordHighlighter/browser/highlightDecorations", "vs/base/common/iterator"], function (require, exports, aria_1, arrays, async_1, cancellation_1, errors_1, lifecycle_1, editorExtensions_1, range_1, editorContextKeys_1, languages_1, nls, contextkey_1, languageFeatures_1, highlightDecorations_1, iterator_1) {
    "use strict";
    var $f$_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f$ = exports.$e$ = void 0;
    const ctxHasWordHighlights = new contextkey_1.$2i('hasWordHighlights', false);
    function $e$(registry, model, position, token) {
        const orderedByScore = registry.ordered(model);
        // in order of score ask the occurrences provider
        // until someone response with a good result
        // (good = none empty array)
        return (0, async_1.$Kg)(orderedByScore.map(provider => () => {
            return Promise.resolve(provider.provideDocumentHighlights(model, position, token))
                .then(undefined, errors_1.$Z);
        }), arrays.$Jb);
    }
    exports.$e$ = $e$;
    class OccurenceAtPositionRequest {
        constructor(d, f, g) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.a = this.j(d, f);
            this.b = null;
        }
        get result() {
            if (!this.b) {
                this.b = (0, async_1.$ug)(token => this.h(this.d, this.f, this.g, token));
            }
            return this.b;
        }
        j(model, selection) {
            const word = model.getWordAtPosition(selection.getPosition());
            if (word) {
                return new range_1.$ks(selection.startLineNumber, word.startColumn, selection.startLineNumber, word.endColumn);
            }
            return null;
        }
        isValid(model, selection, decorations) {
            const lineNumber = selection.startLineNumber;
            const startColumn = selection.startColumn;
            const endColumn = selection.endColumn;
            const currentWordRange = this.j(model, selection);
            let requestIsValid = Boolean(this.a && this.a.equalsRange(currentWordRange));
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
            this.k = providers;
        }
        h(model, selection, wordSeparators, token) {
            return $e$(this.k, model, selection.getPosition(), token).then(value => value || []);
        }
    }
    class TextualOccurenceAtPositionRequest extends OccurenceAtPositionRequest {
        constructor(model, selection, wordSeparators) {
            super(model, selection, wordSeparators);
            this.k = selection.isEmpty();
        }
        h(model, selection, wordSeparators, token) {
            return (0, async_1.$Hg)(250, token).then(() => {
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
            if (this.k !== currentSelectionIsEmpty) {
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
    (0, editorExtensions_1.$vV)('_executeDocumentHighlights', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        return $e$(languageFeaturesService.documentHighlightProvider, model, position, cancellation_1.CancellationToken.None);
    });
    class WordHighlighter {
        constructor(editor, providers, linkedHighlighters, contextKeyService) {
            this.h = new lifecycle_1.$jc();
            this.j = 0;
            this.l = false;
            this.n = [];
            this.o = 0;
            this.p = -1;
            this.a = editor;
            this.b = providers;
            this.s = linkedHighlighters;
            this.q = ctxHasWordHighlights.bindTo(contextKeyService);
            this.r = false;
            this.d = this.a.getOption(80 /* EditorOption.occurrencesHighlight */);
            this.f = this.a.getModel();
            this.h.add(editor.onDidChangeCursorPosition((e) => {
                if (this.r) {
                    // We are changing the position => ignore this event
                    return;
                }
                if (!this.d) {
                    // Early exit if nothing needs to be done!
                    // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                    return;
                }
                this.w(e);
            }));
            this.h.add(editor.onDidChangeModelContent((e) => {
                this.v();
            }));
            this.h.add(editor.onDidChangeConfiguration((e) => {
                const newValue = this.a.getOption(80 /* EditorOption.occurrencesHighlight */);
                if (this.d !== newValue) {
                    this.d = newValue;
                    this.v();
                }
            }));
            this.g = this.a.createDecorationsCollection();
            this.j = 0;
            this.k = null;
            this.l = false;
            this.o = 0;
            this.p = -1;
        }
        hasDecorations() {
            return (this.g.length > 0);
        }
        restore() {
            if (!this.d) {
                return;
            }
            this.y();
        }
        stop() {
            if (!this.d) {
                return;
            }
            this.v();
        }
        t() {
            return (this.g.getRanges()
                .sort(range_1.$ks.compareRangesUsingStarts));
        }
        moveNext() {
            const highlights = this.t();
            const index = highlights.findIndex((range) => range.containsPosition(this.a.getPosition()));
            const newIndex = ((index + 1) % highlights.length);
            const dest = highlights[newIndex];
            try {
                this.r = true;
                this.a.setPosition(dest.getStartPosition());
                this.a.revealRangeInCenterIfOutsideViewport(dest);
                const word = this.x();
                if (word) {
                    const lineContent = this.a.getModel().getLineContent(dest.startLineNumber);
                    (0, aria_1.$$P)(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
                }
            }
            finally {
                this.r = false;
            }
        }
        moveBack() {
            const highlights = this.t();
            const index = highlights.findIndex((range) => range.containsPosition(this.a.getPosition()));
            const newIndex = ((index - 1 + highlights.length) % highlights.length);
            const dest = highlights[newIndex];
            try {
                this.r = true;
                this.a.setPosition(dest.getStartPosition());
                this.a.revealRangeInCenterIfOutsideViewport(dest);
                const word = this.x();
                if (word) {
                    const lineContent = this.a.getModel().getLineContent(dest.startLineNumber);
                    (0, aria_1.$$P)(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
                }
            }
            finally {
                this.r = false;
            }
        }
        u() {
            if (this.g.length > 0) {
                // remove decorations
                this.g.clear();
                this.q.set(false);
            }
        }
        v() {
            // Remove any existing decorations
            this.u();
            // Cancel any renderDecorationsTimer
            if (this.p !== -1) {
                clearTimeout(this.p);
                this.p = -1;
            }
            // Cancel any worker request
            if (this.k !== null) {
                this.k.cancel();
                this.k = null;
            }
            // Invalidate any worker request callback
            if (!this.l) {
                this.j++;
                this.l = true;
            }
        }
        w(e) {
            // disabled
            if (!this.d) {
                this.v();
                return;
            }
            // ignore typing & other
            if (e.reason !== 3 /* CursorChangeReason.Explicit */) {
                this.v();
                return;
            }
            this.y();
        }
        x() {
            const editorSelection = this.a.getSelection();
            const lineNumber = editorSelection.startLineNumber;
            const startColumn = editorSelection.startColumn;
            return this.f.getWordAtPosition({
                lineNumber: lineNumber,
                column: startColumn
            });
        }
        y() {
            const editorSelection = this.a.getSelection();
            // ignore multiline selection
            if (editorSelection.startLineNumber !== editorSelection.endLineNumber) {
                this.v();
                return;
            }
            const startColumn = editorSelection.startColumn;
            const endColumn = editorSelection.endColumn;
            const word = this.x();
            // The selection must be inside a word or surround one word at most
            if (!word || word.startColumn > startColumn || word.endColumn < endColumn) {
                this.v();
                return;
            }
            // All the effort below is trying to achieve this:
            // - when cursor is moved to a word, trigger immediately a findOccurrences request
            // - 250ms later after the last cursor move event, render the occurrences
            // - no flickering!
            const workerRequestIsValid = (this.k && this.k.isValid(this.f, editorSelection, this.g));
            // There are 4 cases:
            // a) old workerRequest is valid & completed, renderDecorationsTimer fired
            // b) old workerRequest is valid & completed, renderDecorationsTimer not fired
            // c) old workerRequest is valid, but not completed
            // d) old workerRequest is not valid
            // For a) no action is needed
            // For c), member 'lastCursorPositionChangeTime' will be used when installing the timer so no action is needed
            this.o = (new Date()).getTime();
            if (workerRequestIsValid) {
                if (this.l && this.p !== -1) {
                    // case b)
                    // Delay the firing of renderDecorationsTimer by an extra 250 ms
                    clearTimeout(this.p);
                    this.p = -1;
                    this.z();
                }
            }
            else {
                // case d)
                // Stop all previous actions and start fresh
                this.v();
                const myRequestId = ++this.j;
                this.l = false;
                this.k = computeOccurencesAtPosition(this.b, this.f, this.a.getSelection(), this.a.getOption(129 /* EditorOption.wordSeparators */));
                this.k.result.then(data => {
                    if (myRequestId === this.j) {
                        this.l = true;
                        this.n = data || [];
                        this.z();
                    }
                }, errors_1.$Y);
            }
        }
        z() {
            const currentTime = (new Date()).getTime();
            const minimumRenderTime = this.o + 250;
            if (currentTime >= minimumRenderTime) {
                // Synchronous
                this.p = -1;
                this.A();
            }
            else {
                // Asynchronous
                this.p = setTimeout(() => {
                    this.A();
                }, (minimumRenderTime - currentTime));
            }
        }
        A() {
            this.p = -1;
            const decorations = [];
            for (const info of this.n) {
                if (info.range) {
                    decorations.push({
                        range: info.range,
                        options: (0, highlightDecorations_1.$59)(info.kind)
                    });
                }
            }
            this.g.set(decorations);
            this.q.set(this.hasDecorations());
            // update decorators of friends
            for (const other of this.s()) {
                if (other?.a.getModel() === this.a.getModel()) {
                    other.v();
                    other.g.set(decorations);
                    other.q.set(other.hasDecorations());
                }
            }
        }
        dispose() {
            this.v();
            this.h.dispose();
        }
    }
    let $f$ = class $f$ extends lifecycle_1.$kc {
        static { $f$_1 = this; }
        static { this.ID = 'editor.contrib.wordHighlighter'; }
        static get(editor) {
            return editor.getContribution($f$_1.ID);
        }
        constructor(editor, contextKeyService, languageFeaturesService) {
            super();
            this.a = null;
            this.b = new Set();
            const createWordHighlighterIfPossible = () => {
                if (editor.hasModel() && !editor.getModel().isTooLargeForTokenization()) {
                    this.a = new WordHighlighter(editor, languageFeaturesService.documentHighlightProvider, () => iterator_1.Iterable.map(this.b, c => c.a), contextKeyService);
                }
            };
            this.B(editor.onDidChangeModel((e) => {
                if (this.a) {
                    this.a.dispose();
                    this.a = null;
                }
                createWordHighlighterIfPossible();
            }));
            createWordHighlighterIfPossible();
        }
        saveViewState() {
            if (this.a && this.a.hasDecorations()) {
                return true;
            }
            return false;
        }
        moveNext() {
            this.a?.moveNext();
        }
        moveBack() {
            this.a?.moveBack();
        }
        restoreViewState(state) {
            if (this.a && state) {
                this.a.restore();
            }
        }
        stopHighlighting() {
            this.a?.stop();
        }
        linkWordHighlighters(editor) {
            const other = $f$_1.get(editor);
            if (!other) {
                return lifecycle_1.$kc.None;
            }
            this.b.add(other);
            other.b.add(this);
            return (0, lifecycle_1.$ic)(() => {
                this.b.delete(other);
                other.b.delete(this);
            });
        }
        dispose() {
            if (this.a) {
                this.a.dispose();
                this.a = null;
            }
            super.dispose();
        }
    };
    exports.$f$ = $f$;
    exports.$f$ = $f$ = $f$_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, languageFeatures_1.$hF)
    ], $f$);
    class WordHighlightNavigationAction extends editorExtensions_1.$sV {
        constructor(next, opts) {
            super(opts);
            this.d = next;
        }
        run(accessor, editor) {
            const controller = $f$.get(editor);
            if (!controller) {
                return;
            }
            if (this.d) {
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
                label: nls.localize(0, null),
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
                label: nls.localize(1, null),
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
    class TriggerWordHighlightAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.wordHighlight.trigger',
                label: nls.localize(2, null),
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
            const controller = $f$.get(editor);
            if (!controller) {
                return;
            }
            controller.restoreViewState(true);
        }
    }
    (0, editorExtensions_1.$AV)($f$.ID, $f$, 0 /* EditorContributionInstantiation.Eager */); // eager because it uses `saveViewState`/`restoreViewState`
    (0, editorExtensions_1.$xV)(NextWordHighlightAction);
    (0, editorExtensions_1.$xV)(PrevWordHighlightAction);
    (0, editorExtensions_1.$xV)(TriggerWordHighlightAction);
});
//# sourceMappingURL=wordHighlighter.js.map