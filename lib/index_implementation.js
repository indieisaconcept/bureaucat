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
     * @param {Object} options      a configuration object
     *
     * @returns {function}          the transformation function
     */

    var self = function bureaucat(template, options) {

        if (!template) {
            throw new Error('bureaucat requires a template');
        }

        options = helpers.options(options);
        return self.transform.bind(null, template, options);

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

    self.transform = function transform(template, options, input) {

        if (!template) {
            throw new Error('bureaucat transform requires a template');
        }

        // a) input is of type Array

        if (Array.isArray(input)) {
            return input.map(function (item) {
                return self.transform(template, options, item);
            });
        }

        // b) input is of type Object

        var iterator = self.process.bind(null, options, input);
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

    self.process = function process(options, input, key) {

        var advanced  = key['::bc']  || key['(^._.^)ﾉ'],
            bc        = advanced     || { key: key },
            normalize = bc.normalize || {},
            template  = bc.template,
            resolver  = helpers.resolve.bind(null, input),
            parse     = true,
            output;

        key = bc.key;

        // return early if the key is not of type
        // string

        if (typeof key !== 'string') {
            return key;
        }

        // determine if we have pre/post normalizers

        normalize = Array.isArray(normalize) ? { pre: normalize } : normalize;

        // is there a key prefix which needs to be
        // processed?

        if (options.prefix && !advanced) {
            parse = options.prefix ? options.prefix.test(key) : parse;
            key   = key.replace(options.prefix, '');
        }

        // return early for non-parseables

        if (!parse) {
            return key;
        }

        key    = key.split(/[,\s]+/);
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
