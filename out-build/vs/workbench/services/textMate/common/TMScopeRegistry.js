/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources"], function (require, exports, resources) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uBb = void 0;
    class $uBb {
        constructor() {
            this.a = Object.create(null);
        }
        reset() {
            this.a = Object.create(null);
        }
        register(def) {
            if (this.a[def.scopeName]) {
                const existingRegistration = this.a[def.scopeName];
                if (!resources.$bg(existingRegistration.location, def.location)) {
                    console.warn(`Overwriting grammar scope name to file mapping for scope ${def.scopeName}.\n` +
                        `Old grammar file: ${existingRegistration.location.toString()}.\n` +
                        `New grammar file: ${def.location.toString()}`);
                }
            }
            this.a[def.scopeName] = def;
        }
        getGrammarDefinition(scopeName) {
            return this.a[scopeName] || null;
        }
    }
    exports.$uBb = $uBb;
});
//# sourceMappingURL=TMScopeRegistry.js.map