/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/editor/common/config/editorOptions", "vs/editor/common/config/editorZoom"], function (require, exports, platform, editorOptions_1, editorZoom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Tr = exports.$Sr = exports.$Rr = void 0;
    /**
     * Determined from empirical observations.
     * @internal
     */
    const GOLDEN_LINE_HEIGHT_RATIO = platform.$j ? 1.5 : 1.35;
    /**
     * @internal
     */
    const MINIMUM_LINE_HEIGHT = 8;
    class $Rr {
        /**
         * @internal
         */
        static createFromValidatedSettings(options, pixelRatio, ignoreEditorZoom) {
            const fontFamily = options.get(49 /* EditorOption.fontFamily */);
            const fontWeight = options.get(53 /* EditorOption.fontWeight */);
            const fontSize = options.get(52 /* EditorOption.fontSize */);
            const fontFeatureSettings = options.get(51 /* EditorOption.fontLigatures */);
            const fontVariationSettings = options.get(54 /* EditorOption.fontVariations */);
            const lineHeight = options.get(66 /* EditorOption.lineHeight */);
            const letterSpacing = options.get(63 /* EditorOption.letterSpacing */);
            return $Rr.a(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom);
        }
        /**
         * @internal
         */
        static createFromRawSettings(opts, pixelRatio, ignoreEditorZoom = false) {
            const fontFamily = editorOptions_1.EditorOptions.fontFamily.validate(opts.fontFamily);
            const fontWeight = editorOptions_1.EditorOptions.fontWeight.validate(opts.fontWeight);
            const fontSize = editorOptions_1.EditorOptions.fontSize.validate(opts.fontSize);
            const fontFeatureSettings = editorOptions_1.EditorOptions.fontLigatures2.validate(opts.fontLigatures);
            const fontVariationSettings = editorOptions_1.EditorOptions.fontVariations.validate(opts.fontVariations);
            const lineHeight = editorOptions_1.EditorOptions.lineHeight.validate(opts.lineHeight);
            const letterSpacing = editorOptions_1.EditorOptions.letterSpacing.validate(opts.letterSpacing);
            return $Rr.a(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom);
        }
        /**
         * @internal
         */
        static a(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom) {
            if (lineHeight === 0) {
                lineHeight = GOLDEN_LINE_HEIGHT_RATIO * fontSize;
            }
            else if (lineHeight < MINIMUM_LINE_HEIGHT) {
                // Values too small to be line heights in pixels are in ems.
                lineHeight = lineHeight * fontSize;
            }
            // Enforce integer, minimum constraints
            lineHeight = Math.round(lineHeight);
            if (lineHeight < MINIMUM_LINE_HEIGHT) {
                lineHeight = MINIMUM_LINE_HEIGHT;
            }
            const editorZoomLevelMultiplier = 1 + (ignoreEditorZoom ? 0 : editorZoom_1.EditorZoom.getZoomLevel() * 0.1);
            fontSize *= editorZoomLevelMultiplier;
            lineHeight *= editorZoomLevelMultiplier;
            if (fontVariationSettings === editorOptions_1.EditorFontVariations.TRANSLATE) {
                if (fontWeight === 'normal' || fontWeight === 'bold') {
                    fontVariationSettings = editorOptions_1.EditorFontVariations.OFF;
                }
                else {
                    const fontWeightAsNumber = parseInt(fontWeight, 10);
                    fontVariationSettings = `'wght' ${fontWeightAsNumber}`;
                    fontWeight = 'normal';
                }
            }
            return new $Rr({
                pixelRatio: pixelRatio,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
                fontSize: fontSize,
                fontFeatureSettings: fontFeatureSettings,
                fontVariationSettings,
                lineHeight: lineHeight,
                letterSpacing: letterSpacing
            });
        }
        /**
         * @internal
         */
        constructor(opts) {
            this._bareFontInfoBrand = undefined;
            this.pixelRatio = opts.pixelRatio;
            this.fontFamily = String(opts.fontFamily);
            this.fontWeight = String(opts.fontWeight);
            this.fontSize = opts.fontSize;
            this.fontFeatureSettings = opts.fontFeatureSettings;
            this.fontVariationSettings = opts.fontVariationSettings;
            this.lineHeight = opts.lineHeight | 0;
            this.letterSpacing = opts.letterSpacing;
        }
        /**
         * @internal
         */
        getId() {
            return `${this.pixelRatio}-${this.fontFamily}-${this.fontWeight}-${this.fontSize}-${this.fontFeatureSettings}-${this.fontVariationSettings}-${this.lineHeight}-${this.letterSpacing}`;
        }
        /**
         * @internal
         */
        getMassagedFontFamily() {
            const fallbackFontFamily = editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily;
            const fontFamily = $Rr.b(this.fontFamily);
            if (fallbackFontFamily && this.fontFamily !== fallbackFontFamily) {
                return `${fontFamily}, ${fallbackFontFamily}`;
            }
            return fontFamily;
        }
        static b(fontFamily) {
            if (/[,"']/.test(fontFamily)) {
                // Looks like the font family might be already escaped
                return fontFamily;
            }
            if (/[+ ]/.test(fontFamily)) {
                // Wrap a font family using + or <space> with quotes
                return `"${fontFamily}"`;
            }
            return fontFamily;
        }
    }
    exports.$Rr = $Rr;
    // change this whenever `FontInfo` members are changed
    exports.$Sr = 2;
    class $Tr extends $Rr {
        /**
         * @internal
         */
        constructor(opts, isTrusted) {
            super(opts);
            this._editorStylingBrand = undefined;
            this.version = exports.$Sr;
            this.isTrusted = isTrusted;
            this.isMonospace = opts.isMonospace;
            this.typicalHalfwidthCharacterWidth = opts.typicalHalfwidthCharacterWidth;
            this.typicalFullwidthCharacterWidth = opts.typicalFullwidthCharacterWidth;
            this.canUseHalfwidthRightwardsArrow = opts.canUseHalfwidthRightwardsArrow;
            this.spaceWidth = opts.spaceWidth;
            this.middotWidth = opts.middotWidth;
            this.wsmiddotWidth = opts.wsmiddotWidth;
            this.maxDigitWidth = opts.maxDigitWidth;
        }
        /**
         * @internal
         */
        equals(other) {
            return (this.fontFamily === other.fontFamily
                && this.fontWeight === other.fontWeight
                && this.fontSize === other.fontSize
                && this.fontFeatureSettings === other.fontFeatureSettings
                && this.fontVariationSettings === other.fontVariationSettings
                && this.lineHeight === other.lineHeight
                && this.letterSpacing === other.letterSpacing
                && this.typicalHalfwidthCharacterWidth === other.typicalHalfwidthCharacterWidth
                && this.typicalFullwidthCharacterWidth === other.typicalFullwidthCharacterWidth
                && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow
                && this.spaceWidth === other.spaceWidth
                && this.middotWidth === other.middotWidth
                && this.wsmiddotWidth === other.wsmiddotWidth
                && this.maxDigitWidth === other.maxDigitWidth);
        }
    }
    exports.$Tr = $Tr;
});
//# sourceMappingURL=fontInfo.js.map