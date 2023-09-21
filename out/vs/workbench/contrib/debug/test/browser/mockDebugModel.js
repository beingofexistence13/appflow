/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/test/common/mockDebug", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, log_1, uriIdentityService_1, debugModel_1, mockDebug_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMockDebugModel = exports.mockUriIdentityService = void 0;
    const fileService = new workbenchTestServices_1.TestFileService();
    exports.mockUriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
    function createMockDebugModel(disposable) {
        const storage = disposable.add(new workbenchTestServices_2.TestStorageService());
        const debugStorage = disposable.add(new mockDebug_1.MockDebugStorage(storage));
        return disposable.add(new debugModel_1.DebugModel(debugStorage, { isDirty: (e) => false }, exports.mockUriIdentityService, new log_1.NullLogService()));
    }
    exports.createMockDebugModel = createMockDebugModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja0RlYnVnTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy90ZXN0L2Jyb3dzZXIvbW9ja0RlYnVnTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQU0sV0FBVyxHQUFHLElBQUksdUNBQWUsRUFBRSxDQUFDO0lBQzdCLFFBQUEsc0JBQXNCLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUUxRSxTQUFnQixvQkFBb0IsQ0FBQyxVQUEyQjtRQUMvRCxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksMENBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSw0QkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLHVCQUFVLENBQUMsWUFBWSxFQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSw4QkFBc0IsRUFBRSxJQUFJLG9CQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEksQ0FBQztJQUpELG9EQUlDIn0=