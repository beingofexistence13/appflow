/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testingContextKeys"], function (require, exports, testProfileService_1, testId_1, testingContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTestItemContextOverlay = void 0;
    const getTestItemContextOverlay = (test, capabilities) => {
        if (!test) {
            return [];
        }
        const testId = testId_1.TestId.fromString(test.item.extId);
        return [
            [testingContextKeys_1.TestingContextKeys.testItemExtId.key, testId.localId],
            [testingContextKeys_1.TestingContextKeys.controllerId.key, test.controllerId],
            [testingContextKeys_1.TestingContextKeys.testItemHasUri.key, !!test.item.uri],
            ...(0, testProfileService_1.capabilityContextKeys)(capabilities),
        ];
    };
    exports.getTestItemContextOverlay = getTestItemContextOverlay;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEl0ZW1Db250ZXh0T3ZlcmxheS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvYnJvd3Nlci9leHBsb3JlclByb2plY3Rpb25zL3Rlc3RJdGVtQ29udGV4dE92ZXJsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT3pGLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxJQUFrQyxFQUFFLFlBQW9CLEVBQXVCLEVBQUU7UUFDMUgsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNWLE9BQU8sRUFBRSxDQUFDO1NBQ1Y7UUFFRCxNQUFNLE1BQU0sR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFbEQsT0FBTztZQUNOLENBQUMsdUNBQWtCLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ3RELENBQUMsdUNBQWtCLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ3hELENBQUMsdUNBQWtCLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDeEQsR0FBRyxJQUFBLDBDQUFxQixFQUFDLFlBQVksQ0FBQztTQUN0QyxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBYlcsUUFBQSx5QkFBeUIsNkJBYXBDIn0=