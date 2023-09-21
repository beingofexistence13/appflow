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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/editorAction", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/common/standaloneTheme", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/platform/accessibility/common/accessibility", "vs/editor/common/standaloneStrings", "vs/platform/clipboard/common/clipboardService", "vs/platform/progress/common/progress", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/standalone/browser/standaloneCodeEditorService", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, aria, lifecycle_1, codeEditorService_1, codeEditorWidget_1, editorAction_1, standaloneServices_1, standaloneTheme_1, actions_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, themeService_1, accessibility_1, standaloneStrings_1, clipboardService_1, progress_1, model_1, language_1, standaloneCodeEditorService_1, modesRegistry_1, languageConfigurationRegistry_1, languageFeatures_1, diffEditorWidget_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$38b = exports.$28b = exports.$18b = exports.$Z8b = void 0;
    let LAST_GENERATED_COMMAND_ID = 0;
    let ariaDomNodeCreated = false;
    /**
     * Create ARIA dom node inside parent,
     * or only for the first editor instantiation inside document.body.
     * @param parent container element for ARIA dom node
     */
    function createAriaDomNode(parent) {
        if (!parent) {
            if (ariaDomNodeCreated) {
                return;
            }
            ariaDomNodeCreated = true;
        }
        aria.$0P(parent || document.body);
    }
    /**
     * A code editor to be used both by the standalone editor and the standalone diff editor.
     */
    let $Z8b = class $Z8b extends codeEditorWidget_1.$uY {
        constructor(domElement, _options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
            const options = { ..._options };
            options.ariaLabel = options.ariaLabel || standaloneStrings_1.StandaloneCodeEditorNLS.editorViewAccessibleLabel;
            options.ariaLabel = options.ariaLabel + ';' + (standaloneStrings_1.StandaloneCodeEditorNLS.accessibilityHelpMessage);
            super(domElement, options, {}, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
            if (keybindingService instanceof standaloneServices_1.$W8b) {
                this.cc = keybindingService;
            }
            else {
                this.cc = null;
            }
            createAriaDomNode(options.ariaContainerElement);
        }
        addCommand(keybinding, handler, context) {
            if (!this.cc) {
                console.warn('Cannot add command because the editor is configured with an unrecognized KeybindingService');
                return null;
            }
            const commandId = 'DYNAMIC_' + (++LAST_GENERATED_COMMAND_ID);
            const whenExpression = contextkey_1.$Ii.deserialize(context);
            this.cc.addDynamicKeybinding(commandId, keybinding, handler, whenExpression);
            return commandId;
        }
        createContextKey(key, defaultValue) {
            return this.ob.createKey(key, defaultValue);
        }
        addAction(_descriptor) {
            if ((typeof _descriptor.id !== 'string') || (typeof _descriptor.label !== 'string') || (typeof _descriptor.run !== 'function')) {
                throw new Error('Invalid action descriptor, `id`, `label` and `run` are required properties!');
            }
            if (!this.cc) {
                console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
                return lifecycle_1.$kc.None;
            }
            // Read descriptor options
            const id = _descriptor.id;
            const label = _descriptor.label;
            const precondition = contextkey_1.$Ii.and(contextkey_1.$Ii.equals('editorId', this.getId()), contextkey_1.$Ii.deserialize(_descriptor.precondition));
            const keybindings = _descriptor.keybindings;
            const keybindingsWhen = contextkey_1.$Ii.and(precondition, contextkey_1.$Ii.deserialize(_descriptor.keybindingContext));
            const contextMenuGroupId = _descriptor.contextMenuGroupId || null;
            const contextMenuOrder = _descriptor.contextMenuOrder || 0;
            const run = (_accessor, ...args) => {
                return Promise.resolve(_descriptor.run(this, ...args));
            };
            const toDispose = new lifecycle_1.$jc();
            // Generate a unique id to allow the same descriptor.id across multiple editor instances
            const uniqueId = this.getId() + ':' + id;
            // Register the command
            toDispose.add(commands_1.$Gr.registerCommand(uniqueId, run));
            // Register the context menu item
            if (contextMenuGroupId) {
                const menuItem = {
                    command: {
                        id: uniqueId,
                        title: label
                    },
                    when: precondition,
                    group: contextMenuGroupId,
                    order: contextMenuOrder
                };
                toDispose.add(actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorContext, menuItem));
            }
            // Register the keybindings
            if (Array.isArray(keybindings)) {
                for (const kb of keybindings) {
                    toDispose.add(this.cc.addDynamicKeybinding(uniqueId, kb, run, keybindingsWhen));
                }
            }
            // Finally, register an internal editor action
            const internalAction = new editorAction_1.$UX(uniqueId, label, label, precondition, (...args) => Promise.resolve(_descriptor.run(this, ...args)), this.ob);
            // Store it under the original id, such that trigger with the original id will work
            this.lb.set(id, internalAction);
            toDispose.add((0, lifecycle_1.$ic)(() => {
                this.lb.delete(id);
            }));
            return toDispose;
        }
        Mb(handlerId, payload) {
            if (this.qb instanceof standaloneCodeEditorService_1.$G8b) {
                // Help commands find this editor as the active editor
                try {
                    this.qb.setActiveCodeEditor(this);
                    super.Mb(handlerId, payload);
                }
                finally {
                    this.qb.setActiveCodeEditor(null);
                }
            }
            else {
                super.Mb(handlerId, payload);
            }
        }
    };
    exports.$Z8b = $Z8b;
    exports.$Z8b = $Z8b = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, codeEditorService_1.$nV),
        __param(4, commands_1.$Fr),
        __param(5, contextkey_1.$3i),
        __param(6, keybinding_1.$2D),
        __param(7, themeService_1.$gv),
        __param(8, notification_1.$Yu),
        __param(9, accessibility_1.$1r),
        __param(10, languageConfigurationRegistry_1.$2t),
        __param(11, languageFeatures_1.$hF)
    ], $Z8b);
    let $18b = class $18b extends $Z8b {
        constructor(domElement, _options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, configurationService, accessibilityService, modelService, languageService, languageConfigurationService, languageFeaturesService) {
            const options = { ..._options };
            (0, standaloneServices_1.$Y8b)(configurationService, options, false);
            const themeDomRegistration = themeService.registerEditorContainer(domElement);
            if (typeof options.theme === 'string') {
                themeService.setTheme(options.theme);
            }
            if (typeof options.autoDetectHighContrast !== 'undefined') {
                themeService.setAutoDetectHighContrast(Boolean(options.autoDetectHighContrast));
            }
            const _model = options.model;
            delete options.model;
            super(domElement, options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
            this.ec = configurationService;
            this.fc = themeService;
            this.B(themeDomRegistration);
            let model;
            if (typeof _model === 'undefined') {
                const languageId = languageService.getLanguageIdByMimeType(options.language) || options.language || modesRegistry_1.$Yt;
                model = $38b(modelService, languageService, options.value || '', languageId, undefined);
                this.gc = true;
            }
            else {
                model = _model;
                this.gc = false;
            }
            this.Ub(model);
            if (model) {
                const e = {
                    oldModelUrl: null,
                    newModelUrl: model.uri
                };
                this.y.fire(e);
            }
        }
        dispose() {
            super.dispose();
        }
        updateOptions(newOptions) {
            (0, standaloneServices_1.$Y8b)(this.ec, newOptions, false);
            if (typeof newOptions.theme === 'string') {
                this.fc.setTheme(newOptions.theme);
            }
            if (typeof newOptions.autoDetectHighContrast !== 'undefined') {
                this.fc.setAutoDetectHighContrast(Boolean(newOptions.autoDetectHighContrast));
            }
            super.updateOptions(newOptions);
        }
        Wb(detachedModel) {
            super.Wb(detachedModel);
            if (detachedModel && this.gc) {
                detachedModel.dispose();
                this.gc = false;
            }
        }
    };
    exports.$18b = $18b;
    exports.$18b = $18b = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, codeEditorService_1.$nV),
        __param(4, commands_1.$Fr),
        __param(5, contextkey_1.$3i),
        __param(6, keybinding_1.$2D),
        __param(7, standaloneTheme_1.$D8b),
        __param(8, notification_1.$Yu),
        __param(9, configuration_1.$8h),
        __param(10, accessibility_1.$1r),
        __param(11, model_1.$yA),
        __param(12, language_1.$ct),
        __param(13, languageConfigurationRegistry_1.$2t),
        __param(14, languageFeatures_1.$hF)
    ], $18b);
    let $28b = class $28b extends diffEditorWidget_1.$6Z {
        constructor(domElement, _options, instantiationService, contextKeyService, codeEditorService, themeService, notificationService, configurationService, contextMenuService, editorProgressService, clipboardService, audioCueService) {
            const options = { ..._options };
            (0, standaloneServices_1.$Y8b)(configurationService, options, true);
            const themeDomRegistration = themeService.registerEditorContainer(domElement);
            if (typeof options.theme === 'string') {
                themeService.setTheme(options.theme);
            }
            if (typeof options.autoDetectHighContrast !== 'undefined') {
                themeService.setAutoDetectHighContrast(Boolean(options.autoDetectHighContrast));
            }
            super(domElement, options, {}, contextKeyService, instantiationService, codeEditorService, audioCueService, editorProgressService);
            this.Z = configurationService;
            this.ab = themeService;
            this.B(themeDomRegistration);
        }
        dispose() {
            super.dispose();
        }
        updateOptions(newOptions) {
            (0, standaloneServices_1.$Y8b)(this.Z, newOptions, true);
            if (typeof newOptions.theme === 'string') {
                this.ab.setTheme(newOptions.theme);
            }
            if (typeof newOptions.autoDetectHighContrast !== 'undefined') {
                this.ab.setAutoDetectHighContrast(Boolean(newOptions.autoDetectHighContrast));
            }
            super.updateOptions(newOptions);
        }
        R(instantiationService, container, options) {
            return instantiationService.createInstance($Z8b, container, options);
        }
        getOriginalEditor() {
            return super.getOriginalEditor();
        }
        getModifiedEditor() {
            return super.getModifiedEditor();
        }
        addCommand(keybinding, handler, context) {
            return this.getModifiedEditor().addCommand(keybinding, handler, context);
        }
        createContextKey(key, defaultValue) {
            return this.getModifiedEditor().createContextKey(key, defaultValue);
        }
        addAction(descriptor) {
            return this.getModifiedEditor().addAction(descriptor);
        }
    };
    exports.$28b = $28b;
    exports.$28b = $28b = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, contextkey_1.$3i),
        __param(4, codeEditorService_1.$nV),
        __param(5, standaloneTheme_1.$D8b),
        __param(6, notification_1.$Yu),
        __param(7, configuration_1.$8h),
        __param(8, contextView_1.$WZ),
        __param(9, progress_1.$7u),
        __param(10, clipboardService_1.$UZ),
        __param(11, audioCueService_1.$sZ)
    ], $28b);
    /**
     * @internal
     */
    function $38b(modelService, languageService, value, languageId, uri) {
        value = value || '';
        if (!languageId) {
            const firstLF = value.indexOf('\n');
            let firstLine = value;
            if (firstLF !== -1) {
                firstLine = value.substring(0, firstLF);
            }
            return doCreateModel(modelService, value, languageService.createByFilepathOrFirstLine(uri || null, firstLine), uri);
        }
        return doCreateModel(modelService, value, languageService.createById(languageId), uri);
    }
    exports.$38b = $38b;
    /**
     * @internal
     */
    function doCreateModel(modelService, value, languageSelection, uri) {
        return modelService.createModel(value, languageSelection, uri);
    }
});
//# sourceMappingURL=standaloneCodeEditor.js.map