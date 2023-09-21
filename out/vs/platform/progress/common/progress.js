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
    exports.IEditorProgressService = exports.LongRunningOperation = exports.UnmanagedProgress = exports.Progress = exports.emptyProgressRunner = exports.ProgressLocation = exports.IProgressService = void 0;
    exports.IProgressService = (0, instantiation_1.createDecorator)('progressService');
    var ProgressLocation;
    (function (ProgressLocation) {
        ProgressLocation[ProgressLocation["Explorer"] = 1] = "Explorer";
        ProgressLocation[ProgressLocation["Scm"] = 3] = "Scm";
        ProgressLocation[ProgressLocation["Extensions"] = 5] = "Extensions";
        ProgressLocation[ProgressLocation["Window"] = 10] = "Window";
        ProgressLocation[ProgressLocation["Notification"] = 15] = "Notification";
        ProgressLocation[ProgressLocation["Dialog"] = 20] = "Dialog";
    })(ProgressLocation || (exports.ProgressLocation = ProgressLocation = {}));
    exports.emptyProgressRunner = Object.freeze({
        total() { },
        worked() { },
        done() { }
    });
    class Progress {
        static { this.None = Object.freeze({ report() { } }); }
        get value() { return this._value; }
        constructor(callback, opts) {
            this.callback = callback;
            this.report = opts?.async
                ? this._reportAsync.bind(this)
                : this._reportSync.bind(this);
        }
        _reportSync(item) {
            this._value = item;
            this.callback(this._value);
        }
        _reportAsync(item) {
            Promise.resolve(this._lastTask).finally(() => {
                this._value = item;
                const r = this.callback(this._value);
                this._lastTask = Promise.resolve(r).finally(() => this._lastTask = undefined);
            });
        }
    }
    exports.Progress = Progress;
    /**
     * RAII-style progress instance that allows imperative reporting and hides
     * once `dispose()` is called.
     */
    let UnmanagedProgress = class UnmanagedProgress extends lifecycle_1.Disposable {
        constructor(options, progressService) {
            super();
            this.deferred = new async_1.DeferredPromise();
            progressService.withProgress(options, reporter => {
                this.reporter = reporter;
                if (this.lastStep) {
                    reporter.report(this.lastStep);
                }
                return this.deferred.p;
            });
            this._register((0, lifecycle_1.toDisposable)(() => this.deferred.complete()));
        }
        report(step) {
            if (this.reporter) {
                this.reporter.report(step);
            }
            else {
                this.lastStep = step;
            }
        }
    };
    exports.UnmanagedProgress = UnmanagedProgress;
    exports.UnmanagedProgress = UnmanagedProgress = __decorate([
        __param(1, exports.IProgressService)
    ], UnmanagedProgress);
    class LongRunningOperation extends lifecycle_1.Disposable {
        constructor(progressIndicator) {
            super();
            this.progressIndicator = progressIndicator;
            this.currentOperationId = 0;
            this.currentOperationDisposables = this._register(new lifecycle_1.DisposableStore());
        }
        start(progressDelay) {
            // Stop any previous operation
            this.stop();
            // Start new
            const newOperationId = ++this.currentOperationId;
            const newOperationToken = new cancellation_1.CancellationTokenSource();
            this.currentProgressTimeout = setTimeout(() => {
                if (newOperationId === this.currentOperationId) {
                    this.currentProgressRunner = this.progressIndicator.show(true);
                }
            }, progressDelay);
            this.currentOperationDisposables.add((0, lifecycle_1.toDisposable)(() => clearTimeout(this.currentProgressTimeout)));
            this.currentOperationDisposables.add((0, lifecycle_1.toDisposable)(() => newOperationToken.cancel()));
            this.currentOperationDisposables.add((0, lifecycle_1.toDisposable)(() => this.currentProgressRunner ? this.currentProgressRunner.done() : undefined));
            return {
                id: newOperationId,
                token: newOperationToken.token,
                stop: () => this.doStop(newOperationId),
                isCurrent: () => this.currentOperationId === newOperationId
            };
        }
        stop() {
            this.doStop(this.currentOperationId);
        }
        doStop(operationId) {
            if (this.currentOperationId === operationId) {
                this.currentOperationDisposables.clear();
            }
        }
    }
    exports.LongRunningOperation = LongRunningOperation;
    exports.IEditorProgressService = (0, instantiation_1.createDecorator)('editorProgressService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9wcm9ncmVzcy9jb21tb24vcHJvZ3Jlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBU25GLFFBQUEsZ0JBQWdCLEdBQUcsSUFBQSwrQkFBZSxFQUFtQixpQkFBaUIsQ0FBQyxDQUFDO0lBK0JyRixJQUFrQixnQkFPakI7SUFQRCxXQUFrQixnQkFBZ0I7UUFDakMsK0RBQVksQ0FBQTtRQUNaLHFEQUFPLENBQUE7UUFDUCxtRUFBYyxDQUFBO1FBQ2QsNERBQVcsQ0FBQTtRQUNYLHdFQUFpQixDQUFBO1FBQ2pCLDREQUFXLENBQUE7SUFDWixDQUFDLEVBUGlCLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBT2pDO0lBaURZLFFBQUEsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBa0I7UUFDakUsS0FBSyxLQUFLLENBQUM7UUFDWCxNQUFNLEtBQUssQ0FBQztRQUNaLElBQUksS0FBSyxDQUFDO0tBQ1YsQ0FBQyxDQUFDO0lBTUgsTUFBYSxRQUFRO2lCQUVKLFNBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFxQixFQUFFLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBSzNFLElBQUksS0FBSyxLQUFvQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBSWxELFlBQW9CLFFBQThCLEVBQUUsSUFBMEI7WUFBMUQsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7WUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUUsS0FBSztnQkFDeEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDOUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFD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