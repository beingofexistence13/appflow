/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/event", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/workbench/contrib/debug/common/debugModel"], function (require, exports, assert, buffer_1, event_1, mock_1, utils_1, debugModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Memory', () => {
        const dapResponseCommon = {
            command: 'someCommand',
            type: 'response',
            seq: 1,
            request_seq: 1,
            success: true,
        };
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('MemoryRegion', () => {
            let memory;
            let unreadable;
            let invalidateMemoryEmitter;
            let session;
            let region;
            setup(() => {
                const memoryBuf = new Uint8Array(1024);
                for (let i = 0; i < memoryBuf.length; i++) {
                    memoryBuf[i] = i; // will be 0-255
                }
                memory = buffer_1.VSBuffer.wrap(memoryBuf);
                invalidateMemoryEmitter = new event_1.Emitter();
                unreadable = 0;
                session = (0, mock_1.mockObject)()({
                    onDidInvalidateMemory: invalidateMemoryEmitter.event
                });
                session.readMemory.callsFake((ref, fromOffset, count) => {
                    const res = ({
                        ...dapResponseCommon,
                        body: {
                            address: '0',
                            data: (0, buffer_1.encodeBase64)(memory.slice(fromOffset, fromOffset + Math.max(0, count - unreadable))),
                            unreadableBytes: unreadable
                        }
                    });
                    unreadable = 0;
                    return Promise.resolve(res);
                });
                session.writeMemory.callsFake((ref, fromOffset, data) => {
                    const decoded = (0, buffer_1.decodeBase64)(data);
                    for (let i = 0; i < decoded.byteLength; i++) {
                        memory.buffer[fromOffset + i] = decoded.buffer[i];
                    }
                    return ({
                        ...dapResponseCommon,
                        body: {
                            bytesWritten: decoded.byteLength,
                            offset: fromOffset,
                        }
                    });
                });
                region = new debugModel_1.MemoryRegion('ref', session);
            });
            teardown(() => {
                region.dispose();
            });
            test('reads a simple range', async () => {
                assert.deepStrictEqual(await region.read(10, 14), [
                    { type: 0 /* MemoryRangeType.Valid */, offset: 10, length: 4, data: buffer_1.VSBuffer.wrap(new Uint8Array([10, 11, 12, 13])) }
                ]);
            });
            test('reads a non-contiguous range', async () => {
                unreadable = 3;
                assert.deepStrictEqual(await region.read(10, 14), [
                    { type: 0 /* MemoryRangeType.Valid */, offset: 10, length: 1, data: buffer_1.VSBuffer.wrap(new Uint8Array([10])) },
                    { type: 1 /* MemoryRangeType.Unreadable */, offset: 11, length: 3 },
                ]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdNZW1vcnkudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL3Rlc3QvYnJvd3Nlci9kZWJ1Z01lbW9yeS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBV2hHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7UUFDNUIsTUFBTSxpQkFBaUIsR0FBRztZQUN6QixPQUFPLEVBQUUsYUFBYTtZQUN0QixJQUFJLEVBQUUsVUFBVTtZQUNoQixHQUFHLEVBQUUsQ0FBQztZQUNOLFdBQVcsRUFBRSxDQUFDO1lBQ2QsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO1FBRUYsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBQzFCLElBQUksTUFBZ0IsQ0FBQztZQUNyQixJQUFJLFVBQWtCLENBQUM7WUFDdkIsSUFBSSx1QkFBMkQsQ0FBQztZQUNoRSxJQUFJLE9BQXlELENBQUM7WUFDOUQsSUFBSSxNQUFvQixDQUFDO1lBRXpCLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ1YsTUFBTSxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMxQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCO2lCQUNsQztnQkFDRCxNQUFNLEdBQUcsaUJBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2xDLHVCQUF1QixHQUFHLElBQUksZUFBTyxFQUFFLENBQUM7Z0JBQ3hDLFVBQVUsR0FBRyxDQUFDLENBQUM7Z0JBRWYsT0FBTyxH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