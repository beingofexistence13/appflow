/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/editor/browser/services/abstractCodeEditorService", "vs/platform/commands/common/commands"], function (require, exports, event_1, abstractCodeEditorService_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$C0b = exports.$B0b = exports.$A0b = void 0;
    class $A0b extends abstractCodeEditorService_1.$vyb {
        constructor() {
            super(...arguments);
            this.globalStyleSheet = new $B0b();
        }
        D() {
            return this.globalStyleSheet;
        }
        getActiveCodeEditor() {
            return null;
        }
        openCodeEditor(input, source, sideBySide) {
            this.lastInput = input;
            return Promise.resolve(null);
        }
    }
    exports.$A0b = $A0b;
    class $B0b extends abstractCodeEditorService_1.$xyb {
        constructor() {
            super(null);
            this.rules = [];
        }
        insertRule(rule, index) {
            this.rules.unshift(rule);
        }
        removeRulesContainingSelector(ruleName) {
            for (let i = 0; i < this.rules.length; i++) {
                if (this.rules[i].indexOf(ruleName) >= 0) {
                    this.rules.splice(i, 1);
                    i--;
                }
            }
        }
        read() {
            return this.rules.join('\n');
        }
    }
    exports.$B0b = $B0b;
    class $C0b {
        constructor(instantiationService) {
            this.b = new event_1.$fd();
            this.onWillExecuteCommand = this.b.event;
            this.c = new event_1.$fd();
            this.onDidExecuteCommand = this.c.event;
            this.a = instantiationService;
        }
        executeCommand(id, ...args) {
            const command = commands_1.$Gr.getCommand(id);
            if (!command) {
                return Promise.reject(new Error(`command '${id}' not found`));
            }
            try {
                this.b.fire({ commandId: id, args });
                const result = this.a.invokeFunction.apply(this.a, [command.handler, ...args]);
                this.c.fire({ commandId: id, args });
                return Promise.resolve(result);
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
    }
    exports.$C0b = $C0b;
});
//# sourceMappingURL=editorTestServices.js.map