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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/uri", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/preferences/browser/preferencesActions", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/preferences/common/preferences", "vs/platform/commands/common/commands", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/editor/browser/editorExtensions", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding"], function (require, exports, actions_1, uri_1, getIconClasses_1, model_1, language_1, nls, quickInput_1, preferences_1, commands_1, platform_1, configurationRegistry_1, editorExtensions_1, actions_2, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iDb = void 0;
    let $iDb = class $iDb extends actions_1.$gi {
        static { this.ID = 'workbench.action.configureLanguageBasedSettings'; }
        static { this.LABEL = { value: nls.localize(0, null), original: 'Configure Language Specific Settings...' }; }
        constructor(id, label, a, b, c, f) {
            super(id, label);
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
        }
        async run() {
            const languages = this.b.getSortedRegisteredLanguageNames();
            const picks = languages.map(({ languageName, languageId }) => {
                const description = nls.localize(1, null, languageId);
                // construct a fake resource to be able to show nice icons if any
                let fakeResource;
                const extensions = this.b.getExtensions(languageId);
                if (extensions.length) {
                    fakeResource = uri_1.URI.file(extensions[0]);
                }
                else {
                    const filenames = this.b.getFilenames(languageId);
                    if (filenames.length) {
                        fakeResource = uri_1.URI.file(filenames[0]);
                    }
                }
                return {
                    label: languageName,
                    iconClasses: (0, getIconClasses_1.$x6)(this.a, this.b, fakeResource),
                    description
                };
            });
            await this.c.pick(picks, { placeHolder: nls.localize(2, null) })
                .then(pick => {
                if (pick) {
                    const languageId = this.b.getLanguageIdByLanguageName(pick.label);
                    if (typeof languageId === 'string') {
                        return this.f.openLanguageSpecificSettings(languageId);
                    }
                }
                return undefined;
            });
        }
    };
    exports.$iDb = $iDb;
    exports.$iDb = $iDb = __decorate([
        __param(2, model_1.$yA),
        __param(3, language_1.$ct),
        __param(4, quickInput_1.$Gq),
        __param(5, preferences_1.$BE)
    ], $iDb);
    // Register a command that gets all settings
    commands_1.$Gr.registerCommand({
        id: '_getAllSettings',
        handler: () => {
            const configRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            const allSettings = configRegistry.getConfigurationProperties();
            return allSettings;
        }
    });
    //#region --- Register a command to get all actions from the command palette
    commands_1.$Gr.registerCommand('_getAllCommands', function (accessor) {
        const keybindingService = accessor.get(keybinding_1.$2D);
        const actions = [];
        for (const editorAction of editorExtensions_1.EditorExtensionsRegistry.getEditorActions()) {
            const keybinding = keybindingService.lookupKeybinding(editorAction.id);
            actions.push({ command: editorAction.id, label: editorAction.label, precondition: editorAction.precondition?.serialize(), keybinding: keybinding?.getLabel() ?? 'Not set' });
        }
        for (const menuItem of actions_2.$Tu.getMenuItems(actions_2.$Ru.CommandPalette)) {
            if ((0, actions_2.$Pu)(menuItem)) {
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
//# sourceMappingURL=preferencesActions.js.map