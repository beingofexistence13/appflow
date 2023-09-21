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
define(["require", "exports", "vs/nls!vs/workbench/services/progress/browser/progressService", "vs/base/common/lifecycle", "vs/platform/progress/common/progress", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/async", "vs/workbench/services/activity/common/activity", "vs/platform/notification/common/notification", "vs/base/common/actions", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/platform/layout/browser/layoutService", "vs/base/browser/ui/dialog/dialog", "vs/platform/keybinding/common/keybinding", "vs/base/browser/dom", "vs/base/common/linkedText", "vs/workbench/common/views", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/iconLabels", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/progressService"], function (require, exports, nls_1, lifecycle_1, progress_1, statusbar_1, async_1, activity_1, notification_1, actions_1, event_1, extensions_1, layoutService_1, dialog_1, keybinding_1, dom_1, linkedText_1, views_1, panecomposite_1, iconLabels_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uyb = void 0;
    let $uyb = class $uyb extends lifecycle_1.$kc {
        constructor(a, b, c, f, g, h, j, m) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = [];
            this.r = undefined;
        }
        async withProgress(options, task, onDidCancel) {
            const { location } = options;
            const handleStringLocation = (location) => {
                const viewContainer = this.c.getViewContainerById(location);
                if (viewContainer) {
                    const viewContainerLocation = this.c.getViewContainerLocation(viewContainer);
                    if (viewContainerLocation !== null) {
                        return this.w(location, viewContainerLocation, task, { ...options, location });
                    }
                }
                if (this.c.getViewDescriptorById(location) !== null) {
                    return this.y(location, task, { ...options, location });
                }
                throw new Error(`Bad progress location: ${location}`);
            };
            if (typeof location === 'string') {
                return handleStringLocation(location);
            }
            switch (location) {
                case 15 /* ProgressLocation.Notification */:
                    return this.u({ ...options, location, priority: this.g.doNotDisturbMode ? notification_1.NotificationPriority.SILENT : undefined }, task, onDidCancel);
                case 10 /* ProgressLocation.Window */: {
                    const type = options.type;
                    if (options.command) {
                        // Window progress with command get's shown in the status bar
                        return this.s({ ...options, location, type }, task);
                    }
                    // Window progress without command can be shown as silent notification
                    // which will first appear in the status bar and can then be brought to
                    // the front when clicking.
                    return this.u({ delay: 150 /* default for ProgressLocation.Window */, ...options, priority: notification_1.NotificationPriority.SILENT, location: 15 /* ProgressLocation.Notification */, type }, task, onDidCancel);
                }
                case 1 /* ProgressLocation.Explorer */:
                    return this.w('workbench.view.explorer', 0 /* ViewContainerLocation.Sidebar */, task, { ...options, location });
                case 3 /* ProgressLocation.Scm */:
                    return handleStringLocation('workbench.scm');
                case 5 /* ProgressLocation.Extensions */:
                    return this.w('workbench.view.extensions', 0 /* ViewContainerLocation.Sidebar */, task, { ...options, location });
                case 20 /* ProgressLocation.Dialog */:
                    return this.D(options, task, onDidCancel);
                default:
                    throw new Error(`Bad progress location: ${location}`);
            }
        }
        s(options, callback) {
            const task = [options, new progress_1.$4u(() => this.t())];
            const promise = callback(task[1]);
            let delayHandle = setTimeout(() => {
                delayHandle = undefined;
                this.n.unshift(task);
                this.t();
                // show progress for at least 150ms
                Promise.all([
                    (0, async_1.$Hg)(150),
                    promise
                ]).finally(() => {
                    const idx = this.n.indexOf(task);
                    this.n.splice(idx, 1);
                    this.t();
                });
            }, 150);
            // cancel delay if promise finishes below 150ms
            return promise.finally(() => clearTimeout(delayHandle));
        }
        t(idx = 0) {
            // We still have progress to show
            if (idx < this.n.length) {
                const [options, progress] = this.n[idx];
                const progressTitle = options.title;
                const progressMessage = progress.value && progress.value.message;
                const progressCommand = options.command;
                let text;
                let title;
                const source = options.source && typeof options.source !== 'string' ? options.source.label : options.source;
                if (progressTitle && progressMessage) {
                    // <title>: <message>
                    text = (0, nls_1.localize)(0, null, progressTitle, progressMessage);
                    title = source ? (0, nls_1.localize)(1, null, source, progressTitle, progressMessage) : text;
                }
                else if (progressTitle) {
                    // <title>
                    text = progressTitle;
                    title = source ? (0, nls_1.localize)(2, null, source, progressTitle) : text;
                }
                else if (progressMessage) {
                    // <message>
                    text = progressMessage;
                    title = source ? (0, nls_1.localize)(3, null, source, progressMessage) : text;
                }
                else {
                    // no title, no message -> no progress. try with next on stack
                    this.t(idx + 1);
                    return;
                }
                const statusEntryProperties = {
                    name: (0, nls_1.localize)(4, null),
                    text,
                    showProgress: options.type || true,
                    ariaLabel: text,
                    tooltip: title,
                    command: progressCommand
                };
                if (this.r) {
                    this.r.update(statusEntryProperties);
                }
                else {
                    this.r = this.h.addEntry(statusEntryProperties, 'status.progress', 0 /* StatusbarAlignment.LEFT */);
                }
            }
            // Progress is done so we remove the status entry
            else {
                this.r?.dispose();
                this.r = undefined;
            }
        }
        u(options, callback, onDidCancel) {
            const progressStateModel = new class extends lifecycle_1.$kc {
                get step() { return this.c; }
                get done() { return this.f; }
                constructor() {
                    super();
                    this.a = this.B(new event_1.$fd());
                    this.onDidReport = this.a.event;
                    this.b = this.B(new event_1.$fd());
                    this.onWillDispose = this.b.event;
                    this.c = undefined;
                    this.f = false;
                    this.promise = callback(this);
                    this.promise.finally(() => {
                        this.dispose();
                    });
                }
                report(step) {
                    this.c = step;
                    this.a.fire(step);
                }
                cancel(choice) {
                    onDidCancel?.(choice);
                    this.dispose();
                }
                dispose() {
                    this.f = true;
                    this.b.fire();
                    super.dispose();
                }
            };
            const createWindowProgress = () => {
                // Create a promise that we can resolve as needed
                // when the outside calls dispose on us
                const promise = new async_1.$2g();
                this.s({
                    location: 10 /* ProgressLocation.Window */,
                    title: options.title ? (0, linkedText_1.$IS)(options.title).toString() : undefined,
                    command: 'notifications.showList',
                    type: options.type
                }, progress => {
                    function reportProgress(step) {
                        if (step.message) {
                            progress.report({
                                message: (0, linkedText_1.$IS)(step.message).toString() // convert markdown links => string
                            });
                        }
                    }
                    // Apply any progress that was made already
                    if (progressStateModel.step) {
                        reportProgress(progressStateModel.step);
                    }
                    // Continue to report progress as it happens
                    const onDidReportListener = progressStateModel.onDidReport(step => reportProgress(step));
                    promise.p.finally(() => onDidReportListener.dispose());
                    // When the progress model gets disposed, we are done as well
                    event_1.Event.once(progressStateModel.onWillDispose)(() => promise.complete());
                    return promise.p;
                });
                // Dispose means completing our promise
                return (0, lifecycle_1.$ic)(() => promise.complete());
            };
            const createNotification = (message, priority, increment) => {
                const notificationDisposables = new lifecycle_1.$jc();
                const primaryActions = options.primaryActions ? Array.from(options.primaryActions) : [];
                const secondaryActions = options.secondaryActions ? Array.from(options.secondaryActions) : [];
                if (options.buttons) {
                    options.buttons.forEach((button, index) => {
                        const buttonAction = new class extends actions_1.$gi {
                            constructor() {
                                super(`progress.button.${button}`, button, undefined, true);
                            }
                            async run() {
                                progressStateModel.cancel(index);
                            }
                        };
                        notificationDisposables.add(buttonAction);
                        primaryActions.push(buttonAction);
                    });
                }
                if (options.cancellable) {
                    const cancelAction = new class extends actions_1.$gi {
                        constructor() {
                            super('progress.cancel', (0, nls_1.localize)(5, null), undefined, true);
                        }
                        async run() {
                            progressStateModel.cancel();
                        }
                    };
                    notificationDisposables.add(cancelAction);
                    primaryActions.push(cancelAction);
                }
                const notification = this.g.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, iconLabels_1.$Tj)(message),
                    source: options.source,
                    actions: { primary: primaryActions, secondary: secondaryActions },
                    progress: typeof increment === 'number' && increment >= 0 ? { total: 100, worked: increment } : { infinite: true },
                    priority
                });
                // Switch to window based progress once the notification
                // changes visibility to hidden and is still ongoing.
                // Remove that window based progress once the notification
                // shows again.
                let windowProgressDisposable = undefined;
                const onVisibilityChange = (visible) => {
                    // Clear any previous running window progress
                    (0, lifecycle_1.$fc)(windowProgressDisposable);
                    // Create new window progress if notification got hidden
                    if (!visible && !progressStateModel.done) {
                        windowProgressDisposable = createWindowProgress();
                    }
                };
                notificationDisposables.add(notification.onDidChangeVisibility(onVisibilityChange));
                if (priority === notification_1.NotificationPriority.SILENT) {
                    onVisibilityChange(false);
                }
                // Clear upon dispose
                event_1.Event.once(notification.onDidClose)(() => notificationDisposables.dispose());
                return notification;
            };
            const updateProgress = (notification, increment) => {
                if (typeof increment === 'number' && increment >= 0) {
                    notification.progress.total(100); // always percentage based
                    notification.progress.worked(increment);
                }
                else {
                    notification.progress.infinite();
                }
            };
            let notificationHandle;
            let notificationTimeout;
            let titleAndMessage; // hoisted to make sure a delayed notification shows the most recent message
            const updateNotification = (step) => {
                // full message (inital or update)
                if (step?.message && options.title) {
                    titleAndMessage = `${options.title}: ${step.message}`; // always prefix with overall title if we have it (https://github.com/microsoft/vscode/issues/50932)
                }
                else {
                    titleAndMessage = options.title || step?.message;
                }
                if (!notificationHandle && titleAndMessage) {
                    // create notification now or after a delay
                    if (typeof options.delay === 'number' && options.delay > 0) {
                        if (typeof notificationTimeout !== 'number') {
                            notificationTimeout = setTimeout(() => notificationHandle = createNotification(titleAndMessage, options.priority, step?.increment), options.delay);
                        }
                    }
                    else {
                        notificationHandle = createNotification(titleAndMessage, options.priority, step?.increment);
                    }
                }
                if (notificationHandle) {
                    if (titleAndMessage) {
                        notificationHandle.updateMessage(titleAndMessage);
                    }
                    if (typeof step?.increment === 'number') {
                        updateProgress(notificationHandle, step.increment);
                    }
                }
            };
            // Show initially
            updateNotification(progressStateModel.step);
            const listener = progressStateModel.onDidReport(step => updateNotification(step));
            event_1.Event.once(progressStateModel.onWillDispose)(() => listener.dispose());
            // Clean up eventually
            (async () => {
                try {
                    // with a delay we only wait for the finish of the promise
                    if (typeof options.delay === 'number' && options.delay > 0) {
                        await progressStateModel.promise;
                    }
                    // without a delay we show the notification for at least 800ms
                    // to reduce the chance of the notification flashing up and hiding
                    else {
                        await Promise.all([(0, async_1.$Hg)(800), progressStateModel.promise]);
                    }
                }
                finally {
                    clearTimeout(notificationTimeout);
                    notificationHandle?.close();
                }
            })();
            return progressStateModel.promise;
        }
        w(paneCompositeId, viewContainerLocation, task, options) {
            // show in viewlet
            const progressIndicator = this.b.getProgressIndicator(paneCompositeId, viewContainerLocation);
            const promise = progressIndicator ? this.C(progressIndicator, task, options) : task({ report: () => { } });
            // show on activity bar
            if (viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                this.z(paneCompositeId, options, promise);
            }
            return promise;
        }
        y(viewId, task, options) {
            // show in viewlet
            const progressIndicator = this.f.getViewProgressIndicator(viewId);
            const promise = progressIndicator ? this.C(progressIndicator, task, options) : task({ report: () => { } });
            const location = this.c.getViewLocationById(viewId);
            if (location !== 0 /* ViewContainerLocation.Sidebar */) {
                return promise;
            }
            const viewletId = this.c.getViewContainerByViewId(viewId)?.id;
            if (viewletId === undefined) {
                return promise;
            }
            // show on activity bar
            this.z(viewletId, options, promise);
            return promise;
        }
        z(viewletId, options, promise) {
            let activityProgress;
            let delayHandle = setTimeout(() => {
                delayHandle = undefined;
                const handle = this.a.showViewContainerActivity(viewletId, { badge: new activity_1.$LV(() => ''), clazz: 'progress-badge', priority: 100 });
                const startTimeVisible = Date.now();
                const minTimeVisible = 300;
                activityProgress = {
                    dispose() {
                        const d = Date.now() - startTimeVisible;
                        if (d < minTimeVisible) {
                            // should at least show for Nms
                            setTimeout(() => handle.dispose(), minTimeVisible - d);
                        }
                        else {
                            // shown long enough
                            handle.dispose();
                        }
                    }
                };
            }, options.delay || 300);
            promise.finally(() => {
                clearTimeout(delayHandle);
                (0, lifecycle_1.$fc)(activityProgress);
            });
        }
        C(progressIndicator, task, options) {
            let discreteProgressRunner = undefined;
            function updateProgress(stepOrTotal) {
                // Figure out whether discrete progress applies
                // by figuring out the "total" progress to show
                // and the increment if any.
                let total = undefined;
                let increment = undefined;
                if (typeof stepOrTotal !== 'undefined') {
                    if (typeof stepOrTotal === 'number') {
                        total = stepOrTotal;
                    }
                    else if (typeof stepOrTotal.increment === 'number') {
                        total = stepOrTotal.total ?? 100; // always percentage based
                        increment = stepOrTotal.increment;
                    }
                }
                // Discrete
                if (typeof total === 'number') {
                    if (!discreteProgressRunner) {
                        discreteProgressRunner = progressIndicator.show(total, options.delay);
                        promise.catch(() => undefined /* ignore */).finally(() => discreteProgressRunner?.done());
                    }
                    if (typeof increment === 'number') {
                        discreteProgressRunner.worked(increment);
                    }
                }
                // Infinite
                else {
                    discreteProgressRunner?.done();
                    progressIndicator.showWhile(promise, options.delay);
                }
                return discreteProgressRunner;
            }
            const promise = task({
                report: progress => {
                    updateProgress(progress);
                }
            });
            updateProgress(options.total);
            return promise;
        }
        D(options, task, onDidCancel) {
            const disposables = new lifecycle_1.$jc();
            const allowableCommands = [
                'workbench.action.quit',
                'workbench.action.reloadWindow',
                'copy',
                'cut',
                'editor.action.clipboardCopyAction',
                'editor.action.clipboardCutAction'
            ];
            let dialog;
            const createDialog = (message) => {
                const buttons = options.buttons || [];
                if (!options.sticky) {
                    buttons.push(options.cancellable ? (0, nls_1.localize)(6, null) : (0, nls_1.localize)(7, null));
                }
                dialog = new dialog_1.$uR(this.j.container, message, buttons, {
                    type: 'pending',
                    detail: options.detail,
                    cancelId: buttons.length - 1,
                    disableCloseAction: options.sticky,
                    disableDefaultAction: options.sticky,
                    keyEventProcessor: (event) => {
                        const resolved = this.m.softDispatch(event, this.j.container);
                        if (resolved.kind === 2 /* ResultKind.KbFound */ && resolved.commandId) {
                            if (!allowableCommands.includes(resolved.commandId)) {
                                dom_1.$5O.stop(event, true);
                            }
                        }
                    },
                    buttonStyles: defaultStyles_1.$i2,
                    checkboxStyles: defaultStyles_1.$o2,
                    inputBoxStyles: defaultStyles_1.$s2,
                    dialogStyles: defaultStyles_1.$q2
                });
                disposables.add(dialog);
                dialog.show().then(dialogResult => {
                    onDidCancel?.(dialogResult.button);
                    (0, lifecycle_1.$fc)(dialog);
                });
                return dialog;
            };
            // In order to support the `delay` option, we use a scheduler
            // that will guard each access to the dialog behind a delay
            // that is either the original delay for one invocation and
            // otherwise runs without delay.
            let delay = options.delay ?? 0;
            let latestMessage = undefined;
            const scheduler = disposables.add(new async_1.$Sg(() => {
                delay = 0; // since we have run once, we reset the delay
                if (latestMessage && !dialog) {
                    dialog = createDialog(latestMessage);
                }
                else if (latestMessage) {
                    dialog.updateMessage(latestMessage);
                }
            }, 0));
            const updateDialog = function (message) {
                latestMessage = message;
                // Make sure to only run one dialog update and not multiple
                if (!scheduler.isScheduled()) {
                    scheduler.schedule(delay);
                }
            };
            const promise = task({
                report: progress => {
                    updateDialog(progress.message);
                }
            });
            promise.finally(() => {
                (0, lifecycle_1.$fc)(disposables);
            });
            if (options.title) {
                updateDialog(options.title);
            }
            return promise;
        }
    };
    exports.$uyb = $uyb;
    exports.$uyb = $uyb = __decorate([
        __param(0, activity_1.$HV),
        __param(1, panecomposite_1.$Yeb),
        __param(2, views_1.$_E),
        __param(3, views_1.$$E),
        __param(4, notification_1.$Yu),
        __param(5, statusbar_1.$6$),
        __param(6, layoutService_1.$XT),
        __param(7, keybinding_1.$2D)
    ], $uyb);
    (0, extensions_1.$mr)(progress_1.$2u, $uyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=progressService.js.map