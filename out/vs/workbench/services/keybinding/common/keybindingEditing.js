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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/json", "vs/base/common/objects", "vs/base/common/jsonEdit", "vs/base/common/lifecycle", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/extensions", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, nls_1, async_1, json, objects, jsonEdit_1, lifecycle_1, editOperation_1, range_1, selection_1, resolverService_1, configuration_1, contextkey_1, files_1, instantiation_1, textfiles_1, extensions_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingsEditingService = exports.IKeybindingEditingService = void 0;
    exports.IKeybindingEditingService = (0, instantiation_1.createDecorator)('keybindingEditingService');
    let KeybindingsEditingService = class KeybindingsEditingService extends lifecycle_1.Disposable {
        constructor(textModelResolverService, textFileService, fileService, configurationService, userDataProfileService) {
            super();
            this.textModelResolverService = textModelResolverService;
            this.textFileService = textFileService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.userDataProfileService = userDataProfileService;
            this.queue = new async_1.Queue();
        }
        addKeybinding(keybindingItem, key, when) {
            return this.queue.queue(() => this.doEditKeybinding(keybindingItem, key, when, true)); // queue up writes to prevent race conditions
        }
        editKeybinding(keybindingItem, key, when) {
            return this.queue.queue(() => this.doEditKeybinding(keybindingItem, key, when, false)); // queue up writes to prevent race conditions
        }
        resetKeybinding(keybindingItem) {
            return this.queue.queue(() => this.doResetKeybinding(keybindingItem)); // queue up writes to prevent race conditions
        }
        removeKeybinding(keybindingItem) {
            return this.queue.queue(() => this.doRemoveKeybinding(keybindingItem)); // queue up writes to prevent race conditions
        }
        async doEditKeybinding(keybindingItem, key, when, add) {
            const reference = await this.resolveAndValidate();
            const model = reference.object.textEditorModel;
            if (add) {
                this.updateKeybinding(keybindingItem, key, when, model, -1);
            }
            else {
                const userKeybindingEntries = json.parse(model.getValue());
                const userKeybindingEntryIndex = this.findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries);
                this.updateKeybinding(keybindingItem, key, when, model, userKeybindingEntryIndex);
                if (keybindingItem.isDefault && keybindingItem.resolvedKeybinding) {
                    this.removeDefaultKeybinding(keybindingItem, model);
                }
            }
            try {
                await this.save();
            }
            finally {
                reference.dispose();
            }
        }
        doRemoveKeybinding(keybindingItem) {
            return this.resolveAndValidate()
                .then(reference => {
                const model = reference.object.textEditorModel;
                if (keybindingItem.isDefault) {
                    this.removeDefaultKeybinding(keybindingItem, model);
                }
                else {
                    this.removeUserKeybinding(keybindingItem, model);
                }
                return this.save().finally(() => reference.dispose());
            });
        }
        doResetKeybinding(keybindingItem) {
            return this.resolveAndValidate()
                .then(reference => {
                const model = reference.object.textEditorModel;
                if (!keybindingItem.isDefault) {
                    this.removeUserKeybinding(keybindingItem, model);
                    this.removeUnassignedDefaultKeybinding(keybindingItem, model);
                }
                return this.save().finally(() => reference.dispose());
            });
        }
        save() {
            return this.textFileService.save(this.userDataProfileService.currentProfile.keybindingsResource);
        }
        updateKeybinding(keybindingItem, newKey, when, model, userKeybindingEntryIndex) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            if (userKeybindingEntryIndex !== -1) {
                // Update the keybinding with new key
                this.applyEditsToBuffer((0, jsonEdit_1.setProperty)(model.getValue(), [userKeybindingEntryIndex, 'key'], newKey, { tabSize, insertSpaces, eol })[0], model);
                const edits = (0, jsonEdit_1.setProperty)(model.getValue(), [userKeybindingEntryIndex, 'when'], when, { tabSize, insertSpaces, eol });
                if (edits.length > 0) {
                    this.applyEditsToBuffer(edits[0], model);
                }
            }
            else {
                // Add the new keybinding with new key
                this.applyEditsToBuffer((0, jsonEdit_1.setProperty)(model.getValue(), [-1], this.asObject(newKey, keybindingItem.command, when, false), { tabSize, insertSpaces, eol })[0], model);
            }
        }
        removeUserKeybinding(keybindingItem, model) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            const userKeybindingEntries = json.parse(model.getValue());
            const userKeybindingEntryIndex = this.findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries);
            if (userKeybindingEntryIndex !== -1) {
                this.applyEditsToBuffer((0, jsonEdit_1.setProperty)(model.getValue(), [userKeybindingEntryIndex], undefined, { tabSize, insertSpaces, eol })[0], model);
            }
        }
        removeDefaultKeybinding(keybindingItem, model) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            const key = keybindingItem.resolvedKeybinding ? keybindingItem.resolvedKeybinding.getUserSettingsLabel() : null;
            if (key) {
                const entry = this.asObject(key, keybindingItem.command, keybindingItem.when ? keybindingItem.when.serialize() : undefined, true);
                const userKeybindingEntries = json.parse(model.getValue());
                if (userKeybindingEntries.every(e => !this.areSame(e, entry))) {
                    this.applyEditsToBuffer((0, jsonEdit_1.setProperty)(model.getValue(), [-1], entry, { tabSize, insertSpaces, eol })[0], model);
                }
            }
        }
        removeUnassignedDefaultKeybinding(keybindingItem, model) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            const userKeybindingEntries = json.parse(model.getValue());
            const indices = this.findUnassignedDefaultKeybindingEntryIndex(keybindingItem, userKeybindingEntries).reverse();
            for (const index of indices) {
                this.applyEditsToBuffer((0, jsonEdit_1.setProperty)(model.getValue(), [index], undefined, { tabSize, insertSpaces, eol })[0], model);
            }
        }
        findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries) {
            for (let index = 0; index < userKeybindingEntries.length; index++) {
                const keybinding = userKeybindingEntries[index];
                if (keybinding.command === keybindingItem.command) {
                    if (!keybinding.when && !keybindingItem.when) {
                        return index;
                    }
                    if (keybinding.when && keybindingItem.when) {
                        const contextKeyExpr = contextkey_1.ContextKeyExpr.deserialize(keybinding.when);
                        if (contextKeyExpr && contextKeyExpr.serialize() === keybindingItem.when.serialize()) {
                            return index;
                        }
                    }
                }
            }
            return -1;
        }
        findUnassignedDefaultKeybindingEntryIndex(keybindingItem, userKeybindingEntries) {
            const indices = [];
            for (let index = 0; index < userKeybindingEntries.length; index++) {
                if (userKeybindingEntries[index].command === `-${keybindingItem.command}`) {
                    indices.push(index);
                }
            }
            return indices;
        }
        asObject(key, command, when, negate) {
            const object = { key };
            if (command) {
                object['command'] = negate ? `-${command}` : command;
            }
            if (when) {
                object['when'] = when;
            }
            return object;
        }
        areSame(a, b) {
            if (a.command !== b.command) {
                return false;
            }
            if (a.key !== b.key) {
                return false;
            }
            const whenA = contextkey_1.ContextKeyExpr.deserialize(a.when);
            const whenB = contextkey_1.ContextKeyExpr.deserialize(b.when);
            if ((whenA && !whenB) || (!whenA && whenB)) {
                return false;
            }
            if (whenA && whenB && !whenA.equals(whenB)) {
                return false;
            }
            if (!objects.equals(a.args, b.args)) {
                return false;
            }
            return true;
        }
        applyEditsToBuffer(edit, model) {
            const startPosition = model.getPositionAt(edit.offset);
            const endPosition = model.getPositionAt(edit.offset + edit.length);
            const range = new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
            const currentText = model.getValueInRange(range);
            const editOperation = currentText ? editOperation_1.EditOperation.replace(range, edit.content) : editOperation_1.EditOperation.insert(startPosition, edit.content);
            model.pushEditOperations([new selection_1.Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
        }
        resolveModelReference() {
            return this.fileService.exists(this.userDataProfileService.currentProfile.keybindingsResource)
                .then(exists => {
                const EOL = this.configurationService.getValue('files', { overrideIdentifier: 'json' })['eol'];
                const result = exists ? Promise.resolve(null) : this.textFileService.write(this.userDataProfileService.currentProfile.keybindingsResource, this.getEmptyContent(EOL), { encoding: 'utf8' });
                return result.then(() => this.textModelResolverService.createModelReference(this.userDataProfileService.currentProfile.keybindingsResource));
            });
        }
        resolveAndValidate() {
            // Target cannot be dirty if not writing into buffer
            if (this.textFileService.isDirty(this.userDataProfileService.currentProfile.keybindingsResource)) {
                return Promise.reject(new Error((0, nls_1.localize)('errorKeybindingsFileDirty', "Unable to write because the keybindings configuration file has unsaved changes. Please save it first and then try again.")));
            }
            return this.resolveModelReference()
                .then(reference => {
                const model = reference.object.textEditorModel;
                const EOL = model.getEOL();
                if (model.getValue()) {
                    const parsed = this.parse(model);
                    if (parsed.parseErrors.length) {
                        reference.dispose();
                        return Promise.reject(new Error((0, nls_1.localize)('parseErrors', "Unable to write to the keybindings configuration file. Please open it to correct errors/warnings in the file and try again.")));
                    }
                    if (parsed.result) {
                        if (!Array.isArray(parsed.result)) {
                            reference.dispose();
                            return Promise.reject(new Error((0, nls_1.localize)('errorInvalidConfiguration', "Unable to write to the keybindings configuration file. It has an object which is not of type Array. Please open the file to clean up and try again.")));
                        }
                    }
                    else {
                        const content = EOL + '[]';
                        this.applyEditsToBuffer({ content, length: content.length, offset: model.getValue().length }, model);
                    }
                }
                else {
                    const content = this.getEmptyContent(EOL);
                    this.applyEditsToBuffer({ content, length: content.length, offset: 0 }, model);
                }
                return reference;
            });
        }
        parse(model) {
            const parseErrors = [];
            const result = json.parse(model.getValue(), parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
            return { result, parseErrors };
        }
        getEmptyContent(EOL) {
            return '// ' + (0, nls_1.localize)('emptyKeybindingsHeader', "Place your key bindings in this file to override the defaults") + EOL + '[]';
        }
    };
    exports.KeybindingsEditingService = KeybindingsEditingService;
    exports.KeybindingsEditingService = KeybindingsEditingService = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, files_1.IFileService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, userDataProfile_1.IUserDataProfileService)
    ], KeybindingsEditingService);
    (0, extensions_1.registerSingleton)(exports.IKeybindingEditingService, KeybindingsEditingService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ0VkaXRpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMva2V5YmluZGluZy9jb21tb24va2V5YmluZGluZ0VkaXRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0JuRixRQUFBLHlCQUF5QixHQUFHLElBQUEsK0JBQWUsRUFBNEIsMEJBQTBCLENBQUMsQ0FBQztJQWV6RyxJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUEwQixTQUFRLHNCQUFVO1FBS3hELFlBQ3FDLHdCQUEyQyxFQUM1QyxlQUFpQyxFQUNyQyxXQUF5QixFQUNoQixvQkFBMkMsRUFDekMsc0JBQStDO1lBRXpGLEtBQUssRUFBRSxDQUFDO1lBTjRCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBbUI7WUFDNUMsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ3JDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2hCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDekMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUd6RixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksYUFBSyxFQUFRLENBQUM7UUFDaEMsQ0FBQztRQUVELGFBQWEsQ0FBQyxjQUFzQyxFQUFFLEdBQVcsRUFBRSxJQUF3QjtZQUMxRixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsNkNBQTZDO1FBQ3JJLENBQUM7UUFFRCxjQUFjLENBQUMsY0FBc0MsRUFBRSxHQUFXLEVBQUUsSUFBd0I7WUFDM0YsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVB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