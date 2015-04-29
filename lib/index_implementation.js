/*
 * bureaucat
 * http://github.com/indieisaconcept/bureaucat
 *
 * Copyright (c) 2015 Jonathan Barnett
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(helpers) {

    /**
     * @function bureaucat
     * Returns an input transformer
     *
     * @param {Object} template     the transform rules
     *
     * @returns {function}          the transformation function
     */

    var self = function bureaucat(template) {

        if (!template) {
            throw new Error('bureaucat requires a template');
        }

        return function (input) {
            var iterator = self.process.bind(null, input);
            return self.transform(template, iterator, input);
        };

    };

    /**
     * @function transform
     * Given a source object create a normalized
     * object based on the supplied template.
     *
     * @param {Object}       template  the transform rules
     * @param {Function}     iterator  function to apply to template
     * @param {Object|Array} input     the input to apply rules to
     *
     * @returns {Object|Array}  the transformed result
     */

    self.transform = function transform(template, iterator, input) {

        if (!template) {
            throw new Error('bureaucat transform requires a template');
        }

        // a) input is of type Array

        if (Array.isArray(input)) {
            return input.map(function (item) {
                iterator = self.process.bind(null, item);
                return self.transform(template, iterator, item);
            });
        }

        // b) input is of type Object

        return helpers.walk(template, iterator);

    };

    /**
     * @function process
     * Process a key against an given input, normalizing
     * and transforming as required
     *
     * @param {Object|Array} input   the input to apply rules to
     * @param {String}       key     the value to select
     *
     * @returns {Object|Array}  the transformed result
     */

    self.process = function process(input, key) {

        var bc        = key['::bc'] || key['(^._.^)ﾉ'] || { key: key },
            normalize = bc.normalize || {},
            template  = bc.template,
            resolver  = helpers.resolve.bind(null, input),
            output;

        key = bc.key;

        // determine if we have pre/post normalizers

        normalize = Array.isArray(normalize) ? { pre: normalize } : normalize;

        // see if we have multiple keys

        key  = key.split(/[,\s]+/);
        output = key.length > 1 ? key.map(resolver) : resolver(key[0]);

        output = normalize.pre ? helpers.reduce(output, normalize.pre) : output;

        // do we have a function based template
        template = typeof template === 'function' ? template(output) : template;

        output = template ? self(template)(output) : output;
        output = normalize.post ? helpers.reduce(output, normalize.post) : output;

        return output;

    };

    return self;

};
