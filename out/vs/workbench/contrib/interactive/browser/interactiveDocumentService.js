/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InteractiveDocumentService = exports.IInteractiveDocumentService = void 0;
    exports.IInteractiveDocumentService = (0, instantiation_1.createDecorator)('IInteractiveDocumentService');
    class InteractiveDocumentService extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onWillAddInteractiveDocument = this._register(new event_1.Emitter());
            this.onWillAddInteractiveDocument = this._onWillAddInteractiveDocument.event;
            this._onWillRemoveInteractiveDocument = this._register(new event_1.Emitter());
            this.onWillRemoveInteractiveDocument = this._onWillRemoveInteractiveDocument.event;
        }
        willCreateInteractiveDocument(notebookUri, inputUri, languageId) {
            this._onWillAddInteractiveDocument.fire({
                notebookUri,
                inputUri,
                languageId
            });
        }
        willRemoveInteractiveDocument(notebookUri, inputUri) {
            this._onWillRemoveInteractiveDocument.fire({
                notebookUri,
                inputUri
            });
        }
    }
    exports.InteractiveDocumentService = InteractiveDocumentService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3RpdmVEb2N1bWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbnRlcmFjdGl2ZS9icm93c2VyL2ludGVyYWN0aXZlRG9jdW1lbnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9uRixRQUFBLDJCQUEyQixHQUFHLElBQUEsK0JBQWUsRUFBOEIsNkJBQTZCLENBQUMsQ0FBQztJQVV2SCxNQUFhLDBCQUEyQixTQUFRLHNCQUFVO1FBT3pEO1lBQ0MsS0FBSyxFQUFFLENBQUM7WUFOUSxrQ0FBNkIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUEyRCxDQUFDLENBQUM7WUFDeEksaUNBQTRCLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssQ0FBQztZQUN2RCxxQ0FBZ0MsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF1QyxDQUFDLENBQUM7WUFDdkgsb0NBQStCLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLEtBQUssQ0FBQztRQUk5RSxDQUFDO1FBRUQsNkJBQTZCLENBQUMsV0FBZ0IsRUFBRSxRQUFhLEVBQUUsVUFBa0I7WUFDaEYsSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQztnQkFDdkMsV0FBVztnQkFDWCxRQUFRO2dCQUNSLFVBQVU7YUFDVixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsNkJBQTZCLENBQUMsV0FBZ0IsRUFBRSxRQUFhO1lBQzVELElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUM7Z0JBQzFDLFdBQVc7Z0JBQ1gsUUFBUTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQXpCRCxnRUF5QkMifQ==