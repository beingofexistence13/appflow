/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorZoom = void 0;
    exports.EditorZoom = new class {
        constructor() {
            this.a = 0;
            this.b = new event_1.$fd();
            this.onDidChangeZoomLevel = this.b.event;
        }
        getZoomLevel() {
            return this.a;
        }
        setZoomLevel(zoomLevel) {
            zoomLevel = Math.min(Math.max(-5, zoomLevel), 20);
            if (this.a === zoomLevel) {
                return;
            }
            this.a = zoomLevel;
            this.b.fire(this.a);
        }
    };
});
//# sourceMappingURL=editorZoom.js.map