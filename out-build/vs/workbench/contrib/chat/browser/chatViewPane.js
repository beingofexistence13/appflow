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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/memento", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, cancellation_1, lifecycle_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, log_1, opener_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, viewPane_1, memento_1, theme_1, views_1, chatWidget_1, chatService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yIb = exports.$xIb = void 0;
    exports.$xIb = 'workbench.panel.chatSidebar';
    let $yIb = class $yIb extends viewPane_1.$Ieb {
        static { this.ID = 'workbench.panel.chat.view'; }
        get widget() { return this.a; }
        constructor(g, options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, h, j, m) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.b = this.B(new lifecycle_1.$jc());
            // View state for the ViewPane is currently global per-provider basically, but some other strictly per-model state will require a separate memento.
            this.c = new memento_1.$YT('interactive-session-view-' + this.g.providerId, this.h);
            this.f = this.c.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        n(model) {
            this.b.clear();
            model = model ?? (this.j.transferredSessionData?.sessionId
                ? this.j.getOrRestoreSession(this.j.transferredSessionData.sessionId)
                : this.j.startSession(this.g.providerId, cancellation_1.CancellationToken.None));
            if (!model) {
                throw new Error('Could not start chat session');
            }
            this.a.setModel(model, { ...this.f });
            this.f.sessionId = model.sessionId;
        }
        U(parent) {
            try {
                super.U(parent);
                const scopedInstantiationService = this.Bb.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.vb]));
                this.a = this.B(scopedInstantiationService.createInstance(chatWidget_1.$zIb, { viewId: this.id }, {
                    listForeground: theme_1.$Jab,
                    listBackground: this.Rb(),
                    inputEditorBackground: this.Rb(),
                    resultEditorBackground: colorRegistry_1.$ww
                }));
                this.B(this.onDidChangeBodyVisibility(visible => {
                    this.a.setVisible(visible);
                }));
                this.B(this.a.onDidClear(() => this.clear()));
                this.a.render(parent);
                let sessionId;
                if (this.j.transferredSessionData) {
                    sessionId = this.j.transferredSessionData.sessionId;
                    this.f.inputValue = this.j.transferredSessionData.inputValue;
                }
                else {
                    sessionId = this.f.sessionId;
                }
                const initialModel = sessionId ? this.j.getOrRestoreSession(sessionId) : undefined;
                this.n(initialModel);
            }
            catch (e) {
                this.m.error(e);
                throw e;
            }
        }
        acceptInput(query) {
            this.a.acceptInput(query);
        }
        async clear() {
            if (this.widget.viewModel) {
                this.j.clearSession(this.widget.viewModel.sessionId);
            }
            this.f.inputValue = '';
            this.n();
        }
        loadSession(sessionId) {
            if (this.widget.viewModel) {
                this.j.clearSession(this.widget.viewModel.sessionId);
            }
            const newModel = this.j.getOrRestoreSession(sessionId);
            this.n(newModel);
        }
        focusInput() {
            this.a.focusInput();
        }
        focus() {
            super.focus();
            this.a.focusInput();
        }
        W(height, width) {
            super.W(height, width);
            this.a.layout(height, width);
        }
        saveState() {
            if (this.a) {
                // Since input history is per-provider, this is handled by a separate service and not the memento here.
                // TODO multiple chat views will overwrite each other
                this.a.saveState();
                const widgetViewState = this.a.getViewState();
                this.f.inputValue = widgetViewState.inputValue;
                this.c.saveMemento();
            }
            super.saveState();
        }
    };
    exports.$yIb = $yIb;
    exports.$yIb = $yIb = __decorate([
        __param(2, keybinding_1.$2D),
        __param(3, contextView_1.$WZ),
        __param(4, configuration_1.$8h),
        __param(5, contextkey_1.$3i),
        __param(6, views_1.$_E),
        __param(7, instantiation_1.$Ah),
        __param(8, opener_1.$NT),
        __param(9, themeService_1.$gv),
        __param(10, telemetry_1.$9k),
        __param(11, storage_1.$Vo),
        __param(12, chatService_1.$FH),
        __param(13, log_1.$5i)
    ], $yIb);
});
//# sourceMappingURL=chatViewPane.js.map