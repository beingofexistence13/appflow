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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/sash/sash", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/layout/browser/layoutService", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, dom, sash_1, async_1, cancellation_1, event_1, lifecycle_1, contextkey_1, instantiation_1, serviceCollection_1, layoutService_1, quickInput_1, colorRegistry_1, chat_1, chatWidget_1, chatService_1) {
    "use strict";
    var QuickChat_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iJb = void 0;
    let $iJb = class $iJb extends lifecycle_1.$kc {
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = this.B(new event_1.$fd());
            this.onDidClose = this.a.event;
        }
        get enabled() {
            return this.h.getProviderInfos().length > 0;
        }
        get focused() {
            const widget = this.b?.widget;
            if (!widget) {
                return false;
            }
            return dom.$NO(document.activeElement, widget);
        }
        toggle(providerId, query) {
            // If the input is already shown, hide it. This provides a toggle behavior of the quick pick
            if (this.focused) {
                this.close();
            }
            else {
                this.open(providerId, query);
            }
        }
        open(providerId, query) {
            if (this.b) {
                return this.focus();
            }
            // Check if any providers are available. If not, show nothing
            // This shouldn't be needed because of the precondition, but just in case
            const providerInfo = providerId
                ? this.h.getProviderInfos().find(info => info.id === providerId)
                : this.h.getProviderInfos()[0];
            if (!providerInfo) {
                return;
            }
            const disposableStore = new lifecycle_1.$jc();
            this.b = this.g.createQuickWidget();
            this.b.contextKey = 'chatInputVisible';
            this.b.ignoreFocusOut = true;
            disposableStore.add(this.b);
            this.f ??= dom.$('.interactive-session');
            this.b.widget = this.f;
            this.b.show();
            if (!this.c) {
                this.c = this.j.createInstance(QuickChat, {
                    providerId: providerInfo.id,
                });
                // show needs to come after the quickpick is shown
                this.c.render(this.f);
            }
            else {
                this.c.show();
            }
            disposableStore.add(this.b.onDidHide(() => {
                disposableStore.dispose();
                this.c.hide();
                this.b = undefined;
                this.a.fire();
            }));
            this.c.focus();
            if (query) {
                this.c.setValue(query);
                this.c.acceptInput();
            }
        }
        focus() {
            this.c?.focus();
        }
        close() {
            this.b?.dispose();
            this.b = undefined;
        }
        async openInChatView() {
            await this.c?.openChatView();
            this.close();
        }
    };
    exports.$iJb = $iJb;
    exports.$iJb = $iJb = __decorate([
        __param(0, quickInput_1.$Gq),
        __param(1, chatService_1.$FH),
        __param(2, instantiation_1.$Ah)
    ], $iJb);
    let QuickChat = class QuickChat extends lifecycle_1.$kc {
        static { QuickChat_1 = this; }
        // TODO@TylerLeonhardt: be responsive to window size
        static { this.DEFAULT_MIN_HEIGHT = 200; }
        static { this.a = 100; }
        constructor(m, n, r, s, t, u) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.h = this.B(new lifecycle_1.$lc());
            this.j = false;
        }
        clear() {
            this.f?.dispose();
            this.f = undefined;
            this.z();
            this.b.inputEditor.setValue('');
        }
        focus() {
            if (this.b) {
                this.b.focusInput();
                const value = this.b.inputEditor.getValue();
                if (value) {
                    this.b.inputEditor.setSelection({
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 1,
                        endColumn: value.length + 1
                    });
                }
            }
        }
        hide() {
            this.b.setVisible(false);
            // Maintain scroll position for a short time so that if the user re-shows the chat
            // the same scroll position will be used.
            this.h.value = (0, async_1.$Ig)(() => {
                // At this point, clear this mutable disposable which will be our signal that
                // the timer has expired and we should stop maintaining scroll position
                this.h.clear();
            }, 30 * 1000); // 30 seconds
        }
        show() {
            this.b.setVisible(true);
            // If the mutable disposable is set, then we are keeping the existing scroll position
            // so we should not update the layout.
            if (this.j) {
                this.j = false;
                this.b.updateDynamicChatTreeItemLayout(2, this.w);
            }
            if (!this.h.value) {
                this.b.layoutDynamicChatTreeItemMode();
            }
        }
        render(parent) {
            if (this.b) {
                throw new Error('Cannot render quick chat twice');
            }
            const scopedInstantiationService = this.n.createChild(new serviceCollection_1.$zh([
                contextkey_1.$3i,
                this.B(this.r.createScoped(parent))
            ]));
            this.b = this.B(scopedInstantiationService.createInstance(chatWidget_1.$zIb, { resource: true, renderInputOnTop: true, renderStyle: 'compact' }, {
                listForeground: colorRegistry_1.$Fw,
                listBackground: colorRegistry_1.$Ew,
                inputEditorBackground: colorRegistry_1.$Mv,
                resultEditorBackground: colorRegistry_1.$Ew
            }));
            this.b.render(parent);
            this.b.setVisible(true);
            this.b.setDynamicChatTreeItemLayout(2, this.w);
            this.z();
            this.c = this.B(new sash_1.$aR(parent, { getHorizontalSashTop: () => parent.offsetHeight }, { orientation: 1 /* Orientation.HORIZONTAL */ }));
            this.y(parent);
        }
        get w() {
            return this.u.dimension.height - QuickChat_1.a;
        }
        y(parent) {
            this.B(this.u.onDidLayout(() => {
                if (this.b.visible) {
                    this.b.updateDynamicChatTreeItemLayout(2, this.w);
                }
                else {
                    // If the chat is not visible, then we should defer updating the layout
                    // because it relies on offsetHeight which only works correctly
                    // when the chat is visible.
                    this.j = true;
                }
            }));
            this.B(this.b.inputEditor.onDidChangeModelContent((e) => {
                this.g = this.b.inputEditor.getValue();
            }));
            this.B(this.b.onDidClear(() => this.clear()));
            this.B(this.b.onDidChangeHeight((e) => this.c.layout()));
            const width = parent.offsetWidth;
            this.B(this.c.onDidStart(() => {
                this.b.isDynamicChatTreeItemLayoutEnabled = false;
            }));
            this.B(this.c.onDidChange((e) => {
                if (e.currentY < QuickChat_1.DEFAULT_MIN_HEIGHT || e.currentY > this.w) {
                    return;
                }
                this.b.layout(e.currentY, width);
                this.c.layout();
            }));
            this.B(this.c.onDidReset(() => {
                this.b.isDynamicChatTreeItemLayoutEnabled = true;
                this.b.layoutDynamicChatTreeItemMode();
            }));
        }
        async acceptInput() {
            return this.b.acceptInput();
        }
        async openChatView() {
            const widget = await this.t.revealViewForProvider(this.m.providerId);
            if (!widget?.viewModel || !this.f) {
                return;
            }
            for (const request of this.f.getRequests()) {
                if (request.response?.response.value || request.response?.errorDetails) {
                    this.s.addCompleteRequest(widget.viewModel.sessionId, request.message, {
                        message: request.response.response.value,
                        errorDetails: request.response.errorDetails,
                        followups: request.response.followups
                    });
                }
                else if (request.message) {
                }
            }
            const value = this.b.inputEditor.getValue();
            if (value) {
                widget.inputEditor.setValue(value);
            }
            widget.focusInput();
        }
        setValue(value) {
            this.b.inputEditor.setValue(value);
            this.focus();
        }
        z() {
            this.f ??= this.s.startSession(this.m.providerId, cancellation_1.CancellationToken.None);
            if (!this.f) {
                throw new Error('Could not start chat session');
            }
            this.b.setModel(this.f, { inputValue: this.g });
        }
    };
    QuickChat = QuickChat_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, contextkey_1.$3i),
        __param(3, chatService_1.$FH),
        __param(4, chat_1.$Nqb),
        __param(5, layoutService_1.$XT)
    ], QuickChat);
});
//# sourceMappingURL=chatQuick.js.map