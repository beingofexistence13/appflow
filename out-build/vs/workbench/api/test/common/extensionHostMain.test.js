/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/ternarySearchTree", "vs/base/test/common/mock", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTelemetry", "vs/workbench/api/common/extensionHostMain", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, errors_1, platform_1, ternarySearchTree_1, mock_1, instantiationService_1, serviceCollection_1, log_1, extHostExtensionService_1, extHostRpcService_1, extHostTelemetry_1, extensionHostMain_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionHostMain#ErrorHandler - Wrapping prepareStackTrace can cause slowdown and eventual stack overflow #184926 ', function () {
        if (platform_1.$E || platform_1.$F) {
            return;
        }
        const extensionsIndex = ternarySearchTree_1.$Hh.forUris();
        const mainThreadExtensionsService = new class extends (0, mock_1.$rT)() {
            $onExtensionRuntimeError(extensionId, data) {
            }
        };
        const collection = new serviceCollection_1.$zh([log_1.$5i, new log_1.$fj()], [extHostTelemetry_1.$jM, new class extends (0, mock_1.$rT)() {
                onExtensionError(extension, error) {
                    return true;
                }
            }], [extHostExtensionService_1.$Rbc, new class extends (0, mock_1.$rT)() {
                getExtensionPathIndex() {
                    return new class extends extHostExtensionService_1.$Tbc {
                        findSubstr(key) {
                            findSubstrCount++;
                            return extensions_1.$KF;
                        }
                    }(extensionsIndex);
                }
            }], [extHostRpcService_1.$2L, new class extends (0, mock_1.$rT)() {
                getProxy(identifier) {
                    return mainThreadExtensionsService;
                }
            }]);
        const originalPrepareStackTrace = Error.prepareStackTrace;
        const insta = new instantiationService_1.$6p(collection, false);
        let existingErrorHandler;
        let findSubstrCount = 0;
        suiteSetup(async function () {
            existingErrorHandler = errors_1.$V.getUnexpectedErrorHandler();
            await insta.invokeFunction(extensionHostMain_1.$fdc.installFullHandler);
        });
        suiteTeardown(function () {
            errors_1.$V.setUnexpectedErrorHandler(existingErrorHandler);
        });
        setup(async function () {
            findSubstrCount = 0;
        });
        teardown(() => {
            Error.prepareStackTrace = originalPrepareStackTrace;
        });
        test('basics', function () {
            const err = new Error('test1');
            (0, errors_1.$Y)(err);
            assert.strictEqual(findSubstrCount, 1);
        });
        test('set/reset prepareStackTrace-callback', function () {
            const original = Error.prepareStackTrace;
            Error.prepareStackTrace = (_error, _stack) => 'stack';
            const probeErr = new Error();
            const stack = probeErr.stack;
            assert.ok(stack);
            Error.prepareStackTrace = original;
            assert.strictEqual(findSubstrCount, 1);
            // already checked
            (0, errors_1.$Y)(probeErr);
            assert.strictEqual(findSubstrCount, 1);
            // one more error
            const err = new Error('test2');
            (0, errors_1.$Y)(err);
            assert.strictEqual(findSubstrCount, 2);
        });
        test('wrap prepareStackTrace-callback', function () {
            function do_something_else(params) {
                return params;
            }
            const original = Error.prepareStackTrace;
            Error.prepareStackTrace = (...args) => {
                return do_something_else(original?.(...args));
            };
            const probeErr = new Error();
            const stack = probeErr.stack;
            assert.ok(stack);
            (0, errors_1.$Y)(probeErr);
            assert.strictEqual(findSubstrCount, 1);
        });
        test('prevent rewrapping', function () {
            let do_something_count = 0;
            function do_something(params) {
                do_something_count++;
            }
            Error.prepareStackTrace = (result, stack) => {
                do_something(stack);
                return 'fakestack';
            };
            for (let i = 0; i < 2500; ++i) {
                Error.prepareStackTrace = Error.prepareStackTrace;
            }
            const probeErr = new Error();
            const stack = probeErr.stack;
            assert.strictEqual(stack, 'fakestack');
            (0, errors_1.$Y)(probeErr);
            assert.strictEqual(findSubstrCount, 1);
            const probeErr2 = new Error();
            (0, errors_1.$Y)(probeErr2);
            assert.strictEqual(findSubstrCount, 2);
            assert.strictEqual(do_something_count, 2);
        });
        suite('https://gist.github.com/thecrypticace/f0f2e182082072efdaf0f8e1537d2cce', function () {
            test("Restored, separate operations", () => {
                // Actual Test
                let original;
                // Operation 1
                original = Error.prepareStackTrace;
                for (let i = 0; i < 12500; ++i) {
                    Error.prepareStackTrace = Error.prepareStackTrace;
                }
                const err1 = new Error();
                assert.ok(err1.stack);
                assert.strictEqual(findSubstrCount, 1);
                Error.prepareStackTrace = original;
                // Operation 2
                original = Error.prepareStackTrace;
                for (let i = 0; i < 12500; ++i) {
                    Error.prepareStackTrace = Error.prepareStackTrace;
                }
                assert.ok(new Error().stack);
                assert.strictEqual(findSubstrCount, 2);
                Error.prepareStackTrace = original;
                // Operation 3
                original = Error.prepareStackTrace;
                for (let i = 0; i < 12500; ++i) {
                    Error.prepareStackTrace = Error.prepareStackTrace;
                }
                assert.ok(new Error().stack);
                assert.strictEqual(findSubstrCount, 3);
                Error.prepareStackTrace = original;
                // Operation 4
                original = Error.prepareStackTrace;
                for (let i = 0; i < 12500; ++i) {
                    Error.prepareStackTrace = Error.prepareStackTrace;
                }
                assert.ok(new Error().stack);
                assert.strictEqual(findSubstrCount, 4);
                Error.prepareStackTrace = original;
                // Back to Operation 1
                assert.ok(err1.stack);
                assert.strictEqual(findSubstrCount, 4);
            });
            test("Never restored, separate operations", () => {
                // Operation 1
                for (let i = 0; i < 12500; ++i) {
                    Error.prepareStackTrace = Error.prepareStackTrace;
                }
                assert.ok(new Error().stack);
                // Operation 2
                for (let i = 0; i < 12500; ++i) {
                    Error.prepareStackTrace = Error.prepareStackTrace;
                }
                assert.ok(new Error().stack);
                // Operation 3
                for (let i = 0; i < 12500; ++i) {
                    Error.prepareStackTrace = Error.prepareStackTrace;
                }
                assert.ok(new Error().stack);
                // Operation 4
                for (let i = 0; i < 12500; ++i) {
                    Error.prepareStackTrace = Error.prepareStackTrace;
                }
                assert.ok(new Error().stack);
            });
            test("Restored, too many uses before restoration", async () => {
                const original = Error.prepareStackTrace;
                Error.prepareStackTrace = (_, stack) => stack;
                // Operation 1 — more uses of `prepareStackTrace`
                for (let i = 0; i < 10000; ++i) {
                    Error.prepareStackTrace = Error.prepareStackTrace;
                }
                assert.ok(new Error().stack);
                Error.prepareStackTrace = original;
            });
        });
    });
});
//# sourceMappingURL=extensionHostMain.test.js.map