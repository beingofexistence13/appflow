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
define(["require", "exports", "vs/nls", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/async", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/editor/common/services/resolverService", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/instantiation/common/extensions"], function (require, exports, nls, json, jsonEdit_1, async_1, editOperation_1, range_1, selection_1, textfiles_1, files_1, resolverService_1, jsonEditing_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JSONEditingService = void 0;
    let JSONEditingService = class JSONEditingService {
        constructor(fileService, textModelResolverService, textFileService) {
            this.fileService = fileService;
            this.textModelResolverService = textModelResolverService;
            this.textFileService = textFileService;
            this.queue = new async_1.Queue();
        }
        write(resource, values) {
            return Promise.resolve(this.queue.queue(() => this.doWriteConfiguration(resource, values))); // queue up writes to prevent race conditions
        }
        async doWriteConfiguration(resource, values) {
            const reference = await this.resolveAndValidate(resource, true);
            try {
                await this.writeToBuffer(reference.object.textEditorModel, values);
            }
            finally {
                reference.dispose();
            }
        }
        async writeToBuffer(model, values) {
            let hasEdits = false;
            for (const value of values) {
                const edit = this.getEdits(model, value)[0];
                hasEdits = !!edit && this.applyEditsToBuffer(edit, model);
            }
            if (hasEdits) {
                return this.textFileService.save(model.uri);
            }
        }
        applyEditsToBuffer(edit, model) {
            const startPosition = model.getPositionAt(edit.offset);
            const endPosition = model.getPositionAt(edit.offset + edit.length);
            const range = new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
            const currentText = model.getValueInRange(range);
            if (edit.content !== currentText) {
                const editOperation = currentText ? editOperation_1.EditOperation.replace(range, edit.content) : editOperation_1.EditOperation.insert(startPosition, edit.content);
                model.pushEditOperations([new selection_1.Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
                return true;
            }
            return false;
        }
        getEdits(model, configurationValue) {
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
            return (0, jsonEdit_1.setProperty)(model.getValue(), path, value, { tabSize, insertSpaces, eol });
        }
        async resolveModelReference(resource) {
            const exists = await this.fileService.exists(resource);
            if (!exists) {
                await this.textFileService.write(resource, '{}', { encoding: 'utf8' });
            }
            return this.textModelResolverService.createModelReference(resource);
        }
        hasParseErrors(model) {
            const parseErrors = [];
            json.parse(model.getValue(), parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
            return parseErrors.length > 0;
        }
        async resolveAndValidate(resource, checkDirty) {
            const reference = await this.resolveModelReference(resource);
            const model = reference.object.textEditorModel;
            if (this.hasParseErrors(model)) {
                reference.dispose();
                return this.reject(0 /* JSONEditingErrorCode.ERROR_INVALID_FILE */);
            }
            return reference;
        }
        reject(code) {
            const message = this.toErrorMessage(code);
            return Promise.reject(new jsonEditing_1.JSONEditingError(message, code));
        }
        toErrorMessage(error) {
            switch (error) {
                // User issues
                case 0 /* JSONEditingErrorCode.ERROR_INVALID_FILE */: {
                    return nls.localize('errorInvalidFile', "Unable to write into the file. Please open the file to correct errors/warnings in the file and try again.");
                }
            }
        }
    };
    exports.JSONEditingService = JSONEditingService;
    exports.JSONEditingService = JSONEditingService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, resolverService_1.ITextModelService),
        __param(2, textfiles_1.ITextFileService)
    ], JSONEditingService);
    (0, extensions_1.registerSingleton)(jsonEditing_1.IJSONEditingService, JSONEditingService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkVkaXRpbmdTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2NvbmZpZ3VyYXRpb24vY29tbW9uL2pzb25FZGl0aW5nU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCO1FBTTlCLFlBQ2dDLFdBQXlCLEVBQ3BCLHdCQUEyQyxFQUM1QyxlQUFpQztZQUZyQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNwQiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQW1CO1lBQzVDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUVwRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksYUFBSyxFQUFRLENBQUM7UUFDaEMsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFhLEVBQUUsTUFBb0I7WUFDeEMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsNkNBQTZDO1FBQzNJLENBQUM7UUFFTyxLQUFLLENBQUMsb0JBQW9CLENBQUMsUUFBYSxFQUFFLE1BQW9CO1lBQ3JFLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoRSxJQUFJO2dCQUNILE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNuRTtvQkFBUztnQkFDVCxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDcEI7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFpQixFQUFFLE1BQW9CO1lBQ2xFLElBQUksUUFBUSxHQUFZLEtBQUssQ0FBQztZQUM5QixLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtnQkFDM0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDMUQ7WUFDRCxJQUFJLFFBQVEsRUFBRTtnQkFDYixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM1QztRQUNGLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxJQUFVLEVBQUUsS0FBaUI7WUFDdkQsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuRSxNQUFNLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEgsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqRCxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFO2dCQUNqQyxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLDZCQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLDZCQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25JLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUkscUJBQVMsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNySyxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sUUFBUSxDQUFDLEtBQWlCLEVBQUUsa0JBQThCO1lBQ2pFLE1BQU0sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JELE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMzQixNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLGtCQUFrQixDQUFDO1lBRTNDLG1GQUFtRjtZQUNuRixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDakIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZGLE9BQU8sQ0FBQzt3QkFDUCxPQUFPO3dCQUNQLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTt3QkFDdEIsTUFBTSxFQUFFLENBQUM7cUJBQ1QsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLElBQUEsc0JBQVcsRUFBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBRU8sS0FBSyxDQUFDLHFCQUFxQixDQUFDLFFBQWE7WUFDaEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZFO1lBQ0QsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUVPLGNBQWMsQ0FBQyxLQUFpQjtZQUN2QyxNQUFNLFdBQVcsR0FBc0IsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2pHLE9BQU8sV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFhLEVBQUUsVUFBbUI7WUFDbEUsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFN0QsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7WUFFL0MsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMvQixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0saURBQStFLENBQUM7YUFDbEc7WUFFRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU8sTUFBTSxDQUFJLElBQTBCO1lBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksOEJBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVPLGNBQWMsQ0FBQyxLQUEyQjtZQUNqRCxRQUFRLEtBQUssRUFBRTtnQkFDZCxjQUFjO2dCQUNkLG9EQUE0QyxDQUFDLENBQUM7b0JBQzdDLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSwyR0FBMkcsQ0FBQyxDQUFDO2lCQUNySjthQUNEO1FBQ0YsQ0FBQztLQUNELENBQUE7SUE3R1ksZ0RBQWtCO2lDQUFsQixrQkFBa0I7UUFPNUIsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxtQ0FBaUIsQ0FBQTtRQUNqQixXQUFBLDRCQUFnQixDQUFBO09BVE4sa0JBQWtCLENBNkc5QjtJQUVELElBQUEsOEJBQWlCLEVBQUMsaUNBQW1CLEVBQUUsa0JBQWtCLG9DQUE0QixDQUFDIn0=