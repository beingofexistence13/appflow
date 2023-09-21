/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IChatService = exports.InteractiveSessionCopyKind = exports.InteractiveSessionVoteDirection = void 0;
    // Name has to match the one in vscode.d.ts for some reason
    var InteractiveSessionVoteDirection;
    (function (InteractiveSessionVoteDirection) {
        InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Up"] = 1] = "Up";
        InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Down"] = 2] = "Down";
    })(InteractiveSessionVoteDirection || (exports.InteractiveSessionVoteDirection = InteractiveSessionVoteDirection = {}));
    var InteractiveSessionCopyKind;
    (function (InteractiveSessionCopyKind) {
        // Keyboard shortcut or context menu
        InteractiveSessionCopyKind[InteractiveSessionCopyKind["Action"] = 1] = "Action";
        InteractiveSessionCopyKind[InteractiveSessionCopyKind["Toolbar"] = 2] = "Toolbar";
    })(InteractiveSessionCopyKind || (exports.InteractiveSessionCopyKind = InteractiveSessionCopyKind = {}));
    exports.IChatService = (0, instantiation_1.createDecorator)('IChatService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2NvbW1vbi9jaGF0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrSGhHLDJEQUEyRDtJQUMzRCxJQUFZLCtCQUdYO0lBSEQsV0FBWSwrQkFBK0I7UUFDMUMsaUZBQU0sQ0FBQTtRQUNOLHFGQUFRLENBQUE7SUFDVCxDQUFDLEVBSFcsK0JBQStCLCtDQUEvQiwrQkFBK0IsUUFHMUM7SUFRRCxJQUFZLDBCQUlYO0lBSkQsV0FBWSwwQkFBMEI7UUFDckMsb0NBQW9DO1FBQ3BDLCtFQUFVLENBQUE7UUFDVixpRkFBVyxDQUFBO0lBQ1osQ0FBQyxFQUpXLDBCQUEwQiwwQ0FBMUIsMEJBQTBCLFFBSXJDO0lBd0VZLFFBQUEsWUFBWSxHQUFHLElBQUEsK0JBQWUsRUFBZSxjQUFjLENBQUMsQ0FBQyJ9