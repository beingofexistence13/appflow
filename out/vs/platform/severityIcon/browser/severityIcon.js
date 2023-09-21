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
                    return 'severity-ignore ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.info);
                case severity_1.default.Info:
                    return themables_1.ThemeIcon.asClassName(codicons_1.Codicon.info);
                case severity_1.default.Warning:
                    return themables_1.ThemeIcon.asClassName(codicons_1.Codicon.warning);
                case severity_1.default.Error:
                    return themables_1.ThemeIcon.asClassName(codicons_1.Codicon.error);
                default:
                    return '';
            }
        }
        SeverityIcon.className = className;
    })(SeverityIcon || (exports.SeverityIcon = SeverityIcon = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V2ZXJpdHlJY29uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vc2V2ZXJpdHlJY29uL2Jyb3dzZXIvc2V2ZXJpdHlJY29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxJQUFpQixZQUFZLENBZ0I1QjtJQWhCRCxXQUFpQixZQUFZO1FBRTVCLFNBQWdCLFNBQVMsQ0FBQyxRQUFrQjtZQUMzQyxRQUFRLFFBQVEsRUFBRTtnQkFDakIsS0FBSyxrQkFBUSxDQUFDLE1BQU07b0JBQ25CLE9BQU8sa0JBQWtCLEdBQUcscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakUsS0FBSyxrQkFBUSxDQUFDLElBQUk7b0JBQ2pCLE9BQU8scUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUMsS0FBSyxrQkFBUSxDQUFDLE9BQU87b0JBQ3BCLE9BQU8scUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDL0MsS0FBSyxrQkFBUSxDQUFDLEtBQUs7b0JBQ2xCLE9BQU8scUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDN0M7b0JBQ0MsT0FBTyxFQUFFLENBQUM7YUFDWDtRQUNGLENBQUM7UUFiZSxzQkFBUyxZQWF4QixDQUFBO0lBQ0YsQ0FBQyxFQWhCZ0IsWUFBWSw0QkFBWixZQUFZLFFBZ0I1QiJ9