/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "crypto", "fs", "vs/base/common/functional"], function (require, exports, crypto, fs, functional_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checksum = void 0;
    async function checksum(path, sha1hash) {
        const checksumPromise = new Promise((resolve, reject) => {
            const input = fs.createReadStream(path);
            const hash = crypto.createHash('sha1');
            input.pipe(hash);
            const done = (0, functional_1.once)((err, result) => {
                input.removeAllListeners();
                hash.removeAllListeners();
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
            input.once('error', done);
            input.once('end', done);
            hash.once('error', done);
            hash.once('data', (data) => done(undefined, data.toString('hex')));
        });
        const hash = await checksumPromise;
        if (hash !== sha1hash) {
            throw new Error('Hash mismatch');
        }
    }
    exports.checksum = checksum;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9ub2RlL2NyeXB0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNekYsS0FBSyxVQUFVLFFBQVEsQ0FBQyxJQUFZLEVBQUUsUUFBNEI7UUFDeEUsTUFBTSxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQXFCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzNFLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFakIsTUFBTSxJQUFJLEdBQUcsSUFBQSxpQkFBSSxFQUFDLENBQUMsR0FBVyxFQUFFLE1BQWUsRUFBRSxFQUFFO2dCQUNsRCxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBRTFCLElBQUksR0FBRyxFQUFFO29CQUNSLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDWjtxQkFBTTtvQkFDTixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2hCO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBZSxDQUFDO1FBRW5DLElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ2pDO0lBQ0YsQ0FBQztJQTVCRCw0QkE0QkMifQ==