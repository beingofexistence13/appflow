define(["require", "exports", "assert", "vs/editor/contrib/dropOrPasteInto/browser/edit"], function (require, exports, assert, edit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createTestEdit(providerId, args) {
        return {
            label: '',
            insertText: '',
            providerId,
            ...args,
        };
    }
    suite('sortEditsByYieldTo', () => {
        test('Should noop for empty edits', () => {
            const edits = [];
            assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits), []);
        });
        test('Yielded to edit should get sorted after target', () => {
            const edits = [
                createTestEdit('a', { yieldTo: [{ providerId: 'b' }] }),
                createTestEdit('b'),
            ];
            assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits).map(x => x.providerId), ['b', 'a']);
        });
        test('Should handle chain of yield to', () => {
            {
                const edits = [
                    createTestEdit('c', { yieldTo: [{ providerId: 'a' }] }),
                    createTestEdit('a', { yieldTo: [{ providerId: 'b' }] }),
                    createTestEdit('b'),
                ];
                assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits).map(x => x.providerId), ['b', 'a', 'c']);
            }
            {
                const edits = [
                    createTestEdit('a', { yieldTo: [{ providerId: 'b' }] }),
                    createTestEdit('c', { yieldTo: [{ providerId: 'a' }] }),
                    createTestEdit('b'),
                ];
                assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits).map(x => x.providerId), ['b', 'a', 'c']);
            }
        });
        test(`Should not reorder when yield to isn't used`, () => {
            const edits = [
                createTestEdit('c', { yieldTo: [{ providerId: 'x' }] }),
                createTestEdit('a', { yieldTo: [{ providerId: 'y' }] }),
                createTestEdit('b'),
            ];
            assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits).map(x => x.providerId), ['c', 'a', 'b']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNvcnQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2Ryb3BPclBhc3RlSW50by90ZXN0L2Jyb3dzZXIvZWRpdFNvcnQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxTQUFTLGNBQWMsQ0FBQyxVQUFrQixFQUFFLElBQXdCO1FBQ25FLE9BQU87WUFDTixLQUFLLEVBQUUsRUFBRTtZQUNULFVBQVUsRUFBRSxFQUFFO1lBQ2QsVUFBVTtZQUNWLEdBQUcsSUFBSTtTQUNQLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtRQUNoQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1lBQ3hDLE1BQU0sS0FBSyxHQUFlLEVBQUUsQ0FBQztZQUU3QixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEseUJBQWtCLEVBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxFQUFFO1lBQzNELE1BQU0sS0FBSyxHQUFlO2dCQUN6QixjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUN2RCxjQUFjLENBQUMsR0FBRyxDQUFDO2FBQ25CLENBQUM7WUFDRixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEseUJBQWtCLEVBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO1lBQzVDO2dCQUNDLE1BQU0sS0FBSyxHQUFlO29CQUN6QixjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUN2RCxjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUN2RCxjQUFjLENBQUMsR0FBRyxDQUFDO2lCQUNuQixDQUFDO2dCQUVGLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSx5QkFBa0IsRUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDMUY7WUFDRDtnQkFDQyxNQUFNLEtBQUssR0FBZTtvQkFDekIsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztvQkFDdkQsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztvQkFDdkQsY0FBYyxDQUFDLEdBQUcsQ0FBQztpQkFDbkIsQ0FBQztnQkFFRixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEseUJBQWtCLEVBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzFGO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkNBQTZDLEVBQUUsR0FBRyxFQUFFO1lBQ3hELE1BQU0sS0FBSyxHQUFlO2dCQUN6QixjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUN2RCxjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUN2RCxjQUFjLENBQUMsR0FBRyxDQUFDO2FBQ25CLENBQUM7WUFFRixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEseUJBQWtCLEVBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==