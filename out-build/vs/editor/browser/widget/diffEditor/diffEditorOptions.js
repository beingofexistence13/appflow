/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observable", "vs/editor/common/config/diffEditor", "vs/editor/common/config/editorOptions"], function (require, exports, observable_1, diffEditor_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lZ = void 0;
    class $lZ {
        get editorOptions() { return this.a; }
        constructor(options, b) {
            this.b = b;
            this.couldShowInlineViewBecauseOfSize = (0, observable_1.derived)(this, reader => this.a.read(reader).renderSideBySide && this.b.read(reader) <= this.a.read(reader).renderSideBySideInlineBreakpoint);
            this.renderOverviewRuler = (0, observable_1.derived)(this, reader => this.a.read(reader).renderOverviewRuler);
            this.renderSideBySide = (0, observable_1.derived)(this, reader => this.a.read(reader).renderSideBySide
                && !(this.a.read(reader).useInlineViewWhenSpaceIsLimited && this.couldShowInlineViewBecauseOfSize.read(reader)));
            this.readOnly = (0, observable_1.derived)(this, reader => this.a.read(reader).readOnly);
            this.shouldRenderRevertArrows = (0, observable_1.derived)(this, reader => {
                if (!this.a.read(reader).renderMarginRevertIcon) {
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
            this.renderIndicators = (0, observable_1.derived)(this, reader => this.a.read(reader).renderIndicators);
            this.enableSplitViewResizing = (0, observable_1.derived)(this, reader => this.a.read(reader).enableSplitViewResizing);
            this.splitViewDefaultRatio = (0, observable_1.derived)(this, reader => this.a.read(reader).splitViewDefaultRatio);
            this.ignoreTrimWhitespace = (0, observable_1.derived)(this, reader => this.a.read(reader).ignoreTrimWhitespace);
            this.maxComputationTimeMs = (0, observable_1.derived)(this, reader => this.a.read(reader).maxComputationTime);
            this.showMoves = (0, observable_1.derived)(this, reader => this.a.read(reader).experimental.showMoves && this.renderSideBySide.read(reader));
            this.isInEmbeddedEditor = (0, observable_1.derived)(this, reader => this.a.read(reader).isInEmbeddedEditor);
            this.diffWordWrap = (0, observable_1.derived)(this, reader => this.a.read(reader).diffWordWrap);
            this.originalEditable = (0, observable_1.derived)(this, reader => this.a.read(reader).originalEditable);
            this.diffCodeLens = (0, observable_1.derived)(this, reader => this.a.read(reader).diffCodeLens);
            this.accessibilityVerbose = (0, observable_1.derived)(this, reader => this.a.read(reader).accessibilityVerbose);
            this.diffAlgorithm = (0, observable_1.derived)(this, reader => this.a.read(reader).diffAlgorithm);
            this.showEmptyDecorations = (0, observable_1.derived)(this, reader => this.a.read(reader).experimental.showEmptyDecorations);
            this.onlyShowAccessibleDiffViewer = (0, observable_1.derived)(this, reader => this.a.read(reader).onlyShowAccessibleDiffViewer);
            this.hideUnchangedRegions = (0, observable_1.derived)(this, reader => this.a.read(reader).hideUnchangedRegions.enabled);
            this.hideUnchangedRegionsRevealLineCount = (0, observable_1.derived)(this, reader => this.a.read(reader).hideUnchangedRegions.revealLineCount);
            this.hideUnchangedRegionsContextLineCount = (0, observable_1.derived)(this, reader => this.a.read(reader).hideUnchangedRegions.contextLineCount);
            this.hideUnchangedRegionsMinimumLineCount = (0, observable_1.derived)(this, reader => this.a.read(reader).hideUnchangedRegions.minimumLineCount);
            const optionsCopy = { ...options, ...validateDiffEditorOptions(options, diffEditor_1.$kZ) };
            this.a = (0, observable_1.observableValue)(this, optionsCopy);
        }
        updateOptions(changedOptions) {
            const newDiffEditorOptions = validateDiffEditorOptions(changedOptions, this.a.get());
            const newOptions = { ...this.a.get(), ...changedOptions, ...newDiffEditorOptions };
            this.a.set(newOptions, undefined, { changedOptions: changedOptions });
        }
    }
    exports.$lZ = $lZ;
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
//# sourceMappingURL=diffEditorOptions.js.map