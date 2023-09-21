/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/workbench/contrib/extensions/common/reportExtensionIssueAction"], function (require, exports, abstractRuntimeExtensionsEditor_1, reportExtensionIssueAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RuntimeExtensionsEditor = void 0;
    class RuntimeExtensionsEditor extends abstractRuntimeExtensionsEditor_1.AbstractRuntimeExtensionsEditor {
        _getProfileInfo() {
            return null;
        }
        _getUnresponsiveProfile(extensionId) {
            return undefined;
        }
        _createSlowExtensionAction(element) {
            return null;
        }
        _createReportExtensionIssueAction(element) {
            if (element.marketplaceInfo) {
                return this._instantiationService.createInstance(reportExtensionIssueAction_1.ReportExtensionIssueAction, element.description);
            }
            return null;
        }
        _createSaveExtensionHostProfileAction() {
            return null;
        }
        _createProfileAction() {
            return null;
        }
    }
    exports.RuntimeExtensionsEditor = RuntimeExtensionsEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlclJ1bnRpbWVFeHRlbnNpb25zRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2Jyb3dzZXJSdW50aW1lRXh0ZW5zaW9uc0VkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSx1QkFBd0IsU0FBUSxpRUFBK0I7UUFFakUsZUFBZTtZQUN4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFUyx1QkFBdUIsQ0FBQyxXQUFnQztZQUNqRSxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRVMsMEJBQTBCLENBQUMsT0FBMEI7WUFDOUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRVMsaUNBQWlDLENBQUMsT0FBMEI7WUFDckUsSUFBSSxPQUFPLENBQUMsZUFBZSxFQUFFO2dCQUM1QixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsdURBQTBCLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2xHO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRVMscUNBQXFDO1lBQzlDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVTLG9CQUFvQjtZQUM3QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FDRDtJQTVCRCwwREE0QkMifQ==