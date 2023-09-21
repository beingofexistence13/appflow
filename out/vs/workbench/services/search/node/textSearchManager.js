/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/textfile/common/encoding", "vs/base/node/pfs", "vs/workbench/services/search/common/textSearchManager"], function (require, exports, encoding_1, pfs, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeTextSearchManager = void 0;
    class NativeTextSearchManager extends textSearchManager_1.TextSearchManager {
        constructor(query, provider, _pfs = pfs, processType = 'searchProcess') {
            super(query, provider, {
                readdir: resource => _pfs.Promises.readdir(resource.fsPath),
                toCanonicalName: name => (0, encoding_1.toCanonicalName)(name)
            }, processType);
        }
    }
    exports.NativeTextSearchManager = NativeTextSearchManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFNlYXJjaE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL25vZGUvdGV4dFNlYXJjaE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsdUJBQXdCLFNBQVEscUNBQWlCO1FBRTdELFlBQVksS0FBaUIsRUFBRSxRQUE0QixFQUFFLE9BQW1CLEdBQUcsRUFBRSxjQUF3QyxlQUFlO1lBQzNJLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFO2dCQUN0QixPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUMzRCxlQUFlLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFBLDBCQUFlLEVBQUMsSUFBSSxDQUFDO2FBQzlDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDakIsQ0FBQztLQUNEO0lBUkQsMERBUUMifQ==