/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer"], function (require, exports, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deserializeWebviewMessage = exports.serializeWebviewMessage = void 0;
    class ArrayBufferSet {
        constructor() {
            this.buffers = [];
        }
        add(buffer) {
            let index = this.buffers.indexOf(buffer);
            if (index < 0) {
                index = this.buffers.length;
                this.buffers.push(buffer);
            }
            return index;
        }
    }
    function serializeWebviewMessage(message, options) {
        if (options.serializeBuffersForPostMessage) {
            // Extract all ArrayBuffers from the message and replace them with references.
            const arrayBuffers = new ArrayBufferSet();
            const replacer = (_key, value) => {
                if (value instanceof ArrayBuffer) {
                    const index = arrayBuffers.add(value);
                    return {
                        $$vscode_array_buffer_reference$$: true,
                        index,
                    };
                }
                else if (ArrayBuffer.isView(value)) {
                    const type = getTypedArrayType(value);
                    if (type) {
                        const index = arrayBuffers.add(value.buffer);
                        return {
                            $$vscode_array_buffer_reference$$: true,
                            index,
                            view: {
                                type: type,
                                byteLength: value.byteLength,
                                byteOffset: value.byteOffset,
                            }
                        };
                    }
                }
                return value;
            };
            const serializedMessage = JSON.stringify(message, replacer);
            const buffers = arrayBuffers.buffers.map(arrayBuffer => {
                const bytes = new Uint8Array(arrayBuffer);
                return buffer_1.VSBuffer.wrap(bytes);
            });
            return { message: serializedMessage, buffers };
        }
        else {
            return { message: JSON.stringify(message), buffers: [] };
        }
    }
    exports.serializeWebviewMessage = serializeWebviewMessage;
    function getTypedArrayType(value) {
        switch (value.constructor.name) {
            case 'Int8Array': return 1 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int8Array */;
            case 'Uint8Array': return 2 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint8Array */;
            case 'Uint8ClampedArray': return 3 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint8ClampedArray */;
            case 'Int16Array': return 4 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int16Array */;
            case 'Uint16Array': return 5 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint16Array */;
            case 'Int32Array': return 6 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int32Array */;
            case 'Uint32Array': return 7 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint32Array */;
            case 'Float32Array': return 8 /* extHostProtocol.WebviewMessageArrayBufferViewType.Float32Array */;
            case 'Float64Array': return 9 /* extHostProtocol.WebviewMessageArrayBufferViewType.Float64Array */;
            case 'BigInt64Array': return 10 /* extHostProtocol.WebviewMessageArrayBufferViewType.BigInt64Array */;
            case 'BigUint64Array': return 11 /* extHostProtocol.WebviewMessageArrayBufferViewType.BigUint64Array */;
        }
        return undefined;
    }
    function deserializeWebviewMessage(jsonMessage, buffers) {
        const arrayBuffers = buffers.map(buffer => {
            const arrayBuffer = new ArrayBuffer(buffer.byteLength);
            const uint8Array = new Uint8Array(arrayBuffer);
            uint8Array.set(buffer.buffer);
            return arrayBuffer;
        });
        const reviver = !buffers.length ? undefined : (_key, value) => {
            if (value && typeof value === 'object' && value.$$vscode_array_buffer_reference$$) {
                const ref = value;
                const { index } = ref;
                const arrayBuffer = arrayBuffers[index];
                if (ref.view) {
                    switch (ref.view.type) {
                        case 1 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int8Array */: return new Int8Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int8Array.BYTES_PER_ELEMENT);
                        case 2 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint8Array */: return new Uint8Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint8Array.BYTES_PER_ELEMENT);
                        case 3 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint8ClampedArray */: return new Uint8ClampedArray(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint8ClampedArray.BYTES_PER_ELEMENT);
                        case 4 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int16Array */: return new Int16Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int16Array.BYTES_PER_ELEMENT);
                        case 5 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint16Array */: return new Uint16Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint16Array.BYTES_PER_ELEMENT);
                        case 6 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int32Array */: return new Int32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int32Array.BYTES_PER_ELEMENT);
                        case 7 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint32Array */: return new Uint32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint32Array.BYTES_PER_ELEMENT);
                        case 8 /* extHostProtocol.WebviewMessageArrayBufferViewType.Float32Array */: return new Float32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Float32Array.BYTES_PER_ELEMENT);
                        case 9 /* extHostProtocol.WebviewMessageArrayBufferViewType.Float64Array */: return new Float64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Float64Array.BYTES_PER_ELEMENT);
                        case 10 /* extHostProtocol.WebviewMessageArrayBufferViewType.BigInt64Array */: return new BigInt64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / BigInt64Array.BYTES_PER_ELEMENT);
                        case 11 /* extHostProtocol.WebviewMessageArrayBufferViewType.BigUint64Array */: return new BigUint64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / BigUint64Array.BYTES_PER_ELEMENT);
                        default: throw new Error('Unknown array buffer view type');
                    }
                }
                return arrayBuffer;
            }
            return value;
        };
        const message = JSON.parse(jsonMessage, reviver);
        return { message, arrayBuffers };
    }
    exports.deserializeWebviewMessage = deserializeWebviewMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdlYnZpZXdNZXNzYWdpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0V2Vidmlld01lc3NhZ2luZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBTSxjQUFjO1FBQXBCO1lBQ2lCLFlBQU8sR0FBa0IsRUFBRSxDQUFDO1FBVTdDLENBQUM7UUFSTyxHQUFHLENBQUMsTUFBbUI7WUFDN0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO2dCQUNkLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztnQkFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDMUI7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FDRDtJQUVELFNBQWdCLHVCQUF1QixDQUN0QyxPQUFZLEVBQ1osT0FBcUQ7UUFFckQsSUFBSSxPQUFPLENBQUMsOEJBQThCLEVBQUU7WUFDM0MsOEVBQThFO1lBQzlFLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7WUFFMUMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFZLEVBQUUsS0FBVSxFQUFFLEVBQUU7Z0JBQzdDLElBQUksS0FBSyxZQUFZLFdBQVcsRUFBRTtvQkFDakMsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDdEMsT0FBMkQ7d0JBQzFELGlDQUFpQyxFQUFFLElBQUk7d0JBQ3ZDLEtBQUs7cUJBQ0wsQ0FBQztpQkFDRjtxQkFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JB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