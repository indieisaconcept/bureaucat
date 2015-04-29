# bureaucat

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image] [![Coverage Status][coveralls-image]][coveralls-url]

Transforms & normalizes JSON structures like a **`bureaucat`** ( using templates )

![Image](bureaucat.jpg?raw=true)

## Install

```bash
$ npm install --save bureaucat
```

## Usage
To use `bureaucat` you must first create a transform function by passing a template. This will return a function which can then be used for transforming a document compatible with the initially set template.

```JavaScript
var bureaucat = require('bureaucat'),
    template  = require('./template'),
    bc        = bureaucat(template);

bc({
    "cats": ["Tardar Sauce", "Garfield"]
});

// returns transformed template
```
> 1.1 Example invocation

### Templates
A template defines the rules used for transformation, and generally reflects what the result will look like after transformation.

```JavaScript
// template.js
module.exports = {
    "cats": {
        "famous": {
            "real"   : "cats[0]",
            "cartoon": "cats[1]"
        }
    }
};
// result
{
    "cats": {
        "famous": {
            "real"   : "Tardar Sauce",
            "cartoon": "Garfield"
        }
    }
}
```
> 1.2 An example of a template

#### Values
Each key value in a template represents a dot notation string which is used to access data from the original document.

- some.data.value
- some.array[0].value
- some.array[0][1].value

> 1.3 An example of keys

#### Advanced
A `::bc` transformation object can be used to provide finer control over the transformation of a value. To use this feature you must structure your template as per the below example.

```JavaScript
module.exports = {
    "cats": {
        "::bc": {
            "key"      : "cats"
            "normalize": [function () {}, function () {}],
            "template": {
                "name": "@this"
            }
        }
    }
}
```
> 1.4 An example of an advanced template

Note `@this` denotes the current value within the context of an Array / Input.

##### key
Where to obtain the value from

##### template
This is particularly useful when the value is an array. It allows a transformation to applied based on the specified template to each value in the array. Using the template example in figure 1.4 the following transformation would occur.

```JavaScript
// from

transform({
    "cats": ["Tardar Sauce", "Garfield"],
});

// to
{
    "cats": [
        { "name": "Tardar Sauce" },
        { "name": "Garfield"     }
    ]
}
```
> 1.5 A transformation using an advanced template

###### template function

A template can also be a function. When used a resolved value is passed to the template. This permits a different template to be selected depending upon the value passed.

```JavaScript
module.exports = {
    "cats": {

        "::bc": {
            "key"      : "cats"
            "normalize": [function () {}, function () {}],
            "template" : function (value) {

                if (value === 'Garfield') {
                    return {
                        "name"    : "@this",
                        "dislikes": ['Monday']
                    };
                }

                if (value === 'Tardar Sauce') {
                    return {
                        "name"    : "@this",
                        "dislikes": ['everything']
                    };
                }

                return {
                    "name": "@this"
                };

            }
        }

    }
};
```
> 1.6 A transformation using an advanced template function

##### normalize

This is used to specify 1 or more functions to run against the currenty selected value. A normalizer should have the following interface.

```JavaScript
function a_normalizer(value) {
    ... do something ...
    return modifiedValue;
}
```
> 1.7 Defining a normalizer

###### pre & post normalize

Normalizers are run prior to transforming via a template if specified, but can also be run post transformation using the format below.

```JavaScript
module.exports = {
    "cats": {
        "::bc": {
            "key"      : "cats",
            "normalize": {
                    pre : [function () {}, function () {}],
                    post: [function () {}, function () {}]
            },
            "template": {
                    .....
            }
        }
    }
};
```

- **pre:** run before template transform
- **post:** run after tremplate transform

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using `npm test`

## Release History

- **0.1.0** Initial release

## License

Copyright (c) 2015 Jonathan Barnett. Licensed under the MIT license.

[handlebars-url]: https://github.com/wycats/handlebars.js
[npm-url]: https://npmjs.org/package/bureaucat
[npm-image]: https://badge.fury.io/js/bureaucat.svg
[travis-url]: https://travis-ci.org/indieisaconcept/bureaucat
[travis-image]: https://travis-ci.org/indieisaconcept/bureaucat.svg?branch=master
[daviddm-url]: https://david-dm.org/indieisaconcept/bureaucat.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/indieisaconcept/bureaucat
[coveralls-url]: https://coveralls.io/r/indieisaconcept/bureaucat
[coveralls-image]: https://coveralls.io/repos/indieisaconcept/bureaucat/badge.png
