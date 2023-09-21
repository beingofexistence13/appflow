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
define(["require", "exports", "vs/nls!vs/workbench/services/configuration/common/jsonEditingService", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/async", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/editor/common/services/resolverService", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/instantiation/common/extensions"], function (require, exports, nls, json, jsonEdit_1, async_1, editOperation_1, range_1, selection_1, textfiles_1, files_1, resolverService_1, jsonEditing_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gyb = void 0;
    let $Gyb = class $Gyb {
        constructor(b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = new async_1.$Ng();
        }
        write(resource, values) {
            return Promise.resolve(this.a.queue(() => this.e(resource, values))); // queue up writes to prevent race conditions
        }
        async e(resource, values) {
            const reference = await this.k(resource, true);
            try {
                await this.f(reference.object.textEditorModel, values);
            }
            finally {
                reference.dispose();
            }
        }
        async f(model, values) {
            let hasEdits = false;
            for (const value of values) {
                const edit = this.h(model, value)[0];
                hasEdits = !!edit && this.g(edit, model);
            }
            if (hasEdits) {
                return this.d.save(model.uri);
            }
        }
        g(edit, model) {
            const startPosition = model.getPositionAt(edit.offset);
            const endPosition = model.getPositionAt(edit.offset + edit.length);
            const range = new range_1.$ks(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
            const currentText = model.getValueInRange(range);
            if (edit.content !== currentText) {
                const editOperation = currentText ? editOperation_1.$ls.replace(range, edit.content) : editOperation_1.$ls.insert(startPosition, edit.content);
                model.pushEditOperations([new selection_1.$ms(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
                return true;
            }
            return false;
        }
        h(model, configurationValue) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            const { path, value } = configurationValue;
            // With empty path the entire file is being replaced, so we just use JSON.stringify
            if (!path.length) {
                const content = JSON.stringify(value, null, insertSpaces ? ' '.repeat(tabSize) : '\t');
                return [{
                        content,
                        length: content.length,
                        offset: 0
                    }];
            }
            return (0, jsonEdit_1.$CS)(model.getValue(), path, value, { tabSize, insertSpaces, eol });
        }
        async i(resource) {
            const exists = await this.b.exists(resource);
            if (!exists) {
                await this.d.write(resource, '{}', { encoding: 'utf8' });
            }
            return this.c.createModelReference(resource);
        }
        j(model) {
            const parseErrors = [];
            json.$Lm(model.getValue(), parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
            return parseErrors.length > 0;
        }
        async k(resource, checkDirty) {
            const reference = await this.i(resource);
            const model = reference.object.textEditorModel;
            if (this.j(model)) {
                reference.dispose();
                return this.l(0 /* JSONEditingErrorCode.ERROR_INVALID_FILE */);
            }
            return reference;
        }
        l(code) {
            const message = this.m(code);
            return Promise.reject(new jsonEditing_1.$_fb(message, code));
        }
        m(error) {
            switch (error) {
                // User issues
                case 0 /* JSONEditingErrorCode.ERROR_INVALID_FILE */: {
                    return nls.localize(0, null);
                }
            }
        }
    };
    exports.$Gyb = $Gyb;
    exports.$Gyb = $Gyb = __decorate([
        __param(0, files_1.$6j),
        __param(1, resolverService_1.$uA),
        __param(2, textfiles_1.$JD)
    ], $Gyb);
    (0, extensions_1.$mr)(jsonEditing_1.$$fb, $Gyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=jsonEditingService.js.map