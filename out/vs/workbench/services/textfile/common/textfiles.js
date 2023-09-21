/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/base/common/buffer", "vs/base/common/types"], function (require, exports, files_1, instantiation_1, buffer_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toBufferOrReadable = exports.stringToSnapshot = exports.snapshotToString = exports.isTextFileEditorModel = exports.EncodingMode = exports.TextFileResolveReason = exports.TextFileEditorModelState = exports.TextFileOperationError = exports.TextFileOperationResult = exports.ITextFileService = void 0;
    exports.ITextFileService = (0, instantiation_1.createDecorator)('textFileService');
    var TextFileOperationResult;
    (function (TextFileOperationResult) {
        TextFileOperationResult[TextFileOperationResult["FILE_IS_BINARY"] = 0] = "FILE_IS_BINARY";
    })(TextFileOperationResult || (exports.TextFileOperationResult = TextFileOperationResult = {}));
    class TextFileOperationError extends files_1.FileOperationError {
        static isTextFileOperationError(obj) {
            return obj instanceof Error && !(0, types_1.isUndefinedOrNull)(obj.textFileOperationResult);
        }
        constructor(message, textFileOperationResult, options) {
            super(message, 10 /* FileOperationResult.FILE_OTHER_ERROR */);
            this.textFileOperationResult = textFileOperationResult;
            this.options = options;
        }
    }
    exports.TextFileOperationError = TextFileOperationError;
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
    function isTextFileEditorModel(model) {
        const candidate = model;
        return (0, types_1.areFunctions)(candidate.setEncoding, candidate.getEncoding, candidate.save, candidate.revert, candidate.isDirty, candidate.getLanguageId);
    }
    exports.isTextFileEditorModel = isTextFileEditorModel;
    function snapshotToString(snapshot) {
        const chunks = [];
        let chunk;
        while (typeof (chunk = snapshot.read()) === 'string') {
            chunks.push(chunk);
        }
        return chunks.join('');
    }
    exports.snapshotToString = snapshotToString;
    function stringToSnapshot(value) {
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
    exports.stringToSnapshot = stringToSnapshot;
    function toBufferOrReadable(value) {
        if (typeof value === 'undefined') {
            return undefined;
        }
        if (typeof value === 'string') {
            return buffer_1.VSBuffer.fromString(value);
        }
        return {
            read: () => {
                const chunk = value.read();
                if (typeof chunk === 'string') {
                    return buffer_1.VSBuffer.fromString(chunk);
                }
                return null;
            }
        };
    }
    exports.toBufferOrReadable = toBufferOrReadable;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGZpbGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRmaWxlL2NvbW1vbi90ZXh0ZmlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJuRixRQUFBLGdCQUFnQixHQUFHLElBQUEsK0JBQWUsRUFBbUIsaUJBQWlCLENBQUMsQ0FBQztJQXNJckYsSUFBa0IsdUJBRWpCO0lBRkQsV0FBa0IsdUJBQXVCO1FBQ3hDLHlGQUFjLENBQUE7SUFDZixDQUFDLEVBRmlCLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLFFBRXhDO0lBRUQsTUFBYSxzQkFBdUIsU0FBUSwwQkFBa0I7UUFFN0QsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEdBQVk7WUFDM0MsT0FBTyxHQUFHLFlBQVksS0FBSyxJQUFJLENBQUMsSUFBQSx5QkFBaUIsRUFBRSxHQUE4QixDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDNUcsQ0FBQztRQUlELFlBQ0MsT0FBZSxFQUNSLHVCQUFnRCxFQUN2RCxPQUFzRDtZQUV0RCxLQUFLLENBQUMsT0FBTyxnREFBdUMsQ0FBQztZQUg5Qyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1lBS3ZELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLENBQUM7S0FDRDtJQWpCRCx3REFpQkM7SUF1QkQ7O09BRUc7SUFDSCxJQUFrQix3QkFpQ2pCO0lBakNELFdBQWtCLHdCQUF3QjtRQUV6Qzs7V0FFRztRQUNILHlFQUFLLENBQUE7UUFFTDs7V0FFRztRQUNILHlFQUFLLENBQUE7UUFFTDs7V0FFRztRQUNILHVGQUFZLENBQUE7UUFFWjs7O1dBR0c7UUFDSCwrRUFBUSxDQUFBO1FBRVI7O1dBRUc7UUFDSCwyRUFBTSxDQUFBO1FBRU47OztXQUdHO1FBQ0gseUVBQUssQ0FBQTtJQUNOLENBQUMsRUFqQ2lCLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBaUN6QztJQUVELElBQWtCLHFCQUlqQjtJQUpELFdBQWtCLHFCQUFxQjtRQUN0QyxxRUFBVSxDQUFBO1FBQ1YsMkVBQWEsQ0FBQTtRQUNiLG1FQUFTLENBQUE7SUFDVixDQUFDLEVBSmlCLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBSXRDO0lBMk1ELElBQWtCLFlBV2pCO0lBWEQsV0FBa0IsWUFBWTtRQUU3Qjs7V0FFRztRQUNILG1EQUFNLENBQUE7UUFFTjs7V0FFRztRQUNILG1EQUFNLENBQUE7SUFDUCxDQUFDLEVBWGlCLFlBQVksNEJBQVosWUFBWSxRQVc3QjtJQXdERCxTQUFnQixxQkFBcUIsQ0FBQyxLQUF1QjtRQUM1RCxNQUFNLFNBQVMsR0FBRyxLQUE2QixDQUFDO1FBRWhELE9BQU8sSUFBQSxvQkFBWSxFQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDakosQ0FBQztJQUpELHNEQUlDO0lBU0QsU0FBZ0IsZ0JBQWdCLENBQUMsUUFBdUI7UUFDdkQsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBRTVCLElBQUksS0FBb0IsQ0FBQztRQUN6QixPQUFPLE9BQU8sQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQ3JELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbkI7UUFFRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQVRELDRDQVNDO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBYTtRQUM3QyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7UUFFakIsT0FBTztZQUNOLElBQUk7Z0JBQ0gsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDVixJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUVaLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztTQUNELENBQUM7SUFDSCxDQUFDO0lBZEQsNENBY0M7SUFNRCxTQUFnQixrQkFBa0IsQ0FBQyxLQUF5QztRQUMzRSxJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsRUFBRTtZQUNqQyxPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUVELElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQzlCLE9BQU8saUJBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbEM7UUFFRCxPQUFPO1lBQ04sSUFBSSxFQUFFLEdBQUcsRUFBRTtnQkFDVixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzNCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO29CQUM5QixPQUFPLGlCQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNsQztnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQW5CRCxnREFtQkMifQ==