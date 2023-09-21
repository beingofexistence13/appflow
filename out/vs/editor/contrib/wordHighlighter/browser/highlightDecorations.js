/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/languages", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./highlightDecorations"], function (require, exports, model_1, textModel_1, languages_1, nls, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSelectionHighlightDecorationOptions = exports.getHighlightDecorationOptions = void 0;
    const wordHighlightBackground = (0, colorRegistry_1.registerColor)('editor.wordHighlightBackground', { dark: '#575757B8', light: '#57575740', hcDark: null, hcLight: null }, nls.localize('wordHighlight', 'Background color of a symbol during read-access, like reading a variable. The color must not be opaque so as not to hide underlying decorations.'), true);
    (0, colorRegistry_1.registerColor)('editor.wordHighlightStrongBackground', { dark: '#004972B8', light: '#0e639c40', hcDark: null, hcLight: null }, nls.localize('wordHighlightStrong', 'Background color of a symbol during write-access, like writing to a variable. The color must not be opaque so as not to hide underlying decorations.'), true);
    (0, colorRegistry_1.registerColor)('editor.wordHighlightTextBackground', { light: wordHighlightBackground, dark: wordHighlightBackground, hcDark: wordHighlightBackground, hcLight: wordHighlightBackground }, nls.localize('wordHighlightText', 'Background color of a textual occurrence for a symbol. The color must not be opaque so as not to hide underlying decorations.'), true);
    const wordHighlightBorder = (0, colorRegistry_1.registerColor)('editor.wordHighlightBorder', { light: null, dark: null, hcDark: colorRegistry_1.activeContrastBorder, hcLight: colorRegistry_1.activeContrastBorder }, nls.localize('wordHighlightBorder', 'Border color of a symbol during read-access, like reading a variable.'));
    (0, colorRegistry_1.registerColor)('editor.wordHighlightStrongBorder', { light: null, dark: null, hcDark: colorRegistry_1.activeContrastBorder, hcLight: colorRegistry_1.activeContrastBorder }, nls.localize('wordHighlightStrongBorder', 'Border color of a symbol during write-access, like writing to a variable.'));
    (0, colorRegistry_1.registerColor)('editor.wordHighlightTextBorder', { light: wordHighlightBorder, dark: wordHighlightBorder, hcDark: wordHighlightBorder, hcLight: wordHighlightBorder }, nls.localize('wordHighlightTextBorder', "Border color of a textual occurrence for a symbol."));
    const overviewRulerWordHighlightForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.wordHighlightForeground', { dark: '#A0A0A0CC', light: '#A0A0A0CC', hcDark: '#A0A0A0CC', hcLight: '#A0A0A0CC' }, nls.localize('overviewRulerWordHighlightForeground', 'Overview ruler marker color for symbol highlights. The color must not be opaque so as not to hide underlying decorations.'), true);
    const overviewRulerWordHighlightStrongForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.wordHighlightStrongForeground', { dark: '#C0A0C0CC', light: '#C0A0C0CC', hcDark: '#C0A0C0CC', hcLight: '#C0A0C0CC' }, nls.localize('overviewRulerWordHighlightStrongForeground', 'Overview ruler marker color for write-access symbol highlights. The color must not be opaque so as not to hide underlying decorations.'), true);
    const overviewRulerWordHighlightTextForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.wordHighlightTextForeground', { dark: colorRegistry_1.overviewRulerSelectionHighlightForeground, light: colorRegistry_1.overviewRulerSelectionHighlightForeground, hcDark: colorRegistry_1.overviewRulerSelectionHighlightForeground, hcLight: colorRegistry_1.overviewRulerSelectionHighlightForeground }, nls.localize('overviewRulerWordHighlightTextForeground', 'Overview ruler marker color of a textual occurrence for a symbol. The color must not be opaque so as not to hide underlying decorations.'), true);
    const _WRITE_OPTIONS = textModel_1.ModelDecorationOptions.register({
        description: 'word-highlight-strong',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlightStrong',
        overviewRuler: {
            color: (0, themeService_1.themeColorFromId)(overviewRulerWordHighlightStrongForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapSelectionOccurrenceHighlight),
            position: model_1.MinimapPosition.Inline
        },
    });
    const _TEXT_OPTIONS = textModel_1.ModelDecorationOptions.register({
        description: 'word-highlight-text',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlightText',
        overviewRuler: {
            color: (0, themeService_1.themeColorFromId)(overviewRulerWordHighlightTextForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapSelectionOccurrenceHighlight),
            position: model_1.MinimapPosition.Inline
        },
    });
    const _SELECTION_HIGHLIGHT_OPTIONS = textModel_1.ModelDecorationOptions.register({
        description: 'selection-highlight-overview',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'selectionHighlight',
        overviewRuler: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.overviewRulerSelectionHighlightForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapSelectionOccurrenceHighlight),
            position: model_1.MinimapPosition.Inline
        },
    });
    const _SELECTION_HIGHLIGHT_OPTIONS_NO_OVERVIEW = textModel_1.ModelDecorationOptions.register({
        description: 'selection-highlight',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'selectionHighlight',
    });
    const _REGULAR_OPTIONS = textModel_1.ModelDecorationOptions.register({
        description: 'word-highlight',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlight',
        overviewRuler: {
            color: (0, themeService_1.themeColorFromId)(overviewRulerWordHighlightForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapSelectionOccurrenceHighlight),
            position: model_1.MinimapPosition.Inline
        },
    });
    function getHighlightDecorationOptions(kind) {
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
    exports.getHighlightDecorationOptions = getHighlightDecorationOptions;
    function getSelectionHighlightDecorationOptions(hasSemanticHighlights) {
        // Show in overviewRuler only if model has no semantic highlighting
        return (hasSemanticHighlights ? _SELECTION_HIGHLIGHT_OPTIONS_NO_OVERVIEW : _SELECTION_HIGHLIGHT_OPTIONS);
    }
    exports.getSelectionHighlightDecorationOptions = getSelectionHighlightDecorationOptions;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const selectionHighlight = theme.getColor(colorRegistry_1.editorSelectionHighlight);
        if (selectionHighlight) {
            collector.addRule(`.monaco-editor .selectionHighlight { background-color: ${selectionHighlight.transparent(0.5)}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaGxpZ2h0RGVjb3JhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi93b3JkSGlnaGxpZ2h0ZXIvYnJvd3Nlci9oaWdobGlnaHREZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBTSx1QkFBdUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsZ0NBQWdDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsa0pBQWtKLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqVixJQUFBLDZCQUFhLEVBQUMsc0NBQXNDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxzSkFBc0osQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pVLElBQUEsNkJBQWEsRUFBQyxvQ0FBb0MsRUFBRSxFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxFQUFFLHVCQUF1QixFQUFFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsK0hBQStILENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwVyxNQUFNLG1CQUFtQixHQUFHLElBQUEsNkJBQWEsRUFBQyw0QkFBNEIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsb0NBQW9CLEVBQUUsT0FBTyxFQUFFLG9DQUFvQixFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSx1RUFBdUUsQ0FBQyxDQUFDLENBQUM7SUFDaFIsSUFBQSw2QkFBYSxFQUFDLGtDQUFrQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxvQ0FBb0IsRUFBRSxPQUFPLEVBQUUsb0NBQW9CLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLDJFQUEyRSxDQUFDLENBQUMsQ0FBQztJQUNwUSxJQUFBLDZCQUFhLEVBQUMsZ0NBQWdDLEVBQUUsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztJQUNyUSxNQUFNLG9DQUFvQyxHQUFHLElBQUEsNkJBQWEsRUFBQyw2Q0FBNkMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLDJIQUEySCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDelgsTUFBTSwwQ0FBMEMsR0FBRyxJQUFBLDZCQUFhLEVBQUMsbURBQW1ELEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0Q0FBNEMsRUFBRSx3SUFBd0ksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3haLE1BQU0sd0NBQXdDLEdBQUcsSUFBQSw2QkFBYSxFQUFDLGlEQUFpRCxFQUFFLEVBQUUsSUFBSSxFQUFFLHlEQUF5QyxFQUFFLEtBQUssRUFBRSx5REFBeUMsRUFBRSxNQUFNLEVBQUUseURBQXlDLEVBQUUsT0FBTyxFQUFFLHlEQUF5QyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQ0FBMEMsRUFBRSwwSUFBMEksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRTVnQixNQUFNLGNBQWMsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7UUFDdEQsV0FBVyxFQUFFLHVCQUF1QjtRQUNwQyxVQUFVLDREQUFvRDtRQUM5RCxTQUFTLEVBQUUscUJBQXFCO1FBQ2hDLGFBQWEsRUFBRTtZQUNkLEtBQUssRUFBRSxJQUFBLCtCQUFnQixFQUFDLDBDQUEwQyxDQUFDO1lBQ25FLFFBQVEsRUFBRSx5QkFBaUIsQ0FBQyxNQUFNO1NBQ2xDO1FBQ0QsT0FBTyxFQUFFO1lBQ1IsS0FBSyxFQUFFLElBQUEsK0JBQWdCLEVBQUMsbURBQW1DLENBQUM7WUFDNUQsUUFBUSxFQUFFLHVCQUFlLENBQUMsTUFBTTtTQUNoQztLQUNELENBQUMsQ0FBQztJQUVILE1BQU0sYUFBYSxHQUFHLGtDQUFzQixDQUFDLFFBQVEsQ0FBQztRQUNyRCxXQUFXLEVBQUUscUJBQXFCO1FBQ2xDLFVBQVUsNERBQW9EO1FBQzlELFNBQVMsRUFBRSxtQkFBbUI7UUFDOUIsYUFBYSxFQUFFO1lBQ2QsS0FBSyxFQUFFLElBQUEsK0JBQWdCLEVBQUMsd0NBQXdDLENBQUM7WUFDakUsUUFBUSxFQUFFLHlCQUFpQixDQUFDLE1BQU07U0FDbEM7UUFDRCxPQUFPLEVBQUU7WUFDUixLQUFLLEVBQUUsSUFBQSwrQkFBZ0IsRUFBQyxtREFBbUMsQ0FBQztZQUM1RCxRQUFRLEVBQUUsdUJBQWUsQ0FBQyxNQUFNO1NBQ2hDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsTUFBTSw0QkFBNEIsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7UUFDcEUsV0FBVyxFQUFFLDhCQUE4QjtRQUMzQyxVQUFVLDREQUFvRDtRQUM5RCxTQUFTLEVBQUUsb0JBQW9CO1FBQy9CLGFBQWEsRUFBRTtZQUNkLEtBQUssRUFBRSxJQUFBLCtCQUFnQixFQUFDLHlEQUF5QyxDQUFDO1lBQ2xFLFFBQVEsRUFBRSx5QkFBaUIsQ0FBQyxNQUFNO1NBQ2xDO1FBQ0QsT0FBTyxFQUFFO1lBQ1IsS0FBSyxFQUFFLElBQUEsK0JBQWdCLEVBQUMsbURBQW1DLENBQUM7WUFDNUQsUUFBUSxFQUFFLHVCQUFlLENBQUMsTUFBTTtTQUNoQztLQUNELENBQUMsQ0FBQztJQUVILE1BQU0sd0NBQXdDLEdBQUcsa0NBQXNCLENBQUMsUUFBUSxDQUFDO1FBQ2hGLFdBQVcsRUFBRSxxQkFBcUI7UUFDbEMsVUFBVSw0REFBb0Q7UUFDOUQsU0FBUyxFQUFFLG9CQUFvQjtLQUMvQixDQUFDLENBQUM7SUFFSCxNQUFNLGdCQUFnQixHQUFHLGtDQUFzQixDQUFDLFFBQVEsQ0FBQztRQUN4RCxXQUFXLEVBQUUsZ0JBQWdCO1FBQzdCLFVBQVUsNERBQW9EO1FBQzlELFNBQVMsRUFBRSxlQUFlO1FBQzFCLGFBQWEsRUFBRTtZQUNkLEtBQUssRUFBRSxJQUFBLCtCQUFnQixFQUFDLG9DQUFvQyxDQUFDO1lBQzdELFFBQVEsRUFBRSx5QkFBaUIsQ0FBQyxNQUFNO1NBQ2xDO1FBQ0QsT0FBTyxFQUFFO1lBQ1IsS0FBSyxFQUFFLElBQUEsK0JBQWdCLEVBQUMsbURBQW1DLENBQUM7WUFDNUQsUUFBUSxFQUFFLHVCQUFlLENBQUMsTUFBTTtTQUNoQztLQUNELENBQUMsQ0FBQztJQUVILFNBQWdCLDZCQUE2QixDQUFDLElBQXVDO1FBQ3BGLElBQUksSUFBSSxLQUFLLGlDQUFxQixDQUFDLEtBQUssRUFBRTtZQUN6QyxPQUFPLGNBQWMsQ0FBQztTQUN0QjthQUFNLElBQUksSUFBSSxLQUFLLGlDQUFxQixDQUFDLElBQUksRUFBRTtZQUMvQyxPQUFPLGFBQWEsQ0FBQztTQUNyQjthQUFNO1lBQ04sT0FBTyxnQkFBZ0IsQ0FBQztTQUN4QjtJQUNGLENBQUM7SUFSRCxzRUFRQztJQUVELFNBQWdCLHNDQUFzQyxDQUFDLHFCQUE4QjtRQUNwRixtRUFBbUU7UUFDbkUsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUMxRyxDQUFDO0lBSEQsd0ZBR0M7SUFFRCxJQUFBLHlDQUEwQixFQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFO1FBQy9DLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0IsQ0FBQyxDQUFDO1FBQ3BFLElBQUksa0JBQWtCLEVBQUU7WUFDdkIsU0FBUyxDQUFDLE9BQU8sQ0FBQywwREFBMEQsa0JBQWtCLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN0SDtJQUNGLENBQUMsQ0FBQyxDQUFDIn0=