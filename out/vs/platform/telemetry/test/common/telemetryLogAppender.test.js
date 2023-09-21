define(["require", "exports", "assert", "vs/base/common/event", "vs/platform/environment/common/environment", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetryLogAppender"], function (require, exports, assert, event_1, environment_1, instantiationServiceMock_1, log_1, productService_1, telemetryLogAppender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestTelemetryLoggerService = void 0;
    class TestTelemetryLogger extends log_1.AbstractLogger {
        constructor(logLevel = log_1.DEFAULT_LOG_LEVEL) {
            super();
            this.logs = [];
            this.setLevel(logLevel);
        }
        trace(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Trace)) {
                this.logs.push(message + JSON.stringify(args));
            }
        }
        debug(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Debug)) {
                this.logs.push(message);
            }
        }
        info(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Info)) {
                this.logs.push(message);
            }
        }
        warn(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Warning)) {
                this.logs.push(message.toString());
            }
        }
        error(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Error)) {
                this.logs.push(message);
            }
        }
        dispose() { }
        flush() { }
    }
    class TestTelemetryLoggerService {
        constructor(logLevel) {
            this.logLevel = logLevel;
            this.onDidChangeVisibility = event_1.Event.None;
            this.onDidChangeLogLevel = event_1.Event.None;
            this.onDidChangeLoggers = event_1.Event.None;
        }
        getLogger() {
            return this.logger;
        }
        createLogger() {
            if (!this.logger) {
                this.logger = new TestTelemetryLogger(this.logLevel);
            }
            return this.logger;
        }
        setLogLevel() { }
        getLogLevel() { return log_1.LogLevel.Info; }
        setVisibility() { }
        getDefaultLogLevel() { return this.logLevel; }
        registerLogger() { }
        deregisterLogger() { }
        getRegisteredLoggers() { return []; }
        getRegisteredLogger() { return undefined; }
    }
    exports.TestTelemetryLoggerService = TestTelemetryLoggerService;
    suite('TelemetryLogAdapter', () => {
        test('Do not Log Telemetry if log level is not trace', async () => {
            const testLoggerService = new TestTelemetryLoggerService(log_1.DEFAULT_LOG_LEVEL);
            const testInstantiationService = new instantiationServiceMock_1.TestInstantiationService();
            const testObject = new telemetryLogAppender_1.TelemetryLogAppender(new log_1.NullLogService(), testLoggerService, testInstantiationService.stub(environment_1.IEnvironmentService, {}), testInstantiationService.stub(productService_1.IProductService, {}));
            testObject.log('testEvent', { hello: 'world', isTrue: true, numberBetween1And3: 2 });
            assert.strictEqual(testLoggerService.createLogger().logs.length, 2);
            testInstantiationService.dispose();
        });
        test('Log Telemetry if log level is trace', async () => {
            const testLoggerService = new TestTelemetryLoggerService(log_1.LogLevel.Trace);
            const testInstantiationService = new instantiationServiceMock_1.TestInstantiationService();
            const testObject = new telemetryLogAppender_1.TelemetryLogAppender(new log_1.NullLogService(), testLoggerService, testInstantiationService.stub(environment_1.IEnvironmentService, {}), testInstantiationService.stub(productService_1.IProductService, {}));
            testObject.log('testEvent', { hello: 'world', isTrue: true, numberBetween1And3: 2 });
            assert.strictEqual(testLoggerService.createLogger().logs[2], 'telemetry/testEvent' + JSON.stringify([{
                    properties: {
                        hello: 'world',
                    },
                    measurements: {
                        isTrue: 1, numberBetween1And3: 2
                    }
                }]));
            testInstantiationService.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5TG9nQXBwZW5kZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RlbGVtZXRyeS90ZXN0L2NvbW1vbi90ZWxlbWV0cnlMb2dBcHBlbmRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFZQSxNQUFNLG1CQUFvQixTQUFRLG9CQUFjO1FBSS9DLFlBQVksV0FBcUIsdUJBQWlCO1lBQ2pELEtBQUssRUFBRSxDQUFDO1lBSEYsU0FBSSxHQUFhLEVBQUUsQ0FBQztZQUkxQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVztZQUNwQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQy9DO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1lBQ3BDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3hCO1FBQ0YsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1lBQ25DLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3hCO1FBQ0YsQ0FBQztRQUVELElBQUksQ0FBQyxPQUF1QixFQUFFLEdBQUcsSUFBVztZ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