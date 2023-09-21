/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ISCMViewService = exports.ISCMRepositorySortKey = exports.SCMInputChangeReason = exports.InputValidationType = exports.ISCMService = exports.SYNC_VIEW_PANE_ID = exports.REPOSITORIES_VIEW_PANE_ID = exports.VIEW_PANE_ID = exports.VIEWLET_ID = void 0;
    exports.VIEWLET_ID = 'workbench.view.scm';
    exports.VIEW_PANE_ID = 'workbench.scm';
    exports.REPOSITORIES_VIEW_PANE_ID = 'workbench.scm.repositories';
    exports.SYNC_VIEW_PANE_ID = 'workbench.scm.sync';
    exports.ISCMService = (0, instantiation_1.createDecorator)('scm');
    var InputValidationType;
    (function (InputValidationType) {
        InputValidationType[InputValidationType["Error"] = 0] = "Error";
        InputValidationType[InputValidationType["Warning"] = 1] = "Warning";
        InputValidationType[InputValidationType["Information"] = 2] = "Information";
    })(InputValidationType || (exports.InputValidationType = InputValidationType = {}));
    var SCMInputChangeReason;
    (function (SCMInputChangeReason) {
        SCMInputChangeReason[SCMInputChangeReason["HistoryPrevious"] = 0] = "HistoryPrevious";
        SCMInputChangeReason[SCMInputChangeReason["HistoryNext"] = 1] = "HistoryNext";
    })(SCMInputChangeReason || (exports.SCMInputChangeReason = SCMInputChangeReason = {}));
    var ISCMRepositorySortKey;
    (function (ISCMRepositorySortKey) {
        ISCMRepositorySortKey["DiscoveryTime"] = "discoveryTime";
        ISCMRepositorySortKey["Name"] = "name";
        ISCMRepositorySortKey["Path"] = "path";
    })(ISCMRepositorySortKey || (exports.ISCMRepositorySortKey = ISCMRepositorySortKey = {}));
    exports.ISCMViewService = (0, instantiation_1.createDecorator)('scmView');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2NtL2NvbW1vbi9zY20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY25GLFFBQUEsVUFBVSxHQUFHLG9CQUFvQixDQUFDO0lBQ2xDLFFBQUEsWUFBWSxHQUFHLGVBQWUsQ0FBQztJQUMvQixRQUFBLHlCQUF5QixHQUFHLDRCQUE0QixDQUFDO0lBQ3pELFFBQUEsaUJBQWlCLEdBQUcsb0JBQW9CLENBQUM7SUFNekMsUUFBQSxXQUFXLEdBQUcsSUFBQSwrQkFBZSxFQUFjLEtBQUssQ0FBQyxDQUFDO0lBcUQvRCxJQUFrQixtQkFJakI7SUFKRCxXQUFrQixtQkFBbUI7UUFDcEMsK0RBQVMsQ0FBQTtRQUNULG1FQUFXLENBQUE7UUFDWCwyRUFBZSxDQUFBO0lBQ2hCLENBQUMsRUFKaUIsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFJcEM7SUFXRCxJQUFZLG9CQUdYO0lBSEQsV0FBWSxvQkFBb0I7UUFDL0IscUZBQWUsQ0FBQTtRQUNmLDZFQUFXLENBQUE7SUFDWixDQUFDLEVBSFcsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFHL0I7SUFzRkQsSUFBa0IscUJBSWpCO0lBSkQsV0FBa0IscUJBQXFCO1FBQ3RDLHdEQUErQixDQUFBO1FBQy9CLHNDQUFhLENBQUE7UUFDYixzQ0FBYSxDQUFBO0lBQ2QsQ0FBQyxFQUppQixxQkFBcUIscUNBQXJCLHFCQUFxQixRQUl0QztJQUVZLFFBQUEsZUFBZSxHQUFHLElBQUEsK0JBQWUsRUFBa0IsU0FBUyxDQUFDLENBQUMifQ==