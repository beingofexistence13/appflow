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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/memento", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/browser/actions/chatClear", "vs/css!./media/chatEditor"], function (require, exports, contextkey_1, instantiation_1, serviceCollection_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, editorPane_1, memento_1, chatEditorInput_1, chatWidget_1, chatClear_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$CIb = void 0;
    let $CIb = class $CIb extends editorPane_1.$0T {
        get scopedContextKeyService() {
            return this.b;
        }
        constructor(telemetryService, themeService, g, j, m) {
            super(chatEditorInput_1.$yGb.EditorID, telemetryService, themeService, j);
            this.g = g;
            this.j = j;
            this.m = m;
        }
        async clear() {
            return this.g.invokeFunction(chatClear_1.$BIb);
        }
        ab(parent) {
            this.b = this.B(this.m.createScoped(parent));
            const scopedInstantiationService = this.g.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.scopedContextKeyService]));
            this.a = this.B(scopedInstantiationService.createInstance(chatWidget_1.$zIb, { resource: true }, {
                listForeground: colorRegistry_1.$xw,
                listBackground: colorRegistry_1.$ww,
                inputEditorBackground: colorRegistry_1.$Mv,
                resultEditorBackground: colorRegistry_1.$ww
            }));
            this.B(this.a.onDidClear(() => this.clear()));
            this.a.render(parent);
            this.a.setVisible(true);
        }
        focus() {
            if (this.a) {
                this.a.focusInput();
            }
        }
        clearInput() {
            this.G();
            super.clearInput();
        }
        async setInput(input, options, context, token) {
            super.setInput(input, options, context, token);
            const editorModel = await input.resolve();
            if (!editorModel) {
                throw new Error(`Failed to get model for chat editor. id: ${input.sessionId}`);
            }
            if (!this.a) {
                throw new Error('ChatEditor lifecycle issue: no editor widget');
            }
            this.s(editorModel.model);
        }
        s(model) {
            this.c = new memento_1.$YT('interactive-session-editor-' + model.sessionId, this.j);
            this.f = this.c.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.a.setModel(model, { ...this.f });
        }
        G() {
            this.a?.saveState();
            if (this.c && this.f) {
                const widgetViewState = this.a.getViewState();
                this.f.inputValue = widgetViewState.inputValue;
                this.c.saveMemento();
            }
        }
        layout(dimension, position) {
            if (this.a) {
                this.a.layout(dimension.height, dimension.width);
            }
        }
    };
    exports.$CIb = $CIb;
    exports.$CIb = $CIb = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, instantiation_1.$Ah),
        __param(3, storage_1.$Vo),
        __param(4, contextkey_1.$3i)
    ], $CIb);
});
//# sourceMappingURL=chatEditor.js.map