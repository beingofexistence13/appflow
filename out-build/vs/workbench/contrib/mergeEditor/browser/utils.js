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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/platform/storage/common/storage"], function (require, exports, arrays_1, errors_1, lifecycle_1, observable_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fjb = exports.$ejb = exports.$djb = exports.$cjb = exports.$bjb = exports.$ajb = exports.$_ib = exports.join = exports.$0ib = exports.$9ib = exports.$8ib = exports.$7ib = void 0;
    class $7ib {
        constructor() {
            this.b = false;
        }
        get isActive() {
            return this.b;
        }
        makeExclusive(fn) {
            return ((...args) => {
                if (this.b) {
                    return;
                }
                this.b = true;
                try {
                    return fn(...args);
                }
                finally {
                    this.b = false;
                }
            });
        }
        runExclusively(fn) {
            if (this.b) {
                return;
            }
            this.b = true;
            try {
                fn();
            }
            finally {
                this.b = false;
            }
        }
        runExclusivelyOrThrow(fn) {
            if (this.b) {
                throw new errors_1.$ab();
            }
            this.b = true;
            try {
                fn();
            }
            finally {
                this.b = false;
            }
        }
    }
    exports.$7ib = $7ib;
    function $8ib(element, style) {
        Object.entries(style).forEach(([key, value]) => {
            element.style.setProperty(key, toSize(value));
        });
    }
    exports.$8ib = $8ib;
    function toSize(value) {
        return typeof value === 'number' ? `${value}px` : value;
    }
    function $9ib(editor, decorations) {
        const d = new lifecycle_1.$jc();
        let decorationIds = [];
        d.add((0, observable_1.autorunOpts)({ debugName: () => `Apply decorations from ${decorations.debugName}` }, reader => {
            const d = decorations.read(reader);
            editor.changeDecorations(a => {
                decorationIds = a.deltaDecorations(decorationIds, d);
            });
        }));
        d.add({
            dispose: () => {
                editor.changeDecorations(a => {
                    decorationIds = a.deltaDecorations(decorationIds, []);
                });
            }
        });
        return d;
    }
    exports.$9ib = $9ib;
    function* $0ib(left, right, compare) {
        const rightQueue = new arrays_1.$0b(right);
        for (const leftElement of left) {
            rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isGreaterThan(compare(leftElement, rightElement)));
            const equals = rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
            yield { left: leftElement, rights: equals || [] };
        }
    }
    exports.$0ib = $0ib;
    function* join(left, right, compare) {
        const rightQueue = new arrays_1.$0b(right);
        for (const leftElement of left) {
            const skipped = rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isGreaterThan(compare(leftElement, rightElement)));
            if (skipped) {
                yield { rights: skipped };
            }
            const equals = rightQueue.takeWhile(rightElement => arrays_1.CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
            yield { left: leftElement, rights: equals || [] };
        }
    }
    exports.join = join;
    function $_ib(...arrays) {
        return [].concat(...arrays);
    }
    exports.$_ib = $_ib;
    function $ajb(arr, index) {
        return arr[index];
    }
    exports.$ajb = $ajb;
    function $bjb(promise, then) {
        let disposed = false;
        promise.then(() => {
            if (disposed) {
                return;
            }
            then();
        });
        return (0, lifecycle_1.$ic)(() => {
            disposed = true;
        });
    }
    exports.$bjb = $bjb;
    function $cjb(obj, fields) {
        return Object.assign(obj, fields);
    }
    exports.$cjb = $cjb;
    function $djb(source1, source2) {
        const result = {};
        for (const key in source1) {
            result[key] = source1[key];
        }
        for (const key in source2) {
            const source2Value = source2[key];
            if (typeof result[key] === 'object' && source2Value && typeof source2Value === 'object') {
                result[key] = $djb(result[key], source2Value);
            }
            else {
                result[key] = source2Value;
            }
        }
        return result;
    }
    exports.$djb = $djb;
    let $ejb = class $ejb {
        constructor(f, g) {
            this.f = f;
            this.g = g;
            this.b = false;
            this.c = undefined;
        }
        get() {
            if (!this.b) {
                const value = this.g.get(this.f, 0 /* StorageScope.PROFILE */);
                if (value !== undefined) {
                    try {
                        this.c = JSON.parse(value);
                    }
                    catch (e) {
                        (0, errors_1.$Y)(e);
                    }
                }
                this.b = true;
            }
            return this.c;
        }
        set(newValue) {
            this.c = newValue;
            this.g.store(this.f, JSON.stringify(this.c), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    exports.$ejb = $ejb;
    exports.$ejb = $ejb = __decorate([
        __param(1, storage_1.$Vo)
    ], $ejb);
    function $fjb(key, defaultValue, configurationService) {
        return (0, observable_1.observableFromEvent)((handleChange) => configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(key)) {
                handleChange(e);
            }
        }), () => configurationService.getValue(key) ?? defaultValue);
    }
    exports.$fjb = $fjb;
});
//# sourceMappingURL=utils.js.map