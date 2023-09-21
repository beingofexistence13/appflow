/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TUb = exports.RecommendationsNotificationResult = exports.$SUb = exports.RecommendationSource = void 0;
    var RecommendationSource;
    (function (RecommendationSource) {
        RecommendationSource[RecommendationSource["FILE"] = 1] = "FILE";
        RecommendationSource[RecommendationSource["WORKSPACE"] = 2] = "WORKSPACE";
        RecommendationSource[RecommendationSource["EXE"] = 3] = "EXE";
    })(RecommendationSource || (exports.RecommendationSource = RecommendationSource = {}));
    function $SUb(source) {
        switch (source) {
            case 1 /* RecommendationSource.FILE */: return 'file';
            case 2 /* RecommendationSource.WORKSPACE */: return 'workspace';
            case 3 /* RecommendationSource.EXE */: return 'exe';
        }
    }
    exports.$SUb = $SUb;
    var RecommendationsNotificationResult;
    (function (RecommendationsNotificationResult) {
        RecommendationsNotificationResult["Ignored"] = "ignored";
        RecommendationsNotificationResult["Cancelled"] = "cancelled";
        RecommendationsNotificationResult["TooMany"] = "toomany";
        RecommendationsNotificationResult["IncompatibleWindow"] = "incompatibleWindow";
        RecommendationsNotificationResult["Accepted"] = "reacted";
    })(RecommendationsNotificationResult || (exports.RecommendationsNotificationResult = RecommendationsNotificationResult = {}));
    exports.$TUb = (0, instantiation_1.$Bh)('IExtensionRecommendationNotificationService');
});
//# sourceMappingURL=extensionRecommendations.js.map