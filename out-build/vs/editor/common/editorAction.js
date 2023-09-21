/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UX = void 0;
    class $UX {
        constructor(id, label, alias, precondition, run, contextKeyService) {
            this.id = id;
            this.label = label;
            this.alias = alias;
            this.a = precondition;
            this.b = run;
            this.c = contextKeyService;
        }
        isSupported() {
            return this.c.contextMatchesRules(this.a);
        }
        run(args) {
            if (!this.isSupported()) {
                return Promise.resolve(undefined);
            }
            return this.b(args);
        }
    }
    exports.$UX = $UX;
});
//# sourceMappingURL=editorAction.js.map