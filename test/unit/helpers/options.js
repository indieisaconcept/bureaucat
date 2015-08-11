/*
 * bureaucat
 * http://github.com/indieisaconcept/bureaucat
 *
 * Copyright (c) 2015 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var options = require('../../../lib/helpers/index').options,
    expect  = require('chai').expect;

describe('helpers', function () {

    describe('method::options', function () {

        it('is a function', function () {
            expect(options).to.be.a('function');
            expect(options.length).to.equal(1);
        });

        it('returns an object if value undefined', function () {
            ['', undefined, null].forEach(function (item) {
                expect(options(item)).to.be.a('object');
            });
        });

        it('throw an error for non Object inputs', function () {
            [1, []].forEach(function (item) {
                item = options.bind(null, item);
                expect(item).to.throw();
            });
        });

        describe('options.prefix', function () {

            it('when set returns a regular expression', function () {
                var result = options({
                        prefix: 'foo.'
                    });
                expect(result.prefix).to.be.an.instanceof(RegExp);
                expect(result.prefix.test('foo.')).to.equal(true);
            });

            it('throw an error if not of type string', function () {
                [1, [], {}].forEach(function (item) {
                    item = options.bind(null, {
                        prefix: item
                    });
                    expect(item).to.throw();
                });
            });

        });

    });

});
