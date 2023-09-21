/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/languages", "vs/nls!vs/editor/contrib/wordHighlighter/browser/highlightDecorations", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./highlightDecorations"], function (require, exports, model_1, textModel_1, languages_1, nls, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$69 = exports.$59 = void 0;
    const wordHighlightBackground = (0, colorRegistry_1.$sv)('editor.wordHighlightBackground', { dark: '#575757B8', light: '#57575740', hcDark: null, hcLight: null }, nls.localize(0, null), true);
    (0, colorRegistry_1.$sv)('editor.wordHighlightStrongBackground', { dark: '#004972B8', light: '#0e639c40', hcDark: null, hcLight: null }, nls.localize(1, null), true);
    (0, colorRegistry_1.$sv)('editor.wordHighlightTextBackground', { light: wordHighlightBackground, dark: wordHighlightBackground, hcDark: wordHighlightBackground, hcLight: wordHighlightBackground }, nls.localize(2, null), true);
    const wordHighlightBorder = (0, colorRegistry_1.$sv)('editor.wordHighlightBorder', { light: null, dark: null, hcDark: colorRegistry_1.$Bv, hcLight: colorRegistry_1.$Bv }, nls.localize(3, null));
    (0, colorRegistry_1.$sv)('editor.wordHighlightStrongBorder', { light: null, dark: null, hcDark: colorRegistry_1.$Bv, hcLight: colorRegistry_1.$Bv }, nls.localize(4, null));
    (0, colorRegistry_1.$sv)('editor.wordHighlightTextBorder', { light: wordHighlightBorder, dark: wordHighlightBorder, hcDark: wordHighlightBorder, hcLight: wordHighlightBorder }, nls.localize(5, null));
    const overviewRulerWordHighlightForeground = (0, colorRegistry_1.$sv)('editorOverviewRuler.wordHighlightForeground', { dark: '#A0A0A0CC', light: '#A0A0A0CC', hcDark: '#A0A0A0CC', hcLight: '#A0A0A0CC' }, nls.localize(6, null), true);
    const overviewRulerWordHighlightStrongForeground = (0, colorRegistry_1.$sv)('editorOverviewRuler.wordHighlightStrongForeground', { dark: '#C0A0C0CC', light: '#C0A0C0CC', hcDark: '#C0A0C0CC', hcLight: '#C0A0C0CC' }, nls.localize(7, null), true);
    const overviewRulerWordHighlightTextForeground = (0, colorRegistry_1.$sv)('editorOverviewRuler.wordHighlightTextForeground', { dark: colorRegistry_1.$Ay, light: colorRegistry_1.$Ay, hcDark: colorRegistry_1.$Ay, hcLight: colorRegistry_1.$Ay }, nls.localize(8, null), true);
    const _WRITE_OPTIONS = textModel_1.$RC.register({
        description: 'word-highlight-strong',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlightStrong',
        overviewRuler: {
            color: (0, themeService_1.$hv)(overviewRulerWordHighlightStrongForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.$hv)(colorRegistry_1.$Cy),
            position: model_1.MinimapPosition.Inline
        },
    });
    const _TEXT_OPTIONS = textModel_1.$RC.register({
        description: 'word-highlight-text',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlightText',
        overviewRuler: {
            color: (0, themeService_1.$hv)(overviewRulerWordHighlightTextForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.$hv)(colorRegistry_1.$Cy),
            position: model_1.MinimapPosition.Inline
        },
    });
    const _SELECTION_HIGHLIGHT_OPTIONS = textModel_1.$RC.register({
        description: 'selection-highlight-overview',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'selectionHighlight',
        overviewRuler: {
            color: (0, themeService_1.$hv)(colorRegistry_1.$Ay),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.$hv)(colorRegistry_1.$Cy),
            position: model_1.MinimapPosition.Inline
        },
    });
    const _SELECTION_HIGHLIGHT_OPTIONS_NO_OVERVIEW = textModel_1.$RC.register({
        description: 'selection-highlight',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'selectionHighlight',
    });
    const _REGULAR_OPTIONS = textModel_1.$RC.register({
        description: 'word-highlight',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlight',
        overviewRuler: {
            color: (0, themeService_1.$hv)(overviewRulerWordHighlightForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.$hv)(colorRegistry_1.$Cy),
            position: model_1.MinimapPosition.Inline
        },
    });
    function $59(kind) {
        if (kind === languages_1.DocumentHighlightKind.Write) {
            return _WRITE_OPTIONS;
        }
        else if (kind === languages_1.DocumentHighlightKind.Text) {
            return _TEXT_OPTIONS;
        }
        else {
            return _REGULAR_OPTIONS;
        }
    }
    exports.$59 = $59;
    function $69(hasSemanticHighlights) {
        // Show in overviewRuler only if model has no semantic highlighting
        return (hasSemanticHighlights ? _SELECTION_HIGHLIGHT_OPTIONS_NO_OVERVIEW : _SELECTION_HIGHLIGHT_OPTIONS);
    }
    exports.$69 = $69;
    (0, themeService_1.$mv)((theme, collector) => {
        const selectionHighlight = theme.getColor(colorRegistry_1.$Qw);
        if (selectionHighlight) {
            collector.addRule(`.monaco-editor .selectionHighlight { background-color: ${selectionHighlight.transparent(0.5)}; }`);
        }
    });
});
//# sourceMappingURL=highlightDecorations.js.map