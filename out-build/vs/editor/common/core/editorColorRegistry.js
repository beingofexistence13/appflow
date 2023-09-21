/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/common/core/editorColorRegistry", "vs/base/common/color", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, nls, color_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PB = exports.$OB = exports.$NB = exports.$MB = exports.$LB = exports.$KB = exports.$JB = exports.$IB = exports.$HB = exports.$GB = exports.$FB = exports.$EB = exports.$DB = exports.$CB = exports.$BB = exports.$AB = exports.$zB = exports.$yB = exports.$xB = exports.$wB = exports.$vB = exports.$uB = exports.$tB = exports.$sB = exports.$rB = exports.$qB = exports.$pB = exports.$oB = exports.$nB = exports.$mB = exports.$lB = exports.$kB = exports.$jB = exports.$iB = exports.$hB = exports.$gB = exports.$fB = exports.$eB = exports.$dB = exports.$cB = exports.$bB = exports.$aB = exports.$_A = exports.$$A = exports.$0A = exports.$9A = exports.$8A = exports.$7A = exports.$6A = exports.$5A = exports.$4A = exports.$3A = exports.$2A = exports.$1A = exports.$ZA = exports.$YA = exports.$XA = exports.$WA = exports.$VA = exports.$UA = exports.$TA = exports.$SA = exports.$RA = void 0;
    /**
     * Definition of the editor colors
     */
    exports.$RA = (0, colorRegistry_1.$sv)('editor.lineHighlightBackground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(0, null));
    exports.$SA = (0, colorRegistry_1.$sv)('editor.lineHighlightBorder', { dark: '#282828', light: '#eeeeee', hcDark: '#f38518', hcLight: colorRegistry_1.$Av }, nls.localize(1, null));
    exports.$TA = (0, colorRegistry_1.$sv)('editor.rangeHighlightBackground', { dark: '#ffffff0b', light: '#fdff0033', hcDark: null, hcLight: null }, nls.localize(2, null), true);
    exports.$UA = (0, colorRegistry_1.$sv)('editor.rangeHighlightBorder', { dark: null, light: null, hcDark: colorRegistry_1.$Bv, hcLight: colorRegistry_1.$Bv }, nls.localize(3, null), true);
    exports.$VA = (0, colorRegistry_1.$sv)('editor.symbolHighlightBackground', { dark: colorRegistry_1.$Tw, light: colorRegistry_1.$Tw, hcDark: null, hcLight: null }, nls.localize(4, null), true);
    exports.$WA = (0, colorRegistry_1.$sv)('editor.symbolHighlightBorder', { dark: null, light: null, hcDark: colorRegistry_1.$Bv, hcLight: colorRegistry_1.$Bv }, nls.localize(5, null), true);
    exports.$XA = (0, colorRegistry_1.$sv)('editorCursor.foreground', { dark: '#AEAFAD', light: color_1.$Os.black, hcDark: color_1.$Os.white, hcLight: '#0F4A85' }, nls.localize(6, null));
    exports.$YA = (0, colorRegistry_1.$sv)('editorCursor.background', null, nls.localize(7, null));
    exports.$ZA = (0, colorRegistry_1.$sv)('editorWhitespace.foreground', { dark: '#e3e4e229', light: '#33333333', hcDark: '#e3e4e229', hcLight: '#CCCCCC' }, nls.localize(8, null));
    exports.$1A = (0, colorRegistry_1.$sv)('editorLineNumber.foreground', { dark: '#858585', light: '#237893', hcDark: color_1.$Os.white, hcLight: '#292929' }, nls.localize(9, null));
    exports.$2A = (0, colorRegistry_1.$sv)('editorIndentGuide.background', { dark: exports.$ZA, light: exports.$ZA, hcDark: exports.$ZA, hcLight: exports.$ZA }, nls.localize(10, null), false, nls.localize(11, null));
    exports.$3A = (0, colorRegistry_1.$sv)('editorIndentGuide.activeBackground', { dark: exports.$ZA, light: exports.$ZA, hcDark: exports.$ZA, hcLight: exports.$ZA }, nls.localize(12, null), false, nls.localize(13, null));
    exports.$4A = (0, colorRegistry_1.$sv)('editorIndentGuide.background1', { dark: exports.$2A, light: exports.$2A, hcDark: exports.$2A, hcLight: exports.$2A }, nls.localize(14, null));
    exports.$5A = (0, colorRegistry_1.$sv)('editorIndentGuide.background2', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(15, null));
    exports.$6A = (0, colorRegistry_1.$sv)('editorIndentGuide.background3', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(16, null));
    exports.$7A = (0, colorRegistry_1.$sv)('editorIndentGuide.background4', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(17, null));
    exports.$8A = (0, colorRegistry_1.$sv)('editorIndentGuide.background5', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(18, null));
    exports.$9A = (0, colorRegistry_1.$sv)('editorIndentGuide.background6', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(19, null));
    exports.$0A = (0, colorRegistry_1.$sv)('editorIndentGuide.activeBackground1', { dark: exports.$3A, light: exports.$3A, hcDark: exports.$3A, hcLight: exports.$3A }, nls.localize(20, null));
    exports.$$A = (0, colorRegistry_1.$sv)('editorIndentGuide.activeBackground2', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(21, null));
    exports.$_A = (0, colorRegistry_1.$sv)('editorIndentGuide.activeBackground3', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(22, null));
    exports.$aB = (0, colorRegistry_1.$sv)('editorIndentGuide.activeBackground4', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(23, null));
    exports.$bB = (0, colorRegistry_1.$sv)('editorIndentGuide.activeBackground5', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(24, null));
    exports.$cB = (0, colorRegistry_1.$sv)('editorIndentGuide.activeBackground6', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(25, null));
    const deprecatedEditorActiveLineNumber = (0, colorRegistry_1.$sv)('editorActiveLineNumber.foreground', { dark: '#c6c6c6', light: '#0B216F', hcDark: colorRegistry_1.$Bv, hcLight: colorRegistry_1.$Bv }, nls.localize(26, null), false, nls.localize(27, null));
    exports.$dB = (0, colorRegistry_1.$sv)('editorLineNumber.activeForeground', { dark: deprecatedEditorActiveLineNumber, light: deprecatedEditorActiveLineNumber, hcDark: deprecatedEditorActiveLineNumber, hcLight: deprecatedEditorActiveLineNumber }, nls.localize(28, null));
    exports.$eB = (0, colorRegistry_1.$sv)('editorLineNumber.dimmedForeground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(29, null));
    exports.$fB = (0, colorRegistry_1.$sv)('editorRuler.foreground', { dark: '#5A5A5A', light: color_1.$Os.lightgrey, hcDark: color_1.$Os.white, hcLight: '#292929' }, nls.localize(30, null));
    exports.$gB = (0, colorRegistry_1.$sv)('editorCodeLens.foreground', { dark: '#999999', light: '#919191', hcDark: '#999999', hcLight: '#292929' }, nls.localize(31, null));
    exports.$hB = (0, colorRegistry_1.$sv)('editorBracketMatch.background', { dark: '#0064001a', light: '#0064001a', hcDark: '#0064001a', hcLight: '#0000' }, nls.localize(32, null));
    exports.$iB = (0, colorRegistry_1.$sv)('editorBracketMatch.border', { dark: '#888', light: '#B9B9B9', hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, nls.localize(33, null));
    exports.$jB = (0, colorRegistry_1.$sv)('editorOverviewRuler.border', { dark: '#7f7f7f4d', light: '#7f7f7f4d', hcDark: '#7f7f7f4d', hcLight: '#666666' }, nls.localize(34, null));
    exports.$kB = (0, colorRegistry_1.$sv)('editorOverviewRuler.background', null, nls.localize(35, null));
    exports.$lB = (0, colorRegistry_1.$sv)('editorGutter.background', { dark: colorRegistry_1.$ww, light: colorRegistry_1.$ww, hcDark: colorRegistry_1.$ww, hcLight: colorRegistry_1.$ww }, nls.localize(36, null));
    exports.$mB = (0, colorRegistry_1.$sv)('editorUnnecessaryCode.border', { dark: null, light: null, hcDark: color_1.$Os.fromHex('#fff').transparent(0.8), hcLight: colorRegistry_1.$Av }, nls.localize(37, null));
    exports.$nB = (0, colorRegistry_1.$sv)('editorUnnecessaryCode.opacity', { dark: color_1.$Os.fromHex('#000a'), light: color_1.$Os.fromHex('#0007'), hcDark: null, hcLight: null }, nls.localize(38, null));
    exports.$oB = (0, colorRegistry_1.$sv)('editorGhostText.border', { dark: null, light: null, hcDark: color_1.$Os.fromHex('#fff').transparent(0.8), hcLight: color_1.$Os.fromHex('#292929').transparent(0.8) }, nls.localize(39, null));
    exports.$pB = (0, colorRegistry_1.$sv)('editorGhostText.foreground', { dark: color_1.$Os.fromHex('#ffffff56'), light: color_1.$Os.fromHex('#0007'), hcDark: null, hcLight: null }, nls.localize(40, null));
    exports.$qB = (0, colorRegistry_1.$sv)('editorGhostText.background', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(41, null));
    const rulerRangeDefault = new color_1.$Os(new color_1.$Ls(0, 122, 204, 0.6));
    exports.$rB = (0, colorRegistry_1.$sv)('editorOverviewRuler.rangeHighlightForeground', { dark: rulerRangeDefault, light: rulerRangeDefault, hcDark: rulerRangeDefault, hcLight: rulerRangeDefault }, nls.localize(42, null), true);
    exports.$sB = (0, colorRegistry_1.$sv)('editorOverviewRuler.errorForeground', { dark: new color_1.$Os(new color_1.$Ls(255, 18, 18, 0.7)), light: new color_1.$Os(new color_1.$Ls(255, 18, 18, 0.7)), hcDark: new color_1.$Os(new color_1.$Ls(255, 50, 50, 1)), hcLight: '#B5200D' }, nls.localize(43, null));
    exports.$tB = (0, colorRegistry_1.$sv)('editorOverviewRuler.warningForeground', { dark: colorRegistry_1.$ow, light: colorRegistry_1.$ow, hcDark: colorRegistry_1.$pw, hcLight: colorRegistry_1.$pw }, nls.localize(44, null));
    exports.$uB = (0, colorRegistry_1.$sv)('editorOverviewRuler.infoForeground', { dark: colorRegistry_1.$rw, light: colorRegistry_1.$rw, hcDark: colorRegistry_1.$sw, hcLight: colorRegistry_1.$sw }, nls.localize(45, null));
    exports.$vB = (0, colorRegistry_1.$sv)('editorBracketHighlight.foreground1', { dark: '#FFD700', light: '#0431FAFF', hcDark: '#FFD700', hcLight: '#0431FAFF' }, nls.localize(46, null));
    exports.$wB = (0, colorRegistry_1.$sv)('editorBracketHighlight.foreground2', { dark: '#DA70D6', light: '#319331FF', hcDark: '#DA70D6', hcLight: '#319331FF' }, nls.localize(47, null));
    exports.$xB = (0, colorRegistry_1.$sv)('editorBracketHighlight.foreground3', { dark: '#179FFF', light: '#7B3814FF', hcDark: '#87CEFA', hcLight: '#7B3814FF' }, nls.localize(48, null));
    exports.$yB = (0, colorRegistry_1.$sv)('editorBracketHighlight.foreground4', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(49, null));
    exports.$zB = (0, colorRegistry_1.$sv)('editorBracketHighlight.foreground5', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(50, null));
    exports.$AB = (0, colorRegistry_1.$sv)('editorBracketHighlight.foreground6', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(51, null));
    exports.$BB = (0, colorRegistry_1.$sv)('editorBracketHighlight.unexpectedBracket.foreground', { dark: new color_1.$Os(new color_1.$Ls(255, 18, 18, 0.8)), light: new color_1.$Os(new color_1.$Ls(255, 18, 18, 0.8)), hcDark: new color_1.$Os(new color_1.$Ls(255, 50, 50, 1)), hcLight: '' }, nls.localize(52, null));
    exports.$CB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.background1', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(53, null));
    exports.$DB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.background2', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(54, null));
    exports.$EB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.background3', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(55, null));
    exports.$FB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.background4', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(56, null));
    exports.$GB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.background5', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(57, null));
    exports.$HB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.background6', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(58, null));
    exports.$IB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.activeBackground1', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(59, null));
    exports.$JB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.activeBackground2', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(60, null));
    exports.$KB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.activeBackground3', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(61, null));
    exports.$LB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.activeBackground4', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(62, null));
    exports.$MB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.activeBackground5', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(63, null));
    exports.$NB = (0, colorRegistry_1.$sv)('editorBracketPairGuide.activeBackground6', { dark: '#00000000', light: '#00000000', hcDark: '#00000000', hcLight: '#00000000' }, nls.localize(64, null));
    exports.$OB = (0, colorRegistry_1.$sv)('editorUnicodeHighlight.border', { dark: '#BD9B03', light: '#CEA33D', hcDark: '#ff0000', hcLight: '#CEA33D' }, nls.localize(65, null));
    exports.$PB = (0, colorRegistry_1.$sv)('editorUnicodeHighlight.background', { dark: '#bd9b0326', light: '#cea33d14', hcDark: '#00000000', hcLight: '#cea33d14' }, nls.localize(66, null));
    // contains all color rules that used to defined in editor/browser/widget/editor.css
    (0, themeService_1.$mv)((theme, collector) => {
        const background = theme.getColor(colorRegistry_1.$ww);
        const lineHighlight = theme.getColor(exports.$RA);
        const imeBackground = (lineHighlight && !lineHighlight.isTransparent() ? lineHighlight : background);
        if (imeBackground) {
            collector.addRule(`.monaco-editor .inputarea.ime-input { background-color: ${imeBackground}; }`);
        }
    });
});
//# sourceMappingURL=editorColorRegistry.js.map