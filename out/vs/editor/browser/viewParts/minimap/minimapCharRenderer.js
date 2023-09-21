/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./minimapCharSheet", "vs/base/common/uint"], function (require, exports, minimapCharSheet_1, uint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MinimapCharRenderer = void 0;
    class MinimapCharRenderer {
        constructor(charData, scale) {
            this.scale = scale;
            this._minimapCharRendererBrand = undefined;
            this.charDataNormal = MinimapCharRenderer.soften(charData, 12 / 15);
            this.charDataLight = MinimapCharRenderer.soften(charData, 50 / 60);
        }
        static soften(input, ratio) {
            const result = new Uint8ClampedArray(input.length);
            for (let i = 0, len = input.length; i < len; i++) {
                result[i] = (0, uint_1.toUint8)(input[i] * ratio);
            }
            return result;
        }
        renderChar(target, dx, dy, chCode, color, foregroundAlpha, backgroundColor, backgroundAlpha, fontScale, useLighterFont, force1pxHeight) {
            const charWidth = 1 /* Constants.BASE_CHAR_WIDTH */ * this.scale;
            const charHeight = 2 /* Constants.BASE_CHAR_HEIGHT */ * this.scale;
            const renderHeight = (force1pxHeight ? 1 : charHeight);
            if (dx + charWidth > target.width || dy + renderHeight > target.height) {
                console.warn('bad render request outside image data');
                return;
            }
            const charData = useLighterFont ? this.charDataLight : this.charDataNormal;
            const charIndex = (0, minimapCharSheet_1.getCharIndex)(chCode, fontScale);
            const destWidth = target.width * 4 /* Constants.RGBA_CHANNELS_CNT */;
            const backgroundR = backgroundColor.r;
            const backgroundG = backgroundColor.g;
            const backgroundB = backgroundColor.b;
            const deltaR = color.r - backgroundR;
            const deltaG = color.g - backgroundG;
            const deltaB = color.b - backgroundB;
            const destAlpha = Math.max(foregroundAlpha, backgroundAlpha);
            const dest = target.data;
            let sourceOffset = charIndex * charWidth * charHeight;
            let row = dy * destWidth + dx * 4 /* Constants.RGBA_CHANNELS_CNT */;
            for (let y = 0; y < renderHeight; y++) {
                let column = row;
                for (let x = 0; x < charWidth; x++) {
                    const c = (charData[sourceOffset++] / 255) * (foregroundAlpha / 255);
                    dest[column++] = backgroundR + deltaR * c;
                    dest[column++] = backgroundG + deltaG * c;
                    dest[column++] = backgroundB + deltaB * c;
                    dest[column++] = destAlpha;
                }
                row += destWidth;
            }
        }
        blockRenderChar(target, dx, dy, color, foregroundAlpha, backgroundColor, backgroundAlpha, force1pxHeight) {
            const charWidth = 1 /* Constants.BASE_CHAR_WIDTH */ * this.scale;
            const charHeight = 2 /* Constants.BASE_CHAR_HEIGHT */ * this.scale;
            const renderHeight = (force1pxHeight ? 1 : charHeight);
            if (dx + charWidth > target.width || dy + renderHeight > target.height) {
                console.warn('bad render request outside image data');
                return;
            }
            const destWidth = target.width * 4 /* Constants.RGBA_CHANNELS_CNT */;
            const c = 0.5 * (foregroundAlpha / 255);
            const backgroundR = backgroundColor.r;
            const backgroundG = backgroundColor.g;
            const backgroundB = backgroundColor.b;
            const deltaR = color.r - backgroundR;
            const deltaG = color.g - backgroundG;
            const deltaB = color.b - backgroundB;
            const colorR = backgroundR + deltaR * c;
            const colorG = backgroundG + deltaG * c;
            const colorB = backgroundB + deltaB * c;
            const destAlpha = Math.max(foregroundAlpha, backgroundAlpha);
            const dest = target.data;
            let row = dy * destWidth + dx * 4 /* Constants.RGBA_CHANNELS_CNT */;
            for (let y = 0; y < renderHeight; y++) {
                let column = row;
                for (let x = 0; x < charWidth; x++) {
                    dest[column++] = colorR;
                    dest[column++] = colorG;
                    dest[column++] = colorB;
                    dest[column++] = destAlpha;
                }
                row += destWidth;
            }
        }
    }
    exports.MinimapCharRenderer = MinimapCharRenderer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaW1hcENoYXJSZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy9taW5pbWFwL21pbmltYXBDaGFyUmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsbUJBQW1CO1FBTS9CLFlBQVksUUFBMkIsRUFBa0IsS0FBYTtZQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7WUFMdEUsOEJBQXlCLEdBQVMsU0FBUyxDQUFDO1lBTTNDLElBQUksQ0FBQyxjQUFjLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUF3QixFQUFFLEtBQWE7WUFDNUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakQsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUEsY0FBTyxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQzthQUN0QztZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVNLFVBQVUsQ0FDaEIsTUFBaUIsRUFDakIsRUFBVSxFQUNWLEVBQVUsRUFDVixNQUFjLEVBQ2QsS0FBWSxFQUNaLGVBQXVCLEVBQ3ZCLGVBQXNCLEVBQ3RC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