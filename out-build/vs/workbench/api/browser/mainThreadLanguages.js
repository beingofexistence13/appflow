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
define(["require", "exports", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/editor/common/services/model", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/editor/common/core/range", "vs/editor/common/services/resolverService", "vs/workbench/services/languageStatus/common/languageStatusService", "vs/base/common/lifecycle"], function (require, exports, uri_1, language_1, model_1, extHost_protocol_1, extHostCustomers_1, range_1, resolverService_1, languageStatusService_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wkb = void 0;
    let $wkb = class $wkb {
        constructor(_extHostContext, d, e, f, g) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.a = new lifecycle_1.$jc();
            this.c = new lifecycle_1.$sc();
            this.b = _extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostLanguages);
            this.b.$acceptLanguageIds(d.getRegisteredLanguageIds());
            this.a.add(d.onDidChange(_ => {
                this.b.$acceptLanguageIds(d.getRegisteredLanguageIds());
            }));
        }
        dispose() {
            this.a.dispose();
            this.c.dispose();
        }
        async $changeLanguage(resource, languageId) {
            if (!this.d.isRegisteredLanguageId(languageId)) {
                return Promise.reject(new Error(`Unknown language id: ${languageId}`));
            }
            const uri = uri_1.URI.revive(resource);
            const ref = await this.f.createModelReference(uri);
            try {
                ref.object.textEditorModel.setLanguage(this.d.createById(languageId));
            }
            finally {
                ref.dispose();
            }
        }
        async $tokensAtPosition(resource, position) {
            const uri = uri_1.URI.revive(resource);
            const model = this.e.getModel(uri);
            if (!model) {
                return undefined;
            }
            model.tokenization.tokenizeIfCheap(position.lineNumber);
            const tokens = model.tokenization.getLineTokens(position.lineNumber);
            const idx = tokens.findTokenIndexAtOffset(position.column - 1);
            return {
                type: tokens.getStandardTokenType(idx),
                range: new range_1.$ks(position.lineNumber, 1 + tokens.getStartOffset(idx), position.lineNumber, 1 + tokens.getEndOffset(idx))
            };
        }
        // --- language status
        $setLanguageStatus(handle, status) {
            this.c.get(handle)?.dispose();
            this.c.set(handle, this.g.addStatus(status));
        }
        $removeLanguageStatus(handle) {
            this.c.get(handle)?.dispose();
        }
    };
    exports.$wkb = $wkb;
    exports.$wkb = $wkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadLanguages),
        __param(1, language_1.$ct),
        __param(2, model_1.$yA),
        __param(3, resolverService_1.$uA),
        __param(4, languageStatusService_1.$6I)
    ], $wkb);
});
//# sourceMappingURL=mainThreadLanguages.js.map