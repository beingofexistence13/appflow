/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/platform/telemetry/test/common/telemetryLogAppender.test", "vs/workbench/api/common/extHostTelemetry", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, uri_1, extensions_1, log_1, telemetryLogAppender_test_1, extHostTelemetry_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTelemetry', function () {
        const mockEnvironment = {
            isExtensionDevelopmentDebug: false,
            extensionDevelopmentLocationURI: undefined,
            extensionTestsLocationURI: undefined,
            appRoot: undefined,
            appName: 'test',
            extensionTelemetryLogResource: uri_1.URI.parse('fake'),
            isExtensionTelemetryLoggingOnly: false,
            appHost: 'test',
            appLanguage: 'en',
            globalStorageHome: uri_1.URI.parse('fake'),
            workspaceStorageHome: uri_1.URI.parse('fake'),
            appUriScheme: 'test',
        };
        const mockTelemetryInfo = {
            firstSessionDate: '2020-01-01T00:00:00.000Z',
            sessionId: 'test',
            machineId: 'test',
        };
        const mockRemote = {
            authority: 'test',
            isRemote: false,
            connectionData: null
        };
        const mockExtensionIdentifier = {
            identifier: new extensions_1.ExtensionIdentifier('test-extension'),
            targetPlatform: "universal" /* TargetPlatform.UNIVERSAL */,
            isBuiltin: true,
            isUserBuiltin: true,
            isUnderDevelopment: true,
            name: 'test-extension',
            publisher: 'vscode',
            version: '1.0.0',
            engines: { vscode: '*' },
            extensionLocation: uri_1.URI.parse('fake')
        };
        const createExtHostTelemetry = () => {
            const extensionTelemetry = new extHostTelemetry_1.ExtHostTelemetry(new class extends (0, workbenchTestServices_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.environment = mockEnvironment;
                    this.telemetryInfo = mockTelemetryInfo;
                    this.remote = mockRemote;
                }
            }, new telemetryLogAppender_test_1.TestTelemetryLoggerService(log_1.DEFAULT_LOG_LEVEL));
            extensionTelemetry.$initializeTelemetryLevel(3 /* TelemetryLevel.USAGE */, true, { usage: true, error: true });
            return extensionTelemetry;
        };
        const createLogger = (functionSpy, extHostTelemetry, options) => {
            const extensionTelemetry = extHostTelemetry ?? createExtHostTelemetry();
            // This is the appender which the extension would contribute
            const appender = {
                sendEventData: (eventName, data) => {
                    functionSpy.dataArr.push({ eventName, data });
                },
                sendErrorData: (exception, data) => {
                    functionSpy.exceptionArr.push({ exception, data });
                },
                flush: () => {
                    functionSpy.flushCalled = true;
                }
            };
            const logger = extensionTelemetry.instantiateLogger(mockExtensionIdentifier, appender, options);
            return logger;
        };
        test('Validate sender instances', function () {
            assert.throws(() => extHostTelemetry_1.ExtHostTelemetryLogger.validateSender(null));
            assert.throws(() => extHostTelemetry_1.ExtHostTelemetryLogger.validateSender(1));
            assert.throws(() => extHostTelemetry_1.ExtHostTelemetryLogger.validateSender({}));
            assert.throws(() => {
                extHostTelemetry_1.ExtHostTelemetryLogger.validateSender({
                    sendErrorData: () => { },
                    sendEventData: true
                });
            });
            assert.throws(() => {
                extHostTelemetry_1.ExtHostTelemetryLogger.validateSender({
                    sendErrorData: 123,
                    sendEventData: () => { },
                });
            });
            assert.throws(() => {
                extHostTelemetry_1.ExtHostTelemetryLogger.validateSender({
                    sendErrorData: () => { },
                    sendEventData: () => { },
                    flush: true
                });
            });
        });
        test('Ensure logger gets proper telemetry level during initialization', function () {
            const extensionTelemetry = createExtHostTelemetry();
            let config = extensionTelemetry.getTelemetryDetails();
            assert.strictEqual(config.isCrashEnabled, true);
            assert.strictEqual(config.isUsageEnabled, true);
            assert.strictEqual(config.isErrorsEnabled, true);
            // Initialize would never be called twice, but this is just for testing
            extensionTelemetry.$initializeTelemetryLevel(2 /* TelemetryLevel.ERROR */, true, { usage: true, error: true });
            config = extensionTelemetry.getTelemetryDetails();
            assert.strictEqual(config.isCrashEnabled, true);
            assert.strictEqual(config.isUsageEnabled, false);
            assert.strictEqual(config.isErrorsEnabled, true);
            extensionTelemetry.$initializeTelemetryLevel(1 /* TelemetryLevel.CRASH */, true, { usage: true, error: true });
            config = extensionTelemetry.getTelemetryDetails();
            assert.strictEqual(config.isCrashEnabled, true);
            assert.strictEqual(config.isUsageEnabled, false);
            assert.strictEqual(config.isErrorsEnabled, false);
            extensionTelemetry.$initializeTelemetryLevel(3 /* TelemetryLevel.USAGE */, true, { usage: false, error: true });
            config = extensionTelemetry.getTelemetryDetails();
            assert.strictEqual(config.isCrashEnabled, true);
            assert.strictEqual(config.isUsageEnabled, false);
            assert.strictEqual(config.isErrorsEnabled, true);
        });
        test('Simple log event to TelemetryLogger', function () {
            const functionSpy = { dataArr: [], exceptionArr: [], flushCalled: false };
            const logger = createLogger(functionSpy);
            logger.logUsage('test-event', { 'test-data': 'test-data' });
            assert.strictEqual(functionSpy.dataArr.length, 1);
            assert.strictEqual(functionSpy.dataArr[0].eventName, `${mockExtensionIdentifier.name}/test-event`);
            assert.strictEqual(functionSpy.dataArr[0].data['test-data'], 'test-data');
            logger.logUsage('test-event', { 'test-data': 'test-data' });
            assert.strictEqual(functionSpy.dataArr.length, 2);
            logger.logError('test-event', { 'test-data': 'test-data' });
            assert.strictEqual(functionSpy.dataArr.length, 3);
            logger.logError(new Error('test-error'), { 'test-data': 'test-data' });
            assert.strictEqual(functionSpy.dataArr.length, 3);
            assert.strictEqual(functionSpy.exceptionArr.length, 1);
            // Assert not flushed
            assert.strictEqual(functionSpy.flushCalled, false);
            // Call flush and assert that flush occurs
            logger.dispose();
            assert.strictEqual(functionSpy.flushCalled, true);
        });
        test('Simple log event to TelemetryLogger with options', function () {
            const functionSpy = { dataArr: [], exceptionArr: [], flushCalled: false };
            const logger = createLogger(functionSpy, undefined, { additionalCommonProperties: { 'common.foo': 'bar' } });
            logger.logUsage('test-event', { 'test-data': 'test-data' });
            assert.strictEqual(functionSpy.dataArr.length, 1);
            assert.strictEqual(functionSpy.dataArr[0].eventName, `${mockExtensionIdentifier.name}/test-event`);
            assert.strictEqual(functionSpy.dataArr[0].data['test-data'], 'test-data');
            assert.strictEqual(functionSpy.dataArr[0].data['common.foo'], 'bar');
            logger.logUsage('test-event', { 'test-data': 'test-data' });
            assert.strictEqual(functionSpy.dataArr.length, 2);
            logger.logError('test-event', { 'test-data': 'test-data' });
            assert.strictEqual(functionSpy.dataArr.length, 3);
            logger.logError(new Error('test-error'), { 'test-data': 'test-data' });
            assert.strictEqual(functionSpy.dataArr.length, 3);
            assert.strictEqual(functionSpy.exceptionArr.length, 1);
            // Assert not flushed
            assert.strictEqual(functionSpy.flushCalled, false);
            // Call flush and assert that flush occurs
            logger.dispose();
            assert.strictEqual(functionSpy.flushCalled, true);
        });
        test('Ensure logger properly cleans PII', function () {
            const functionSpy = { dataArr: [], exceptionArr: [], flushCalled: false };
            const logger = createLogger(functionSpy);
            // Log an event with a bunch of PII, this should all get cleaned out
            logger.logUsage('test-event', {
                'fake-password': 'pwd=123',
                'fake-email': 'no-reply@example.com',
                'fake-token': 'token=123',
                'fake-slack-token': 'xoxp-123',
                'fake-path': '/Users/username/.vscode/extensions',
            });
            assert.strictEqual(functionSpy.dataArr.length, 1);
            assert.strictEqual(functionSpy.dataArr[0].eventName, `${mockExtensionIdentifier.name}/test-event`);
            assert.strictEqual(functionSpy.dataArr[0].data['fake-password'], '<REDACTED: Generic Secret>');
            assert.strictEqual(functionSpy.dataArr[0].data['fake-email'], '<REDACTED: Email>');
            assert.strictEqual(functionSpy.dataArr[0].data['fake-token'], '<REDACTED: Generic Secret>');
            assert.strictEqual(functionSpy.dataArr[0].data['fake-slack-token'], '<REDACTED: Slack Token>');
            assert.strictEqual(functionSpy.dataArr[0].data['fake-path'], '<REDACTED: user-file-path>');
        });
        test('Ensure output channel is logged to', function () {
            // Have to re-duplicate code here because I the logger service isn't exposed in the simple setup functions
            const loggerService = new telemetryLogAppender_test_1.TestTelemetryLoggerService(log_1.LogLevel.Trace);
            const extensionTelemetry = new extHostTelemetry_1.ExtHostTelemetry(new class extends (0, workbenchTestServices_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.environment = mockEnvironment;
                    this.telemetryInfo = mockTelemetryInfo;
                    this.remote = mockRemote;
                }
            }, loggerService);
            extensionTelemetry.$initializeTelemetryLevel(3 /* TelemetryLevel.USAGE */, true, { usage: true, error: true });
            const functionSpy = { dataArr: [], exceptionArr: [], flushCalled: false };
            const logger = createLogger(functionSpy, extensionTelemetry);
            // Ensure headers are logged on instantiation
            assert.strictEqual(loggerService.createLogger().logs.length, 2);
            logger.logUsage('test-event', { 'test-data': 'test-data' });
            // Initial header is logged then the event
            const logs = loggerService.createLogger().logs;
            console.log(logs[0]);
            assert.strictEqual(loggerService.createLogger().logs.length, 3);
            assert.ok(loggerService.createLogger().logs[2].startsWith('test-extension/test-event'));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRlbGVtZXRyeS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvZXh0SG9zdFRlbGVtZXRyeS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBb0JoRyxLQUFLLENBQUMsa0JBQWtCLEVBQUU7UUFFekIsTUFBTSxlQUFlLEdBQWlCO1lBQ3JDLDJCQUEyQixFQUFFLEtBQUs7WUFDbEMsK0JBQStCLEVBQUUsU0FBUztZQUMxQyx5QkFBeUIsRUFBRSxTQUFTO1lBQ3BDLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLE9BQU8sRUFBRSxNQUFNO1lBQ2YsNkJBQTZCLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDaEQsK0JBQStCLEVBQUUsS0FBSztZQUN0QyxPQUFPLEVBQUUsTUFBTTtZQUNmLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLGlCQUFpQixFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ3BDLG9CQUFvQixFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ3ZDLFlBQVksRUFBRSxNQUFNO1NBQ3BCLENBQUM7UUFFRixNQUFNLGlCQUFpQixHQUFHO1lBQ3pCLGdCQUFnQixFQUFFLDBCQUEwQjtZQUM1QyxTQUFTLEVBQUUsTUFBTTtZQUNqQixTQUFTLEVBQUUsTUFBTTtTQUNqQixDQUFDO1FBRUYsTUFBTSxVQUFVLEdBQUc7WUFDbEIsU0FBUyxFQUFFLE1BQU07WUFDakIsUUFBUSxFQUFFLEtBQUs7WUFDZixjQUFjLEVBQUUsSUFBSTtTQUNwQixDQUFDO1FBRUYsTUFBTSx1QkFBdUIsR0FBMEI7WUFDdEQsVUFBVSxFQUFFLElBQUksZ0NBQW1CLENBQUMsZ0JBQWdCLENBQUM7WUFDckQsY0FBYyw0Q0FBMEI7WUFDeEMsU0FBUyxFQUFFLElB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