/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarshalledId = void 0;
    var MarshalledId;
    (function (MarshalledId) {
        MarshalledId[MarshalledId["Uri"] = 1] = "Uri";
        MarshalledId[MarshalledId["Regexp"] = 2] = "Regexp";
        MarshalledId[MarshalledId["ScmResource"] = 3] = "ScmResource";
        MarshalledId[MarshalledId["ScmResourceGroup"] = 4] = "ScmResourceGroup";
        MarshalledId[MarshalledId["ScmProvider"] = 5] = "ScmProvider";
        MarshalledId[MarshalledId["CommentController"] = 6] = "CommentController";
        MarshalledId[MarshalledId["CommentThread"] = 7] = "CommentThread";
        MarshalledId[MarshalledId["CommentThreadInstance"] = 8] = "CommentThreadInstance";
        MarshalledId[MarshalledId["CommentThreadReply"] = 9] = "CommentThreadReply";
        MarshalledId[MarshalledId["CommentNode"] = 10] = "CommentNode";
        MarshalledId[MarshalledId["CommentThreadNode"] = 11] = "CommentThreadNode";
        MarshalledId[MarshalledId["TimelineActionContext"] = 12] = "TimelineActionContext";
        MarshalledId[MarshalledId["NotebookCellActionContext"] = 13] = "NotebookCellActionContext";
        MarshalledId[MarshalledId["NotebookActionContext"] = 14] = "NotebookActionContext";
        MarshalledId[MarshalledId["TerminalContext"] = 15] = "TerminalContext";
        MarshalledId[MarshalledId["TestItemContext"] = 16] = "TestItemContext";
        MarshalledId[MarshalledId["Date"] = 17] = "Date";
        MarshalledId[MarshalledId["TestMessageMenuArgs"] = 18] = "TestMessageMenuArgs";
    })(MarshalledId || (exports.MarshalledId = MarshalledId = {}));
});
//# sourceMappingURL=marshallingIds.js.map