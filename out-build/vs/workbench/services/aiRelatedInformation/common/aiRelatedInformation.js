/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RelatedInformationType = exports.$YJ = void 0;
    exports.$YJ = (0, instantiation_1.$Bh)('IAiRelatedInformationService');
    var RelatedInformationType;
    (function (RelatedInformationType) {
        RelatedInformationType[RelatedInformationType["SymbolInformation"] = 1] = "SymbolInformation";
        RelatedInformationType[RelatedInformationType["CommandInformation"] = 2] = "CommandInformation";
        RelatedInformationType[RelatedInformationType["SearchInformation"] = 3] = "SearchInformation";
        RelatedInformationType[RelatedInformationType["SettingInformation"] = 4] = "SettingInformation";
    })(RelatedInformationType || (exports.RelatedInformationType = RelatedInformationType = {}));
});
//# sourceMappingURL=aiRelatedInformation.js.map