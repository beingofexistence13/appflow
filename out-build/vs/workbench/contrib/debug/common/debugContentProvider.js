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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/common/debugContentProvider", "vs/editor/common/services/languagesAssociations", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugSource", "vs/editor/common/services/editorWorker", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/editor/common/languages/modesRegistry", "vs/base/common/errors"], function (require, exports, nls_1, languagesAssociations_1, model_1, language_1, resolverService_1, debug_1, debugSource_1, editorWorker_1, editOperation_1, range_1, cancellation_1, modesRegistry_1, errors_1) {
    "use strict";
    var $4Rb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4Rb = void 0;
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
    let $4Rb = class $4Rb {
        static { $4Rb_1 = this; }
        constructor(textModelResolverService, c, d, e, f) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.b = new Map();
            textModelResolverService.registerTextModelContentProvider(debug_1.$jH, this);
            $4Rb_1.a = this;
        }
        dispose() {
            this.b.forEach(cancellationSource => cancellationSource.dispose());
        }
        provideTextContent(resource) {
            return this.g(resource, true);
        }
        /**
         * Reload the model content of the given resource.
         * If there is no model for the given resource, this method does nothing.
         */
        static refreshDebugContent(resource) {
            $4Rb_1.a?.g(resource, false);
        }
        /**
         * Create or reload the model content of the given resource.
         */
        g(resource, createIfNotExists) {
            const model = this.d.getModel(resource);
            if (!model && !createIfNotExists) {
                // nothing to do
                return null;
            }
            let session;
            if (resource.query) {
                const data = debugSource_1.$wF.getEncodedDebugData(resource);
                session = this.c.getModel().getSession(data.sessionId);
            }
            if (!session) {
                // fallback: use focused session
                session = this.c.getViewModel().focusedSession;
            }
            if (!session) {
                return Promise.reject(new errors_1.$_((0, nls_1.localize)(0, null)));
            }
            const createErrModel = (errMsg) => {
                this.c.sourceIsNotAvailable(resource);
                const languageSelection = this.e.createById(modesRegistry_1.$Yt);
                const message = errMsg
                    ? (0, nls_1.localize)(1, null, resource.path, errMsg)
                    : (0, nls_1.localize)(2, null, resource.path);
                return this.d.createModel(message, languageSelection, resource);
            };
            return session.loadSource(resource).then(response => {
                if (response && response.body) {
                    if (model) {
                        const newContent = response.body.content;
                        // cancel and dispose an existing update
                        const cancellationSource = this.b.get(model.id);
                        cancellationSource?.cancel();
                        // create and keep update token
                        const myToken = new cancellation_1.$pd();
                        this.b.set(model.id, myToken);
                        // update text model
                        return this.f.computeMoreMinimalEdits(model.uri, [{ text: newContent, range: model.getFullModelRange() }]).then(edits => {
                            // remove token
                            this.b.delete(model.id);
                            if (!myToken.token.isCancellationRequested && edits && edits.length > 0) {
                                // use the evil-edit as these models show in readonly-editor only
                                model.applyEdits(edits.map(edit => editOperation_1.$ls.replace(range_1.$ks.lift(edit.range), edit.text)));
                            }
                            return model;
                        });
                    }
                    else {
                        // create text model
                        const mime = response.body.mimeType || (0, languagesAssociations_1.$fmb)(resource)[0];
                        const languageSelection = this.e.createByMimeType(mime);
                        return this.d.createModel(response.body.content, languageSelection, resource);
                    }
                }
                return createErrModel();
            }, (err) => createErrModel(err.message));
        }
    };
    exports.$4Rb = $4Rb;
    exports.$4Rb = $4Rb = $4Rb_1 = __decorate([
        __param(0, resolverService_1.$uA),
        __param(1, debug_1.$nH),
        __param(2, model_1.$yA),
        __param(3, language_1.$ct),
        __param(4, editorWorker_1.$4Y)
    ], $4Rb);
});
//# sourceMappingURL=debugContentProvider.js.map