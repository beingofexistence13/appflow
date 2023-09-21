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
define(["require", "exports", "vs/nls", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/workbench/services/output/common/output", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/workbench/common/views", "vs/workbench/common/editor/textResourceEditorInput", "vs/platform/opener/common/opener", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dom", "vs/base/common/async", "vs/platform/files/common/files", "vs/workbench/common/contextkeys", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, nls, telemetry_1, storage_1, textResourceConfiguration_1, instantiation_1, contextkey_1, textResourceEditor_1, output_1, themeService_1, configuration_1, editorGroupsService_1, editorService_1, viewPane_1, keybinding_1, contextView_1, views_1, textResourceEditorInput_1, opener_1, theme_1, colorRegistry_1, dom_1, async_1, files_1, contextkeys_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutputViewPane = void 0;
    let OutputViewPane = class OutputViewPane extends viewPane_1.ViewPane {
        get scrollLock() { return !!this.scrollLockContextKey.get(); }
        set scrollLock(scrollLock) { this.scrollLockContextKey.set(scrollLock); }
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.editorPromise = null;
            this.scrollLockContextKey = output_1.CONTEXT_OUTPUT_SCROLL_LOCK.bindTo(this.contextKeyService);
            const editorInstantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
            this.editor = editorInstantiationService.createInstance(OutputEditor);
            this._register(this.editor.onTitleAreaUpdate(() => {
                this.updateTitle(this.editor.getTitle());
                this.updateActions();
            }));
            this._register(this.onDidChangeBodyVisibility(() => this.onDidChangeVisibility(this.isBodyVisible())));
        }
        showChannel(channel, preserveFocus) {
            if (this.channelId !== channel.id) {
                this.setInput(channel);
            }
            if (!preserveFocus) {
                this.focus();
            }
        }
        focus() {
            super.focus();
            this.editorPromise?.then(() => this.editor.focus());
        }
        renderBody(container) {
            super.renderBody(container);
            this.editor.create(container);
            container.classList.add('output-view');
            const codeEditor = this.editor.getControl();
            codeEditor.setAriaOptions({ role: 'document', activeDescendant: undefined });
            this._register(codeEditor.onDidChangeModelContent(() => {
                if (!this.scrollLock) {
                    this.editor.revealLastLine();
                }
            }));
            this._register(codeEditor.onDidChangeCursorPosition((e) => {
                if (e.reason !== 3 /* CursorChangeReason.Explicit */) {
                    return;
                }
                if (!this.configurationService.getValue('output.smartScroll.enabled')) {
                    return;
                }
                const model = codeEditor.getModel();
                if (model) {
                    const newPositionLine = e.position.lineNumber;
                    const lastLine = model.getLineCount();
                    this.scrollLock = lastLine !== newPositionLine;
                }
            }));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.editor.layout(new dom_1.Dimension(width, height));
        }
        onDidChangeVisibility(visible) {
            this.editor.setVisible(visible);
            if (!visible) {
                this.clearInput();
            }
        }
        setInput(channel) {
            this.channelId = channel.id;
            const input = this.createInput(channel);
            if (!this.editor.input || !input.matches(this.editor.input)) {
                this.editorPromise?.cancel();
                this.editorPromise = (0, async_1.createCancelablePromise)(token => this.editor.setInput(this.createInput(channel), { preserveFocus: true }, Object.create(null), token)
                    .then(() => this.editor));
            }
        }
        clearInput() {
            this.channelId = undefined;
            this.editor.clearInput();
            this.editorPromise = null;
        }
        createInput(channel) {
            return this.instantiationService.createInstance(textResourceEditorInput_1.TextResourceEditorInput, channel.uri, nls.localize('output model title', "{0} - Output", channel.label), nls.localize('channel', "Output channel for '{0}'", channel.label), undefined, undefined);
        }
    };
    exports.OutputViewPane = OutputViewPane;
    exports.OutputViewPane = OutputViewPane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService)
    ], OutputViewPane);
    let OutputEditor = class OutputEditor extends textResourceEditor_1.AbstractTextResourceEditor {
        constructor(telemetryService, instantiationService, storageService, configurationService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService, contextKeyService) {
            super(output_1.OUTPUT_VIEW_ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
            this.configurationService = configurationService;
            this.resourceContext = this._register(instantiationService.createInstance(contextkeys_1.ResourceContextKey));
        }
        getId() {
            return output_1.OUTPUT_VIEW_ID;
        }
        getTitle() {
            return nls.localize('output', "Output");
        }
        getConfigurationOverrides() {
            const options = super.getConfigurationOverrides();
            options.wordWrap = 'on'; // all output editors wrap
            options.lineNumbers = 'off'; // all output editors hide line numbers
            options.glyphMargin = false;
            options.lineDecorationsWidth = 20;
            options.rulers = [];
            options.folding = false;
            options.scrollBeyondLastLine = false;
            options.renderLineHighlight = 'none';
            options.minimap = { enabled: false };
            options.renderValidationDecorations = 'editable';
            options.padding = undefined;
            options.readOnly = true;
            options.domReadOnly = true;
            options.unicodeHighlight = {
                nonBasicASCII: false,
                invisibleCharacters: false,
                ambiguousCharacters: false,
            };
            const outputConfig = this.configurationService.getValue('[Log]');
            if (outputConfig) {
                if (outputConfig['editor.minimap.enabled']) {
                    options.minimap = { enabled: true };
                }
                if ('editor.wordWrap' in outputConfig) {
                    options.wordWrap = outputConfig['editor.wordWrap'];
                }
            }
            return options;
        }
        getAriaLabel() {
            return this.input ? this.input.getAriaLabel() : nls.localize('outputViewAriaLabel', "Output panel");
        }
        async setInput(input, options, context, token) {
            const focus = !(options && options.preserveFocus);
            if (this.input && input.matches(this.input)) {
                return;
            }
            if (this.input) {
                // Dispose previous input (Output panel is not a workbench editor)
                this.input.dispose();
            }
            await super.setInput(input, options, context, token);
            this.resourceContext.set(input.resource);
            if (focus) {
                this.focus();
            }
            this.revealLastLine();
        }
        clearInput() {
            if (this.input) {
                // Dispose current input (Output panel is not a workbench editor)
                this.input.dispose();
            }
            super.clearInput();
            this.resourceContext.reset();
        }
        createEditor(parent) {
            parent.setAttribute('role', 'document');
            super.createEditor(parent);
            const scopedContextKeyService = this.scopedContextKeyService;
            if (scopedContextKeyService) {
                output_1.CONTEXT_IN_OUTPUT.bindTo(scopedContextKeyService).set(true);
            }
        }
    };
    OutputEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, storage_1.IStorageService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, editorService_1.IEditorService),
        __param(8, files_1.IFileService),
        __param(9, contextkey_1.IContextKeyService)
    ], OutputEditor);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        // Sidebar background for the output view
        const sidebarBackground = theme.getColor(theme_1.SIDE_BAR_BACKGROUND);
        if (sidebarBackground && sidebarBackground !== theme.getColor(colorRegistry_1.editorBackground)) {
            collector.addRule(`
			.monaco-workbench .part.sidebar .output-view .monaco-editor,
			.monaco-workbench .part.sidebar .output-view .monaco-editor .margin,
			.monaco-workbench .part.sidebar .output-view .monaco-editor .monaco-editor-background {
				background-color: ${sidebarBackground};
			}
		`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL291dHB1dC9icm93c2VyL291dHB1dFZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0N6RixJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsbUJBQVE7UUFPM0MsSUFBSSxVQUFVLEtBQWMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLFVBQVUsQ0FBQyxVQUFtQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxGLFlBQ0MsT0FBeUIsRUFDTCxpQkFBcUMsRUFDcEMsa0JBQXVDLEVBQ3JDLG9CQUEyQyxFQUM5QyxpQkFBcUMsRUFDakMscUJBQTZDLEVBQzlDLG9CQUEyQyxFQUNsRCxhQUE2QixFQUM5QixZQUEyQixFQUN2QixnQkFBbUM7WUFFdEQsS0FBSyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFsQnBMLGtCQUFhLEdBQTJDLElBQUksQ0FBQztZQW1CcEUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG1DQUEwQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUV0RixNQUFNLDBCQUEwQixHQUFHLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxJQUFJLHFDQUFpQixDQUFDLENBQUMsK0JBQWtCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFD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