/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aY = exports.$_X = exports.$$X = exports.$0X = exports.$9X = exports.$8X = exports.$7X = exports.$6X = exports.$5X = exports.$4X = exports.$3X = exports.$2X = exports.$1X = exports.OutgoingViewModelEventKind = exports.$ZX = exports.$YX = void 0;
    class $YX extends lifecycle_1.$kc {
        constructor() {
            super();
            this.c = this.B(new event_1.$fd());
            this.onEvent = this.c.event;
            this.f = [];
            this.g = null;
            this.h = false;
            this.j = null;
            this.m = 0;
            this.n = [];
        }
        emitOutgoingEvent(e) {
            this.r(e);
            this.s();
        }
        r(e) {
            for (let i = 0, len = this.n.length; i < len; i++) {
                const mergeResult = (this.n[i].kind === e.kind ? this.n[i].attemptToMerge(e) : null);
                if (mergeResult) {
                    this.n[i] = mergeResult;
                    return;
                }
            }
            // not merged
            this.n.push(e);
        }
        s() {
            while (this.n.length > 0) {
                if (this.j || this.h) {
                    // right now collecting or emitting view events, so let's postpone emitting
                    return;
                }
                const event = this.n.shift();
                if (event.isNoOp()) {
                    continue;
                }
                this.c.fire(event);
            }
        }
        addViewEventHandler(eventHandler) {
            for (let i = 0, len = this.f.length; i < len; i++) {
                if (this.f[i] === eventHandler) {
                    console.warn('Detected duplicate listener in ViewEventDispatcher', eventHandler);
                }
            }
            this.f.push(eventHandler);
        }
        removeViewEventHandler(eventHandler) {
            for (let i = 0; i < this.f.length; i++) {
                if (this.f[i] === eventHandler) {
                    this.f.splice(i, 1);
                    break;
                }
            }
        }
        beginEmitViewEvents() {
            this.m++;
            if (this.m === 1) {
                this.j = new $ZX();
            }
            return this.j;
        }
        endEmitViewEvents() {
            this.m--;
            if (this.m === 0) {
                const outgoingEvents = this.j.outgoingEvents;
                const viewEvents = this.j.viewEvents;
                this.j = null;
                for (const outgoingEvent of outgoingEvents) {
                    this.r(outgoingEvent);
                }
                if (viewEvents.length > 0) {
                    this.t(viewEvents);
                }
            }
            this.s();
        }
        emitSingleViewEvent(event) {
            try {
                const eventsCollector = this.beginEmitViewEvents();
                eventsCollector.emitViewEvent(event);
            }
            finally {
                this.endEmitViewEvents();
            }
        }
        t(events) {
            if (this.g) {
                this.g = this.g.concat(events);
            }
            else {
                this.g = events;
            }
            if (!this.h) {
                this.u();
            }
        }
        u() {
            try {
                this.h = true;
                this.w();
            }
            finally {
                this.h = false;
            }
        }
        w() {
            while (this.g) {
                // Empty event queue, as events might come in while sending these off
                const events = this.g;
                this.g = null;
                // Use a clone of the event handlers list, as they might remove themselves
                const eventHandlers = this.f.slice(0);
                for (const eventHandler of eventHandlers) {
                    eventHandler.handleEvents(events);
                }
            }
        }
    }
    exports.$YX = $YX;
    class $ZX {
        constructor() {
            this.viewEvents = [];
            this.outgoingEvents = [];
        }
        emitViewEvent(event) {
            this.viewEvents.push(event);
        }
        emitOutgoingEvent(e) {
            this.outgoingEvents.push(e);
        }
    }
    exports.$ZX = $ZX;
    var OutgoingViewModelEventKind;
    (function (OutgoingViewModelEventKind) {
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ContentSizeChanged"] = 0] = "ContentSizeChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["FocusChanged"] = 1] = "FocusChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ScrollChanged"] = 2] = "ScrollChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ViewZonesChanged"] = 3] = "ViewZonesChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["HiddenAreasChanged"] = 4] = "HiddenAreasChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ReadOnlyEditAttempt"] = 5] = "ReadOnlyEditAttempt";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["CursorStateChanged"] = 6] = "CursorStateChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelDecorationsChanged"] = 7] = "ModelDecorationsChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelLanguageChanged"] = 8] = "ModelLanguageChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelLanguageConfigurationChanged"] = 9] = "ModelLanguageConfigurationChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelContentChanged"] = 10] = "ModelContentChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelOptionsChanged"] = 11] = "ModelOptionsChanged";
        OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelTokensChanged"] = 12] = "ModelTokensChanged";
    })(OutgoingViewModelEventKind || (exports.OutgoingViewModelEventKind = OutgoingViewModelEventKind = {}));
    class $1X {
        constructor(oldContentWidth, oldContentHeight, contentWidth, contentHeight) {
            this.kind = 0 /* OutgoingViewModelEventKind.ContentSizeChanged */;
            this.c = oldContentWidth;
            this.d = oldContentHeight;
            this.contentWidth = contentWidth;
            this.contentHeight = contentHeight;
            this.contentWidthChanged = (this.c !== this.contentWidth);
            this.contentHeightChanged = (this.d !== this.contentHeight);
        }
        isNoOp() {
            return (!this.contentWidthChanged && !this.contentHeightChanged);
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return new $1X(this.c, this.d, other.contentWidth, other.contentHeight);
        }
    }
    exports.$1X = $1X;
    class $2X {
        constructor(oldHasFocus, hasFocus) {
            this.kind = 1 /* OutgoingViewModelEventKind.FocusChanged */;
            this.oldHasFocus = oldHasFocus;
            this.hasFocus = hasFocus;
        }
        isNoOp() {
            return (this.oldHasFocus === this.hasFocus);
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return new $2X(this.oldHasFocus, other.hasFocus);
        }
    }
    exports.$2X = $2X;
    class $3X {
        constructor(oldScrollWidth, oldScrollLeft, oldScrollHeight, oldScrollTop, scrollWidth, scrollLeft, scrollHeight, scrollTop) {
            this.kind = 2 /* OutgoingViewModelEventKind.ScrollChanged */;
            this.c = oldScrollWidth;
            this.d = oldScrollLeft;
            this.f = oldScrollHeight;
            this.g = oldScrollTop;
            this.scrollWidth = scrollWidth;
            this.scrollLeft = scrollLeft;
            this.scrollHeight = scrollHeight;
            this.scrollTop = scrollTop;
            this.scrollWidthChanged = (this.c !== this.scrollWidth);
            this.scrollLeftChanged = (this.d !== this.scrollLeft);
            this.scrollHeightChanged = (this.f !== this.scrollHeight);
            this.scrollTopChanged = (this.g !== this.scrollTop);
        }
        isNoOp() {
            return (!this.scrollWidthChanged && !this.scrollLeftChanged && !this.scrollHeightChanged && !this.scrollTopChanged);
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return new $3X(this.c, this.d, this.f, this.g, other.scrollWidth, other.scrollLeft, other.scrollHeight, other.scrollTop);
        }
    }
    exports.$3X = $3X;
    class $4X {
        constructor() {
            this.kind = 3 /* OutgoingViewModelEventKind.ViewZonesChanged */;
        }
        isNoOp() {
            return false;
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return this;
        }
    }
    exports.$4X = $4X;
    class $5X {
        constructor() {
            this.kind = 4 /* OutgoingViewModelEventKind.HiddenAreasChanged */;
        }
        isNoOp() {
            return false;
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return this;
        }
    }
    exports.$5X = $5X;
    class $6X {
        constructor(oldSelections, selections, oldModelVersionId, modelVersionId, source, reason, reachedMaxCursorCount) {
            this.kind = 6 /* OutgoingViewModelEventKind.CursorStateChanged */;
            this.oldSelections = oldSelections;
            this.selections = selections;
            this.oldModelVersionId = oldModelVersionId;
            this.modelVersionId = modelVersionId;
            this.source = source;
            this.reason = reason;
            this.reachedMaxCursorCount = reachedMaxCursorCount;
        }
        static c(a, b) {
            if (!a && !b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            const aLen = a.length;
            const bLen = b.length;
            if (aLen !== bLen) {
                return false;
            }
            for (let i = 0; i < aLen; i++) {
                if (!a[i].equalsSelection(b[i])) {
                    return false;
                }
            }
            return true;
        }
        isNoOp() {
            return ($6X.c(this.oldSelections, this.selections)
                && this.oldModelVersionId === this.modelVersionId);
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return new $6X(this.oldSelections, other.selections, this.oldModelVersionId, other.modelVersionId, other.source, other.reason, this.reachedMaxCursorCount || other.reachedMaxCursorCount);
        }
    }
    exports.$6X = $6X;
    class $7X {
        constructor() {
            this.kind = 5 /* OutgoingViewModelEventKind.ReadOnlyEditAttempt */;
        }
        isNoOp() {
            return false;
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return this;
        }
    }
    exports.$7X = $7X;
    class $8X {
        constructor(event) {
            this.event = event;
            this.kind = 7 /* OutgoingViewModelEventKind.ModelDecorationsChanged */;
        }
        isNoOp() {
            return false;
        }
        attemptToMerge(other) {
            return null;
        }
    }
    exports.$8X = $8X;
    class $9X {
        constructor(event) {
            this.event = event;
            this.kind = 8 /* OutgoingViewModelEventKind.ModelLanguageChanged */;
        }
        isNoOp() {
            return false;
        }
        attemptToMerge(other) {
            return null;
        }
    }
    exports.$9X = $9X;
    class $0X {
        constructor(event) {
            this.event = event;
            this.kind = 9 /* OutgoingViewModelEventKind.ModelLanguageConfigurationChanged */;
        }
        isNoOp() {
            return false;
        }
        attemptToMerge(other) {
            return null;
        }
    }
    exports.$0X = $0X;
    class $$X {
        constructor(event) {
            this.event = event;
            this.kind = 10 /* OutgoingViewModelEventKind.ModelContentChanged */;
        }
        isNoOp() {
            return false;
        }
        attemptToMerge(other) {
            return null;
        }
    }
    exports.$$X = $$X;
    class $_X {
        constructor(event) {
            this.event = event;
            this.kind = 11 /* OutgoingViewModelEventKind.ModelOptionsChanged */;
        }
        isNoOp() {
            return false;
        }
        attemptToMerge(other) {
            return null;
        }
    }
    exports.$_X = $_X;
    class $aY {
        constructor(event) {
            this.event = event;
            this.kind = 12 /* OutgoingViewModelEventKind.ModelTokensChanged */;
        }
        isNoOp() {
            return false;
        }
        attemptToMerge(other) {
            return null;
        }
    }
    exports.$aY = $aY;
});
//# sourceMappingURL=viewModelEventDispatcher.js.map