/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NullOpenerService = void 0;
    exports.NullOpenerService = Object.freeze({
        _serviceBrand: undefined,
        registerOpener() { return lifecycle_1.Disposable.None; },
        registerValidator() { return lifecycle_1.Disposable.None; },
        registerExternalUriResolver() { return lifecycle_1.Disposable.None; },
        setDefaultExternalOpener() { },
        registerExternalOpener() { return lifecycle_1.Disposable.None; },
        async open() { return false; },
        async resolveExternalUri(uri) { return { resolved: uri, dispose() { } }; },
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVsbE9wZW5lclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9vcGVuZXIvdGVzdC9jb21tb24vbnVsbE9wZW5lclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTW5GLFFBQUEsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM5QyxhQUFhLEVBQUUsU0FBUztRQUN4QixjQUFjLEtBQUssT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUMsaUJBQWlCLEtBQUssT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0MsMkJBQTJCLEtBQUssT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekQsd0JBQXdCLEtBQUssQ0FBQztRQUM5QixzQkFBc0IsS0FBSyxPQUFPLHNCQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRCxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM5QixLQUFLLENBQUMsa0JBQWtCLENBQUMsR0FBUSxJQUFJLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDN0QsQ0FBQyxDQUFDIn0=