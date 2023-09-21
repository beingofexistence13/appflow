/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "./extHostTypeConverters", "vs/platform/progress/common/progress", "vs/nls!vs/workbench/api/common/extHostProgress", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/errors"], function (require, exports, extHostTypeConverters_1, progress_1, nls_1, cancellation_1, decorators_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1bc = void 0;
    class $1bc {
        constructor(proxy) {
            this.b = 0;
            this.c = new Map();
            this.a = proxy;
        }
        async withProgress(extension, options, task) {
            const handle = this.b++;
            const { title, location, cancellable } = options;
            const source = { label: (0, nls_1.localize)(0, null, extension.displayName || extension.name), id: extension.identifier.value };
            this.a.$startProgress(handle, { location: extHostTypeConverters_1.ProgressLocation.from(location), title, source, cancellable }, !extension.isUnderDevelopment ? extension.identifier.value : undefined).catch(errors_1.$Z);
            return this.d(handle, task, !!cancellable);
        }
        d(handle, task, cancellable) {
            let source;
            if (cancellable) {
                source = new cancellation_1.$pd();
                this.c.set(handle, source);
            }
            const progressEnd = (handle) => {
                this.a.$progressEnd(handle);
                this.c.delete(handle);
                source?.dispose();
            };
            let p;
            try {
                p = task(new ProgressCallback(this.a, handle), cancellable && source ? source.token : cancellation_1.CancellationToken.None);
            }
            catch (err) {
                progressEnd(handle);
                throw err;
            }
            p.then(result => progressEnd(handle), err => progressEnd(handle));
            return p;
        }
        $acceptProgressCanceled(handle) {
            const source = this.c.get(handle);
            if (source) {
                source.cancel();
                this.c.delete(handle);
            }
        }
    }
    exports.$1bc = $1bc;
    function mergeProgress(result, currentValue) {
        result.message = currentValue.message;
        if (typeof currentValue.increment === 'number') {
            if (typeof result.increment === 'number') {
                result.increment += currentValue.increment;
            }
            else {
                result.increment = currentValue.increment;
            }
        }
        return result;
    }
    class ProgressCallback extends progress_1.$4u {
        constructor(f, g) {
            super(p => this.throttledReport(p));
            this.f = f;
            this.g = g;
        }
        throttledReport(p) {
            this.f.$progressReport(this.g, p);
        }
    }
    __decorate([
        (0, decorators_1.$8g)(100, (result, currentValue) => mergeProgress(result, currentValue), () => Object.create(null))
    ], ProgressCallback.prototype, "throttledReport", null);
});
//# sourceMappingURL=extHostProgress.js.map