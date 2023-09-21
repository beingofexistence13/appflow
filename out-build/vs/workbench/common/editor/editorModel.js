/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xA = void 0;
    /**
     * The editor model is the heavyweight counterpart of editor input. Depending on the editor input, it
     * resolves from a file system retrieve content and may allow for saving it back or reverting it.
     * Editor models are typically cached for some while because they are expensive to construct.
     */
    class $xA extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.f = this.B(new event_1.$fd());
            this.onWillDispose = this.f.event;
            this.h = false;
            this.j = false;
        }
        /**
         * Causes this model to resolve returning a promise when loading is completed.
         */
        async resolve() {
            this.j = true;
        }
        /**
         * Returns whether this model was loaded or not.
         */
        isResolved() {
            return this.j;
        }
        /**
         * Find out if this model has been disposed.
         */
        isDisposed() {
            return this.h;
        }
        /**
         * Subclasses should implement to free resources that have been claimed through loading.
         */
        dispose() {
            this.h = true;
            this.f.fire();
            super.dispose();
        }
    }
    exports.$xA = $xA;
});
//# sourceMappingURL=editorModel.js.map