/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/stream", "vs/base/common/buffer", "vs/amdX", "vs/base/common/cancellation"], function (require, exports, stream_1, buffer_1, amdX_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SUPPORTED_ENCODINGS = exports.detectEncodingFromBuffer = exports.toCanonicalName = exports.detectEncodingByBOMFromBuffer = exports.toNodeEncoding = exports.encodingExists = exports.toEncodeReadable = exports.toDecodeStream = exports.DecodeStreamError = exports.DecodeStreamErrorKind = exports.UTF8_BOM = exports.UTF16le_BOM = exports.UTF16be_BOM = exports.isUTFEncoding = exports.UTF16le = exports.UTF16be = exports.UTF8_with_bom = exports.UTF8 = void 0;
    exports.UTF8 = 'utf8';
    exports.UTF8_with_bom = 'utf8bom';
    exports.UTF16be = 'utf16be';
    exports.UTF16le = 'utf16le';
    function isUTFEncoding(encoding) {
        return [exports.UTF8, exports.UTF8_with_bom, exports.UTF16be, exports.UTF16le].some(utfEncoding => utfEncoding === encoding);
    }
    exports.isUTFEncoding = isUTFEncoding;
    exports.UTF16be_BOM = [0xFE, 0xFF];
    exports.UTF16le_BOM = [0xFF, 0xFE];
    exports.UTF8_BOM = [0xEF, 0xBB, 0xBF];
    const ZERO_BYTE_DETECTION_BUFFER_MAX_LEN = 512; // number of bytes to look at to decide about a file being binary or not
    const NO_ENCODING_GUESS_MIN_BYTES = 512; // when not auto guessing the encoding, small number of bytes are enough
    const AUTO_ENCODING_GUESS_MIN_BYTES = 512 * 8; // with auto guessing we want a lot more content to be read for guessing
    const AUTO_ENCODING_GUESS_MAX_BYTES = 512 * 128; // set an upper limit for the number of bytes we pass on to jschardet
    var DecodeStreamErrorKind;
    (function (DecodeStreamErrorKind) {
        /**
         * Error indicating that the stream is binary even
         * though `acceptTextOnly` was specified.
         */
        DecodeStreamErrorKind[DecodeStreamErrorKind["STREAM_IS_BINARY"] = 1] = "STREAM_IS_BINARY";
    })(DecodeStreamErrorKind || (exports.DecodeStreamErrorKind = DecodeStreamErrorKind = {}));
    class DecodeStreamError extends Error {
        constructor(message, decodeStreamErrorKind) {
            super(message);
            this.decodeStreamErrorKind = decodeStreamErrorKind;
        }
    }
    exports.DecodeStreamError = DecodeStreamError;
    class DecoderStream {
        /**
         * This stream will only load iconv-lite lazily if the encoding
         * is not UTF-8. This ensures that for most common cases we do
         * not pay the price of loading the module from disk.
         *
         * We still need to be careful when converting UTF-8 to a string
         * though because we read the file in chunks of Buffer and thus
         * need to decode it via TextDecoder helper that is available
         * in browser and node.js environments.
         */
        static async create(encoding) {
            let decoder = undefined;
            if (encoding !== exports.UTF8) {
                const iconv = await (0, amdX_1.importAMDNodeModule)('@vscode/iconv-lite-umd', 'lib/iconv-lite-umd.js');
                decoder = iconv.getDecoder(toNodeEncoding(encoding));
            }
            else {
                const utf8TextDecoder = new TextDecoder();
                decoder = {
                    write(buffer) {
                        return utf8TextDecoder.decode(buffer, {
                            // Signal to TextDecoder that potentially more data is coming
                            // and that we are calling `decode` in the end to consume any
                            // remainders
                            stream: true
                        });
                    },
                    end() {
                        return utf8TextDecoder.decode();
                    }
                };
            }
            return new DecoderStream(decoder);
        }
        constructor(iconvLiteDecoder) {
            this.iconvLiteDecoder = iconvLiteDecoder;
        }
        write(buffer) {
            return this.iconvLiteDecoder.write(buffer);
        }
        end() {
            return this.iconvLiteDecoder.end();
        }
    }
    function toDecodeStream(source, options) {
        const minBytesRequiredForDetection = options.minBytesRequiredForDetection ?? options.guessEncoding ? AUTO_ENCODING_GUESS_MIN_BYTES : NO_ENCODING_GUESS_MIN_BYTES;
        return new Promise((resolve, reject) => {
            const target = (0, stream_1.newWriteableStream)(strings => strings.join(''));
            const bufferedChunks = [];
            let bytesBuffered = 0;
            let decoder = undefined;
            const cts = new cancellation_1.CancellationTokenSource();
            const createDecoder = async () => {
                try {
                    // detect encoding from buffer
                    const detected = await detectEncodingFromBuffer({
                        buffer: buffer_1.VSBuffer.concat(bufferedChunks),
                        bytesRead: bytesBuffered
                    }, options.guessEncoding);
                    // throw early if the source seems binary and
                    // we are instructed to only accept text
                    if (detected.seemsBinary && options.acceptTextOnly) {
                        throw new DecodeStreamError('Stream is binary but only text is accepted for decoding', 1 /* DecodeStreamErrorKind.STREAM_IS_BINARY */);
                    }
                    // ensure to respect overwrite of encoding
                    detected.encoding = await options.overwriteEncoding(detected.encoding);
                    // decode and write buffered content
                    decoder = await DecoderStream.create(detected.encoding);
                    const decoded = decoder.write(buffer_1.VSBuffer.concat(bufferedChunks).buffer);
                    target.write(decoded);
                    bufferedChunks.length = 0;
                    bytesBuffered = 0;
                    // signal to the outside our detected encoding and final decoder stream
                    resolve({
                        stream: target,
                        detected
                    });
                }
                catch (error) {
                    // Stop handling anything from the source and target
                    cts.cancel();
                    target.destroy();
                    reject(error);
                }
            };
            (0, stream_1.listenStream)(source, {
                onData: async (chunk) => {
                    // if the decoder is ready, we just write directly
                    if (decoder) {
                        target.write(decoder.write(chunk.buffer));
                    }
                    // otherwise we need to buffer the data until the stream is ready
                    else {
                        bufferedChunks.push(chunk);
                        bytesBuffered += chunk.byteLength;
                        // buffered enough data for encoding detection, create stream
                        if (bytesBuffered >= minBytesRequiredForDetection) {
                            // pause stream here until the decoder is ready
                            source.pause();
                            await createDecoder();
                            // resume stream now that decoder is ready but
                            // outside of this stack to reduce recursion
                            setTimeout(() => source.resume());
                        }
                    }
                },
                onError: error => target.error(error),
                onEnd: async () => {
                    // we were still waiting for data to do the encoding
                    // detection. thus, wrap up starting the stream even
                    // without all the data to get things going
                    if (!decoder) {
                        await createDecoder();
                    }
                    // end the target with the remainders of the decoder
                    target.end(decoder?.end());
                }
            }, cts.token);
        });
    }
    exports.toDecodeStream = toDecodeStream;
    async function toEncodeReadable(readable, encoding, options) {
        const iconv = await (0, amdX_1.importAMDNodeModule)('@vscode/iconv-lite-umd', 'lib/iconv-lite-umd.js');
        const encoder = iconv.getEncoder(toNodeEncoding(encoding), options);
        let bytesWritten = false;
        let done = false;
        return {
            read() {
                if (done) {
                    return null;
                }
                const chunk = readable.read();
                if (typeof chunk !== 'string') {
                    done = true;
                    // If we are instructed to add a BOM but we detect that no
                    // bytes have been written, we must ensure to return the BOM
                    // ourselves so that we comply with the contract.
                    if (!bytesWritten && options?.addBOM) {
                        switch (encoding) {
                            case exports.UTF8:
                            case exports.UTF8_with_bom:
                                return buffer_1.VSBuffer.wrap(Uint8Array.from(exports.UTF8_BOM));
                            case exports.UTF16be:
                                return buffer_1.VSBuffer.wrap(Uint8Array.from(exports.UTF16be_BOM));
                            case exports.UTF16le:
                                return buffer_1.VSBuffer.wrap(Uint8Array.from(exports.UTF16le_BOM));
                        }
                    }
                    const leftovers = encoder.end();
                    if (leftovers && leftovers.length > 0) {
                        bytesWritten = true;
                        return buffer_1.VSBuffer.wrap(leftovers);
                    }
                    return null;
                }
                bytesWritten = true;
                return buffer_1.VSBuffer.wrap(encoder.write(chunk));
            }
        };
    }
    exports.toEncodeReadable = toEncodeReadable;
    async function encodingExists(encoding) {
        const iconv = await (0, amdX_1.importAMDNodeModule)('@vscode/iconv-lite-umd', 'lib/iconv-lite-umd.js');
        return iconv.encodingExists(toNodeEncoding(encoding));
    }
    exports.encodingExists = encodingExists;
    function toNodeEncoding(enc) {
        if (enc === exports.UTF8_with_bom || enc === null) {
            return exports.UTF8; // iconv does not distinguish UTF 8 with or without BOM, so we need to help it
        }
        return enc;
    }
    exports.toNodeEncoding = toNodeEncoding;
    function detectEncodingByBOMFromBuffer(buffer, bytesRead) {
        if (!buffer || bytesRead < exports.UTF16be_BOM.length) {
            return null;
        }
        const b0 = buffer.readUInt8(0);
        const b1 = buffer.readUInt8(1);
        // UTF-16 BE
        if (b0 === exports.UTF16be_BOM[0] && b1 === exports.UTF16be_BOM[1]) {
            return exports.UTF16be;
        }
        // UTF-16 LE
        if (b0 === exports.UTF16le_BOM[0] && b1 === exports.UTF16le_BOM[1]) {
            return exports.UTF16le;
        }
        if (bytesRead < exports.UTF8_BOM.length) {
            return null;
        }
        const b2 = buffer.readUInt8(2);
        // UTF-8
        if (b0 === exports.UTF8_BOM[0] && b1 === exports.UTF8_BOM[1] && b2 === exports.UTF8_BOM[2]) {
            return exports.UTF8_with_bom;
        }
        return null;
    }
    exports.detectEncodingByBOMFromBuffer = detectEncodingByBOMFromBuffer;
    // we explicitly ignore a specific set of encodings from auto guessing
    // - ASCII: we never want this encoding (most UTF-8 files would happily detect as
    //          ASCII files and then you could not type non-ASCII characters anymore)
    // - UTF-16: we have our own detection logic for UTF-16
    // - UTF-32: we do not support this encoding in VSCode
    const IGNORE_ENCODINGS = ['ascii', 'utf-16', 'utf-32'];
    /**
     * Guesses the encoding from buffer.
     */
    async function guessEncodingByBuffer(buffer) {
        const jschardet = await (0, amdX_1.importAMDNodeModule)('jschardet', 'dist/jschardet.min.js');
        // ensure to limit buffer for guessing due to https://github.com/aadsm/jschardet/issues/53
        const limitedBuffer = buffer.slice(0, AUTO_ENCODING_GUESS_MAX_BYTES);
        // before guessing jschardet calls toString('binary') on input if it is a Buffer,
        // since we are using it inside browser environment as well we do conversion ourselves
        // https://github.com/aadsm/jschardet/blob/v2.1.1/src/index.js#L36-L40
        const binaryString = encodeLatin1(limitedBuffer.buffer);
        const guessed = jschardet.detect(binaryString);
        if (!guessed || !guessed.encoding) {
            return null;
        }
        const enc = guessed.encoding.toLowerCase();
        if (0 <= IGNORE_ENCODINGS.indexOf(enc)) {
            return null; // see comment above why we ignore some encodings
        }
        return toIconvLiteEncoding(guessed.encoding);
    }
    const JSCHARDET_TO_ICONV_ENCODINGS = {
        'ibm866': 'cp866',
        'big5': 'cp950'
    };
    function toIconvLiteEncoding(encodingName) {
        const normalizedEncodingName = encodingName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const mapped = JSCHARDET_TO_ICONV_ENCODINGS[normalizedEncodingName];
        return mapped || normalizedEncodingName;
    }
    function encodeLatin1(buffer) {
        let result = '';
        for (let i = 0; i < buffer.length; i++) {
            result += String.fromCharCode(buffer[i]);
        }
        return result;
    }
    /**
     * The encodings that are allowed in a settings file don't match the canonical encoding labels specified by WHATWG.
     * See https://encoding.spec.whatwg.org/#names-and-labels
     * Iconv-lite strips all non-alphanumeric characters, but ripgrep doesn't. For backcompat, allow these labels.
     */
    function toCanonicalName(enc) {
        switch (enc) {
            case 'shiftjis':
                return 'shift-jis';
            case 'utf16le':
                return 'utf-16le';
            case 'utf16be':
                return 'utf-16be';
            case 'big5hkscs':
                return 'big5-hkscs';
            case 'eucjp':
                return 'euc-jp';
            case 'euckr':
                return 'euc-kr';
            case 'koi8r':
                return 'koi8-r';
            case 'koi8u':
                return 'koi8-u';
            case 'macroman':
                return 'x-mac-roman';
            case 'utf8bom':
                return 'utf8';
            default: {
                const m = enc.match(/windows(\d+)/);
                if (m) {
                    return 'windows-' + m[1];
                }
                return enc;
            }
        }
    }
    exports.toCanonicalName = toCanonicalName;
    function detectEncodingFromBuffer({ buffer, bytesRead }, autoGuessEncoding) {
        // Always first check for BOM to find out about encoding
        let encoding = detectEncodingByBOMFromBuffer(buffer, bytesRead);
        // Detect 0 bytes to see if file is binary or UTF-16 LE/BE
        // unless we already know that this file has a UTF-16 encoding
        let seemsBinary = false;
        if (encoding !== exports.UTF16be && encoding !== exports.UTF16le && buffer) {
            let couldBeUTF16LE = true; // e.g. 0xAA 0x00
            let couldBeUTF16BE = true; // e.g. 0x00 0xAA
            let containsZeroByte = false;
            // This is a simplified guess to detect UTF-16 BE or LE by just checking if
            // the first 512 bytes have the 0-byte at a specific location. For UTF-16 LE
            // this would be the odd byte index and for UTF-16 BE the even one.
            // Note: this can produce false positives (a binary file that uses a 2-byte
            // encoding of the same format as UTF-16) and false negatives (a UTF-16 file
            // that is using 4 bytes to encode a character).
            for (let i = 0; i < bytesRead && i < ZERO_BYTE_DETECTION_BUFFER_MAX_LEN; i++) {
                const isEndian = (i % 2 === 1); // assume 2-byte sequences typical for UTF-16
                const isZeroByte = (buffer.readUInt8(i) === 0);
                if (isZeroByte) {
                    containsZeroByte = true;
                }
                // UTF-16 LE: expect e.g. 0xAA 0x00
                if (couldBeUTF16LE && (isEndian && !isZeroByte || !isEndian && isZeroByte)) {
                    couldBeUTF16LE = false;
                }
                // UTF-16 BE: expect e.g. 0x00 0xAA
                if (couldBeUTF16BE && (isEndian && isZeroByte || !isEndian && !isZeroByte)) {
                    couldBeUTF16BE = false;
                }
                // Return if this is neither UTF16-LE nor UTF16-BE and thus treat as binary
                if (isZeroByte && !couldBeUTF16LE && !couldBeUTF16BE) {
                    break;
                }
            }
            // Handle case of 0-byte included
            if (containsZeroByte) {
                if (couldBeUTF16LE) {
                    encoding = exports.UTF16le;
                }
                else if (couldBeUTF16BE) {
                    encoding = exports.UTF16be;
                }
                else {
                    seemsBinary = true;
                }
            }
        }
        // Auto guess encoding if configured
        if (autoGuessEncoding && !seemsBinary && !encoding && buffer) {
            return guessEncodingByBuffer(buffer.slice(0, bytesRead)).then(guessedEncoding => {
                return {
                    seemsBinary: false,
                    encoding: guessedEncoding
                };
            });
        }
        return { seemsBinary, encoding };
    }
    exports.detectEncodingFromBuffer = detectEncodingFromBuffer;
    exports.SUPPORTED_ENCODINGS = {
        utf8: {
            labelLong: 'UTF-8',
            labelShort: 'UTF-8',
            order: 1,
            alias: 'utf8bom'
        },
        utf8bom: {
            labelLong: 'UTF-8 with BOM',
            labelShort: 'UTF-8 with BOM',
            encodeOnly: true,
            order: 2,
            alias: 'utf8'
        },
        utf16le: {
            labelLong: 'UTF-16 LE',
            labelShort: 'UTF-16 LE',
            order: 3
        },
        utf16be: {
            labelLong: 'UTF-16 BE',
            labelShort: 'UTF-16 BE',
            order: 4
        },
        windows1252: {
            labelLong: 'Western (Windows 1252)',
            labelShort: 'Windows 1252',
            order: 5
        },
        iso88591: {
            labelLong: 'Western (ISO 8859-1)',
            labelShort: 'ISO 8859-1',
            order: 6
        },
        iso88593: {
            labelLong: 'Western (ISO 8859-3)',
            labelShort: 'ISO 8859-3',
            order: 7
        },
        iso885915: {
            labelLong: 'Western (ISO 8859-15)',
            labelShort: 'ISO 8859-15',
            order: 8
        },
        macroman: {
            labelLong: 'Western (Mac Roman)',
            labelShort: 'Mac Roman',
            order: 9
        },
        cp437: {
            labelLong: 'DOS (CP 437)',
            labelShort: 'CP437',
            order: 10
        },
        windows1256: {
            labelLong: 'Arabic (Windows 1256)',
            labelShort: 'Windows 1256',
            order: 11
        },
        iso88596: {
            labelLong: 'Arabic (ISO 8859-6)',
            labelShort: 'ISO 8859-6',
            order: 12
        },
        windows1257: {
            labelLong: 'Baltic (Windows 1257)',
            labelShort: 'Windows 1257',
            order: 13
        },
        iso88594: {
            labelLong: 'Baltic (ISO 8859-4)',
            labelShort: 'ISO 8859-4',
            order: 14
        },
        iso885914: {
            labelLong: 'Celtic (ISO 8859-14)',
            labelShort: 'ISO 8859-14',
            order: 15
        },
        windows1250: {
            labelLong: 'Central European (Windows 1250)',
            labelShort: 'Windows 1250',
            order: 16
        },
        iso88592: {
            labelLong: 'Central European (ISO 8859-2)',
            labelShort: 'ISO 8859-2',
            order: 17
        },
        cp852: {
            labelLong: 'Central European (CP 852)',
            labelShort: 'CP 852',
            order: 18
        },
        windows1251: {
            labelLong: 'Cyrillic (Windows 1251)',
            labelShort: 'Windows 1251',
            order: 19
        },
        cp866: {
            labelLong: 'Cyrillic (CP 866)',
            labelShort: 'CP 866',
            order: 20
        },
        iso88595: {
            labelLong: 'Cyrillic (ISO 8859-5)',
            labelShort: 'ISO 8859-5',
            order: 21
        },
        koi8r: {
            labelLong: 'Cyrillic (KOI8-R)',
            labelShort: 'KOI8-R',
            order: 22
        },
        koi8u: {
            labelLong: 'Cyrillic (KOI8-U)',
            labelShort: 'KOI8-U',
            order: 23
        },
        iso885913: {
            labelLong: 'Estonian (ISO 8859-13)',
            labelShort: 'ISO 8859-13',
            order: 24
        },
        windows1253: {
            labelLong: 'Greek (Windows 1253)',
            labelShort: 'Windows 1253',
            order: 25
        },
        iso88597: {
            labelLong: 'Greek (ISO 8859-7)',
            labelShort: 'ISO 8859-7',
            order: 26
        },
        windows1255: {
            labelLong: 'Hebrew (Windows 1255)',
            labelShort: 'Windows 1255',
            order: 27
        },
        iso88598: {
            labelLong: 'Hebrew (ISO 8859-8)',
            labelShort: 'ISO 8859-8',
            order: 28
        },
        iso885910: {
            labelLong: 'Nordic (ISO 8859-10)',
            labelShort: 'ISO 8859-10',
            order: 29
        },
        iso885916: {
            labelLong: 'Romanian (ISO 8859-16)',
            labelShort: 'ISO 8859-16',
            order: 30
        },
        windows1254: {
            labelLong: 'Turkish (Windows 1254)',
            labelShort: 'Windows 1254',
            order: 31
        },
        iso88599: {
            labelLong: 'Turkish (ISO 8859-9)',
            labelShort: 'ISO 8859-9',
            order: 32
        },
        windows1258: {
            labelLong: 'Vietnamese (Windows 1258)',
            labelShort: 'Windows 1258',
            order: 33
        },
        gbk: {
            labelLong: 'Simplified Chinese (GBK)',
            labelShort: 'GBK',
            order: 34
        },
        gb18030: {
            labelLong: 'Simplified Chinese (GB18030)',
            labelShort: 'GB18030',
            order: 35
        },
        cp950: {
            labelLong: 'Traditional Chinese (Big5)',
            labelShort: 'Big5',
            order: 36
        },
        big5hkscs: {
            labelLong: 'Traditional Chinese (Big5-HKSCS)',
            labelShort: 'Big5-HKSCS',
            order: 37
        },
        shiftjis: {
            labelLong: 'Japanese (Shift JIS)',
            labelShort: 'Shift JIS',
            order: 38
        },
        eucjp: {
            labelLong: 'Japanese (EUC-JP)',
            labelShort: 'EUC-JP',
            order: 39
        },
        euckr: {
            labelLong: 'Korean (EUC-KR)',
            labelShort: 'EUC-KR',
            order: 40
        },
        windows874: {
            labelLong: 'Thai (Windows 874)',
            labelShort: 'Windows 874',
            order: 41
        },
        iso885911: {
            labelLong: 'Latin/Thai (ISO 8859-11)',
            labelShort: 'ISO 8859-11',
            order: 42
        },
        koi8ru: {
            labelLong: 'Cyrillic (KOI8-RU)',
            labelShort: 'KOI8-RU',
            order: 43
        },
        koi8t: {
            labelLong: 'Tajik (KOI8-T)',
            labelShort: 'KOI8-T',
            order: 44
        },
        gb2312: {
            labelLong: 'Simplified Chinese (GB 2312)',
            labelShort: 'GB 2312',
            order: 45
        },
        cp865: {
            labelLong: 'Nordic DOS (CP 865)',
            labelShort: 'CP 865',
            order: 46
        },
        cp850: {
            labelLong: 'Western European DOS (CP 850)',
            labelShort: 'CP 850',
            order: 47
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dGZpbGUvY29tbW9uL2VuY29kaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9uRixRQUFBLElBQUksR0FBRyxNQUFNLENBQUM7SUFDZCxRQUFBLGFBQWEsR0FBRyxTQUFTLENBQUM7SUFDMUIsUUFBQSxPQUFPLEdBQUcsU0FBUyxDQUFDO0lBQ3BCLFFBQUEsT0FBTyxHQUFHLFNBQVMsQ0FBQztJQUlqQyxTQUFnQixhQUFhLENBQUMsUUFBZ0I7UUFDN0MsT0FBTyxDQUFDLFlBQUksRUFBRSxxQkFBYSxFQUFFLGVBQU8sRUFBRSxlQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEtBQUssUUFBUSxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUZELHNDQUVDO0lBRVksUUFBQSxXQUFXLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsUUFBQSxXQUFXLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsUUFBQSxRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRTNDLE1BQU0sa0NBQWtDLEdBQUcsR0FBRyxDQUFDLENBQUUsd0VBQXdFO0lBQ3pILE1BQU0sMkJBQTJCLEdBQUcsR0FBRyxDQUFDLENBQUksd0VBQXdFO0lBQ3BILE1BQU0sNkJBQTZCLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFHLHdFQUF3RTtJQUN6SCxNQUFNLDZCQUE2QixHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBRSxxRUFBcUU7SUFldkgsSUFBa0IscUJBT2pCO0lBUEQsV0FBa0IscUJBQXFCO1FBRXRDOzs7V0FHRztRQUNILHlGQUFvQixD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