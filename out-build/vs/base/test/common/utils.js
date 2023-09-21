/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, lifecycle_1, path_1, platform_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dT = exports.$cT = exports.$bT = exports.$aT = exports.$_S = exports.$$S = exports.$0S = void 0;
    function $0S(path) {
        if (platform_1.$i) {
            return uri_1.URI.file((0, path_1.$9d)('C:\\', btoa(this.test.fullTitle()), path));
        }
        return uri_1.URI.file((0, path_1.$9d)('/', btoa(this.test.fullTitle()), path));
    }
    exports.$0S = $0S;
    function $$S(n, description, callback) {
        for (let i = 0; i < n; i++) {
            suite(`${description} (iteration ${i})`, callback);
        }
    }
    exports.$$S = $$S;
    function $_S(n, description, callback) {
        for (let i = 0; i < n; i++) {
            test(`${description} (iteration ${i})`, callback);
        }
    }
    exports.$_S = $_S;
    async function $aT(block, message = 'Missing expected exception') {
        try {
            await block();
        }
        catch {
            return;
        }
        const err = message instanceof Error ? message : new Error(message);
        throw err;
    }
    exports.$aT = $aT;
    /**
     * Use this function to ensure that all disposables are cleaned up at the end of each test in the current suite.
     *
     * Use `markAsSingleton` if disposable singletons are created lazily that are allowed to outlive the test.
     * Make sure that the singleton properly registers all child disposables so that they are excluded too.
     *
     * @returns A {@link $jc} that can optionally be used to track disposables in the test.
     * This will be automatically disposed on test teardown.
    */
    function $bT() {
        let tracker;
        let store;
        setup(() => {
            store = new lifecycle_1.$jc();
            tracker = new lifecycle_1.$_b();
            (0, lifecycle_1.$ac)(tracker);
        });
        teardown(function () {
            store.dispose();
            (0, lifecycle_1.$ac)(null);
            if (this.currentTest?.state !== 'failed') {
                const result = tracker.computeLeakingDisposables();
                if (result) {
                    console.error(result.details);
                    throw new Error(`There are ${result.leaks.length} undisposed disposables!${result.details}`);
                }
            }
        });
        // Wrap store as the suite function is called before it's initialized
        const testContext = {
            add(o) {
                return store.add(o);
            }
        };
        return testContext;
    }
    exports.$bT = $bT;
    function $cT(body, logToConsole = true) {
        const tracker = new lifecycle_1.$_b();
        (0, lifecycle_1.$ac)(tracker);
        body();
        (0, lifecycle_1.$ac)(null);
        computeLeakingDisposables(tracker, logToConsole);
    }
    exports.$cT = $cT;
    async function $dT(body) {
        const tracker = new lifecycle_1.$_b();
        (0, lifecycle_1.$ac)(tracker);
        await body();
        (0, lifecycle_1.$ac)(null);
        computeLeakingDisposables(tracker);
    }
    exports.$dT = $dT;
    function computeLeakingDisposables(tracker, logToConsole = true) {
        const result = tracker.computeLeakingDisposables();
        if (result) {
            if (logToConsole) {
                console.error(result.details);
            }
            throw new Error(`There are ${result.leaks.length} undisposed disposables!${result.details}`);
        }
    }
});
//# sourceMappingURL=utils.js.map