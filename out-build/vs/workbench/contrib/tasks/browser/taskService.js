/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/browser/taskService", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/browser/abstractTaskService", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/instantiation/common/extensions"], function (require, exports, nls, tasks_1, abstractTaskService_1, taskService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a5b = void 0;
    class $a5b extends abstractTaskService_1.$LXb {
        static { this.Id = nls.localize(0, null); }
        Ic() {
            if (this.I) {
                return this.I;
            }
            if (this.Mb !== tasks_1.ExecutionEngine.Terminal) {
                throw new Error($a5b.Id);
            }
            this.I = this.Hc();
            this.J =
                [
                    this.I.onDidStateChange((event) => {
                        this.O.set(this.I.isActiveSync());
                        this.Q.fire(event);
                    }),
                ];
            return this.I;
        }
        Xc(workspaceFolder) {
            throw new Error($a5b.Id);
        }
        Xb(filter) {
            return this.Mb === tasks_1.ExecutionEngine.Terminal;
        }
    }
    exports.$a5b = $a5b;
    (0, extensions_1.$mr)(taskService_1.$osb, $a5b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=taskService.js.map