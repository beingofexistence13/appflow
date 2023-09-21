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
define(["require", "exports", "vs/nls!vs/workbench/services/keybinding/common/keybindingEditing", "vs/base/common/async", "vs/base/common/json", "vs/base/common/objects", "vs/base/common/jsonEdit", "vs/base/common/lifecycle", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/extensions", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, nls_1, async_1, json, objects, jsonEdit_1, lifecycle_1, editOperation_1, range_1, selection_1, resolverService_1, configuration_1, contextkey_1, files_1, instantiation_1, textfiles_1, extensions_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qyb = exports.$pyb = void 0;
    exports.$pyb = (0, instantiation_1.$Bh)('keybindingEditingService');
    let $qyb = class $qyb extends lifecycle_1.$kc {
        constructor(f, g, h, j, m) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.c = new async_1.$Ng();
        }
        addKeybinding(keybindingItem, key, when) {
            return this.c.queue(() => this.n(keybindingItem, key, when, true)); // queue up writes to prevent race conditions
        }
        editKeybinding(keybindingItem, key, when) {
            return this.c.queue(() => this.n(keybindingItem, key, when, false)); // queue up writes to prevent race conditions
        }
        resetKeybinding(keybindingItem) {
            return this.c.queue(() => this.s(keybindingItem)); // queue up writes to prevent race conditions
        }
        removeKeybinding(keybindingItem) {
            return this.c.queue(() => this.r(keybindingItem)); // queue up writes to prevent race conditions
        }
        async n(keybindingItem, key, when, add) {
            const reference = await this.J();
            const model = reference.object.textEditorModel;
            if (add) {
                this.u(keybindingItem, key, when, model, -1);
            }
            else {
                const userKeybindingEntries = json.$Lm(model.getValue());
                const userKeybindingEntryIndex = this.C(keybindingItem, userKeybindingEntries);
                this.u(keybindingItem, key, when, model, userKeybindingEntryIndex);
                if (keybindingItem.isDefault && keybindingItem.resolvedKeybinding) {
                    this.y(keybindingItem, model);
                }
            }
            try {
                await this.t();
            }
            finally {
                reference.dispose();
            }
        }
        r(keybindingItem) {
            return this.J()
                .then(reference => {
                const model = reference.object.textEditorModel;
                if (keybindingItem.isDefault) {
                    this.y(keybindingItem, model);
                }
                else {
                    this.w(keybindingItem, model);
                }
                return this.t().finally(() => reference.dispose());
            });
        }
        s(keybindingItem) {
            return this.J()
                .then(reference => {
                const model = reference.object.textEditorModel;
                if (!keybindingItem.isDefault) {
                    this.w(keybindingItem, model);
                    this.z(keybindingItem, model);
                }
                return this.t().finally(() => reference.dispose());
            });
        }
        t() {
            return this.g.save(this.m.currentProfile.keybindingsResource);
        }
        u(keybindingItem, newKey, when, model, userKeybindingEntryIndex) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            if (userKeybindingEntryIndex !== -1) {
                // Update the keybinding with new key
                this.H((0, jsonEdit_1.$CS)(model.getValue(), [userKeybindingEntryIndex, 'key'], newKey, { tabSize, insertSpaces, eol })[0], model);
                const edits = (0, jsonEdit_1.$CS)(model.getValue(), [userKeybindingEntryIndex, 'when'], when, { tabSize, insertSpaces, eol });
                if (edits.length > 0) {
                    this.H(edits[0], model);
                }
            }
            else {
                // Add the new keybinding with new key
                this.H((0, jsonEdit_1.$CS)(model.getValue(), [-1], this.F(newKey, keybindingItem.command, when, false), { tabSize, insertSpaces, eol })[0], model);
            }
        }
        w(keybindingItem, model) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            const userKeybindingEntries = json.$Lm(model.getValue());
            const userKeybindingEntryIndex = this.C(keybindingItem, userKeybindingEntries);
            if (userKeybindingEntryIndex !== -1) {
                this.H((0, jsonEdit_1.$CS)(model.getValue(), [userKeybindingEntryIndex], undefined, { tabSize, insertSpaces, eol })[0], model);
            }
        }
        y(keybindingItem, model) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            const key = keybindingItem.resolvedKeybinding ? keybindingItem.resolvedKeybinding.getUserSettingsLabel() : null;
            if (key) {
                const entry = this.F(key, keybindingItem.command, keybindingItem.when ? keybindingItem.when.serialize() : undefined, true);
                const userKeybindingEntries = json.$Lm(model.getValue());
                if (userKeybindingEntries.every(e => !this.G(e, entry))) {
                    this.H((0, jsonEdit_1.$CS)(model.getValue(), [-1], entry, { tabSize, insertSpaces, eol })[0], model);
                }
            }
        }
        z(keybindingItem, model) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            const userKeybindingEntries = json.$Lm(model.getValue());
            const indices = this.D(keybindingItem, userKeybindingEntries).reverse();
            for (const index of indices) {
                this.H((0, jsonEdit_1.$CS)(model.getValue(), [index], undefined, { tabSize, insertSpaces, eol })[0], model);
            }
        }
        C(keybindingItem, userKeybindingEntries) {
            for (let index = 0; index < userKeybindingEntries.length; index++) {
                const keybinding = userKeybindingEntries[index];
                if (keybinding.command === keybindingItem.command) {
                    if (!keybinding.when && !keybindingItem.when) {
                        return index;
                    }
                    if (keybinding.when && keybindingItem.when) {
                        const contextKeyExpr = contextkey_1.$Ii.deserialize(keybinding.when);
                        if (contextKeyExpr && contextKeyExpr.serialize() === keybindingItem.when.serialize()) {
                            return index;
                        }
                    }
                }
            }
            return -1;
        }
        D(keybindingItem, userKeybindingEntries) {
            const indices = [];
            for (let index = 0; index < userKeybindingEntries.length; index++) {
                if (userKeybindingEntries[index].command === `-${keybindingItem.command}`) {
                    indices.push(index);
                }
            }
            return indices;
        }
        F(key, command, when, negate) {
            const object = { key };
            if (command) {
                object['command'] = negate ? `-${command}` : command;
            }
            if (when) {
                object['when'] = when;
            }
            return object;
        }
        G(a, b) {
            if (a.command !== b.command) {
                return false;
            }
            if (a.key !== b.key) {
                return false;
            }
            const whenA = contextkey_1.$Ii.deserialize(a.when);
            const whenB = contextkey_1.$Ii.deserialize(b.when);
            if ((whenA && !whenB) || (!whenA && whenB)) {
                return false;
            }
            if (whenA && whenB && !whenA.equals(whenB)) {
                return false;
            }
            if (!objects.$Zm(a.args, b.args)) {
                return false;
            }
            return true;
        }
        H(edit, model) {
            const startPosition = model.getPositionAt(edit.offset);
            const endPosition = model.getPositionAt(edit.offset + edit.length);
            const range = new range_1.$ks(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
            const currentText = model.getValueInRange(range);
            const editOperation = currentText ? editOperation_1.$ls.replace(range, edit.content) : editOperation_1.$ls.insert(startPosition, edit.content);
            model.pushEditOperations([new selection_1.$ms(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
        }
        I() {
            return this.h.exists(this.m.currentProfile.keybindingsResource)
                .then(exists => {
                const EOL = this.j.getValue('files', { overrideIdentifier: 'json' })['eol'];
                const result = exists ? Promise.resolve(null) : this.g.write(this.m.currentProfile.keybindingsResource, this.M(EOL), { encoding: 'utf8' });
                return result.then(() => this.f.createModelReference(this.m.currentProfile.keybindingsResource));
            });
        }
        J() {
            // Target cannot be dirty if not writing into buffer
            if (this.g.isDirty(this.m.currentProfile.keybindingsResource)) {
                return Promise.reject(new Error((0, nls_1.localize)(0, null)));
            }
            return this.I()
                .then(reference => {
                const model = reference.object.textEditorModel;
                const EOL = model.getEOL();
                if (model.getValue()) {
                    const parsed = this.L(model);
                    if (parsed.parseErrors.length) {
                        reference.dispose();
                        return Promise.reject(new Error((0, nls_1.localize)(1, null)));
                    }
                    if (parsed.result) {
                        if (!Array.isArray(parsed.result)) {
                            reference.dispose();
                            return Promise.reject(new Error((0, nls_1.localize)(2, null)));
                        }
                    }
                    else {
                        const content = EOL + '[]';
                        this.H({ content, length: content.length, offset: model.getValue().length }, model);
                    }
                }
                else {
                    const content = this.M(EOL);
                    this.H({ content, length: content.length, offset: 0 }, model);
                }
                return reference;
            });
        }
        L(model) {
            const parseErrors = [];
            const result = json.$Lm(model.getValue(), parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
            return { result, parseErrors };
        }
        M(EOL) {
            return '// ' + (0, nls_1.localize)(3, null) + EOL + '[]';
        }
    };
    exports.$qyb = $qyb;
    exports.$qyb = $qyb = __decorate([
        __param(0, resolverService_1.$uA),
        __param(1, textfiles_1.$JD),
        __param(2, files_1.$6j),
        __param(3, configuration_1.$8h),
        __param(4, userDataProfile_1.$CJ)
    ], $qyb);
    (0, extensions_1.$mr)(exports.$pyb, $qyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=keybindingEditing.js.map