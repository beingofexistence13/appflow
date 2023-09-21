/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OverviewZoneManager = exports.OverviewRulerZone = exports.ColorZone = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["MINIMUM_HEIGHT"] = 4] = "MINIMUM_HEIGHT";
    })(Constants || (Constants = {}));
    class ColorZone {
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
    exports.ColorZone = ColorZone;
    /**
     * A zone in the overview ruler
     */
    class OverviewRulerZone {
        constructor(startLineNumber, endLineNumber, heightInLines, color) {
            this._overviewRulerZoneBrand = undefined;
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
            this.heightInLines = heightInLines;
            this.color = color;
            this._colorZone = null;
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
            this._colorZone = colorZone;
        }
        getColorZones() {
            return this._colorZone;
        }
    }
    exports.OverviewRulerZone = OverviewRulerZone;
    class OverviewZoneManager {
        constructor(getVerticalOffsetForLine) {
            this._getVerticalOffsetForLine = getVerticalOffsetForLine;
            this._zones = [];
            this._colorZonesInvalid = false;
            this._lineHeight = 0;
            this._domWidth = 0;
            this._domHeight = 0;
            this._outerHeight = 0;
            this._pixelRatio = 1;
            this._lastAssignedId = 0;
            this._color2Id = Object.create(null);
            this._id2Color = [];
        }
        getId2Color() {
            return this._id2Color;
        }
        setZones(newZones) {
            this._zones = newZones;
            this._zones.sort(OverviewRulerZone.compare);
        }
        setLineHeight(lineHeight) {
            if (this._lineHeight === lineHeight) {
                return false;
            }
            this._lineHeight = lineHeight;
            this._colorZonesInvalid = true;
            return true;
        }
        setPixelRatio(pixelRatio) {
            this._pixelRatio = pixelRatio;
            this._colorZonesInvalid = true;
        }
        getDOMWidth() {
            return this._domWidth;
        }
        getCanvasWidth() {
            return this._domWidth * this._pixelRatio;
        }
        setDOMWidth(width) {
            if (this._domWidth === width) {
                return false;
            }
            this._domWidth = width;
            this._colorZonesInvalid = true;
            return true;
        }
        getDOMHeight() {
            return this._domHeight;
        }
        getCanvasHeight() {
            return this._domHeight * this._pixelRatio;
        }
        setDOMHeight(height) {
            if (this._domHeight === height) {
                return false;
            }
            this._domHeight = height;
            this._colorZonesInvalid = true;
            return true;
        }
        getOuterHeight() {
            return this._outerHeight;
        }
        setOuterHeight(outerHeight) {
            if (this._outerHeight === outerHeight) {
                return false;
            }
            this._outerHeight = outerHeight;
            this._colorZonesInvalid = true;
            return true;
        }
        resolveColorZones() {
            const colorZonesInvalid = this._colorZonesInvalid;
            const lineHeight = Math.floor(this._lineHeight);
            const totalHeight = Math.floor(this.getCanvasHeight());
            const outerHeight = Math.floor(this._outerHeight);
            const heightRatio = totalHeight / outerHeight;
            const halfMinimumHeight = Math.floor(4 /* Constants.MINIMUM_HEIGHT */ * this._pixelRatio / 2);
            const allColorZones = [];
            for (let i = 0, len = this._zones.length; i < len; i++) {
                const zone = this._zones[i];
                if (!colorZonesInvalid) {
                    const colorZone = zone.getColorZones();
                    if (colorZone) {
                        allColorZones.push(colorZone);
                        continue;
                    }
                }
                const offset1 = this._getVerticalOffsetForLine(zone.startLineNumber);
                const offset2 = (zone.heightInLines === 0
                    ? this._getVerticalOffsetForLine(zone.endLineNumber) + lineHeight
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
                let colorId = this._color2Id[color];
                if (!colorId) {
                    colorId = (++this._lastAssignedId);
                    this._color2Id[color] = colorId;
                    this._id2Color[colorId] = color;
                }
                const colorZone = new ColorZone(ycenter - halfHeight, ycenter + halfHeight, colorId);
                zone.setColorZone(colorZone);
                allColorZones.push(colorZone);
            }
            this._colorZonesInvalid = false;
            allColorZones.sort(ColorZone.compare);
            return allColorZones;
        }
    }
    exports.OverviewZoneManager = OverviewZoneManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcnZpZXdab25lTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdmlld01vZGVsL292ZXJ2aWV3Wm9uZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLElBQVcsU0FFVjtJQUZELFdBQVcsU0FBUztRQUNuQiw2REFBa0IsQ0FBQTtJQUNuQixDQUFDLEVBRlUsU0FBUyxLQUFULFNBQVMsUUFFbkI7SUFFRCxNQUFhLFNBQVM7UUFPckIsWUFBWSxJQUFZLEVBQUUsRUFBVSxFQUFFLE9BQWU7WUFOckQsb0JBQWUsR0FBUyxTQUFTLENBQUM7WUFPakMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBWSxFQUFFLENBQVk7WUFDL0MsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFO29CQUN0QixPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztpQkFDbkI7Z0JBQ0QsT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7YUFDdkI7WUFDRCxPQUFPLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUM5QixDQUFDO0tBQ0Q7SUF0QkQsOEJBc0JDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLGlCQUFpQjtRQWE3QixZQUNDLGVBQXVCLEVBQ3ZCLGFB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