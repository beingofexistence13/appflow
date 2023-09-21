/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$E3b = exports.$D3b = void 0;
    class $D3b {
        constructor() {
            this.a = null;
            this.b = null;
            this.d = null;
            this.f = false;
            this.g = null;
            this.h = false;
            this.i = null;
        }
        get [Symbol.toStringTag]() {
            return this.toString();
        }
        j() {
            if (!this.a) {
                this.a = new Promise((c, e) => {
                    this.b = c;
                    this.d = e;
                    if (this.f) {
                        this.b(this.g);
                    }
                    if (this.h) {
                        this.d(this.i);
                    }
                });
            }
            return this.a;
        }
        resolveOk(value) {
            if (this.f || this.h) {
                return;
            }
            this.f = true;
            this.g = value;
            if (this.a) {
                this.b(value);
            }
        }
        resolveErr(err) {
            if (this.f || this.h) {
                return;
            }
            this.h = true;
            this.i = err;
            if (this.a) {
                this.d(err);
            }
            else {
                // If nobody's listening at this point, it is safe to assume they never will,
                // since resolving this promise is always "async"
                (0, errors_1.$Y)(err);
            }
        }
        then(success, error) {
            return this.j().then(success, error);
        }
        catch(error) {
            return this.j().then(undefined, error);
        }
        finally(callback) {
            return this.j().finally(callback);
        }
    }
    exports.$D3b = $D3b;
    class $E3b extends $D3b {
        constructor() {
            super();
            this.h = true;
            this.i = new errors_1.$3();
        }
    }
    exports.$E3b = $E3b;
});
//# sourceMappingURL=lazyPromise.js.map