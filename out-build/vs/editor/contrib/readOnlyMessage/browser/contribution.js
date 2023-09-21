/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/contrib/message/browser/messageController", "vs/nls!vs/editor/contrib/readOnlyMessage/browser/contribution"], function (require, exports, htmlContent_1, lifecycle_1, editorExtensions_1, messageController_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$R$ = void 0;
    class $R$ extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.readOnlyMessageController'; }
        constructor(a) {
            super();
            this.a = a;
            this.B(this.a.onDidAttemptReadOnlyEdit(() => this.b()));
        }
        b() {
            const messageController = messageController_1.$M2.get(this.a);
            if (messageController && this.a.hasModel()) {
                let message = this.a.getOptions().get(91 /* EditorOption.readOnlyMessage */);
                if (!message) {
                    if (this.a.isSimpleWidget) {
                        message = new htmlContent_1.$Xj(nls.localize(0, null));
                    }
                    else {
                        message = new htmlContent_1.$Xj(nls.localize(1, null));
                    }
                }
                messageController.showMessage(message, this.a.getPosition());
            }
        }
    }
    exports.$R$ = $R$;
    (0, editorExtensions_1.$AV)($R$.ID, $R$, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=contribution.js.map