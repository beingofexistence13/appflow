/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, lazy_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wT = exports.$vT = void 0;
    // setup on import so assertSnapshot has the current context without explicit passing
    let context;
    const sanitizeName = (name) => name.replace(/[^a-z0-9_-]/gi, '_');
    const normalizeCrlf = (str) => str.replace(/\r\n/g, '\n');
    /**
     * This is exported only for tests against the snapshotting itself! Use
     * {@link $wT} as a consumer!
     */
    class $vT {
        constructor(h) {
            this.h = h;
            this.b = 0;
            this.g = new Set();
            if (!h) {
                throw new Error('assertSnapshot can only be used in a test');
            }
            if (!h.file) {
                throw new Error('currentTest.file is not set, please open an issue with the test you\'re trying to run');
            }
            const src = network_1.$2f.asFileUri('');
            const parts = h.file.split(/[/\\]/g);
            this.e = sanitizeName(h.fullTitle()) + '_';
            this.d = uri_1.URI.joinPath(src, ...[...parts.slice(0, -1), '__snapshots__']);
        }
        async assert(value, options) {
            const originalStack = new Error().stack; // save to make the stack nicer on failure
            const nameOrIndex = (options?.name ? sanitizeName(options.name) : this.b++);
            const fileName = this.e + nameOrIndex + '.' + (options?.extension || 'snap');
            this.g.add(fileName);
            const fpath = uri_1.URI.joinPath(this.d, fileName).fsPath;
            const actual = formatValue(value);
            let expected;
            try {
                expected = await __readFileInTests(fpath);
            }
            catch {
                console.info(`Creating new snapshot in: ${fpath}`);
                await __mkdirPInTests(this.d.fsPath);
                await __writeFileInTests(fpath, actual);
                return;
            }
            if (normalizeCrlf(expected) !== normalizeCrlf(actual)) {
                await __writeFileInTests(fpath + '.actual', actual);
                const err = new Error(`Snapshot #${nameOrIndex} does not match expected output`);
                err.expected = expected;
                err.actual = actual;
                err.snapshotPath = fpath;
                err.stack = err.stack
                    .split('\n')
                    // remove all frames from the async stack and keep the original caller's frame
                    .slice(0, 1)
                    .concat(originalStack.split('\n').slice(3))
                    .join('\n');
                throw err;
            }
        }
        async removeOldSnapshots() {
            const contents = await __readDirInTests(this.d.fsPath);
            const toDelete = contents.filter(f => f.startsWith(this.e) && !this.g.has(f));
            if (toDelete.length) {
                console.info(`Deleting ${toDelete.length} old snapshots for ${this.h?.fullTitle()}`);
            }
            await Promise.all(toDelete.map(f => __unlinkInTests(uri_1.URI.joinPath(this.d, f).fsPath)));
        }
    }
    exports.$vT = $vT;
    const debugDescriptionSymbol = Symbol.for('debug.description');
    function formatValue(value, level = 0, seen = []) {
        switch (typeof value) {
            case 'bigint':
            case 'boolean':
            case 'number':
            case 'symbol':
            case 'undefined':
                return String(value);
            case 'string':
                return level === 0 ? value : JSON.stringify(value);
            case 'function':
                return `[Function ${value.name}]`;
            case 'object': {
                if (value === null) {
                    return 'null';
                }
                if (value instanceof RegExp) {
                    return String(value);
                }
                if (seen.includes(value)) {
                    return '[Circular]';
                }
                if (debugDescriptionSymbol in value && typeof value[debugDescriptionSymbol] === 'function') {
                    return value[debugDescriptionSymbol]();
                }
                const oi = '  '.repeat(level);
                const ci = '  '.repeat(level + 1);
                if (Array.isArray(value)) {
                    const children = value.map(v => formatValue(v, level + 1, [...seen, value]));
                    const multiline = children.some(c => c.includes('\n')) || children.join(', ').length > 80;
                    return multiline ? `[\n${ci}${children.join(`,\n${ci}`)}\n${oi}]` : `[ ${children.join(', ')} ]`;
                }
                let entries;
                let prefix = '';
                if (value instanceof Map) {
                    prefix = 'Map ';
                    entries = [...value.entries()];
                }
                else if (value instanceof Set) {
                    prefix = 'Set ';
                    entries = [...value.entries()];
                }
                else {
                    entries = Object.entries(value);
                }
                const lines = entries.map(([k, v]) => `${k}: ${formatValue(v, level + 1, [...seen, value])}`);
                return prefix + (lines.length > 1
                    ? `{\n${ci}${lines.join(`,\n${ci}`)}\n${oi}}`
                    : `{ ${lines.join(',\n')} }`);
            }
            default:
                throw new Error(`Unknown type ${value}`);
        }
    }
    setup(function () {
        const currentTest = this.currentTest;
        context = new lazy_1.$T(() => new $vT(currentTest));
    });
    teardown(async function () {
        if (this.currentTest?.state === 'passed') {
            await context?.rawValue?.removeOldSnapshots();
        }
        context = undefined;
    });
    /**
     * Implements a snapshot testing utility. ⚠️ This is async! ⚠️
     *
     * The first time a snapshot test is run, it'll record the value it's called
     * with as the expected value. Subsequent runs will fail if the value differs,
     * but the snapshot can be regenerated by hand or using the Selfhost Test
     * Provider Extension which'll offer to update it.
     *
     * The snapshot will be associated with the currently running test and stored
     * in a `__snapshots__` directory next to the test file, which is expected to
     * be the first `.test.js` file in the callstack.
     */
    function $wT(value, options) {
        if (!context) {
            throw new Error('assertSnapshot can only be used in a test');
        }
        return context.value.assert(value, options);
    }
    exports.$wT = $wT;
});
//# sourceMappingURL=snapshot.js.map