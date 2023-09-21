/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IME = exports.IMEImpl = void 0;
    class IMEImpl {
        constructor() {
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._enabled = true;
        }
        get enabled() {
            return this._enabled;
        }
        /**
         * Enable IME
         */
        enable() {
            this._enabled = true;
            this._onDidChange.fire();
        }
        /**
         * Disable IME
         */
        disable() {
            this._enabled = false;
            this._onDidChange.fire();
        }
    }
    exports.IMEImpl = IMEImpl;
    exports.IME = new IMEImpl();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vaW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxNQUFhLE9BQU87UUFBcEI7WUFFa0IsaUJBQVksR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ3BDLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFFOUMsYUFBUSxHQUFHLElBQUksQ0FBQztRQXFCekIsQ0FBQztRQW5CQSxJQUFXLE9BQU87WUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRDs7V0FFRztRQUNJLE1BQU07WUFDWixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNyQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRDs7V0FFRztRQUNJLE9BQU87WUFDYixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUN0QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7S0FDRDtJQTFCRCwwQkEwQkM7SUFFWSxRQUFBLEdBQUcsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDIn0=