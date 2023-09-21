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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/nls!vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators", "vs/platform/dialogs/common/dialogs"], function (require, exports, lifecycle_1, resources_1, editorExtensions_1, codeEditorService_1, nls, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$d$ = void 0;
    const ignoreUnusualLineTerminators = 'ignoreUnusualLineTerminators';
    function writeIgnoreState(codeEditorService, model, state) {
        codeEditorService.setModelProperty(model.uri, ignoreUnusualLineTerminators, state);
    }
    function readIgnoreState(codeEditorService, model) {
        return codeEditorService.getModelProperty(model.uri, ignoreUnusualLineTerminators);
    }
    let $d$ = class $d$ extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.unusualLineTerminatorsDetector'; }
        constructor(c, f, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.b = false;
            this.a = this.c.getOption(125 /* EditorOption.unusualLineTerminators */);
            this.B(this.c.onDidChangeConfiguration((e) => {
                if (e.hasChanged(125 /* EditorOption.unusualLineTerminators */)) {
                    this.a = this.c.getOption(125 /* EditorOption.unusualLineTerminators */);
                    this.h();
                }
            }));
            this.B(this.c.onDidChangeModel(() => {
                this.h();
            }));
            this.B(this.c.onDidChangeModelContent((e) => {
                if (e.isUndoing) {
                    // skip checking in case of undoing
                    return;
                }
                this.h();
            }));
            this.h();
        }
        async h() {
            if (this.a === 'off') {
                return;
            }
            if (!this.c.hasModel()) {
                return;
            }
            const model = this.c.getModel();
            if (!model.mightContainUnusualLineTerminators()) {
                return;
            }
            const ignoreState = readIgnoreState(this.g, model);
            if (ignoreState === true) {
                // this model should be ignored
                return;
            }
            if (this.c.getOption(90 /* EditorOption.readOnly */)) {
                // read only editor => sorry!
                return;
            }
            if (this.a === 'auto') {
                // just do it!
                model.removeUnusualLineTerminators(this.c.getSelections());
                return;
            }
            if (this.b) {
                // we're currently showing the dialog, which is async.
                // avoid spamming the user
                return;
            }
            let result;
            try {
                this.b = true;
                result = await this.f.confirm({
                    title: nls.localize(0, null),
                    message: nls.localize(1, null),
                    detail: nls.localize(2, null, (0, resources_1.$fg)(model.uri)),
                    primaryButton: nls.localize(3, null),
                    cancelButton: nls.localize(4, null)
                });
            }
            finally {
                this.b = false;
            }
            if (!result.confirmed) {
                // this model should be ignored
                writeIgnoreState(this.g, model, true);
                return;
            }
            model.removeUnusualLineTerminators(this.c.getSelections());
        }
    };
    exports.$d$ = $d$;
    exports.$d$ = $d$ = __decorate([
        __param(1, dialogs_1.$oA),
        __param(2, codeEditorService_1.$nV)
    ], $d$);
    (0, editorExtensions_1.$AV)($d$.ID, $d$, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=unusualLineTerminators.js.map