/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/severity", "vs/css!./media/severityIcon"], function (require, exports, codicons_1, themables_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SeverityIcon = void 0;
    var SeverityIcon;
    (function (SeverityIcon) {
        function className(severity) {
            switch (severity) {
                case severity_1.default.Ignore:
                    return 'severity-ignore ' + themables_1.ThemeIcon.asClassName(codicons_1.$Pj.info);
                case severity_1.default.Info:
                    return themables_1.ThemeIcon.asClassName(codicons_1.$Pj.info);
                case severity_1.default.Warning:
                    return themables_1.ThemeIcon.asClassName(codicons_1.$Pj.warning);
                case severity_1.default.Error:
                    return themables_1.ThemeIcon.asClassName(codicons_1.$Pj.error);
                default:
                    return '';
            }
        }
        SeverityIcon.className = className;
    })(SeverityIcon || (exports.SeverityIcon = SeverityIcon = {}));
});
//# sourceMappingURL=severityIcon.js.map