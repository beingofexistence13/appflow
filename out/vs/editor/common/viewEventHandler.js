/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewEventHandler = void 0;
    class ViewEventHandler extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._shouldRender = true;
        }
        shouldRender() {
            return this._shouldRender;
        }
        forceShouldRender() {
            this._shouldRender = true;
        }
        setShouldRender() {
            this._shouldRender = true;
        }
        onDidRender() {
            this._shouldRender = false;
        }
        // --- begin event handlers
        onCompositionStart(e) {
            return false;
        }
        onCompositionEnd(e) {
            return false;
        }
        onConfigurationChanged(e) {
            return false;
        }
        onCursorStateChanged(e) {
            return false;
        }
        onDecorationsChanged(e) {
            return false;
        }
        onFlushed(e) {
            return false;
        }
        onFocusChanged(e) {
            return false;
        }
        onLanguageConfigurationChanged(e) {
            return false;
        }
        onLineMappingChanged(e) {
            return false;
        }
        onLinesChanged(e) {
            return false;
        }
        onLinesDeleted(e) {
            return false;
        }
        onLinesInserted(e) {
            return false;
        }
        onRevealRangeRequest(e) {
            return false;
        }
        onScrollChanged(e) {
            return false;
        }
        onThemeChanged(e) {
            return false;
        }
        onTokensChanged(e) {
            return false;
        }
        onTokensColorsChanged(e) {
            return false;
        }
        onZonesChanged(e) {
            return false;
        }
        // --- end event handlers
        handleEvents(events) {
            let shouldRender = false;
            for (let i = 0, len = events.length; i < len; i++) {
                const e = events[i];
                switch (e.type) {
                    case 0 /* viewEvents.ViewEventType.ViewCompositionStart */:
                        if (this.onCompositionStart(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 1 /* viewEvents.ViewEventType.ViewCompositionEnd */:
                        if (this.onCompositionEnd(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 2 /* viewEvents.ViewEventType.ViewConfigurationChanged */:
                        if (this.onConfigurationChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 3 /* viewEvents.ViewEventType.ViewCursorStateChanged */:
                        if (this.onCursorStateChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 4 /* viewEvents.ViewEventType.ViewDecorationsChanged */:
                        if (this.onDecorationsChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 5 /* viewEvents.ViewEventType.ViewFlushed */:
                        if (this.onFlushed(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 6 /* viewEvents.ViewEventType.ViewFocusChanged */:
                        if (this.onFocusChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 7 /* viewEvents.ViewEventType.ViewLanguageConfigurationChanged */:
                        if (this.onLanguageConfigurationChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 8 /* viewEvents.ViewEventType.ViewLineMappingChanged */:
                        if (this.onLineMappingChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 9 /* viewEvents.ViewEventType.ViewLinesChanged */:
                        if (this.onLinesChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 10 /* viewEvents.ViewEventType.ViewLinesDeleted */:
                        if (this.onLinesDeleted(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 11 /* viewEvents.ViewEventType.ViewLinesInserted */:
                        if (this.onLinesInserted(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 12 /* viewEvents.ViewEventType.ViewRevealRangeRequest */:
                        if (this.onRevealRangeRequest(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 13 /* viewEvents.ViewEventType.ViewScrollChanged */:
                        if (this.onScrollChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 15 /* viewEvents.ViewEventType.ViewTokensChanged */:
                        if (this.onTokensChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 14 /* viewEvents.ViewEventType.ViewThemeChanged */:
                        if (this.onThemeChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 16 /* viewEvents.ViewEventType.ViewTokensColorsChanged */:
                        if (this.onTokensColorsChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    case 17 /* viewEvents.ViewEventType.ViewZonesChanged */:
                        if (this.onZonesChanged(e)) {
                            shouldRender = true;
                        }
                        break;
                    default:
                        console.info('View received unknown event: ');
                        console.info(e);
                }
            }
            if (shouldRender) {
                this._shouldRender = true;
            }
        }
    }
    exports.ViewEventHandler = ViewEventHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0V2ZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdmlld0V2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBYSxnQkFBaUIsU0FBUSxzQkFBVTtRQUkvQztZQUNDLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztRQUVNLFlBQVk7WUFDbEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzNCLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztRQUVTLGVBQWU7WUFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztRQUVNLFdBQVc7WUFDakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDNUIsQ0FBQztRQUVELDJCQUEyQjtRQUVwQixrQkFBa0IsQ0FBQyxDQUF1QztZQUNoRSxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDTSxnQkFBZ0IsQ0FBQyxDQUFxQztZQUM1RCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDTSxzQkFBc0IsQ0FBQyxDQUEyQztZQUN4RSxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDTSxvQkFBb0IsQ0FBQyxDQUF5QztZQUNwRSxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDTSxvQkFBb0IsQ0FBQyxDQUF5QztZQUNwRSxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDTSxTQUFTLENBQUMsQ0FBOEI7WUFDOUMsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ00sY0FBYyxDQUFDLENBQW1DO1lBQ3hELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUNNLDhC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