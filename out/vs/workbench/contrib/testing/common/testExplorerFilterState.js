var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, event_1, glob_1, lifecycle_1, instantiation_1, storage_1, observableValue_1, storedValue_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestFilterTerm = exports.TestExplorerFilterState = exports.ITestExplorerFilterState = void 0;
    exports.ITestExplorerFilterState = (0, instantiation_1.createDecorator)('testingFilterState');
    const tagRe = /!?@([^ ,:]+)/g;
    const trimExtraWhitespace = (str) => str.replace(/\s\s+/g, ' ').trim();
    let TestExplorerFilterState = class TestExplorerFilterState extends lifecycle_1.Disposable {
        constructor(storageService) {
            super();
            this.storageService = storageService;
            this.focusEmitter = new event_1.Emitter();
            /**
             * Mapping of terms to whether they're included in the text.
             */
            this.termFilterState = {};
            /** @inheritdoc */
            this.globList = [];
            /** @inheritdoc */
            this.includeTags = new Set();
            /** @inheritdoc */
            this.excludeTags = new Set();
            /** @inheritdoc */
            this.text = this._register(new observableValue_1.MutableObservableValue(''));
            /** @inheritdoc */
            this.fuzzy = this._register(observableValue_1.MutableObservableValue.stored(new storedValue_1.StoredValue({
                key: 'testHistoryFuzzy',
                scope: 0 /* StorageScope.PROFILE */,
                target: 0 /* StorageTarget.USER */,
            }, this.storageService), false));
            this.reveal = this._register(new observableValue_1.MutableObservableValue(undefined));
            this.onDidRequestInputFocus = this.focusEmitter.event;
        }
        /** @inheritdoc */
        focusInput() {
            this.focusEmitter.fire();
        }
        /** @inheritdoc */
        setText(text) {
            if (text === this.text.value) {
                return;
            }
            this.termFilterState = {};
            this.globList = [];
            this.includeTags.clear();
            this.excludeTags.clear();
            let globText = '';
            let lastIndex = 0;
            for (const match of text.matchAll(tagRe)) {
                let nextIndex = match.index + match[0].length;
                const tag = match[0];
                if (allTestFilterTerms.includes(tag)) {
                    this.termFilterState[tag] = true;
                }
                // recognize and parse @ctrlId:tagId or quoted like @ctrlId:"tag \\"id"
                if (text[nextIndex] === ':') {
                    nextIndex++;
                    let delimiter = text[nextIndex];
                    if (delimiter !== `"` && delimiter !== `'`) {
                        delimiter = ' ';
                    }
                    else {
                        nextIndex++;
                    }
                    let tagId = '';
                    while (nextIndex < text.length && text[nextIndex] !== delimiter) {
                        if (text[nextIndex] === '\\') {
                            tagId += text[nextIndex + 1];
                            nextIndex += 2;
                        }
                        else {
                            tagId += text[nextIndex];
                            nextIndex++;
                        }
                    }
                    if (match[0].startsWith('!')) {
                        this.excludeTags.add((0, testTypes_1.namespaceTestTag)(match[1], tagId));
                    }
                    else {
                        this.includeTags.add((0, testTypes_1.namespaceTestTag)(match[1], tagId));
                    }
                    nextIndex++;
                }
                globText += text.slice(lastIndex, match.index);
                lastIndex = nextIndex;
            }
            globText += text.slice(lastIndex).trim();
            if (globText.length) {
                for (const filter of (0, glob_1.splitGlobAware)(globText, ',').map(s => s.trim()).filter(s => !!s.length)) {
                    if (filter.startsWith('!')) {
                        this.globList.push({ include: false, text: filter.slice(1).toLowerCase() });
                    }
                    else {
                        this.globList.push({ include: true, text: filter.toLowerCase() });
                    }
                }
            }
            this.text.value = text; // purposely afterwards so everything is updated when the change event happen
        }
        /** @inheritdoc */
        isFilteringFor(term) {
            return !!this.termFilterState[term];
        }
        /** @inheritdoc */
        toggleFilteringFor(term, shouldFilter) {
            const text = this.text.value.trim();
            if (shouldFilter !== false && !this.termFilterState[term]) {
                this.setText(text ? `${text} ${term}` : term);
            }
            else if (shouldFilter !== true && this.termFilterState[term]) {
                this.setText(trimExtraWhitespace(text.replace(term, '')));
            }
        }
    };
    exports.TestExplorerFilterState = TestExplorerFilterState;
    exports.TestExplorerFilterState = TestExplorerFilterState = __decorate([
        __param(0, storage_1.IStorageService)
    ], TestExplorerFilterState);
    var TestFilterTerm;
    (function (TestFilterTerm) {
        TestFilterTerm["Failed"] = "@failed";
        TestFilterTerm["Executed"] = "@executed";
        TestFilterTerm["CurrentDoc"] = "@doc";
        TestFilterTerm["Hidden"] = "@hidden";
    })(TestFilterTerm || (exports.TestFilterTerm = TestFilterTerm = {}));
    const allTestFilterTerms = [
        "@failed" /* TestFilterTerm.Failed */,
        "@executed" /* TestFilterTerm.Executed */,
        "@doc" /* TestFilterTerm.CurrentDoc */,
        "@hidden" /* TestFilterTerm.Hidden */,
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEV4cGxvcmVyRmlsdGVyU3RhdGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2NvbW1vbi90ZXN0RXhwbG9yZXJGaWx0ZXJTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBa0VhLFFBQUEsd0JBQXdCLEdBQUcsSUFBQSwrQkFBZSxFQUEyQixvQkFBb0IsQ0FBQyxDQUFDO0lBRXhHLE1BQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQztJQUM5QixNQUFNLG1CQUFtQixHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUV4RSxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHNCQUFVO1FBK0J0RCxZQUE2QixjQUFnRDtZQUM1RSxLQUFLLEVBQUUsQ0FBQztZQURxQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUE3QjVELGlCQUFZLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUNwRDs7ZUFFRztZQUNLLG9CQUFlLEdBQXFDLEVBQUUsQ0FBQztZQUUvRCxrQkFBa0I7WUFDWCxhQUFRLEdBQXlDLEVBQUUsQ0FBQztZQUUzRCxrQkFBa0I7WUFDWCxnQkFBVyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFFdkMsa0JBQWtCO1lBQ1gsZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBRXZDLGtCQUFrQjtZQUNGLFNBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0NBQXNCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RSxrQkFBa0I7WUFDRixVQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyx3Q0FBc0IsQ0FBQyxNQUFNLENBQUMsSUFBSSx5QkFBVyxD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