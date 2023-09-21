define(["require", "exports", "vs/workbench/contrib/tasks/common/problemMatcher", "assert", "vs/base/common/parsers"], function (require, exports, matchers, assert, parsers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ProblemReporter {
        constructor() {
            this.a = new parsers_1.$yF();
            this.b = [];
        }
        info(message) {
            this.b.push(message);
            this.a.state = 1 /* ValidationState.Info */;
        }
        warn(message) {
            this.b.push(message);
            this.a.state = 2 /* ValidationState.Warning */;
        }
        error(message) {
            this.b.push(message);
            this.a.state = 3 /* ValidationState.Error */;
        }
        fatal(message) {
            this.b.push(message);
            this.a.state = 4 /* ValidationState.Fatal */;
        }
        hasMessage(message) {
            return this.b.indexOf(message) !== null;
        }
        get messages() {
            return this.b;
        }
        get state() {
            return this.a.state;
        }
        isOK() {
            return this.a.isOK();
        }
        get status() {
            return this.a;
        }
    }
    suite('ProblemPatternParser', () => {
        let reporter;
        let parser;
        const testRegexp = new RegExp('test');
        setup(() => {
            reporter = new ProblemReporter();
            parser = new matchers.$6F(reporter);
        });
        suite('single-pattern definitions', () => {
            test('parses a pattern defined by only a regexp', () => {
                const problemPattern = {
                    regexp: 'test'
                };
                const parsed = parser.parse(problemPattern);
                assert(reporter.isOK());
                assert.deepStrictEqual(parsed, {
                    regexp: testRegexp,
                    kind: matchers.ProblemLocationKind.Location,
                    file: 1,
                    line: 2,
                    character: 3,
                    message: 0
                });
            });
            test('does not sets defaults for line and character if kind is File', () => {
                const problemPattern = {
                    regexp: 'test',
                    kind: 'file'
                };
                const parsed = parser.parse(problemPattern);
                assert.deepStrictEqual(parsed, {
                    regexp: testRegexp,
                    kind: matchers.ProblemLocationKind.File,
                    file: 1,
                    message: 0
                });
            });
        });
        suite('multi-pattern definitions', () => {
            test('defines a pattern based on regexp and property fields, with file/line location', () => {
                const problemPattern = [
                    { regexp: 'test', file: 3, line: 4, column: 5, message: 6 }
                ];
                const parsed = parser.parse(problemPattern);
                assert(reporter.isOK());
                assert.deepStrictEqual(parsed, [{
                        regexp: testRegexp,
                        kind: matchers.ProblemLocationKind.Location,
                        file: 3,
                        line: 4,
                        character: 5,
                        message: 6
                    }]);
            });
            test('defines a pattern bsaed on regexp and property fields, with location', () => {
                const problemPattern = [
                    { regexp: 'test', file: 3, location: 4, message: 6 }
                ];
                const parsed = parser.parse(problemPattern);
                assert(reporter.isOK());
                assert.deepStrictEqual(parsed, [{
                        regexp: testRegexp,
                        kind: matchers.ProblemLocationKind.Location,
                        file: 3,
                        location: 4,
                        message: 6
                    }]);
            });
            test('accepts a pattern that provides the fields from multiple entries', () => {
                const problemPattern = [
                    { regexp: 'test', file: 3 },
                    { regexp: 'test1', line: 4 },
                    { regexp: 'test2', column: 5 },
                    { regexp: 'test3', message: 6 }
                ];
                const parsed = parser.parse(problemPattern);
                assert(reporter.isOK());
                assert.deepStrictEqual(parsed, [
                    { regexp: testRegexp, kind: matchers.ProblemLocationKind.Location, file: 3 },
                    { regexp: new RegExp('test1'), line: 4 },
                    { regexp: new RegExp('test2'), character: 5 },
                    { regexp: new RegExp('test3'), message: 6 }
                ]);
            });
            test('forbids setting the loop flag outside of the last element in the array', () => {
                const problemPattern = [
                    { regexp: 'test', file: 3, loop: true },
                    { regexp: 'test1', line: 4 }
                ];
                const parsed = parser.parse(problemPattern);
                assert.strictEqual(null, parsed);
                assert.strictEqual(3 /* ValidationState.Error */, reporter.state);
                assert(reporter.hasMessage('The loop property is only supported on the last line matcher.'));
            });
            test('forbids setting the kind outside of the first element of the array', () => {
                const problemPattern = [
                    { regexp: 'test', file: 3 },
                    { regexp: 'test1', kind: 'file', line: 4 }
                ];
                const parsed = parser.parse(problemPattern);
                assert.strictEqual(null, parsed);
                assert.strictEqual(3 /* ValidationState.Error */, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. The kind property must be provided only in the first element'));
            });
            test('kind: Location requires a regexp', () => {
                const problemPattern = [
                    { file: 0, line: 1, column: 20, message: 0 }
                ];
                const parsed = parser.parse(problemPattern);
                assert.strictEqual(null, parsed);
                assert.strictEqual(3 /* ValidationState.Error */, reporter.state);
                assert(reporter.hasMessage('The problem pattern is missing a regular expression.'));
            });
            test('kind: Location requires a regexp on every entry', () => {
                const problemPattern = [
                    { regexp: 'test', file: 3 },
                    { line: 4 },
                    { regexp: 'test2', column: 5 },
                    { regexp: 'test3', message: 6 }
                ];
                const parsed = parser.parse(problemPattern);
                assert.strictEqual(null, parsed);
                assert.strictEqual(3 /* ValidationState.Error */, reporter.state);
                assert(reporter.hasMessage('The problem pattern is missing a regular expression.'));
            });
            test('kind: Location requires a message', () => {
                const problemPattern = [
                    { regexp: 'test', file: 0, line: 1, column: 20 }
                ];
                const parsed = parser.parse(problemPattern);
                assert.strictEqual(null, parsed);
                assert.strictEqual(3 /* ValidationState.Error */, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must have at least have a file and a message.'));
            });
            test('kind: Location requires a file', () => {
                const problemPattern = [
                    { regexp: 'test', line: 1, column: 20, message: 0 }
                ];
                const parsed = parser.parse(problemPattern);
                assert.strictEqual(null, parsed);
                assert.strictEqual(3 /* ValidationState.Error */, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must either have kind: "file" or have a line or location match group.'));
            });
            test('kind: Location requires either a line or location', () => {
                const problemPattern = [
                    { regexp: 'test', file: 1, column: 20, message: 0 }
                ];
                const parsed = parser.parse(problemPattern);
                assert.strictEqual(null, parsed);
                assert.strictEqual(3 /* ValidationState.Error */, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must either have kind: "file" or have a line or location match group.'));
            });
            test('kind: File accepts a regexp, file and message', () => {
                const problemPattern = [
                    { regexp: 'test', file: 2, kind: 'file', message: 6 }
                ];
                const parsed = parser.parse(problemPattern);
                assert(reporter.isOK());
                assert.deepStrictEqual(parsed, [{
                        regexp: testRegexp,
                        kind: matchers.ProblemLocationKind.File,
                        file: 2,
                        message: 6
                    }]);
            });
            test('kind: File requires a file', () => {
                const problemPattern = [
                    { regexp: 'test', kind: 'file', message: 6 }
                ];
                const parsed = parser.parse(problemPattern);
                assert.strictEqual(null, parsed);
                assert.strictEqual(3 /* ValidationState.Error */, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must have at least have a file and a message.'));
            });
            test('kind: File requires a message', () => {
                const problemPattern = [
                    { regexp: 'test', kind: 'file', file: 6 }
                ];
                const parsed = parser.parse(problemPattern);
                assert.strictEqual(null, parsed);
                assert.strictEqual(3 /* ValidationState.Error */, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must have at least have a file and a message.'));
            });
        });
    });
});
//# sourceMappingURL=problemMatcher.test.js.map