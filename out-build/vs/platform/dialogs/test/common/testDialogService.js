/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/severity"], function (require, exports, event_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H0b = void 0;
    class $H0b {
        constructor(a = undefined) {
            this.a = a;
            this.onWillShowDialog = event_1.Event.None;
            this.onDidShowDialog = event_1.Event.None;
            this.b = undefined;
        }
        setConfirmResult(result) {
            this.b = result;
        }
        async confirm(confirmation) {
            if (this.b) {
                const confirmResult = this.b;
                this.b = undefined;
                return confirmResult;
            }
            return this.a ?? { confirmed: false };
        }
        async prompt(prompt) {
            const promptButtons = [...(prompt.buttons ?? [])];
            if (prompt.cancelButton && typeof prompt.cancelButton !== 'string' && typeof prompt.cancelButton !== 'boolean') {
                promptButtons.push(prompt.cancelButton);
            }
            return { result: await promptButtons[0]?.run({ checkboxChecked: false }) };
        }
        async info(message, detail) {
            await this.prompt({ type: severity_1.default.Info, message, detail });
        }
        async warn(message, detail) {
            await this.prompt({ type: severity_1.default.Warning, message, detail });
        }
        async error(message, detail) {
            await this.prompt({ type: severity_1.default.Error, message, detail });
        }
        async input() { {
            return { confirmed: true, values: [] };
        } }
        async about() { }
    }
    exports.$H0b = $H0b;
});
//# sourceMappingURL=testDialogService.js.map