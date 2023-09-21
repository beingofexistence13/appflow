define(["require", "exports", "stream", "vs/base/common/buffer"], function (require, exports, stream_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QS = void 0;
    /**
     * A Transform stream that splits the input on the "splitter" substring.
     * The resulting chunks will contain (and trail with) the splitter match.
     * The last chunk when the stream ends will be emitted even if a splitter
     * is not encountered.
     */
    class $QS extends stream_1.Transform {
        constructor(splitter) {
            super();
            if (typeof splitter === 'number') {
                this.b = splitter;
                this.c = 1;
            }
            else {
                const buf = Buffer.isBuffer(splitter) ? splitter : Buffer.from(splitter);
                this.b = buf.length === 1 ? buf[0] : buf;
                this.c = buf.length;
            }
        }
        _transform(chunk, _encoding, callback) {
            if (!this.a) {
                this.a = chunk;
            }
            else {
                this.a = Buffer.concat([this.a, chunk]);
            }
            let offset = 0;
            while (offset < this.a.length) {
                const index = typeof this.b === 'number'
                    ? this.a.indexOf(this.b, offset)
                    : (0, buffer_1.$Gd)(this.a, this.b, offset);
                if (index === -1) {
                    break;
                }
                this.push(this.a.slice(offset, index + this.c));
                offset = index + this.c;
            }
            this.a = offset === this.a.length ? undefined : this.a.slice(offset);
            callback();
        }
        _flush(callback) {
            if (this.a) {
                this.push(this.a);
            }
            callback();
        }
    }
    exports.$QS = $QS;
});
//# sourceMappingURL=nodeStreams.js.map