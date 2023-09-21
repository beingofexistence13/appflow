/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/watcher", "vs/platform/files/node/watcher/nodejs/nodejsWatcher"], function (require, exports, watcher_1, nodejsWatcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeJSWatcherClient = void 0;
    class NodeJSWatcherClient extends watcher_1.AbstractNonRecursiveWatcherClient {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging);
            this.init();
        }
        createWatcher(disposables) {
            return disposables.add(new nodejsWatcher_1.NodeJSWatcher());
        }
    }
    exports.NodeJSWatcherClient = NodeJSWatcherClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZWpzQ2xpZW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZmlsZXMvbm9kZS93YXRjaGVyL25vZGVqcy9ub2RlanNDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsbUJBQW9CLFNBQVEsMkNBQWlDO1FBRXpFLFlBQ0MsYUFBbUQsRUFDbkQsWUFBd0MsRUFDeEMsY0FBdUI7WUFFdkIsS0FBSyxDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFbkQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsQ0FBQztRQUVrQixhQUFhLENBQUMsV0FBNEI7WUFDNUQsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksNkJBQWEsRUFBRSxDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUNEO0lBZkQsa0RBZUMifQ==