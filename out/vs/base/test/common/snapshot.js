/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, lazy_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertSnapshot = exports.SnapshotContext = void 0;
    // setup on import so assertSnapshot has the current context without explicit passing
    let context;
    const sanitizeName = (name) => name.replace(/[^a-z0-9_-]/gi, '_');
    const normalizeCrlf = (str) => str.replace(/\r\n/g, '\n');
    /**
     * This is exported only for tests against the snapshotting itself! Use
     * {@link assertSnapshot} as a consumer!
     */
    class SnapshotContext {
        constructor(test) {
            this.test = test;
            this.nextIndex = 0;
            this.usedNames = new Set();
            if (!test) {
                throw new Error('assertSnapshot can only be used in a test');
            }
            if (!test.file) {
                throw new Error('currentTest.file is not set, please open an issue with the test you\'re trying to run');
            }
            const src = network_1.FileAccess.asFileUri('');
            const parts = test.file.split(/[/\\]/g);
            this.namePrefix = sanitizeName(test.fullTitle()) + '_';
            this.snapshotsDir = uri_1.URI.joinPath(src, ...[...parts.slice(0, -1), '__snapshots__']);
        }
        async assert(value, options) {
            const originalStack = new Error().stack; // save to make the stack nicer on failure
            const nameOrIndex = (options?.name ? sanitizeName(options.name) : this.nextIndex++);
            const fileName = this.namePrefix + nameOrIndex + '.' + (options?.extension || 'snap');
            this.usedNames.add(fileName);
            const fpath = uri_1.URI.joinPath(this.snapshotsDir, fileName).fsPath;
            const actual = formatValue(value);
            let expected;
            try {
                expected = await __readFileInTests(fpath);
            }
            catch {
                console.info(`Creating new snapshot in: ${fpath}`);
                await __mkdirPInTests(this.snapshotsDir.fsPath);
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
            const contents = await __readDirInTests(this.snapshotsDir.fsPath);
            const toDelete = contents.filter(f => f.startsWith(this.namePrefix) && !this.usedNames.has(f));
            if (toDelete.length) {
                console.info(`Deleting ${toDelete.length} old snapshots for ${this.test?.fullTitle()}`);
            }
            await Promise.all(toDelete.map(f => __unlinkInTests(uri_1.URI.joinPath(this.snapshotsDir, f).fsPath)));
        }
    }
    exports.SnapshotContext = SnapshotContext;
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
        context = new lazy_1.Lazy(() => new SnapshotContext(currentTest));
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
    function assertSnapshot(value, options) {
        if (!context) {
            throw new Error('assertSnapshot can only be used in a test');
        }
        return context.value.assert(value, options);
    }
    exports.assertSnapshot = assertSnapshot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hcHNob3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL3NuYXBzaG90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxxRkFBcUY7SUFDckYsSUFBSSxPQUEwQyxDQUFDO0lBQy9DLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMxRSxNQUFNLGFBQWEsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFTbEU7OztPQUdHO0lBQ0gsTUFBYSxlQUFlO1FBTTNCLFlBQTZCLElBQTRCO1lBQTVCLFNBQUksR0FBSixJQUFJLENBQXdCO1lBTGpELGNBQVMsR0FBRyxDQUFDLENBQUM7WUFHTCxjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUd0QyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQzthQUM3RDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsdUZBQXVGLENBQUMsQ0FBQzthQUN6RztZQUVELE1BQU0sR0FBRyxHQUFHLG9CQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhDLElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUN2RCxJQUFJLENBQUMsWUFBWSxHQUFH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