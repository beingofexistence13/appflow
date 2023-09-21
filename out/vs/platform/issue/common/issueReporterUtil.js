/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizeGitHubUrl = void 0;
    function normalizeGitHubUrl(url) {
        // If the url has a .git suffix, remove it
        if (url.endsWith('.git')) {
            url = url.substr(0, url.length - 4);
        }
        // Remove trailing slash
        url = (0, strings_1.rtrim)(url, '/');
        if (url.endsWith('/new')) {
            url = (0, strings_1.rtrim)(url, '/new');
        }
        if (url.endsWith('/issues')) {
            url = (0, strings_1.rtrim)(url, '/issues');
        }
        return url;
    }
    exports.normalizeGitHubUrl = normalizeGitHubUrl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVSZXBvcnRlclV0aWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9pc3N1ZS9jb21tb24vaXNzdWVSZXBvcnRlclV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLFNBQWdCLGtCQUFrQixDQUFDLEdBQVc7UUFDN0MsMENBQTBDO1FBQzFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNwQztRQUVELHdCQUF3QjtRQUN4QixHQUFHLEdBQUcsSUFBQSxlQUFLLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixHQUFHLEdBQUcsSUFBQSxlQUFLLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVCLEdBQUcsR0FBRyxJQUFBLGVBQUssRUFBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDNUI7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFsQkQsZ0RBa0JDIn0=