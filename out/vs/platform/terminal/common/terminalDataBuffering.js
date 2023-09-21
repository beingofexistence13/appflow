/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalDataBufferer = void 0;
    class TerminalDataBufferer {
        constructor(_callback) {
            this._callback = _callback;
            this._terminalBufferMap = new Map();
        }
        dispose() {
            for (const buffer of this._terminalBufferMap.values()) {
                buffer.dispose();
            }
        }
        startBuffering(id, event, throttleBy = 5) {
            const disposable = event((e) => {
                const data = (typeof e === 'string' ? e : e.data);
                let buffer = this._terminalBufferMap.get(id);
                if (buffer) {
                    buffer.data.push(data);
                    return;
                }
                const timeoutId = setTimeout(() => this.flushBuffer(id), throttleBy);
                buffer = {
                    data: [data],
                    timeoutId: timeoutId,
                    dispose: () => {
                        clearTimeout(timeoutId);
                        this.flushBuffer(id);
                        disposable.dispose();
                    }
                };
                this._terminalBufferMap.set(id, buffer);
            });
            return disposable;
        }
        stopBuffering(id) {
            const buffer = this._terminalBufferMap.get(id);
            buffer?.dispose();
        }
        flushBuffer(id) {
            const buffer = this._terminalBufferMap.get(id);
            if (buffer) {
                this._terminalBufferMap.delete(id);
                this._callback(id, buffer.data.join(''));
            }
        }
    }
    exports.TerminalDataBufferer = TerminalDataBufferer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxEYXRhQnVmZmVyaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsRGF0YUJ1ZmZlcmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBYSxvQkFBb0I7UUFHaEMsWUFBNkIsU0FBNkM7WUFBN0MsY0FBUyxHQUFULFNBQVMsQ0FBb0M7WUFGekQsdUJBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7UUFHNUUsQ0FBQztRQUVELE9BQU87WUFDTixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2pCO1FBQ0YsQ0FBQztRQUVELGNBQWMsQ0FBQyxFQUFVLEVBQUUsS0FBd0MsRUFBRSxhQUFxQixDQUFDO1lBRTFGLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQTZCLEVBQUUsRUFBRTtnQkFDMUQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLE1BQU0sRUFBRTtvQkFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdkIsT0FBTztpQkFDUDtnQkFFRCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDckUsTUFBTSxHQUFHO29CQUNSLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQztvQkFDWixTQUFTLEVBQUUsU0FBUztvQkFDcEIsT0FBTyxFQUFFLEdBQUcsRUFBRTt3QkFDYixZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3JCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDdEIsQ0FBQztpQkFDRCxDQUFDO2dCQUNGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztRQUVELGFBQWEsQ0FBQyxFQUFVO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0MsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUM7UUFFRCxXQUFXLENBQUMsRUFBVTtZQUNyQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLElBQUksTUFBTSxFQUFFO2dCQUNYLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDekM7UUFDRixDQUFDO0tBQ0Q7SUFqREQsb0RBaURDIn0=