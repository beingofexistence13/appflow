/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/aria/aria", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/opener/common/opener", "vs/base/browser/dom", "vs/css!./messageController"], function (require, exports, markdownRenderer_1, aria_1, event_1, htmlContent_1, lifecycle_1, editorExtensions_1, range_1, markdownRenderer_2, nls, contextkey_1, opener_1, dom) {
    "use strict";
    var MessageController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageController = void 0;
    let MessageController = class MessageController {
        static { MessageController_1 = this; }
        static { this.ID = 'editor.contrib.messageController'; }
        static { this.MESSAGE_VISIBLE = new contextkey_1.RawContextKey('messageVisible', false, nls.localize('messageVisible', 'Whether the editor is currently showing an inline message')); }
        static get(editor) {
            return editor.getContribution(MessageController_1.ID);
        }
        constructor(editor, contextKeyService, _openerService) {
            this._openerService = _openerService;
            this._messageWidget = new lifecycle_1.MutableDisposable();
            this._messageListeners = new lifecycle_1.DisposableStore();
            this._mouseOverMessage = false;
            this._editor = editor;
            this._visible = MessageController_1.MESSAGE_VISIBLE.bindTo(contextKeyService);
        }
        dispose() {
            this._message?.dispose();
            this._messageListeners.dispose();
            this._messageWidget.dispose();
            this._visible.reset();
        }
        isVisible() {
            return this._visible.get();
        }
        showMessage(message, position) {
            (0, aria_1.alert)((0, htmlContent_1.isMarkdownString)(message) ? message.value : message);
            this._visible.set(true);
            this._messageWidget.clear();
            this._messageListeners.clear();
            this._message = (0, htmlContent_1.isMarkdownString)(message) ? (0, markdownRenderer_1.renderMarkdown)(message, {
                actionHandler: {
                    callback: (url) => (0, markdownRenderer_2.openLinkFromMarkdown)(this._openerService, url, (0, htmlContent_1.isMarkdownString)(message) ? message.isTrusted : undefined),
                    disposables: this._messageListeners
                },
            }) : undefined;
            this._messageWidget.value = new MessageWidget(this._editor, position, typeof message === 'string' ? message : this._message.element);
            // close on blur (debounced to allow to tab into the message), cursor, model change, dispose
            this._messageListeners.add(event_1.Event.debounce(this._editor.onDidBlurEditorText, (last, event) => event, 0)(() => {
                if (this._mouseOverMessage) {
                    return; // override when mouse over message
                }
                if (this._messageWidget.value && dom.isAncestor(dom.getActiveElement(), this._messageWidget.value.getDomNode())) {
                    return; // override when focus is inside the message
                }
                this.closeMessage();
            }));
            this._messageListeners.add(this._editor.onDidChangeCursorPosition(() => this.closeMessage()));
            this._messageListeners.add(this._editor.onDidDispose(() => this.closeMessage()));
            this._messageListeners.add(this._editor.onDidChangeModel(() => this.closeMessage()));
            this._messageListeners.add(dom.addDisposableListener(this._messageWidget.value.getDomNode(), dom.EventType.MOUSE_ENTER, () => this._mouseOverMessage = true, true));
            this._messageListeners.add(dom.addDisposableListener(this._messageWidget.value.getDomNode(), dom.EventType.MOUSE_LEAVE, () => this._mouseOverMessage = false, true));
            // close on mouse move
            let bounds;
            this._messageListeners.add(this._editor.onMouseMove(e => {
                // outside the text area
                if (!e.target.position) {
                    return;
                }
                if (!bounds) {
                    // define bounding box around position and first mouse occurance
                    bounds = new range_1.Range(position.lineNumber - 3, 1, e.target.position.lineNumber + 3, 1);
                }
                else if (!bounds.containsPosition(e.target.position)) {
                    // check if position is still in bounds
                    this.closeMessage();
                }
            }));
        }
        closeMessage() {
            this._visible.reset();
            this._messageListeners.clear();
            if (this._messageWidget.value) {
                this._messageListeners.add(MessageWidget.fadeOut(this._messageWidget.value));
            }
        }
    };
    exports.MessageController = MessageController;
    exports.MessageController = MessageController = MessageController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, opener_1.IOpenerService)
    ], MessageController);
    const MessageCommand = editorExtensions_1.EditorCommand.bindToContribution(MessageController.get);
    (0, editorExtensions_1.registerEditorCommand)(new MessageCommand({
        id: 'leaveEditorMessage',
        precondition: MessageController.MESSAGE_VISIBLE,
        handler: c => c.closeMessage(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 30,
            primary: 9 /* KeyCode.Escape */
        }
    }));
    class MessageWidget {
        static fadeOut(messageWidget) {
            const dispose = () => {
                messageWidget.dispose();
                clearTimeout(handle);
                messageWidget.getDomNode().removeEventListener('animationend', dispose);
            };
            const handle = setTimeout(dispose, 110);
            messageWidget.getDomNode().addEventListener('animationend', dispose);
            messageWidget.getDomNode().classList.add('fadeOut');
            return { dispose };
        }
        constructor(editor, { lineNumber, column }, text) {
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.suppressMouseDown = false;
            this._editor = editor;
            this._editor.revealLinesInCenterIfOutsideViewport(lineNumber, lineNumber, 0 /* ScrollType.Smooth */);
            this._position = { lineNumber, column };
            this._domNode = document.createElement('div');
            this._domNode.classList.add('monaco-editor-overlaymessage');
            this._domNode.style.marginLeft = '-6px';
            const anchorTop = document.createElement('div');
            anchorTop.classList.add('anchor', 'top');
            this._domNode.appendChild(anchorTop);
            const message = document.createElement('div');
            if (typeof text === 'string') {
                message.classList.add('message');
                message.textContent = text;
            }
            else {
                text.classList.add('message');
                message.appendChild(text);
            }
            this._domNode.appendChild(message);
            const anchorBottom = document.createElement('div');
            anchorBottom.classList.add('anchor', 'below');
            this._domNode.appendChild(anchorBottom);
            this._editor.addContentWidget(this);
            this._domNode.classList.add('fadeIn');
        }
        dispose() {
            this._editor.removeContentWidget(this);
        }
        getId() {
            return 'messageoverlay';
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return {
                position: this._position,
                preference: [
                    1 /* ContentWidgetPositionPreference.ABOVE */,
                    2 /* ContentWidgetPositionPreference.BELOW */,
                ],
                positionAffinity: 1 /* PositionAffinity.Right */,
            };
        }
        afterRender(position) {
            this._domNode.classList.toggle('below', position === 2 /* ContentWidgetPositionPreference.BELOW */);
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(MessageController.ID, MessageController, 4 /* EditorContributionInstantiation.Lazy */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZUNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9tZXNzYWdlL2Jyb3dzZXIvbWVzc2FnZUNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXNCekYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7O2lCQUVOLE9BQUUsR0FBRyxrQ0FBa0MsQUFBckMsQ0FBc0M7aUJBRS9DLG9CQUFlLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGdCQUFnQixFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLDJEQUEyRCxDQUFDLENBQUMsQUFBbkosQ0FBb0o7UUFFbkwsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUM3QixPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQW9CLG1CQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFTRCxZQUNDLE1BQW1CLEVBQ0MsaUJBQXFDLEVBQ3pDLGNBQStDO1lBQTlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQVIvQyxtQkFBYyxHQUFHLElBQUksNkJBQWlCLEVBQWlCLENBQUM7WUFDeEQsc0JBQWlCLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFbkQsc0JBQWlCLEdBQVksS0FBSyxDQUFDO1lBUTFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsbUJBQWlCLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxTQUFTO1lBQ1IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFRCxXQUFXLENBQUMsT0FBaUMsRUFBRSxRQUFtQjtZQUVqRSxJQUFBLFlBQUssRUFBQyxJQUFBLDhCQUFnQixFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUzRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUEsOEJBQWdCLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsaUNBQWMsRUFBQyxPQUFPLEVBQUU7Z0JBQ25FLGFBQWEsRUFBRTtvQkFDZCxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUEsdUNBQW9CLEVBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUUsSUFBQSw4QkFBZ0IsRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO29CQUM1SCxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtpQkFDbkM7YUFDRCxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNmLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXRJLDRGQUE0RjtZQUM1RixJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGFBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQzNHLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO29CQUMzQixPQUFPLENBQUMsbUNBQW1DO2lCQUMzQztnQkFFRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRTtvQkFDaEgsT0FBTyxDQUFDLDRDQUE0QztpQkFDcEQ7Z0JBRUQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FDQSxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RixJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BLLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVySyxzQkFBc0I7WUFDdEIsSUFBSSxNQUFhLENBQUM7WUFDbEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdkQsd0JBQXdCO2dCQUN4QixJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7b0JBQ3ZCLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixnRUFBZ0U7b0JBQ2hFLE1BQU0sR0FBRyxJQUFJLGFBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDcEY7cUJBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUN2RCx1Q0FBdUM7b0JBQ3ZDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztpQkFDcEI7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELFlBQVk7WUFDWCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMvQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO2dCQUM5QixJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQzdFO1FBQ0YsQ0FBQzs7SUFoR1csOENBQWlCO2dDQUFqQixpQkFBaUI7UUFtQjNCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSx1QkFBYyxDQUFBO09BcEJKLGlCQUFpQixDQWlHN0I7SUFFRCxNQUFNLGNBQWMsR0FBRyxnQ0FBYSxDQUFDLGtCQUFrQixDQUFvQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUdsRyxJQUFBLHdDQUFxQixFQUFDLElBQUksY0FBYyxDQUFDO1FBQ3hDLEVBQUUsRUFBRSxvQkFBb0I7UUFDeEIsWUFBWSxFQUFFLGlCQUFpQixDQUFDLGVBQWU7UUFDL0MsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRTtRQUM5QixNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsMkNBQWlDLEVBQUU7WUFDM0MsT0FBTyx3QkFBZ0I7U0FDdkI7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLE1BQU0sYUFBYTtRQVVsQixNQUFNLENBQUMsT0FBTyxDQUFDLGFBQTRCO1lBQzFDLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtnQkFDcEIsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN4QixZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3JCLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekUsQ0FBQyxDQUFDO1lBQ0YsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN4QyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JFLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRUQsWUFBWSxNQUFtQixFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBYSxFQUFFLElBQTBCO1lBcEI5Riw0Q0FBNEM7WUFDbkMsd0JBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQzNCLHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQW9CbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxVQUFVLEVBQUUsVUFBVSw0QkFBb0IsQ0FBQztZQUM3RixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBRXhDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1lBRXhDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXJDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQzdCLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzthQUMzQjtpQkFBTTtnQkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDOUIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMxQjtZQUNELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRW5DLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXhDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsS0FBSztZQUNKLE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVELFVBQVU7WUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVELFdBQVc7WUFDVixPQUFPO2dCQUNOLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDeEIsVUFBVSxFQUFFOzs7aUJBR1g7Z0JBQ0QsZ0JBQWdCLGdDQUF3QjthQUN4QyxDQUFDO1FBQ0gsQ0FBQztRQUVELFdBQVcsQ0FBQyxRQUFnRDtZQUMzRCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsa0RBQTBDLENBQUMsQ0FBQztRQUM3RixDQUFDO0tBRUQ7SUFFRCxJQUFBLDZDQUEwQixFQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxpQkFBaUIsK0NBQXVDLENBQUMifQ==