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
define(["require", "exports", "vs/platform/theme/common/themeService", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/nls!vs/workbench/contrib/debug/browser/welcomeView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/views", "vs/platform/registry/common/platform", "vs/platform/opener/common/opener", "vs/workbench/common/contextkeys", "vs/workbench/browser/actions/workspaceActions", "vs/base/common/platform", "vs/editor/browser/editorBrowser", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/base/common/lifecycle", "vs/workbench/contrib/debug/browser/debugCommands"], function (require, exports, themeService_1, keybinding_1, contextView_1, configuration_1, contextkey_1, nls_1, debug_1, editorService_1, viewPane_1, instantiation_1, views_1, platform_1, opener_1, contextkeys_1, workspaceActions_1, platform_2, editorBrowser_1, storage_1, telemetry_1, lifecycle_1, debugCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2Rb = void 0;
    const debugStartLanguageKey = 'debugStartLanguage';
    const CONTEXT_DEBUG_START_LANGUAGE = new contextkey_1.$2i(debugStartLanguageKey, undefined);
    const CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR = new contextkey_1.$2i('debuggerInterestedInActiveEditor', false);
    let $2Rb = class $2Rb extends viewPane_1.$Ieb {
        static { this.ID = 'workbench.debug.welcome'; }
        static { this.LABEL = (0, nls_1.localize)(0, null); }
        constructor(options, themeService, keybindingService, contextMenuService, configurationService, contextKeyService, c, f, instantiationService, viewDescriptorService, openerService, storageSevice, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.c = c;
            this.f = f;
            this.a = CONTEXT_DEBUG_START_LANGUAGE.bindTo(contextKeyService);
            this.b = CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR.bindTo(contextKeyService);
            const lastSetLanguage = storageSevice.get(debugStartLanguageKey, 1 /* StorageScope.WORKSPACE */);
            this.a.set(lastSetLanguage);
            const setContextKey = () => {
                const editorControl = this.f.activeTextEditorControl;
                if ((0, editorBrowser_1.$iV)(editorControl)) {
                    const model = editorControl.getModel();
                    const language = model ? model.getLanguageId() : undefined;
                    if (language && this.c.getAdapterManager().someDebuggerInterestedInLanguage(language)) {
                        this.a.set(language);
                        this.b.set(true);
                        storageSevice.store(debugStartLanguageKey, language, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                        return;
                    }
                }
                this.b.set(false);
            };
            const disposables = new lifecycle_1.$jc();
            this.B(disposables);
            this.B(f.onDidActiveEditorChange(() => {
                disposables.clear();
                const editorControl = this.f.activeTextEditorControl;
                if ((0, editorBrowser_1.$iV)(editorControl)) {
                    disposables.add(editorControl.onDidChangeModelLanguage(setContextKey));
                }
                setContextKey();
            }));
            this.B(this.c.getAdapterManager().onDidRegisterDebugger(setContextKey));
            this.B(this.onDidChangeBodyVisibility(visible => {
                if (visible) {
                    setContextKey();
                }
            }));
            setContextKey();
            const debugKeybinding = this.wb.lookupKeybinding(debugCommands_1.$BQb);
            debugKeybindingLabel = debugKeybinding ? ` (${debugKeybinding.getLabel()})` : '';
        }
        shouldShowWelcome() {
            return true;
        }
    };
    exports.$2Rb = $2Rb;
    exports.$2Rb = $2Rb = __decorate([
        __param(1, themeService_1.$gv),
        __param(2, keybinding_1.$2D),
        __param(3, contextView_1.$WZ),
        __param(4, configuration_1.$8h),
        __param(5, contextkey_1.$3i),
        __param(6, debug_1.$nH),
        __param(7, editorService_1.$9C),
        __param(8, instantiation_1.$Ah),
        __param(9, views_1.$_E),
        __param(10, opener_1.$NT),
        __param(11, storage_1.$Vo),
        __param(12, telemetry_1.$9k)
    ], $2Rb);
    const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViewWelcomeContent($2Rb.ID, {
        content: (0, nls_1.localize)(1, null, (platform_2.$j && !platform_2.$o) ? workspaceActions_1.$6tb.ID : workspaceActions_1.$3tb.ID),






        when: contextkey_1.$Ii.and(debug_1.$ZG, CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR.toNegated()),
        group: views_1.ViewContentGroups.Open,
    });
    let debugKeybindingLabel = '';
    viewsRegistry.registerViewWelcomeContent($2Rb.ID, {
        content: `[${(0, nls_1.localize)(2, null)}${debugKeybindingLabel}](command:${debugCommands_1.$BQb})`,
        when: debug_1.$ZG,
        group: views_1.ViewContentGroups.Debug,
        // Allow inserting more buttons directly after this one (by setting order to 1).
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent($2Rb.ID, {
        content: `[${(0, nls_1.localize)(3, null)}](command:${debugCommands_1.$xQb}).`,
        when: debug_1.$ZG,
        group: views_1.ViewContentGroups.Debug,
        order: 10
    });
    viewsRegistry.registerViewWelcomeContent($2Rb.ID, {
        content: (0, nls_1.localize)(4, null, debugCommands_1.$AQb),






        when: contextkey_1.$Ii.and(debug_1.$ZG, contextkeys_1.$Pcb.notEqualsTo('empty')),
        group: views_1.ViewContentGroups.Debug
    });
    viewsRegistry.registerViewWelcomeContent($2Rb.ID, {
        content: (0, nls_1.localize)(5, null, (platform_2.$j && !platform_2.$o) ? workspaceActions_1.$6tb.ID : workspaceActions_1.$4tb.ID),






        when: contextkey_1.$Ii.and(debug_1.$ZG, contextkeys_1.$Pcb.isEqualTo('empty')),
        group: views_1.ViewContentGroups.Debug
    });
    viewsRegistry.registerViewWelcomeContent($2Rb.ID, {
        content: (0, nls_1.localize)(6, null),
        when: debug_1.$1G.toNegated(),
        group: views_1.ViewContentGroups.Debug
    });
});
//# sourceMappingURL=welcomeView.js.map