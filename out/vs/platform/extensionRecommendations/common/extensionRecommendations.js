/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionRecommendationNotificationService = exports.RecommendationsNotificationResult = exports.RecommendationSourceToString = exports.RecommendationSource = void 0;
    var RecommendationSource;
    (function (RecommendationSource) {
        RecommendationSource[RecommendationSource["FILE"] = 1] = "FILE";
        RecommendationSource[RecommendationSource["WORKSPACE"] = 2] = "WORKSPACE";
        RecommendationSource[RecommendationSource["EXE"] = 3] = "EXE";
    })(RecommendationSource || (exports.RecommendationSource = RecommendationSource = {}));
    function RecommendationSourceToString(source) {
        switch (source) {
            case 1 /* RecommendationSource.FILE */: return 'file';
            case 2 /* RecommendationSource.WORKSPACE */: return 'workspace';
            case 3 /* RecommendationSource.EXE */: return 'exe';
        }
    }
    exports.RecommendationSourceToString = RecommendationSourceToString;
    var RecommendationsNotificationResult;
    (function (RecommendationsNotificationResult) {
        RecommendationsNotificationResult["Ignored"] = "ignored";
        RecommendationsNotificationResult["Cancelled"] = "cancelled";
        RecommendationsNotificationResult["TooMany"] = "toomany";
        RecommendationsNotificationResult["IncompatibleWindow"] = "incompatibleWindow";
        RecommendationsNotificationResult["Accepted"] = "reacted";
    })(RecommendationsNotificationResult || (exports.RecommendationsNotificationResult = RecommendationsNotificationResult = {}));
    exports.IExtensionRecommendationNotificationService = (0, instantiation_1.createDecorator)('IExtensionRecommendationNotificationService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zL2NvbW1vbi9leHRlbnNpb25SZWNvbW1lbmRhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLElBQWtCLG9CQUlqQjtJQUpELFdBQWtCLG9CQUFvQjtRQUNyQywrREFBUSxDQUFBO1FBQ1IseUVBQWEsQ0FBQTtRQUNiLDZEQUFPLENBQUE7SUFDUixDQUFDLEVBSmlCLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBSXJDO0lBU0QsU0FBZ0IsNEJBQTRCLENBQUMsTUFBNEI7UUFDeEUsUUFBUSxNQUFNLEVBQUU7WUFDZixzQ0FBOEIsQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDO1lBQzlDLDJDQUFtQyxDQUFDLENBQUMsT0FBTyxXQUFXLENBQUM7WUFDeEQscUNBQTZCLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQztTQUM1QztJQUNGLENBQUM7SUFORCxvRUFNQztJQUVELElBQWtCLGlDQU1qQjtJQU5ELFdBQWtCLGlDQUFpQztRQUNsRCx3REFBbUIsQ0FBQTtRQUNuQiw0REFBdUIsQ0FBQTtRQUN2Qix3REFBbUIsQ0FBQTtRQUNuQiw4RUFBeUMsQ0FBQTtRQUN6Qyx5REFBb0IsQ0FBQTtJQUNyQixDQUFDLEVBTmlCLGlDQUFpQyxpREFBakMsaUNBQWlDLFFBTWxEO0lBRVksUUFBQSwyQ0FBMkMsR0FBRyxJQUFBLCtCQUFlLEVBQThDLDZDQUE2QyxDQUFDLENBQUMifQ==