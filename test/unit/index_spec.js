/*
 * bureaucat
 * http://github.com/indieisaconcept/bureaucat
 *
 * Copyright (c) 2015 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var getImplementation = require('../../lib/index_implementation'),
    expect            = require('chai').expect,
    noop              = function () {};

describe('bureaucat', function () {

    it('is a function', function () {
        var bureaucat = getImplementation();
        expect(bureaucat).to.be.a('function');
        expect(bureaucat.length).to.equal(2);
    });

    it('throws an error if no template specified', function () {
        var bureaucat = getImplementation();
        expect(bureaucat).to.throw(/requires a template/);
    });

    it('calls helpers.options with correct arguments', function () {
        var called    = false,
            bureaucat = getImplementation({
                options: function () {
                    called = true;
                }
            });
        bureaucat({});
        expect(called).to.equal(true);
    });

    it('returns a function if a template is specified', function () {
        var bureaucat = getImplementation({ options: noop });
        expect(bureaucat({})).to.be.a('function');
    });

    describe('method::transform', function () {

        it('is a function', function () {
            var transform = getImplementation().transform;
            expect(transform).to.be.a('function');
            expect(transform.length).to.equal(3);
        });

        it('throws an error if no template specified', function () {
            var transform = getImplementation().transform;
            expect(transform).to.throw(/requires a template/);
        });

        it('supports an Array input', function () {

            var words = [
                    { word: 'transform' },
                    { word: 'and'       },
                    { word: 'roll'      },
                    { word: 'out'       }
                ],
                template = {
                    'key': '@this.word'
                },
                calledCount = 0,
                bureaucat   = getImplementation({
                    walk: function (template, interator) {
                        var index = calledCount++;
                        expect(interator).to.be.a('function');
                        return { key: words[index].word };
                    }
                });

                bureaucat.transform(template, function () {}, words);
                expect(calledCount).to.equal(words.length);

        });

        it('supports an Object input', function () {

            var fixture = {
                    template: { key: 'word' },
                    input   : {
                        word: 'transformers'
                    }
                },
                calledCount = 0,
                bureaucat   = getImplementation({
                    walk: function (template, interator) {
                        expect(interator).to.be.a('function');
                        calledCount++;
                        return { key: fixture.input.word };
                    }
                }),

                result = bureaucat
                    .transform(fixture.template, function () {}, fixture.input);
                expect(result).to.eql({ key: 'transformers' });
                expect(calledCount).to.equal(1);

        });

    });

    describe('method::process', function () {

        it('is a function', function () {
            var processor = getImplementation().process;
            expect(processor).to.be.a('function');
            expect(processor.length).to.equal(3);
        });

        [
            {
                name   : 'when key is a String',
                fixture: {
                    key: 'foo.bar',
                    input: {
                        foo: { bar: 'buzz' }
                    }
                },
                called: { resolve: 1 }
            }, {
                name   : 'when key is an Object',
                fixture: {
                    key: {
                        '::bc': { key: 'foo.bar' }
                    },
                    input: {
                        foo: { bar: 'buzz' }
                    }
                },
                called: { resolve: 1 }
            }, {
                name   : 'when key is an comma separated String',
                fixture: {
                    key: 'foo.bar, foo.buzz',
                    input: {
                        foo: { bar: 'buzz', buzz: 'buzz' }
                    }
                },
                called: { resolve: 2 }
            }, {
                name   : 'when key a number',
                fixture: {
                    key: 1,
                    input: {
                        foo: { bar: 'buzz', buzz: 'buzz' }
                    }
                },
                called: { resolve: 0 }
            }

        ].forEach(function (test) {

            describe(test.name, function () {

                it('calls helpers.resolve with the correct arguments', function () {

                    var calledCount = 0,
                        processor   = getImplementation({
                            resolve: function (input, key) {

                                expect(key).to.be.a('string');
                                calledCount++;

                                var match = test.fixture.key;
                                match = typeof match === 'number' ? '' + match : match;
                                match = match['::bc'] ? match['::bc'].key : match;
                                match = match.split(/[,\s]+/);

                                expect(input).to.eql(test.fixture.input);
                                expect(key).to.equal(match[calledCount - 1]);

                                return 'buzz';

                            },
                            options: function() { return {}; },
                            reduce: function () { return 'buzz'; }
                        }).process;

                    processor({}, test.fixture.input, test.fixture.key);
                    expect(calledCount).to.equal(test.called.resolve);

                });

                it('calls helpers.reduce with the correct arguments', function () {

                    var processor = getImplementation({
                            resolve: function () { return 'foo'; },
                            reduce : function (value, normalizers) {
                                expect(value).to.equal('foo');
                                expect(normalizers).to.be.an('array');
                            }
                        }).process;

                    processor({}, test.fixture.input, test.fixture.key);

                });

            });

        });

        describe('calls helpers.reduce correctly when using normalizers', function () {

            [
                {
                    name : 'none specified',
                    count: 0
                }, {
                    name     : 'are specified',
                    count    : 1,
                    normalize: []
                }, {
                    name     : 'pre specified',
                    count    : 1,
                    normalize: { pre: [] }
                }, {
                    name     : 'post specified',
                    count    : 1,
                    normalize: { post: [] }
                }, {
                    name     : 'pre & post specified',
                    count    : 2,
                    normalize: { pre: [], post: [] }
                }
            ].forEach(function (test) {

                it(test.name, function () {

                    var calledCount = 0,
                        fixture = {
                            key: { '::bc': { key: 'foo.bar' } },
                            input: { foo  : { bar: 'buzz' } }
                        },
                        processor = getImplementation({
                            resolve: function () { return 'foo'; },
                            options: function () { return {}; },
                            reduce : function () {
                                calledCount++;
                            }
                        }).process;

                    if (test.normalize) {
                        fixture.key['::bc'].normalize = test.normalize;
                    }

                    processor({}, fixture.input, fixture.key);
                    expect(calledCount).to.equal(test.count);

                });

            });
        });

        it('calls self.transform if "::bc.template"', function () {

            var fixture = {
                    key: {
                        '::bc': { key: 'fo', template: { value: '@this' } }
                    },
                    input: {
                        foo: ['buzz']
                    },
                    result: [{ value: 'buzz' }]
                },

                implementation = getImplementation({
                    resolve: function () { return ['buzz']; },
                    options: function () { return {}; },
                    reduce : function () {}
                }),

                transform = implementation.transform,
                processor = implementation.process,
                result;

            implementation.transform = function (template, options, input) {
                expect(template).to.eql(fixture.key['::bc'].template);
                expect(options).to.be.an('object');
                expect(input).to.eql(fixture.input.foo);
                implementation.transform = transform;
                return fixture.result;
            };

            result = processor({}, fixture.input, fixture.key);

            expect(result).to.eql(fixture.result);

        });

        it('calls "::bc.template" if a function', function () {

            var called = false,
                fixture = {
                    key: {
                        '::bc': {
                            key: 'fo',
                            template: function (value) {
                                expect(value).to.eql(fixture.input.foo);
                                called = true;
                                return { value: '@this' };
                            }
                        }
                    },
                    input: {
                        foo: ['buzz']
                    },
                    result: [{ value: 'buzz' }]
                },

                implementation = getImplementation({
                    resolve: function () { return ['buzz']; },
                    options: function () { return {}; },
                    reduce : function () {}
                }),

                transform = implementation.transform,
                processor = implementation.process,
                result;

            implementation.transform = function (template, options, input) {
                expect(template).to.eql({ value: '@this' });
                expect(options).to.be.an('object');
                expect(input).to.eql(fixture.input.foo);
                implementation.transform = transform;
                return fixture.result;
            };

            result = processor({}, fixture.input, fixture.key);

            expect(result).to.eql(fixture.result);
            expect(called).to.equal(true);

        });

    });

});
