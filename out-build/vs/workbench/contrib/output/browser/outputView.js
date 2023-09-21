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
define(["require", "exports", "vs/nls!vs/workbench/contrib/output/browser/outputView", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/workbench/services/output/common/output", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/workbench/common/views", "vs/workbench/common/editor/textResourceEditorInput", "vs/platform/opener/common/opener", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dom", "vs/base/common/async", "vs/platform/files/common/files", "vs/workbench/common/contextkeys", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, nls, telemetry_1, storage_1, textResourceConfiguration_1, instantiation_1, contextkey_1, textResourceEditor_1, output_1, themeService_1, configuration_1, editorGroupsService_1, editorService_1, viewPane_1, keybinding_1, contextView_1, views_1, textResourceEditorInput_1, opener_1, theme_1, colorRegistry_1, dom_1, async_1, files_1, contextkeys_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kVb = void 0;
    let $kVb = class $kVb extends viewPane_1.$Ieb {
        get scrollLock() { return !!this.f.get(); }
        set scrollLock(scrollLock) { this.f.set(scrollLock); }
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.c = null;
            this.f = output_1.$dJ.bindTo(this.zb);
            const editorInstantiationService = instantiationService.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.vb]));
            this.a = editorInstantiationService.createInstance(OutputEditor);
            this.B(this.a.onTitleAreaUpdate(() => {
                this.Jb(this.a.getTitle());
                this.Ub();
            }));
            this.B(this.onDidChangeBodyVisibility(() => this.j(this.isBodyVisible())));
        }
        showChannel(channel, preserveFocus) {
            if (this.b !== channel.id) {
                this.m(channel);
            }
            if (!preserveFocus) {
                this.focus();
            }
        }
        focus() {
            super.focus();
            this.c?.then(() => this.a.focus());
        }
        U(container) {
            super.U(container);
            this.a.create(container);
            container.classList.add('output-view');
            const codeEditor = this.a.getControl();
            codeEditor.setAriaOptions({ role: 'document', activeDescendant: undefined });
            this.B(codeEditor.onDidChangeModelContent(() => {
                if (!this.scrollLock) {
                    this.a.revealLastLine();
                }
            }));
            this.B(codeEditor.onDidChangeCursorPosition((e) => {
                if (e.reason !== 3 /* CursorChangeReason.Explicit */) {
                    return;
                }
                if (!this.yb.getValue('output.smartScroll.enabled')) {
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
        W(height, width) {
            super.W(height, width);
            this.a.layout(new dom_1.$BO(width, height));
        }
        j(visible) {
            this.a.setVisible(visible);
            if (!visible) {
                this.n();
            }
        }
        m(channel) {
            this.b = channel.id;
            const input = this.r(channel);
            if (!this.a.input || !input.matches(this.a.input)) {
                this.c?.cancel();
                this.c = (0, async_1.$ug)(token => this.a.setInput(this.r(channel), { preserveFocus: true }, Object.create(null), token)
                    .then(() => this.a));
            }
        }
        n() {
            this.b = undefined;
            this.a.clearInput();
            this.c = null;
        }
        r(channel) {
            return this.Bb.createInstance(textResourceEditorInput_1.$7eb, channel.uri, nls.localize(0, null, channel.label), nls.localize(1, null, channel.label), undefined, undefined);
        }
    };
    exports.$kVb = $kVb;
    exports.$kVb = $kVb = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, contextView_1.$WZ),
        __param(3, configuration_1.$8h),
        __param(4, contextkey_1.$3i),
        __param(5, views_1.$_E),
        __param(6, instantiation_1.$Ah),
        __param(7, opener_1.$NT),
        __param(8, themeService_1.$gv),
        __param(9, telemetry_1.$9k)
    ], $kVb);
    let OutputEditor = class OutputEditor extends textResourceEditor_1.$Dvb {
        constructor(telemetryService, instantiationService, storageService, $, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService, contextKeyService) {
            super(output_1.$aJ, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
            this.$ = $;
            this.c = this.B(instantiationService.createInstance(contextkeys_1.$Kdb));
        }
        getId() {
            return output_1.$aJ;
        }
        getTitle() {
            return nls.localize(2, null);
        }
        Hb() {
            const options = super.Hb();
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
            const outputConfig = this.$.getValue('[Log]');
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
        Yb() {
            return this.input ? this.input.getAriaLabel() : nls.localize(3, null);
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
            this.c.set(input.resource);
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
            this.c.reset();
        }
        ab(parent) {
            parent.setAttribute('role', 'document');
            super.ab(parent);
            const scopedContextKeyService = this.scopedContextKeyService;
            if (scopedContextKeyService) {
                output_1.$bJ.bindTo(scopedContextKeyService).set(true);
            }
        }
    };
    OutputEditor = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, instantiation_1.$Ah),
        __param(2, storage_1.$Vo),
        __param(3, configuration_1.$8h),
        __param(4, textResourceConfiguration_1.$FA),
        __param(5, themeService_1.$gv),
        __param(6, editorGroupsService_1.$5C),
        __param(7, editorService_1.$9C),
        __param(8, files_1.$6j),
        __param(9, contextkey_1.$3i)
    ], OutputEditor);
    (0, themeService_1.$mv)((theme, collector) => {
        // Sidebar background for the output view
        const sidebarBackground = theme.getColor(theme_1.$Iab);
        if (sidebarBackground && sidebarBackground !== theme.getColor(colorRegistry_1.$ww)) {
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
//# sourceMappingURL=outputView.js.map