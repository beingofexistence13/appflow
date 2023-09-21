define(["require", "exports", "assert", "vs/base/common/event", "vs/platform/environment/common/environment", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetryLogAppender"], function (require, exports, assert, event_1, environment_1, instantiationServiceMock_1, log_1, productService_1, telemetryLogAppender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$L$b = void 0;
    class TestTelemetryLogger extends log_1.$0i {
        constructor(logLevel = log_1.$8i) {
            super();
            this.logs = [];
            this.setLevel(logLevel);
        }
        trace(message, ...args) {
            if (this.f(log_1.LogLevel.Trace)) {
                this.logs.push(message + JSON.stringify(args));
            }
        }
        debug(message, ...args) {
            if (this.f(log_1.LogLevel.Debug)) {
                this.logs.push(message);
            }
        }
        info(message, ...args) {
            if (this.f(log_1.LogLevel.Info)) {
                this.logs.push(message);
            }
        }
        warn(message, ...args) {
            if (this.f(log_1.LogLevel.Warning)) {
                this.logs.push(message.toString());
            }
        }
        error(message, ...args) {
            if (this.f(log_1.LogLevel.Error)) {
                this.logs.push(message);
            }
        }
        dispose() { }
        flush() { }
    }
    class $L$b {
        constructor(a) {
            this.a = a;
            this.onDidChangeVisibility = event_1.Event.None;
            this.onDidChangeLogLevel = event_1.Event.None;
            this.onDidChangeLoggers = event_1.Event.None;
        }
        getLogger() {
            return this.logger;
        }
        createLogger() {
            if (!this.logger) {
                this.logger = new TestTelemetryLogger(this.a);
            }
            return this.logger;
        }
        setLogLevel() { }
        getLogLevel() { return log_1.LogLevel.Info; }
        setVisibility() { }
        getDefaultLogLevel() { return this.a; }
        registerLogger() { }
        deregisterLogger() { }
        getRegisteredLoggers() { return []; }
        getRegisteredLogger() { return undefined; }
    }
    exports.$L$b = $L$b;
    suite('TelemetryLogAdapter', () => {
        test('Do not Log Telemetry if log level is not trace', async () => {
            const testLoggerService = new $L$b(log_1.$8i);
            const testInstantiationService = new instantiationServiceMock_1.$L0b();
            const testObject = new telemetryLogAppender_1.$43b(new log_1.$fj(), testLoggerService, testInstantiationService.stub(environment_1.$Ih, {}), testInstantiationService.stub(productService_1.$kj, {}));
            testObject.log('testEvent', { hello: 'world', isTrue: true, numberBetween1And3: 2 });
            assert.strictEqual(testLoggerService.createLogger().logs.length, 2);
            testInstantiationService.dispose();
        });
        test('Log Telemetry if log level is trace', async () => {
            const testLoggerService = new $L$b(log_1.LogLevel.Trace);
            const testInstantiationService = new instantiationServiceMock_1.$L0b();
            const testObject = new telemetryLogAppender_1.$43b(new log_1.$fj(), testLoggerService, testInstantiationService.stub(environment_1.$Ih, {}), testInstantiationService.stub(productService_1.$kj, {}));
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
//# sourceMappingURL=telemetryLogAppender.test.js.map