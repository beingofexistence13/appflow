define(["require", "exports", "stream", "vs/base/common/buffer"], function (require, exports, stream_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamSplitter = void 0;
    /**
     * A Transform stream that splits the input on the "splitter" substring.
     * The resulting chunks will contain (and trail with) the splitter match.
     * The last chunk when the stream ends will be emitted even if a splitter
     * is not encountered.
     */
    class StreamSplitter extends stream_1.Transform {
        constructor(splitter) {
            super();
            if (typeof splitter === 'number') {
                this.splitter = splitter;
                this.spitterLen = 1;
            }
            else {
                const buf = Buffer.isBuffer(splitter) ? splitter : Buffer.from(splitter);
                this.splitter = buf.length === 1 ? buf[0] : buf;
                this.spitterLen = buf.length;
            }
        }
        _transform(chunk, _encoding, callback) {
            if (!this.buffer) {
                this.buffer = chunk;
            }
            else {
                this.buffer = Buffer.concat([this.buffer, chunk]);
            }
            let offset = 0;
            while (offset < this.buffer.length) {
                const index = typeof this.splitter === 'number'
                    ? this.buffer.indexOf(this.splitter, offset)
                    : (0, buffer_1.binaryIndexOf)(this.buffer, this.splitter, offset);
                if (index === -1) {
                    break;
                }
                this.push(this.buffer.slice(offset, index + this.spitterLen));
                offset = index + this.spitterLen;
            }
            this.buffer = offset === this.buffer.length ? undefined : this.buffer.slice(offset);
            callback();
        }
        _flush(callback) {
            if (this.buffer) {
                this.push(this.buffer);
            }
            callback();
        }
    }
    exports.StreamSplitter = StreamSplitter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZVN0cmVhbXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL25vZGUvbm9kZVN0cmVhbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU9BOzs7OztPQUtHO0lBQ0gsTUFBYSxjQUFlLFNBQVEsa0JBQVM7UUFLNUMsWUFBWSxRQUFrQztZQUM3QyxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztnQkFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7YUFDcEI7aUJBQU07Z0JBQ04sTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO2FBQzdCO1FBQ0YsQ0FBQztRQUVRLFVBQVUsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsRUFBRSxRQUFvRDtZQUN6RyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDcEI7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ25DLE1BQU0sS0FBSyxHQUFHLE9BQU8sSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRO29CQUM5QyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7b0JBQzVDLENBQUMsQ0FBQyxJQUFBLHNCQUFhLEVBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDakIsTUFBTTtpQkFDTjtnQkFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQzlELE1BQU0sR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQzthQUNqQztZQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BGLFFBQVEsRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUVRLE1BQU0sQ0FBQyxRQUFvRDtZQUNuRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZCO1lBRUQsUUFBUSxFQUFFLENBQUM7UUFDWixDQUFDO0tBQ0Q7SUFoREQsd0NBZ0RDIn0=