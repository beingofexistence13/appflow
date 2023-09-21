/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, errors_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BroadcastDataChannel = void 0;
    class BroadcastDataChannel extends lifecycle_1.Disposable {
        constructor(channelName) {
            super();
            this.channelName = channelName;
            this._onDidReceiveData = this._register(new event_1.Emitter());
            this.onDidReceiveData = this._onDidReceiveData.event;
            // Use BroadcastChannel
            if ('BroadcastChannel' in window) {
                try {
                    this.broadcastChannel = new BroadcastChannel(channelName);
                    const listener = (event) => {
                        this._onDidReceiveData.fire(event.data);
                    };
                    this.broadcastChannel.addEventListener('message', listener);
                    this._register((0, lifecycle_1.toDisposable)(() => {
                        if (this.broadcastChannel) {
                            this.broadcastChannel.removeEventListener('message', listener);
                            this.broadcastChannel.close();
                        }
                    }));
                }
                catch (error) {
                    console.warn('Error while creating broadcast channel. Falling back to localStorage.', (0, errors_1.getErrorMessage)(error));
                }
            }
            // BroadcastChannel is not supported. Use storage.
            if (!this.broadcastChannel) {
                this.channelName = `BroadcastDataChannel.${channelName}`;
                this.createBroadcastChannel();
            }
        }
        createBroadcastChannel() {
            const listener = (event) => {
                if (event.key === this.channelName && event.newValue) {
                    this._onDidReceiveData.fire(JSON.parse(event.newValue));
                }
            };
            window.addEventListener('storage', listener);
            this._register((0, lifecycle_1.toDisposable)(() => window.removeEventListener('storage', listener)));
        }
        /**
         * Sends the data to other BroadcastChannel objects set up for this channel. Data can be structured objects, e.g. nested objects and arrays.
         * @param data data to broadcast
         */
        postData(data) {
            if (this.broadcastChannel) {
                this.broadcastChannel.postMessage(data);
            }
            else {
                // remove previous changes so that event is triggered even if new changes are same as old changes
                window.localStorage.removeItem(this.channelName);
                window.localStorage.setItem(this.channelName, JSON.stringify(data));
            }
        }
    }
    exports.BroadcastDataChannel = BroadcastDataChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvYWRjYXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2Jyb2FkY2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsTUFBYSxvQkFBd0IsU0FBUSxzQkFBVTtRQU90RCxZQUE2QixXQUFtQjtZQUMvQyxLQUFLLEVBQUUsQ0FBQztZQURvQixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtZQUgvQixzQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFLLENBQUMsQ0FBQztZQUM3RCxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBS3hELHVCQUF1QjtZQUN2QixJQUFJLGtCQUFrQixJQUFJLE1BQU0sRUFBRTtnQkFDakMsSUFBSTtvQkFDSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDMUQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFtQixFQUFFLEVBQUU7d0JBQ3hDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6QyxDQUFDLENBQUM7b0JBQ0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDNUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO3dCQUNoQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTs0QkFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQzs0QkFDL0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO3lCQUM5QjtvQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNKO2dCQUFDLE9BQU8sS0FBSyxFQUFFO29CQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUVBQXVFLEVBQUUsSUFBQSx3QkFBZSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQzlHO2FBQ0Q7WUFFRCxrREFBa0Q7WUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyx3QkFBd0IsV0FBVyxFQUFFLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2FBQzlCO1FBQ0YsQ0FBQztRQUVPLHNCQUFzQjtZQUM3QixNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQW1CLEVBQUUsRUFBRTtnQkFDeEMsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxXQUFXLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtvQkFDckQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUN4RDtZQUNGLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVEOzs7V0FHRztRQUNILFFBQVEsQ0FBQyxJQUFPO1lBQ2YsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDeEM7aUJBQU07Z0JBQ04saUdBQWlHO2dCQUNqRyxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2pELE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ3BFO1FBQ0YsQ0FBQztLQUNEO0lBM0RELG9EQTJEQyJ9