/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol"], function (require, exports, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostClipboard = void 0;
    class ExtHostClipboard {
        constructor(mainContext) {
            const proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadClipboard);
            this.value = Object.freeze({
                readText() {
                    return proxy.$readText();
                },
                writeText(value) {
                    return proxy.$writeText(value);
                }
            });
        }
    }
    exports.ExtHostClipboard = ExtHostClipboard;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENsaXBib2FyZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RDbGlwYm9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQWEsZ0JBQWdCO1FBSTVCLFlBQVksV0FBeUI7WUFDcEMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUMxQixRQUFRO29CQUNQLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUMxQixDQUFDO2dCQUNELFNBQVMsQ0FBQyxLQUFhO29CQUN0QixPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFmRCw0Q0FlQyJ9