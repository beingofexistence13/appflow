/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LV = exports.$KV = exports.$JV = exports.$IV = exports.$HV = void 0;
    exports.$HV = (0, instantiation_1.$Bh)('activityService');
    class BaseBadge {
        constructor(descriptorFn) {
            this.descriptorFn = descriptorFn;
            this.descriptorFn = descriptorFn;
        }
        getDescription() {
            return this.descriptorFn(null);
        }
    }
    class $IV extends BaseBadge {
        constructor(number, descriptorFn) {
            super(descriptorFn);
            this.number = number;
            this.number = number;
        }
        getDescription() {
            return this.descriptorFn(this.number);
        }
    }
    exports.$IV = $IV;
    class $JV extends BaseBadge {
        constructor(text, descriptorFn) {
            super(descriptorFn);
            this.text = text;
        }
    }
    exports.$JV = $JV;
    class $KV extends BaseBadge {
        constructor(icon, descriptorFn) {
            super(descriptorFn);
            this.icon = icon;
        }
    }
    exports.$KV = $KV;
    class $LV extends BaseBadge {
    }
    exports.$LV = $LV;
});
//# sourceMappingURL=activity.js.map