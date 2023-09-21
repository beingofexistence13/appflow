/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes"], function (require, exports, extHost_protocol_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostIssueReporter = void 0;
    class ExtHostIssueReporter {
        constructor(mainContext) {
            this._IssueUriRequestHandlers = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadIssueReporter);
        }
        async $getIssueReporterUri(extensionId, token) {
            if (this._IssueUriRequestHandlers.size === 0) {
                throw new Error('No issue request handlers registered');
            }
            const provider = this._IssueUriRequestHandlers.get(extensionId);
            if (!provider) {
                throw new Error('Issue request handler not found');
            }
            const result = await provider.handleIssueUrlRequest();
            if (!result) {
                throw new Error('Issue request handler returned no result');
            }
            return result;
        }
        registerIssueUriRequestHandler(extension, provider) {
            const extensionId = extension.identifier.value;
            this._IssueUriRequestHandlers.set(extensionId, provider);
            this._proxy.$registerIssueUriRequestHandler(extensionId);
            return new extHostTypes_1.Disposable(() => {
                this._proxy.$unregisterIssueUriRequestHandler(extensionId);
                this._IssueUriRequestHandlers.delete(extensionId);
            });
        }
    }
    exports.ExtHostIssueReporter = ExtHostIssueReporter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdElzc3VlUmVwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0SXNzdWVSZXBvcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSxvQkFBb0I7UUFLaEMsWUFDQyxXQUF5QjtZQUxsQiw2QkFBd0IsR0FBd0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQU9qRixJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxLQUFLLENBQUMsb0JBQW9CLENBQUMsV0FBbUIsRUFBRSxLQUF3QjtZQUN2RSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO2dCQUM3QyxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7YUFDeEQ7WUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2FBQ25EO1lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQzthQUM1RDtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELDhCQUE4QixDQUFDLFNBQWdDLEVBQUUsUUFBZ0M7WUFDaEcsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDL0MsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6RCxPQUFPLElBQUkseUJBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsaUNBQWlDLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFyQ0Qsb0RBcUNDIn0=