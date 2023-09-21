/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ab = exports.$_ = exports.$$ = exports.$0 = exports.$9 = exports.$8 = exports.$7 = exports.$6 = exports.$5 = exports.$4 = exports.$3 = exports.$2 = exports.$1 = exports.$Z = exports.$Y = exports.$X = exports.setUnexpectedErrorHandler = exports.$V = exports.$U = void 0;
    // Avoid circular dependency on EventEmitter by implementing a subset of the interface.
    class $U {
        constructor() {
            this.b = [];
            this.a = function (e) {
                setTimeout(() => {
                    if (e.stack) {
                        if ($_.isErrorNoTelemetry(e)) {
                            throw new $_(e.message + '\n\n' + e.stack);
                        }
                        throw new Error(e.message + '\n\n' + e.stack);
                    }
                    throw e;
                }, 0);
            };
        }
        addListener(listener) {
            this.b.push(listener);
            return () => {
                this.d(listener);
            };
        }
        c(e) {
            this.b.forEach((listener) => {
                listener(e);
            });
        }
        d(listener) {
            this.b.splice(this.b.indexOf(listener), 1);
        }
        setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
            this.a = newUnexpectedErrorHandler;
        }
        getUnexpectedErrorHandler() {
            return this.a;
        }
        onUnexpectedError(e) {
            this.a(e);
            this.c(e);
        }
        // For external errors, we don't want the listeners to be called
        onUnexpectedExternalError(e) {
            this.a(e);
        }
    }
    exports.$U = $U;
    exports.$V = new $U();
    /** @skipMangle */
    function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        exports.$V.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
    }
    exports.setUnexpectedErrorHandler = setUnexpectedErrorHandler;
    /**
     * Returns if the error is a SIGPIPE error. SIGPIPE errors should generally be
     * logged at most once, to avoid a loop.
     *
     * @see https://github.com/microsoft/vscode-remote-release/issues/6481
     */
    function $X(e) {
        if (!e || typeof e !== 'object') {
            return false;
        }
        const cast = e;
        return cast.code === 'EPIPE' && cast.syscall?.toUpperCase() === 'WRITE';
    }
    exports.$X = $X;
    function $Y(e) {
        // ignore errors from cancelled promises
        if (!$2(e)) {
            exports.$V.onUnexpectedError(e);
        }
        return undefined;
    }
    exports.$Y = $Y;
    function $Z(e) {
        // ignore errors from cancelled promises
        if (!$2(e)) {
            exports.$V.onUnexpectedExternalError(e);
        }
        return undefined;
    }
    exports.$Z = $Z;
    function $1(error) {
        if (error instanceof Error) {
            const { name, message } = error;
            const stack = error.stacktrace || error.stack;
            return {
                $isError: true,
                name,
                message,
                stack,
                noTelemetry: $_.isErrorNoTelemetry(error)
            };
        }
        // return as is
        return error;
    }
    exports.$1 = $1;
    const canceledName = 'Canceled';
    /**
     * Checks if the given error is a promise in canceled state
     */
    function $2(error) {
        if (error instanceof $3) {
            return true;
        }
        return error instanceof Error && error.name === canceledName && error.message === canceledName;
    }
    exports.$2 = $2;
    // !!!IMPORTANT!!!
    // Do NOT change this class because it is also used as an API-type.
    class $3 extends Error {
        constructor() {
            super(canceledName);
            this.name = this.message;
        }
    }
    exports.$3 = $3;
    /**
     * @deprecated use {@link $3 `new CancellationError()`} instead
     */
    function $4() {
        const error = new Error(canceledName);
        error.name = error.message;
        return error;
    }
    exports.$4 = $4;
    function $5(name) {
        if (name) {
            return new Error(`Illegal argument: ${name}`);
        }
        else {
            return new Error('Illegal argument');
        }
    }
    exports.$5 = $5;
    function $6(name) {
        if (name) {
            return new Error(`Illegal state: ${name}`);
        }
        else {
            return new Error('Illegal state');
        }
    }
    exports.$6 = $6;
    class $7 extends TypeError {
        constructor(name) {
            super(name ? `${name} is read-only and cannot be changed` : 'Cannot change read-only property');
        }
    }
    exports.$7 = $7;
    function $8(err) {
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
    exports.$8 = $8;
    class $9 extends Error {
        constructor(message) {
            super('NotImplemented');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.$9 = $9;
    class $0 extends Error {
        constructor(message) {
            super('NotSupported');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.$0 = $0;
    class $$ extends Error {
        constructor() {
            super(...arguments);
            this.isExpected = true;
        }
    }
    exports.$$ = $$;
    /**
     * Error that when thrown won't be logged in telemetry as an unhandled error.
     */
    class $_ extends Error {
        constructor(msg) {
            super(msg);
            this.name = 'CodeExpectedError';
        }
        static fromError(err) {
            if (err instanceof $_) {
                return err;
            }
            const result = new $_();
            result.message = err.message;
            result.stack = err.stack;
            return result;
        }
        static isErrorNoTelemetry(err) {
            return err.name === 'CodeExpectedError';
        }
    }
    exports.$_ = $_;
    /**
     * This error indicates a bug.
     * Do not throw this for invalid user input.
     * Only catch this error to recover gracefully from bugs.
     */
    class $ab extends Error {
        constructor(message) {
            super(message || 'An unexpected bug occurred.');
            Object.setPrototypeOf(this, $ab.prototype);
            // Because we know for sure only buggy code throws this,
            // we definitely want to break here and fix the bug.
            // eslint-disable-next-line no-debugger
            // debugger;
        }
    }
    exports.$ab = $ab;
});
//# sourceMappingURL=errors.js.map