/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/localHistory/browser/localHistory", "vs/base/common/codicons", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls_1, codicons_1, platform_1, contextkey_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$C1b = exports.$B1b = exports.$A1b = exports.$z1b = exports.$y1b = void 0;
    let localHistoryDateFormatter = undefined;
    function $y1b() {
        if (!localHistoryDateFormatter) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            let formatter;
            try {
                formatter = new Intl.DateTimeFormat(platform_1.$v, options);
            }
            catch (error) {
                formatter = new Intl.DateTimeFormat(undefined, options); // error can happen when language is invalid (https://github.com/microsoft/vscode/issues/147086)
            }
            localHistoryDateFormatter = {
                format: date => formatter.format(date)
            };
        }
        return localHistoryDateFormatter;
    }
    exports.$y1b = $y1b;
    exports.$z1b = 'localHistory:item';
    exports.$A1b = contextkey_1.$Ii.equals('timelineItem', exports.$z1b);
    exports.$B1b = (0, iconRegistry_1.$9u)('localHistory-icon', codicons_1.$Pj.circleOutline, (0, nls_1.localize)(0, null));
    exports.$C1b = (0, iconRegistry_1.$9u)('localHistory-restore', codicons_1.$Pj.check, (0, nls_1.localize)(1, null));
});
//# sourceMappingURL=localHistory.js.map