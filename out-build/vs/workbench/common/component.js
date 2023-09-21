/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/memento", "vs/platform/theme/common/themeService"], function (require, exports, memento_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZT = void 0;
    class $ZT extends themeService_1.$nv {
        constructor(D, themeService, storageService) {
            super(themeService);
            this.D = D;
            this.D = D;
            this.C = new memento_1.$YT(this.D, storageService);
            this.B(storageService.onWillSaveState(() => {
                // Ask the component to persist state into the memento
                this.G();
                // Then save the memento into storage
                this.C.saveMemento();
            }));
        }
        getId() {
            return this.D;
        }
        F(scope, target) {
            return this.C.getMemento(scope, target);
        }
        G() {
            // Subclasses to implement for storing state
        }
    }
    exports.$ZT = $ZT;
});
//# sourceMappingURL=component.js.map