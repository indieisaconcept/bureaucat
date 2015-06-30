/*
 * bureaucat
 * http://github.com/indieisaconcept/bureaucat
 *
 * Copyright (c) 2015 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var helpers = require('../../../lib/helpers/index'),
    walk    = helpers.walk,
    expect  = require('chai').expect;

describe('helpers', function () {

    describe('method::walk', function () {

        it('is a function', function () {
            expect(walk).to.be.a('function');
            expect(walk.length).to.equal(2);
        });

        it('throws an error if a non-object passed', function () {

            [null, undefined].forEach(function (item) {
                expect(walk.bind(null, item)).to.throw();
            });

            [[], {}, 'foo'].forEach(function (item) {
                expect(walk.bind(null, item)).to.not.throw();
            });

        });

        it('does not process an Object with no keys', function () {

            var called = false;

            helpers.walk = function (input, iterator) {
                called = true;
                return walk(input, iterator);
            };

            walk({});
            expect(called).to.equal(false);
            walk([]);
            expect(called).to.equal(false);
            helpers.walk = walk;

        });

        it('calls itself if processing an Object ( Object || Array )', function () {

            var called = false;

            helpers.walk = function (input, iterator) {
                called = true;
                return walk(input, iterator);
            };

            walk({ foo: { bar: 'buzz' } });
            expect(called).to.equal(true);

        });

        it('does not call itself if processing an "::bc" Object', function () {

            var called = false;

            helpers.walk = function (input, iterator) {
                throw new Error('I was called');
                return walk(input, iterator);
            };

            walk({ foo: { '::bc': {} } });
            expect(called).to.equal(false);

        });

        it('calls an iterator function if specified', function () {

            var called = false;

            walk({ foo: { '::bc': {} } }, function () {
                called = true;
            });

            expect(called).to.equal(true);

        });

        it('throws an error if iterator throws an error', function () {

            var called = false;

            expect(walk.bind(null, { foo: { '::bc': {} } }, function () {
                throw new Error('fail');
            })).to.throw(/fail/);

        });

    });

});
