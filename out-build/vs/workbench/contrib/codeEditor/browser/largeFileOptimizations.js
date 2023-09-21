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
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/largeFileOptimizations", "vs/base/common/path", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification"], function (require, exports, nls, path, lifecycle_1, editorExtensions_1, configuration_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7Xb = void 0;
    /**
     * Shows a message when opening a large file which has been memory optimized (and features disabled).
     */
    let $7Xb = class $7Xb extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.largeFileOptimizationsWarner'; }
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.B(this.a.onDidChangeModel((e) => this.f()));
            this.f();
        }
        f() {
            const model = this.a.getModel();
            if (!model) {
                return;
            }
            if (model.isTooLargeForTokenization()) {
                const message = nls.localize(0, null, path.$ae(model.uri.path));





                this.b.prompt(notification_1.Severity.Info, message, [
                    {
                        label: nls.localize(1, null),
                        run: () => {
                            this.c.updateValue(`editor.largeFileOptimizations`, false).then(() => {
                                this.b.info(nls.localize(2, null));
                            }, (err) => {
                                this.b.error(err);
                            });
                        }
                    }
                ], { neverShowAgain: { id: 'editor.contrib.largeFileOptimizationsWarner' } });
            }
        }
    };
    exports.$7Xb = $7Xb;
    exports.$7Xb = $7Xb = __decorate([
        __param(1, notification_1.$Yu),
        __param(2, configuration_1.$8h)
    ], $7Xb);
    (0, editorExtensions_1.$AV)($7Xb.ID, $7Xb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=largeFileOptimizations.js.map