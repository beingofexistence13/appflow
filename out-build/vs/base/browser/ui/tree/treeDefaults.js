/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/actions", "vs/nls!vs/base/browser/ui/tree/treeDefaults"], function (require, exports, actions_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sS = void 0;
    class $sS extends actions_1.$gi {
        constructor(a, enabled) {
            super('vs.tree.collapse', nls.localize(0, null), 'collapse-all', enabled);
            this.a = a;
        }
        async run() {
            this.a.collapseAll();
            this.a.setSelection([]);
            this.a.setFocus([]);
        }
    }
    exports.$sS = $sS;
});
//# sourceMappingURL=treeDefaults.js.map