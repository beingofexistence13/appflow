/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/base/common/lifecycle", "vs/nls", "vs/base/browser/ui/aria/aria", "vs/css!./chatSlashCommandContentWidget"], function (require, exports, range_1, lifecycle_1, nls_1, aria) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlashCommandContentWidget = void 0;
    class SlashCommandContentWidget extends lifecycle_1.Disposable {
        constructor(_editor) {
            super();
            this._editor = _editor;
            this._domNode = document.createElement('div');
            this._isVisible = false;
            this._domNode.toggleAttribute('hidden', true);
            this._domNode.classList.add('chat-slash-command-content-widget');
            // If backspace at a slash command boundary, remove the slash command
            this._register(this._editor.onKeyDown((e) => this._handleKeyDown(e)));
        }
        dispose() {
            this._editor.removeContentWidget(this);
            super.dispose();
        }
        show() {
            if (this._isVisible) {
                return;
            }
            this._isVisible = true;
            this._domNode.toggleAttribute('hidden', false);
            this._editor.addContentWidget(this);
        }
        hide() {
            this._isVisible = false;
            this._domNode.toggleAttribute('hidden', true);
            this._editor.removeContentWidget(this);
        }
        setCommandText(slashCommand) {
            this._domNode.innerText = `/${slashCommand} `;
            this._lastSlashCommandText = slashCommand;
        }
        getId() { return 'chat-slash-command-content-widget'; }
        getDomNode() { return this._domNode; }
        getPosition() { return { position: { lineNumber: 1, column: 1 }, preference: [0 /* ContentWidgetPositionPreference.EXACT */] }; }
        _handleKeyDown(e) {
            if (e.keyCode !== 1 /* KeyCode.Backspace */) {
                return;
            }
            const firstLine = this._editor.getModel()?.getLineContent(1);
            const selection = this._editor.getSelection();
            const withSlash = `/${this._lastSlashCommandText} `;
            if (!firstLine?.startsWith(withSlash) || !selection?.isEmpty() || selection?.startLineNumber !== 1 || selection?.startColumn !== withSlash.length + 1) {
                return;
            }
            // Allow to undo the backspace
            this._editor.executeEdits('chat-slash-command', [{
                    range: new range_1.Range(1, 1, 1, selection.startColumn),
                    text: null
                }]);
            // Announce the deletion
            aria.alert((0, nls_1.localize)('exited slash command mode', 'Exited {0} mode', this._lastSlashCommandText));
        }
    }
    exports.SlashCommandContentWidget = SlashCommandContentWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFNsYXNoQ29tbWFuZENvbnRlbnRXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvY2hhdFNsYXNoQ29tbWFuZENvbnRlbnRXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEseUJBQTBCLFNBQVEsc0JBQVU7UUFLeEQsWUFBb0IsT0FBb0I7WUFDdkMsS0FBSyxFQUFFLENBQUM7WUFEVyxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBSmhDLGFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXpDLGVBQVUsR0FBRyxLQUFLLENBQUM7WUFLMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1lBRWpFLHFFQUFxRTtZQUNyRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRVEsT0FBTztZQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNwQixPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsSUFBSTtZQUNILElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxjQUFjLENBQUMsWUFBb0I7WUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxZQUFZLEdBQUcsQ0FBQztZQUM5QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsWUFBWSxDQUFDO1FBQzNDLENBQUM7UUFFRCxLQUFLLEtBQUssT0FBTyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsVUFBVSxLQUFLLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdEMsV0FBVyxLQUFLLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsK0NBQXVDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFakgsY0FBYyxDQUFDLENBQWlCO1lBQ3ZDLElBQUksQ0FBQyxDQUFDLE9BQU8sOEJBQXNCLEVBQUU7Z0JBQ3BDLE9BQU87YUFDUDtZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDOUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMscUJBQXFCLEdBQUcsQ0FBQztZQUNwRCxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxTQUFTLEVBQUUsZUFBZSxLQUFLLENBQUMsSUFBSSxTQUFTLEVBQUUsV0FBVyxLQUFLLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0SixPQUFPO2FBQ1A7WUFFRCw4QkFBOEI7WUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztvQkFDaEQsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUM7b0JBQ2hELElBQUksRUFBRSxJQUFJO2lCQUNWLENBQUMsQ0FBQyxDQUFDO1lBRUosd0JBQXdCO1lBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNsRyxDQUFDO0tBQ0Q7SUFqRUQsOERBaUVDIn0=