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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, async_1, cancellation_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7u = exports.$6u = exports.$5u = exports.$4u = exports.$3u = exports.ProgressLocation = exports.$2u = void 0;
    exports.$2u = (0, instantiation_1.$Bh)('progressService');
    var ProgressLocation;
    (function (ProgressLocation) {
        ProgressLocation[ProgressLocation["Explorer"] = 1] = "Explorer";
        ProgressLocation[ProgressLocation["Scm"] = 3] = "Scm";
        ProgressLocation[ProgressLocation["Extensions"] = 5] = "Extensions";
        ProgressLocation[ProgressLocation["Window"] = 10] = "Window";
        ProgressLocation[ProgressLocation["Notification"] = 15] = "Notification";
        ProgressLocation[ProgressLocation["Dialog"] = 20] = "Dialog";
    })(ProgressLocation || (exports.ProgressLocation = ProgressLocation = {}));
    exports.$3u = Object.freeze({
        total() { },
        worked() { },
        done() { }
    });
    class $4u {
        static { this.None = Object.freeze({ report() { } }); }
        get value() { return this.a; }
        constructor(c, opts) {
            this.c = c;
            this.report = opts?.async
                ? this.e.bind(this)
                : this.d.bind(this);
        }
        d(item) {
            this.a = item;
            this.c(this.a);
        }
        e(item) {
            Promise.resolve(this.b).finally(() => {
                this.a = item;
                const r = this.c(this.a);
                this.b = Promise.resolve(r).finally(() => this.b = undefined);
            });
        }
    }
    exports.$4u = $4u;
    /**
     * RAII-style progress instance that allows imperative reporting and hides
     * once `dispose()` is called.
     */
    let $5u = class $5u extends lifecycle_1.$kc {
        constructor(options, progressService) {
            super();
            this.a = new async_1.$2g();
            progressService.withProgress(options, reporter => {
                this.b = reporter;
                if (this.c) {
                    reporter.report(this.c);
                }
                return this.a.p;
            });
            this.B((0, lifecycle_1.$ic)(() => this.a.complete()));
        }
        report(step) {
            if (this.b) {
                this.b.report(step);
            }
            else {
                this.c = step;
            }
        }
    };
    exports.$5u = $5u;
    exports.$5u = $5u = __decorate([
        __param(1, exports.$2u)
    ], $5u);
    class $6u extends lifecycle_1.$kc {
        constructor(g) {
            super();
            this.g = g;
            this.a = 0;
            this.b = this.B(new lifecycle_1.$jc());
        }
        start(progressDelay) {
            // Stop any previous operation
            this.stop();
            // Start new
            const newOperationId = ++this.a;
            const newOperationToken = new cancellation_1.$pd();
            this.f = setTimeout(() => {
                if (newOperationId === this.a) {
                    this.c = this.g.show(true);
                }
            }, progressDelay);
            this.b.add((0, lifecycle_1.$ic)(() => clearTimeout(this.f)));
            this.b.add((0, lifecycle_1.$ic)(() => newOperationToken.cancel()));
            this.b.add((0, lifecycle_1.$ic)(() => this.c ? this.c.done() : undefined));
            return {
                id: newOperationId,
                token: newOperationToken.token,
                stop: () => this.h(newOperationId),
                isCurrent: () => this.a === newOperationId
            };
        }
        stop() {
            this.h(this.a);
        }
        h(operationId) {
            if (this.a === operationId) {
                this.b.clear();
            }
        }
    }
    exports.$6u = $6u;
    exports.$7u = (0, instantiation_1.$Bh)('editorProgressService');
});
//# sourceMappingURL=progress.js.map