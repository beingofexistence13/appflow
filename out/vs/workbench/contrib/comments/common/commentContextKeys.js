/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentContextKeys = void 0;
    var CommentContextKeys;
    (function (CommentContextKeys) {
        /**
         * A context key that is set when the active cursor is in a commenting range.
         */
        CommentContextKeys.activeCursorHasCommentingRange = new contextkey_1.RawContextKey('activeCursorHasCommentingRange', false, {
            description: nls.localize('hasCommentingRange', "Whether the position at the active cursor has a commenting range"),
            type: 'boolean'
        });
        /**
         * A context key that is set when the active editor has commenting ranges.
         */
        CommentContextKeys.activeEditorHasCommentingRange = new contextkey_1.RawContextKey('activeEditorHasCommentingRange', false, {
            description: nls.localize('editorHasCommentingRange', "Whether the active editor has a commenting range"),
            type: 'boolean'
        });
        /**
         * A context key that is set when the workspace has either comments or commenting ranges.
         */
        CommentContextKeys.WorkspaceHasCommenting = new contextkey_1.RawContextKey('workspaceHasCommenting', false, {
            description: nls.localize('hasCommentingProvider', "Whether the open workspace has either comments or commenting ranges."),
            type: 'boolean'
        });
        /**
         * A context key that is set when the comment thread has no comments.
         */
        CommentContextKeys.commentThreadIsEmpty = new contextkey_1.RawContextKey('commentThreadIsEmpty', false, { type: 'boolean', description: nls.localize('commentThreadIsEmpty', "Set when the comment thread has no comments") });
        /**
         * A context key that is set when the comment has no input.
         */
        CommentContextKeys.commentIsEmpty = new contextkey_1.RawContextKey('commentIsEmpty', false, { type: 'boolean', description: nls.localize('commentIsEmpty', "Set when the comment has no input") });
        /**
         * The context value of the comment.
         */
        CommentContextKeys.commentContext = new contextkey_1.RawContextKey('comment', undefined, { type: 'string', description: nls.localize('comment', "The context value of the comment") });
        /**
         * The context value of the comment thread.
         */
        CommentContextKeys.commentThreadContext = new contextkey_1.RawContextKey('commentThread', undefined, { type: 'string', description: nls.localize('commentThread', "The context value of the comment thread") });
        /**
         * The comment controller id associated with a comment thread.
         */
        CommentContextKeys.commentControllerContext = new contextkey_1.RawContextKey('commentController', undefined, { type: 'string', description: nls.localize('commentController', "The comment controller id associated with a comment thread") });
    })(CommentContextKeys || (exports.CommentContextKeys = CommentContextKeys = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudENvbnRleHRLZXlzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvY29tbW9uL2NvbW1lbnRDb250ZXh0S2V5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsSUFBaUIsa0JBQWtCLENBOENsQztJQTlDRCxXQUFpQixrQkFBa0I7UUFFbEM7O1dBRUc7UUFDVSxpREFBOEIsR0FBRyxJQUFJLDBCQUFhLENBQVUsZ0NBQWdDLEVBQUUsS0FBSyxFQUFFO1lBQ2pILFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLGtFQUFrRSxDQUFDO1lBQ25ILElBQUksRUFBRSxTQUFTO1NBQ2YsQ0FBQyxDQUFDO1FBRUg7O1dBRUc7UUFDVSxpREFBOEIsR0FBRyxJQUFJLDBCQUFhLENBQVUsZ0NBQWdDLEVBQUUsS0FBSyxFQUFFO1lBQ2pILFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLGtEQUFrRCxDQUFDO1lBQ3pHLElBQUksRUFBRSxTQUFTO1NBQ2YsQ0FBQyxDQUFDO1FBRUg7O1dBRUc7UUFDVSx5Q0FBc0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsd0JBQXdCLEVBQUUsS0FBSyxFQUFFO1lBQ2pHLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFLHNFQUFzRSxDQUFDO1lBQzFILElBQUksRUFBRSxTQUFTO1NBQ2YsQ0FBQyxDQUFDO1FBRUg7O1dBRUc7UUFDVSx1Q0FBb0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsc0JBQXNCLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSw2Q0FBNkMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyTjs7V0FFRztRQUNVLGlDQUFjLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGdCQUFnQixFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsbUNBQW1DLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekw7O1dBRUc7UUFDVSxpQ0FBYyxHQUFHLElBQUksMEJBQWEsQ0FBUyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsa0NBQWtDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUs7O1dBRUc7UUFDVSx1Q0FBb0IsR0FBRyxJQUFJLDBCQUFhLENBQVMsZUFBZSxFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLHlDQUF5QyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JNOztXQUVHO1FBQ1UsMkNBQXdCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsNERBQTRELENBQUMsRUFBRSxDQUFDLENBQUM7SUFDck8sQ0FBQyxFQTlDZ0Isa0JBQWtCLGtDQUFsQixrQkFBa0IsUUE4Q2xDIn0=