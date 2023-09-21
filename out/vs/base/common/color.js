/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Color = exports.HSVA = exports.HSLA = exports.RGBA = void 0;
    function roundFloat(number, decimalPoints) {
        const decimal = Math.pow(10, decimalPoints);
        return Math.round(number * decimal) / decimal;
    }
    class RGBA {
        constructor(r, g, b, a = 1) {
            this._rgbaBrand = undefined;
            this.r = Math.min(255, Math.max(0, r)) | 0;
            this.g = Math.min(255, Math.max(0, g)) | 0;
            this.b = Math.min(255, Math.max(0, b)) | 0;
            this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
        }
        static equals(a, b) {
            return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
        }
    }
    exports.RGBA = RGBA;
    class HSLA {
        constructor(h, s, l, a) {
            this._hslaBrand = undefined;
            this.h = Math.max(Math.min(360, h), 0) | 0;
            this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
            this.l = roundFloat(Math.max(Math.min(1, l), 0), 3);
            this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
        }
        static equals(a, b) {
            return a.h === b.h && a.s === b.s && a.l === b.l && a.a === b.a;
        }
        /**
         * Converts an RGB color value to HSL. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes r, g, and b are contained in the set [0, 255] and
         * returns h in the set [0, 360], s, and l in the set [0, 1].
         */
        static fromRGBA(rgba) {
            const r = rgba.r / 255;
            const g = rgba.g / 255;
            const b = rgba.b / 255;
            const a = rgba.a;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            let s = 0;
            const l = (min + max) / 2;
            const chroma = max - min;
            if (chroma > 0) {
                s = Math.min((l <= 0.5 ? chroma / (2 * l) : chroma / (2 - (2 * l))), 1);
                switch (max) {
                    case r:
                        h = (g - b) / chroma + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / chroma + 2;
                        break;
                    case b:
                        h = (r - g) / chroma + 4;
                        break;
                }
                h *= 60;
                h = Math.round(h);
            }
            return new HSLA(h, s, l, a);
        }
        static _hue2rgb(p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }
        /**
         * Converts an HSL color value to RGB. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes h in the set [0, 360] s, and l are contained in the set [0, 1] and
         * returns r, g, and b in the set [0, 255].
         */
        static toRGBA(hsla) {
            const h = hsla.h / 360;
            const { s, l, a } = hsla;
            let r, g, b;
            if (s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = HSLA._hue2rgb(p, q, h + 1 / 3);
                g = HSLA._hue2rgb(p, q, h);
                b = HSLA._hue2rgb(p, q, h - 1 / 3);
            }
            return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a);
        }
    }
    exports.HSLA = HSLA;
    class HSVA {
        constructor(h, s, v, a) {
            this._hsvaBrand = undefined;
            this.h = Math.max(Math.min(360, h), 0) | 0;
            this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
            this.v = roundFloat(Math.max(Math.min(1, v), 0), 3);
            this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
        }
        static equals(a, b) {
            return a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a;
        }
        // from http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
        static fromRGBA(rgba) {
            const r = rgba.r / 255;
            const g = rgba.g / 255;
            const b = rgba.b / 255;
            const cmax = Math.max(r, g, b);
            const cmin = Math.min(r, g, b);
            const delta = cmax - cmin;
            const s = cmax === 0 ? 0 : (delta / cmax);
            let m;
            if (delta === 0) {
                m = 0;
            }
            else if (cmax === r) {
                m = ((((g - b) / delta) % 6) + 6) % 6;
            }
            else if (cmax === g) {
                m = ((b - r) / delta) + 2;
            }
            else {
                m = ((r - g) / delta) + 4;
            }
            return new HSVA(Math.round(m * 60), s, cmax, rgba.a);
        }
        // from http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
        static toRGBA(hsva) {
            const { h, s, v, a } = hsva;
            const c = v * s;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = v - c;
            let [r, g, b] = [0, 0, 0];
            if (h < 60) {
                r = c;
                g = x;
            }
            else if (h < 120) {
                r = x;
                g = c;
            }
            else if (h < 180) {
                g = c;
                b = x;
            }
            else if (h < 240) {
                g = x;
                b = c;
            }
            else if (h < 300) {
                r = x;
                b = c;
            }
            else if (h <= 360) {
                r = c;
                b = x;
            }
            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
            return new RGBA(r, g, b, a);
        }
    }
    exports.HSVA = HSVA;
    class Color {
        static fromHex(hex) {
            return Color.Format.CSS.parseHex(hex) || Color.red;
        }
        static equals(a, b) {
            if (!a && !b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.equals(b);
        }
        get hsla() {
            if (this._hsla) {
                return this._hsla;
            }
            else {
                return HSLA.fromRGBA(this.rgba);
            }
        }
        get hsva() {
            if (this._hsva) {
                return this._hsva;
            }
            return HSVA.fromRGBA(this.rgba);
        }
        constructor(arg) {
            if (!arg) {
                throw new Error('Color needs a value');
            }
            else if (arg instanceof RGBA) {
                this.rgba = arg;
            }
            else if (arg instanceof HSLA) {
                this._hsla = arg;
                this.rgba = HSLA.toRGBA(arg);
            }
            else if (arg instanceof HSVA) {
                this._hsva = arg;
                this.rgba = HSVA.toRGBA(arg);
            }
            else {
                throw new Error('Invalid color ctor argument');
            }
        }
        equals(other) {
            return !!other && RGBA.equals(this.rgba, other.rgba) && HSLA.equals(this.hsla, other.hsla) && HSVA.equals(this.hsva, other.hsva);
        }
        /**
         * http://www.w3.org/TR/WCAG20/#relativeluminancedef
         * Returns the number in the set [0, 1]. O => Darkest Black. 1 => Lightest white.
         */
        getRelativeLuminance() {
            const R = Color._relativeLuminanceForComponent(this.rgba.r);
            const G = Color._relativeLuminanceForComponent(this.rgba.g);
            const B = Color._relativeLuminanceForComponent(this.rgba.b);
            const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
            return roundFloat(luminance, 4);
        }
        static _relativeLuminanceForComponent(color) {
            const c = color / 255;
            return (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
        }
        /**
         * http://www.w3.org/TR/WCAG20/#contrast-ratiodef
         * Returns the contrast ration number in the set [1, 21].
         */
        getContrastRatio(another) {
            const lum1 = this.getRelativeLuminance();
            const lum2 = another.getRelativeLuminance();
            return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
        }
        /**
         *	http://24ways.org/2010/calculating-color-contrast
         *  Return 'true' if darker color otherwise 'false'
         */
        isDarker() {
            const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
            return yiq < 128;
        }
        /**
         *	http://24ways.org/2010/calculating-color-contrast
         *  Return 'true' if lighter color otherwise 'false'
         */
        isLighter() {
            const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
            return yiq >= 128;
        }
        isLighterThan(another) {
            const lum1 = this.getRelativeLuminance();
            const lum2 = another.getRelativeLuminance();
            return lum1 > lum2;
        }
        isDarkerThan(another) {
            const lum1 = this.getRelativeLuminance();
            const lum2 = another.getRelativeLuminance();
            return lum1 < lum2;
        }
        lighten(factor) {
            return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l + this.hsla.l * factor, this.hsla.a));
        }
        darken(factor) {
            return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l - this.hsla.l * factor, this.hsla.a));
        }
        transparent(factor) {
            const { r, g, b, a } = this.rgba;
            return new Color(new RGBA(r, g, b, a * factor));
        }
        isTransparent() {
            return this.rgba.a === 0;
        }
        isOpaque() {
            return this.rgba.a === 1;
        }
        opposite() {
            return new Color(new RGBA(255 - this.rgba.r, 255 - this.rgba.g, 255 - this.rgba.b, this.rgba.a));
        }
        blend(c) {
            const rgba = c.rgba;
            // Convert to 0..1 opacity
            const thisA = this.rgba.a;
            const colorA = rgba.a;
            const a = thisA + colorA * (1 - thisA);
            if (a < 1e-6) {
                return Color.transparent;
            }
            const r = this.rgba.r * thisA / a + rgba.r * colorA * (1 - thisA) / a;
            const g = this.rgba.g * thisA / a + rgba.g * colorA * (1 - thisA) / a;
            const b = this.rgba.b * thisA / a + rgba.b * colorA * (1 - thisA) / a;
            return new Color(new RGBA(r, g, b, a));
        }
        makeOpaque(opaqueBackground) {
            if (this.isOpaque() || opaqueBackground.rgba.a !== 1) {
                // only allow to blend onto a non-opaque color onto a opaque color
                return this;
            }
            const { r, g, b, a } = this.rgba;
            // https://stackoverflow.com/questions/12228548/finding-equivalent-color-with-opacity
            return new Color(new RGBA(opaqueBackground.rgba.r - a * (opaqueBackground.rgba.r - r), opaqueBackground.rgba.g - a * (opaqueBackground.rgba.g - g), opaqueBackground.rgba.b - a * (opaqueBackground.rgba.b - b), 1));
        }
        flatten(...backgrounds) {
            const background = backgrounds.reduceRight((accumulator, color) => {
                return Color._flatten(color, accumulator);
            });
            return Color._flatten(this, background);
        }
        static _flatten(foreground, background) {
            const backgroundAlpha = 1 - foreground.rgba.a;
            return new Color(new RGBA(backgroundAlpha * background.rgba.r + foreground.rgba.a * foreground.rgba.r, backgroundAlpha * background.rgba.g + foreground.rgba.a * foreground.rgba.g, backgroundAlpha * background.rgba.b + foreground.rgba.a * foreground.rgba.b));
        }
        toString() {
            if (!this._toString) {
                this._toString = Color.Format.CSS.format(this);
            }
            return this._toString;
        }
        static getLighterColor(of, relative, factor) {
            if (of.isLighterThan(relative)) {
                return of;
            }
            factor = factor ? factor : 0.5;
            const lum1 = of.getRelativeLuminance();
            const lum2 = relative.getRelativeLuminance();
            factor = factor * (lum2 - lum1) / lum2;
            return of.lighten(factor);
        }
        static getDarkerColor(of, relative, factor) {
            if (of.isDarkerThan(relative)) {
                return of;
            }
            factor = factor ? factor : 0.5;
            const lum1 = of.getRelativeLuminance();
            const lum2 = relative.getRelativeLuminance();
            factor = factor * (lum1 - lum2) / lum1;
            return of.darken(factor);
        }
        static { this.white = new Color(new RGBA(255, 255, 255, 1)); }
        static { this.black = new Color(new RGBA(0, 0, 0, 1)); }
        static { this.red = new Color(new RGBA(255, 0, 0, 1)); }
        static { this.blue = new Color(new RGBA(0, 0, 255, 1)); }
        static { this.green = new Color(new RGBA(0, 255, 0, 1)); }
        static { this.cyan = new Color(new RGBA(0, 255, 255, 1)); }
        static { this.lightgrey = new Color(new RGBA(211, 211, 211, 1)); }
        static { this.transparent = new Color(new RGBA(0, 0, 0, 0)); }
    }
    exports.Color = Color;
    (function (Color) {
        let Format;
        (function (Format) {
            let CSS;
            (function (CSS) {
                function formatRGB(color) {
                    if (color.rgba.a === 1) {
                        return `rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`;
                    }
                    return Color.Format.CSS.formatRGBA(color);
                }
                CSS.formatRGB = formatRGB;
                function formatRGBA(color) {
                    return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${+(color.rgba.a).toFixed(2)})`;
                }
                CSS.formatRGBA = formatRGBA;
                function formatHSL(color) {
                    if (color.hsla.a === 1) {
                        return `hsl(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%)`;
                    }
                    return Color.Format.CSS.formatHSLA(color);
                }
                CSS.formatHSL = formatHSL;
                function formatHSLA(color) {
                    return `hsla(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%, ${color.hsla.a.toFixed(2)})`;
                }
                CSS.formatHSLA = formatHSLA;
                function _toTwoDigitHex(n) {
                    const r = n.toString(16);
                    return r.length !== 2 ? '0' + r : r;
                }
                /**
                 * Formats the color as #RRGGBB
                 */
                function formatHex(color) {
                    return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}`;
                }
                CSS.formatHex = formatHex;
                /**
                 * Formats the color as #RRGGBBAA
                 * If 'compact' is set, colors without transparancy will be printed as #RRGGBB
                 */
                function formatHexA(color, compact = false) {
                    if (compact && color.rgba.a === 1) {
                        return Color.Format.CSS.formatHex(color);
                    }
                    return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}${_toTwoDigitHex(Math.round(color.rgba.a * 255))}`;
                }
                CSS.formatHexA = formatHexA;
                /**
                 * The default format will use HEX if opaque and RGBA otherwise.
                 */
                function format(color) {
                    if (color.isOpaque()) {
                        return Color.Format.CSS.formatHex(color);
                    }
                    return Color.Format.CSS.formatRGBA(color);
                }
                CSS.format = format;
                /**
                 * Converts an Hex color value to a Color.
                 * returns r, g, and b are contained in the set [0, 255]
                 * @param hex string (#RGB, #RGBA, #RRGGBB or #RRGGBBAA).
                 */
                function parseHex(hex) {
                    const length = hex.length;
                    if (length === 0) {
                        // Invalid color
                        return null;
                    }
                    if (hex.charCodeAt(0) !== 35 /* CharCode.Hash */) {
                        // Does not begin with a #
                        return null;
                    }
                    if (length === 7) {
                        // #RRGGBB format
                        const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                        const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                        const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                        return new Color(new RGBA(r, g, b, 1));
                    }
                    if (length === 9) {
                        // #RRGGBBAA format
                        const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                        const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                        const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                        const a = 16 * _parseHexDigit(hex.charCodeAt(7)) + _parseHexDigit(hex.charCodeAt(8));
                        return new Color(new RGBA(r, g, b, a / 255));
                    }
                    if (length === 4) {
                        // #RGB format
                        const r = _parseHexDigit(hex.charCodeAt(1));
                        const g = _parseHexDigit(hex.charCodeAt(2));
                        const b = _parseHexDigit(hex.charCodeAt(3));
                        return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b));
                    }
                    if (length === 5) {
                        // #RGBA format
                        const r = _parseHexDigit(hex.charCodeAt(1));
                        const g = _parseHexDigit(hex.charCodeAt(2));
                        const b = _parseHexDigit(hex.charCodeAt(3));
                        const a = _parseHexDigit(hex.charCodeAt(4));
                        return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b, (16 * a + a) / 255));
                    }
                    // Invalid color
                    return null;
                }
                CSS.parseHex = parseHex;
                function _parseHexDigit(charCode) {
                    switch (charCode) {
                        case 48 /* CharCode.Digit0 */: return 0;
                        case 49 /* CharCode.Digit1 */: return 1;
                        case 50 /* CharCode.Digit2 */: return 2;
                        case 51 /* CharCode.Digit3 */: return 3;
                        case 52 /* CharCode.Digit4 */: return 4;
                        case 53 /* CharCode.Digit5 */: return 5;
                        case 54 /* CharCode.Digit6 */: return 6;
                        case 55 /* CharCode.Digit7 */: return 7;
                        case 56 /* CharCode.Digit8 */: return 8;
                        case 57 /* CharCode.Digit9 */: return 9;
                        case 97 /* CharCode.a */: return 10;
                        case 65 /* CharCode.A */: return 10;
                        case 98 /* CharCode.b */: return 11;
                        case 66 /* CharCode.B */: return 11;
                        case 99 /* CharCode.c */: return 12;
                        case 67 /* CharCode.C */: return 12;
                        case 100 /* CharCode.d */: return 13;
                        case 68 /* CharCode.D */: return 13;
                        case 101 /* CharCode.e */: return 14;
                        case 69 /* CharCode.E */: return 14;
                        case 102 /* CharCode.f */: return 15;
                        case 70 /* CharCode.F */: return 15;
                    }
                    return 0;
                }
            })(CSS = Format.CSS || (Format.CSS = {}));
        })(Format = Color.Format || (Color.Format = {}));
    })(Color || (exports.Color = Color = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9jb2xvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsU0FBUyxVQUFVLENBQUMsTUFBYyxFQUFFLGFBQXFCO1FBQ3hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDO0lBQy9DLENBQUM7SUFFRCxNQUFhLElBQUk7UUF1QmhCLFlBQVksQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsSUFBWSxDQUFDO1lBdEIxRCxlQUFVLEdBQVMsU0FBUyxDQUFDO1lBdUI1QixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMs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