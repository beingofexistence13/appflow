/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/color", "vs/base/common/event", "vs/base/common/assert", "vs/nls!vs/platform/theme/common/colorRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform"], function (require, exports, async_1, color_1, event_1, assert_1, nls, jsonContributionRegistry_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6y = exports.$5y = exports.$4y = exports.$3y = exports.$2y = exports.$1y = exports.$Zy = exports.$Yy = exports.$Xy = exports.$Wy = exports.$Vy = exports.$Uy = exports.$Ty = exports.$Sy = exports.$Ry = exports.$Qy = exports.$Py = exports.$Oy = exports.$Ny = exports.$My = exports.$Ly = exports.$Ky = exports.$Jy = exports.$Iy = exports.$Hy = exports.$Gy = exports.$Fy = exports.$Ey = exports.$Dy = exports.$Cy = exports.$By = exports.$Ay = exports.$zy = exports.$yy = exports.$xy = exports.$wy = exports.$vy = exports.$uy = exports.$ty = exports.$sy = exports.$ry = exports.$qy = exports.$py = exports.$oy = exports.$ny = exports.$my = exports.$ly = exports.$ky = exports.$jy = exports.$iy = exports.$hy = exports.$gy = exports.$fy = exports.$ey = exports.$dy = exports.$cy = exports.$by = exports.$ay = exports.$_x = exports.$$x = exports.$0x = exports.$9x = exports.$8x = exports.$7x = exports.$6x = exports.$5x = exports.$4x = exports.$3x = exports.$2x = exports.$1x = exports.$Zx = exports.$Yx = exports.$Xx = exports.$Wx = exports.$Vx = exports.$Ux = exports.$Tx = exports.$Sx = exports.$Rx = exports.$Qx = exports.$Px = exports.$Ox = exports.$Nx = exports.$Mx = exports.$Lx = exports.$Kx = exports.$Jx = exports.$Ix = exports.$Hx = exports.$Gx = exports.$Fx = exports.$Ex = exports.$Dx = exports.$Cx = exports.$Bx = exports.$Ax = exports.$zx = exports.$yx = exports.$xx = exports.$wx = exports.$vx = exports.$ux = exports.$tx = exports.$sx = exports.$rx = exports.$qx = exports.$px = exports.$ox = exports.$nx = exports.$mx = exports.$lx = exports.$kx = exports.$jx = exports.$ix = exports.$hx = exports.$gx = exports.$fx = exports.$ex = exports.$dx = exports.$cx = exports.$bx = exports.$ax = exports.$_w = exports.$$w = exports.$0w = exports.$9w = exports.$8w = exports.$7w = exports.$6w = exports.$5w = exports.$4w = exports.$3w = exports.$2w = exports.$1w = exports.$Zw = exports.$Yw = exports.$Xw = exports.$Ww = exports.$Vw = exports.$Uw = exports.$Tw = exports.$Sw = exports.$Rw = exports.$Qw = exports.$Pw = exports.$Ow = exports.$Nw = exports.$Mw = exports.$Lw = exports.$Kw = exports.$Jw = exports.$Iw = exports.$Hw = exports.$Gw = exports.$Fw = exports.$Ew = exports.$Dw = exports.$Cw = exports.$Bw = exports.$Aw = exports.$zw = exports.$yw = exports.$xw = exports.$ww = exports.$vw = exports.$uw = exports.$tw = exports.$sw = exports.$rw = exports.$qw = exports.$pw = exports.$ow = exports.$nw = exports.$mw = exports.$lw = exports.$kw = exports.$jw = exports.$iw = exports.$hw = exports.$gw = exports.$fw = exports.$ew = exports.$dw = exports.$cw = exports.$bw = exports.$aw = exports.$_v = exports.$$v = exports.$0v = exports.$9v = exports.$8v = exports.$7v = exports.$6v = exports.$5v = exports.$4v = exports.$3v = exports.$2v = exports.$1v = exports.$Zv = exports.$Yv = exports.$Xv = exports.$Wv = exports.$Vv = exports.$Uv = exports.$Tv = exports.$Sv = exports.$Rv = exports.$Qv = exports.$Pv = exports.$Ov = exports.$Nv = exports.$Mv = exports.$Lv = exports.$Kv = exports.$Jv = exports.$Iv = exports.$Hv = exports.$Gv = exports.$Fv = exports.$Ev = exports.$Dv = exports.$Cv = exports.$Bv = exports.$Av = exports.$zv = exports.$yv = exports.$xv = exports.$wv = exports.$vv = exports.$uv = exports.$tv = exports.$sv = exports.$rv = exports.ColorTransformType = exports.$qv = exports.$pv = exports.$ov = void 0;
    /**
     * Returns the css variable name for the given color identifier. Dots (`.`) are replaced with hyphens (`-`) and
     * everything is prefixed with `--vscode-`.
     *
     * @sample `editorSuggestWidget.background` is `--vscode-editorSuggestWidget-background`.
     */
    function $ov(colorIdent) {
        return `--vscode-${colorIdent.replace(/\./g, '-')}`;
    }
    exports.$ov = $ov;
    function $pv(color) {
        return `var(${$ov(color)})`;
    }
    exports.$pv = $pv;
    function $qv(color, defaultCssValue) {
        return `var(${$ov(color)}, ${defaultCssValue})`;
    }
    exports.$qv = $qv;
    var ColorTransformType;
    (function (ColorTransformType) {
        ColorTransformType[ColorTransformType["Darken"] = 0] = "Darken";
        ColorTransformType[ColorTransformType["Lighten"] = 1] = "Lighten";
        ColorTransformType[ColorTransformType["Transparent"] = 2] = "Transparent";
        ColorTransformType[ColorTransformType["Opaque"] = 3] = "Opaque";
        ColorTransformType[ColorTransformType["OneOf"] = 4] = "OneOf";
        ColorTransformType[ColorTransformType["LessProminent"] = 5] = "LessProminent";
        ColorTransformType[ColorTransformType["IfDefinedThenElse"] = 6] = "IfDefinedThenElse";
    })(ColorTransformType || (exports.ColorTransformType = ColorTransformType = {}));
    // color registry
    exports.$rv = {
        ColorContribution: 'base.contributions.colors'
    };
    class ColorRegistry {
        constructor() {
            this.c = new event_1.$fd();
            this.onDidChangeSchema = this.c.event;
            this.e = { type: 'object', properties: {} };
            this.f = { type: 'string', enum: [], enumDescriptions: [] };
            this.d = {};
        }
        registerColor(id, defaults, description, needsTransparency = false, deprecationMessage) {
            const colorContribution = { id, description, defaults, needsTransparency, deprecationMessage };
            this.d[id] = colorContribution;
            const propertySchema = { type: 'string', description, format: 'color-hex', defaultSnippets: [{ body: '${1:#ff0000}' }] };
            if (deprecationMessage) {
                propertySchema.deprecationMessage = deprecationMessage;
            }
            this.e.properties[id] = propertySchema;
            this.f.enum.push(id);
            this.f.enumDescriptions.push(description);
            this.c.fire();
            return id;
        }
        deregisterColor(id) {
            delete this.d[id];
            delete this.e.properties[id];
            const index = this.f.enum.indexOf(id);
            if (index !== -1) {
                this.f.enum.splice(index, 1);
                this.f.enumDescriptions.splice(index, 1);
            }
            this.c.fire();
        }
        getColors() {
            return Object.keys(this.d).map(id => this.d[id]);
        }
        resolveDefaultColor(id, theme) {
            const colorDesc = this.d[id];
            if (colorDesc && colorDesc.defaults) {
                const colorValue = colorDesc.defaults[theme.type];
                return $5y(colorValue, theme);
            }
            return undefined;
        }
        getColorSchema() {
            return this.e;
        }
        getColorReferenceSchema() {
            return this.f;
        }
        toString() {
            const sorter = (a, b) => {
                const cat1 = a.indexOf('.') === -1 ? 0 : 1;
                const cat2 = b.indexOf('.') === -1 ? 0 : 1;
                if (cat1 !== cat2) {
                    return cat1 - cat2;
                }
                return a.localeCompare(b);
            };
            return Object.keys(this.d).sort(sorter).map(k => `- \`${k}\`: ${this.d[k].description}`).join('\n');
        }
    }
    const colorRegistry = new ColorRegistry();
    platform.$8m.add(exports.$rv.ColorContribution, colorRegistry);
    function $sv(id, defaults, description, needsTransparency, deprecationMessage) {
        return colorRegistry.registerColor(id, defaults, description, needsTransparency, deprecationMessage);
    }
    exports.$sv = $sv;
    function $tv() {
        return colorRegistry;
    }
    exports.$tv = $tv;
    // ----- base colors
    exports.$uv = $sv('foreground', { dark: '#CCCCCC', light: '#616161', hcDark: '#FFFFFF', hcLight: '#292929' }, nls.localize(0, null));
    exports.$vv = $sv('disabledForeground', { dark: '#CCCCCC80', light: '#61616180', hcDark: '#A5A5A5', hcLight: '#7F7F7F' }, nls.localize(1, null));
    exports.$wv = $sv('errorForeground', { dark: '#F48771', light: '#A1260D', hcDark: '#F48771', hcLight: '#B5200D' }, nls.localize(2, null));
    exports.$xv = $sv('descriptionForeground', { light: '#717171', dark: $1y(exports.$uv, 0.7), hcDark: $1y(exports.$uv, 0.7), hcLight: $1y(exports.$uv, 0.7) }, nls.localize(3, null));
    exports.$yv = $sv('icon.foreground', { dark: '#C5C5C5', light: '#424242', hcDark: '#FFFFFF', hcLight: '#292929' }, nls.localize(4, null));
    exports.$zv = $sv('focusBorder', { dark: '#007FD4', light: '#0090F1', hcDark: '#F38518', hcLight: '#006BBD' }, nls.localize(5, null));
    exports.$Av = $sv('contrastBorder', { light: null, dark: null, hcDark: '#6FC3DF', hcLight: '#0F4A85' }, nls.localize(6, null));
    exports.$Bv = $sv('contrastActiveBorder', { light: null, dark: null, hcDark: exports.$zv, hcLight: exports.$zv }, nls.localize(7, null));
    exports.$Cv = $sv('selection.background', { light: null, dark: null, hcDark: null, hcLight: null }, nls.localize(8, null));
    // ------ text colors
    exports.$Dv = $sv('textSeparator.foreground', { light: '#0000002e', dark: '#ffffff2e', hcDark: color_1.$Os.black, hcLight: '#292929' }, nls.localize(9, null));
    exports.$Ev = $sv('textLink.foreground', { light: '#006AB1', dark: '#3794FF', hcDark: '#3794FF', hcLight: '#0F4A85' }, nls.localize(10, null));
    exports.$Fv = $sv('textLink.activeForeground', { light: '#006AB1', dark: '#3794FF', hcDark: '#3794FF', hcLight: '#0F4A85' }, nls.localize(11, null));
    exports.$Gv = $sv('textPreformat.foreground', { light: '#A31515', dark: '#D7BA7D', hcDark: '#D7BA7D', hcLight: '#292929' }, nls.localize(12, null));
    exports.$Hv = $sv('textBlockQuote.background', { light: '#7f7f7f1a', dark: '#7f7f7f1a', hcDark: null, hcLight: '#F2F2F2' }, nls.localize(13, null));
    exports.$Iv = $sv('textBlockQuote.border', { light: '#007acc80', dark: '#007acc80', hcDark: color_1.$Os.white, hcLight: '#292929' }, nls.localize(14, null));
    exports.$Jv = $sv('textCodeBlock.background', { light: '#dcdcdc66', dark: '#0a0a0a66', hcDark: color_1.$Os.black, hcLight: '#F2F2F2' }, nls.localize(15, null));
    // ----- widgets
    exports.$Kv = $sv('widget.shadow', { dark: $1y(color_1.$Os.black, .36), light: $1y(color_1.$Os.black, .16), hcDark: null, hcLight: null }, nls.localize(16, null));
    exports.$Lv = $sv('widget.border', { dark: null, light: null, hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(17, null));
    exports.$Mv = $sv('input.background', { dark: '#3C3C3C', light: color_1.$Os.white, hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(18, null));
    exports.$Nv = $sv('input.foreground', { dark: exports.$uv, light: exports.$uv, hcDark: exports.$uv, hcLight: exports.$uv }, nls.localize(19, null));
    exports.$Ov = $sv('input.border', { dark: null, light: null, hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(20, null));
    exports.$Pv = $sv('inputOption.activeBorder', { dark: '#007ACC', light: '#007ACC', hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(21, null));
    exports.$Qv = $sv('inputOption.hoverBackground', { dark: '#5a5d5e80', light: '#b8b8b850', hcDark: null, hcLight: null }, nls.localize(22, null));
    exports.$Rv = $sv('inputOption.activeBackground', { dark: $1y(exports.$zv, 0.4), light: $1y(exports.$zv, 0.2), hcDark: color_1.$Os.transparent, hcLight: color_1.$Os.transparent }, nls.localize(23, null));
    exports.$Sv = $sv('inputOption.activeForeground', { dark: color_1.$Os.white, light: color_1.$Os.black, hcDark: exports.$uv, hcLight: exports.$uv }, nls.localize(24, null));
    exports.$Tv = $sv('input.placeholderForeground', { light: $1y(exports.$uv, 0.5), dark: $1y(exports.$uv, 0.5), hcDark: $1y(exports.$uv, 0.7), hcLight: $1y(exports.$uv, 0.7) }, nls.localize(25, null));
    exports.$Uv = $sv('inputValidation.infoBackground', { dark: '#063B49', light: '#D6ECF2', hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(26, null));
    exports.$Vv = $sv('inputValidation.infoForeground', { dark: null, light: null, hcDark: null, hcLight: exports.$uv }, nls.localize(27, null));
    exports.$Wv = $sv('inputValidation.infoBorder', { dark: '#007acc', light: '#007acc', hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(28, null));
    exports.$Xv = $sv('inputValidation.warningBackground', { dark: '#352A05', light: '#F6F5D2', hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(29, null));
    exports.$Yv = $sv('inputValidation.warningForeground', { dark: null, light: null, hcDark: null, hcLight: exports.$uv }, nls.localize(30, null));
    exports.$Zv = $sv('inputValidation.warningBorder', { dark: '#B89500', light: '#B89500', hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(31, null));
    exports.$1v = $sv('inputValidation.errorBackground', { dark: '#5A1D1D', light: '#F2DEDE', hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(32, null));
    exports.$2v = $sv('inputValidation.errorForeground', { dark: null, light: null, hcDark: null, hcLight: exports.$uv }, nls.localize(33, null));
    exports.$3v = $sv('inputValidation.errorBorder', { dark: '#BE1100', light: '#BE1100', hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(34, null));
    exports.$4v = $sv('dropdown.background', { dark: '#3C3C3C', light: color_1.$Os.white, hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(35, null));
    exports.$5v = $sv('dropdown.listBackground', { dark: null, light: null, hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(36, null));
    exports.$6v = $sv('dropdown.foreground', { dark: '#F0F0F0', light: exports.$uv, hcDark: color_1.$Os.white, hcLight: exports.$uv }, nls.localize(37, null));
    exports.$7v = $sv('dropdown.border', { dark: exports.$4v, light: '#CECECE', hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(38, null));
    exports.$8v = $sv('button.foreground', { dark: color_1.$Os.white, light: color_1.$Os.white, hcDark: color_1.$Os.white, hcLight: color_1.$Os.white }, nls.localize(39, null));
    exports.$9v = $sv('button.separator', { dark: $1y(exports.$8v, .4), light: $1y(exports.$8v, .4), hcDark: $1y(exports.$8v, .4), hcLight: $1y(exports.$8v, .4) }, nls.localize(40, null));
    exports.$0v = $sv('button.background', { dark: '#0E639C', light: '#007ACC', hcDark: null, hcLight: '#0F4A85' }, nls.localize(41, null));
    exports.$$v = $sv('button.hoverBackground', { dark: $Zy(exports.$0v, 0.2), light: $Yy(exports.$0v, 0.2), hcDark: exports.$0v, hcLight: exports.$0v }, nls.localize(42, null));
    exports.$_v = $sv('button.border', { dark: exports.$Av, light: exports.$Av, hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(43, null));
    exports.$aw = $sv('button.secondaryForeground', { dark: color_1.$Os.white, light: color_1.$Os.white, hcDark: color_1.$Os.white, hcLight: exports.$uv }, nls.localize(44, null));
    exports.$bw = $sv('button.secondaryBackground', { dark: '#3A3D41', light: '#5F6A79', hcDark: null, hcLight: color_1.$Os.white }, nls.localize(45, null));
    exports.$cw = $sv('button.secondaryHoverBackground', { dark: $Zy(exports.$bw, 0.2), light: $Yy(exports.$bw, 0.2), hcDark: null, hcLight: null }, nls.localize(46, null));
    exports.$dw = $sv('badge.background', { dark: '#4D4D4D', light: '#C4C4C4', hcDark: color_1.$Os.black, hcLight: '#0F4A85' }, nls.localize(47, null));
    exports.$ew = $sv('badge.foreground', { dark: color_1.$Os.white, light: '#333', hcDark: color_1.$Os.white, hcLight: color_1.$Os.white }, nls.localize(48, null));
    exports.$fw = $sv('scrollbar.shadow', { dark: '#000000', light: '#DDDDDD', hcDark: null, hcLight: null }, nls.localize(49, null));
    exports.$gw = $sv('scrollbarSlider.background', { dark: color_1.$Os.fromHex('#797979').transparent(0.4), light: color_1.$Os.fromHex('#646464').transparent(0.4), hcDark: $1y(exports.$Av, 0.6), hcLight: $1y(exports.$Av, 0.4) }, nls.localize(50, null));
    exports.$hw = $sv('scrollbarSlider.hoverBackground', { dark: color_1.$Os.fromHex('#646464').transparent(0.7), light: color_1.$Os.fromHex('#646464').transparent(0.7), hcDark: $1y(exports.$Av, 0.8), hcLight: $1y(exports.$Av, 0.8) }, nls.localize(51, null));
    exports.$iw = $sv('scrollbarSlider.activeBackground', { dark: color_1.$Os.fromHex('#BFBFBF').transparent(0.4), light: color_1.$Os.fromHex('#000000').transparent(0.6), hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(52, null));
    exports.$jw = $sv('progressBar.background', { dark: color_1.$Os.fromHex('#0E70C0'), light: color_1.$Os.fromHex('#0E70C0'), hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(53, null));
    exports.$kw = $sv('editorError.background', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(54, null), true);
    exports.$lw = $sv('editorError.foreground', { dark: '#F14C4C', light: '#E51400', hcDark: '#F48771', hcLight: '#B5200D' }, nls.localize(55, null));
    exports.$mw = $sv('editorError.border', { dark: null, light: null, hcDark: color_1.$Os.fromHex('#E47777').transparent(0.8), hcLight: '#B5200D' }, nls.localize(56, null));
    exports.$nw = $sv('editorWarning.background', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(57, null), true);
    exports.$ow = $sv('editorWarning.foreground', { dark: '#CCA700', light: '#BF8803', hcDark: '#FFD370', hcLight: '#895503' }, nls.localize(58, null));
    exports.$pw = $sv('editorWarning.border', { dark: null, light: null, hcDark: color_1.$Os.fromHex('#FFCC00').transparent(0.8), hcLight: color_1.$Os.fromHex('#FFCC00').transparent(0.8) }, nls.localize(59, null));
    exports.$qw = $sv('editorInfo.background', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(60, null), true);
    exports.$rw = $sv('editorInfo.foreground', { dark: '#3794FF', light: '#1a85ff', hcDark: '#3794FF', hcLight: '#1a85ff' }, nls.localize(61, null));
    exports.$sw = $sv('editorInfo.border', { dark: null, light: null, hcDark: color_1.$Os.fromHex('#3794FF').transparent(0.8), hcLight: '#292929' }, nls.localize(62, null));
    exports.$tw = $sv('editorHint.foreground', { dark: color_1.$Os.fromHex('#eeeeee').transparent(0.7), light: '#6c6c6c', hcDark: null, hcLight: null }, nls.localize(63, null));
    exports.$uw = $sv('editorHint.border', { dark: null, light: null, hcDark: color_1.$Os.fromHex('#eeeeee').transparent(0.8), hcLight: '#292929' }, nls.localize(64, null));
    exports.$vw = $sv('sash.hoverBorder', { dark: exports.$zv, light: exports.$zv, hcDark: exports.$zv, hcLight: exports.$zv }, nls.localize(65, null));
    /**
     * Editor background color.
     */
    exports.$ww = $sv('editor.background', { light: '#ffffff', dark: '#1E1E1E', hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(66, null));
    /**
     * Editor foreground color.
     */
    exports.$xw = $sv('editor.foreground', { light: '#333333', dark: '#BBBBBB', hcDark: color_1.$Os.white, hcLight: exports.$uv }, nls.localize(67, null));
    /**
     * Sticky scroll
     */
    exports.$yw = $sv('editorStickyScroll.background', { light: exports.$ww, dark: exports.$ww, hcDark: exports.$ww, hcLight: exports.$ww }, nls.localize(68, null));
    exports.$zw = $sv('editorStickyScrollHover.background', { dark: '#2A2D2E', light: '#F0F0F0', hcDark: null, hcLight: color_1.$Os.fromHex('#0F4A85').transparent(0.1) }, nls.localize(69, null));
    /**
     * Editor widgets
     */
    exports.$Aw = $sv('editorWidget.background', { dark: '#252526', light: '#F3F3F3', hcDark: '#0C141F', hcLight: color_1.$Os.white }, nls.localize(70, null));
    exports.$Bw = $sv('editorWidget.foreground', { dark: exports.$uv, light: exports.$uv, hcDark: exports.$uv, hcLight: exports.$uv }, nls.localize(71, null));
    exports.$Cw = $sv('editorWidget.border', { dark: '#454545', light: '#C8C8C8', hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(72, null));
    exports.$Dw = $sv('editorWidget.resizeBorder', { light: null, dark: null, hcDark: null, hcLight: null }, nls.localize(73, null));
    /**
     * Quick pick widget
     */
    exports.$Ew = $sv('quickInput.background', { dark: exports.$Aw, light: exports.$Aw, hcDark: exports.$Aw, hcLight: exports.$Aw }, nls.localize(74, null));
    exports.$Fw = $sv('quickInput.foreground', { dark: exports.$Bw, light: exports.$Bw, hcDark: exports.$Bw, hcLight: exports.$Bw }, nls.localize(75, null));
    exports.$Gw = $sv('quickInputTitle.background', { dark: new color_1.$Os(new color_1.$Ls(255, 255, 255, 0.105)), light: new color_1.$Os(new color_1.$Ls(0, 0, 0, 0.06)), hcDark: '#000000', hcLight: color_1.$Os.white }, nls.localize(76, null));
    exports.$Hw = $sv('pickerGroup.foreground', { dark: '#3794FF', light: '#0066BF', hcDark: color_1.$Os.white, hcLight: '#0F4A85' }, nls.localize(77, null));
    exports.$Iw = $sv('pickerGroup.border', { dark: '#3F3F46', light: '#CCCEDB', hcDark: color_1.$Os.white, hcLight: '#0F4A85' }, nls.localize(78, null));
    /**
     * Keybinding label
     */
    exports.$Jw = $sv('keybindingLabel.background', { dark: new color_1.$Os(new color_1.$Ls(128, 128, 128, 0.17)), light: new color_1.$Os(new color_1.$Ls(221, 221, 221, 0.4)), hcDark: color_1.$Os.transparent, hcLight: color_1.$Os.transparent }, nls.localize(79, null));
    exports.$Kw = $sv('keybindingLabel.foreground', { dark: color_1.$Os.fromHex('#CCCCCC'), light: color_1.$Os.fromHex('#555555'), hcDark: color_1.$Os.white, hcLight: exports.$uv }, nls.localize(80, null));
    exports.$Lw = $sv('keybindingLabel.border', { dark: new color_1.$Os(new color_1.$Ls(51, 51, 51, 0.6)), light: new color_1.$Os(new color_1.$Ls(204, 204, 204, 0.4)), hcDark: new color_1.$Os(new color_1.$Ls(111, 195, 223)), hcLight: exports.$Av }, nls.localize(81, null));
    exports.$Mw = $sv('keybindingLabel.bottomBorder', { dark: new color_1.$Os(new color_1.$Ls(68, 68, 68, 0.6)), light: new color_1.$Os(new color_1.$Ls(187, 187, 187, 0.4)), hcDark: new color_1.$Os(new color_1.$Ls(111, 195, 223)), hcLight: exports.$uv }, nls.localize(82, null));
    /**
     * Editor selection colors.
     */
    exports.$Nw = $sv('editor.selectionBackground', { light: '#ADD6FF', dark: '#264F78', hcDark: '#f3f518', hcLight: '#0F4A85' }, nls.localize(83, null));
    exports.$Ow = $sv('editor.selectionForeground', { light: null, dark: null, hcDark: '#000000', hcLight: color_1.$Os.white }, nls.localize(84, null));
    exports.$Pw = $sv('editor.inactiveSelectionBackground', { light: $1y(exports.$Nw, 0.5), dark: $1y(exports.$Nw, 0.5), hcDark: $1y(exports.$Nw, 0.7), hcLight: $1y(exports.$Nw, 0.5) }, nls.localize(85, null), true);
    exports.$Qw = $sv('editor.selectionHighlightBackground', { light: lessProminent(exports.$Nw, exports.$ww, 0.3, 0.6), dark: lessProminent(exports.$Nw, exports.$ww, 0.3, 0.6), hcDark: null, hcLight: null }, nls.localize(86, null), true);
    exports.$Rw = $sv('editor.selectionHighlightBorder', { light: null, dark: null, hcDark: exports.$Bv, hcLight: exports.$Bv }, nls.localize(87, null));
    /**
     * Editor find match colors.
     */
    exports.$Sw = $sv('editor.findMatchBackground', { light: '#A8AC94', dark: '#515C6A', hcDark: null, hcLight: null }, nls.localize(88, null));
    exports.$Tw = $sv('editor.findMatchHighlightBackground', { light: '#EA5C0055', dark: '#EA5C0055', hcDark: null, hcLight: null }, nls.localize(89, null), true);
    exports.$Uw = $sv('editor.findRangeHighlightBackground', { dark: '#3a3d4166', light: '#b4b4b44d', hcDark: null, hcLight: null }, nls.localize(90, null), true);
    exports.$Vw = $sv('editor.findMatchBorder', { light: null, dark: null, hcDark: exports.$Bv, hcLight: exports.$Bv }, nls.localize(91, null));
    exports.$Ww = $sv('editor.findMatchHighlightBorder', { light: null, dark: null, hcDark: exports.$Bv, hcLight: exports.$Bv }, nls.localize(92, null));
    exports.$Xw = $sv('editor.findRangeHighlightBorder', { dark: null, light: null, hcDark: $1y(exports.$Bv, 0.4), hcLight: $1y(exports.$Bv, 0.4) }, nls.localize(93, null), true);
    /**
     * Search Editor query match colors.
     *
     * Distinct from normal editor find match to allow for better differentiation
     */
    exports.$Yw = $sv('searchEditor.findMatchBackground', { light: $1y(exports.$Tw, 0.66), dark: $1y(exports.$Tw, 0.66), hcDark: exports.$Tw, hcLight: exports.$Tw }, nls.localize(94, null));
    exports.$Zw = $sv('searchEditor.findMatchBorder', { light: $1y(exports.$Ww, 0.66), dark: $1y(exports.$Ww, 0.66), hcDark: exports.$Ww, hcLight: exports.$Ww }, nls.localize(95, null));
    /**
     * Search Viewlet colors.
     */
    exports.$1w = $sv('search.resultsInfoForeground', { light: exports.$uv, dark: $1y(exports.$uv, 0.65), hcDark: exports.$uv, hcLight: exports.$uv }, nls.localize(96, null));
    /**
     * Editor hover
     */
    exports.$2w = $sv('editor.hoverHighlightBackground', { light: '#ADD6FF26', dark: '#264f7840', hcDark: '#ADD6FF26', hcLight: null }, nls.localize(97, null), true);
    exports.$3w = $sv('editorHoverWidget.background', { light: exports.$Aw, dark: exports.$Aw, hcDark: exports.$Aw, hcLight: exports.$Aw }, nls.localize(98, null));
    exports.$4w = $sv('editorHoverWidget.foreground', { light: exports.$Bw, dark: exports.$Bw, hcDark: exports.$Bw, hcLight: exports.$Bw }, nls.localize(99, null));
    exports.$5w = $sv('editorHoverWidget.border', { light: exports.$Cw, dark: exports.$Cw, hcDark: exports.$Cw, hcLight: exports.$Cw }, nls.localize(100, null));
    exports.$6w = $sv('editorHoverWidget.statusBarBackground', { dark: $Zy(exports.$3w, 0.2), light: $Yy(exports.$3w, 0.05), hcDark: exports.$Aw, hcLight: exports.$Aw }, nls.localize(101, null));
    /**
     * Editor link colors
     */
    exports.$7w = $sv('editorLink.activeForeground', { dark: '#4E94CE', light: color_1.$Os.blue, hcDark: color_1.$Os.cyan, hcLight: '#292929' }, nls.localize(102, null));
    /**
     * Inline hints
     */
    exports.$8w = $sv('editorInlayHint.foreground', { dark: '#969696', light: '#969696', hcDark: color_1.$Os.white, hcLight: color_1.$Os.black }, nls.localize(103, null));
    exports.$9w = $sv('editorInlayHint.background', { dark: $1y(exports.$dw, .10), light: $1y(exports.$dw, .10), hcDark: $1y(color_1.$Os.white, .10), hcLight: $1y(exports.$dw, .10) }, nls.localize(104, null));
    exports.$0w = $sv('editorInlayHint.typeForeground', { dark: exports.$8w, light: exports.$8w, hcDark: exports.$8w, hcLight: exports.$8w }, nls.localize(105, null));
    exports.$$w = $sv('editorInlayHint.typeBackground', { dark: exports.$9w, light: exports.$9w, hcDark: exports.$9w, hcLight: exports.$9w }, nls.localize(106, null));
    exports.$_w = $sv('editorInlayHint.parameterForeground', { dark: exports.$8w, light: exports.$8w, hcDark: exports.$8w, hcLight: exports.$8w }, nls.localize(107, null));
    exports.$ax = $sv('editorInlayHint.parameterBackground', { dark: exports.$9w, light: exports.$9w, hcDark: exports.$9w, hcLight: exports.$9w }, nls.localize(108, null));
    /**
     * Editor lightbulb icon colors
     */
    exports.$bx = $sv('editorLightBulb.foreground', { dark: '#FFCC00', light: '#DDB100', hcDark: '#FFCC00', hcLight: '#007ACC' }, nls.localize(109, null));
    exports.$cx = $sv('editorLightBulbAutoFix.foreground', { dark: '#75BEFF', light: '#007ACC', hcDark: '#75BEFF', hcLight: '#007ACC' }, nls.localize(110, null));
    /**
     * Diff Editor Colors
     */
    exports.$dx = new color_1.$Os(new color_1.$Ls(155, 185, 85, .2));
    exports.$ex = new color_1.$Os(new color_1.$Ls(255, 0, 0, .2));
    exports.$fx = $sv('diffEditor.insertedTextBackground', { dark: '#9ccc2c33', light: '#9ccc2c40', hcDark: null, hcLight: null }, nls.localize(111, null), true);
    exports.$gx = $sv('diffEditor.removedTextBackground', { dark: '#ff000033', light: '#ff000033', hcDark: null, hcLight: null }, nls.localize(112, null), true);
    exports.$hx = $sv('diffEditor.insertedLineBackground', { dark: exports.$dx, light: exports.$dx, hcDark: null, hcLight: null }, nls.localize(113, null), true);
    exports.$ix = $sv('diffEditor.removedLineBackground', { dark: exports.$ex, light: exports.$ex, hcDark: null, hcLight: null }, nls.localize(114, null), true);
    exports.$jx = $sv('diffEditorGutter.insertedLineBackground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(115, null));
    exports.$kx = $sv('diffEditorGutter.removedLineBackground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(116, null));
    exports.$lx = $sv('diffEditorOverview.insertedForeground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(117, null));
    exports.$mx = $sv('diffEditorOverview.removedForeground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(118, null));
    exports.$nx = $sv('diffEditor.insertedTextBorder', { dark: null, light: null, hcDark: '#33ff2eff', hcLight: '#374E06' }, nls.localize(119, null));
    exports.$ox = $sv('diffEditor.removedTextBorder', { dark: null, light: null, hcDark: '#FF008F', hcLight: '#AD0707' }, nls.localize(120, null));
    exports.$px = $sv('diffEditor.border', { dark: null, light: null, hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(121, null));
    exports.$qx = $sv('diffEditor.diagonalFill', { dark: '#cccccc33', light: '#22222233', hcDark: null, hcLight: null }, nls.localize(122, null));
    exports.$rx = $sv('diffEditor.unchangedRegionBackground', { dark: '#3e3e3e', light: '#e4e4e4', hcDark: null, hcLight: null }, nls.localize(123, null));
    exports.$sx = $sv('diffEditor.unchangedRegionForeground', { dark: '#a3a2a2', light: '#4d4c4c', hcDark: null, hcLight: null }, nls.localize(124, null));
    exports.$tx = $sv('diffEditor.unchangedCodeBackground', { dark: '#74747429', light: '#b8b8b829', hcDark: null, hcLight: null }, nls.localize(125, null));
    /**
     * List and tree colors
     */
    exports.$ux = $sv('list.focusBackground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(126, null));
    exports.$vx = $sv('list.focusForeground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(127, null));
    exports.$wx = $sv('list.focusOutline', { dark: exports.$zv, light: exports.$zv, hcDark: exports.$Bv, hcLight: exports.$Bv }, nls.localize(128, null));
    exports.$xx = $sv('list.focusAndSelectionOutline', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(129, null));
    exports.$yx = $sv('list.activeSelectionBackground', { dark: '#04395E', light: '#0060C0', hcDark: null, hcLight: color_1.$Os.fromHex('#0F4A85').transparent(0.1) }, nls.localize(130, null));
    exports.$zx = $sv('list.activeSelectionForeground', { dark: color_1.$Os.white, light: color_1.$Os.white, hcDark: null, hcLight: null }, nls.localize(131, null));
    exports.$Ax = $sv('list.activeSelectionIconForeground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(132, null));
    exports.$Bx = $sv('list.inactiveSelectionBackground', { dark: '#37373D', light: '#E4E6F1', hcDark: null, hcLight: color_1.$Os.fromHex('#0F4A85').transparent(0.1) }, nls.localize(133, null));
    exports.$Cx = $sv('list.inactiveSelectionForeground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(134, null));
    exports.$Dx = $sv('list.inactiveSelectionIconForeground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(135, null));
    exports.$Ex = $sv('list.inactiveFocusBackground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(136, null));
    exports.$Fx = $sv('list.inactiveFocusOutline', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(137, null));
    exports.$Gx = $sv('list.hoverBackground', { dark: '#2A2D2E', light: '#F0F0F0', hcDark: color_1.$Os.white.transparent(0.1), hcLight: color_1.$Os.fromHex('#0F4A85').transparent(0.1) }, nls.localize(138, null));
    exports.$Hx = $sv('list.hoverForeground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(139, null));
    exports.$Ix = $sv('list.dropBackground', { dark: '#062F4A', light: '#D6EBFF', hcDark: null, hcLight: null }, nls.localize(140, null));
    exports.$Jx = $sv('list.highlightForeground', { dark: '#2AAAFF', light: '#0066BF', hcDark: exports.$zv, hcLight: exports.$zv }, nls.localize(141, null));
    exports.$Kx = $sv('list.focusHighlightForeground', { dark: exports.$Jx, light: $4y(exports.$yx, exports.$Jx, '#BBE7FF'), hcDark: exports.$Jx, hcLight: exports.$Jx }, nls.localize(142, null));
    exports.$Lx = $sv('list.invalidItemForeground', { dark: '#B89500', light: '#B89500', hcDark: '#B89500', hcLight: '#B5200D' }, nls.localize(143, null));
    exports.$Mx = $sv('list.errorForeground', { dark: '#F88070', light: '#B01011', hcDark: null, hcLight: null }, nls.localize(144, null));
    exports.$Nx = $sv('list.warningForeground', { dark: '#CCA700', light: '#855F00', hcDark: null, hcLight: null }, nls.localize(145, null));
    exports.$Ox = $sv('listFilterWidget.background', { light: $Yy(exports.$Aw, 0), dark: $Zy(exports.$Aw, 0), hcDark: exports.$Aw, hcLight: exports.$Aw }, nls.localize(146, null));
    exports.$Px = $sv('listFilterWidget.outline', { dark: color_1.$Os.transparent, light: color_1.$Os.transparent, hcDark: '#f38518', hcLight: '#007ACC' }, nls.localize(147, null));
    exports.$Qx = $sv('listFilterWidget.noMatchesOutline', { dark: '#BE1100', light: '#BE1100', hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(148, null));
    exports.$Rx = $sv('listFilterWidget.shadow', { dark: exports.$Kv, light: exports.$Kv, hcDark: exports.$Kv, hcLight: exports.$Kv }, nls.localize(149, null));
    exports.$Sx = $sv('list.filterMatchBackground', { dark: exports.$Tw, light: exports.$Tw, hcDark: null, hcLight: null }, nls.localize(150, null));
    exports.$Tx = $sv('list.filterMatchBorder', { dark: exports.$Ww, light: exports.$Ww, hcDark: exports.$Av, hcLight: exports.$Bv }, nls.localize(151, null));
    exports.$Ux = $sv('tree.indentGuidesStroke', { dark: '#585858', light: '#a9a9a9', hcDark: '#a9a9a9', hcLight: '#a5a5a5' }, nls.localize(152, null));
    exports.$Vx = $sv('tree.inactiveIndentGuidesStroke', { dark: $1y(exports.$Ux, 0.4), light: $1y(exports.$Ux, 0.4), hcDark: $1y(exports.$Ux, 0.4), hcLight: $1y(exports.$Ux, 0.4) }, nls.localize(153, null));
    exports.$Wx = $sv('tree.tableColumnsBorder', { dark: '#CCCCCC20', light: '#61616120', hcDark: null, hcLight: null }, nls.localize(154, null));
    exports.$Xx = $sv('tree.tableOddRowsBackground', { dark: $1y(exports.$uv, 0.04), light: $1y(exports.$uv, 0.04), hcDark: null, hcLight: null }, nls.localize(155, null));
    exports.$Yx = $sv('list.deemphasizedForeground', { dark: '#8C8C8C', light: '#8E8E90', hcDark: '#A7A8A9', hcLight: '#666666' }, nls.localize(156, null));
    /**
     * Checkboxes
     */
    exports.$Zx = $sv('checkbox.background', { dark: exports.$4v, light: exports.$4v, hcDark: exports.$4v, hcLight: exports.$4v }, nls.localize(157, null));
    exports.$1x = $sv('checkbox.selectBackground', { dark: exports.$Aw, light: exports.$Aw, hcDark: exports.$Aw, hcLight: exports.$Aw }, nls.localize(158, null));
    exports.$2x = $sv('checkbox.foreground', { dark: exports.$6v, light: exports.$6v, hcDark: exports.$6v, hcLight: exports.$6v }, nls.localize(159, null));
    exports.$3x = $sv('checkbox.border', { dark: exports.$7v, light: exports.$7v, hcDark: exports.$7v, hcLight: exports.$7v }, nls.localize(160, null));
    exports.$4x = $sv('checkbox.selectBorder', { dark: exports.$yv, light: exports.$yv, hcDark: exports.$yv, hcLight: exports.$yv }, nls.localize(161, null));
    /**
     * Quick pick widget (dependent on List and tree colors)
     */
    exports.$5x = $sv('quickInput.list.focusBackground', { dark: null, light: null, hcDark: null, hcLight: null }, '', undefined, nls.localize(162, null));
    exports.$6x = $sv('quickInputList.focusForeground', { dark: exports.$zx, light: exports.$zx, hcDark: exports.$zx, hcLight: exports.$zx }, nls.localize(163, null));
    exports.$7x = $sv('quickInputList.focusIconForeground', { dark: exports.$Ax, light: exports.$Ax, hcDark: exports.$Ax, hcLight: exports.$Ax }, nls.localize(164, null));
    exports.$8x = $sv('quickInputList.focusBackground', { dark: $3y(exports.$5x, exports.$yx), light: $3y(exports.$5x, exports.$yx), hcDark: null, hcLight: null }, nls.localize(165, null));
    /**
     * Menu colors
     */
    exports.$9x = $sv('menu.border', { dark: null, light: null, hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(166, null));
    exports.$0x = $sv('menu.foreground', { dark: exports.$6v, light: exports.$6v, hcDark: exports.$6v, hcLight: exports.$6v }, nls.localize(167, null));
    exports.$$x = $sv('menu.background', { dark: exports.$4v, light: exports.$4v, hcDark: exports.$4v, hcLight: exports.$4v }, nls.localize(168, null));
    exports.$_x = $sv('menu.selectionForeground', { dark: exports.$zx, light: exports.$zx, hcDark: exports.$zx, hcLight: exports.$zx }, nls.localize(169, null));
    exports.$ay = $sv('menu.selectionBackground', { dark: exports.$yx, light: exports.$yx, hcDark: exports.$yx, hcLight: exports.$yx }, nls.localize(170, null));
    exports.$by = $sv('menu.selectionBorder', { dark: null, light: null, hcDark: exports.$Bv, hcLight: exports.$Bv }, nls.localize(171, null));
    exports.$cy = $sv('menu.separatorBackground', { dark: '#606060', light: '#D4D4D4', hcDark: exports.$Av, hcLight: exports.$Av }, nls.localize(172, null));
    /**
     * Toolbar colors
     */
    exports.$dy = $sv('toolbar.hoverBackground', { dark: '#5a5d5e50', light: '#b8b8b850', hcDark: null, hcLight: null }, nls.localize(173, null));
    exports.$ey = $sv('toolbar.hoverOutline', { dark: null, light: null, hcDark: exports.$Bv, hcLight: exports.$Bv }, nls.localize(174, null));
    exports.$fy = $sv('toolbar.activeBackground', { dark: $Zy(exports.$dy, 0.1), light: $Yy(exports.$dy, 0.1), hcDark: null, hcLight: null }, nls.localize(175, null));
    /**
     * Snippet placeholder colors
     */
    exports.$gy = $sv('editor.snippetTabstopHighlightBackground', { dark: new color_1.$Os(new color_1.$Ls(124, 124, 124, 0.3)), light: new color_1.$Os(new color_1.$Ls(10, 50, 100, 0.2)), hcDark: new color_1.$Os(new color_1.$Ls(124, 124, 124, 0.3)), hcLight: new color_1.$Os(new color_1.$Ls(10, 50, 100, 0.2)) }, nls.localize(176, null));
    exports.$hy = $sv('editor.snippetTabstopHighlightBorder', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(177, null));
    exports.$iy = $sv('editor.snippetFinalTabstopHighlightBackground', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(178, null));
    exports.$jy = $sv('editor.snippetFinalTabstopHighlightBorder', { dark: '#525252', light: new color_1.$Os(new color_1.$Ls(10, 50, 100, 0.5)), hcDark: '#525252', hcLight: '#292929' }, nls.localize(179, null));
    /**
     * Breadcrumb colors
     */
    exports.$ky = $sv('breadcrumb.foreground', { light: $1y(exports.$uv, 0.8), dark: $1y(exports.$uv, 0.8), hcDark: $1y(exports.$uv, 0.8), hcLight: $1y(exports.$uv, 0.8) }, nls.localize(180, null));
    exports.$ly = $sv('breadcrumb.background', { light: exports.$ww, dark: exports.$ww, hcDark: exports.$ww, hcLight: exports.$ww }, nls.localize(181, null));
    exports.$my = $sv('breadcrumb.focusForeground', { light: $Yy(exports.$uv, 0.2), dark: $Zy(exports.$uv, 0.1), hcDark: $Zy(exports.$uv, 0.1), hcLight: $Zy(exports.$uv, 0.1) }, nls.localize(182, null));
    exports.$ny = $sv('breadcrumb.activeSelectionForeground', { light: $Yy(exports.$uv, 0.2), dark: $Zy(exports.$uv, 0.1), hcDark: $Zy(exports.$uv, 0.1), hcLight: $Zy(exports.$uv, 0.1) }, nls.localize(183, null));
    exports.$oy = $sv('breadcrumbPicker.background', { light: exports.$Aw, dark: exports.$Aw, hcDark: exports.$Aw, hcLight: exports.$Aw }, nls.localize(184, null));
    /**
     * Merge-conflict colors
     */
    const headerTransparency = 0.5;
    const currentBaseColor = color_1.$Os.fromHex('#40C8AE').transparent(headerTransparency);
    const incomingBaseColor = color_1.$Os.fromHex('#40A6FF').transparent(headerTransparency);
    const commonBaseColor = color_1.$Os.fromHex('#606060').transparent(0.4);
    const contentTransparency = 0.4;
    const rulerTransparency = 1;
    exports.$py = $sv('merge.currentHeaderBackground', { dark: currentBaseColor, light: currentBaseColor, hcDark: null, hcLight: null }, nls.localize(185, null), true);
    exports.$qy = $sv('merge.currentContentBackground', { dark: $1y(exports.$py, contentTransparency), light: $1y(exports.$py, contentTransparency), hcDark: $1y(exports.$py, contentTransparency), hcLight: $1y(exports.$py, contentTransparency) }, nls.localize(186, null), true);
    exports.$ry = $sv('merge.incomingHeaderBackground', { dark: incomingBaseColor, light: incomingBaseColor, hcDark: null, hcLight: null }, nls.localize(187, null), true);
    exports.$sy = $sv('merge.incomingContentBackground', { dark: $1y(exports.$ry, contentTransparency), light: $1y(exports.$ry, contentTransparency), hcDark: $1y(exports.$ry, contentTransparency), hcLight: $1y(exports.$ry, contentTransparency) }, nls.localize(188, null), true);
    exports.$ty = $sv('merge.commonHeaderBackground', { dark: commonBaseColor, light: commonBaseColor, hcDark: null, hcLight: null }, nls.localize(189, null), true);
    exports.$uy = $sv('merge.commonContentBackground', { dark: $1y(exports.$ty, contentTransparency), light: $1y(exports.$ty, contentTransparency), hcDark: $1y(exports.$ty, contentTransparency), hcLight: $1y(exports.$ty, contentTransparency) }, nls.localize(190, null), true);
    exports.$vy = $sv('merge.border', { dark: null, light: null, hcDark: '#C3DF6F', hcLight: '#007ACC' }, nls.localize(191, null));
    exports.$wy = $sv('editorOverviewRuler.currentContentForeground', { dark: $1y(exports.$py, rulerTransparency), light: $1y(exports.$py, rulerTransparency), hcDark: exports.$vy, hcLight: exports.$vy }, nls.localize(192, null));
    exports.$xy = $sv('editorOverviewRuler.incomingContentForeground', { dark: $1y(exports.$ry, rulerTransparency), light: $1y(exports.$ry, rulerTransparency), hcDark: exports.$vy, hcLight: exports.$vy }, nls.localize(193, null));
    exports.$yy = $sv('editorOverviewRuler.commonContentForeground', { dark: $1y(exports.$ty, rulerTransparency), light: $1y(exports.$ty, rulerTransparency), hcDark: exports.$vy, hcLight: exports.$vy }, nls.localize(194, null));
    exports.$zy = $sv('editorOverviewRuler.findMatchForeground', { dark: '#d186167e', light: '#d186167e', hcDark: '#AB5A00', hcLight: '' }, nls.localize(195, null), true);
    exports.$Ay = $sv('editorOverviewRuler.selectionHighlightForeground', { dark: '#A0A0A0CC', light: '#A0A0A0CC', hcDark: '#A0A0A0CC', hcLight: '#A0A0A0CC' }, nls.localize(196, null), true);
    exports.$By = $sv('minimap.findMatchHighlight', { light: '#d18616', dark: '#d18616', hcDark: '#AB5A00', hcLight: '#0F4A85' }, nls.localize(197, null), true);
    exports.$Cy = $sv('minimap.selectionOccurrenceHighlight', { light: '#c9c9c9', dark: '#676767', hcDark: '#ffffff', hcLight: '#0F4A85' }, nls.localize(198, null), true);
    exports.$Dy = $sv('minimap.selectionHighlight', { light: '#ADD6FF', dark: '#264F78', hcDark: '#ffffff', hcLight: '#0F4A85' }, nls.localize(199, null), true);
    exports.$Ey = $sv('minimap.infoHighlight', { dark: exports.$rw, light: exports.$rw, hcDark: exports.$sw, hcLight: exports.$sw }, nls.localize(200, null));
    exports.$Fy = $sv('minimap.warningHighlight', { dark: exports.$ow, light: exports.$ow, hcDark: exports.$pw, hcLight: exports.$pw }, nls.localize(201, null));
    exports.$Gy = $sv('minimap.errorHighlight', { dark: new color_1.$Os(new color_1.$Ls(255, 18, 18, 0.7)), light: new color_1.$Os(new color_1.$Ls(255, 18, 18, 0.7)), hcDark: new color_1.$Os(new color_1.$Ls(255, 50, 50, 1)), hcLight: '#B5200D' }, nls.localize(202, null));
    exports.$Hy = $sv('minimap.background', { dark: null, light: null, hcDark: null, hcLight: null }, nls.localize(203, null));
    exports.$Iy = $sv('minimap.foregroundOpacity', { dark: color_1.$Os.fromHex('#000f'), light: color_1.$Os.fromHex('#000f'), hcDark: color_1.$Os.fromHex('#000f'), hcLight: color_1.$Os.fromHex('#000f') }, nls.localize(204, null));
    exports.$Jy = $sv('minimapSlider.background', { light: $1y(exports.$gw, 0.5), dark: $1y(exports.$gw, 0.5), hcDark: $1y(exports.$gw, 0.5), hcLight: $1y(exports.$gw, 0.5) }, nls.localize(205, null));
    exports.$Ky = $sv('minimapSlider.hoverBackground', { light: $1y(exports.$hw, 0.5), dark: $1y(exports.$hw, 0.5), hcDark: $1y(exports.$hw, 0.5), hcLight: $1y(exports.$hw, 0.5) }, nls.localize(206, null));
    exports.$Ly = $sv('minimapSlider.activeBackground', { light: $1y(exports.$iw, 0.5), dark: $1y(exports.$iw, 0.5), hcDark: $1y(exports.$iw, 0.5), hcLight: $1y(exports.$iw, 0.5) }, nls.localize(207, null));
    exports.$My = $sv('problemsErrorIcon.foreground', { dark: exports.$lw, light: exports.$lw, hcDark: exports.$lw, hcLight: exports.$lw }, nls.localize(208, null));
    exports.$Ny = $sv('problemsWarningIcon.foreground', { dark: exports.$ow, light: exports.$ow, hcDark: exports.$ow, hcLight: exports.$ow }, nls.localize(209, null));
    exports.$Oy = $sv('problemsInfoIcon.foreground', { dark: exports.$rw, light: exports.$rw, hcDark: exports.$rw, hcLight: exports.$rw }, nls.localize(210, null));
    /**
     * Chart colors
     */
    exports.$Py = $sv('charts.foreground', { dark: exports.$uv, light: exports.$uv, hcDark: exports.$uv, hcLight: exports.$uv }, nls.localize(211, null));
    exports.$Qy = $sv('charts.lines', { dark: $1y(exports.$uv, .5), light: $1y(exports.$uv, .5), hcDark: $1y(exports.$uv, .5), hcLight: $1y(exports.$uv, .5) }, nls.localize(212, null));
    exports.$Ry = $sv('charts.red', { dark: exports.$lw, light: exports.$lw, hcDark: exports.$lw, hcLight: exports.$lw }, nls.localize(213, null));
    exports.$Sy = $sv('charts.blue', { dark: exports.$rw, light: exports.$rw, hcDark: exports.$rw, hcLight: exports.$rw }, nls.localize(214, null));
    exports.$Ty = $sv('charts.yellow', { dark: exports.$ow, light: exports.$ow, hcDark: exports.$ow, hcLight: exports.$ow }, nls.localize(215, null));
    exports.$Uy = $sv('charts.orange', { dark: exports.$By, light: exports.$By, hcDark: exports.$By, hcLight: exports.$By }, nls.localize(216, null));
    exports.$Vy = $sv('charts.green', { dark: '#89D185', light: '#388A34', hcDark: '#89D185', hcLight: '#374e06' }, nls.localize(217, null));
    exports.$Wy = $sv('charts.purple', { dark: '#B180D7', light: '#652D90', hcDark: '#B180D7', hcLight: '#652D90' }, nls.localize(218, null));
    // ----- color functions
    function $Xy(transform, theme) {
        switch (transform.op) {
            case 0 /* ColorTransformType.Darken */:
                return $5y(transform.value, theme)?.darken(transform.factor);
            case 1 /* ColorTransformType.Lighten */:
                return $5y(transform.value, theme)?.lighten(transform.factor);
            case 2 /* ColorTransformType.Transparent */:
                return $5y(transform.value, theme)?.transparent(transform.factor);
            case 3 /* ColorTransformType.Opaque */: {
                const backgroundColor = $5y(transform.background, theme);
                if (!backgroundColor) {
                    return $5y(transform.value, theme);
                }
                return $5y(transform.value, theme)?.makeOpaque(backgroundColor);
            }
            case 4 /* ColorTransformType.OneOf */:
                for (const candidate of transform.values) {
                    const color = $5y(candidate, theme);
                    if (color) {
                        return color;
                    }
                }
                return undefined;
            case 6 /* ColorTransformType.IfDefinedThenElse */:
                return $5y(theme.defines(transform.if) ? transform.then : transform.else, theme);
            case 5 /* ColorTransformType.LessProminent */: {
                const from = $5y(transform.value, theme);
                if (!from) {
                    return undefined;
                }
                const backgroundColor = $5y(transform.background, theme);
                if (!backgroundColor) {
                    return from.transparent(transform.factor * transform.transparency);
                }
                return from.isDarkerThan(backgroundColor)
                    ? color_1.$Os.getLighterColor(from, backgroundColor, transform.factor).transparent(transform.transparency)
                    : color_1.$Os.getDarkerColor(from, backgroundColor, transform.factor).transparent(transform.transparency);
            }
            default:
                throw (0, assert_1.$vc)(transform);
        }
    }
    exports.$Xy = $Xy;
    function $Yy(colorValue, factor) {
        return { op: 0 /* ColorTransformType.Darken */, value: colorValue, factor };
    }
    exports.$Yy = $Yy;
    function $Zy(colorValue, factor) {
        return { op: 1 /* ColorTransformType.Lighten */, value: colorValue, factor };
    }
    exports.$Zy = $Zy;
    function $1y(colorValue, factor) {
        return { op: 2 /* ColorTransformType.Transparent */, value: colorValue, factor };
    }
    exports.$1y = $1y;
    function $2y(colorValue, background) {
        return { op: 3 /* ColorTransformType.Opaque */, value: colorValue, background };
    }
    exports.$2y = $2y;
    function $3y(...colorValues) {
        return { op: 4 /* ColorTransformType.OneOf */, values: colorValues };
    }
    exports.$3y = $3y;
    function $4y(ifArg, thenArg, elseArg) {
        return { op: 6 /* ColorTransformType.IfDefinedThenElse */, if: ifArg, then: thenArg, else: elseArg };
    }
    exports.$4y = $4y;
    function lessProminent(colorValue, backgroundColorValue, factor, transparency) {
        return { op: 5 /* ColorTransformType.LessProminent */, value: colorValue, background: backgroundColorValue, factor, transparency };
    }
    // ----- implementation
    /**
     * @param colorValue Resolve a color value in the context of a theme
     */
    function $5y(colorValue, theme) {
        if (colorValue === null) {
            return undefined;
        }
        else if (typeof colorValue === 'string') {
            if (colorValue[0] === '#') {
                return color_1.$Os.fromHex(colorValue);
            }
            return theme.getColor(colorValue);
        }
        else if (colorValue instanceof color_1.$Os) {
            return colorValue;
        }
        else if (typeof colorValue === 'object') {
            return $Xy(colorValue, theme);
        }
        return undefined;
    }
    exports.$5y = $5y;
    exports.$6y = 'vscode://schemas/workbench-colors';
    const schemaRegistry = platform.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
    schemaRegistry.registerSchema(exports.$6y, colorRegistry.getColorSchema());
    const delayer = new async_1.$Sg(() => schemaRegistry.notifySchemaChanged(exports.$6y), 200);
    colorRegistry.onDidChangeSchema(() => {
        if (!delayer.isScheduled()) {
            delayer.schedule();
        }
    });
});
// setTimeout(_ => console.log(colorRegistry.toString()), 5000);
//# sourceMappingURL=colorRegistry.js.map