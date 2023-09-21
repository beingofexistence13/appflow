/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/services/userActivity/browser/domActivityTracker", "vs/workbench/services/userActivity/common/userActivityService", "sinon", "assert"], function (require, exports, instantiationServiceMock_1, domActivityTracker_1, userActivityService_1, sinon, assert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('DomActivityTracker', () => {
        let uas;
        let dom;
        let insta;
        let clock;
        const maxTimeToBecomeIdle = 3 * 30000; // (MIN_INTERVALS_WITHOUT_ACTIVITY + 1) * CHECK_INTERVAL;
        setup(() => {
            clock = sinon.useFakeTimers();
            insta = new instantiationServiceMock_1.$L0b();
            uas = new userActivityService_1.$klb(insta);
            dom = new domActivityTracker_1.$IBb(uas);
        });
        teardown(() => {
            dom.dispose();
            uas.dispose();
            clock.restore();
            insta.dispose();
        });
        test('marks inactive on no input', () => {
            assert.equal(uas.isActive, true);
            clock.tick(maxTimeToBecomeIdle);
            assert.equal(uas.isActive, false);
        });
        test('preserves activity state when active', () => {
            assert.equal(uas.isActive, true);
            const div = 10;
            for (let i = 0; i < div; i++) {
                document.dispatchEvent(new MouseEvent('keydown'));
                clock.tick(maxTimeToBecomeIdle / div);
            }
            assert.equal(uas.isActive, true);
        });
        test('restores active state', () => {
            assert.equal(uas.isActive, true);
            clock.tick(maxTimeToBecomeIdle);
            assert.equal(uas.isActive, false);
            document.dispatchEvent(new MouseEvent('keydown'));
            assert.equal(uas.isActive, true);
            clock.tick(maxTimeToBecomeIdle);
            assert.equal(uas.isActive, false);
        });
    });
});
//# sourceMappingURL=domActivityTracker.test.js.map