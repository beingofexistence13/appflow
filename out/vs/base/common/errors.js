/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BugIndicatingError = exports.ErrorNoTelemetry = exports.ExpectedError = exports.NotSupportedError = exports.NotImplementedError = exports.getErrorMessage = exports.ReadonlyError = exports.illegalState = exports.illegalArgument = exports.canceled = exports.CancellationError = exports.isCancellationError = exports.transformErrorForSerialization = exports.onUnexpectedExternalError = exports.onUnexpectedError = exports.isSigPipeError = exports.setUnexpectedErrorHandler = exports.errorHandler = exports.ErrorHandler = void 0;
    // Avoid circular dependency on EventEmitter by implementing a subset of the interface.
    class ErrorHandler {
        constructor() {
            this.listeners = [];
            this.unexpectedErrorHandler = function (e) {
                setTimeout(() => {
                    if (e.stack) {
                        if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
                            throw new ErrorNoTelemetry(e.message + '\n\n' + e.stack);
                        }
                        throw new Error(e.message + '\n\n' + e.stack);
                    }
                    throw e;
                }, 0);
            };
        }
        addListener(listener) {
            this.listeners.push(listener);
            return () => {
                this._removeListener(listener);
            };
        }
        emit(e) {
            this.listeners.forEach((listener) => {
                listener(e);
            });
        }
        _removeListener(listener) {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        }
        setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
            this.unexpectedErrorHandler = newUnexpectedErrorHandler;
        }
        getUnexpectedErrorHandler() {
            return this.unexpectedErrorHandler;
        }
        onUnexpectedError(e) {
            this.unexpectedErrorHandler(e);
            this.emit(e);
        }
        // For external errors, we don't want the listeners to be called
        onUnexpectedExternalError(e) {
            this.unexpectedErrorHandler(e);
        }
    }
    exports.ErrorHandler = ErrorHandler;
    exports.errorHandler = new ErrorHandler();
    /** @skipMangle */
    function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        exports.errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
    }
    exports.setUnexpectedErrorHandler = setUnexpectedErrorHandler;
    /**
     * Returns if the error is a SIGPIPE error. SIGPIPE errors should generally be
     * logged at most once, to avoid a loop.
     *
     * @see https://github.com/microsoft/vscode-remote-release/issues/6481
     */
    function isSigPipeError(e) {
        if (!e || typeof e !== 'object') {
            return false;
        }
        const cast = e;
        return cast.code === 'EPIPE' && cast.syscall?.toUpperCase() === 'WRITE';
    }
    exports.isSigPipeError = isSigPipeError;
    function onUnexpectedError(e) {
        // ignore errors from cancelled promises
        if (!isCancellationError(e)) {
            exports.errorHandler.onUnexpectedError(e);
        }
        return undefined;
    }
    exports.onUnexpectedError = onUnexpectedError;
    function onUnexpectedExternalError(e) {
        // ignore errors from cancelled promises
        if (!isCancellationError(e)) {
            exports.errorHandler.onUnexpectedExternalError(e);
        }
        return undefined;
    }
    exports.onUnexpectedExternalError = onUnexpectedExternalError;
    function transformErrorForSerialization(error) {
        if (error instanceof Error) {
            const { name, message } = error;
            const stack = error.stacktrace || error.stack;
            return {
                $isError: true,
                name,
                message,
                stack,
                noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error)
            };
        }
        // return as is
        return error;
    }
    exports.transformErrorForSerialization = transformErrorForSerialization;
    const canceledName = 'Canceled';
    /**
     * Checks if the given error is a promise in canceled state
     */
    function isCancellationError(error) {
        if (error instanceof CancellationError) {
            return true;
        }
        return error instanceof Error && error.name === canceledName && error.message === canceledName;
    }
    exports.isCancellationError = isCancellationError;
    // !!!IMPORTANT!!!
    // Do NOT change this class because it is also used as an API-type.
    class CancellationError extends Error {
        constructor() {
            super(canceledName);
            this.name = this.message;
        }
    }
    exports.CancellationError = CancellationError;
    /**
     * @deprecated use {@link CancellationError `new CancellationError()`} instead
     */
    function canceled() {
        const error = new Error(canceledName);
        error.name = error.message;
        return error;
    }
    exports.canceled = canceled;
    function illegalArgument(name) {
        if (name) {
            return new Error(`Illegal argument: ${name}`);
        }
        else {
            return new Error('Illegal argument');
        }
    }
    exports.illegalArgument = illegalArgument;
    function illegalState(name) {
        if (name) {
            return new Error(`Illegal state: ${name}`);
        }
        else {
            return new Error('Illegal state');
        }
    }
    exports.illegalState = illegalState;
    class ReadonlyError extends TypeError {
        constructor(name) {
            super(name ? `${name} is read-only and cannot be changed` : 'Cannot change read-only property');
        }
    }
    exports.ReadonlyError = ReadonlyError;
    function getErrorMessage(err) {
        if (!err) {
            return 'Error';
        }
        if (err.message) {
            return err.message;
        }
        if (err.stack) {
            return err.stack.split('\n')[0];
        }
        return String(err);
    }
    exports.getErrorMessage = getErrorMessage;
    class NotImplementedError extends Error {
        constructor(message) {
            super('NotImplemented');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotImplementedError = NotImplementedError;
    class NotSupportedError extends Error {
        constructor(message) {
            super('NotSupported');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotSupportedError = NotSupportedError;
    class ExpectedError extends Error {
        constructor() {
            super(...arguments);
            this.isExpected = true;
        }
    }
    exports.ExpectedError = ExpectedError;
    /**
     * Error that when thrown won't be logged in telemetry as an unhandled error.
     */
    class ErrorNoTelemetry extends Error {
        constructor(msg) {
            super(msg);
            this.name = 'CodeExpectedError';
        }
        static fromError(err) {
            if (err instanceof ErrorNoTelemetry) {
                return err;
            }
            const result = new ErrorNoTelemetry();
            result.message = err.message;
            result.stack = err.stack;
            return result;
        }
        static isErrorNoTelemetry(err) {
            return err.name === 'CodeExpectedError';
        }
    }
    exports.ErrorNoTelemetry = ErrorNoTelemetry;
    /**
     * This error indicates a bug.
     * Do not throw this for invalid user input.
     * Only catch this error to recover gracefully from bugs.
     */
    class BugIndicatingError extends Error {
        constructor(message) {
            super(message || 'An unexpected bug occurred.');
            Object.setPrototypeOf(this, BugIndicatingError.prototype);
            // Because we know for sure only buggy code throws this,
            // we definitely want to break here and fix the bug.
            // eslint-disable-next-line no-debugger
            // debugger;
        }
    }
    exports.BugIndicatingError = BugIndicatingError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vZXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyx1RkFBdUY7SUFDdkYsTUFBYSxZQUFZO1FBSXhCO1lBRUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFFcEIsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFVBQVUsQ0FBTTtnQkFDN0MsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDZixJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUU7d0JBQ1osSUFBSSxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRTs0QkFDM0MsTUFBTSxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDekQ7d0JBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQzlDO29CQUVELE1BQU0sQ0FBQyxDQUFDO2dCQUNULENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQztRQUNILENBQUM7UUFFRCxXQUFXLENBQUMsUUFBK0I7WUFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFOUIsT0FBTyxHQUFHLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUM7UUFDSCxDQUFDO1FBRU8sSUFBSSxDQUFDLENBQU07WUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDbkMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lB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