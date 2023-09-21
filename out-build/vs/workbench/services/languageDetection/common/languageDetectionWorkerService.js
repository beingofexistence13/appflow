/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$CA = exports.$BA = exports.$AA = exports.$zA = void 0;
    exports.$zA = (0, instantiation_1.$Bh)('ILanguageDetectionService');
    exports.$AA = 'languageDetection';
    //#region Telemetry events
    exports.$BA = 'automaticlanguagedetection.likelywrong';
    exports.$CA = 'automaticlanguagedetection.stats';
});
//#endregion
//# sourceMappingURL=languageDetectionWorkerService.js.map