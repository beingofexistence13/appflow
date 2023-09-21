/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/base/common/buffer", "vs/base/common/types"], function (require, exports, files_1, instantiation_1, buffer_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OD = exports.$ND = exports.$MD = exports.$LD = exports.EncodingMode = exports.TextFileResolveReason = exports.TextFileEditorModelState = exports.$KD = exports.TextFileOperationResult = exports.$JD = void 0;
    exports.$JD = (0, instantiation_1.$Bh)('textFileService');
    var TextFileOperationResult;
    (function (TextFileOperationResult) {
        TextFileOperationResult[TextFileOperationResult["FILE_IS_BINARY"] = 0] = "FILE_IS_BINARY";
    })(TextFileOperationResult || (exports.TextFileOperationResult = TextFileOperationResult = {}));
    class $KD extends files_1.$nk {
        static isTextFileOperationError(obj) {
            return obj instanceof Error && !(0, types_1.$sf)(obj.textFileOperationResult);
        }
        constructor(message, textFileOperationResult, options) {
            super(message, 10 /* FileOperationResult.FILE_OTHER_ERROR */);
            this.textFileOperationResult = textFileOperationResult;
            this.options = options;
        }
    }
    exports.$KD = $KD;
    /**
     * States the text file editor model can be in.
     */
    var TextFileEditorModelState;
    (function (TextFileEditorModelState) {
        /**
         * A model is saved.
         */
        TextFileEditorModelState[TextFileEditorModelState["SAVED"] = 0] = "SAVED";
        /**
         * A model is dirty.
         */
        TextFileEditorModelState[TextFileEditorModelState["DIRTY"] = 1] = "DIRTY";
        /**
         * A model is currently being saved but this operation has not completed yet.
         */
        TextFileEditorModelState[TextFileEditorModelState["PENDING_SAVE"] = 2] = "PENDING_SAVE";
        /**
         * A model is in conflict mode when changes cannot be saved because the
         * underlying file has changed. Models in conflict mode are always dirty.
         */
        TextFileEditorModelState[TextFileEditorModelState["CONFLICT"] = 3] = "CONFLICT";
        /**
         * A model is in orphan state when the underlying file has been deleted.
         */
        TextFileEditorModelState[TextFileEditorModelState["ORPHAN"] = 4] = "ORPHAN";
        /**
         * Any error that happens during a save that is not causing the CONFLICT state.
         * Models in error mode are always dirty.
         */
        TextFileEditorModelState[TextFileEditorModelState["ERROR"] = 5] = "ERROR";
    })(TextFileEditorModelState || (exports.TextFileEditorModelState = TextFileEditorModelState = {}));
    var TextFileResolveReason;
    (function (TextFileResolveReason) {
        TextFileResolveReason[TextFileResolveReason["EDITOR"] = 1] = "EDITOR";
        TextFileResolveReason[TextFileResolveReason["REFERENCE"] = 2] = "REFERENCE";
        TextFileResolveReason[TextFileResolveReason["OTHER"] = 3] = "OTHER";
    })(TextFileResolveReason || (exports.TextFileResolveReason = TextFileResolveReason = {}));
    var EncodingMode;
    (function (EncodingMode) {
        /**
         * Instructs the encoding support to encode the object with the provided encoding
         */
        EncodingMode[EncodingMode["Encode"] = 0] = "Encode";
        /**
         * Instructs the encoding support to decode the object with the provided encoding
         */
        EncodingMode[EncodingMode["Decode"] = 1] = "Decode";
    })(EncodingMode || (exports.EncodingMode = EncodingMode = {}));
    function $LD(model) {
        const candidate = model;
        return (0, types_1.$yf)(candidate.setEncoding, candidate.getEncoding, candidate.save, candidate.revert, candidate.isDirty, candidate.getLanguageId);
    }
    exports.$LD = $LD;
    function $MD(snapshot) {
        const chunks = [];
        let chunk;
        while (typeof (chunk = snapshot.read()) === 'string') {
            chunks.push(chunk);
        }
        return chunks.join('');
    }
    exports.$MD = $MD;
    function $ND(value) {
        let done = false;
        return {
            read() {
                if (!done) {
                    done = true;
                    return value;
                }
                return null;
            }
        };
    }
    exports.$ND = $ND;
    function $OD(value) {
        if (typeof value === 'undefined') {
            return undefined;
        }
        if (typeof value === 'string') {
            return buffer_1.$Fd.fromString(value);
        }
        return {
            read: () => {
                const chunk = value.read();
                if (typeof chunk === 'string') {
                    return buffer_1.$Fd.fromString(chunk);
                }
                return null;
            }
        };
    }
    exports.$OD = $OD;
});
//# sourceMappingURL=textfiles.js.map