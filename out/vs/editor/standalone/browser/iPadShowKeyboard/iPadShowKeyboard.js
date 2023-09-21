/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/base/common/platform", "vs/css!./iPadShowKeyboard"], function (require, exports, dom, lifecycle_1, editorExtensions_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IPadShowKeyboard = void 0;
    class IPadShowKeyboard extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.iPadShowKeyboard'; }
        constructor(editor) {
            super();
            this.editor = editor;
            this.widget = null;
            if (platform_1.isIOS) {
                this._register(editor.onDidChangeConfiguration(() => this.update()));
                this.update();
            }
        }
        update() {
            const shouldHaveWidget = (!this.editor.getOption(90 /* EditorOption.readOnly */));
            if (!this.widget && shouldHaveWidget) {
                this.widget = new ShowKeyboardWidget(this.editor);
            }
            else if (this.widget && !shouldHaveWidget) {
                this.widget.dispose();
                this.widget = null;
            }
        }
        dispose() {
            super.dispose();
            if (this.widget) {
                this.widget.dispose();
                this.widget = null;
            }
        }
    }
    exports.IPadShowKeyboard = IPadShowKeyboard;
    class ShowKeyboardWidget extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.ShowKeyboardWidget'; }
        constructor(editor) {
            super();
            this.editor = editor;
            this._domNode = document.createElement('textarea');
            this._domNode.className = 'iPadShowKeyboard';
            this._register(dom.addDisposableListener(this._domNode, 'touchstart', (e) => {
                this.editor.focus();
            }));
            this._register(dom.addDisposableListener(this._domNode, 'focus', (e) => {
                this.editor.focus();
            }));
            this.editor.addOverlayWidget(this);
        }
        dispose() {
            this.editor.removeOverlayWidget(this);
            super.dispose();
        }
        // ----- IOverlayWidget API
        getId() {
            return ShowKeyboardWidget.ID;
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return {
                preference: 1 /* OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER */
            };
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(IPadShowKeyboard.ID, IPadShowKeyboard, 3 /* EditorContributionInstantiation.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaVBhZFNob3dLZXlib2FyZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9zdGFuZGFsb25lL2Jyb3dzZXIvaVBhZFNob3dLZXlib2FyZC9pUGFkU2hvd0tleWJvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFhLGdCQUFpQixTQUFRLHNCQUFVO2lCQUV4QixPQUFFLEdBQUcsaUNBQWlDLENBQUM7UUFLOUQsWUFBWSxNQUFtQjtZQUM5QixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksZ0JBQUssRUFBRTtnQkFDVixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDZDtRQUNGLENBQUM7UUFFTyxNQUFNO1lBQ2IsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLGdDQUF1QixDQUFDLENBQUM7WUFFekUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksZ0JBQWdCLEVBQUU7Z0JBRXJDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFFbEQ7aUJBQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBRTVDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2FBRW5CO1FBQ0YsQ0FBQztRQUVlLE9BQU87WUFDdEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDbkI7UUFDRixDQUFDOztJQXRDRiw0Q0F1Q0M7SUFFRCxNQUFNLGtCQUFtQixTQUFRLHNCQUFVO2lCQUVsQixPQUFFLEdBQUcsbUNBQW1DLENBQUM7UUFNakUsWUFBWSxNQUFtQjtZQUM5QixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztZQUU3QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUMzRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUN0RSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFZSxPQUFPO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFRCwyQkFBMkI7UUFFcEIsS0FBSztZQUNYLE9BQU8sa0JBQWtCLENBQUMsRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFTSxVQUFVO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPO2dCQUNOLFVBQVUsNkRBQXFEO2FBQy9ELENBQUM7UUFDSCxDQUFDOztJQUdGLElBQUEsNkNBQTBCLEVBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLGdCQUFnQixxREFBNkMsQ0FBQyJ9