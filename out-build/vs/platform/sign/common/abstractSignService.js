/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$x2b = void 0;
    class $x2b {
        constructor() {
            this.b = new Map();
        }
        static { this.a = 1; }
        async createNewMessage(value) {
            try {
                const validator = await this.c();
                if (validator) {
                    const id = String($x2b.a++);
                    this.b.set(id, validator);
                    return {
                        id: id,
                        data: validator.createNewMessage(value)
                    };
                }
            }
            catch (e) {
                // ignore errors silently
            }
            return { id: '', data: value };
        }
        async validate(message, value) {
            if (!message.id) {
                return true;
            }
            const validator = this.b.get(message.id);
            if (!validator) {
                return false;
            }
            this.b.delete(message.id);
            try {
                return (validator.validate(value) === 'ok');
            }
            catch (e) {
                // ignore errors silently
                return false;
            }
            finally {
                validator.dispose?.();
            }
        }
        async sign(value) {
            try {
                return await this.d(value);
            }
            catch (e) {
                // ignore errors silently
            }
            return value;
        }
    }
    exports.$x2b = $x2b;
});
//# sourceMappingURL=abstractSignService.js.map