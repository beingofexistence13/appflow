/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/console"], function (require, exports, console_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logRemoteEntryIfError = exports.logRemoteEntry = void 0;
    function logRemoteEntry(logService, entry, label = null) {
        const args = (0, console_1.parse)(entry).args;
        let firstArg = args.shift();
        if (typeof firstArg !== 'string') {
            return;
        }
        if (!entry.severity) {
            entry.severity = 'info';
        }
        if (label) {
            if (!/^\[/.test(label)) {
                label = `[${label}]`;
            }
            if (!/ $/.test(label)) {
                label = `${label} `;
            }
            firstArg = label + firstArg;
        }
        switch (entry.severity) {
            case 'log':
            case 'info':
                logService.info(firstArg, ...args);
                break;
            case 'warn':
                logService.warn(firstArg, ...args);
                break;
            case 'error':
                logService.error(firstArg, ...args);
                break;
        }
    }
    exports.logRemoteEntry = logRemoteEntry;
    function logRemoteEntryIfError(logService, entry, label) {
        const args = (0, console_1.parse)(entry).args;
        const firstArg = args.shift();
        if (typeof firstArg !== 'string' || entry.severity !== 'error') {
            return;
        }
        if (!/^\[/.test(label)) {
            label = `[${label}]`;
        }
        if (!/ $/.test(label)) {
            label = `${label} `;
        }
        logService.error(label + firstArg, ...args);
    }
    exports.logRemoteEntryIfError = logRemoteEntryIfError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQ29uc29sZVV0aWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy9jb21tb24vcmVtb3RlQ29uc29sZVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLFNBQWdCLGNBQWMsQ0FBQyxVQUF1QixFQUFFLEtBQXdCLEVBQUUsUUFBdUIsSUFBSTtRQUM1RyxNQUFNLElBQUksR0FBRyxJQUFBLGVBQUssRUFBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDL0IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVCLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO1lBQ2pDLE9BQU87U0FDUDtRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ3BCLEtBQUssQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1NBQ3hCO1FBRUQsSUFBSSxLQUFLLEVBQUU7WUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdkIsS0FBSyxHQUFHLElBQUksS0FBSyxHQUFHLENBQUM7YUFDckI7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdEIsS0FBSyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUM7YUFDcEI7WUFDRCxRQUFRLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQztTQUM1QjtRQUVELFFBQVEsS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUN2QixLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssTUFBTTtnQkFDVixVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUNuQyxNQUFNO1lBQ1AsS0FBSyxNQUFNO2dCQUNWLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLE1BQU07WUFDUCxLQUFLLE9BQU87Z0JBQ1gsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDcEMsTUFBTTtTQUNQO0lBQ0YsQ0FBQztJQWpDRCx3Q0FpQ0M7SUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxVQUF1QixFQUFFLEtBQXdCLEVBQUUsS0FBYTtRQUNyRyxNQUFNLElBQUksR0FBRyxJQUFBLGVBQUssRUFBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlCLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO1lBQy9ELE9BQU87U0FDUDtRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLEtBQUssR0FBRyxJQUFJLEtBQUssR0FBRyxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDdEIsS0FBSyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUM7U0FDcEI7UUFFRCxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBZkQsc0RBZUMifQ==