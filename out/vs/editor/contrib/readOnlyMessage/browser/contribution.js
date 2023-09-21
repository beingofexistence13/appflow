/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/contrib/message/browser/messageController", "vs/nls"], function (require, exports, htmlContent_1, lifecycle_1, editorExtensions_1, messageController_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReadOnlyMessageController = void 0;
    class ReadOnlyMessageController extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.readOnlyMessageController'; }
        constructor(editor) {
            super();
            this.editor = editor;
            this._register(this.editor.onDidAttemptReadOnlyEdit(() => this._onDidAttemptReadOnlyEdit()));
        }
        _onDidAttemptReadOnlyEdit() {
            const messageController = messageController_1.MessageController.get(this.editor);
            if (messageController && this.editor.hasModel()) {
                let message = this.editor.getOptions().get(91 /* EditorOption.readOnlyMessage */);
                if (!message) {
                    if (this.editor.isSimpleWidget) {
                        message = new htmlContent_1.MarkdownString(nls.localize('editor.simple.readonly', "Cannot edit in read-only input"));
                    }
                    else {
                        message = new htmlContent_1.MarkdownString(nls.localize('editor.readonly', "Cannot edit in read-only editor"));
                    }
                }
                messageController.showMessage(message, this.editor.getPosition());
            }
        }
    }
    exports.ReadOnlyMessageController = ReadOnlyMessageController;
    (0, editorExtensions_1.registerEditorContribution)(ReadOnlyMessageController.ID, ReadOnlyMessageController, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvcmVhZE9ubHlNZXNzYWdlL2Jyb3dzZXIvY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFhLHlCQUEwQixTQUFRLHNCQUFVO2lCQUVqQyxPQUFFLEdBQUcsMENBQTBDLENBQUM7UUFFdkUsWUFDa0IsTUFBbUI7WUFFcEMsS0FBSyxFQUFFLENBQUM7WUFGUyxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBR3BDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUYsQ0FBQztRQUVPLHlCQUF5QjtZQUNoQyxNQUFNLGlCQUFpQixHQUFHLHFDQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0QsSUFBSSxpQkFBaUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUNoRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsdUNBQThCLENBQUM7Z0JBQ3pFLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTt3QkFDL0IsT0FBTyxHQUFHLElBQUksNEJBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztxQkFDdkc7eUJBQU07d0JBQ04sT0FBTyxHQUFHLElBQUksNEJBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztxQkFDakc7aUJBQ0Q7Z0JBRUQsaUJBQWlCLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7YUFDbEU7UUFDRixDQUFDOztJQXpCRiw4REEwQkM7SUFFRCxJQUFBLDZDQUEwQixFQUFDLHlCQUF5QixDQUFDLEVBQUUsRUFBRSx5QkFBeUIsaUVBQXlELENBQUMifQ==