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
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/aria/aria", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/nls!vs/editor/contrib/message/browser/messageController", "vs/platform/contextkey/common/contextkey", "vs/platform/opener/common/opener", "vs/base/browser/dom", "vs/css!./messageController"], function (require, exports, markdownRenderer_1, aria_1, event_1, htmlContent_1, lifecycle_1, editorExtensions_1, range_1, markdownRenderer_2, nls, contextkey_1, opener_1, dom) {
    "use strict";
    var $M2_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$M2 = void 0;
    let $M2 = class $M2 {
        static { $M2_1 = this; }
        static { this.ID = 'editor.contrib.messageController'; }
        static { this.MESSAGE_VISIBLE = new contextkey_1.$2i('messageVisible', false, nls.localize(0, null)); }
        static get(editor) {
            return editor.getContribution($M2_1.ID);
        }
        constructor(editor, contextKeyService, i) {
            this.i = i;
            this.d = new lifecycle_1.$lc();
            this.f = new lifecycle_1.$jc();
            this.h = false;
            this.a = editor;
            this.b = $M2_1.MESSAGE_VISIBLE.bindTo(contextKeyService);
        }
        dispose() {
            this.g?.dispose();
            this.f.dispose();
            this.d.dispose();
            this.b.reset();
        }
        isVisible() {
            return this.b.get();
        }
        showMessage(message, position) {
            (0, aria_1.$$P)((0, htmlContent_1.$Zj)(message) ? message.value : message);
            this.b.set(true);
            this.d.clear();
            this.f.clear();
            this.g = (0, htmlContent_1.$Zj)(message) ? (0, markdownRenderer_1.$zQ)(message, {
                actionHandler: {
                    callback: (url) => (0, markdownRenderer_2.$L2)(this.i, url, (0, htmlContent_1.$Zj)(message) ? message.isTrusted : undefined),
                    disposables: this.f
                },
            }) : undefined;
            this.d.value = new MessageWidget(this.a, position, typeof message === 'string' ? message : this.g.element);
            // close on blur (debounced to allow to tab into the message), cursor, model change, dispose
            this.f.add(event_1.Event.debounce(this.a.onDidBlurEditorText, (last, event) => event, 0)(() => {
                if (this.h) {
                    return; // override when mouse over message
                }
                if (this.d.value && dom.$NO(dom.$VO(), this.d.value.getDomNode())) {
                    return; // override when focus is inside the message
                }
                this.closeMessage();
            }));
            this.f.add(this.a.onDidChangeCursorPosition(() => this.closeMessage()));
            this.f.add(this.a.onDidDispose(() => this.closeMessage()));
            this.f.add(this.a.onDidChangeModel(() => this.closeMessage()));
            this.f.add(dom.$nO(this.d.value.getDomNode(), dom.$3O.MOUSE_ENTER, () => this.h = true, true));
            this.f.add(dom.$nO(this.d.value.getDomNode(), dom.$3O.MOUSE_LEAVE, () => this.h = false, true));
            // close on mouse move
            let bounds;
            this.f.add(this.a.onMouseMove(e => {
                // outside the text area
                if (!e.target.position) {
                    return;
                }
                if (!bounds) {
                    // define bounding box around position and first mouse occurance
                    bounds = new range_1.$ks(position.lineNumber - 3, 1, e.target.position.lineNumber + 3, 1);
                }
                else if (!bounds.containsPosition(e.target.position)) {
                    // check if position is still in bounds
                    this.closeMessage();
                }
            }));
        }
        closeMessage() {
            this.b.reset();
            this.f.clear();
            if (this.d.value) {
                this.f.add(MessageWidget.fadeOut(this.d.value));
            }
        }
    };
    exports.$M2 = $M2;
    exports.$M2 = $M2 = $M2_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, opener_1.$NT)
    ], $M2);
    const MessageCommand = editorExtensions_1.$rV.bindToContribution($M2.get);
    (0, editorExtensions_1.$wV)(new MessageCommand({
        id: 'leaveEditorMessage',
        precondition: $M2.MESSAGE_VISIBLE,
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
            this.a = editor;
            this.a.revealLinesInCenterIfOutsideViewport(lineNumber, lineNumber, 0 /* ScrollType.Smooth */);
            this.b = { lineNumber, column };
            this.d = document.createElement('div');
            this.d.classList.add('monaco-editor-overlaymessage');
            this.d.style.marginLeft = '-6px';
            const anchorTop = document.createElement('div');
            anchorTop.classList.add('anchor', 'top');
            this.d.appendChild(anchorTop);
            const message = document.createElement('div');
            if (typeof text === 'string') {
                message.classList.add('message');
                message.textContent = text;
            }
            else {
                text.classList.add('message');
                message.appendChild(text);
            }
            this.d.appendChild(message);
            const anchorBottom = document.createElement('div');
            anchorBottom.classList.add('anchor', 'below');
            this.d.appendChild(anchorBottom);
            this.a.addContentWidget(this);
            this.d.classList.add('fadeIn');
        }
        dispose() {
            this.a.removeContentWidget(this);
        }
        getId() {
            return 'messageoverlay';
        }
        getDomNode() {
            return this.d;
        }
        getPosition() {
            return {
                position: this.b,
                preference: [
                    1 /* ContentWidgetPositionPreference.ABOVE */,
                    2 /* ContentWidgetPositionPreference.BELOW */,
                ],
                positionAffinity: 1 /* PositionAffinity.Right */,
            };
        }
        afterRender(position) {
            this.d.classList.toggle('below', position === 2 /* ContentWidgetPositionPreference.BELOW */);
        }
    }
    (0, editorExtensions_1.$AV)($M2.ID, $M2, 4 /* EditorContributionInstantiation.Lazy */);
});
//# sourceMappingURL=messageController.js.map