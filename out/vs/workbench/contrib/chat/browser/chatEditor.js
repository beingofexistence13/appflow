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
    exports.ChatEditor = void 0;
    let ChatEditor = class ChatEditor extends editorPane_1.EditorPane {
        get scopedContextKeyService() {
            return this._scopedContextKeyService;
        }
        constructor(telemetryService, themeService, instantiationService, storageService, contextKeyService) {
            super(chatEditorInput_1.ChatEditorInput.EditorID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.contextKeyService = contextKeyService;
        }
        async clear() {
            return this.instantiationService.invokeFunction(chatClear_1.clearChatEditor);
        }
        createEditor(parent) {
            this._scopedContextKeyService = this._register(this.contextKeyService.createScoped(parent));
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
            this.widget = this._register(scopedInstantiationService.createInstance(chatWidget_1.ChatWidget, { resource: true }, {
                listForeground: colorRegistry_1.editorForeground,
                listBackground: colorRegistry_1.editorBackground,
                inputEditorBackground: colorRegistry_1.inputBackground,
                resultEditorBackground: colorRegistry_1.editorBackground
            }));
            this._register(this.widget.onDidClear(() => this.clear()));
            this.widget.render(parent);
            this.widget.setVisible(true);
        }
        focus() {
            if (this.widget) {
                this.widget.focusInput();
            }
        }
        clearInput() {
            this.saveState();
            super.clearInput();
        }
        async setInput(input, options, context, token) {
            super.setInput(input, options, context, token);
            const editorModel = await input.resolve();
            if (!editorModel) {
                throw new Error(`Failed to get model for chat editor. id: ${input.sessionId}`);
            }
            if (!this.widget) {
                throw new Error('ChatEditor lifecycle issue: no editor widget');
            }
            this.updateModel(editorModel.model);
        }
        updateModel(model) {
            this._memento = new memento_1.Memento('interactive-session-editor-' + model.sessionId, this.storageService);
            this._viewState = this._memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.widget.setModel(model, { ...this._viewState });
        }
        saveState() {
            this.widget?.saveState();
            if (this._memento && this._viewState) {
                const widgetViewState = this.widget.getViewState();
                this._viewState.inputValue = widgetViewState.inputValue;
                this._memento.saveMemento();
            }
        }
        layout(dimension, position) {
            if (this.widget) {
                this.widget.layout(dimension.height, dimension.width);
            }
        }
    };
    exports.ChatEditor = ChatEditor;
    exports.ChatEditor = ChatEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, contextkey_1.IContextKeyService)
    ], ChatEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9jaGF0RWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCekYsSUFBTSxVQUFVLEdBQWhCLE1BQU0sVUFBVyxTQUFRLHVCQUFVO1FBSXpDLElBQWEsdUJBQXVCO1lBQ25DLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDO1FBQ3RDLENBQUM7UUFLRCxZQUNvQixnQkFBbUMsRUFDdkMsWUFBMkIsRUFDRixvQkFBMkMsRUFDakQsY0FBK0IsRUFDNUIsaUJBQXFDO1lBRTFFLEtBQUssQ0FBQyxpQ0FBZSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFKeEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDNUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtRQUczRSxDQUFDO1FBRU0sS0FBSyxDQUFDLEtBQUs7WUFDakIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJCQUFlLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRWtCLFlBQVksQ0FBQyxNQUFtQjtZQUNsRCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDNUYsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLElBQUkscUNBQWlCLENBQUMsQ0FBQywrQkFBa0IsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEosSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUMzQiwwQkFBMEIsQ0FBQyxjQUFjLENBQ3hDLHVCQUFVLEVBQ1YsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQ2xCO2dCQUNDLGNBQWMsRUFBRSxnQ0FBZ0I7Z0JBQ2hDLGNBQWMsRUFBRSxnQ0FBZ0I7Z0JBQ2hDLHFCQUFxQixFQUFFLCtCQUFlO2dCQUN0QyxzQkFBc0IsRUFBRSxnQ0FBZ0I7YUFDeEMsQ0FBQyxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVlLEtBQUs7WUFDcEIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ3pCO1FBQ0YsQ0FBQztRQUVRLFVBQVU7WUFDbEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2pCLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRVEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFzQixFQUFFLE9BQTJCLEVBQUUsT0FBMkIsRUFBRSxLQUF3QjtZQUNqSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRS9DLE1BQU0sV0FBVyxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2FBQy9FO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQzthQUNoRTtZQUVELElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTyxXQUFXLENBQUMsS0FBaUI7WUFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFPLENBQUMsNkJBQTZCLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbEcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsK0RBQTZELENBQUM7WUFDeEcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRWtCLFNBQVM7WUFDM0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUV6QixJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDckMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLFVBQVcsQ0FBQyxVQUFVLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQztnQkFDekQsSUFBSSxDQUFDLFFBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUM3QjtRQUNGLENBQUM7UUFFUSxNQUFNLENBQUMsU0FBd0IsRUFBRSxRQUF1QztZQUNoRixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3REO1FBQ0YsQ0FBQztLQUNELENBQUE7SUEzRlksZ0NBQVU7eUJBQVYsVUFBVTtRQVlwQixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSwrQkFBa0IsQ0FBQTtPQWhCUixVQUFVLENBMkZ0QiJ9