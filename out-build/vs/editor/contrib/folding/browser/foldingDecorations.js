/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/nls!vs/editor/contrib/folding/browser/foldingDecorations", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables"], function (require, exports, codicons_1, model_1, textModel_1, nls_1, colorRegistry_1, iconRegistry_1, themeService_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w8 = exports.$v8 = exports.$u8 = exports.$t8 = exports.$s8 = void 0;
    const foldBackground = (0, colorRegistry_1.$sv)('editor.foldBackground', { light: (0, colorRegistry_1.$1y)(colorRegistry_1.$Nw, 0.3), dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$Nw, 0.3), hcDark: null, hcLight: null }, (0, nls_1.localize)(0, null), true);
    (0, colorRegistry_1.$sv)('editorGutter.foldingControlForeground', { dark: colorRegistry_1.$yv, light: colorRegistry_1.$yv, hcDark: colorRegistry_1.$yv, hcLight: colorRegistry_1.$yv }, (0, nls_1.localize)(1, null));
    exports.$s8 = (0, iconRegistry_1.$9u)('folding-expanded', codicons_1.$Pj.chevronDown, (0, nls_1.localize)(2, null));
    exports.$t8 = (0, iconRegistry_1.$9u)('folding-collapsed', codicons_1.$Pj.chevronRight, (0, nls_1.localize)(3, null));
    exports.$u8 = (0, iconRegistry_1.$9u)('folding-manual-collapsed', exports.$t8, (0, nls_1.localize)(4, null));
    exports.$v8 = (0, iconRegistry_1.$9u)('folding-manual-expanded', exports.$s8, (0, nls_1.localize)(5, null));
    const foldedBackgroundMinimap = { color: (0, themeService_1.$hv)(foldBackground), position: model_1.MinimapPosition.Inline };
    class $w8 {
        static { this.a = textModel_1.$RC.register({
            description: 'folding-collapsed-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.$t8),
        }); }
        static { this.b = textModel_1.$RC.register({
            description: 'folding-collapsed-highlighted-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            className: 'folded-background',
            minimap: foldedBackgroundMinimap,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.$t8)
        }); }
        static { this.c = textModel_1.$RC.register({
            description: 'folding-manually-collapsed-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.$u8)
        }); }
        static { this.d = textModel_1.$RC.register({
            description: 'folding-manually-collapsed-highlighted-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            className: 'folded-background',
            minimap: foldedBackgroundMinimap,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.$u8)
        }); }
        static { this.e = textModel_1.$RC.register({
            description: 'folding-no-controls-range-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            isWholeLine: true
        }); }
        static { this.f = textModel_1.$RC.register({
            description: 'folding-no-controls-range-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            className: 'folded-background',
            minimap: foldedBackgroundMinimap,
            isWholeLine: true
        }); }
        static { this.g = textModel_1.$RC.register({
            description: 'folding-expanded-visual-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: 'alwaysShowFoldIcons ' + themables_1.ThemeIcon.asClassName(exports.$s8)
        }); }
        static { this.h = textModel_1.$RC.register({
            description: 'folding-expanded-auto-hide-visual-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.$s8)
        }); }
        static { this.i = textModel_1.$RC.register({
            description: 'folding-manually-expanded-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: 'alwaysShowFoldIcons ' + themables_1.ThemeIcon.asClassName(exports.$v8)
        }); }
        static { this.j = textModel_1.$RC.register({
            description: 'folding-manually-expanded-auto-hide-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.$v8)
        }); }
        static { this.k = textModel_1.$RC.register({
            description: 'folding-no-controls-range-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            isWholeLine: true
        }); }
        static { this.l = textModel_1.$RC.register({
            description: 'folding-hidden-range-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
        }); }
        constructor(m) {
            this.m = m;
            this.showFoldingControls = 'mouseover';
            this.showFoldingHighlights = true;
        }
        getDecorationOption(isCollapsed, isHidden, isManual) {
            if (isHidden) { // is inside another collapsed region
                return $w8.l;
            }
            if (this.showFoldingControls === 'never') {
                if (isCollapsed) {
                    return this.showFoldingHighlights ? $w8.f : $w8.e;
                }
                return $w8.k;
            }
            if (isCollapsed) {
                return isManual ?
                    (this.showFoldingHighlights ? $w8.d : $w8.c)
                    : (this.showFoldingHighlights ? $w8.b : $w8.a);
            }
            else if (this.showFoldingControls === 'mouseover') {
                return isManual ? $w8.j : $w8.h;
            }
            else {
                return isManual ? $w8.i : $w8.g;
            }
        }
        changeDecorations(callback) {
            return this.m.changeDecorations(callback);
        }
        removeDecorations(decorationIds) {
            this.m.removeDecorations(decorationIds);
        }
    }
    exports.$w8 = $w8;
});
//# sourceMappingURL=foldingDecorations.js.map