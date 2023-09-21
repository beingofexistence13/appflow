/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/workbench/contrib/extensions/common/reportExtensionIssueAction"], function (require, exports, abstractRuntimeExtensionsEditor_1, reportExtensionIssueAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$04b = void 0;
    class $04b extends abstractRuntimeExtensionsEditor_1.$6Ub {
        lb() {
            return null;
        }
        mb(extensionId) {
            return undefined;
        }
        nb(element) {
            return null;
        }
        ob(element) {
            if (element.marketplaceInfo) {
                return this.y.createInstance(reportExtensionIssueAction_1.$94b, element.description);
            }
            return null;
        }
        pb() {
            return null;
        }
        qb() {
            return null;
        }
    }
    exports.$04b = $04b;
});
//# sourceMappingURL=browserRuntimeExtensionsEditor.js.map