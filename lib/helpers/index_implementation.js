/*
 * bureaucat
 * http://github.com/indieisaconcept/bureaucat
 *
 * Copyright (c) 2015 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function () {

    var self = {},
        noop;

    /**
     * @function resolve
     * Return a value from a input object based upon
     * a dot notation string
     *
     * @param {Object} input  the object to interogate
     * @param {String} key    a dot notation string
     *
     * @example <caption>Example keys</caption>
     *
     * 1) some.path.to.a.value
     * 2) some[0].path.to[0][1].a.value[0]
     *
     * @returns {Number|Array|Object|String}    the retrieved value
     */

    self.resolve = function resolve (input, key) {

        if (!input) { return input; }

        if (typeof key !== 'string') {
            throw new Error('resolve expects a key string');
        }

        var keys;

        keys = key.split(/\[|\]|\./).filter(function (key) {
            return key.length > 0;
        });

        return keys.reduce(function (acc, key) {
            acc = acc || {};
            return key === '@this' ? acc : acc[key];
        }, input);

    };

    /**
     * @function reduce
     * Reduce a value based on an array of normalizers
     *
     * @param {String} value        a dot notation string
     * @param {Array}  normalizers  an array of functions to run against value
     *
     * @returns {Number|Array|Object|String}    the reduced value
     */

    self.reduce = function reduce (value, normalizers) {

        if (value == null || value === undefined) { return value; }
        if (!normalizers) { return value; }

        var result = normalizers.reduce(function (acc, normalize) {
            acc = normalize(acc);
            return acc;
        }, value);

        return result;

    };

    /**
     * @function walk
     * Walk an object tree applying an iterator on each value
     *
     * @param {Object}      input        the object to iterate over
     * @param {Function}    iterator     the function to apply to each value
     *
     * @returns {Number|Array|Object|String}    the reduced value
     */

    noop = function (value) { return value; };

    self.walk = function walk (input, iterator) {

        iterator   = iterator || noop;

        if (typeof input === 'string') { return iterator(input); }

        var keys   = Object.keys(input),
            result = {};

        keys.forEach(function (key) {

            var value    = input[key],
                isObject = typeof value === 'object' &&
                           !Array.isArray(value) && !(value['::bc'] || value['(^._.^)ﾉ']);

            result[key] = isObject ? self.walk(value, iterator) : iterator(value);

        });

        return result;

    };

    return self;

};
