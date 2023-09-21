/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/config/charWidthReader", "vs/editor/common/config/editorOptions", "vs/editor/common/config/fontInfo"], function (require, exports, browser, event_1, lifecycle_1, charWidthReader_1, editorOptions_1, fontInfo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FontMeasurements = exports.FontMeasurementsImpl = void 0;
    class FontMeasurementsImpl extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._cache = new FontMeasurementsCache();
            this._evictUntrustedReadingsTimeout = -1;
        }
        dispose() {
            if (this._evictUntrustedReadingsTimeout !== -1) {
                window.clearTimeout(this._evictUntrustedReadingsTimeout);
                this._evictUntrustedReadingsTimeout = -1;
            }
            super.dispose();
        }
        /**
         * Clear all cached font information and trigger a change event.
         */
        clearAllFontInfos() {
            this._cache = new FontMeasurementsCache();
            this._onDidChange.fire();
        }
        _writeToCache(item, value) {
            this._cache.put(item, value);
            if (!value.isTrusted && this._evictUntrustedReadingsTimeout === -1) {
                // Try reading again after some time
                this._evictUntrustedReadingsTimeout = window.setTimeout(() => {
                    this._evictUntrustedReadingsTimeout = -1;
                    this._evictUntrustedReadings();
                }, 5000);
            }
        }
        _evictUntrustedReadings() {
            const values = this._cache.getValues();
            let somethingRemoved = false;
            for (const item of values) {
                if (!item.isTrusted) {
                    somethingRemoved = true;
                    this._cache.remove(item);
                }
            }
            if (somethingRemoved) {
                this._onDidChange.fire();
            }
        }
        /**
         * Serialized currently cached font information.
         */
        serializeFontInfo() {
            // Only save trusted font info (that has been measured in this running instance)
            return this._cache.getValues().filter(item => item.isTrusted);
        }
        /**
         * Restore previously serialized font informations.
         */
        restoreFontInfo(savedFontInfos) {
            // Take all the saved font info and insert them in the cache without the trusted flag.
            // The reason for this is that a font might have been installed on the OS in the meantime.
            for (const savedFontInfo of savedFontInfos) {
                if (savedFontInfo.version !== fontInfo_1.SERIALIZED_FONT_INFO_VERSION) {
                    // cannot use older version
                    continue;
                }
                const fontInfo = new fontInfo_1.FontInfo(savedFontInfo, false);
                this._writeToCache(fontInfo, fontInfo);
            }
        }
        /**
         * Read font information.
         */
        readFontInfo(bareFontInfo) {
            if (!this._cache.has(bareFontInfo)) {
                let readConfig = this._actualReadFontInfo(bareFontInfo);
                if (readConfig.typicalHalfwidthCharacterWidth <= 2 || readConfig.typicalFullwidthCharacterWidth <= 2 || readConfig.spaceWidth <= 2 || readConfig.maxDigitWidth <= 2) {
                    // Hey, it's Bug 14341 ... we couldn't read
                    readConfig = new fontInfo_1.FontInfo({
                        pixelRatio: browser.PixelRatio.value,
                        fontFamily: readConfig.fontFamily,
                        fontWeight: readConfig.fontWeight,
                        fontSize: readConfig.fontSize,
                        fontFeatureSettings: readConfig.fontFeatureSettings,
                        fontVariationSettings: readConfig.fontVariationSettings,
                        lineHeight: readConfig.lineHeight,
                        letterSpacing: readConfig.letterSpacing,
                        isMonospace: readConfig.isMonospace,
                        typicalHalfwidthCharacterWidth: Math.max(readConfig.typicalHalfwidthCharacterWidth, 5),
                        typicalFullwidthCharacterWidth: Math.max(readConfig.typicalFullwidthCharacterWidth, 5),
                        canUseHalfwidthRightwardsArrow: readConfig.canUseHalfwidthRightwardsArrow,
                        spaceWidth: Math.max(readConfig.spaceWidth, 5),
                        middotWidth: Math.max(readConfig.middotWidth, 5),
                        wsmiddotWidth: Math.max(readConfig.wsmiddotWidth, 5),
                        maxDigitWidth: Math.max(readConfig.maxDigitWidth, 5),
                    }, false);
                }
                this._writeToCache(bareFontInfo, readConfig);
            }
            return this._cache.get(bareFontInfo);
        }
        _createRequest(chr, type, all, monospace) {
            const result = new charWidthReader_1.CharWidthRequest(chr, type);
            all.push(result);
            monospace?.push(result);
            return result;
        }
        _actualReadFontInfo(bareFontInfo) {
            const all = [];
            const monospace = [];
            const typicalHalfwidthCharacter = this._createRequest('n', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const typicalFullwidthCharacter = this._createRequest('\uff4d', 0 /* CharWidthRequestType.Regular */, all, null);
            const space = this._createRequest(' ', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit0 = this._createRequest('0', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit1 = this._createRequest('1', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit2 = this._createRequest('2', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit3 = this._createRequest('3', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit4 = this._createRequest('4', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit5 = this._createRequest('5', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit6 = this._createRequest('6', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit7 = this._createRequest('7', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit8 = this._createRequest('8', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit9 = this._createRequest('9', 0 /* CharWidthRequestType.Regular */, all, monospace);
            // monospace test: used for whitespace rendering
            const rightwardsArrow = this._createRequest('→', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const halfwidthRightwardsArrow = this._createRequest('￫', 0 /* CharWidthRequestType.Regular */, all, null);
            // U+00B7 - MIDDLE DOT
            const middot = this._createRequest('·', 0 /* CharWidthRequestType.Regular */, all, monospace);
            // U+2E31 - WORD SEPARATOR MIDDLE DOT
            const wsmiddotWidth = this._createRequest(String.fromCharCode(0x2E31), 0 /* CharWidthRequestType.Regular */, all, null);
            // monospace test: some characters
            const monospaceTestChars = '|/-_ilm%';
            for (let i = 0, len = monospaceTestChars.length; i < len; i++) {
                this._createRequest(monospaceTestChars.charAt(i), 0 /* CharWidthRequestType.Regular */, all, monospace);
                this._createRequest(monospaceTestChars.charAt(i), 1 /* CharWidthRequestType.Italic */, all, monospace);
                this._createRequest(monospaceTestChars.charAt(i), 2 /* CharWidthRequestType.Bold */, all, monospace);
            }
            (0, charWidthReader_1.readCharWidths)(bareFontInfo, all);
            const maxDigitWidth = Math.max(digit0.width, digit1.width, digit2.width, digit3.width, digit4.width, digit5.width, digit6.width, digit7.width, digit8.width, digit9.width);
            let isMonospace = (bareFontInfo.fontFeatureSettings === editorOptions_1.EditorFontLigatures.OFF);
            const referenceWidth = monospace[0].width;
            for (let i = 1, len = monospace.length; isMonospace && i < len; i++) {
                const diff = referenceWidth - monospace[i].width;
                if (diff < -0.001 || diff > 0.001) {
                    isMonospace = false;
                    break;
                }
            }
            let canUseHalfwidthRightwardsArrow = true;
            if (isMonospace && halfwidthRightwardsArrow.width !== referenceWidth) {
                // using a halfwidth rightwards arrow would break monospace...
                canUseHalfwidthRightwardsArrow = false;
            }
            if (halfwidthRightwardsArrow.width > rightwardsArrow.width) {
                // using a halfwidth rightwards arrow would paint a larger arrow than a regular rightwards arrow
                canUseHalfwidthRightwardsArrow = false;
            }
            return new fontInfo_1.FontInfo({
                pixelRatio: browser.PixelRatio.value,
                fontFamily: bareFontInfo.fontFamily,
                fontWeight: bareFontInfo.fontWeight,
                fontSize: bareFontInfo.fontSize,
                fontFeatureSettings: bareFontInfo.fontFeatureSettings,
                fontVariationSettings: bareFontInfo.fontVariationSettings,
                lineHeight: bareFontInfo.lineHeight,
                letterSpacing: bareFontInfo.letterSpacing,
                isMonospace: isMonospace,
                typicalHalfwidthCharacterWidth: typicalHalfwidthCharacter.width,
                typicalFullwidthCharacterWidth: typicalFullwidthCharacter.width,
                canUseHalfwidthRightwardsArrow: canUseHalfwidthRightwardsArrow,
                spaceWidth: space.width,
                middotWidth: middot.width,
                wsmiddotWidth: wsmiddotWidth.width,
                maxDigitWidth: maxDigitWidth
            }, true);
        }
    }
    exports.FontMeasurementsImpl = FontMeasurementsImpl;
    class FontMeasurementsCache {
        constructor() {
            this._keys = Object.create(null);
            this._values = Object.create(null);
        }
        has(item) {
            const itemId = item.getId();
            return !!this._values[itemId];
        }
        get(item) {
            const itemId = item.getId();
            return this._values[itemId];
        }
        put(item, value) {
            const itemId = item.getId();
            this._keys[itemId] = item;
            this._values[itemId] = value;
        }
        remove(item) {
            const itemId = item.getId();
            delete this._keys[itemId];
            delete this._values[itemId];
        }
        getValues() {
            return Object.keys(this._keys).map(id => this._values[id]);
        }
    }
    exports.FontMeasurements = new FontMeasurementsImpl();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udE1lYXN1cmVtZW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL2NvbmZpZy9mb250TWVhc3VyZW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdDaEcsTUFBYSxvQkFBcUIsU0FBUSxzQkFBVTtRQVFuRDtZQUNDLEtBQUssRUFBRSxDQUFDO1lBSlEsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNwRCxnQkFBVyxHQUFnQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUtsRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUkscUJBQXFCLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsOEJBQThCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVlLE9BQU87WUFDdEIsSUFBSSxJQUFJLENBQUMsOEJBQThCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQy9DLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyw4QkFBOEIsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUN6QztZQUNELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxpQkFBaUI7WUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHFCQUFxQixFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8sYUFBYSxDQUFDLElBQWtCLEVBQUUsS0FBZTtZQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxT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LElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSx3Q0FBZ0MsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pHLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3JGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFF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