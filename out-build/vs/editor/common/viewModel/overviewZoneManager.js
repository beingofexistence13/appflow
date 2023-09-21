/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hV = exports.$gV = exports.$fV = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["MINIMUM_HEIGHT"] = 4] = "MINIMUM_HEIGHT";
    })(Constants || (Constants = {}));
    class $fV {
        constructor(from, to, colorId) {
            this._colorZoneBrand = undefined;
            this.from = from | 0;
            this.to = to | 0;
            this.colorId = colorId | 0;
        }
        static compare(a, b) {
            if (a.colorId === b.colorId) {
                if (a.from === b.from) {
                    return a.to - b.to;
                }
                return a.from - b.from;
            }
            return a.colorId - b.colorId;
        }
    }
    exports.$fV = $fV;
    /**
     * A zone in the overview ruler
     */
    class $gV {
        constructor(startLineNumber, endLineNumber, heightInLines, color) {
            this._overviewRulerZoneBrand = undefined;
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
            this.heightInLines = heightInLines;
            this.color = color;
            this.c = null;
        }
        static compare(a, b) {
            if (a.color === b.color) {
                if (a.startLineNumber === b.startLineNumber) {
                    if (a.heightInLines === b.heightInLines) {
                        return a.endLineNumber - b.endLineNumber;
                    }
                    return a.heightInLines - b.heightInLines;
                }
                return a.startLineNumber - b.startLineNumber;
            }
            return a.color < b.color ? -1 : 1;
        }
        setColorZone(colorZone) {
            this.c = colorZone;
        }
        getColorZones() {
            return this.c;
        }
    }
    exports.$gV = $gV;
    class $hV {
        constructor(getVerticalOffsetForLine) {
            this.c = getVerticalOffsetForLine;
            this.d = [];
            this.e = false;
            this.f = 0;
            this.g = 0;
            this.h = 0;
            this.j = 0;
            this.k = 1;
            this.l = 0;
            this.m = Object.create(null);
            this.n = [];
        }
        getId2Color() {
            return this.n;
        }
        setZones(newZones) {
            this.d = newZones;
            this.d.sort($gV.compare);
        }
        setLineHeight(lineHeight) {
            if (this.f === lineHeight) {
                return false;
            }
            this.f = lineHeight;
            this.e = true;
            return true;
        }
        setPixelRatio(pixelRatio) {
            this.k = pixelRatio;
            this.e = true;
        }
        getDOMWidth() {
            return this.g;
        }
        getCanvasWidth() {
            return this.g * this.k;
        }
        setDOMWidth(width) {
            if (this.g === width) {
                return false;
            }
            this.g = width;
            this.e = true;
            return true;
        }
        getDOMHeight() {
            return this.h;
        }
        getCanvasHeight() {
            return this.h * this.k;
        }
        setDOMHeight(height) {
            if (this.h === height) {
                return false;
            }
            this.h = height;
            this.e = true;
            return true;
        }
        getOuterHeight() {
            return this.j;
        }
        setOuterHeight(outerHeight) {
            if (this.j === outerHeight) {
                return false;
            }
            this.j = outerHeight;
            this.e = true;
            return true;
        }
        resolveColorZones() {
            const colorZonesInvalid = this.e;
            const lineHeight = Math.floor(this.f);
            const totalHeight = Math.floor(this.getCanvasHeight());
            const outerHeight = Math.floor(this.j);
            const heightRatio = totalHeight / outerHeight;
            const halfMinimumHeight = Math.floor(4 /* Constants.MINIMUM_HEIGHT */ * this.k / 2);
            const allColorZones = [];
            for (let i = 0, len = this.d.length; i < len; i++) {
                const zone = this.d[i];
                if (!colorZonesInvalid) {
                    const colorZone = zone.getColorZones();
                    if (colorZone) {
                        allColorZones.push(colorZone);
                        continue;
                    }
                }
                const offset1 = this.c(zone.startLineNumber);
                const offset2 = (zone.heightInLines === 0
                    ? this.c(zone.endLineNumber) + lineHeight
                    : offset1 + zone.heightInLines * lineHeight);
                const y1 = Math.floor(heightRatio * offset1);
                const y2 = Math.floor(heightRatio * offset2);
                let ycenter = Math.floor((y1 + y2) / 2);
                let halfHeight = (y2 - ycenter);
                if (halfHeight < halfMinimumHeight) {
                    halfHeight = halfMinimumHeight;
                }
                if (ycenter - halfHeight < 0) {
                    ycenter = halfHeight;
                }
                if (ycenter + halfHeight > totalHeight) {
                    ycenter = totalHeight - halfHeight;
                }
                const color = zone.color;
                let colorId = this.m[color];
                if (!colorId) {
                    colorId = (++this.l);
                    this.m[color] = colorId;
                    this.n[colorId] = color;
                }
                const colorZone = new $fV(ycenter - halfHeight, ycenter + halfHeight, colorId);
                zone.setColorZone(colorZone);
                allColorZones.push(colorZone);
            }
            this.e = false;
            allColorZones.sort($fV.compare);
            return allColorZones;
        }
    }
    exports.$hV = $hV;
});
//# sourceMappingURL=overviewZoneManager.js.map