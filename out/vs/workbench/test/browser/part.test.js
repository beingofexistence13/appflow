/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/browser/part", "vs/base/common/types", "vs/platform/theme/test/common/testThemeService", "vs/base/browser/dom", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, part_1, types_1, testThemeService_1, dom_1, workbenchTestServices_1, workbenchTestServices_2, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench parts', () => {
        const disposables = new lifecycle_1.DisposableStore();
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
            constructor(expectedParent) {
                super('myPart', { hasTitle: true }, new testThemeService_1.TestThemeService(), disposables.add(new workbenchTestServices_2.TestStorageService()), new workbenchTestServices_1.TestLayoutService());
                this.expectedParent = expectedParent;
            }
            createTitleArea(parent) {
                assert.strictEqual(parent, this.expectedParent);
                return super.createTitleArea(parent);
            }
            createContentArea(parent) {
                assert.strictEqual(parent, this.expectedParent);
                return super.createContentArea(parent);
            }
            testGetMemento(scope, target) {
                return super.getMemento(scope, target);
            }
            testSaveState() {
                return super.saveState();
            }
        }
        class MyPart2 extends SimplePart {
            constructor() {
                super('myPart2', { hasTitle: true }, new testThemeService_1.TestThemeService(), disposables.add(new workbenchTestServices_2.TestStorageService()), new workbenchTestServices_1.TestLayoutService());
            }
            createTitleArea(parent) {
                const titleContainer = (0, dom_1.append)(parent, (0, dom_1.$)('div'));
                const titleLabel = (0, dom_1.append)(titleContainer, (0, dom_1.$)('span'));
                titleLabel.id = 'myPart.title';
                titleLabel.innerText = 'Title';
                return titleContainer;
            }
            createContentArea(parent) {
                const contentContainer = (0, dom_1.append)(parent, (0, dom_1.$)('div'));
                const contentSpan = (0, dom_1.append)(contentContainer, (0, dom_1.$)('span'));
                contentSpan.id = 'myPart.content';
                contentSpan.innerText = 'Content';
                return contentContainer;
            }
        }
        class MyPart3 extends SimplePart {
            constructor() {
                super('myPart2', { hasTitle: false }, new testThemeService_1.TestThemeService(), disposables.add(new workbenchTestServices_2.TestStorageService()), new workbenchTestServices_1.TestLayoutService());
            }
            createTitleArea(parent) {
                return null;
            }
            createContentArea(parent) {
                const contentContainer = (0, dom_1.append)(parent, (0, dom_1.$)('div'));
                const contentSpan = (0, dom_1.append)(contentContainer, (0, dom_1.$)('span'));
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
            (0, dom_1.hide)(b);
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
            assert.strictEqual((0, types_1.isEmptyObject)(memento), true);
        });
        test('Part Layout with Title and Content', function () {
            const b = document.createElement('div');
            document.getElementById(fixtureId).appendChild(b);
            (0, dom_1.hide)(b);
            const part = disposables.add(new MyPart2());
            part.create(b);
            assert(document.getElementById('myPart.title'));
            assert(document.getElementById('myPart.content'));
        });
        test('Part Layout with Content only', function () {
            const b = document.createElement('div');
            document.getElementById(fixtureId).appendChild(b);
            (0, dom_1.hide)(b);
            const part = disposables.add(new MyPart3());
            part.create(b);
            assert(!document.getElementById('myPart.title'));
            assert(document.getElementById('myPart.content'));
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3Rlc3QvYnJvd3Nlci9wYXJ0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFhaEcsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUU3QixNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUUxQyxNQUFNLFVBQVcsU0FBUSxXQUFJO1lBQTdCOztnQkFFQyxpQkFBWSxHQUFXLEVBQUUsQ0FBQztnQkFDMUIsaUJBQVksR0FBVyxFQUFFLENBQUM7Z0JBQzFCLGtCQUFhLEdBQVcsRUFBRSxDQUFDO2dCQUMzQixrQkFBYSxHQUFXLEVBQUUsQ0FBQztZQVM1QixDQUFDO1lBUFMsTUFBTSxDQUFDLEtBQWEsRUFBRSxNQUFjO2dCQUM1QyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUVELE1BQU07Z0JBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQzVDLENBQUM7U0FDRDtRQUVELE1BQU0sTUFBTyxTQUFRLFVBQVU7WUFFOUIsWUFBb0IsY0FBMkI7Z0JBQzlDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxtQ0FBZ0IsRUFBRSxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSwwQ0FBa0IsRUFBRSxDQUFDLEVBQUUsSUFBSSx5Q0FBaUIsRUFBRSxDQUFDLENBQUM7Z0JBRDdHLG1CQUFjLEdBQWQsY0FBYyxDQUFhO1lBRS9DLENBQUM7WUFFa0IsZUFBZSxDQUFDLE1BQW1CO2dCQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ2hELE9BQU8sS0FBSyxD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