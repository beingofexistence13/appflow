/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "stream", "assert", "vs/base/node/nodeStreams"], function (require, exports, stream_1, assert, nodeStreams_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StreamSplitter', () => {
        test('should split a stream on a single character splitter', (done) => {
            const chunks = [];
            const splitter = new nodeStreams_1.$QS('\n');
            const writable = new stream_1.Writable({
                write(chunk, _encoding, callback) {
                    chunks.push(chunk.toString());
                    callback();
                },
            });
            splitter.pipe(writable);
            splitter.write('hello\nwor');
            splitter.write('ld\n');
            splitter.write('foo\nbar\nz');
            splitter.end(() => {
                assert.deepStrictEqual(chunks, ['hello\n', 'world\n', 'foo\n', 'bar\n', 'z']);
                done();
            });
        });
        test('should split a stream on a multi-character splitter', (done) => {
            const chunks = [];
            const splitter = new nodeStreams_1.$QS('---');
            const writable = new stream_1.Writable({
                write(chunk, _encoding, callback) {
                    chunks.push(chunk.toString());
                    callback();
                },
            });
            splitter.pipe(writable);
            splitter.write('hello---wor');
            splitter.write('ld---');
            splitter.write('foo---bar---z');
            splitter.end(() => {
                assert.deepStrictEqual(chunks, ['hello---', 'world---', 'foo---', 'bar---', 'z']);
                done();
            });
        });
    });
});
//# sourceMappingURL=nodeStreams.test.js.map