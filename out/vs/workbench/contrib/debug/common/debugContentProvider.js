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
define(["require", "exports", "vs/nls", "vs/editor/common/services/languagesAssociations", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugSource", "vs/editor/common/services/editorWorker", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/editor/common/languages/modesRegistry", "vs/base/common/errors"], function (require, exports, nls_1, languagesAssociations_1, model_1, language_1, resolverService_1, debug_1, debugSource_1, editorWorker_1, editOperation_1, range_1, cancellation_1, modesRegistry_1, errors_1) {
    "use strict";
    var DebugContentProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugContentProvider = void 0;
    /**
     * Debug URI format
     *
     * a debug URI represents a Source object and the debug session where the Source comes from.
     *
     *       debug:arbitrary_path?session=123e4567-e89b-12d3-a456-426655440000&ref=1016
     *       \___/ \____________/ \__________________________________________/ \______/
     *         |          |                             |                          |
     *      scheme   source.path                    session id            source.reference
     *
     * the arbitrary_path and the session id are encoded with 'encodeURIComponent'
     *
     */
    let DebugContentProvider = class DebugContentProvider {
        static { DebugContentProvider_1 = this; }
        constructor(textModelResolverService, debugService, modelService, languageService, editorWorkerService) {
            this.debugService = debugService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.editorWorkerService = editorWorkerService;
            this.pendingUpdates = new Map();
            textModelResolverService.registerTextModelContentProvider(debug_1.DEBUG_SCHEME, this);
            DebugContentProvider_1.INSTANCE = this;
        }
        dispose() {
            this.pendingUpdates.forEach(cancellationSource => cancellationSource.dispose());
        }
        provideTextContent(resource) {
            return this.createOrUpdateContentModel(resource, true);
        }
        /**
         * Reload the model content of the given resource.
         * If there is no model for the given resource, this method does nothing.
         */
        static refreshDebugContent(resource) {
            DebugContentProvider_1.INSTANCE?.createOrUpdateContentModel(resource, false);
        }
        /**
         * Create or reload the model content of the given resource.
         */
        createOrUpdateContentModel(resource, createIfNotExists) {
            const model = this.modelService.getModel(resource);
            if (!model && !createIfNotExists) {
                // nothing to do
                return null;
            }
            let session;
            if (resource.query) {
                const data = debugSource_1.Source.getEncodedDebugData(resource);
                session = this.debugService.getModel().getSession(data.sessionId);
            }
            if (!session) {
                // fallback: use focused session
                session = this.debugService.getViewModel().focusedSession;
            }
            if (!session) {
                return Promise.reject(new errors_1.ErrorNoTelemetry((0, nls_1.localize)('unable', "Unable to resolve the resource without a debug session")));
            }
            const createErrModel = (errMsg) => {
                this.debugService.sourceIsNotAvailable(resource);
                const languageSelection = this.languageService.createById(modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
                const message = errMsg
                    ? (0, nls_1.localize)('canNotResolveSourceWithError', "Could not load source '{0}': {1}.", resource.path, errMsg)
                    : (0, nls_1.localize)('canNotResolveSource', "Could not load source '{0}'.", resource.path);
                return this.modelService.createModel(message, languageSelection, resource);
            };
            return session.loadSource(resource).then(response => {
                if (response && response.body) {
                    if (model) {
                        const newContent = response.body.content;
                        // cancel and dispose an existing update
                        const cancellationSource = this.pendingUpdates.get(model.id);
                        cancellationSource?.cancel();
                        // create and keep update token
                        const myToken = new cancellation_1.CancellationTokenSource();
                        this.pendingUpdates.set(model.id, myToken);
                        // update text model
                        return this.editorWorkerService.computeMoreMinimalEdits(model.uri, [{ text: newContent, range: model.getFullModelRange() }]).then(edits => {
                            // remove token
                            this.pendingUpdates.delete(model.id);
                            if (!myToken.token.isCancellationRequested && edits && edits.length > 0) {
                                // use the evil-edit as these models show in readonly-editor only
                                model.applyEdits(edits.map(edit => editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text)));
                            }
                            return model;
                        });
                    }
                    else {
                        // create text model
                        const mime = response.body.mimeType || (0, languagesAssociations_1.getMimeTypes)(resource)[0];
                        const languageSelection = this.languageService.createByMimeType(mime);
                        return this.modelService.createModel(response.body.content, languageSelection, resource);
                    }
                }
                return createErrModel();
            }, (err) => createErrModel(err.message));
        }
    };
    exports.DebugContentProvider = DebugContentProvider;
    exports.DebugContentProvider = DebugContentProvider = DebugContentProvider_1 = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, debug_1.IDebugService),
        __param(2, model_1.IModelService),
        __param(3, language_1.ILanguageService),
        __param(4, editorWorker_1.IEditorWorkerService)
    ], DebugContentProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdDb250ZW50UHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vZGVidWdDb250ZW50UHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1CaEc7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0ksSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBb0I7O1FBTWhDLFlBQ29CLHdCQUEyQyxFQUMvQyxZQUE0QyxFQUM1QyxZQUE0QyxFQUN6QyxlQUFrRCxFQUM5QyxtQkFBMEQ7WUFIaEQsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDM0IsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDeEIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQzdCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFQaEUsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBbUMsQ0FBQztZQVM1RSx3QkFBd0IsQ0FBQyxnQ0FBZ0MsQ0FBQyxvQkFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlFLHNCQUFvQixDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDdEMsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRUQsa0JBQWtCLENBQUMsUUFBYTtZQUMvQixPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVEOzs7V0FHRztRQUNILE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFhO1lBQ3ZDLHNCQUFvQixDQUFDLFFBQVEsRUFBRSwwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxD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