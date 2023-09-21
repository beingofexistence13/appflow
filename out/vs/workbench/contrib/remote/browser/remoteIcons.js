/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.forwardedPortWithProcessIcon = exports.forwardedPortWithoutProcessIcon = exports.labelPortIcon = exports.copyAddressIcon = exports.openPreviewIcon = exports.openBrowserIcon = exports.stopForwardIcon = exports.forwardPortIcon = exports.privatePortIcon = exports.portIcon = exports.portsViewIcon = exports.remoteExplorerViewIcon = exports.reportIssuesIcon = exports.reviewIssuesIcon = exports.feedbackIcon = exports.documentationIcon = exports.getStartedIcon = void 0;
    exports.getStartedIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-get-started', codicons_1.Codicon.star, nls.localize('getStartedIcon', 'Getting started icon in the remote explorer view.'));
    exports.documentationIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-documentation', codicons_1.Codicon.book, nls.localize('documentationIcon', 'Documentation icon in the remote explorer view.'));
    exports.feedbackIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-feedback', codicons_1.Codicon.twitter, nls.localize('feedbackIcon', 'Feedback icon in the remote explorer view.'));
    exports.reviewIssuesIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-review-issues', codicons_1.Codicon.issues, nls.localize('reviewIssuesIcon', 'Review issue icon in the remote explorer view.'));
    exports.reportIssuesIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-report-issues', codicons_1.Codicon.comment, nls.localize('reportIssuesIcon', 'Report issue icon in the remote explorer view.'));
    exports.remoteExplorerViewIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-view-icon', codicons_1.Codicon.remoteExplorer, nls.localize('remoteExplorerViewIcon', 'View icon of the remote explorer view.'));
    exports.portsViewIcon = (0, iconRegistry_1.registerIcon)('ports-view-icon', codicons_1.Codicon.plug, nls.localize('portsViewIcon', 'View icon of the remote ports view.'));
    exports.portIcon = (0, iconRegistry_1.registerIcon)('ports-view-icon', codicons_1.Codicon.plug, nls.localize('portIcon', 'Icon representing a remote port.'));
    exports.privatePortIcon = (0, iconRegistry_1.registerIcon)('private-ports-view-icon', codicons_1.Codicon.lock, nls.localize('privatePortIcon', 'Icon representing a private remote port.'));
    exports.forwardPortIcon = (0, iconRegistry_1.registerIcon)('ports-forward-icon', codicons_1.Codicon.plus, nls.localize('forwardPortIcon', 'Icon for the forward action.'));
    exports.stopForwardIcon = (0, iconRegistry_1.registerIcon)('ports-stop-forward-icon', codicons_1.Codicon.x, nls.localize('stopForwardIcon', 'Icon for the stop forwarding action.'));
    exports.openBrowserIcon = (0, iconRegistry_1.registerIcon)('ports-open-browser-icon', codicons_1.Codicon.globe, nls.localize('openBrowserIcon', 'Icon for the open browser action.'));
    exports.openPreviewIcon = (0, iconRegistry_1.registerIcon)('ports-open-preview-icon', codicons_1.Codicon.openPreview, nls.localize('openPreviewIcon', 'Icon for the open preview action.'));
    exports.copyAddressIcon = (0, iconRegistry_1.registerIcon)('ports-copy-address-icon', codicons_1.Codicon.clippy, nls.localize('copyAddressIcon', 'Icon for the copy local address action.'));
    exports.labelPortIcon = (0, iconRegistry_1.registerIcon)('ports-label-icon', codicons_1.Codicon.tag, nls.localize('labelPortIcon', 'Icon for the label port action.'));
    exports.forwardedPortWithoutProcessIcon = (0, iconRegistry_1.registerIcon)('ports-forwarded-without-process-icon', codicons_1.Codicon.circleOutline, nls.localize('forwardedPortWithoutProcessIcon', 'Icon for forwarded ports that don\'t have a running process.'));
    exports.forwardedPortWithProcessIcon = (0, iconRegistry_1.registerIcon)('ports-forwarded-with-process-icon', codicons_1.Codicon.circleFilled, nls.localize('forwardedPortWithProcessIcon', 'Icon for forwarded ports that do have a running process.'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlSWNvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9yZW1vdGUvYnJvd3Nlci9yZW1vdGVJY29ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPbkYsUUFBQSxjQUFjLEdBQUcsSUFBQSwyQkFBWSxFQUFDLDZCQUE2QixFQUFFLGtCQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsbURBQW1ELENBQUMsQ0FBQyxDQUFDO0lBQ2hLLFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwyQkFBWSxFQUFDLCtCQUErQixFQUFFLGtCQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsaURBQWlELENBQUMsQ0FBQyxDQUFDO0lBQ3RLLFFBQUEsWUFBWSxHQUFHLElBQUEsMkJBQVksRUFBQywwQkFBMEIsRUFBRSxrQkFBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7SUFDckosUUFBQSxnQkFBZ0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsK0JBQStCLEVBQUUsa0JBQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDLENBQUM7SUFDckssUUFBQSxnQkFBZ0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsK0JBQStCLEVBQUUsa0JBQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDLENBQUM7SUFDdEssUUFBQSxzQkFBc0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsMkJBQTJCLEVBQUUsa0JBQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDLENBQUM7SUFFN0ssUUFBQSxhQUFhLEdBQUcsSUFBQSwyQkFBWSxFQUFDLGlCQUFpQixFQUFFLGtCQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLHFDQUFxQyxDQUFDLENBQUMsQ0FBQztJQUNwSSxRQUFBLFFBQVEsR0FBRyxJQUFBLDJCQUFZLEVBQUMsaUJBQWlCLEVBQUUsa0JBQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZILFFBQUEsZUFBZSxHQUFHLElBQUEsMkJBQVksRUFBQyx5QkFBeUIsRUFBRSxrQkFBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLDBDQUEwQyxDQUFDLENBQUMsQ0FBQztJQUVySixRQUFBLGVBQWUsR0FBRyxJQUFBLDJCQUFZLEVBQUMsb0JBQW9CLEVBQUUsa0JBQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7SUFDcEksUUFBQSxlQUFlLEdBQUcsSUFBQSwyQkFBWSxFQUFDLHlCQUF5QixFQUFFLGtCQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0lBQzlJLFFBQUEsZUFBZSxHQUFHLElBQUEsMkJBQVksRUFBQyx5QkFBeUIsRUFBRSxrQkFBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLG1DQUFtQyxDQUFDLENBQUMsQ0FBQztJQUMvSSxRQUFBLGVBQWUsR0FBRyxJQUFBLDJCQUFZLEVBQUMseUJBQXlCLEVBQUUsa0JBQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7SUFDckosUUFBQSxlQUFlLEdBQUcsSUFBQSwyQkFBWSxFQUFDLHlCQUF5QixFQUFFLGtCQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUseUNBQXlDLENBQUMsQ0FBQyxDQUFDO0lBQ3RKLFFBQUEsYUFBYSxHQUFHLElBQUEsMkJBQVksRUFBQyxrQkFBa0IsRUFBRSxrQkFBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7SUFDaEksUUFBQSwrQkFBK0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsc0NBQXNDLEVBQUUsa0JBQU8sQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRSw4REFBOEQsQ0FBQyxDQUFDLENBQUM7SUFDL04sUUFBQSw0QkFBNEIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsbUNBQW1DLEVBQUUsa0JBQU8sQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSwwREFBMEQsQ0FBQyxDQUFDLENBQUMifQ==