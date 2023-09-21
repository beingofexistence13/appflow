/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observable", "vs/editor/common/config/diffEditor", "vs/editor/common/config/editorOptions"], function (require, exports, observable_1, diffEditor_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorOptions = void 0;
    class DiffEditorOptions {
        get editorOptions() { return this._options; }
        constructor(options, diffEditorWidth) {
            this.diffEditorWidth = diffEditorWidth;
            this.couldShowInlineViewBecauseOfSize = (0, observable_1.derived)(this, reader => this._options.read(reader).renderSideBySide && this.diffEditorWidth.read(reader) <= this._options.read(reader).renderSideBySideInlineBreakpoint);
            this.renderOverviewRuler = (0, observable_1.derived)(this, reader => this._options.read(reader).renderOverviewRuler);
            this.renderSideBySide = (0, observable_1.derived)(this, reader => this._options.read(reader).renderSideBySide
                && !(this._options.read(reader).useInlineViewWhenSpaceIsLimited && this.couldShowInlineViewBecauseOfSize.read(reader)));
            this.readOnly = (0, observable_1.derived)(this, reader => this._options.read(reader).readOnly);
            this.shouldRenderRevertArrows = (0, observable_1.derived)(this, reader => {
                if (!this._options.read(reader).renderMarginRevertIcon) {
                    return false;
                }
                if (!this.renderSideBySide.read(reader)) {
                    return false;
                }
                if (this.readOnly.read(reader)) {
                    return false;
                }
                return true;
            });
            this.renderIndicators = (0, observable_1.derived)(this, reader => this._options.read(reader).renderIndicators);
            this.enableSplitViewResizing = (0, observable_1.derived)(this, reader => this._options.read(reader).enableSplitViewResizing);
            this.splitViewDefaultRatio = (0, observable_1.derived)(this, reader => this._options.read(reader).splitViewDefaultRatio);
            this.ignoreTrimWhitespace = (0, observable_1.derived)(this, reader => this._options.read(reader).ignoreTrimWhitespace);
            this.maxComputationTimeMs = (0, observable_1.derived)(this, reader => this._options.read(reader).maxComputationTime);
            this.showMoves = (0, observable_1.derived)(this, reader => this._options.read(reader).experimental.showMoves && this.renderSideBySide.read(reader));
            this.isInEmbeddedEditor = (0, observable_1.derived)(this, reader => this._options.read(reader).isInEmbeddedEditor);
            this.diffWordWrap = (0, observable_1.derived)(this, reader => this._options.read(reader).diffWordWrap);
            this.originalEditable = (0, observable_1.derived)(this, reader => this._options.read(reader).originalEditable);
            this.diffCodeLens = (0, observable_1.derived)(this, reader => this._options.read(reader).diffCodeLens);
            this.accessibilityVerbose = (0, observable_1.derived)(this, reader => this._options.read(reader).accessibilityVerbose);
            this.diffAlgorithm = (0, observable_1.derived)(this, reader => this._options.read(reader).diffAlgorithm);
            this.showEmptyDecorations = (0, observable_1.derived)(this, reader => this._options.read(reader).experimental.showEmptyDecorations);
            this.onlyShowAccessibleDiffViewer = (0, observable_1.derived)(this, reader => this._options.read(reader).onlyShowAccessibleDiffViewer);
            this.hideUnchangedRegions = (0, observable_1.derived)(this, reader => this._options.read(reader).hideUnchangedRegions.enabled);
            this.hideUnchangedRegionsRevealLineCount = (0, observable_1.derived)(this, reader => this._options.read(reader).hideUnchangedRegions.revealLineCount);
            this.hideUnchangedRegionsContextLineCount = (0, observable_1.derived)(this, reader => this._options.read(reader).hideUnchangedRegions.contextLineCount);
            this.hideUnchangedRegionsMinimumLineCount = (0, observable_1.derived)(this, reader => this._options.read(reader).hideUnchangedRegions.minimumLineCount);
            const optionsCopy = { ...options, ...validateDiffEditorOptions(options, diffEditor_1.diffEditorDefaultOptions) };
            this._options = (0, observable_1.observableValue)(this, optionsCopy);
        }
        updateOptions(changedOptions) {
            const newDiffEditorOptions = validateDiffEditorOptions(changedOptions, this._options.get());
            const newOptions = { ...this._options.get(), ...changedOptions, ...newDiffEditorOptions };
            this._options.set(newOptions, undefined, { changedOptions: changedOptions });
        }
    }
    exports.DiffEditorOptions = DiffEditorOptions;
    function validateDiffEditorOptions(options, defaults) {
        return {
            enableSplitViewResizing: (0, editorOptions_1.boolean)(options.enableSplitViewResizing, defaults.enableSplitViewResizing),
            splitViewDefaultRatio: (0, editorOptions_1.clampedFloat)(options.splitViewDefaultRatio, 0.5, 0.1, 0.9),
            renderSideBySide: (0, editorOptions_1.boolean)(options.renderSideBySide, defaults.renderSideBySide),
            renderMarginRevertIcon: (0, editorOptions_1.boolean)(options.renderMarginRevertIcon, defaults.renderMarginRevertIcon),
            maxComputationTime: (0, editorOptions_1.clampedInt)(options.maxComputationTime, defaults.maxComputationTime, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
            maxFileSize: (0, editorOptions_1.clampedInt)(options.maxFileSize, defaults.maxFileSize, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
            ignoreTrimWhitespace: (0, editorOptions_1.boolean)(options.ignoreTrimWhitespace, defaults.ignoreTrimWhitespace),
            renderIndicators: (0, editorOptions_1.boolean)(options.renderIndicators, defaults.renderIndicators),
            originalEditable: (0, editorOptions_1.boolean)(options.originalEditable, defaults.originalEditable),
            diffCodeLens: (0, editorOptions_1.boolean)(options.diffCodeLens, defaults.diffCodeLens),
            renderOverviewRuler: (0, editorOptions_1.boolean)(options.renderOverviewRuler, defaults.renderOverviewRuler),
            diffWordWrap: (0, editorOptions_1.stringSet)(options.diffWordWrap, defaults.diffWordWrap, ['off', 'on', 'inherit']),
            diffAlgorithm: (0, editorOptions_1.stringSet)(options.diffAlgorithm, defaults.diffAlgorithm, ['legacy', 'advanced'], { 'smart': 'legacy', 'experimental': 'advanced' }),
            accessibilityVerbose: (0, editorOptions_1.boolean)(options.accessibilityVerbose, defaults.accessibilityVerbose),
            experimental: {
                showMoves: (0, editorOptions_1.boolean)(options.experimental?.showMoves, defaults.experimental.showMoves),
                showEmptyDecorations: (0, editorOptions_1.boolean)(options.experimental?.showEmptyDecorations, defaults.experimental.showEmptyDecorations),
            },
            hideUnchangedRegions: {
                enabled: (0, editorOptions_1.boolean)(options.hideUnchangedRegions?.enabled ?? options.experimental?.collapseUnchangedRegions, defaults.hideUnchangedRegions.enabled),
                contextLineCount: (0, editorOptions_1.clampedInt)(options.hideUnchangedRegions?.contextLineCount, defaults.hideUnchangedRegions.contextLineCount, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
                minimumLineCount: (0, editorOptions_1.clampedInt)(options.hideUnchangedRegions?.minimumLineCount, defaults.hideUnchangedRegions.minimumLineCount, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
                revealLineCount: (0, editorOptions_1.clampedInt)(options.hideUnchangedRegions?.revealLineCount, defaults.hideUnchangedRegions.revealLineCount, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
            },
            isInEmbeddedEditor: (0, editorOptions_1.boolean)(options.isInEmbeddedEditor, defaults.isInEmbeddedEditor),
            onlyShowAccessibleDiffViewer: (0, editorOptions_1.boolean)(options.onlyShowAccessibleDiffViewer, defaults.onlyShowAccessibleDiffViewer),
            renderSideBySideInlineBreakpoint: (0, editorOptions_1.clampedInt)(options.renderSideBySideInlineBreakpoint, defaults.renderSideBySideInlineBreakpoint, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
            useInlineViewWhenSpaceIsLimited: (0, editorOptions_1.boolean)(options.useInlineViewWhenSpaceIsLimited, defaults.useInlineViewWhenSpaceIsLimited),
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvck9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9kaWZmRWRpdG9yT3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSxpQkFBaUI7UUFJN0IsSUFBVyxhQUFhLEtBQXNFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFckgsWUFBWSxPQUFpRCxFQUFtQixlQUFvQztZQUFwQyxvQkFBZSxHQUFmLGVBQWUsQ0FBcUI7WUFLcEcscUNBQWdDLEdBQUcsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxDQUN6RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FDL0ksQ0FBQztZQUVjLHdCQUFtQixHQUFHLElBQUEsb0JBQU8sRUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQzlGLHFCQUFnQixHQUFHLElBQUEsb0JBQU8sRUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxnQkFBZ0I7bUJBQ2xHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQywrQkFBK0IsSUFBSSxJQUFJLENBQUMsZ0NBQWdDLENBQUMs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