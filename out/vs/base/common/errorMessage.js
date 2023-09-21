/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/types", "vs/nls"], function (require, exports, arrays, types, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createErrorWithActions = exports.isErrorWithActions = exports.toErrorMessage = void 0;
    function exceptionToErrorMessage(exception, verbose) {
        if (verbose && (exception.stack || exception.stacktrace)) {
            return nls.localize('stackTrace.format', "{0}: {1}", detectSystemErrorMessage(exception), stackToString(exception.stack) || stackToString(exception.stacktrace));
        }
        return detectSystemErrorMessage(exception);
    }
    function stackToString(stack) {
        if (Array.isArray(stack)) {
            return stack.join('\n');
        }
        return stack;
    }
    function detectSystemErrorMessage(exception) {
        // Custom node.js error from us
        if (exception.code === 'ERR_UNC_HOST_NOT_ALLOWED') {
            return `${exception.message}. Please update the 'security.allowedUNCHosts' setting if you want to allow this host.`;
        }
        // See https://nodejs.org/api/errors.html#errors_class_system_error
        if (typeof exception.code === 'string' && typeof exception.errno === 'number' && typeof exception.syscall === 'string') {
            return nls.localize('nodeExceptionMessage', "A system error occurred ({0})", exception.message);
        }
        return exception.message || nls.localize('error.defaultMessage', "An unknown error occurred. Please consult the log for more details.");
    }
    /**
     * Tries to generate a human readable error message out of the error. If the verbose parameter
     * is set to true, the error message will include stacktrace details if provided.
     *
     * @returns A string containing the error message.
     */
    function toErrorMessage(error = null, verbose = false) {
        if (!error) {
            return nls.localize('error.defaultMessage', "An unknown error occurred. Please consult the log for more details.");
        }
        if (Array.isArray(error)) {
            const errors = arrays.coalesce(error);
            const msg = toErrorMessage(errors[0], verbose);
            if (errors.length > 1) {
                return nls.localize('error.moreErrors', "{0} ({1} errors in total)", msg, errors.length);
            }
            return msg;
        }
        if (types.isString(error)) {
            return error;
        }
        if (error.detail) {
            const detail = error.detail;
            if (detail.error) {
                return exceptionToErrorMessage(detail.error, verbose);
            }
            if (detail.exception) {
                return exceptionToErrorMessage(detail.exception, verbose);
            }
        }
        if (error.stack) {
            return exceptionToErrorMessage(error, verbose);
        }
        if (error.message) {
            return error.message;
        }
        return nls.localize('error.defaultMessage', "An unknown error occurred. Please consult the log for more details.");
    }
    exports.toErrorMessage = toErrorMessage;
    function isErrorWithActions(obj) {
        const candidate = obj;
        return candidate instanceof Error && Array.isArray(candidate.actions);
    }
    exports.isErrorWithActions = isErrorWithActions;
    function createErrorWithActions(messageOrError, actions) {
        let error;
        if (typeof messageOrError === 'string') {
            error = new Error(messageOrError);
        }
        else {
            error = messageOrError;
        }
        error.actions = actions;
        return error;
    }
    exports.createErrorWithActions = createErrorWithActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JNZXNzYWdlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vZXJyb3JNZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxTQUFTLHVCQUF1QixDQUFDLFNBQWMsRUFBRSxPQUFnQjtRQUNoRSxJQUFJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3pELE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLEVBQUUsd0JBQXdCLENBQUMsU0FBUyxDQUFDLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDaks7UUFFRCxPQUFPLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxLQUFvQztRQUMxRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDekIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyx3QkFBd0IsQ0FBQyxTQUFjO1FBRS9DLCtCQUErQjtRQUMvQixJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssMEJBQTBCLEVBQUU7WUFDbEQsT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLHdGQUF3RixDQUFDO1NBQ3BIO1FBRUQsbUVBQW1FO1FBQ25FLElBQUksT0FBTyxTQUFTLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxPQUFPLFNBQVMsQ0FBQyxLQUFLLEtBQUssUUFBUSxJQUFJLE9BQU8sU0FBUyxDQUFDLE9BQU8sS0FBSyxRQUFRLEVB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