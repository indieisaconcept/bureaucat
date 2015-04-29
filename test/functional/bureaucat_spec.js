/*
 * bureaucat
 * http://github.com/indieisaconcept/bureaucat
 *
 * Copyright (c) 2015 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

var bureaucat = require('../../lib'),
    tests     = require('./fixtures'),
    expect    = require('chai').expect;

describe('bureaucat', function () {

    Object.keys(tests).forEach(function (test) {

        var fixture = tests[test];

        it(test, function () {

            var bc     = bureaucat(fixture.template),
                result = bc(fixture.input);

            if (fixture.type) {
                expect(result).to.be.an(fixture.type);
            }

            expect(result).to.eql(fixture.output);

        });

    });

});
