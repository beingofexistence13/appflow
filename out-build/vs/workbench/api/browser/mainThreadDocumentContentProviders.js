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
    exports.$Kcb = void 0;
    let $Kcb = class $Kcb {
        constructor(extHostContext, d, e, f, g) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.a = new lifecycle_1.$sc();
            this.b = new Map();
            this.c = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostDocumentContentProviders);
        }
        dispose() {
            this.a.dispose();
            (0, lifecycle_1.$fc)(this.b.values());
        }
        $registerTextContentProvider(handle, scheme) {
            const registration = this.d.registerTextModelContentProvider(scheme, {
                provideTextContent: (uri) => {
                    return this.c.$provideTextDocumentContent(handle, uri).then(value => {
                        if (typeof value === 'string') {
                            const firstLineText = value.substr(0, 1 + value.search(/\r?\n/));
                            const languageSelection = this.e.createByFilepathOrFirstLine(uri, firstLineText);
                            return this.f.createModel(value, languageSelection, uri);
                        }
                        return null;
                    });
                }
            });
            this.a.set(handle, registration);
        }
        $unregisterTextContentProvider(handle) {
            this.a.deleteAndDispose(handle);
        }
        $onVirtualDocumentChange(uri, value) {
            const model = this.f.getModel(uri_1.URI.revive(uri));
            if (!model) {
                return;
            }
            // cancel and dispose an existing update
            const pending = this.b.get(model.id);
            pending?.cancel();
            // create and keep update token
            const myToken = new cancellation_1.$pd();
            this.b.set(model.id, myToken);
            this.g.computeMoreMinimalEdits(model.uri, [{ text: value, range: model.getFullModelRange() }]).then(edits => {
                // remove token
                this.b.delete(model.id);
                if (myToken.token.isCancellationRequested) {
                    // ignore this
                    return;
                }
                if (edits && edits.length > 0) {
                    // use the evil-edit as these models show in readonly-editor only
                    model.applyEdits(edits.map(edit => editOperation_1.$ls.replace(range_1.$ks.lift(edit.range), edit.text)));
                }
            }).catch(errors_1.$Y);
        }
    };
    exports.$Kcb = $Kcb;
    exports.$Kcb = $Kcb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadDocumentContentProviders),
        __param(1, resolverService_1.$uA),
        __param(2, language_1.$ct),
        __param(3, model_1.$yA),
        __param(4, editorWorker_1.$4Y)
    ], $Kcb);
});
//# sourceMappingURL=mainThreadDocumentContentProviders.js.map