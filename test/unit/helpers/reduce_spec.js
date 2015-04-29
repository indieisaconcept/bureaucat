/*
 * bureaucat
 * http://github.com/indieisaconcept/bureaucat
 *
 * Copyright (c) 2015 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var reduce = require('../../../lib/helpers/index').reduce,
    expect = require('chai').expect;

describe('helpers', function () {

    describe('method::reduce', function () {

        it('is a function', function () {
            expect(reduce).to.be.a('function');
            expect(reduce.length).to.equal(2);
        });

        it('returns undefined if no value specified', function () {
            expect(reduce()).to.an('undefined');
        });

        it('returns value if no normalizers specified', function () {
            expect(reduce('foo')).to.equal('foo');
        });

        it('throws an error if normalizers are not of type Array', function () {
            expect(reduce.bind(null, 'foo', 'bar')).to.throw(/no method 'reduce'/);
        });

        it('throws an error if a normalizer is not a function', function () {
            expect(reduce.bind(null, 'foo', ['bar'])).to.throw(/not a function/);
        });

        describe('normalizers', function () {

            it('execute in series against a passed value', function () {

                var called = 0,
                    normalizers = [
                        function () { called++; },
                        function () { called++; }
                    ];

                reduce('foo', normalizers);
                expect(called).to.equal(2);

            });

            describe('modify', function () {

                it('a value', function () {

                    var normalizers = [
                            function (val) { return val + 1; },
                            function (val) { return val + 1; }
                        ];

                    expect(reduce(0, normalizers)).to.equal(2);

                });

                it('throws an error if a normalizer errors', function () {

                    var normalizers = [
                            function (val) { return val + 1; },
                            function (val) { throw new Error('failed'); }
                        ];

                    expect(reduce.bind(null, 0, normalizers)).to.throw(/failed/);

                });

            });

        });

    });

});
