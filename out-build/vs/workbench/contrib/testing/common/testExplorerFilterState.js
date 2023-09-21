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
    exports.TestFilterTerm = exports.$FKb = exports.$EKb = void 0;
    exports.$EKb = (0, instantiation_1.$Bh)('testingFilterState');
    const tagRe = /!?@([^ ,:]+)/g;
    const trimExtraWhitespace = (str) => str.replace(/\s\s+/g, ' ').trim();
    let $FKb = class $FKb extends lifecycle_1.$kc {
        constructor(c) {
            super();
            this.c = c;
            this.a = new event_1.$fd();
            /**
             * Mapping of terms to whether they're included in the text.
             */
            this.b = {};
            /** @inheritdoc */
            this.globList = [];
            /** @inheritdoc */
            this.includeTags = new Set();
            /** @inheritdoc */
            this.excludeTags = new Set();
            /** @inheritdoc */
            this.text = this.B(new observableValue_1.$Isb(''));
            /** @inheritdoc */
            this.fuzzy = this.B(observableValue_1.$Isb.stored(new storedValue_1.$Gsb({
                key: 'testHistoryFuzzy',
                scope: 0 /* StorageScope.PROFILE */,
                target: 0 /* StorageTarget.USER */,
            }, this.c), false));
            this.reveal = this.B(new observableValue_1.$Isb(undefined));
            this.onDidRequestInputFocus = this.a.event;
        }
        /** @inheritdoc */
        focusInput() {
            this.a.fire();
        }
        /** @inheritdoc */
        setText(text) {
            if (text === this.text.value) {
                return;
            }
            this.b = {};
            this.globList = [];
            this.includeTags.clear();
            this.excludeTags.clear();
            let globText = '';
            let lastIndex = 0;
            for (const match of text.matchAll(tagRe)) {
                let nextIndex = match.index + match[0].length;
                const tag = match[0];
                if (allTestFilterTerms.includes(tag)) {
                    this.b[tag] = true;
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
                        this.excludeTags.add((0, testTypes_1.$TI)(match[1], tagId));
                    }
                    else {
                        this.includeTags.add((0, testTypes_1.$TI)(match[1], tagId));
                    }
                    nextIndex++;
                }
                globText += text.slice(lastIndex, match.index);
                lastIndex = nextIndex;
            }
            globText += text.slice(lastIndex).trim();
            if (globText.length) {
                for (const filter of (0, glob_1.$pj)(globText, ',').map(s => s.trim()).filter(s => !!s.length)) {
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
            return !!this.b[term];
        }
        /** @inheritdoc */
        toggleFilteringFor(term, shouldFilter) {
            const text = this.text.value.trim();
            if (shouldFilter !== false && !this.b[term]) {
                this.setText(text ? `${text} ${term}` : term);
            }
            else if (shouldFilter !== true && this.b[term]) {
                this.setText(trimExtraWhitespace(text.replace(term, '')));
            }
        }
    };
    exports.$FKb = $FKb;
    exports.$FKb = $FKb = __decorate([
        __param(0, storage_1.$Vo)
    ], $FKb);
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
//# sourceMappingURL=testExplorerFilterState.js.map