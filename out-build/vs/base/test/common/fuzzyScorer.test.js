/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/fuzzyScorer", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/test/common/utils"], function (require, exports, assert, fuzzyScorer_1, network_1, path_1, platform_1, uri_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ResourceAccessorClass {
        getItemLabel(resource) {
            return (0, path_1.$ae)(resource.fsPath);
        }
        getItemDescription(resource) {
            return (0, path_1.$_d)(resource.fsPath);
        }
        getItemPath(resource) {
            return resource.fsPath;
        }
    }
    const ResourceAccessor = new ResourceAccessorClass();
    class ResourceWithSlashAccessorClass {
        getItemLabel(resource) {
            return (0, path_1.$ae)(resource.fsPath);
        }
        getItemDescription(resource) {
            return path_1.$6d.normalize((0, path_1.$_d)(resource.path));
        }
        getItemPath(resource) {
            return path_1.$6d.normalize(resource.path);
        }
    }
    const ResourceWithSlashAccessor = new ResourceWithSlashAccessorClass();
    class ResourceWithBackslashAccessorClass {
        getItemLabel(resource) {
            return (0, path_1.$ae)(resource.fsPath);
        }
        getItemDescription(resource) {
            return path_1.$5d.normalize((0, path_1.$_d)(resource.path));
        }
        getItemPath(resource) {
            return path_1.$5d.normalize(resource.path);
        }
    }
    const ResourceWithBackslashAccessor = new ResourceWithBackslashAccessorClass();
    class NullAccessorClass {
        getItemLabel(resource) {
            return undefined;
        }
        getItemDescription(resource) {
            return undefined;
        }
        getItemPath(resource) {
            return undefined;
        }
    }
    function _doScore(target, query, allowNonContiguousMatches) {
        const preparedQuery = (0, fuzzyScorer_1.$oq)(query);
        return (0, fuzzyScorer_1.$kq)(target, preparedQuery.normalized, preparedQuery.normalizedLowercase, allowNonContiguousMatches ?? !preparedQuery.expectContiguousMatch);
    }
    function _doScore2(target, query, matchOffset = 0) {
        const preparedQuery = (0, fuzzyScorer_1.$oq)(query);
        return (0, fuzzyScorer_1.$lq)(target, preparedQuery, 0, matchOffset);
    }
    function scoreItem(item, query, allowNonContiguousMatches, accessor, cache = Object.create(null)) {
        return (0, fuzzyScorer_1.$mq)(item, (0, fuzzyScorer_1.$oq)(query), allowNonContiguousMatches, accessor, cache);
    }
    function compareItemsByScore(itemA, itemB, query, allowNonContiguousMatches, accessor) {
        return (0, fuzzyScorer_1.$nq)(itemA, itemB, (0, fuzzyScorer_1.$oq)(query), allowNonContiguousMatches, accessor, Object.create(null));
    }
    const NullAccessor = new NullAccessorClass();
    suite('Fuzzy Scorer', () => {
        test('score (fuzzy)', function () {
            const target = 'HelLo-World';
            const scores = [];
            scores.push(_doScore(target, 'HelLo-World', true)); // direct case match
            scores.push(_doScore(target, 'hello-world', true)); // direct mix-case match
            scores.push(_doScore(target, 'HW', true)); // direct case prefix (multiple)
            scores.push(_doScore(target, 'hw', true)); // direct mix-case prefix (multiple)
            scores.push(_doScore(target, 'H', true)); // direct case prefix
            scores.push(_doScore(target, 'h', true)); // direct mix-case prefix
            scores.push(_doScore(target, 'W', true)); // direct case word prefix
            scores.push(_doScore(target, 'Ld', true)); // in-string case match (multiple)
            scores.push(_doScore(target, 'ld', true)); // in-string mix-case match (consecutive, avoids scattered hit)
            scores.push(_doScore(target, 'w', true)); // direct mix-case word prefix
            scores.push(_doScore(target, 'L', true)); // in-string case match
            scores.push(_doScore(target, 'l', true)); // in-string mix-case match
            scores.push(_doScore(target, '4', true)); // no match
            // Assert scoring order
            const sortedScores = scores.concat().sort((a, b) => b[0] - a[0]);
            assert.deepStrictEqual(scores, sortedScores);
            // Assert scoring positions
            // let positions = scores[0][1];
            // assert.strictEqual(positions.length, 'HelLo-World'.length);
            // positions = scores[2][1];
            // assert.strictEqual(positions.length, 'HW'.length);
            // assert.strictEqual(positions[0], 0);
            // assert.strictEqual(positions[1], 6);
        });
        test('score (non fuzzy)', function () {
            const target = 'HelLo-World';
            assert.ok(_doScore(target, 'HelLo-World', false)[0] > 0);
            assert.strictEqual(_doScore(target, 'HelLo-World', false)[1].length, 'HelLo-World'.length);
            assert.ok(_doScore(target, 'hello-world', false)[0] > 0);
            assert.strictEqual(_doScore(target, 'HW', false)[0], 0);
            assert.ok(_doScore(target, 'h', false)[0] > 0);
            assert.ok(_doScore(target, 'ello', false)[0] > 0);
            assert.ok(_doScore(target, 'ld', false)[0] > 0);
            assert.strictEqual(_doScore(target, 'eo', false)[0], 0);
        });
        test('scoreItem - matches are proper', function () {
            let res = scoreItem(null, 'something', true, ResourceAccessor);
            assert.ok(!res.score);
            const resource = uri_1.URI.file('/xyz/some/path/someFile123.txt');
            res = scoreItem(resource, 'something', true, NullAccessor);
            assert.ok(!res.score);
            // Path Identity
            const identityRes = scoreItem(resource, ResourceAccessor.getItemPath(resource), true, ResourceAccessor);
            assert.ok(identityRes.score);
            assert.strictEqual(identityRes.descriptionMatch.length, 1);
            assert.strictEqual(identityRes.labelMatch.length, 1);
            assert.strictEqual(identityRes.descriptionMatch[0].start, 0);
            assert.strictEqual(identityRes.descriptionMatch[0].end, ResourceAccessor.getItemDescription(resource).length);
            assert.strictEqual(identityRes.labelMatch[0].start, 0);
            assert.strictEqual(identityRes.labelMatch[0].end, ResourceAccessor.getItemLabel(resource).length);
            // Basename Prefix
            const basenamePrefixRes = scoreItem(resource, 'som', true, ResourceAccessor);
            assert.ok(basenamePrefixRes.score);
            assert.ok(!basenamePrefixRes.descriptionMatch);
            assert.strictEqual(basenamePrefixRes.labelMatch.length, 1);
            assert.strictEqual(basenamePrefixRes.labelMatch[0].start, 0);
            assert.strictEqual(basenamePrefixRes.labelMatch[0].end, 'som'.length);
            // Basename Camelcase
            const basenameCamelcaseRes = scoreItem(resource, 'sF', true, ResourceAccessor);
            assert.ok(basenameCamelcaseRes.score);
            assert.ok(!basenameCamelcaseRes.descriptionMatch);
            assert.strictEqual(basenameCamelcaseRes.labelMatch.length, 2);
            assert.strictEqual(basenameCamelcaseRes.labelMatch[0].start, 0);
            assert.strictEqual(basenameCamelcaseRes.labelMatch[0].end, 1);
            assert.strictEqual(basenameCamelcaseRes.labelMatch[1].start, 4);
            assert.strictEqual(basenameCamelcaseRes.labelMatch[1].end, 5);
            // Basename Match
            const basenameRes = scoreItem(resource, 'of', true, ResourceAccessor);
            assert.ok(basenameRes.score);
            assert.ok(!basenameRes.descriptionMatch);
            assert.strictEqual(basenameRes.labelMatch.length, 2);
            assert.strictEqual(basenameRes.labelMatch[0].start, 1);
            assert.strictEqual(basenameRes.labelMatch[0].end, 2);
            assert.strictEqual(basenameRes.labelMatch[1].start, 4);
            assert.strictEqual(basenameRes.labelMatch[1].end, 5);
            // Path Match
            const pathRes = scoreItem(resource, 'xyz123', true, ResourceAccessor);
            assert.ok(pathRes.score);
            assert.ok(pathRes.descriptionMatch);
            assert.ok(pathRes.labelMatch);
            assert.strictEqual(pathRes.labelMatch.length, 1);
            assert.strictEqual(pathRes.labelMatch[0].start, 8);
            assert.strictEqual(pathRes.labelMatch[0].end, 11);
            assert.strictEqual(pathRes.descriptionMatch.length, 1);
            assert.strictEqual(pathRes.descriptionMatch[0].start, 1);
            assert.strictEqual(pathRes.descriptionMatch[0].end, 4);
            // No Match
            const noRes = scoreItem(resource, '987', true, ResourceAccessor);
            assert.ok(!noRes.score);
            assert.ok(!noRes.labelMatch);
            assert.ok(!noRes.descriptionMatch);
            // No Exact Match
            const noExactRes = scoreItem(resource, '"sF"', true, ResourceAccessor);
            assert.ok(!noExactRes.score);
            assert.ok(!noExactRes.labelMatch);
            assert.ok(!noExactRes.descriptionMatch);
            assert.strictEqual(noRes.score, noExactRes.score);
            // Verify Scores
            assert.ok(identityRes.score > basenamePrefixRes.score);
            assert.ok(basenamePrefixRes.score > basenameRes.score);
            assert.ok(basenameRes.score > pathRes.score);
            assert.ok(pathRes.score > noRes.score);
        });
        test('scoreItem - multiple', function () {
            const resource = uri_1.URI.file('/xyz/some/path/someFile123.txt');
            const res1 = scoreItem(resource, 'xyz some', true, ResourceAccessor);
            assert.ok(res1.score);
            assert.strictEqual(res1.labelMatch?.length, 1);
            assert.strictEqual(res1.labelMatch[0].start, 0);
            assert.strictEqual(res1.labelMatch[0].end, 4);
            assert.strictEqual(res1.descriptionMatch?.length, 1);
            assert.strictEqual(res1.descriptionMatch[0].start, 1);
            assert.strictEqual(res1.descriptionMatch[0].end, 4);
            const res2 = scoreItem(resource, 'some xyz', true, ResourceAccessor);
            assert.ok(res2.score);
            assert.strictEqual(res1.score, res2.score);
            assert.strictEqual(res2.labelMatch?.length, 1);
            assert.strictEqual(res2.labelMatch[0].start, 0);
            assert.strictEqual(res2.labelMatch[0].end, 4);
            assert.strictEqual(res2.descriptionMatch?.length, 1);
            assert.strictEqual(res2.descriptionMatch[0].start, 1);
            assert.strictEqual(res2.descriptionMatch[0].end, 4);
            const res3 = scoreItem(resource, 'some xyz file file123', true, ResourceAccessor);
            assert.ok(res3.score);
            assert.ok(res3.score > res2.score);
            assert.strictEqual(res3.labelMatch?.length, 1);
            assert.strictEqual(res3.labelMatch[0].start, 0);
            assert.strictEqual(res3.labelMatch[0].end, 11);
            assert.strictEqual(res3.descriptionMatch?.length, 1);
            assert.strictEqual(res3.descriptionMatch[0].start, 1);
            assert.strictEqual(res3.descriptionMatch[0].end, 4);
            const res4 = scoreItem(resource, 'path z y', true, ResourceAccessor);
            assert.ok(res4.score);
            assert.ok(res4.score < res2.score);
            assert.strictEqual(res4.labelMatch?.length, 0);
            assert.strictEqual(res4.descriptionMatch?.length, 2);
            assert.strictEqual(res4.descriptionMatch[0].start, 2);
            assert.strictEqual(res4.descriptionMatch[0].end, 4);
            assert.strictEqual(res4.descriptionMatch[1].start, 10);
            assert.strictEqual(res4.descriptionMatch[1].end, 14);
        });
        test('scoreItem - multiple with cache yields different results', function () {
            const resource = uri_1.URI.file('/xyz/some/path/someFile123.txt');
            const cache = {};
            const res1 = scoreItem(resource, 'xyz sm', true, ResourceAccessor, cache);
            assert.ok(res1.score);
            // from the cache's perspective this should be a totally different query
            const res2 = scoreItem(resource, 'xyz "sm"', true, ResourceAccessor, cache);
            assert.ok(!res2.score);
        });
        test('scoreItem - invalid input', function () {
            let res = scoreItem(null, null, true, ResourceAccessor);
            assert.strictEqual(res.score, 0);
            res = scoreItem(null, 'null', true, ResourceAccessor);
            assert.strictEqual(res.score, 0);
        });
        test('scoreItem - optimize for file paths', function () {
            const resource = uri_1.URI.file('/xyz/others/spath/some/xsp/file123.txt');
            // xsp is more relevant to the end of the file path even though it matches
            // fuzzy also in the beginning. we verify the more relevant match at the
            // end gets returned.
            const pathRes = scoreItem(resource, 'xspfile123', true, ResourceAccessor);
            assert.ok(pathRes.score);
            assert.ok(pathRes.descriptionMatch);
            assert.ok(pathRes.labelMatch);
            assert.strictEqual(pathRes.labelMatch.length, 1);
            assert.strictEqual(pathRes.labelMatch[0].start, 0);
            assert.strictEqual(pathRes.labelMatch[0].end, 7);
            assert.strictEqual(pathRes.descriptionMatch.length, 1);
            assert.strictEqual(pathRes.descriptionMatch[0].start, 23);
            assert.strictEqual(pathRes.descriptionMatch[0].end, 26);
        });
        test('scoreItem - avoid match scattering (bug #36119)', function () {
            const resource = uri_1.URI.file('projects/ui/cula/ats/target.mk');
            const pathRes = scoreItem(resource, 'tcltarget.mk', true, ResourceAccessor);
            assert.ok(pathRes.score);
            assert.ok(pathRes.descriptionMatch);
            assert.ok(pathRes.labelMatch);
            assert.strictEqual(pathRes.labelMatch.length, 1);
            assert.strictEqual(pathRes.labelMatch[0].start, 0);
            assert.strictEqual(pathRes.labelMatch[0].end, 9);
        });
        test('scoreItem - prefers more compact matches', function () {
            const resource = uri_1.URI.file('/1a111d1/11a1d1/something.txt');
            // expect "ad" to be matched towards the end of the file because the
            // match is more compact
            const res = scoreItem(resource, 'ad', true, ResourceAccessor);
            assert.ok(res.score);
            assert.ok(res.descriptionMatch);
            assert.ok(!res.labelMatch.length);
            assert.strictEqual(res.descriptionMatch.length, 2);
            assert.strictEqual(res.descriptionMatch[0].start, 11);
            assert.strictEqual(res.descriptionMatch[0].end, 12);
            assert.strictEqual(res.descriptionMatch[1].start, 13);
            assert.strictEqual(res.descriptionMatch[1].end, 14);
        });
        test('scoreItem - proper target offset', function () {
            const resource = uri_1.URI.file('etem');
            const res = scoreItem(resource, 'teem', true, ResourceAccessor);
            assert.ok(!res.score);
        });
        test('scoreItem - proper target offset #2', function () {
            const resource = uri_1.URI.file('ede');
            const res = scoreItem(resource, 'de', true, ResourceAccessor);
            assert.strictEqual(res.labelMatch.length, 1);
            assert.strictEqual(res.labelMatch[0].start, 1);
            assert.strictEqual(res.labelMatch[0].end, 3);
        });
        test('scoreItem - proper target offset #3', function () {
            const resource = uri_1.URI.file('/src/vs/editor/browser/viewParts/lineNumbers/flipped-cursor-2x.svg');
            const res = scoreItem(resource, 'debug', true, ResourceAccessor);
            assert.strictEqual(res.descriptionMatch.length, 3);
            assert.strictEqual(res.descriptionMatch[0].start, 9);
            assert.strictEqual(res.descriptionMatch[0].end, 10);
            assert.strictEqual(res.descriptionMatch[1].start, 36);
            assert.strictEqual(res.descriptionMatch[1].end, 37);
            assert.strictEqual(res.descriptionMatch[2].start, 40);
            assert.strictEqual(res.descriptionMatch[2].end, 41);
            assert.strictEqual(res.labelMatch.length, 2);
            assert.strictEqual(res.labelMatch[0].start, 9);
            assert.strictEqual(res.labelMatch[0].end, 10);
            assert.strictEqual(res.labelMatch[1].start, 20);
            assert.strictEqual(res.labelMatch[1].end, 21);
        });
        test('scoreItem - no match unless query contained in sequence', function () {
            const resource = uri_1.URI.file('abcde');
            const res = scoreItem(resource, 'edcda', true, ResourceAccessor);
            assert.ok(!res.score);
        });
        test('scoreItem - match if using slash or backslash (local, remote resource)', function () {
            const localResource = uri_1.URI.file('abcde/super/duper');
            const remoteResource = uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, path: 'abcde/super/duper' });
            for (const resource of [localResource, remoteResource]) {
                let res = scoreItem(resource, 'abcde\\super\\duper', true, ResourceAccessor);
                assert.ok(res.score);
                res = scoreItem(resource, 'abcde\\super\\duper', true, ResourceWithSlashAccessor);
                assert.ok(res.score);
                res = scoreItem(resource, 'abcde\\super\\duper', true, ResourceWithBackslashAccessor);
                assert.ok(res.score);
                res = scoreItem(resource, 'abcde/super/duper', true, ResourceAccessor);
                assert.ok(res.score);
                res = scoreItem(resource, 'abcde/super/duper', true, ResourceWithSlashAccessor);
                assert.ok(res.score);
                res = scoreItem(resource, 'abcde/super/duper', true, ResourceWithBackslashAccessor);
                assert.ok(res.score);
            }
        });
        test('scoreItem - ensure upper case bonus only applies on non-consecutive matches (bug #134723)', function () {
            const resourceWithUpper = uri_1.URI.file('ASDFasdfasdf');
            const resourceAllLower = uri_1.URI.file('asdfasdfasdf');
            assert.ok(scoreItem(resourceAllLower, 'asdf', true, ResourceAccessor).score > scoreItem(resourceWithUpper, 'asdf', true, ResourceAccessor).score);
        });
        test('compareItemsByScore - identity', function () {
            const resourceA = uri_1.URI.file('/some/path/fileA.txt');
            const resourceB = uri_1.URI.file('/some/path/other/fileB.txt');
            const resourceC = uri_1.URI.file('/unrelated/some/path/other/fileC.txt');
            // Full resource A path
            let query = ResourceAccessor.getItemPath(resourceA);
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            // Full resource B path
            query = ResourceAccessor.getItemPath(resourceB);
            res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
        });
        test('compareFilesByScore - basename prefix', function () {
            const resourceA = uri_1.URI.file('/some/path/fileA.txt');
            const resourceB = uri_1.URI.file('/some/path/other/fileB.txt');
            const resourceC = uri_1.URI.file('/unrelated/some/path/other/fileC.txt');
            // Full resource A basename
            let query = ResourceAccessor.getItemLabel(resourceA);
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            // Full resource B basename
            query = ResourceAccessor.getItemLabel(resourceB);
            res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
        });
        test('compareFilesByScore - basename camelcase', function () {
            const resourceA = uri_1.URI.file('/some/path/fileA.txt');
            const resourceB = uri_1.URI.file('/some/path/other/fileB.txt');
            const resourceC = uri_1.URI.file('/unrelated/some/path/other/fileC.txt');
            // resource A camelcase
            let query = 'fA';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            // resource B camelcase
            query = 'fB';
            res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
        });
        test('compareFilesByScore - basename scores', function () {
            const resourceA = uri_1.URI.file('/some/path/fileA.txt');
            const resourceB = uri_1.URI.file('/some/path/other/fileB.txt');
            const resourceC = uri_1.URI.file('/unrelated/some/path/other/fileC.txt');
            // Resource A part of basename
            let query = 'fileA';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            // Resource B part of basename
            query = 'fileB';
            res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
        });
        test('compareFilesByScore - path scores', function () {
            const resourceA = uri_1.URI.file('/some/path/fileA.txt');
            const resourceB = uri_1.URI.file('/some/path/other/fileB.txt');
            const resourceC = uri_1.URI.file('/unrelated/some/path/other/fileC.txt');
            // Resource A part of path
            let query = 'pathfileA';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            // Resource B part of path
            query = 'pathfileB';
            res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
        });
        test('compareFilesByScore - prefer shorter basenames', function () {
            const resourceA = uri_1.URI.file('/some/path/fileA.txt');
            const resourceB = uri_1.URI.file('/some/path/other/fileBLonger.txt');
            const resourceC = uri_1.URI.file('/unrelated/the/path/other/fileC.txt');
            // Resource A part of path
            const query = 'somepath';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
        });
        test('compareFilesByScore - prefer shorter basenames (match on basename)', function () {
            const resourceA = uri_1.URI.file('/some/path/fileA.txt');
            const resourceB = uri_1.URI.file('/some/path/other/fileBLonger.txt');
            const resourceC = uri_1.URI.file('/unrelated/the/path/other/fileC.txt');
            // Resource A part of path
            const query = 'file';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceC);
            assert.strictEqual(res[2], resourceB);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceC);
            assert.strictEqual(res[2], resourceB);
        });
        test('compareFilesByScore - prefer shorter paths', function () {
            const resourceA = uri_1.URI.file('/some/path/fileA.txt');
            const resourceB = uri_1.URI.file('/some/path/other/fileB.txt');
            const resourceC = uri_1.URI.file('/unrelated/some/path/other/fileC.txt');
            // Resource A part of path
            const query = 'somepath';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            assert.strictEqual(res[2], resourceC);
        });
        test('compareFilesByScore - prefer shorter paths (bug #17443)', function () {
            const resourceA = uri_1.URI.file('config/test/t1.js');
            const resourceB = uri_1.URI.file('config/test.js');
            const resourceC = uri_1.URI.file('config/test/t2.js');
            const query = 'co/te';
            const res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            assert.strictEqual(res[2], resourceC);
        });
        test('compareFilesByScore - prefer matches in label over description if scores are otherwise equal', function () {
            const resourceA = uri_1.URI.file('parts/quick/arrow-left-dark.svg');
            const resourceB = uri_1.URI.file('parts/quickopen/quickopen.ts');
            const query = 'partsquick';
            const res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
        });
        test('compareFilesByScore - prefer camel case matches', function () {
            const resourceA = uri_1.URI.file('config/test/NullPointerException.java');
            const resourceB = uri_1.URI.file('config/test/nopointerexception.java');
            for (const query of ['npe', 'NPE']) {
                let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceA);
                assert.strictEqual(res[1], resourceB);
                res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceA);
                assert.strictEqual(res[1], resourceB);
            }
        });
        test('compareFilesByScore - prefer more compact camel case matches', function () {
            const resourceA = uri_1.URI.file('config/test/openthisAnythingHandler.js');
            const resourceB = uri_1.URI.file('config/test/openthisisnotsorelevantforthequeryAnyHand.js');
            const query = 'AH';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
        });
        test('compareFilesByScore - prefer more compact matches (label)', function () {
            const resourceA = uri_1.URI.file('config/test/examasdaple.js');
            const resourceB = uri_1.URI.file('config/test/exampleasdaasd.ts');
            const query = 'xp';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
        });
        test('compareFilesByScore - prefer more compact matches (path)', function () {
            const resourceA = uri_1.URI.file('config/test/examasdaple/file.js');
            const resourceB = uri_1.URI.file('config/test/exampleasdaasd/file.ts');
            const query = 'xp';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
        });
        test('compareFilesByScore - prefer more compact matches (label and path)', function () {
            const resourceA = uri_1.URI.file('config/example/thisfile.ts');
            const resourceB = uri_1.URI.file('config/24234243244/example/file.js');
            const query = 'exfile';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
        });
        test('compareFilesByScore - avoid match scattering (bug #34210)', function () {
            const resourceA = uri_1.URI.file('node_modules1/bundle/lib/model/modules/ot1/index.js');
            const resourceB = uri_1.URI.file('node_modules1/bundle/lib/model/modules/un1/index.js');
            const resourceC = uri_1.URI.file('node_modules1/bundle/lib/model/modules/modu1/index.js');
            const resourceD = uri_1.URI.file('node_modules1/bundle/lib/model/modules/oddl1/index.js');
            let query = platform_1.$i ? 'modu1\\index.js' : 'modu1/index.js';
            let res = [resourceA, resourceB, resourceC, resourceD].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceC);
            res = [resourceC, resourceB, resourceA, resourceD].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceC);
            query = platform_1.$i ? 'un1\\index.js' : 'un1/index.js';
            res = [resourceA, resourceB, resourceC, resourceD].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceC, resourceB, resourceA, resourceD].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #21019 1.)', function () {
            const resourceA = uri_1.URI.file('app/containers/Services/NetworkData/ServiceDetails/ServiceLoad/index.js');
            const resourceB = uri_1.URI.file('app/containers/Services/NetworkData/ServiceDetails/ServiceDistribution/index.js');
            const resourceC = uri_1.URI.file('app/containers/Services/NetworkData/ServiceDetailTabs/ServiceTabs/StatVideo/index.js');
            const query = 'StatVideoindex';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceC);
        });
        test('compareFilesByScore - avoid match scattering (bug #21019 2.)', function () {
            const resourceA = uri_1.URI.file('src/build-helper/store/redux.ts');
            const resourceB = uri_1.URI.file('src/repository/store/redux.ts');
            const query = 'reproreduxts';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #26649)', function () {
            const resourceA = uri_1.URI.file('photobook/src/components/AddPagesButton/index.js');
            const resourceB = uri_1.URI.file('photobook/src/components/ApprovalPageHeader/index.js');
            const resourceC = uri_1.URI.file('photobook/src/canvasComponents/BookPage/index.js');
            const query = 'bookpageIndex';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceC);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceC);
        });
        test('compareFilesByScore - avoid match scattering (bug #33247)', function () {
            const resourceA = uri_1.URI.file('ui/src/utils/constants.js');
            const resourceB = uri_1.URI.file('ui/src/ui/Icons/index.js');
            const query = platform_1.$i ? 'ui\\icons' : 'ui/icons';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #33247 comment)', function () {
            const resourceA = uri_1.URI.file('ui/src/components/IDInput/index.js');
            const resourceB = uri_1.URI.file('ui/src/ui/Input/index.js');
            const query = platform_1.$i ? 'ui\\input\\index' : 'ui/input/index';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #36166)', function () {
            const resourceA = uri_1.URI.file('django/contrib/sites/locale/ga/LC_MESSAGES/django.mo');
            const resourceB = uri_1.URI.file('django/core/signals.py');
            const query = 'djancosig';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #32918)', function () {
            const resourceA = uri_1.URI.file('adsys/protected/config.php');
            const resourceB = uri_1.URI.file('adsys/protected/framework/smarty/sysplugins/smarty_internal_config.php');
            const resourceC = uri_1.URI.file('duowanVideo/wap/protected/config.php');
            const query = 'protectedconfig.php';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceC);
            assert.strictEqual(res[2], resourceB);
            res = [resourceC, resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceC);
            assert.strictEqual(res[2], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #14879)', function () {
            const resourceA = uri_1.URI.file('pkg/search/gradient/testdata/constraint_attrMatchString.yml');
            const resourceB = uri_1.URI.file('cmd/gradient/main.go');
            const query = 'gradientmain';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #14727 1)', function () {
            const resourceA = uri_1.URI.file('alpha-beta-cappa.txt');
            const resourceB = uri_1.URI.file('abc.txt');
            const query = 'abc';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #14727 2)', function () {
            const resourceA = uri_1.URI.file('xerxes-yak-zubba/index.js');
            const resourceB = uri_1.URI.file('xyz/index.js');
            const query = 'xyz';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #18381)', function () {
            const resourceA = uri_1.URI.file('AssymblyInfo.cs');
            const resourceB = uri_1.URI.file('IAsynchronousTask.java');
            const query = 'async';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #35572)', function () {
            const resourceA = uri_1.URI.file('static/app/source/angluar/-admin/-organization/-settings/layout/layout.js');
            const resourceB = uri_1.URI.file('static/app/source/angular/-admin/-project/-settings/_settings/settings.js');
            const query = 'partisettings';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #36810)', function () {
            const resourceA = uri_1.URI.file('Trilby.TrilbyTV.Web.Portal/Views/Systems/Index.cshtml');
            const resourceB = uri_1.URI.file('Trilby.TrilbyTV.Web.Portal/Areas/Admins/Views/Tips/Index.cshtml');
            const query = 'tipsindex.cshtml';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - prefer shorter hit (bug #20546)', function () {
            const resourceA = uri_1.URI.file('editor/core/components/tests/list-view-spec.js');
            const resourceB = uri_1.URI.file('editor/core/components/list-view.js');
            const query = 'listview';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #12095)', function () {
            const resourceA = uri_1.URI.file('src/vs/workbench/contrib/files/common/explorerViewModel.ts');
            const resourceB = uri_1.URI.file('src/vs/workbench/contrib/files/browser/views/explorerView.ts');
            const resourceC = uri_1.URI.file('src/vs/workbench/contrib/files/browser/views/explorerViewer.ts');
            const query = 'filesexplorerview.ts';
            let res = [resourceA, resourceB, resourceC].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceA, resourceC, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - prefer case match (bug #96122)', function () {
            const resourceA = uri_1.URI.file('lists.php');
            const resourceB = uri_1.URI.file('lib/Lists.php');
            const query = 'Lists.php';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
        });
        test('compareFilesByScore - prefer shorter match (bug #103052) - foo bar', function () {
            const resourceA = uri_1.URI.file('app/emails/foo.bar.js');
            const resourceB = uri_1.URI.file('app/emails/other-footer.other-bar.js');
            for (const query of ['foo bar', 'foobar']) {
                let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceA);
                assert.strictEqual(res[1], resourceB);
                res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceA);
                assert.strictEqual(res[1], resourceB);
            }
        });
        test('compareFilesByScore - prefer shorter match (bug #103052) - payment model', function () {
            const resourceA = uri_1.URI.file('app/components/payment/payment.model.js');
            const resourceB = uri_1.URI.file('app/components/online-payments-history/online-payments-history.model.js');
            for (const query of ['payment model', 'paymentmodel']) {
                let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceA);
                assert.strictEqual(res[1], resourceB);
                res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceA);
                assert.strictEqual(res[1], resourceB);
            }
        });
        test('compareFilesByScore - prefer shorter match (bug #103052) - color', function () {
            const resourceA = uri_1.URI.file('app/constants/color.js');
            const resourceB = uri_1.URI.file('app/components/model/input/pick-avatar-color.js');
            for (const query of ['color js', 'colorjs']) {
                let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceA);
                assert.strictEqual(res[1], resourceB);
                res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceA);
                assert.strictEqual(res[1], resourceB);
            }
        });
        test('compareFilesByScore - prefer strict case prefix', function () {
            const resourceA = uri_1.URI.file('app/constants/color.js');
            const resourceB = uri_1.URI.file('app/components/model/input/Color.js');
            let query = 'Color';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceB);
            assert.strictEqual(res[1], resourceA);
            query = 'color';
            res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
        });
        test('compareFilesByScore - prefer prefix (bug #103052)', function () {
            const resourceA = uri_1.URI.file('test/smoke/src/main.ts');
            const resourceB = uri_1.URI.file('src/vs/editor/common/services/semantikTokensProviderStyling.ts');
            const query = 'smoke main.ts';
            let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
            res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
            assert.strictEqual(res[0], resourceA);
            assert.strictEqual(res[1], resourceB);
        });
        test('compareFilesByScore - boost better prefix match if multiple queries are used', function () {
            const resourceA = uri_1.URI.file('src/vs/workbench/services/host/browser/browserHostService.ts');
            const resourceB = uri_1.URI.file('src/vs/workbench/browser/workbench.ts');
            for (const query of ['workbench.ts browser', 'browser workbench.ts', 'browser workbench', 'workbench browser']) {
                let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceB);
                assert.strictEqual(res[1], resourceA);
                res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceB);
                assert.strictEqual(res[1], resourceA);
            }
        });
        test('compareFilesByScore - boost shorter prefix match if multiple queries are used', function () {
            const resourceA = uri_1.URI.file('src/vs/workbench/node/actions/windowActions.ts');
            const resourceB = uri_1.URI.file('src/vs/workbench/electron-node/window.ts');
            for (const query of ['window node', 'window.ts node']) {
                let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceB);
                assert.strictEqual(res[1], resourceA);
                res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceB);
                assert.strictEqual(res[1], resourceA);
            }
        });
        test('compareFilesByScore - boost shorter prefix match if multiple queries are used (#99171)', function () {
            const resourceA = uri_1.URI.file('mesh_editor_lifetime_job.h');
            const resourceB = uri_1.URI.file('lifetime_job.h');
            for (const query of ['m life, life m']) {
                let res = [resourceA, resourceB].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceB);
                assert.strictEqual(res[1], resourceA);
                res = [resourceB, resourceA].sort((r1, r2) => compareItemsByScore(r1, r2, query, true, ResourceAccessor));
                assert.strictEqual(res[0], resourceB);
                assert.strictEqual(res[1], resourceA);
            }
        });
        test('prepareQuery', () => {
            assert.strictEqual((0, fuzzyScorer_1.$oq)(' f*a ').normalized, 'fa');
            assert.strictEqual((0, fuzzyScorer_1.$oq)('model Tester.ts').original, 'model Tester.ts');
            assert.strictEqual((0, fuzzyScorer_1.$oq)('model Tester.ts').originalLowercase, 'model Tester.ts'.toLowerCase());
            assert.strictEqual((0, fuzzyScorer_1.$oq)('model Tester.ts').normalized, 'modelTester.ts');
            assert.strictEqual((0, fuzzyScorer_1.$oq)('model Tester.ts').expectContiguousMatch, false); // doesn't have quotes in it
            assert.strictEqual((0, fuzzyScorer_1.$oq)('Model Tester.ts').normalizedLowercase, 'modeltester.ts');
            assert.strictEqual((0, fuzzyScorer_1.$oq)('ModelTester.ts').containsPathSeparator, false);
            assert.strictEqual((0, fuzzyScorer_1.$oq)('Model' + path_1.sep + 'Tester.ts').containsPathSeparator, true);
            assert.strictEqual((0, fuzzyScorer_1.$oq)('"hello"').expectContiguousMatch, true);
            assert.strictEqual((0, fuzzyScorer_1.$oq)('"hello"').normalized, 'hello');
            // with spaces
            let query = (0, fuzzyScorer_1.$oq)('He*llo World');
            assert.strictEqual(query.original, 'He*llo World');
            assert.strictEqual(query.normalized, 'HelloWorld');
            assert.strictEqual(query.normalizedLowercase, 'HelloWorld'.toLowerCase());
            assert.strictEqual(query.values?.length, 2);
            assert.strictEqual(query.values?.[0].original, 'He*llo');
            assert.strictEqual(query.values?.[0].normalized, 'Hello');
            assert.strictEqual(query.values?.[0].normalizedLowercase, 'Hello'.toLowerCase());
            assert.strictEqual(query.values?.[1].original, 'World');
            assert.strictEqual(query.values?.[1].normalized, 'World');
            assert.strictEqual(query.values?.[1].normalizedLowercase, 'World'.toLowerCase());
            const restoredQuery = (0, fuzzyScorer_1.$pq)(query.values);
            assert.strictEqual(restoredQuery.original, query.original);
            assert.strictEqual(restoredQuery.values?.length, query.values?.length);
            assert.strictEqual(restoredQuery.containsPathSeparator, query.containsPathSeparator);
            // with spaces that are empty
            query = (0, fuzzyScorer_1.$oq)(' Hello   World  	');
            assert.strictEqual(query.original, ' Hello   World  	');
            assert.strictEqual(query.originalLowercase, ' Hello   World  	'.toLowerCase());
            assert.strictEqual(query.normalized, 'HelloWorld');
            assert.strictEqual(query.normalizedLowercase, 'HelloWorld'.toLowerCase());
            assert.strictEqual(query.values?.length, 2);
            assert.strictEqual(query.values?.[0].original, 'Hello');
            assert.strictEqual(query.values?.[0].originalLowercase, 'Hello'.toLowerCase());
            assert.strictEqual(query.values?.[0].normalized, 'Hello');
            assert.strictEqual(query.values?.[0].normalizedLowercase, 'Hello'.toLowerCase());
            assert.strictEqual(query.values?.[1].original, 'World');
            assert.strictEqual(query.values?.[1].originalLowercase, 'World'.toLowerCase());
            assert.strictEqual(query.values?.[1].normalized, 'World');
            assert.strictEqual(query.values?.[1].normalizedLowercase, 'World'.toLowerCase());
            // Path related
            if (platform_1.$i) {
                assert.strictEqual((0, fuzzyScorer_1.$oq)('C:\\some\\path').pathNormalized, 'C:\\some\\path');
                assert.strictEqual((0, fuzzyScorer_1.$oq)('C:\\some\\path').normalized, 'C:\\some\\path');
                assert.strictEqual((0, fuzzyScorer_1.$oq)('C:\\some\\path').containsPathSeparator, true);
                assert.strictEqual((0, fuzzyScorer_1.$oq)('C:/some/path').pathNormalized, 'C:\\some\\path');
                assert.strictEqual((0, fuzzyScorer_1.$oq)('C:/some/path').normalized, 'C:\\some\\path');
                assert.strictEqual((0, fuzzyScorer_1.$oq)('C:/some/path').containsPathSeparator, true);
            }
            else {
                assert.strictEqual((0, fuzzyScorer_1.$oq)('/some/path').pathNormalized, '/some/path');
                assert.strictEqual((0, fuzzyScorer_1.$oq)('/some/path').normalized, '/some/path');
                assert.strictEqual((0, fuzzyScorer_1.$oq)('/some/path').containsPathSeparator, true);
                assert.strictEqual((0, fuzzyScorer_1.$oq)('\\some\\path').pathNormalized, '/some/path');
                assert.strictEqual((0, fuzzyScorer_1.$oq)('\\some\\path').normalized, '/some/path');
                assert.strictEqual((0, fuzzyScorer_1.$oq)('\\some\\path').containsPathSeparator, true);
            }
        });
        test('fuzzyScore2 (matching)', function () {
            const target = 'HelLo-World';
            for (const offset of [0, 3]) {
                let [score, matches] = _doScore2(offset === 0 ? target : `123${target}`, 'HelLo-World', offset);
                assert.ok(score);
                assert.strictEqual(matches.length, 1);
                assert.strictEqual(matches[0].start, 0 + offset);
                assert.strictEqual(matches[0].end, target.length + offset);
                [score, matches] = _doScore2(offset === 0 ? target : `123${target}`, 'HW', offset);
                assert.ok(score);
                assert.strictEqual(matches.length, 2);
                assert.strictEqual(matches[0].start, 0 + offset);
                assert.strictEqual(matches[0].end, 1 + offset);
                assert.strictEqual(matches[1].start, 6 + offset);
                assert.strictEqual(matches[1].end, 7 + offset);
            }
        });
        test('fuzzyScore2 (multiple queries)', function () {
            const target = 'HelLo-World';
            const [firstSingleScore, firstSingleMatches] = _doScore2(target, 'HelLo');
            const [secondSingleScore, secondSingleMatches] = _doScore2(target, 'World');
            const firstAndSecondSingleMatches = [...firstSingleMatches || [], ...secondSingleMatches || []];
            let [multiScore, multiMatches] = _doScore2(target, 'HelLo World');
            function assertScore() {
                assert.ok(multiScore ?? 0 >= ((firstSingleScore ?? 0) + (secondSingleScore ?? 0)));
                for (let i = 0; multiMatches && i < multiMatches.length; i++) {
                    const multiMatch = multiMatches[i];
                    const firstAndSecondSingleMatch = firstAndSecondSingleMatches[i];
                    if (multiMatch && firstAndSecondSingleMatch) {
                        assert.strictEqual(multiMatch.start, firstAndSecondSingleMatch.start);
                        assert.strictEqual(multiMatch.end, firstAndSecondSingleMatch.end);
                    }
                    else {
                        assert.fail();
                    }
                }
            }
            function assertNoScore() {
                assert.strictEqual(multiScore, undefined);
                assert.strictEqual(multiMatches.length, 0);
            }
            assertScore();
            [multiScore, multiMatches] = _doScore2(target, 'World HelLo');
            assertScore();
            [multiScore, multiMatches] = _doScore2(target, 'World HelLo World');
            assertScore();
            [multiScore, multiMatches] = _doScore2(target, 'World HelLo Nothing');
            assertNoScore();
            [multiScore, multiMatches] = _doScore2(target, 'More Nothing');
            assertNoScore();
        });
        test('fuzzyScore2 (#95716)', function () {
            const target = '# ❌ Wow';
            const score = _doScore2(target, '❌');
            assert.ok(score);
            assert.ok(typeof score[0] === 'number');
            assert.ok(score[1].length > 0);
        });
        test('Using quotes should expect contiguous matches match', function () {
            // missing the "i" in the query
            assert.strictEqual(_doScore('contiguous', '"contguous"')[0], 0);
            const score = _doScore('contiguous', '"contiguous"');
            assert.strictEqual(score[0], 253);
        });
        test('Using quotes should highlight contiguous indexes', function () {
            const score = _doScore('2021-7-26.md', '"26"');
            assert.strictEqual(score[0], 13);
            // The indexes of the 2 and 6 of "26"
            assert.strictEqual(score[1][0], 7);
            assert.strictEqual(score[1][1], 8);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=fuzzyScorer.test.js.map