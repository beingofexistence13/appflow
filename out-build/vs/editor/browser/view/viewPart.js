/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/viewEventHandler"], function (require, exports, viewEventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GW = exports.PartFingerprint = exports.$FW = void 0;
    class $FW extends viewEventHandler_1.$9U {
        constructor(context) {
            super();
            this._context = context;
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            super.dispose();
        }
    }
    exports.$FW = $FW;
    var PartFingerprint;
    (function (PartFingerprint) {
        PartFingerprint[PartFingerprint["None"] = 0] = "None";
        PartFingerprint[PartFingerprint["ContentWidgets"] = 1] = "ContentWidgets";
        PartFingerprint[PartFingerprint["OverflowingContentWidgets"] = 2] = "OverflowingContentWidgets";
        PartFingerprint[PartFingerprint["OverflowGuard"] = 3] = "OverflowGuard";
        PartFingerprint[PartFingerprint["OverlayWidgets"] = 4] = "OverlayWidgets";
        PartFingerprint[PartFingerprint["ScrollableElement"] = 5] = "ScrollableElement";
        PartFingerprint[PartFingerprint["TextArea"] = 6] = "TextArea";
        PartFingerprint[PartFingerprint["ViewLines"] = 7] = "ViewLines";
        PartFingerprint[PartFingerprint["Minimap"] = 8] = "Minimap";
    })(PartFingerprint || (exports.PartFingerprint = PartFingerprint = {}));
    class $GW {
        static write(target, partId) {
            target.setAttribute('data-mprt', String(partId));
        }
        static read(target) {
            const r = target.getAttribute('data-mprt');
            if (r === null) {
                return 0 /* PartFingerprint.None */;
            }
            return parseInt(r, 10);
        }
        static collect(child, stopAt) {
            const result = [];
            let resultLen = 0;
            while (child && child !== child.ownerDocument.body) {
                if (child === stopAt) {
                    break;
                }
                if (child.nodeType === child.ELEMENT_NODE) {
                    result[resultLen++] = this.read(child);
                }
                child = child.parentElement;
            }
            const r = new Uint8Array(resultLen);
            for (let i = 0; i < resultLen; i++) {
                r[i] = result[resultLen - i - 1];
            }
            return r;
        }
    }
    exports.$GW = $GW;
});
//# sourceMappingURL=viewPart.js.map