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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/services/editorWorker", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/base/common/cancellation"], function (require, exports, errors_1, lifecycle_1, uri_1, editOperation_1, range_1, editorWorker_1, model_1, language_1, resolverService_1, extHostCustomers_1, extHost_protocol_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadDocumentContentProviders = void 0;
    let MainThreadDocumentContentProviders = class MainThreadDocumentContentProviders {
        constructor(extHostContext, _textModelResolverService, _languageService, _modelService, _editorWorkerService) {
            this._textModelResolverService = _textModelResolverService;
            this._languageService = _languageService;
            this._modelService = _modelService;
            this._editorWorkerService = _editorWorkerService;
            this._resourceContentProvider = new lifecycle_1.DisposableMap();
            this._pendingUpdate = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDocumentContentProviders);
        }
        dispose() {
            this._resourceContentProvider.dispose();
            (0, lifecycle_1.dispose)(this._pendingUpdate.values());
        }
        $registerTextContentProvider(handle, scheme) {
            const registration = this._textModelResolverService.registerTextModelContentProvider(scheme, {
                provideTextContent: (uri) => {
                    return this._proxy.$provideTextDocumentContent(handle, uri).then(value => {
                        if (typeof value === 'string') {
                            const firstLineText = value.substr(0, 1 + value.search(/\r?\n/));
                            const languageSelection = this._languageService.createByFilepathOrFirstLine(uri, firstLineText);
                            return this._modelService.createModel(value, languageSelection, uri);
                        }
                        return null;
                    });
                }
            });
            this._resourceContentProvider.set(handle, registration);
        }
        $unregisterTextContentProvider(handle) {
            this._resourceContentProvider.deleteAndDispose(handle);
        }
        $onVirtualDocumentChange(uri, value) {
            const model = this._modelService.getModel(uri_1.URI.revive(uri));
            if (!model) {
                return;
            }
            // cancel and dispose an existing update
            const pending = this._pendingUpdate.get(model.id);
            pending?.cancel();
            // create and keep update token
            const myToken = new cancellation_1.CancellationTokenSource();
            this._pendingUpdate.set(model.id, myToken);
            this._editorWorkerService.computeMoreMinimalEdits(model.uri, [{ text: value, range: model.getFullModelRange() }]).then(edits => {
                // remove token
                this._pendingUpdate.delete(model.id);
                if (myToken.token.isCancellationRequested) {
                    // ignore this
                    return;
                }
                if (edits && edits.length > 0) {
                    // use the evil-edit as these models show in readonly-editor only
                    model.applyEdits(edits.map(edit => editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text)));
                }
            }).catch(errors_1.onUnexpectedError);
        }
    };
    exports.MainThreadDocumentContentProviders = MainThreadDocumentContentProviders;
    exports.MainThreadDocumentContentProviders = MainThreadDocumentContentProviders = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadDocumentContentProviders),
        __param(1, resolverService_1.ITextModelService),
        __param(2, language_1.ILanguageService),
        __param(3, model_1.IModelService),
        __param(4, editorWorker_1.IEditorWorkerService)
    ], MainThreadDocumentContentProviders);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERvY3VtZW50Q29udGVudFByb3ZpZGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkRG9jdW1lbnRDb250ZW50UHJvdmlkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCekYsSUFBTSxrQ0FBa0MsR0FBeEMsTUFBTSxrQ0FBa0M7UUFNOUMsWUFDQyxjQUErQixFQUNaLHlCQUE2RCxFQUM5RCxnQkFBbUQsRUFDdEQsYUFBNkMsRUFDdEMsb0JBQTJEO1lBSDdDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBbUI7WUFDN0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNyQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUNyQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBVGpFLDZCQUF3QixHQUFHLElBQUkseUJBQWEsRUFBVSxDQUFDO1lBQ3ZELG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQW1DLENBQUM7WUFVNUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN4QyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCw0QkFBNEIsQ0FBQyxNQUFjLEVBQUUsTUFBYztZQUMxRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxFQUFFO2dCQUM1RixrQkFBa0IsRUFBRSxDQUFDLEdBQVEsRUFBOEIsRUFBRTtvQkFDNUQsT0FBTyxJQUFJ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