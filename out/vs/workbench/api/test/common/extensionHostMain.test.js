/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/ternarySearchTree", "vs/base/test/common/mock", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTelemetry", "vs/workbench/api/common/extensionHostMain", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, errors_1, platform_1, ternarySearchTree_1, mock_1, instantiationService_1, serviceCollection_1, log_1, extHostExtensionService_1, extHostRpcService_1, extHostTelemetry_1, extensionHostMain_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionHostMain#ErrorHandler - Wrapping prepareStackTrace can cause slowdown and eventual stack overflow #184926 ', function () {
        if (platform_1.isFirefox || platform_1.isSafari) {
            return;
        }
        const extensionsIndex = ternarySearchTree_1.TernarySearchTree.forUris();
        const mainThreadExtensionsService = new class extends (0, mock_1.mock)() {
            $onExtensionRuntimeError(extensionId, data) {
            }
        };
        const collection = new serviceCollection_1.ServiceCollection([log_1.ILogService, new log_1.NullLogService()], [extHostTelemetry_1.IExtHostTelemetry, new class extends (0, mock_1.mock)() {
                onExtensionError(extension, error) {
                    return true;
                }
            }], [extHostExtensionService_1.IExtHostExtensionService, new class extends (0, mock_1.mock)() {
                getExtensionPathIndex() {
                    return new class extends extHostExtensionService_1.ExtensionPaths {
                        findSubstr(key) {
                            findSubstrCount++;
                            return extensions_1.nullExtensionDescription;
                        }
                    }(extensionsIndex);
                }
            }], [extHostRpcService_1.IExtHostRpcService, new class extends (0, mock_1.mock)() {
                getProxy(identifier) {
                    return mainThreadExtensionsService;
                }
            }]);
        const originalPrepareStackTrace = Error.prepareStackTrace;
        const insta = new instantiationService_1.InstantiationService(collection, false);
        let existingErrorHandler;
        let findSubstrCount = 0;
        suiteSetup(async function () {
            existingErrorHandler = errors_1.errorHandler.getUnexpectedErrorHandler();
            await insta.invokeFunction(extensionHostMain_1.ErrorHandler.installFullHandler);
        });
        suiteTeardown(function () {
            errors_1.errorHandler.setUnexpectedErrorHandler(existingErrorHandler);
        });
        setup(async function () {
            findSubstrCount = 0;
        });
        teardown(() => {
            Error.prepareStackTrace = originalPrepareStackTrace;
        });
        test('basics', function () {
            const err = new Error('test1');
            (0, errors_1.onUnexpectedError)(err);
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
            (0, errors_1.onUnexpectedError)(probeErr);
            assert.strictEqual(findSubstrCount, 1);
            // one more error
            const err = new Error('test2');
            (0, errors_1.onUnexpectedError)(err);
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
            (0, errors_1.onUnexpectedError)(probeErr);
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
            (0, errors_1.onUnexpectedError)(probeErr);
            assert.strictEqual(findSubstrCount, 1);
            const probeErr2 = new Error();
            (0, errors_1.onUnexpectedError)(probeErr2);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdE1haW4udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvdGVzdC9jb21tb24vZXh0ZW5zaW9uSG9zdE1haW4udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXFCaEcsS0FBSyxDQUFDLHFIQUFxSCxFQUFFO1FBRTVILElBQUksb0JBQVMsSUFBSSxtQkFBUSxFQUFFO1lBQzFCLE9BQU87U0FDUDtRQUVELE1BQU0sZUFBZSxHQUFHLHFDQUFpQixDQUFDLE9BQU8sRUFBeUIsQ0FBQztRQUMzRSxNQUFNLDJCQUEyQixHQUFHLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFtQztZQUNuRix3QkFBd0IsQ0FBQyxXQUFnQyxFQUFFLElBQXFCO1lBRXpGLENBQUM7U0FDRCxDQUFDO1FBRUYsTUFBTSxVQUFVLEdBQUcsSUFBSSxxQ0FBaUIsQ0FDdkMsQ0FBQyxpQkFBVyxFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLEVBQ25DLENBQUMsb0NBQWlCLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQXFCO2dCQUVyRCxnQkFBZ0IsQ0FBQyxTQUE4QixFQUFFLEtBQVk7b0JBQ3JFLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7YUFDRCxDQUFDLEVBQ0YsQ0FBQyxrREFBd0IsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBa0M7Z0JBRWxGLHFCQUFxQjtvQkFDcEIsT0FBTyxJQUFJLEtBQU0sU0FBUSx3Q0FBYzt3QkFDN0IsVUFBVSxDQUFDLEdBQVE7NEJBQzNCLGVBQWUsRUFBRSxDQUFDOzRCQUNsQixPQUFPLHFDQUF3QixDQUFDO3dCQUNqQyxDQUFDO3FCQUVELENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7YUFDRCxDQUFDLEVBQ0YsQ0FBQyxzQ0FBa0IsRUFBRSxJQUFJ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