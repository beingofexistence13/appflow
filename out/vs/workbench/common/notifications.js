/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/notification/common/notification", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/linkedText"], function (require, exports, notification_1, errorMessage_1, event_1, lifecycle_1, errors_1, actions_1, arrays_1, linkedText_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChoiceAction = exports.NotificationViewItem = exports.NotificationViewItemProgress = exports.NotificationViewItemContentChangeKind = exports.isNotificationViewItem = exports.NotificationsModel = exports.NotificationHandle = exports.StatusMessageChangeType = exports.NotificationChangeType = void 0;
    var NotificationChangeType;
    (function (NotificationChangeType) {
        /**
         * A notification was added.
         */
        NotificationChangeType[NotificationChangeType["ADD"] = 0] = "ADD";
        /**
         * A notification changed. Check `detail` property
         * on the event for additional information.
         */
        NotificationChangeType[NotificationChangeType["CHANGE"] = 1] = "CHANGE";
        /**
         * A notification expanded or collapsed.
         */
        NotificationChangeType[NotificationChangeType["EXPAND_COLLAPSE"] = 2] = "EXPAND_COLLAPSE";
        /**
         * A notification was removed.
         */
        NotificationChangeType[NotificationChangeType["REMOVE"] = 3] = "REMOVE";
    })(NotificationChangeType || (exports.NotificationChangeType = NotificationChangeType = {}));
    var StatusMessageChangeType;
    (function (StatusMessageChangeType) {
        StatusMessageChangeType[StatusMessageChangeType["ADD"] = 0] = "ADD";
        StatusMessageChangeType[StatusMessageChangeType["REMOVE"] = 1] = "REMOVE";
    })(StatusMessageChangeType || (exports.StatusMessageChangeType = StatusMessageChangeType = {}));
    class NotificationHandle extends lifecycle_1.Disposable {
        constructor(item, onClose) {
            super();
            this.item = item;
            this.onClose = onClose;
            this._onDidClose = this._register(new event_1.Emitter());
            this.onDidClose = this._onDidClose.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.registerListeners();
        }
        registerListeners() {
            // Visibility
            this._register(this.item.onDidChangeVisibility(visible => this._onDidChangeVisibility.fire(visible)));
            // Closing
            event_1.Event.once(this.item.onDidClose)(() => {
                this._onDidClose.fire();
                this.dispose();
            });
        }
        get progress() {
            return this.item.progress;
        }
        updateSeverity(severity) {
            this.item.updateSeverity(severity);
        }
        updateMessage(message) {
            this.item.updateMessage(message);
        }
        updateActions(actions) {
            this.item.updateActions(actions);
        }
        close() {
            this.onClose(this.item);
            this.dispose();
        }
    }
    exports.NotificationHandle = NotificationHandle;
    class NotificationsModel extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeNotification = this._register(new event_1.Emitter());
            this.onDidChangeNotification = this._onDidChangeNotification.event;
            this._onDidChangeStatusMessage = this._register(new event_1.Emitter());
            this.onDidChangeStatusMessage = this._onDidChangeStatusMessage.event;
            this._onDidChangeFilter = this._register(new event_1.Emitter());
            this.onDidChangeFilter = this._onDidChangeFilter.event;
            this._notifications = [];
            this.filter = notification_1.NotificationsFilter.OFF;
        }
        static { this.NO_OP_NOTIFICATION = new notification_1.NoOpNotification(); }
        get notifications() { return this._notifications; }
        get statusMessage() { return this._statusMessage; }
        setFilter(filter) {
            this.filter = filter;
            this._onDidChangeFilter.fire(filter);
        }
        addNotification(notification) {
            const item = this.createViewItem(notification);
            if (!item) {
                return NotificationsModel.NO_OP_NOTIFICATION; // return early if this is a no-op
            }
            // Deduplicate
            const duplicate = this.findNotification(item);
            duplicate?.close();
            // Add to list as first entry
            this._notifications.splice(0, 0, item);
            // Events
            this._onDidChangeNotification.fire({ item, index: 0, kind: 0 /* NotificationChangeType.ADD */ });
            // Wrap into handle
            return new NotificationHandle(item, item => this.onClose(item));
        }
        onClose(item) {
            const liveItem = this.findNotification(item);
            if (liveItem && liveItem !== item) {
                liveItem.close(); // item could have been replaced with another one, make sure to close the live item
            }
            else {
                item.close(); // otherwise just close the item that was passed in
            }
        }
        findNotification(item) {
            return this._notifications.find(notification => notification.equals(item));
        }
        createViewItem(notification) {
            const item = NotificationViewItem.create(notification, this.filter);
            if (!item) {
                return undefined;
            }
            // Item Events
            const fireNotificationChangeEvent = (kind, detail) => {
                const index = this._notifications.indexOf(item);
                if (index >= 0) {
                    this._onDidChangeNotification.fire({ item, index, kind, detail });
                }
            };
            const itemExpansionChangeListener = item.onDidChangeExpansion(() => fireNotificationChangeEvent(2 /* NotificationChangeType.EXPAND_COLLAPSE */));
            const itemContentChangeListener = item.onDidChangeContent(e => fireNotificationChangeEvent(1 /* NotificationChangeType.CHANGE */, e.kind));
            event_1.Event.once(item.onDidClose)(() => {
                itemExpansionChangeListener.dispose();
                itemContentChangeListener.dispose();
                const index = this._notifications.indexOf(item);
                if (index >= 0) {
                    this._notifications.splice(index, 1);
                    this._onDidChangeNotification.fire({ item, index, kind: 3 /* NotificationChangeType.REMOVE */ });
                }
            });
            return item;
        }
        showStatusMessage(message, options) {
            const item = StatusMessageViewItem.create(message, options);
            if (!item) {
                return lifecycle_1.Disposable.None;
            }
            // Remember as current status message and fire events
            this._statusMessage = item;
            this._onDidChangeStatusMessage.fire({ kind: 0 /* StatusMessageChangeType.ADD */, item });
            return (0, lifecycle_1.toDisposable)(() => {
                // Only reset status message if the item is still the one we had remembered
                if (this._statusMessage === item) {
                    this._statusMessage = undefined;
                    this._onDidChangeStatusMessage.fire({ kind: 1 /* StatusMessageChangeType.REMOVE */, item });
                }
            });
        }
    }
    exports.NotificationsModel = NotificationsModel;
    function isNotificationViewItem(obj) {
        return obj instanceof NotificationViewItem;
    }
    exports.isNotificationViewItem = isNotificationViewItem;
    var NotificationViewItemContentChangeKind;
    (function (NotificationViewItemContentChangeKind) {
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["SEVERITY"] = 0] = "SEVERITY";
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["MESSAGE"] = 1] = "MESSAGE";
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["ACTIONS"] = 2] = "ACTIONS";
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["PROGRESS"] = 3] = "PROGRESS";
    })(NotificationViewItemContentChangeKind || (exports.NotificationViewItemContentChangeKind = NotificationViewItemContentChangeKind = {}));
    class NotificationViewItemProgress extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._state = Object.create(null);
        }
        get state() {
            return this._state;
        }
        infinite() {
            if (this._state.infinite) {
                return;
            }
            this._state.infinite = true;
            this._state.total = undefined;
            this._state.worked = undefined;
            this._state.done = undefined;
            this._onDidChange.fire();
        }
        done() {
            if (this._state.done) {
                return;
            }
            this._state.done = true;
            this._state.infinite = undefined;
            this._state.total = undefined;
            this._state.worked = undefined;
            this._onDidChange.fire();
        }
        total(value) {
            if (this._state.total === value) {
                return;
            }
            this._state.total = value;
            this._state.infinite = undefined;
            this._state.done = undefined;
            this._onDidChange.fire();
        }
        worked(value) {
            if (typeof this._state.worked === 'number') {
                this._state.worked += value;
            }
            else {
                this._state.worked = value;
            }
            this._state.infinite = undefined;
            this._state.done = undefined;
            this._onDidChange.fire();
        }
    }
    exports.NotificationViewItemProgress = NotificationViewItemProgress;
    class NotificationViewItem extends lifecycle_1.Disposable {
        static { this.MAX_MESSAGE_LENGTH = 1000; }
        static create(notification, filter = notification_1.NotificationsFilter.OFF) {
            if (!notification || !notification.message || (0, errors_1.isCancellationError)(notification.message)) {
                return undefined; // we need a message to show
            }
            let severity;
            if (typeof notification.severity === 'number') {
                severity = notification.severity;
            }
            else {
                severity = notification_1.Severity.Info;
            }
            const message = NotificationViewItem.parseNotificationMessage(notification.message);
            if (!message) {
                return undefined; // we need a message to show
            }
            let actions;
            if (notification.actions) {
                actions = notification.actions;
            }
            else if ((0, errorMessage_1.isErrorWithActions)(notification.message)) {
                actions = { primary: notification.message.actions };
            }
            let priority = notification.priority ?? notification_1.NotificationPriority.DEFAULT;
            if (priority === notification_1.NotificationPriority.DEFAULT && (filter === notification_1.NotificationsFilter.SILENT || (filter === notification_1.NotificationsFilter.ERROR && notification.severity !== notification_1.Severity.Error))) {
                priority = notification_1.NotificationPriority.SILENT;
            }
            return new NotificationViewItem(notification.id, severity, notification.sticky, priority, message, notification.source, notification.progress, actions);
        }
        static parseNotificationMessage(input) {
            let message;
            if (input instanceof Error) {
                message = (0, errorMessage_1.toErrorMessage)(input, false);
            }
            else if (typeof input === 'string') {
                message = input;
            }
            if (!message) {
                return undefined; // we need a message to show
            }
            const raw = message;
            // Make sure message is in the limits
            if (message.length > NotificationViewItem.MAX_MESSAGE_LENGTH) {
                message = `${message.substr(0, NotificationViewItem.MAX_MESSAGE_LENGTH)}...`;
            }
            // Remove newlines from messages as we do not support that and it makes link parsing hard
            message = message.replace(/(\r\n|\n|\r)/gm, ' ').trim();
            // Parse Links
            const linkedText = (0, linkedText_1.parseLinkedText)(message);
            return { raw, linkedText, original: input };
        }
        constructor(id, _severity, _sticky, _priority, _message, _source, progress, actions) {
            super();
            this.id = id;
            this._severity = _severity;
            this._sticky = _sticky;
            this._priority = _priority;
            this._message = _message;
            this._source = _source;
            this._visible = false;
            this._onDidChangeExpansion = this._register(new event_1.Emitter());
            this.onDidChangeExpansion = this._onDidChangeExpansion.event;
            this._onDidClose = this._register(new event_1.Emitter());
            this.onDidClose = this._onDidClose.event;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            if (progress) {
                this.setProgress(progress);
            }
            this.setActions(actions);
        }
        setProgress(progress) {
            if (progress.infinite) {
                this.progress.infinite();
            }
            else if (progress.total) {
                this.progress.total(progress.total);
                if (progress.worked) {
                    this.progress.worked(progress.worked);
                }
            }
        }
        setActions(actions = { primary: [], secondary: [] }) {
            this._actions = {
                primary: Array.isArray(actions.primary) ? actions.primary : [],
                secondary: Array.isArray(actions.secondary) ? actions.secondary : []
            };
            this._expanded = actions.primary && actions.primary.length > 0;
        }
        get canCollapse() {
            return !this.hasActions;
        }
        get expanded() {
            return !!this._expanded;
        }
        get severity() {
            return this._severity;
        }
        get sticky() {
            if (this._sticky) {
                return true; // explicitly sticky
            }
            const hasActions = this.hasActions;
            if ((hasActions && this._severity === notification_1.Severity.Error) || // notification errors with actions are sticky
                (!hasActions && this._expanded) || // notifications that got expanded are sticky
                (this._progress && !this._progress.state.done) // notifications with running progress are sticky
            ) {
                return true;
            }
            return false; // not sticky
        }
        get priority() {
            return this._priority;
        }
        get hasActions() {
            if (!this._actions) {
                return false;
            }
            if (!this._actions.primary) {
                return false;
            }
            return this._actions.primary.length > 0;
        }
        get hasProgress() {
            return !!this._progress;
        }
        get progress() {
            if (!this._progress) {
                this._progress = this._register(new NotificationViewItemProgress());
                this._register(this._progress.onDidChange(() => this._onDidChangeContent.fire({ kind: 3 /* NotificationViewItemContentChangeKind.PROGRESS */ })));
            }
            return this._progress;
        }
        get message() {
            return this._message;
        }
        get source() {
            return typeof this._source === 'string' ? this._source : (this._source ? this._source.label : undefined);
        }
        get sourceId() {
            return (this._source && typeof this._source !== 'string' && 'id' in this._source) ? this._source.id : undefined;
        }
        get actions() {
            return this._actions;
        }
        get visible() {
            return this._visible;
        }
        updateSeverity(severity) {
            if (severity === this._severity) {
                return;
            }
            this._severity = severity;
            this._onDidChangeContent.fire({ kind: 0 /* NotificationViewItemContentChangeKind.SEVERITY */ });
        }
        updateMessage(input) {
            const message = NotificationViewItem.parseNotificationMessage(input);
            if (!message || message.raw === this._message.raw) {
                return;
            }
            this._message = message;
            this._onDidChangeContent.fire({ kind: 1 /* NotificationViewItemContentChangeKind.MESSAGE */ });
        }
        updateActions(actions) {
            this.setActions(actions);
            this._onDidChangeContent.fire({ kind: 2 /* NotificationViewItemContentChangeKind.ACTIONS */ });
        }
        updateVisibility(visible) {
            if (this._visible !== visible) {
                this._visible = visible;
                this._onDidChangeVisibility.fire(visible);
            }
        }
        expand() {
            if (this._expanded || !this.canCollapse) {
                return;
            }
            this._expanded = true;
            this._onDidChangeExpansion.fire();
        }
        collapse(skipEvents) {
            if (!this._expanded || !this.canCollapse) {
                return;
            }
            this._expanded = false;
            if (!skipEvents) {
                this._onDidChangeExpansion.fire();
            }
        }
        toggle() {
            if (this._expanded) {
                this.collapse();
            }
            else {
                this.expand();
            }
        }
        close() {
            this._onDidClose.fire();
            this.dispose();
        }
        equals(other) {
            if (this.hasProgress || other.hasProgress) {
                return false;
            }
            if (typeof this.id === 'string' || typeof other.id === 'string') {
                return this.id === other.id;
            }
            if (typeof this._source === 'object') {
                if (this._source.label !== other.source || this._source.id !== other.sourceId) {
                    return false;
                }
            }
            else if (this._source !== other.source) {
                return false;
            }
            if (this._message.raw !== other.message.raw) {
                return false;
            }
            const primaryActions = (this._actions && this._actions.primary) || [];
            const otherPrimaryActions = (other.actions && other.actions.primary) || [];
            return (0, arrays_1.equals)(primaryActions, otherPrimaryActions, (action, otherAction) => (action.id + action.label) === (otherAction.id + otherAction.label));
        }
    }
    exports.NotificationViewItem = NotificationViewItem;
    class ChoiceAction extends actions_1.Action {
        constructor(id, choice) {
            super(id, choice.label, undefined, true, async () => {
                // Pass to runner
                choice.run();
                // Emit Event
                this._onDidRun.fire();
            });
            this._onDidRun = this._register(new event_1.Emitter());
            this.onDidRun = this._onDidRun.event;
            this._keepOpen = !!choice.keepOpen;
            this._menu = !choice.isSecondary && choice.menu ? choice.menu.map((c, index) => new ChoiceAction(`${id}.${index}`, c)) : undefined;
        }
        get menu() {
            return this._menu;
        }
        get keepOpen() {
            return this._keepOpen;
        }
    }
    exports.ChoiceAction = ChoiceAction;
    class StatusMessageViewItem {
        static create(notification, options) {
            if (!notification || (0, errors_1.isCancellationError)(notification)) {
                return undefined; // we need a message to show
            }
            let message;
            if (notification instanceof Error) {
                message = (0, errorMessage_1.toErrorMessage)(notification, false);
            }
            else if (typeof notification === 'string') {
                message = notification;
            }
            if (!message) {
                return undefined; // we need a message to show
            }
            return { message, options };
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vbm90aWZpY2F0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQ2hHLElBQWtCLHNCQXNCakI7SUF0QkQsV0FBa0Isc0JBQXNCO1FBRXZDOztXQUVHO1FBQ0gsaUVBQUcsQ0FBQTtRQUVIOzs7V0FHRztRQUNILHVFQUFNLENBQUE7UUFFTjs7V0FFRztRQUNILHlGQUFlLENBQUE7UUFFZjs7V0FFRztRQUNILHVFQUFNLENBQUE7SUFDUCxDQUFDLEVBdEJpQixzQkFBc0Isc0NBQXRCLHNCQUFzQixRQXNCdkM7SUEwQkQsSUFBa0IsdUJBR2pCO0lBSEQsV0FBa0IsdUJBQXVCO1FBQ3hDLG1FQUFHLENBQUE7UUFDSCx5RUFBTSxDQUFBO0lBQ1AsQ0FBQyxFQUhpQix1QkFBdUIsdUNBQXZCLHVCQUF1QixRQUd4QztJQW9CRCxNQUFhLGtCQUFtQixTQUFRLHNCQUFVO1FBUWpELFlBQTZCLElBQTJCLEVBQW1CLE9BQThDO1lBQ3hILEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQXVCO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQXVDO1lBTnhHLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDMUQsZUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1lBRTVCLDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVcsQ0FBQyxDQUFDO1lBQ3hFLDBCQUFxQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFLbEUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUV4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