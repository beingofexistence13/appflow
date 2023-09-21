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
    exports.createTextModel = exports.StandaloneDiffEditor2 = exports.StandaloneEditor = exports.StandaloneCodeEditor = void 0;
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
        aria.setARIAContainer(parent || document.body);
    }
    /**
     * A code editor to be used both by the standalone editor and the standalone diff editor.
     */
    let StandaloneCodeEditor = class StandaloneCodeEditor extends codeEditorWidget_1.CodeEditorWidget {
        constructor(domElement, _options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
            const options = { ..._options };
            options.ariaLabel = options.ariaLabel || standaloneStrings_1.StandaloneCodeEditorNLS.editorViewAccessibleLabel;
            options.ariaLabel = options.ariaLabel + ';' + (standaloneStrings_1.StandaloneCodeEditorNLS.accessibilityHelpMessage);
            super(domElement, options, {}, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
            if (keybindingService instanceof standaloneServices_1.StandaloneKeybindingService) {
                this._standaloneKeybindingService = keybindingService;
            }
            else {
                this._standaloneKeybindingService = null;
            }
            createAriaDomNode(options.ariaContainerElement);
        }
        addCommand(keybinding, handler, context) {
            if (!this._standaloneKeybindingService) {
                console.warn('Cannot add command because the editor is configured with an unrecognized KeybindingService');
                return null;
            }
            const commandId = 'DYNAMIC_' + (++LAST_GENERATED_COMMAND_ID);
            const whenExpression = contextkey_1.ContextKeyExpr.deserialize(context);
            this._standaloneKeybindingService.addDynamicKeybinding(commandId, keybinding, handler, whenExpression);
            return commandId;
        }
        createContextKey(key, defaultValue) {
            return this._contextKeyService.createKey(key, defaultValue);
        }
        addAction(_descriptor) {
            if ((typeof _descriptor.id !== 'string') || (typeof _descriptor.label !== 'string') || (typeof _descriptor.run !== 'function')) {
                throw new Error('Invalid action descriptor, `id`, `label` and `run` are required properties!');
            }
            if (!this._standaloneKeybindingService) {
                console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
                return lifecycle_1.Disposable.None;
            }
            // Read descriptor options
            const id = _descriptor.id;
            const label = _descriptor.label;
            const precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('editorId', this.getId()), contextkey_1.ContextKeyExpr.deserialize(_descriptor.precondition));
            const keybindings = _descriptor.keybindings;
            const keybindingsWhen = contextkey_1.ContextKeyExpr.and(precondition, contextkey_1.ContextKeyExpr.deserialize(_descriptor.keybindingContext));
            const contextMenuGroupId = _descriptor.contextMenuGroupId || null;
            const contextMenuOrder = _descriptor.contextMenuOrder || 0;
            const run = (_accessor, ...args) => {
                return Promise.resolve(_descriptor.run(this, ...args));
            };
            const toDispose = new lifecycle_1.DisposableStore();
            // Generate a unique id to allow the same descriptor.id across multiple editor instances
            const uniqueId = this.getId() + ':' + id;
            // Register the command
            toDispose.add(commands_1.CommandsRegistry.registerCommand(uniqueId, run));
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
                toDispose.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, menuItem));
            }
            // Register the keybindings
            if (Array.isArray(keybindings)) {
                for (const kb of keybindings) {
                    toDispose.add(this._standaloneKeybindingService.addDynamicKeybinding(uniqueId, kb, run, keybindingsWhen));
                }
            }
            // Finally, register an internal editor action
            const internalAction = new editorAction_1.InternalEditorAction(uniqueId, label, label, precondition, (...args) => Promise.resolve(_descriptor.run(this, ...args)), this._contextKeyService);
            // Store it under the original id, such that trigger with the original id will work
            this._actions.set(id, internalAction);
            toDispose.add((0, lifecycle_1.toDisposable)(() => {
                this._actions.delete(id);
            }));
            return toDispose;
        }
        _triggerCommand(handlerId, payload) {
            if (this._codeEditorService instanceof standaloneCodeEditorService_1.StandaloneCodeEditorService) {
                // Help commands find this editor as the active editor
                try {
                    this._codeEditorService.setActiveCodeEditor(this);
                    super._triggerCommand(handlerId, payload);
                }
                finally {
                    this._codeEditorService.setActiveCodeEditor(null);
                }
            }
            else {
                super._triggerCommand(handlerId, payload);
            }
        }
    };
    exports.StandaloneCodeEditor = StandaloneCodeEditor;
    exports.StandaloneCodeEditor = StandaloneCodeEditor = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, commands_1.ICommandService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, themeService_1.IThemeService),
        __param(8, notification_1.INotificationService),
        __param(9, accessibility_1.IAccessibilityService),
        __param(10, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(11, languageFeatures_1.ILanguageFeaturesService)
    ], StandaloneCodeEditor);
    let StandaloneEditor = class StandaloneEditor extends StandaloneCodeEditor {
        constructor(domElement, _options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, configurationService, accessibilityService, modelService, languageService, languageConfigurationService, languageFeaturesService) {
            const options = { ..._options };
            (0, standaloneServices_1.updateConfigurationService)(configurationService, options, false);
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
            this._configurationService = configurationService;
            this._standaloneThemeService = themeService;
            this._register(themeDomRegistration);
            let model;
            if (typeof _model === 'undefined') {
                const languageId = languageService.getLanguageIdByMimeType(options.language) || options.language || modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
                model = createTextModel(modelService, languageService, options.value || '', languageId, undefined);
                this._ownsModel = true;
            }
            else {
                model = _model;
                this._ownsModel = false;
            }
            this._attachModel(model);
            if (model) {
                const e = {
                    oldModelUrl: null,
                    newModelUrl: model.uri
                };
                this._onDidChangeModel.fire(e);
            }
        }
        dispose() {
            super.dispose();
        }
        updateOptions(newOptions) {
            (0, standaloneServices_1.updateConfigurationService)(this._configurationService, newOptions, false);
            if (typeof newOptions.theme === 'string') {
                this._standaloneThemeService.setTheme(newOptions.theme);
            }
            if (typeof newOptions.autoDetectHighContrast !== 'undefined') {
                this._standaloneThemeService.setAutoDetectHighContrast(Boolean(newOptions.autoDetectHighContrast));
            }
            super.updateOptions(newOptions);
        }
        _postDetachModelCleanup(detachedModel) {
            super._postDetachModelCleanup(detachedModel);
            if (detachedModel && this._ownsModel) {
                detachedModel.dispose();
                this._ownsModel = false;
            }
        }
    };
    exports.StandaloneEditor = StandaloneEditor;
    exports.StandaloneEditor = StandaloneEditor = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, commands_1.ICommandService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, standaloneTheme_1.IStandaloneThemeService),
        __param(8, notification_1.INotificationService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, accessibility_1.IAccessibilityService),
        __param(11, model_1.IModelService),
        __param(12, language_1.ILanguageService),
        __param(13, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(14, languageFeatures_1.ILanguageFeaturesService)
    ], StandaloneEditor);
    let StandaloneDiffEditor2 = class StandaloneDiffEditor2 extends diffEditorWidget_1.DiffEditorWidget {
        constructor(domElement, _options, instantiationService, contextKeyService, codeEditorService, themeService, notificationService, configurationService, contextMenuService, editorProgressService, clipboardService, audioCueService) {
            const options = { ..._options };
            (0, standaloneServices_1.updateConfigurationService)(configurationService, options, true);
            const themeDomRegistration = themeService.registerEditorContainer(domElement);
            if (typeof options.theme === 'string') {
                themeService.setTheme(options.theme);
            }
            if (typeof options.autoDetectHighContrast !== 'undefined') {
                themeService.setAutoDetectHighContrast(Boolean(options.autoDetectHighContrast));
            }
            super(domElement, options, {}, contextKeyService, instantiationService, codeEditorService, audioCueService, editorProgressService);
            this._configurationService = configurationService;
            this._standaloneThemeService = themeService;
            this._register(themeDomRegistration);
        }
        dispose() {
            super.dispose();
        }
        updateOptions(newOptions) {
            (0, standaloneServices_1.updateConfigurationService)(this._configurationService, newOptions, true);
            if (typeof newOptions.theme === 'string') {
                this._standaloneThemeService.setTheme(newOptions.theme);
            }
            if (typeof newOptions.autoDetectHighContrast !== 'undefined') {
                this._standaloneThemeService.setAutoDetectHighContrast(Boolean(newOptions.autoDetectHighContrast));
            }
            super.updateOptions(newOptions);
        }
        _createInnerEditor(instantiationService, container, options) {
            return instantiationService.createInstance(StandaloneCodeEditor, container, options);
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
    exports.StandaloneDiffEditor2 = StandaloneDiffEditor2;
    exports.StandaloneDiffEditor2 = StandaloneDiffEditor2 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, standaloneTheme_1.IStandaloneThemeService),
        __param(6, notification_1.INotificationService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, progress_1.IEditorProgressService),
        __param(10, clipboardService_1.IClipboardService),
        __param(11, audioCueService_1.IAudioCueService)
    ], StandaloneDiffEditor2);
    /**
     * @internal
     */
    function createTextModel(modelService, languageService, value, languageId, uri) {
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
    exports.createTextModel = createTextModel;
    /**
     * @internal
     */
    function doCreateModel(modelService, value, languageSelection, uri) {
        return modelService.createModel(value, languageSelection, uri);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUNvZGVFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3Ivc3RhbmRhbG9uZS9icm93c2VyL3N0YW5kYWxvbmVDb2RlRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTRPaEcsSUFBSSx5QkFBeUIsR0FBRyxDQUFDLENBQUM7SUFFbEMsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUM7SUFDL0I7Ozs7T0FJRztJQUNILFNBQVMsaUJBQWlCLENBQUMsTUFBK0I7UUFDekQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNaLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3ZCLE9BQU87YUFDUDtZQUNELGtCQUFrQixHQUFHLElBQUksQ0FBQztTQUMxQjtRQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRDs7T0FFRztJQUNJLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsbUNBQWdCO1FBSXpELFlBQ0MsVUFBdUIsRUFDdkIsUUFBd0QsRUFDakMsb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUN4QyxjQUErQixFQUM1QixpQkFBcUMsRUFDckMsaUJBQXFDLEVBQzFDLFlBQTJCLEVBQ3BCLG1CQUF5QyxFQUN4QyxvQkFBMkMsRUFDbkMsNEJBQTJELEVBQ2hFLHVCQUFpRDtZQUUzRSxNQUFNLE9BQU8sR0FBRyxFQUFFLEdBQUcsUUFBUSxFQUFFLENBQUM7WUFDaEMsT0FBTyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLDJDQUF1QixDQUFDLHlCQUF5QixDQUFDO1lBQzNGLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsQ0FBQywyQ0FBdUIsQ0FBQyx3QkFBd0Is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