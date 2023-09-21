/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/config/charWidthReader", "vs/editor/common/config/editorOptions", "vs/editor/common/config/fontInfo"], function (require, exports, browser, event_1, lifecycle_1, charWidthReader_1, editorOptions_1, fontInfo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zU = exports.$yU = void 0;
    class $yU extends lifecycle_1.$kc {
        constructor() {
            super();
            this.c = this.B(new event_1.$fd());
            this.onDidChange = this.c.event;
            this.a = new FontMeasurementsCache();
            this.b = -1;
        }
        dispose() {
            if (this.b !== -1) {
                window.clearTimeout(this.b);
                this.b = -1;
            }
            super.dispose();
        }
        /**
         * Clear all cached font information and trigger a change event.
         */
        clearAllFontInfos() {
            this.a = new FontMeasurementsCache();
            this.c.fire();
        }
        f(item, value) {
            this.a.put(item, value);
            if (!value.isTrusted && this.b === -1) {
                // Try reading again after some time
                this.b = window.setTimeout(() => {
                    this.b = -1;
                    this.g();
                }, 5000);
            }
        }
        g() {
            const values = this.a.getValues();
            let somethingRemoved = false;
            for (const item of values) {
                if (!item.isTrusted) {
                    somethingRemoved = true;
                    this.a.remove(item);
                }
            }
            if (somethingRemoved) {
                this.c.fire();
            }
        }
        /**
         * Serialized currently cached font information.
         */
        serializeFontInfo() {
            // Only save trusted font info (that has been measured in this running instance)
            return this.a.getValues().filter(item => item.isTrusted);
        }
        /**
         * Restore previously serialized font informations.
         */
        restoreFontInfo(savedFontInfos) {
            // Take all the saved font info and insert them in the cache without the trusted flag.
            // The reason for this is that a font might have been installed on the OS in the meantime.
            for (const savedFontInfo of savedFontInfos) {
                if (savedFontInfo.version !== fontInfo_1.$Sr) {
                    // cannot use older version
                    continue;
                }
                const fontInfo = new fontInfo_1.$Tr(savedFontInfo, false);
                this.f(fontInfo, fontInfo);
            }
        }
        /**
         * Read font information.
         */
        readFontInfo(bareFontInfo) {
            if (!this.a.has(bareFontInfo)) {
                let readConfig = this.j(bareFontInfo);
                if (readConfig.typicalHalfwidthCharacterWidth <= 2 || readConfig.typicalFullwidthCharacterWidth <= 2 || readConfig.spaceWidth <= 2 || readConfig.maxDigitWidth <= 2) {
                    // Hey, it's Bug 14341 ... we couldn't read
                    readConfig = new fontInfo_1.$Tr({
                        pixelRatio: browser.$WN.value,
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
                this.f(bareFontInfo, readConfig);
            }
            return this.a.get(bareFontInfo);
        }
        h(chr, type, all, monospace) {
            const result = new charWidthReader_1.$wU(chr, type);
            all.push(result);
            monospace?.push(result);
            return result;
        }
        j(bareFontInfo) {
            const all = [];
            const monospace = [];
            const typicalHalfwidthCharacter = this.h('n', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const typicalFullwidthCharacter = this.h('\uff4d', 0 /* CharWidthRequestType.Regular */, all, null);
            const space = this.h(' ', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit0 = this.h('0', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit1 = this.h('1', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit2 = this.h('2', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit3 = this.h('3', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit4 = this.h('4', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit5 = this.h('5', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit6 = this.h('6', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit7 = this.h('7', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit8 = this.h('8', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit9 = this.h('9', 0 /* CharWidthRequestType.Regular */, all, monospace);
            // monospace test: used for whitespace rendering
            const rightwardsArrow = this.h('→', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const halfwidthRightwardsArrow = this.h('￫', 0 /* CharWidthRequestType.Regular */, all, null);
            // U+00B7 - MIDDLE DOT
            const middot = this.h('·', 0 /* CharWidthRequestType.Regular */, all, monospace);
            // U+2E31 - WORD SEPARATOR MIDDLE DOT
            const wsmiddotWidth = this.h(String.fromCharCode(0x2E31), 0 /* CharWidthRequestType.Regular */, all, null);
            // monospace test: some characters
            const monospaceTestChars = '|/-_ilm%';
            for (let i = 0, len = monospaceTestChars.length; i < len; i++) {
                this.h(monospaceTestChars.charAt(i), 0 /* CharWidthRequestType.Regular */, all, monospace);
                this.h(monospaceTestChars.charAt(i), 1 /* CharWidthRequestType.Italic */, all, monospace);
                this.h(monospaceTestChars.charAt(i), 2 /* CharWidthRequestType.Bold */, all, monospace);
            }
            (0, charWidthReader_1.$xU)(bareFontInfo, all);
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
            return new fontInfo_1.$Tr({
                pixelRatio: browser.$WN.value,
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
    exports.$yU = $yU;
    class FontMeasurementsCache {
        constructor() {
            this.a = Object.create(null);
            this.b = Object.create(null);
        }
        has(item) {
            const itemId = item.getId();
            return !!this.b[itemId];
        }
        get(item) {
            const itemId = item.getId();
            return this.b[itemId];
        }
        put(item, value) {
            const itemId = item.getId();
            this.a[itemId] = item;
            this.b[itemId] = value;
        }
        remove(item) {
            const itemId = item.getId();
            delete this.a[itemId];
            delete this.b[itemId];
        }
        getValues() {
            return Object.keys(this.a).map(id => this.b[id]);
        }
    }
    exports.$zU = new $yU();
});
//# sourceMappingURL=fontMeasurements.js.map