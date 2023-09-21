/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables"], function (require, exports, codicons_1, model_1, textModel_1, nls_1, colorRegistry_1, iconRegistry_1, themeService_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FoldingDecorationProvider = exports.foldingManualExpandedIcon = exports.foldingManualCollapsedIcon = exports.foldingCollapsedIcon = exports.foldingExpandedIcon = void 0;
    const foldBackground = (0, colorRegistry_1.registerColor)('editor.foldBackground', { light: (0, colorRegistry_1.transparent)(colorRegistry_1.editorSelectionBackground, 0.3), dark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorSelectionBackground, 0.3), hcDark: null, hcLight: null }, (0, nls_1.localize)('foldBackgroundBackground', "Background color behind folded ranges. The color must not be opaque so as not to hide underlying decorations."), true);
    (0, colorRegistry_1.registerColor)('editorGutter.foldingControlForeground', { dark: colorRegistry_1.iconForeground, light: colorRegistry_1.iconForeground, hcDark: colorRegistry_1.iconForeground, hcLight: colorRegistry_1.iconForeground }, (0, nls_1.localize)('editorGutter.foldingControlForeground', 'Color of the folding control in the editor gutter.'));
    exports.foldingExpandedIcon = (0, iconRegistry_1.registerIcon)('folding-expanded', codicons_1.Codicon.chevronDown, (0, nls_1.localize)('foldingExpandedIcon', 'Icon for expanded ranges in the editor glyph margin.'));
    exports.foldingCollapsedIcon = (0, iconRegistry_1.registerIcon)('folding-collapsed', codicons_1.Codicon.chevronRight, (0, nls_1.localize)('foldingCollapsedIcon', 'Icon for collapsed ranges in the editor glyph margin.'));
    exports.foldingManualCollapsedIcon = (0, iconRegistry_1.registerIcon)('folding-manual-collapsed', exports.foldingCollapsedIcon, (0, nls_1.localize)('foldingManualCollapedIcon', 'Icon for manually collapsed ranges in the editor glyph margin.'));
    exports.foldingManualExpandedIcon = (0, iconRegistry_1.registerIcon)('folding-manual-expanded', exports.foldingExpandedIcon, (0, nls_1.localize)('foldingManualExpandedIcon', 'Icon for manually expanded ranges in the editor glyph margin.'));
    const foldedBackgroundMinimap = { color: (0, themeService_1.themeColorFromId)(foldBackground), position: model_1.MinimapPosition.Inline };
    class FoldingDecorationProvider {
        static { this.COLLAPSED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-collapsed-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingCollapsedIcon),
        }); }
        static { this.COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-collapsed-highlighted-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            className: 'folded-background',
            minimap: foldedBackgroundMinimap,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingCollapsedIcon)
        }); }
        static { this.MANUALLY_COLLAPSED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-manually-collapsed-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingManualCollapsedIcon)
        }); }
        static { this.MANUALLY_COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-manually-collapsed-highlighted-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            className: 'folded-background',
            minimap: foldedBackgroundMinimap,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingManualCollapsedIcon)
        }); }
        static { this.NO_CONTROLS_COLLAPSED_RANGE_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-no-controls-range-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            isWholeLine: true
        }); }
        static { this.NO_CONTROLS_COLLAPSED_HIGHLIGHTED_RANGE_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-no-controls-range-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            className: 'folded-background',
            minimap: foldedBackgroundMinimap,
            isWholeLine: true
        }); }
        static { this.EXPANDED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-expanded-visual-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: 'alwaysShowFoldIcons ' + themables_1.ThemeIcon.asClassName(exports.foldingExpandedIcon)
        }); }
        static { this.EXPANDED_AUTO_HIDE_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-expanded-auto-hide-visual-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingExpandedIcon)
        }); }
        static { this.MANUALLY_EXPANDED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-manually-expanded-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: 'alwaysShowFoldIcons ' + themables_1.ThemeIcon.asClassName(exports.foldingManualExpandedIcon)
        }); }
        static { this.MANUALLY_EXPANDED_AUTO_HIDE_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-manually-expanded-auto-hide-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingManualExpandedIcon)
        }); }
        static { this.NO_CONTROLS_EXPANDED_RANGE_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-no-controls-range-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            isWholeLine: true
        }); }
        static { this.HIDDEN_RANGE_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-hidden-range-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
        }); }
        constructor(editor) {
            this.editor = editor;
            this.showFoldingControls = 'mouseover';
            this.showFoldingHighlights = true;
        }
        getDecorationOption(isCollapsed, isHidden, isManual) {
            if (isHidden) { // is inside another collapsed region
                return FoldingDecorationProvider.HIDDEN_RANGE_DECORATION;
            }
            if (this.showFoldingControls === 'never') {
                if (isCollapsed) {
                    return this.showFoldingHighlights ? FoldingDecorationProvider.NO_CONTROLS_COLLAPSED_HIGHLIGHTED_RANGE_DECORATION : FoldingDecorationProvider.NO_CONTROLS_COLLAPSED_RANGE_DECORATION;
                }
                return FoldingDecorationProvider.NO_CONTROLS_EXPANDED_RANGE_DECORATION;
            }
            if (isCollapsed) {
                return isManual ?
                    (this.showFoldingHighlights ? FoldingDecorationProvider.MANUALLY_COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION : FoldingDecorationProvider.MANUALLY_COLLAPSED_VISUAL_DECORATION)
                    : (this.showFoldingHighlights ? FoldingDecorationProvider.COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION : FoldingDecorationProvider.COLLAPSED_VISUAL_DECORATION);
            }
            else if (this.showFoldingControls === 'mouseover') {
                return isManual ? FoldingDecorationProvider.MANUALLY_EXPANDED_AUTO_HIDE_VISUAL_DECORATION : FoldingDecorationProvider.EXPANDED_AUTO_HIDE_VISUAL_DECORATION;
            }
            else {
                return isManual ? FoldingDecorationProvider.MANUALLY_EXPANDED_VISUAL_DECORATION : FoldingDecorationProvider.EXPANDED_VISUAL_DECORATION;
            }
        }
        changeDecorations(callback) {
            return this.editor.changeDecorations(callback);
        }
        removeDecorations(decorationIds) {
            this.editor.removeDecorations(decorationIds);
        }
    }
    exports.FoldingDecorationProvider = FoldingDecorationProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZ0RlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZm9sZGluZy9icm93c2VyL2ZvbGRpbmdEZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBTSxjQUFjLEdBQUcsSUFBQSw2QkFBYSxFQUFDLHVCQUF1QixFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsMkJBQVcsRUFBQyx5Q0FBeUIsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBQSwyQkFBVyxFQUFDLHlDQUF5QixFQUFFLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLCtHQUErRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDblcsSUFBQSw2QkFBYSxFQUFDLHVDQUF1QyxFQUFFLEVBQUUsSUFBSSxFQUFFLDhCQUFjLEVBQUUsS0FBSyxFQUFFLDhCQUFjLEVBQUUsTUFBTSxFQUFFLDhCQUFjLEVBQUUsT0FBTyxFQUFFLDhCQUFjLEVBQUUsRUFBRSxJQUFBLGNBQVEsRUFBQyx1Q0FBdUMsRUFBRSxvREFBb0QsQ0FBQyxDQUFDLENBQUM7SUFFclAsUUFBQSxtQkFBbUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsa0JBQWtCLEVBQUUsa0JBQU8sQ0FBQyxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUsc0RBQXNELENBQUMsQ0FBQyxDQUFDO0lBQ3JLLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG1CQUFtQixFQUFFLGtCQUFPLENBQUMsWUFBWSxFQUFFLElBQUEsY0FBUSxFQUFDLHNCQUFzQixFQUFFLHVEQUF1RCxDQUFDLENBQUMsQ0FBQztJQUMxSyxRQUFBLDBCQUEw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