/*
 * bureaucat
 * http://github.com/indieisaconcept/bureaucat
 *
 * Copyright (c) 2015 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var resolve = require('../../../lib/helpers/index').resolve,
    expect  = require('chai').expect;

describe('helpers', function () {

    describe('method::resolve', function () {

        it('is a function', function () {
            expect(resolve).to.be.a('function');
            expect(resolve.length).to.equal(2);
        });

        it('throws an error if no keys specified', function () {
            expect(resolve.bind(null, {})).to.throw(/key string/);
        });

        it('does not throw an error if no input specified', function () {
            expect(resolve).to.not.throw();
        });

        it('returns undefined if cannot find match', function () {
            expect(resolve({}, 'some.path.that.doesnt.exist')).to.an('undefined');
        });

        it('support back reference via @this', function () {

            var result = resolve({
                    one: {
                        two: [{ value: 'three' }]
                    }
                }, 'one.two.@this[0].value');

            expect(result).to.equal('three');
        });

        (function () {

            var input = {
                    one: {
                        two: [3, 4, 5, 6, { name: 'seven', value: ['eight'] } ]
                    }
                },

                tests = {
                    'basic': {
                        key : 'one',
                        result: input.one
                    },
                    'Array': {
                        key : 'one.two',
                        result: input.one.two
                    },
                    'Array[i]': {
                        key : 'one.two[0]',
                        result: input.one.two[0]
                    },
                    'Array[i].key': {
                        key : 'one.two[4].name',
                        result: input.one.two[4].name
                    },
                    'Array[i][key]': {
                        key : 'one.two[4][name]',
                        result: input.one.two[4].name
                    },
                    'Array[i][key][i]': {
                        key : 'one.two[4][value][0]',
                        result: input.one.two[4].value[0]
                    }
                };

            Object.keys(tests).forEach(function (test) {
                var fixture = tests[test];
                it('matches ' + test, function () {
                    var result = resolve(input, fixture.key);
                    expect(result).to.eql(fixture.result);
                });
            });

        }());

    });

});
