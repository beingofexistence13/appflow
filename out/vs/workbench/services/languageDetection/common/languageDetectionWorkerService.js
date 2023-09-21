/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageDetectionStatsId = exports.AutomaticLanguageDetectionLikelyWrongId = exports.LanguageDetectionLanguageEventSource = exports.ILanguageDetectionService = void 0;
    exports.ILanguageDetectionService = (0, instantiation_1.createDecorator)('ILanguageDetectionService');
    exports.LanguageDetectionLanguageEventSource = 'languageDetection';
    //#region Telemetry events
    exports.AutomaticLanguageDetectionLikelyWrongId = 'automaticlanguagedetection.likelywrong';
    exports.LanguageDetectionStatsId = 'automaticlanguagedetection.stats';
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VEZXRlY3Rpb25Xb3JrZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2xhbmd1YWdlRGV0ZWN0aW9uL2NvbW1vbi9sYW5ndWFnZURldGVjdGlvbldvcmtlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS25GLFFBQUEseUJBQXlCLEdBQUcsSUFBQSwrQkFBZSxFQUE0QiwyQkFBMkIsQ0FBQyxDQUFDO0lBRXBHLFFBQUEsb0NBQW9DLEdBQUcsbUJBQW1CLENBQUM7SUF3QnhFLDBCQUEwQjtJQUViLFFBQUEsdUNBQXVDLEdBQUcsd0NBQXdDLENBQUM7SUFrQm5GLFFBQUEsd0JBQXdCLEdBQUcsa0NBQWtDLENBQUM7O0FBZ0IzRSxZQUFZIn0=