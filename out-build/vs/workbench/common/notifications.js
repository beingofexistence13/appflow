/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/notification/common/notification", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/linkedText"], function (require, exports, notification_1, errorMessage_1, event_1, lifecycle_1, errors_1, actions_1, arrays_1, linkedText_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pzb = exports.$Ozb = exports.$Nzb = exports.NotificationViewItemContentChangeKind = exports.$Mzb = exports.$Lzb = exports.$Kzb = exports.StatusMessageChangeType = exports.NotificationChangeType = void 0;
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
    class $Kzb extends lifecycle_1.$kc {
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
            this.a = this.B(new event_1.$fd());
            this.onDidClose = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.b.event;
            this.h();
        }
        h() {
            // Visibility
            this.B(this.f.onDidChangeVisibility(visible => this.b.fire(visible)));
            // Closing
            event_1.Event.once(this.f.onDidClose)(() => {
                this.a.fire();
                this.dispose();
            });
        }
        get progress() {
            return this.f.progress;
        }
        updateSeverity(severity) {
            this.f.updateSeverity(severity);
        }
        updateMessage(message) {
            this.f.updateMessage(message);
        }
        updateActions(actions) {
            this.f.updateActions(actions);
        }
        close() {
            this.g(this.f);
            this.dispose();
        }
    }
    exports.$Kzb = $Kzb;
    class $Lzb extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.b = this.B(new event_1.$fd());
            this.onDidChangeNotification = this.b.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeStatusMessage = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeFilter = this.g.event;
            this.h = [];
            this.m = notification_1.NotificationsFilter.OFF;
        }
        static { this.a = new notification_1.$Zu(); }
        get notifications() { return this.h; }
        get statusMessage() { return this.j; }
        setFilter(filter) {
            this.m = filter;
            this.g.fire(filter);
        }
        addNotification(notification) {
            const item = this.s(notification);
            if (!item) {
                return $Lzb.a; // return early if this is a no-op
            }
            // Deduplicate
            const duplicate = this.r(item);
            duplicate?.close();
            // Add to list as first entry
            this.h.splice(0, 0, item);
            // Events
            this.b.fire({ item, index: 0, kind: 0 /* NotificationChangeType.ADD */ });
            // Wrap into handle
            return new $Kzb(item, item => this.n(item));
        }
        n(item) {
            const liveItem = this.r(item);
            if (liveItem && liveItem !== item) {
                liveItem.close(); // item could have been replaced with another one, make sure to close the live item
            }
            else {
                item.close(); // otherwise just close the item that was passed in
            }
        }
        r(item) {
            return this.h.find(notification => notification.equals(item));
        }
        s(notification) {
            const item = $Ozb.create(notification, this.m);
            if (!item) {
                return undefined;
            }
            // Item Events
            const fireNotificationChangeEvent = (kind, detail) => {
                const index = this.h.indexOf(item);
                if (index >= 0) {
                    this.b.fire({ item, index, kind, detail });
                }
            };
            const itemExpansionChangeListener = item.onDidChangeExpansion(() => fireNotificationChangeEvent(2 /* NotificationChangeType.EXPAND_COLLAPSE */));
            const itemContentChangeListener = item.onDidChangeContent(e => fireNotificationChangeEvent(1 /* NotificationChangeType.CHANGE */, e.kind));
            event_1.Event.once(item.onDidClose)(() => {
                itemExpansionChangeListener.dispose();
                itemContentChangeListener.dispose();
                const index = this.h.indexOf(item);
                if (index >= 0) {
                    this.h.splice(index, 1);
                    this.b.fire({ item, index, kind: 3 /* NotificationChangeType.REMOVE */ });
                }
            });
            return item;
        }
        showStatusMessage(message, options) {
            const item = StatusMessageViewItem.create(message, options);
            if (!item) {
                return lifecycle_1.$kc.None;
            }
            // Remember as current status message and fire events
            this.j = item;
            this.f.fire({ kind: 0 /* StatusMessageChangeType.ADD */, item });
            return (0, lifecycle_1.$ic)(() => {
                // Only reset status message if the item is still the one we had remembered
                if (this.j === item) {
                    this.j = undefined;
                    this.f.fire({ kind: 1 /* StatusMessageChangeType.REMOVE */, item });
                }
            });
        }
    }
    exports.$Lzb = $Lzb;
    function $Mzb(obj) {
        return obj instanceof $Ozb;
    }
    exports.$Mzb = $Mzb;
    var NotificationViewItemContentChangeKind;
    (function (NotificationViewItemContentChangeKind) {
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["SEVERITY"] = 0] = "SEVERITY";
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["MESSAGE"] = 1] = "MESSAGE";
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["ACTIONS"] = 2] = "ACTIONS";
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["PROGRESS"] = 3] = "PROGRESS";
    })(NotificationViewItemContentChangeKind || (exports.NotificationViewItemContentChangeKind = NotificationViewItemContentChangeKind = {}));
    class $Nzb extends lifecycle_1.$kc {
        constructor() {
            super();
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.a = Object.create(null);
        }
        get state() {
            return this.a;
        }
        infinite() {
            if (this.a.infinite) {
                return;
            }
            this.a.infinite = true;
            this.a.total = undefined;
            this.a.worked = undefined;
            this.a.done = undefined;
            this.b.fire();
        }
        done() {
            if (this.a.done) {
                return;
            }
            this.a.done = true;
            this.a.infinite = undefined;
            this.a.total = undefined;
            this.a.worked = undefined;
            this.b.fire();
        }
        total(value) {
            if (this.a.total === value) {
                return;
            }
            this.a.total = value;
            this.a.infinite = undefined;
            this.a.done = undefined;
            this.b.fire();
        }
        worked(value) {
            if (typeof this.a.worked === 'number') {
                this.a.worked += value;
            }
            else {
                this.a.worked = value;
            }
            this.a.infinite = undefined;
            this.a.done = undefined;
            this.b.fire();
        }
    }
    exports.$Nzb = $Nzb;
    class $Ozb extends lifecycle_1.$kc {
        static { this.a = 1000; }
        static create(notification, filter = notification_1.NotificationsFilter.OFF) {
            if (!notification || !notification.message || (0, errors_1.$2)(notification.message)) {
                return undefined; // we need a message to show
            }
            let severity;
            if (typeof notification.severity === 'number') {
                severity = notification.severity;
            }
            else {
                severity = notification_1.Severity.Info;
            }
            const message = $Ozb.s(notification.message);
            if (!message) {
                return undefined; // we need a message to show
            }
            let actions;
            if (notification.actions) {
                actions = notification.actions;
            }
            else if ((0, errorMessage_1.$ni)(notification.message)) {
                actions = { primary: notification.message.actions };
            }
            let priority = notification.priority ?? notification_1.NotificationPriority.DEFAULT;
            if (priority === notification_1.NotificationPriority.DEFAULT && (filter === notification_1.NotificationsFilter.SILENT || (filter === notification_1.NotificationsFilter.ERROR && notification.severity !== notification_1.Severity.Error))) {
                priority = notification_1.NotificationPriority.SILENT;
            }
            return new $Ozb(notification.id, severity, notification.sticky, priority, message, notification.source, notification.progress, actions);
        }
        static s(input) {
            let message;
            if (input instanceof Error) {
                message = (0, errorMessage_1.$mi)(input, false);
            }
            else if (typeof input === 'string') {
                message = input;
            }
            if (!message) {
                return undefined; // we need a message to show
            }
            const raw = message;
            // Make sure message is in the limits
            if (message.length > $Ozb.a) {
                message = `${message.substr(0, $Ozb.a)}...`;
            }
            // Remove newlines from messages as we do not support that and it makes link parsing hard
            message = message.replace(/(\r\n|\n|\r)/gm, ' ').trim();
            // Parse Links
            const linkedText = (0, linkedText_1.$IS)(message);
            return { raw, linkedText, original: input };
        }
        constructor(id, t, u, w, y, z, progress, actions) {
            super();
            this.id = id;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.f = false;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeExpansion = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidClose = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeContent = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.r.event;
            if (progress) {
                this.C(progress);
            }
            this.D(actions);
        }
        C(progress) {
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
        D(actions = { primary: [], secondary: [] }) {
            this.g = {
                primary: Array.isArray(actions.primary) ? actions.primary : [],
                secondary: Array.isArray(actions.secondary) ? actions.secondary : []
            };
            this.b = actions.primary && actions.primary.length > 0;
        }
        get canCollapse() {
            return !this.F;
        }
        get expanded() {
            return !!this.b;
        }
        get severity() {
            return this.t;
        }
        get sticky() {
            if (this.u) {
                return true; // explicitly sticky
            }
            const hasActions = this.F;
            if ((hasActions && this.t === notification_1.Severity.Error) || // notification errors with actions are sticky
                (!hasActions && this.b) || // notifications that got expanded are sticky
                (this.h && !this.h.state.done) // notifications with running progress are sticky
            ) {
                return true;
            }
            return false; // not sticky
        }
        get priority() {
            return this.w;
        }
        get F() {
            if (!this.g) {
                return false;
            }
            if (!this.g.primary) {
                return false;
            }
            return this.g.primary.length > 0;
        }
        get hasProgress() {
            return !!this.h;
        }
        get progress() {
            if (!this.h) {
                this.h = this.B(new $Nzb());
                this.B(this.h.onDidChange(() => this.n.fire({ kind: 3 /* NotificationViewItemContentChangeKind.PROGRESS */ })));
            }
            return this.h;
        }
        get message() {
            return this.y;
        }
        get source() {
            return typeof this.z === 'string' ? this.z : (this.z ? this.z.label : undefined);
        }
        get sourceId() {
            return (this.z && typeof this.z !== 'string' && 'id' in this.z) ? this.z.id : undefined;
        }
        get actions() {
            return this.g;
        }
        get visible() {
            return this.f;
        }
        updateSeverity(severity) {
            if (severity === this.t) {
                return;
            }
            this.t = severity;
            this.n.fire({ kind: 0 /* NotificationViewItemContentChangeKind.SEVERITY */ });
        }
        updateMessage(input) {
            const message = $Ozb.s(input);
            if (!message || message.raw === this.y.raw) {
                return;
            }
            this.y = message;
            this.n.fire({ kind: 1 /* NotificationViewItemContentChangeKind.MESSAGE */ });
        }
        updateActions(actions) {
            this.D(actions);
            this.n.fire({ kind: 2 /* NotificationViewItemContentChangeKind.ACTIONS */ });
        }
        updateVisibility(visible) {
            if (this.f !== visible) {
                this.f = visible;
                this.r.fire(visible);
            }
        }
        expand() {
            if (this.b || !this.canCollapse) {
                return;
            }
            this.b = true;
            this.j.fire();
        }
        collapse(skipEvents) {
            if (!this.b || !this.canCollapse) {
                return;
            }
            this.b = false;
            if (!skipEvents) {
                this.j.fire();
            }
        }
        toggle() {
            if (this.b) {
                this.collapse();
            }
            else {
                this.expand();
            }
        }
        close() {
            this.m.fire();
            this.dispose();
        }
        equals(other) {
            if (this.hasProgress || other.hasProgress) {
                return false;
            }
            if (typeof this.id === 'string' || typeof other.id === 'string') {
                return this.id === other.id;
            }
            if (typeof this.z === 'object') {
                if (this.z.label !== other.source || this.z.id !== other.sourceId) {
                    return false;
                }
            }
            else if (this.z !== other.source) {
                return false;
            }
            if (this.y.raw !== other.message.raw) {
                return false;
            }
            const primaryActions = (this.g && this.g.primary) || [];
            const otherPrimaryActions = (other.actions && other.actions.primary) || [];
            return (0, arrays_1.$sb)(primaryActions, otherPrimaryActions, (action, otherAction) => (action.id + action.label) === (otherAction.id + otherAction.label));
        }
    }
    exports.$Ozb = $Ozb;
    class $Pzb extends actions_1.$gi {
        constructor(id, choice) {
            super(id, choice.label, undefined, true, async () => {
                // Pass to runner
                choice.run();
                // Emit Event
                this.a.fire();
            });
            this.a = this.B(new event_1.$fd());
            this.onDidRun = this.a.event;
            this.b = !!choice.keepOpen;
            this.f = !choice.isSecondary && choice.menu ? choice.menu.map((c, index) => new $Pzb(`${id}.${index}`, c)) : undefined;
        }
        get menu() {
            return this.f;
        }
        get keepOpen() {
            return this.b;
        }
    }
    exports.$Pzb = $Pzb;
    class StatusMessageViewItem {
        static create(notification, options) {
            if (!notification || (0, errors_1.$2)(notification)) {
                return undefined; // we need a message to show
            }
            let message;
            if (notification instanceof Error) {
                message = (0, errorMessage_1.$mi)(notification, false);
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
//# sourceMappingURL=notifications.js.map