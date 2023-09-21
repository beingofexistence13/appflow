/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gI = exports.ISCMRepositorySortKey = exports.SCMInputChangeReason = exports.InputValidationType = exports.$fI = exports.$eI = exports.$dI = exports.$cI = exports.$bI = void 0;
    exports.$bI = 'workbench.view.scm';
    exports.$cI = 'workbench.scm';
    exports.$dI = 'workbench.scm.repositories';
    exports.$eI = 'workbench.scm.sync';
    exports.$fI = (0, instantiation_1.$Bh)('scm');
    var InputValidationType;
    (function (InputValidationType) {
        InputValidationType[InputValidationType["Error"] = 0] = "Error";
        InputValidationType[InputValidationType["Warning"] = 1] = "Warning";
        InputValidationType[InputValidationType["Information"] = 2] = "Information";
    })(InputValidationType || (exports.InputValidationType = InputValidationType = {}));
    var SCMInputChangeReason;
    (function (SCMInputChangeReason) {
        SCMInputChangeReason[SCMInputChangeReason["HistoryPrevious"] = 0] = "HistoryPrevious";
        SCMInputChangeReason[SCMInputChangeReason["HistoryNext"] = 1] = "HistoryNext";
    })(SCMInputChangeReason || (exports.SCMInputChangeReason = SCMInputChangeReason = {}));
    var ISCMRepositorySortKey;
    (function (ISCMRepositorySortKey) {
        ISCMRepositorySortKey["DiscoveryTime"] = "discoveryTime";
        ISCMRepositorySortKey["Name"] = "name";
        ISCMRepositorySortKey["Path"] = "path";
    })(ISCMRepositorySortKey || (exports.ISCMRepositorySortKey = ISCMRepositorySortKey = {}));
    exports.$gI = (0, instantiation_1.$Bh)('scmView');
});
//# sourceMappingURL=scm.js.map