/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/network"], function (require, exports, instantiation_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gq = exports.$Fq = exports.$Eq = exports.ItemActivation = exports.QuickInputHideReason = exports.$Dq = void 0;
    exports.$Dq = { ctrlCmd: false, alt: false };
    var QuickInputHideReason;
    (function (QuickInputHideReason) {
        /**
         * Focus moved away from the quick input.
         */
        QuickInputHideReason[QuickInputHideReason["Blur"] = 1] = "Blur";
        /**
         * An explicit user gesture, e.g. pressing Escape key.
         */
        QuickInputHideReason[QuickInputHideReason["Gesture"] = 2] = "Gesture";
        /**
         * Anything else.
         */
        QuickInputHideReason[QuickInputHideReason["Other"] = 3] = "Other";
    })(QuickInputHideReason || (exports.QuickInputHideReason = QuickInputHideReason = {}));
    var ItemActivation;
    (function (ItemActivation) {
        ItemActivation[ItemActivation["NONE"] = 0] = "NONE";
        ItemActivation[ItemActivation["FIRST"] = 1] = "FIRST";
        ItemActivation[ItemActivation["SECOND"] = 2] = "SECOND";
        ItemActivation[ItemActivation["LAST"] = 3] = "LAST";
    })(ItemActivation || (exports.ItemActivation = ItemActivation = {}));
    class $Eq {
        constructor(a) {
            this.a = a;
        }
        getItemLabel(entry) {
            return entry.label;
        }
        getItemDescription(entry) {
            if (this.a?.skipDescription) {
                return undefined;
            }
            return entry.description;
        }
        getItemPath(entry) {
            if (this.a?.skipPath) {
                return undefined;
            }
            if (entry.resource?.scheme === network_1.Schemas.file) {
                return entry.resource.fsPath;
            }
            return entry.resource?.path;
        }
    }
    exports.$Eq = $Eq;
    exports.$Fq = new $Eq();
    //#endregion
    exports.$Gq = (0, instantiation_1.$Bh)('quickInputService');
});
//# sourceMappingURL=quickInput.js.map