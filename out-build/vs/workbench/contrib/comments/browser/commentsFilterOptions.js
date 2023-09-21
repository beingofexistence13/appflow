/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters", "vs/base/common/strings"], function (require, exports, filters_1, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Vlb = void 0;
    class $Vlb {
        static { this._filter = filters_1.$Fj; }
        static { this._messageFilter = filters_1.$Ej; }
        constructor(filter, showResolved, showUnresolved) {
            this.filter = filter;
            this.showResolved = true;
            this.showUnresolved = true;
            filter = filter.trim();
            this.showResolved = showResolved;
            this.showUnresolved = showUnresolved;
            const negate = filter.startsWith('!');
            this.textFilter = { text: (negate ? strings.$ue(filter, '!') : filter).trim(), negate };
        }
    }
    exports.$Vlb = $Vlb;
});
//# sourceMappingURL=commentsFilterOptions.js.map