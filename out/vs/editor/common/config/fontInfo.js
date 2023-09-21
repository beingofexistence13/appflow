/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/editor/common/config/editorOptions", "vs/editor/common/config/editorZoom"], function (require, exports, platform, editorOptions_1, editorZoom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FontInfo = exports.SERIALIZED_FONT_INFO_VERSION = exports.BareFontInfo = void 0;
    /**
     * Determined from empirical observations.
     * @internal
     */
    const GOLDEN_LINE_HEIGHT_RATIO = platform.isMacintosh ? 1.5 : 1.35;
    /**
     * @internal
     */
    const MINIMUM_LINE_HEIGHT = 8;
    class BareFontInfo {
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
            return BareFontInfo._create(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom);
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
            return BareFontInfo._create(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom);
        }
        /**
         * @internal
         */
        static _create(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom) {
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
            return new BareFontInfo({
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
            const fontFamily = BareFontInfo._wrapInQuotes(this.fontFamily);
            if (fallbackFontFamily && this.fontFamily !== fallbackFontFamily) {
                return `${fontFamily}, ${fallbackFontFamily}`;
            }
            return fontFamily;
        }
        static _wrapInQuotes(fontFamily) {
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
    exports.BareFontInfo = BareFontInfo;
    // change this whenever `FontInfo` members are changed
    exports.SERIALIZED_FONT_INFO_VERSION = 2;
    class FontInfo extends BareFontInfo {
        /**
         * @internal
         */
        constructor(opts, isTrusted) {
            super(opts);
            this._editorStylingBrand = undefined;
            this.version = exports.SERIALIZED_FONT_INFO_VERSION;
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
    exports.FontInfo = FontInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udEluZm8uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2NvbmZpZy9mb250SW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEc7OztPQUdHO0lBQ0gsTUFBTSx3QkFBd0IsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUVuRTs7T0FFRztJQUNILE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0lBUzlCLE1BQWEsWUFBWTtRQUd4Qjs7V0FFRztRQUNJLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxPQUFnQyxFQUFFLFVBQWtCLEVBQUUsZ0JBQXlCO1lBQ3hILE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO1lBQ3hELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO1lBQ3hELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLGdDQUF1QixDQUFDO1lBQ3BELE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLEdBQUcscUNBQTRCLENBQUM7WUFDcEUsTUFBTSxxQkFBcUIsR0FBRyxPQUFPLENBQUMsR0FBRyxzQ0FBNkIsQ0FBQztZQUN2RSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxrQ0FBeUIsQ0FBQztZQUN4RCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxxQ0FBNEIsQ0FBQztZQUM5RCxPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNwSyxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENB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