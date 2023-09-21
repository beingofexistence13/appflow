define(["require", "exports", "vs/workbench/contrib/tasks/common/problemMatcher", "assert", "vs/base/common/parsers"], function (require, exports, matchers, assert, parsers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ProblemReporter {
        constructor() {
            this._validationStatus = new parsers_1.ValidationStatus();
            this._messages = [];
        }
        info(message) {
            this._messages.push(message);
            this._validationStatus.state = 1 /* ValidationState.Info */;
        }
        warn(message) {
            this._messages.push(message);
            this._validationStatus.state = 2 /* ValidationState.Warning */;
        }
        error(message) {
            this._messages.push(message);
            this._validationStatus.state = 3 /* ValidationState.Error */;
        }
        fatal(message) {
            this._messages.push(message);
            this._validationStatus.state = 4 /* ValidationState.Fatal */;
        }
        hasMessage(message) {
            return this._messages.indexOf(message) !== null;
        }
        get messages() {
            return this._messages;
        }
        get state() {
            return this._validationStatus.state;
        }
        isOK() {
            return this._validationStatus.isOK();
        }
        get status() {
            return this._validationStatus;
        }
    }
    suite('ProblemPatternParser', () => {
        let reporter;
        let parser;
        const testRegexp = new RegExp('test');
        setup(() => {
            reporter = new ProblemReporter();
            parser = new matchers.ProblemPatternParser(reporter);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvYmxlbU1hdGNoZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL3Rlc3QvY29tbW9uL3Byb2JsZW1NYXRjaGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBTSxlQUFlO1FBSXBCO1lBQ0MsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksMEJBQWdCLEVBQUUsQ0FBQztZQUNoRCxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBRU0sSUFBSSxDQUFDLE9BQWU7WUFDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssK0JBQXVCLENBQUM7UUFDckQsQ0FBQztRQUVNLElBQUksQ0FBQyxPQUFlO1lBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLGtDQUEwQixDQUFDO1FBQ3hELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBZTtZQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxnQ0FBd0IsQ0FBQztRQUN0RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQWU7WUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssZ0NBQXdCLENBQUM7UUFDdEQsQ0FBQztRQUVNLFVBQVUsQ0FBQyxPQUFlO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDO1FBQ2pELENBQUM7UUFDRCxJQUFXLFFBQVE7WUFDbEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxJQUFXLEtBQUs7WUFDZixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7UUFDckMsQ0FBQztRQUVNLElBQUk7WUFDVixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBVyxNQUFNO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQy9CLENBQUM7S0FDRDtJQUVELEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7UUFDbEMsSUFBSSxRQUF5QixDQUFDO1FBQzlCLElBQUksTUFBcUMsQ0FBQztRQUMxQyxNQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV0QyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsUUFBUSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7WUFDakMsTUFBTSxHQUFHLElBQUksUUFBUSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtZQUN4QyxJQUFJLENBQUMsMkNBQTJDLEVBQUUsR0FBRyxFQUFFO2dCQUN0RCxNQUFNLGNBQWMsR0FBb0M7b0JBQ3ZELE1BQU0sRUFBRSxNQUFNO2lCQUNkLENBQUM7Z0JBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRTtvQkFDOUIsTUFBTSxFQUFFLFVBQVU7b0JBQ2xCLElBQUksRUFBRSxRQUFRLENBQUMsbUJBQW1CLENBQUMsUUFBUTtvQkFDM0MsSUFBSSxFQUFFLENBQUM7b0JBQ1AsSUFBSSxFQUFFLENBQUM7b0JBQ1AsU0FBUyxFQUFFLENBQUM7b0JBQ1osT0FBTyxFQUFFLENBQUM7aUJBQ1YsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsK0RBQStELEVBQUUsR0FBRyxFQUFFO2dCQUMxRSxNQUFNLGNBQWMsR0FBb0M7b0JBQ3ZELE1BQU0sRUFBRSxNQUFNO29CQUNkLElBQUksRUFBRSxNQUFNO2lCQUNaLENBQUM7Z0JBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUU7b0JBQzlCLE1BQU0sRUFBRSxVQUFVO29CQUNsQixJQUFJLEVBQUUsUUFBUSxDQUFDLG1CQUFtQixDQUFDLElBQUk7b0JBQ3ZDLElBQUksRUFBRSxDQUFDO29CQUNQLE9BQU8sRUFBRSxDQUFDO2lCQUNWLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxnRkFBZ0YsRUFBRSxHQUFHLEVBQUU7Z0JBQzNGLE1BQU0sY0FBYyxHQUE0QztvQkFDL0QsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7aUJBQzNELENBQUM7Z0JBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFDNUIsQ0FBQzt3QkFDQSxNQUFNLEVBQUUsVUFBVTt3QkFDbEIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRO3dCQUMzQyxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxTQUFTLEVBQUUsQ0FBQzt3QkFDWixPQUFPLEVBQUUsQ0FBQztxQkFDVixDQUFDLENBQ0YsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLHNFQUFzRSxFQUFFLEdBQUcsRUFBRTtnQkFDakYsTUFBTSxjQUFjLEdBQTRDO29CQUMvRCxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7aUJBQ3BELENBQUM7Z0JBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFDNUIsQ0FBQzt3QkFDQSxNQUFNLEVBQUUsVUFBVTt3QkFDbEIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRO3dCQUMzQyxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxRQUFRLEVBQUUsQ0FBQzt3QkFDWCxPQUFPLEVBQUUsQ0FBQztxQkFDVixDQUFDLENBQ0YsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGtFQUFrRSxFQUFFLEdBQUcsRUFBRTtnQkFDN0UsTUFBTSxjQUFjLEdBQTRDO29CQUMvRCxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTtvQkFDM0IsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUU7b0JBQzVCLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO29CQUM5QixFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtpQkFDL0IsQ0FBQztnQkFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO29CQUM5QixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTtvQkFDNUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTtvQkFDeEMsRUFBRSxNQUFNLEVBQUUsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtvQkFDN0MsRUFBRSxNQUFNLEVBQUUsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtpQkFDM0MsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsd0VBQXdFLEVBQUUsR0FBRyxFQUFFO2dCQUNuRixNQUFNLGNBQWMsR0FBNEM7b0JBQy9ELEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7b0JBQ3ZDLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFO2lCQUM1QixDQUFDO2dCQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsV0FBVyxnQ0FBd0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQywrREFBK0QsQ0FBQyxDQUFDLENBQUM7WUFDOUYsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsb0VBQW9FLEVBQUUsR0FBRyxFQUFFO2dCQUMvRSxNQUFNLGNBQWMsR0FBNEM7b0JBQy9ELEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFO29CQUMzQixFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFO2lCQUMxQyxDQUFDO2dCQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsV0FBVyxnQ0FBd0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyw4RkFBOEYsQ0FBQyxDQUFDLENBQUM7WUFDN0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxNQUFNLGNBQWMsR0FBNEM7b0JBQy9ELEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtpQkFDNUMsQ0FBQztnQkFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLFdBQVcsZ0NBQXdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsc0RBQXNELENBQUMsQ0FBQyxDQUFDO1lBQ3JGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGlEQUFpRCxFQUFFLEdBQUcsRUFBRTtnQkFDNUQsTUFBTSxjQUFjLEdBQTRDO29CQUMvRCxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTtvQkFDM0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFO29CQUNYLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO29CQUM5QixFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtpQkFDL0IsQ0FBQztnQkFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLFdBQVcsZ0NBQXdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsc0RBQXNELENBQUMsQ0FBQyxDQUFDO1lBQ3JGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLG1DQUFtQyxFQUFFLEdBQUcsRUFBRTtnQkFDOUMsTUFBTSxjQUFjLEdBQTRDO29CQUMvRCxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7aUJBQ2hELENBQUM7Z0JBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxXQUFXLGdDQUF3QixRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFELE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGtGQUFrRixDQUFDLENBQUMsQ0FBQztZQUNqSCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzNDLE1BQU0sY0FBYyxHQUE0QztvQkFDL0QsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO2lCQUNuRCxDQUFDO2dCQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsV0FBVyxnQ0FBd0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQywwR0FBMEcsQ0FBQyxDQUFDLENBQUM7WUFDekksQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsbURBQW1ELEVBQUUsR0FBRyxFQUFFO2dCQUM5RCxNQUFNLGNBQWMsR0FBNEM7b0JBQy9ELEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtpQkFDbkQsQ0FBQztnQkFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLFdBQVcsZ0NBQXdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsMEdBQTBHLENBQUMsQ0FBQyxDQUFDO1lBQ3pJLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtnQkFDMUQsTUFBTSxjQUFjLEdBQTRDO29CQUMvRCxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7aUJBQ3JELENBQUM7Z0JBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFDNUIsQ0FBQzt3QkFDQSxNQUFNLEVBQUUsVUFBVTt3QkFDbEIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJO3dCQUN2QyxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxPQUFPLEVBQUUsQ0FBQztxQkFDVixDQUFDLENBQ0YsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtnQkFDdkMsTUFBTSxjQUFjLEdBQTRDO29CQUMvRCxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO2lCQUM1QyxDQUFDO2dCQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsV0FBVyxnQ0FBd0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxrRkFBa0YsQ0FBQyxDQUFDLENBQUM7WUFDakgsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFO2dCQUMxQyxNQUFNLGNBQWMsR0FBNEM7b0JBQy9ELEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUU7aUJBQ3pDLENBQUM7Z0JBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxXQUFXLGdDQUF3QixRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFELE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGtGQUFrRixDQUFDLENBQUMsQ0FBQztZQUNqSCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==