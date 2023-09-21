/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModelTokensChangedEvent = exports.ModelOptionsChangedEvent = exports.ModelContentChangedEvent = exports.ModelLanguageConfigurationChangedEvent = exports.ModelLanguageChangedEvent = exports.ModelDecorationsChangedEvent = exports.ReadOnlyEditAttemptEvent = exports.CursorStateChangedEvent = exports.HiddenAreasChangedEvent = exports.ViewZonesChangedEvent = exports.ScrollChangedEvent = exports.FocusChangedEvent = exports.ContentSizeChangedEvent = exports.OutgoingViewModelEventKind = exports.ViewModelEventsCollector = exports.ViewModelEventDispatcher = void 0;
    class ViewModelEventDispatcher extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onEvent = this._register(new event_1.Emitter());
            this.onEvent = this._onEvent.event;
            this._eventHandlers = [];
            this._viewEventQueue = null;
            this._isConsumingViewEventQueue = false;
            this._collector = null;
            this._collectorCnt = 0;
            this._outgoingEvents = [];
        }
        emitOutgoingEvent(e) {
            this._addOutgoingEvent(e);
            this._emitOutgoingEvents();
        }
        _addOutgoingEvent(e) {
            for (let i = 0, len = this._outgoingEvents.length; i < len; i++) {
                const mergeResult = (this._outgoingEvents[i].kind === e.kind ? this._outgoingEvents[i].attemptToMerge(e) : null);
                if (mergeResult) {
                    this._outgoingEvents[i] = mergeResult;
                    return;
                }
            }
            // not merged
            this._outgoingEvents.push(e);
        }
        _emitOutgoingEvents() {
            while (this._outgoingEvents.length > 0) {
                if (this._collector || this._isConsumingViewEventQueue) {
                    // right now collecting or emitting view events, so let's postpone emitting
                    return;
                }
                const event = this._outgoingEvents.shift();
                if (event.isNoOp()) {
                    continue;
                }
                this._onEvent.fire(event);
            }
        }
        addViewEventHandler(eventHandler) {
            for (let i = 0, len = this._eventHandlers.length; i < len; i++) {
                if (this._eventHandlers[i] === eventHandler) {
                    console.warn('Detected duplicate listener in ViewEventDispatcher', eventHandler);
                }
            }
            this._eventHandlers.push(eventHandler);
        }
        removeViewEventHandler(eventHandler) {
            for (let i = 0; i < this._eventHandlers.length; i++) {
                if (this._eventHandlers[i] === eventHandler) {
                    this._eventHandlers.splice(i, 1);
                    break;
                }
            }
        }
        beginEmitViewEvents() {
            this._collectorCnt++;
            if (this._collectorCnt === 1) {
                this._collector = new ViewModelEventsCollector();
            }
            return this._collector;
        }
        endEmitViewEvents() {
            this._collectorCnt--;
            if (this._collectorCnt === 0) {
                const outgoingEvents = this._collector.outgoingEvents;
                const viewEvents = this._collector.viewEvents;
                this._collector = null;
                for (const outgoingEvent of outgoingEvents) {
                    this._addOutgoingEvent(outgoingEvent);
                }
                if (viewEvents.length > 0) {
                    this._emitMany(viewEvents);
                }
            }
            this._emitOutgoingEvents();
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
        _emitMany(events) {
            if (this._viewEventQueue) {
                this._viewEventQueue = this._viewEventQueue.concat(events);
            }
            else {
                this._viewEventQueue = events;
            }
            if (!this._isConsumingViewEventQueue) {
                this._consumeViewEventQueue();
            }
        }
        _consumeViewEventQueue() {
            try {
                this._isConsumingViewEventQueue = true;
                this._doConsumeQueue();
            }
            finally {
                this._isConsumingViewEventQueue = false;
            }
        }
        _doConsumeQueue() {
            while (this._viewEventQueue) {
                // Empty event queue, as events might come in while sending these off
                const events = this._viewEventQueue;
                this._viewEventQueue = null;
                // Use a clone of the event handlers list, as they might remove themselves
                const eventHandlers = this._eventHandlers.slice(0);
                for (const eventHandler of eventHandlers) {
                    eventHandler.handleEvents(events);
                }
            }
        }
    }
    exports.ViewModelEventDispatcher = ViewModelEventDispatcher;
    class ViewModelEventsCollector {
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
    exports.ViewModelEventsCollector = ViewModelEventsCollector;
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
    class ContentSizeChangedEvent {
        constructor(oldContentWidth, oldContentHeight, contentWidth, contentHeight) {
            this.kind = 0 /* OutgoingViewModelEventKind.ContentSizeChanged */;
            this._oldContentWidth = oldContentWidth;
            this._oldContentHeight = oldContentHeight;
            this.contentWidth = contentWidth;
            this.contentHeight = contentHeight;
            this.contentWidthChanged = (this._oldContentWidth !== this.contentWidth);
            this.contentHeightChanged = (this._oldContentHeight !== this.contentHeight);
        }
        isNoOp() {
            return (!this.contentWidthChanged && !this.contentHeightChanged);
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return new ContentSizeChangedEvent(this._oldContentWidth, this._oldContentHeight, other.contentWidth, other.contentHeight);
        }
    }
    exports.ContentSizeChangedEvent = ContentSizeChangedEvent;
    class FocusChangedEvent {
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
            return new FocusChangedEvent(this.oldHasFocus, other.hasFocus);
        }
    }
    exports.FocusChangedEvent = FocusChangedEvent;
    class ScrollChangedEvent {
        constructor(oldScrollWidth, oldScrollLeft, oldScrollHeight, oldScrollTop, scrollWidth, scrollLeft, scrollHeight, scrollTop) {
            this.kind = 2 /* OutgoingViewModelEventKind.ScrollChanged */;
            this._oldScrollWidth = oldScrollWidth;
            this._oldScrollLeft = oldScrollLeft;
            this._oldScrollHeight = oldScrollHeight;
            this._oldScrollTop = oldScrollTop;
            this.scrollWidth = scrollWidth;
            this.scrollLeft = scrollLeft;
            this.scrollHeight = scrollHeight;
            this.scrollTop = scrollTop;
            this.scrollWidthChanged = (this._oldScrollWidth !== this.scrollWidth);
            this.scrollLeftChanged = (this._oldScrollLeft !== this.scrollLeft);
            this.scrollHeightChanged = (this._oldScrollHeight !== this.scrollHeight);
            this.scrollTopChanged = (this._oldScrollTop !== this.scrollTop);
        }
        isNoOp() {
            return (!this.scrollWidthChanged && !this.scrollLeftChanged && !this.scrollHeightChanged && !this.scrollTopChanged);
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return new ScrollChangedEvent(this._oldScrollWidth, this._oldScrollLeft, this._oldScrollHeight, this._oldScrollTop, other.scrollWidth, other.scrollLeft, other.scrollHeight, other.scrollTop);
        }
    }
    exports.ScrollChangedEvent = ScrollChangedEvent;
    class ViewZonesChangedEvent {
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
    exports.ViewZonesChangedEvent = ViewZonesChangedEvent;
    class HiddenAreasChangedEvent {
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
    exports.HiddenAreasChangedEvent = HiddenAreasChangedEvent;
    class CursorStateChangedEvent {
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
        static _selectionsAreEqual(a, b) {
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
            return (CursorStateChangedEvent._selectionsAreEqual(this.oldSelections, this.selections)
                && this.oldModelVersionId === this.modelVersionId);
        }
        attemptToMerge(other) {
            if (other.kind !== this.kind) {
                return null;
            }
            return new CursorStateChangedEvent(this.oldSelections, other.selections, this.oldModelVersionId, other.modelVersionId, other.source, other.reason, this.reachedMaxCursorCount || other.reachedMaxCursorCount);
        }
    }
    exports.CursorStateChangedEvent = CursorStateChangedEvent;
    class ReadOnlyEditAttemptEvent {
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
    exports.ReadOnlyEditAttemptEvent = ReadOnlyEditAttemptEvent;
    class ModelDecorationsChangedEvent {
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
    exports.ModelDecorationsChangedEvent = ModelDecorationsChangedEvent;
    class ModelLanguageChangedEvent {
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
    exports.ModelLanguageChangedEvent = ModelLanguageChangedEvent;
    class ModelLanguageConfigurationChangedEvent {
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
    exports.ModelLanguageConfigurationChangedEvent = ModelLanguageConfigurationChangedEvent;
    class ModelContentChangedEvent {
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
    exports.ModelContentChangedEvent = ModelContentChangedEvent;
    class ModelOptionsChangedEvent {
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
    exports.ModelOptionsChangedEvent = ModelOptionsChangedEvent;
    class ModelTokensChangedEvent {
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
    exports.ModelTokensChangedEvent = ModelTokensChangedEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld01vZGVsRXZlbnREaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi92aWV3TW9kZWxFdmVudERpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEsd0JBQXlCLFNBQVEsc0JBQVU7UUFZdkQ7WUFDQyxLQUFLLEVBQUUsQ0FBQztZQVhRLGFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUEwQixDQUFDLENBQUM7WUFDbEUsWUFBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBVzdDLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQzVCLElBQUksQ0FBQywwQkFBMEIsR0FBRyxLQUFLLENBQUM7WUFDeEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVNLGlCQUFpQixDQUFDLENBQXlCO1lBQ2pELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU8saUJBQWlCLENBQUMsQ0FBeUI7WUFDbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hFLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtB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