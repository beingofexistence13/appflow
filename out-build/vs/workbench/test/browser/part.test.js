/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/browser/part", "vs/base/common/types", "vs/platform/theme/test/common/testThemeService", "vs/base/browser/dom", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, part_1, types_1, testThemeService_1, dom_1, workbenchTestServices_1, workbenchTestServices_2, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench parts', () => {
        const disposables = new lifecycle_1.$jc();
        class SimplePart extends part_1.Part {
            constructor() {
                super(...arguments);
                this.minimumWidth = 50;
                this.maximumWidth = 50;
                this.minimumHeight = 50;
                this.maximumHeight = 50;
            }
            layout(width, height) {
                throw new Error('Method not implemented.');
            }
            toJSON() {
                throw new Error('Method not implemented.');
            }
        }
        class MyPart extends SimplePart {
            constructor(a) {
                super('myPart', { hasTitle: true }, new testThemeService_1.$K0b(), disposables.add(new workbenchTestServices_2.$7dc()), new workbenchTestServices_1.$wec());
                this.a = a;
            }
            I(parent) {
                assert.strictEqual(parent, this.a);
                return super.I(parent);
            }
            L(parent) {
                assert.strictEqual(parent, this.a);
                return super.L(parent);
            }
            testGetMemento(scope, target) {
                return super.F(scope, target);
            }
            testSaveState() {
                return super.G();
            }
        }
        class MyPart2 extends SimplePart {
            constructor() {
                super('myPart2', { hasTitle: true }, new testThemeService_1.$K0b(), disposables.add(new workbenchTestServices_2.$7dc()), new workbenchTestServices_1.$wec());
            }
            I(parent) {
                const titleContainer = (0, dom_1.$0O)(parent, (0, dom_1.$)('div'));
                const titleLabel = (0, dom_1.$0O)(titleContainer, (0, dom_1.$)('span'));
                titleLabel.id = 'myPart.title';
                titleLabel.innerText = 'Title';
                return titleContainer;
            }
            L(parent) {
                const contentContainer = (0, dom_1.$0O)(parent, (0, dom_1.$)('div'));
                const contentSpan = (0, dom_1.$0O)(contentContainer, (0, dom_1.$)('span'));
                contentSpan.id = 'myPart.content';
                contentSpan.innerText = 'Content';
                return contentContainer;
            }
        }
        class MyPart3 extends SimplePart {
            constructor() {
                super('myPart2', { hasTitle: false }, new testThemeService_1.$K0b(), disposables.add(new workbenchTestServices_2.$7dc()), new workbenchTestServices_1.$wec());
            }
            I(parent) {
                return null;
            }
            L(parent) {
                const contentContainer = (0, dom_1.$0O)(parent, (0, dom_1.$)('div'));
                const contentSpan = (0, dom_1.$0O)(contentContainer, (0, dom_1.$)('span'));
                contentSpan.id = 'myPart.content';
                contentSpan.innerText = 'Content';
                return contentContainer;
            }
        }
        let fixture;
        const fixtureId = 'workbench-part-fixture';
        setup(() => {
            fixture = document.createElement('div');
            fixture.id = fixtureId;
            document.body.appendChild(fixture);
        });
        teardown(() => {
            document.body.removeChild(fixture);
            disposables.clear();
        });
        test('Creation', () => {
            const b = document.createElement('div');
            document.getElementById(fixtureId).appendChild(b);
            (0, dom_1.$eP)(b);
            let part = disposables.add(new MyPart(b));
            part.create(b);
            assert.strictEqual(part.getId(), 'myPart');
            // Memento
            let memento = part.testGetMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert(memento);
            memento.foo = 'bar';
            memento.bar = [1, 2, 3];
            part.testSaveState();
            // Re-Create to assert memento contents
            part = disposables.add(new MyPart(b));
            memento = part.testGetMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert(memento);
            assert.strictEqual(memento.foo, 'bar');
            assert.strictEqual(memento.bar.length, 3);
            // Empty Memento stores empty object
            delete memento.foo;
            delete memento.bar;
            part.testSaveState();
            part = disposables.add(new MyPart(b));
            memento = part.testGetMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert(memento);
            assert.strictEqual((0, types_1.$wf)(memento), true);
        });
        test('Part Layout with Title and Content', function () {
            const b = document.createElement('div');
            document.getElementById(fixtureId).appendChild(b);
            (0, dom_1.$eP)(b);
            const part = disposables.add(new MyPart2());
            part.create(b);
            assert(document.getElementById('myPart.title'));
            assert(document.getElementById('myPart.content'));
        });
        test('Part Layout with Content only', function () {
            const b = document.createElement('div');
            document.getElementById(fixtureId).appendChild(b);
            (0, dom_1.$eP)(b);
            const part = disposables.add(new MyPart3());
            part.create(b);
            assert(!document.getElementById('myPart.title'));
            assert(document.getElementById('myPart.content'));
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=part.test.js.map