/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/uri"], function (require, exports, assert_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildTestUri = exports.parseTestUri = exports.TestUriType = exports.TEST_DATA_SCHEME = void 0;
    exports.TEST_DATA_SCHEME = 'vscode-test-data';
    var TestUriType;
    (function (TestUriType) {
        /** All console output for a task */
        TestUriType[TestUriType["TaskOutput"] = 0] = "TaskOutput";
        /** All console output for a test in a task */
        TestUriType[TestUriType["TestOutput"] = 1] = "TestOutput";
        /** Specific message in a test */
        TestUriType[TestUriType["ResultMessage"] = 2] = "ResultMessage";
        /** Specific actual output message in a test */
        TestUriType[TestUriType["ResultActualOutput"] = 3] = "ResultActualOutput";
        /** Specific expected output message in a test */
        TestUriType[TestUriType["ResultExpectedOutput"] = 4] = "ResultExpectedOutput";
    })(TestUriType || (exports.TestUriType = TestUriType = {}));
    var TestUriParts;
    (function (TestUriParts) {
        TestUriParts["Results"] = "results";
        TestUriParts["AllOutput"] = "output";
        TestUriParts["Messages"] = "message";
        TestUriParts["Text"] = "TestFailureMessage";
        TestUriParts["ActualOutput"] = "ActualOutput";
        TestUriParts["ExpectedOutput"] = "ExpectedOutput";
    })(TestUriParts || (TestUriParts = {}));
    const parseTestUri = (uri) => {
        const type = uri.authority;
        const [resultId, ...request] = uri.path.slice(1).split('/');
        if (request[0] === "message" /* TestUriParts.Messages */) {
            const taskIndex = Number(request[1]);
            const testExtId = uri.query;
            const index = Number(request[2]);
            const part = request[3];
            if (type === "results" /* TestUriParts.Results */) {
                switch (part) {
                    case "TestFailureMessage" /* TestUriParts.Text */:
                        return { resultId, taskIndex, testExtId, messageIndex: index, type: 2 /* TestUriType.ResultMessage */ };
                    case "ActualOutput" /* TestUriParts.ActualOutput */:
                        return { resultId, taskIndex, testExtId, messageIndex: index, type: 3 /* TestUriType.ResultActualOutput */ };
                    case "ExpectedOutput" /* TestUriParts.ExpectedOutput */:
                        return { resultId, taskIndex, testExtId, messageIndex: index, type: 4 /* TestUriType.ResultExpectedOutput */ };
                    case "message" /* TestUriParts.Messages */:
                }
            }
        }
        if (request[0] === "output" /* TestUriParts.AllOutput */) {
            const testExtId = uri.query;
            const taskIndex = Number(request[1]);
            return testExtId
                ? { resultId, taskIndex, testExtId, type: 1 /* TestUriType.TestOutput */ }
                : { resultId, taskIndex, type: 0 /* TestUriType.TaskOutput */ };
        }
        return undefined;
    };
    exports.parseTestUri = parseTestUri;
    const buildTestUri = (parsed) => {
        const uriParts = {
            scheme: exports.TEST_DATA_SCHEME,
            authority: "results" /* TestUriParts.Results */
        };
        if (parsed.type === 0 /* TestUriType.TaskOutput */) {
            return uri_1.URI.from({
                ...uriParts,
                path: ['', parsed.resultId, "output" /* TestUriParts.AllOutput */, parsed.taskIndex].join('/'),
            });
        }
        const msgRef = (resultId, ...remaining) => uri_1.URI.from({
            ...uriParts,
            query: parsed.testExtId,
            path: ['', resultId, "message" /* TestUriParts.Messages */, ...remaining].join('/'),
        });
        switch (parsed.type) {
            case 3 /* TestUriType.ResultActualOutput */:
                return msgRef(parsed.resultId, parsed.taskIndex, parsed.messageIndex, "ActualOutput" /* TestUriParts.ActualOutput */);
            case 4 /* TestUriType.ResultExpectedOutput */:
                return msgRef(parsed.resultId, parsed.taskIndex, parsed.messageIndex, "ExpectedOutput" /* TestUriParts.ExpectedOutput */);
            case 2 /* TestUriType.ResultMessage */:
                return msgRef(parsed.resultId, parsed.taskIndex, parsed.messageIndex, "TestFailureMessage" /* TestUriParts.Text */);
            case 1 /* TestUriType.TestOutput */:
                return uri_1.URI.from({
                    ...uriParts,
                    query: parsed.testExtId,
                    path: ['', parsed.resultId, "output" /* TestUriParts.AllOutput */, parsed.taskIndex].join('/'),
                });
            default:
                (0, assert_1.assertNever)(parsed, 'Invalid test uri');
        }
    };
    exports.buildTestUri = buildTestUri;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ1VyaS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvY29tbW9uL3Rlc3RpbmdVcmkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS25GLFFBQUEsZ0JBQWdCLEdBQUcsa0JBQWtCLENBQUM7SUFFbkQsSUFBa0IsV0FXakI7SUFYRCxXQUFrQixXQUFXO1FBQzVCLG9DQUFvQztRQUNwQyx5REFBVSxDQUFBO1FBQ1YsOENBQThDO1FBQzlDLHlEQUFVLENBQUE7UUFDVixpQ0FBaUM7UUFDakMsK0RBQWEsQ0FBQTtRQUNiLCtDQUErQztRQUMvQyx5RUFBa0IsQ0FBQTtRQUNsQixpREFBaUQ7UUFDakQsNkVBQW9CLENBQUE7SUFDckIsQ0FBQyxFQVhpQixXQUFXLDJCQUFYLFdBQVcsUUFXNUI7SUFrQ0QsSUFBVyxZQVFWO0lBUkQsV0FBVyxZQUFZO1FBQ3RCLG1DQUFtQixDQUFBO1FBRW5CLG9DQUFvQixDQUFBO1FBQ3BCLG9DQUFvQixDQUFBO1FBQ3BCLDJDQUEyQixDQUFBO1FBQzNCLDZDQUE2QixDQUFBO1FBQzdCLGlEQUFpQyxDQUFBO0lBQ2xDLENBQUMsRUFSVSxZQUFZLEtBQVosWUFBWSxRQVF0QjtJQUVNLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBUSxFQUE2QixFQUFFO1FBQ25FLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDM0IsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU1RCxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsMENBQTBCLEVBQUU7WUFDekMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FB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