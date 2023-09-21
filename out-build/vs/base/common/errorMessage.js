/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/types", "vs/nls!vs/base/common/errorMessage"], function (require, exports, arrays, types, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oi = exports.$ni = exports.$mi = void 0;
    function exceptionToErrorMessage(exception, verbose) {
        if (verbose && (exception.stack || exception.stacktrace)) {
            return nls.localize(0, null, detectSystemErrorMessage(exception), stackToString(exception.stack) || stackToString(exception.stacktrace));
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
            return nls.localize(1, null, exception.message);
        }
        return exception.message || nls.localize(2, null);
    }
    /**
     * Tries to generate a human readable error message out of the error. If the verbose parameter
     * is set to true, the error message will include stacktrace details if provided.
     *
     * @returns A string containing the error message.
     */
    function $mi(error = null, verbose = false) {
        if (!error) {
            return nls.localize(3, null);
        }
        if (Array.isArray(error)) {
            const errors = arrays.$Fb(error);
            const msg = $mi(errors[0], verbose);
            if (errors.length > 1) {
                return nls.localize(4, null, msg, errors.length);
            }
            return msg;
        }
        if (types.$jf(error)) {
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
        return nls.localize(5, null);
    }
    exports.$mi = $mi;
    function $ni(obj) {
        const candidate = obj;
        return candidate instanceof Error && Array.isArray(candidate.actions);
    }
    exports.$ni = $ni;
    function $oi(messageOrError, actions) {
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
    exports.$oi = $oi;
});
//# sourceMappingURL=errorMessage.js.map