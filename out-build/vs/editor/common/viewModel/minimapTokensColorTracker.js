/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/rgba", "vs/editor/common/languages"], function (require, exports, event_1, lifecycle_1, rgba_1, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FX = void 0;
    class $FX extends lifecycle_1.$kc {
        static { this.c = null; }
        static getInstance() {
            if (!this.c) {
                this.c = (0, lifecycle_1.$dc)(new $FX());
            }
            return this.c;
        }
        constructor() {
            super();
            this.j = new event_1.$fd();
            this.onDidChange = this.j.event;
            this.m();
            this.B(languages_1.$bt.onDidChange(e => {
                if (e.changedColorMap) {
                    this.m();
                }
            }));
        }
        m() {
            const colorMap = languages_1.$bt.getColorMap();
            if (!colorMap) {
                this.f = [rgba_1.$BX.Empty];
                this.h = true;
                return;
            }
            this.f = [rgba_1.$BX.Empty];
            for (let colorId = 1; colorId < colorMap.length; colorId++) {
                const source = colorMap[colorId].rgba;
                // Use a VM friendly data-type
                this.f[colorId] = new rgba_1.$BX(source.r, source.g, source.b, Math.round(source.a * 255));
            }
            const backgroundLuminosity = colorMap[2 /* ColorId.DefaultBackground */].getRelativeLuminance();
            this.h = backgroundLuminosity >= 0.5;
            this.j.fire(undefined);
        }
        getColor(colorId) {
            if (colorId < 1 || colorId >= this.f.length) {
                // background color (basically invisible)
                colorId = 2 /* ColorId.DefaultBackground */;
            }
            return this.f[colorId];
        }
        backgroundIsLight() {
            return this.h;
        }
    }
    exports.$FX = $FX;
});
//# sourceMappingURL=minimapTokensColorTracker.js.map