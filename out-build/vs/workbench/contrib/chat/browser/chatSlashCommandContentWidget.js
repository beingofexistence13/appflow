/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/chat/browser/chatSlashCommandContentWidget", "vs/base/browser/ui/aria/aria", "vs/css!./chatSlashCommandContentWidget"], function (require, exports, range_1, lifecycle_1, nls_1, aria) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rqb = void 0;
    class $rqb extends lifecycle_1.$kc {
        constructor(f) {
            super();
            this.f = f;
            this.a = document.createElement('div');
            this.c = false;
            this.a.toggleAttribute('hidden', true);
            this.a.classList.add('chat-slash-command-content-widget');
            // If backspace at a slash command boundary, remove the slash command
            this.B(this.f.onKeyDown((e) => this.g(e)));
        }
        dispose() {
            this.f.removeContentWidget(this);
            super.dispose();
        }
        show() {
            if (this.c) {
                return;
            }
            this.c = true;
            this.a.toggleAttribute('hidden', false);
            this.f.addContentWidget(this);
        }
        hide() {
            this.c = false;
            this.a.toggleAttribute('hidden', true);
            this.f.removeContentWidget(this);
        }
        setCommandText(slashCommand) {
            this.a.innerText = `/${slashCommand} `;
            this.b = slashCommand;
        }
        getId() { return 'chat-slash-command-content-widget'; }
        getDomNode() { return this.a; }
        getPosition() { return { position: { lineNumber: 1, column: 1 }, preference: [0 /* ContentWidgetPositionPreference.EXACT */] }; }
        g(e) {
            if (e.keyCode !== 1 /* KeyCode.Backspace */) {
                return;
            }
            const firstLine = this.f.getModel()?.getLineContent(1);
            const selection = this.f.getSelection();
            const withSlash = `/${this.b} `;
            if (!firstLine?.startsWith(withSlash) || !selection?.isEmpty() || selection?.startLineNumber !== 1 || selection?.startColumn !== withSlash.length + 1) {
                return;
            }
            // Allow to undo the backspace
            this.f.executeEdits('chat-slash-command', [{
                    range: new range_1.$ks(1, 1, 1, selection.startColumn),
                    text: null
                }]);
            // Announce the deletion
            aria.$$P((0, nls_1.localize)(0, null, this.b));
        }
    }
    exports.$rqb = $rqb;
});
//# sourceMappingURL=chatSlashCommandContentWidget.js.map