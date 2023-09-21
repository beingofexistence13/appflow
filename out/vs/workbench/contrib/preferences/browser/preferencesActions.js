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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/uri", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/preferences/common/preferences", "vs/platform/commands/common/commands", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/editor/browser/editorExtensions", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding"], function (require, exports, actions_1, uri_1, getIconClasses_1, model_1, language_1, nls, quickInput_1, preferences_1, commands_1, platform_1, configurationRegistry_1, editorExtensions_1, actions_2, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigureLanguageBasedSettingsAction = void 0;
    let ConfigureLanguageBasedSettingsAction = class ConfigureLanguageBasedSettingsAction extends actions_1.Action {
        static { this.ID = 'workbench.action.configureLanguageBasedSettings'; }
        static { this.LABEL = { value: nls.localize('configureLanguageBasedSettings', "Configure Language Specific Settings..."), original: 'Configure Language Specific Settings...' }; }
        constructor(id, label, modelService, languageService, quickInputService, preferencesService) {
            super(id, label);
            this.modelService = modelService;
            this.languageService = languageService;
            this.quickInputService = quickInputService;
            this.preferencesService = preferencesService;
        }
        async run() {
            const languages = this.languageService.getSortedRegisteredLanguageNames();
            const picks = languages.map(({ languageName, languageId }) => {
                const description = nls.localize('languageDescriptionConfigured', "({0})", languageId);
                // construct a fake resource to be able to show nice icons if any
                let fakeResource;
                const extensions = this.languageService.getExtensions(languageId);
                if (extensions.length) {
                    fakeResource = uri_1.URI.file(extensions[0]);
                }
                else {
                    const filenames = this.languageService.getFilenames(languageId);
                    if (filenames.length) {
                        fakeResource = uri_1.URI.file(filenames[0]);
                    }
                }
                return {
                    label: languageName,
                    iconClasses: (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, fakeResource),
                    description
                };
            });
            await this.quickInputService.pick(picks, { placeHolder: nls.localize('pickLanguage', "Select Language") })
                .then(pick => {
                if (pick) {
                    const languageId = this.languageService.getLanguageIdByLanguageName(pick.label);
                    if (typeof languageId === 'string') {
                        return this.preferencesService.openLanguageSpecificSettings(languageId);
                    }
                }
                return undefined;
            });
        }
    };
    exports.ConfigureLanguageBasedSettingsAction = ConfigureLanguageBasedSettingsAction;
    exports.ConfigureLanguageBasedSettingsAction = ConfigureLanguageBasedSettingsAction = __decorate([
        __param(2, model_1.IModelService),
        __param(3, language_1.ILanguageService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, preferences_1.IPreferencesService)
    ], ConfigureLanguageBasedSettingsAction);
    // Register a command that gets all settings
    commands_1.CommandsRegistry.registerCommand({
        id: '_getAllSettings',
        handler: () => {
            const configRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            const allSettings = configRegistry.getConfigurationProperties();
            return allSettings;
        }
    });
    //#region --- Register a command to get all actions from the command palette
    commands_1.CommandsRegistry.registerCommand('_getAllCommands', function (accessor) {
        const keybindingService = accessor.get(keybinding_1.IKeybindingService);
        const actions = [];
        for (const editorAction of editorExtensions_1.EditorExtensionsRegistry.getEditorActions()) {
            const keybinding = keybindingService.lookupKeybinding(editorAction.id);
            actions.push({ command: editorAction.id, label: editorAction.label, precondition: editorAction.precondition?.serialize(), keybinding: keybinding?.getLabel() ?? 'Not set' });
        }
        for (const menuItem of actions_2.MenuRegistry.getMenuItems(actions_2.MenuId.CommandPalette)) {
            if ((0, actions_2.isIMenuItem)(menuItem)) {
                const title = typeof menuItem.command.title === 'string' ? menuItem.command.title : menuItem.command.title.value;
                const category = menuItem.command.category ? typeof menuItem.command.category === 'string' ? menuItem.command.category : menuItem.command.category.value : undefined;
                const label = category ? `${category}: ${title}` : title;
                const keybinding = keybindingService.lookupKeybinding(menuItem.command.id);
                actions.push({ command: menuItem.command.id, label, precondition: menuItem.when?.serialize(), keybinding: keybinding?.getLabel() ?? 'Not set' });
            }
        }
        return actions;
    });
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcHJlZmVyZW5jZXMvYnJvd3Nlci9wcmVmZXJlbmNlc0FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUJ6RixJQUFNLG9DQUFvQyxHQUExQyxNQUFNLG9DQUFxQyxTQUFRLGdCQUFNO2lCQUUvQyxPQUFFLEdBQUcsaURBQWlELEFBQXBELENBQXFEO2lCQUN2RCxVQUFLLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRSx5Q0FBeUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSx5Q0FBeUMsRUFBRSxBQUE1SixDQUE2SjtRQUVsTCxZQUNDLEVBQVUsRUFDVixLQUFhLEVBQ21CLFlBQTJCLEVBQ3hCLGVBQWlDLEVBQy9CLGlCQUFxQyxFQUNwQyxrQkFBdUM7WUFFN0UsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUxlLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3hCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUMvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ3BDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7UUFHOUUsQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHO1lBQ2pCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQztZQUMxRSxNQUFNLEtBQUssR0FBcUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUU7Z0JBQzlFLE1BQU0sV0FBVyxHQUFXLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFD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