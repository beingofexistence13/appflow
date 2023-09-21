/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/viewParts/minimap/minimapCharRenderer", "vs/editor/browser/viewParts/minimap/minimapCharSheet", "vs/editor/browser/viewParts/minimap/minimapPreBaked", "vs/base/common/uint"], function (require, exports, minimapCharRenderer_1, minimapCharSheet_1, minimapPreBaked_1, uint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MinimapCharRendererFactory = void 0;
    /**
     * Creates character renderers. It takes a 'scale' that determines how large
     * characters should be drawn. Using this, it draws data into a canvas and
     * then downsamples the characters as necessary for the current display.
     * This makes rendering more efficient, rather than drawing a full (tiny)
     * font, or downsampling in real-time.
     */
    class MinimapCharRendererFactory {
        /**
         * Creates a new character renderer factory with the given scale.
         */
        static create(scale, fontFamily) {
            // renderers are immutable. By default we'll 'create' a new minimap
            // character renderer whenever we switch editors, no need to do extra work.
            if (this.lastCreated && scale === this.lastCreated.scale && fontFamily === this.lastFontFamily) {
                return this.lastCreated;
            }
            let factory;
            if (minimapPreBaked_1.prebakedMiniMaps[scale]) {
                factory = new minimapCharRenderer_1.MinimapCharRenderer(minimapPreBaked_1.prebakedMiniMaps[scale](), scale);
            }
            else {
                factory = MinimapCharRendererFactory.createFromSampleData(MinimapCharRendererFactory.createSampleData(fontFamily).data, scale);
            }
            this.lastFontFamily = fontFamily;
            this.lastCreated = factory;
            return factory;
        }
        /**
         * Creates the font sample data, writing to a canvas.
         */
        static createSampleData(fontFamily) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.style.height = `${16 /* Constants.SAMPLED_CHAR_HEIGHT */}px`;
            canvas.height = 16 /* Constants.SAMPLED_CHAR_HEIGHT */;
            canvas.width = 96 /* Constants.CHAR_COUNT */ * 10 /* Constants.SAMPLED_CHAR_WIDTH */;
            canvas.style.width = 96 /* Constants.CHAR_COUNT */ * 10 /* Constants.SAMPLED_CHAR_WIDTH */ + 'px';
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${16 /* Constants.SAMPLED_CHAR_HEIGHT */}px ${fontFamily}`;
            ctx.textBaseline = 'middle';
            let x = 0;
            for (const code of minimapCharSheet_1.allCharCodes) {
                ctx.fillText(String.fromCharCode(code), x, 16 /* Constants.SAMPLED_CHAR_HEIGHT */ / 2);
                x += 10 /* Constants.SAMPLED_CHAR_WIDTH */;
            }
            return ctx.getImageData(0, 0, 96 /* Constants.CHAR_COUNT */ * 10 /* Constants.SAMPLED_CHAR_WIDTH */, 16 /* Constants.SAMPLED_CHAR_HEIGHT */);
        }
        /**
         * Creates a character renderer from the canvas sample data.
         */
        static createFromSampleData(source, scale) {
            const expectedLength = 16 /* Constants.SAMPLED_CHAR_HEIGHT */ * 10 /* Constants.SAMPLED_CHAR_WIDTH */ * 4 /* Constants.RGBA_CHANNELS_CNT */ * 96 /* Constants.CHAR_COUNT */;
            if (source.length !== expectedLength) {
                throw new Error('Unexpected source in MinimapCharRenderer');
            }
            const charData = MinimapCharRendererFactory._downsample(source, scale);
            return new minimapCharRenderer_1.MinimapCharRenderer(charData, scale);
        }
        static _downsampleChar(source, sourceOffset, dest, destOffset, scale) {
            const width = 1 /* Constants.BASE_CHAR_WIDTH */ * scale;
            const height = 2 /* Constants.BASE_CHAR_HEIGHT */ * scale;
            let targetIndex = destOffset;
            let brightest = 0;
            // This is essentially an ad-hoc rescaling algorithm. Standard approaches
            // like bicubic interpolation are awesome for scaling between image sizes,
            // but don't work so well when scaling to very small pixel values, we end
            // up with blurry, indistinct forms.
            //
            // The approach taken here is simply mapping each source pixel to the target
            // pixels, and taking the weighted values for all pixels in each, and then
            // averaging them out. Finally we apply an intensity boost in _downsample,
            // since when scaling to the smallest pixel sizes there's more black space
            // which causes characters to be much less distinct.
            for (let y = 0; y < height; y++) {
                // 1. For this destination pixel, get the source pixels we're sampling
                // from (x1, y1) to the next pixel (x2, y2)
                const sourceY1 = (y / height) * 16 /* Constants.SAMPLED_CHAR_HEIGHT */;
                const sourceY2 = ((y + 1) / height) * 16 /* Constants.SAMPLED_CHAR_HEIGHT */;
                for (let x = 0; x < width; x++) {
                    const sourceX1 = (x / width) * 10 /* Constants.SAMPLED_CHAR_WIDTH */;
                    const sourceX2 = ((x + 1) / width) * 10 /* Constants.SAMPLED_CHAR_WIDTH */;
                    // 2. Sample all of them, summing them up and weighting them. Similar
                    // to bilinear interpolation.
                    let value = 0;
                    let samples = 0;
                    for (let sy = sourceY1; sy < sourceY2; sy++) {
                        const sourceRow = sourceOffset + Math.floor(sy) * 3840 /* Constants.RGBA_SAMPLED_ROW_WIDTH */;
                        const yBalance = 1 - (sy - Math.floor(sy));
                        for (let sx = sourceX1; sx < sourceX2; sx++) {
                            const xBalance = 1 - (sx - Math.floor(sx));
                            const sourceIndex = sourceRow + Math.floor(sx) * 4 /* Constants.RGBA_CHANNELS_CNT */;
                            const weight = xBalance * yBalance;
                            samples += weight;
                            value += ((source[sourceIndex] * source[sourceIndex + 3]) / 255) * weight;
                        }
                    }
                    const final = value / samples;
                    brightest = Math.max(brightest, final);
                    dest[targetIndex++] = (0, uint_1.toUint8)(final);
                }
            }
            return brightest;
        }
        static _downsample(data, scale) {
            const pixelsPerCharacter = 2 /* Constants.BASE_CHAR_HEIGHT */ * scale * 1 /* Constants.BASE_CHAR_WIDTH */ * scale;
            const resultLen = pixelsPerCharacter * 96 /* Constants.CHAR_COUNT */;
            const result = new Uint8ClampedArray(resultLen);
            let resultOffset = 0;
            let sourceOffset = 0;
            let brightest = 0;
            for (let charIndex = 0; charIndex < 96 /* Constants.CHAR_COUNT */; charIndex++) {
                brightest = Math.max(brightest, this._downsampleChar(data, sourceOffset, result, resultOffset, scale));
                resultOffset += pixelsPerCharacter;
                sourceOffset += 10 /* Constants.SAMPLED_CHAR_WIDTH */ * 4 /* Constants.RGBA_CHANNELS_CNT */;
            }
            if (brightest > 0) {
                const adjust = 255 / brightest;
                for (let i = 0; i < resultLen; i++) {
                    result[i] *= adjust;
                }
            }
            return result;
        }
    }
    exports.MinimapCharRendererFactory = MinimapCharRendererFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaW1hcENoYXJSZW5kZXJlckZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvbWluaW1hcC9taW5pbWFwQ2hhclJlbmRlcmVyRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEc7Ozs7OztPQU1HO0lBQ0gsTUFBYSwwQkFBMEI7UUFJdEM7O1dBRUc7UUFDSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWEsRUFBRSxVQUFrQjtZQUNyRCxtRUFBbUU7WUFDbkUsMkVBQTJFO1lBQzNFLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQy9GLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQzthQUN4QjtZQUVELElBQUksT0FBNEIsQ0FBQztZQUNqQyxJQUFJLGtDQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM1QixPQUFPLEdBQUcsSUFBSSx5Q0FBbUIsQ0FBQyxrQ0FBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3BFO2lCQUFNO2dCQUNOLE9BQU8sR0FBRywwQkFBMEIsQ0FBQyxvQkFBb0IsQ0FDeEQsMEJBQTBCLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUM1RCxLQUFLLENBQ0wsQ0FBQzthQUNGO1lBRUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUM7WUFDakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7WUFDM0IsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksTUFBTSxDQUFDLGdCQUFnQixDQUFDLFVBQWtCO1lBQ2hELE1BQU0sTUFBTSxHQUFH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