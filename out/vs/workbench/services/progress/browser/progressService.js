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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/progress/common/progress", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/async", "vs/workbench/services/activity/common/activity", "vs/platform/notification/common/notification", "vs/base/common/actions", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/platform/layout/browser/layoutService", "vs/base/browser/ui/dialog/dialog", "vs/platform/keybinding/common/keybinding", "vs/base/browser/dom", "vs/base/common/linkedText", "vs/workbench/common/views", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/iconLabels", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/progressService"], function (require, exports, nls_1, lifecycle_1, progress_1, statusbar_1, async_1, activity_1, notification_1, actions_1, event_1, extensions_1, layoutService_1, dialog_1, keybinding_1, dom_1, linkedText_1, views_1, panecomposite_1, iconLabels_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgressService = void 0;
    let ProgressService = class ProgressService extends lifecycle_1.Disposable {
        constructor(activityService, paneCompositeService, viewDescriptorService, viewsService, notificationService, statusbarService, layoutService, keybindingService) {
            super();
            this.activityService = activityService;
            this.paneCompositeService = paneCompositeService;
            this.viewDescriptorService = viewDescriptorService;
            this.viewsService = viewsService;
            this.notificationService = notificationService;
            this.statusbarService = statusbarService;
            this.layoutService = layoutService;
            this.keybindingService = keybindingService;
            this.windowProgressStack = [];
            this.windowProgressStatusEntry = undefined;
        }
        async withProgress(options, task, onDidCancel) {
            const { location } = options;
            const handleStringLocation = (location) => {
                const viewContainer = this.viewDescriptorService.getViewContainerById(location);
                if (viewContainer) {
                    const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                    if (viewContainerLocation !== null) {
                        return this.withPaneCompositeProgress(location, viewContainerLocation, task, { ...options, location });
                    }
                }
                if (this.viewDescriptorService.getViewDescriptorById(location) !== null) {
                    return this.withViewProgress(location, task, { ...options, location });
                }
                throw new Error(`Bad progress location: ${location}`);
            };
            if (typeof location === 'string') {
                return handleStringLocation(location);
            }
            switch (location) {
                case 15 /* ProgressLocation.Notification */:
                    return this.withNotificationProgress({ ...options, location, priority: this.notificationService.doNotDisturbMode ? notification_1.NotificationPriority.SILENT : undefined }, task, onDidCancel);
                case 10 /* ProgressLocation.Window */: {
                    const type = options.type;
                    if (options.command) {
                        // Window progress with command get's shown in the status bar
                        return this.withWindowProgress({ ...options, location, type }, task);
                    }
                    // Window progress without command can be shown as silent notification
                    // which will first appear in the status bar and can then be brought to
                    // the front when clicking.
                    return this.withNotificationProgress({ delay: 150 /* default for ProgressLocation.Window */, ...options, priority: notification_1.NotificationPriority.SILENT, location: 15 /* ProgressLocation.Notification */, type }, task, onDidCancel);
                }
                case 1 /* ProgressLocation.Explorer */:
                    return this.withPaneCompositeProgress('workbench.view.explorer', 0 /* ViewContainerLocation.Sidebar */, task, { ...options, location });
                case 3 /* ProgressLocation.Scm */:
                    return handleStringLocation('workbench.scm');
                case 5 /* ProgressLocation.Extensions */:
                    return this.withPaneCompositeProgress('workbench.view.extensions', 0 /* ViewContainerLocation.Sidebar */, task, { ...options, location });
                case 20 /* ProgressLocation.Dialog */:
                    return this.withDialogProgress(options, task, onDidCancel);
                default:
                    throw new Error(`Bad progress location: ${location}`);
            }
        }
        withWindowProgress(options, callback) {
            const task = [options, new progress_1.Progress(() => this.updateWindowProgress())];
            const promise = callback(task[1]);
            let delayHandle = setTimeout(() => {
                delayHandle = undefined;
                this.windowProgressStack.unshift(task);
                this.updateWindowProgress();
                // show progress for at least 150ms
                Promise.all([
                    (0, async_1.timeout)(150),
                    promise
                ]).finally(() => {
                    const idx = this.windowProgressStack.indexOf(task);
                    this.windowProgressStack.splice(idx, 1);
                    this.updateWindowProgress();
                });
            }, 150);
            // cancel delay if promise finishes below 150ms
            return promise.finally(() => clearTimeout(delayHandle));
        }
        updateWindowProgress(idx = 0) {
            // We still have progress to show
            if (idx < this.windowProgressStack.length) {
                const [options, progress] = this.windowProgressStack[idx];
                const progressTitle = options.title;
                const progressMessage = progress.value && progress.value.message;
                const progressCommand = options.command;
                let text;
                let title;
                const source = options.source && typeof options.source !== 'string' ? options.source.label : options.source;
                if (progressTitle && progressMessage) {
                    // <title>: <message>
                    text = (0, nls_1.localize)('progress.text2', "{0}: {1}", progressTitle, progressMessage);
                    title = source ? (0, nls_1.localize)('progress.title3', "[{0}] {1}: {2}", source, progressTitle, progressMessage) : text;
                }
                else if (progressTitle) {
                    // <title>
                    text = progressTitle;
                    title = source ? (0, nls_1.localize)('progress.title2', "[{0}]: {1}", source, progressTitle) : text;
                }
                else if (progressMessage) {
                    // <message>
                    text = progressMessage;
                    title = source ? (0, nls_1.localize)('progress.title2', "[{0}]: {1}", source, progressMessage) : text;
                }
                else {
                    // no title, no message -> no progress. try with next on stack
                    this.updateWindowProgress(idx + 1);
                    return;
                }
                const statusEntryProperties = {
                    name: (0, nls_1.localize)('status.progress', "Progress Message"),
                    text,
                    showProgress: options.type || true,
                    ariaLabel: text,
                    tooltip: title,
                    command: progressCommand
                };
                if (this.windowProgressStatusEntry) {
                    this.windowProgressStatusEntry.update(statusEntryProperties);
                }
                else {
                    this.windowProgressStatusEntry = this.statusbarService.addEntry(statusEntryProperties, 'status.progress', 0 /* StatusbarAlignment.LEFT */);
                }
            }
            // Progress is done so we remove the status entry
            else {
                this.windowProgressStatusEntry?.dispose();
                this.windowProgressStatusEntry = undefined;
            }
        }
        withNotificationProgress(options, callback, onDidCancel) {
            const progressStateModel = new class extends lifecycle_1.Disposable {
                get step() { return this._step; }
                get done() { return this._done; }
                constructor() {
                    super();
                    this._onDidReport = this._register(new event_1.Emitter());
                    this.onDidReport = this._onDidReport.event;
                    this._onWillDispose = this._register(new event_1.Emitter());
                    this.onWillDispose = this._onWillDispose.event;
                    this._step = undefined;
                    this._done = false;
                    this.promise = callback(this);
                    this.promise.finally(() => {
                        this.dispose();
                    });
                }
                report(step) {
                    this._step = step;
                    this._onDidReport.fire(step);
                }
                cancel(choice) {
                    onDidCancel?.(choice);
                    this.dispose();
                }
                dispose() {
                    this._done = true;
                    this._onWillDispose.fire();
                    super.dispose();
                }
            };
            const createWindowProgress = () => {
                // Create a promise that we can resolve as needed
                // when the outside calls dispose on us
                const promise = new async_1.DeferredPromise();
                this.withWindowProgress({
                    location: 10 /* ProgressLocation.Window */,
                    title: options.title ? (0, linkedText_1.parseLinkedText)(options.title).toString() : undefined,
                    command: 'notifications.showList',
                    type: options.type
                }, progress => {
                    function reportProgress(step) {
                        if (step.message) {
                            progress.report({
                                message: (0, linkedText_1.parseLinkedText)(step.message).toString() // convert markdown links => string
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
                return (0, lifecycle_1.toDisposable)(() => promise.complete());
            };
            const createNotification = (message, priority, increment) => {
                const notificationDisposables = new lifecycle_1.DisposableStore();
                const primaryActions = options.primaryActions ? Array.from(options.primaryActions) : [];
                const secondaryActions = options.secondaryActions ? Array.from(options.secondaryActions) : [];
                if (options.buttons) {
                    options.buttons.forEach((button, index) => {
                        const buttonAction = new class extends actions_1.Action {
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
                    const cancelAction = new class extends actions_1.Action {
                        constructor() {
                            super('progress.cancel', (0, nls_1.localize)('cancel', "Cancel"), undefined, true);
                        }
                        async run() {
                            progressStateModel.cancel();
                        }
                    };
                    notificationDisposables.add(cancelAction);
                    primaryActions.push(cancelAction);
                }
                const notification = this.notificationService.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, iconLabels_1.stripIcons)(message),
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
                    (0, lifecycle_1.dispose)(windowProgressDisposable);
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
                        await Promise.all([(0, async_1.timeout)(800), progressStateModel.promise]);
                    }
                }
                finally {
                    clearTimeout(notificationTimeout);
                    notificationHandle?.close();
                }
            })();
            return progressStateModel.promise;
        }
        withPaneCompositeProgress(paneCompositeId, viewContainerLocation, task, options) {
            // show in viewlet
            const progressIndicator = this.paneCompositeService.getProgressIndicator(paneCompositeId, viewContainerLocation);
            const promise = progressIndicator ? this.withCompositeProgress(progressIndicator, task, options) : task({ report: () => { } });
            // show on activity bar
            if (viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                this.showOnActivityBar(paneCompositeId, options, promise);
            }
            return promise;
        }
        withViewProgress(viewId, task, options) {
            // show in viewlet
            const progressIndicator = this.viewsService.getViewProgressIndicator(viewId);
            const promise = progressIndicator ? this.withCompositeProgress(progressIndicator, task, options) : task({ report: () => { } });
            const location = this.viewDescriptorService.getViewLocationById(viewId);
            if (location !== 0 /* ViewContainerLocation.Sidebar */) {
                return promise;
            }
            const viewletId = this.viewDescriptorService.getViewContainerByViewId(viewId)?.id;
            if (viewletId === undefined) {
                return promise;
            }
            // show on activity bar
            this.showOnActivityBar(viewletId, options, promise);
            return promise;
        }
        showOnActivityBar(viewletId, options, promise) {
            let activityProgress;
            let delayHandle = setTimeout(() => {
                delayHandle = undefined;
                const handle = this.activityService.showViewContainerActivity(viewletId, { badge: new activity_1.ProgressBadge(() => ''), clazz: 'progress-badge', priority: 100 });
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
                (0, lifecycle_1.dispose)(activityProgress);
            });
        }
        withCompositeProgress(progressIndicator, task, options) {
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
        withDialogProgress(options, task, onDidCancel) {
            const disposables = new lifecycle_1.DisposableStore();
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
                    buttons.push(options.cancellable ? (0, nls_1.localize)('cancel', "Cancel") : (0, nls_1.localize)('dismiss', "Dismiss"));
                }
                dialog = new dialog_1.Dialog(this.layoutService.container, message, buttons, {
                    type: 'pending',
                    detail: options.detail,
                    cancelId: buttons.length - 1,
                    disableCloseAction: options.sticky,
                    disableDefaultAction: options.sticky,
                    keyEventProcessor: (event) => {
                        const resolved = this.keybindingService.softDispatch(event, this.layoutService.container);
                        if (resolved.kind === 2 /* ResultKind.KbFound */ && resolved.commandId) {
                            if (!allowableCommands.includes(resolved.commandId)) {
                                dom_1.EventHelper.stop(event, true);
                            }
                        }
                    },
                    buttonStyles: defaultStyles_1.defaultButtonStyles,
                    checkboxStyles: defaultStyles_1.defaultCheckboxStyles,
                    inputBoxStyles: defaultStyles_1.defaultInputBoxStyles,
                    dialogStyles: defaultStyles_1.defaultDialogStyles
                });
                disposables.add(dialog);
                dialog.show().then(dialogResult => {
                    onDidCancel?.(dialogResult.button);
                    (0, lifecycle_1.dispose)(dialog);
                });
                return dialog;
            };
            // In order to support the `delay` option, we use a scheduler
            // that will guard each access to the dialog behind a delay
            // that is either the original delay for one invocation and
            // otherwise runs without delay.
            let delay = options.delay ?? 0;
            let latestMessage = undefined;
            const scheduler = disposables.add(new async_1.RunOnceScheduler(() => {
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
                (0, lifecycle_1.dispose)(disposables);
            });
            if (options.title) {
                updateDialog(options.title);
            }
            return promise;
        }
    };
    exports.ProgressService = ProgressService;
    exports.ProgressService = ProgressService = __decorate([
        __param(0, activity_1.IActivityService),
        __param(1, panecomposite_1.IPaneCompositePartService),
        __param(2, views_1.IViewDescriptorService),
        __param(3, views_1.IViewsService),
        __param(4, notification_1.INotificationService),
        __param(5, statusbar_1.IStatusbarService),
        __param(6, layoutService_1.ILayoutService),
        __param(7, keybinding_1.IKeybindingService)
    ], ProgressService);
    (0, extensions_1.registerSingleton)(progress_1.IProgressService, ProgressService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3NTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3Byb2dyZXNzL2Jyb3dzZXIvcHJvZ3Jlc3NTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBCekYsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSxzQkFBVTtRQUk5QyxZQUNtQixlQUFrRCxFQUN6QyxvQkFBZ0UsRUFDbkUscUJBQThELEVBQ3ZFLFlBQTRDLEVBQ3JDLG1CQUEwRCxFQUM3RCxnQkFBb0QsRUFDdkQsYUFBOEMsRUFDMUMsaUJBQXNEO1lBRTFFLEtBQUssRUFBRSxDQUFDO1lBVDJCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUN4Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTJCO1lBQ2xELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDdEQsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDcEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3RDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN6QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBdUQxRCx3QkFBbUIsR0FBd0QsRUFBRSxDQUFDO1lBQ3ZGLDhCQUF5QixHQUF3QyxTQUFTLENBQUM7UUFyRG5GLENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWSxDQUFjLE9BQXlCLEVBQUUsSUFBd0QsRUFBRSxXQUF1QztZQUMzSixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDO1lBRTdCLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEVBQUU7Z0JBQ2pELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMs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