/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FH = exports.InteractiveSessionCopyKind = exports.InteractiveSessionVoteDirection = void 0;
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
    exports.$FH = (0, instantiation_1.$Bh)('IChatService');
});
//# sourceMappingURL=chatService.js.map