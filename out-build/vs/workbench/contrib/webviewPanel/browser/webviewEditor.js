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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uuid", "vs/nls!vs/workbench/contrib/webviewPanel/browser/webviewEditor", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/webview/browser/webviewWindowDragMonitor", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/services/editor/browser/editorDropService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/host/browser/host", "vs/workbench/services/layout/browser/layoutService"], function (require, exports, DOM, event_1, lifecycle_1, platform_1, uuid_1, nls, contextkey_1, storage_1, telemetry_1, themeService_1, editorPane_1, webviewWindowDragMonitor_1, webviewEditorInput_1, editorDropService_1, editorGroupsService_1, editorService_1, host_1, layoutService_1) {
    "use strict";
    var $gfb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gfb = exports.$ffb = void 0;
    /**
     * Tracks the id of the actively focused webview.
     */
    exports.$ffb = new contextkey_1.$2i('activeWebviewPanelId', '', {
        type: 'string',
        description: nls.localize(0, null),
    });
    let $gfb = class $gfb extends editorPane_1.$0T {
        static { $gfb_1 = this; }
        static { this.ID = 'WebviewEditor'; }
        get onDidFocus() { return this.m.event; }
        constructor(telemetryService, themeService, storageService, editorGroupsService, s, u, y, $, eb) {
            super($gfb_1.ID, telemetryService, themeService, storageService);
            this.s = s;
            this.u = u;
            this.y = y;
            this.$ = $;
            this.eb = eb;
            this.c = false;
            this.f = false;
            this.g = this.B(new lifecycle_1.$jc());
            this.j = this.B(new lifecycle_1.$lc());
            this.m = this.B(new event_1.$fd());
            this.r = this.B(new lifecycle_1.$lc());
            this.B(event_1.Event.any(editorGroupsService.onDidScroll, editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup, editorGroupsService.onDidMoveGroup)(() => {
                if (this.fb && this.c) {
                    this.jb(this.fb);
                }
            }));
        }
        get fb() {
            return this.input instanceof webviewEditorInput_1.$cfb ? this.input.webview : undefined;
        }
        get scopedContextKeyService() {
            return this.r.value;
        }
        ab(parent) {
            const element = document.createElement('div');
            this.a = element;
            this.a.id = `webview-editor-element-${(0, uuid_1.$4f)()}`;
            parent.appendChild(element);
            this.r.value = this.eb.createScoped(element);
        }
        dispose() {
            this.f = true;
            this.a?.remove();
            this.a = undefined;
            super.dispose();
        }
        layout(dimension) {
            this.b = dimension;
            if (this.fb && this.c) {
                this.jb(this.fb, dimension);
            }
        }
        focus() {
            super.focus();
            if (!this.j.value && !platform_1.$o) {
                // Make sure we restore focus when switching back to a VS Code window
                this.j.value = this.$.onDidChangeFocus(focused => {
                    if (focused && this.s.activeEditorPane === this && this.u.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                        this.focus();
                    }
                });
            }
            this.fb?.focus();
        }
        bb(visible, group) {
            this.c = visible;
            if (this.input instanceof webviewEditorInput_1.$cfb && this.fb) {
                if (visible) {
                    this.ib(this.input);
                }
                else {
                    this.fb.release(this);
                }
            }
            super.bb(visible, group);
        }
        clearInput() {
            if (this.fb) {
                this.fb.release(this);
                this.g.clear();
            }
            super.clearInput();
        }
        async setInput(input, options, context, token) {
            if (this.input && input.matches(this.input)) {
                return;
            }
            const alreadyOwnsWebview = input instanceof webviewEditorInput_1.$cfb && input.webview === this.fb;
            if (this.fb && !alreadyOwnsWebview) {
                this.fb.release(this);
            }
            await super.setInput(input, options, context, token);
            await input.resolve(options);
            if (token.isCancellationRequested || this.f) {
                return;
            }
            if (input instanceof webviewEditorInput_1.$cfb) {
                if (this.group) {
                    input.updateGroup(this.group.id);
                }
                if (!alreadyOwnsWebview) {
                    this.ib(input);
                }
                if (this.b) {
                    this.layout(this.b);
                }
            }
        }
        ib(input) {
            input.webview.claim(this, this.scopedContextKeyService);
            if (this.a) {
                this.a.setAttribute('aria-flowto', input.webview.container.id);
                DOM.$OO(input.webview.container, this.a);
            }
            this.g.clear();
            // Webviews are not part of the normal editor dom, so we have to register our own drag and drop handler on them.
            this.g.add(this.y.createEditorDropTarget(input.webview.container, {
                containsGroup: (group) => this.group?.id === group.id
            }));
            this.g.add(new webviewWindowDragMonitor_1.$afb(() => this.fb));
            this.jb(input.webview);
            this.g.add(this.kb(input.webview));
        }
        jb(webview, dimension) {
            if (!this.a?.isConnected) {
                return;
            }
            const rootContainer = this.u.getContainer("workbench.parts.editor" /* Parts.EDITOR_PART */);
            webview.layoutWebviewOverElement(this.a.parentElement, dimension, rootContainer);
        }
        kb(webview) {
            const store = new lifecycle_1.$jc();
            // Track focus in webview content
            const webviewContentFocusTracker = DOM.$8O(webview.container);
            store.add(webviewContentFocusTracker);
            store.add(webviewContentFocusTracker.onDidFocus(() => this.m.fire()));
            // Track focus in webview element
            store.add(webview.onDidFocus(() => this.m.fire()));
            return store;
        }
    };
    exports.$gfb = $gfb;
    exports.$gfb = $gfb = $gfb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, storage_1.$Vo),
        __param(3, editorGroupsService_1.$5C),
        __param(4, editorService_1.$9C),
        __param(5, layoutService_1.$Meb),
        __param(6, editorDropService_1.$efb),
        __param(7, host_1.$VT),
        __param(8, contextkey_1.$3i)
    ], $gfb);
});
//# sourceMappingURL=webviewEditor.js.map