/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/comments/common/commentContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentContextKeys = void 0;
    var CommentContextKeys;
    (function (CommentContextKeys) {
        /**
         * A context key that is set when the active cursor is in a commenting range.
         */
        CommentContextKeys.activeCursorHasCommentingRange = new contextkey_1.$2i('activeCursorHasCommentingRange', false, {
            description: nls.localize(0, null),
            type: 'boolean'
        });
        /**
         * A context key that is set when the active editor has commenting ranges.
         */
        CommentContextKeys.activeEditorHasCommentingRange = new contextkey_1.$2i('activeEditorHasCommentingRange', false, {
            description: nls.localize(1, null),
            type: 'boolean'
        });
        /**
         * A context key that is set when the workspace has either comments or commenting ranges.
         */
        CommentContextKeys.WorkspaceHasCommenting = new contextkey_1.$2i('workspaceHasCommenting', false, {
            description: nls.localize(2, null),
            type: 'boolean'
        });
        /**
         * A context key that is set when the comment thread has no comments.
         */
        CommentContextKeys.commentThreadIsEmpty = new contextkey_1.$2i('commentThreadIsEmpty', false, { type: 'boolean', description: nls.localize(3, null) });
        /**
         * A context key that is set when the comment has no input.
         */
        CommentContextKeys.commentIsEmpty = new contextkey_1.$2i('commentIsEmpty', false, { type: 'boolean', description: nls.localize(4, null) });
        /**
         * The context value of the comment.
         */
        CommentContextKeys.commentContext = new contextkey_1.$2i('comment', undefined, { type: 'string', description: nls.localize(5, null) });
        /**
         * The context value of the comment thread.
         */
        CommentContextKeys.commentThreadContext = new contextkey_1.$2i('commentThread', undefined, { type: 'string', description: nls.localize(6, null) });
        /**
         * The comment controller id associated with a comment thread.
         */
        CommentContextKeys.commentControllerContext = new contextkey_1.$2i('commentController', undefined, { type: 'string', description: nls.localize(7, null) });
    })(CommentContextKeys || (exports.CommentContextKeys = CommentContextKeys = {}));
});
//# sourceMappingURL=commentContextKeys.js.map