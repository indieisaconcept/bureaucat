'use strict';

module.exports = {

    'returns an Object when input is an Object': {
        type: 'Object',
        template: {
            transformers: {
                autobots   : 'transformers.autobots[0]',
                decepticons: 'transformers.decepticons[0]'
            }
        },
        input: {
            transformers: {
                autobots   : ['Optimus Prime', 'Bumblebee'],
                decepticons: ['Megatron', 'Soundware']
            }
        },
        output: {
            transformers: {
                autobots   : 'Optimus Prime',
                decepticons: 'Megatron'
            }
        }
    },

    'returns an Array when input is an Array': {
        type : 'Array',
        input: ['Optimus Prime', 'Bumblebee'],
        template: {
            name: '@this'
        },
        output: [{ name: 'Optimus Prime' }, { name: 'Bumblebee' }]
    },

    'resolves string values': {
        input   : { foo: 'bar' },
        template: { bar: 'foo' },
        output  : { bar: 'bar' }
    },

    'resolves object values': {
        input   : { foo: { bar: 'buzz' } },
        template: { bar: 'foo' },
        output  : { bar: { bar: 'buzz' } }
    },

    'resolves array values': {
        template: { bar: 'foo.bar' },
        input   : { foo: { bar: ['buzz'] } },
        output  : { bar: ['buzz'] }
    },

    'resolves indexed array values': {
        template: { bar: 'foo.bar[0]' },
        input   : { foo: { bar: ['buzz'] } },
        output  : { bar: 'buzz' }
    },

    'resolves nested indexed array string values': {
        template: { bar: 'foo.bar[1][0]' },
        input   : { foo: { bar: ['fizz', ['buzz']] } },
        output  : { bar: 'buzz' }
    },

    'resolves nested indexed array object values': {
        template: { bar: 'foo.bar[1][0]' },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }]] } },
        output  : { bar: { value: 'buzz' } }
    },

    'resolves nested indexed array object item values': {
        template: { bar: 'foo.bar[1][0].value' },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }]] } },
        output  : { bar: 'buzz' }
    },

    'resolves comma seperated keys': {
        template: { bar: 'foo.bar[1][0].value, foo.bar[1][1].value' },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }, { value: 'boo' }]] } },
        output  : { bar: ['buzz', 'boo'] }
    },

    'supports a basic transform object': {
        template: { bar: { '::bc': { key: 'foo.bar[1][0].value' } } },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }]] } },
        output  : { bar: 'buzz' }
    },

    'supports a basic transform object with comma seperated keys': {
        template: { bar: { '::bc':{ key: 'foo.bar[1][0].value, foo.bar[1][1].value' } } },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }, { value: 'boo' }]] } },
        output  : { bar: ['buzz', 'boo'] }
    },

    'supports a transform object with template for an Object': {
        template: {
            bar: {
                '::bc':{
                    key   : 'foo.bar[1][0].value',
                    template: {
                        item: '@this'
                    }
                }
            }
        },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }]] } },
        output  : { bar: { item: 'buzz' } }
    },

    'supports a transform object with template for an Object & comma seperated keys': {
        template: {
            bar: {
                '::bc':{
                    key   : 'foo.bar[1][0].value, foo.bar[1][1].value',
                    template: {
                        item: '@this'
                    }
                }
            }
        },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }, { value: 'boo' }]] } },
        output  : { bar: [{ item: 'buzz' }, { item: 'boo' }] }
    },

    'supports a transform object with deeply defined templates': {

        template: {
            bar: {
                '::bc':{
                    key   : 'foo.bar[1][0].value',
                    template: {
                        item: {
                            foo: {
                                bar: '@this'
                            }
                        }
                    }
                }
            }
        },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }]] } },
        output  : { bar: { item: { foo: { bar: 'buzz' } } } }

    },

    'supports a transform object with template for an Array': {
        template: {
            bar: {
                '::bc':{
                    key   : 'foo.bar[1]',
                    template: '@this.value'
                }
            }
        },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }, { value: 'buzz' }]] } },
        output  : { bar: ['buzz', 'buzz'] }
    },

    'supports a transform object with pre normalizers': {
        template: {
            bar: {
                '::bc':{
                    key    : 'foo.bar[1]',
                    template : '@this.value',
                    normalize: [
                        function (value) {
                            return value.map(function (item) {
                                item.value = item.value.toUpperCase();
                                return item;
                            });
                        },
                        function (value) {
                            return value.map(function (item) {
                                item.value = item.value + '-' + item.value;
                                return item;
                            });
                        }
                    ]
                }
            }
        },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }, { value: 'buzz' }]] } },
        output  : { bar: ['BUZZ-BUZZ', 'BUZZ-BUZZ'] }
    },

    'supports a transform object with post normalizers': {
        template: {
            bar: {
                '::bc':{
                    key    : 'foo.bar[1]',
                    template : '@this.value',
                    normalize: {
                        post: [
                            function (value) {
                                return value.map(function (item) {
                                    item = item.toUpperCase();
                                    item = item + '-' + item;
                                    return item;
                                });
                            }
                        ]
                    }
                }
            }
        },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }, { value: 'buzz' }]] } },
        output  : { bar: ['BUZZ-BUZZ', 'BUZZ-BUZZ'] }
    },

    'supports a transform object with pre && post normalizers': {
        template: {
            bar: {
                '::bc':{
                    key    : 'foo.bar[1]',
                    template : '@this.value',
                    normalize: {
                        pre : [
                            function (value) {
                                return value.map(function (item) {
                                    item.value = item.value.toUpperCase();
                                    return item;
                                });
                            }
                        ],
                        post: [
                            function (value) {
                                return value.map(function (item) {
                                    item = item + '-' + item;
                                    return item;
                                });
                            }
                        ]
                    }
                }
            }
        },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }, { value: 'buzz' }]] } },
        output  : { bar: ['BUZZ-BUZZ', 'BUZZ-BUZZ'] }
    },

    'supports a transform object with pre && post normalizers && comma keys': {
        template: {
            bar: {
                '::bc':{
                    key    : 'foo.bar[1][0], foo.bar[1][0]',
                    template : '@this.value',
                    normalize: {
                        pre : [
                            function (value) {
                                return value.map(function (item) {
                                    item.value = item.value.toUpperCase();
                                    return item;
                                });
                            }
                        ],
                        post: [
                            function (value) {
                                return value.map(function (item) {
                                    item = item + '-' + item;
                                    return item;
                                });
                            }
                        ]
                    }
                }
            }
        },
        input   : { foo: { bar: ['fizz', [{ value: 'buzz' }, { value: 'buzz' }]] } },
        output  : { bar: ['BUZZ-BUZZ', 'BUZZ-BUZZ'] }
    },

    'supports a transformation template containing Arrays': {
        template: {
            bizz: 'buzz',
            foo: {
                bar: [{ bar: 'foo.bar[0]' }, { bar: 'foo.bar[1][0].value' }]
            }
        },
        input : { foo: { bar: ['fizz', [{ value: 'buzz' }, { value: 'buzz' }]] } },
        output: {
            bizz: 'buzz',
            foo: {
                bar : [{ bar: 'fizz' }, {bar: 'buzz'}]
            }
        }
    },

    'supports a transformation template with static data via prefix': {
        template: {
            bizz: 'buzz',
            foo: {
                bar: [{ bar: 'bc.foo.bar[0]' }, { bar: 'bc.foo.bar[1][0].value' }]
            },
            some: {
                static    : 'body',
                collection: ['this', 'is', 'a', 'fizz']
            }

        },
        options: {
            prefix: 'bc.'
        },
        input : {
            body: 'i should not be set',
            foo : { bar: ['fizz', [{ value: 'buzz' }, { value: 'buzz' }]] }
        },
        output: {
            bizz: 'buzz',
            foo: {
                bar : [{ bar: 'fizz' }, {bar: 'buzz'}]
            },
            some: {
                static    : 'body',
                collection: ['this', 'is', 'a', 'fizz']
            }
        }
    },

    'supports a transformation template with static data & advanced': {
        template: {
            bizz: 'buzz',
            foo: {
                bar: [{ bar: 'bc.foo.bar[0]' }, { bar: 'bc.foo.bar[1][0].value' }]
            },
            some: {
                static    : 'body',
                collection: ['this', 'is', 'a', 'fizz'],
                advanced  : {
                    '::bc':{
                        key     : 'foo.bar[0]',
                        template: '@this'
                    }
                }
            }

        },
        options: {
            prefix: 'bc.'
        },
        input : {
            body: 'i should not be set',
            foo : { bar: ['fizz', [{ value: 'buzz' }, { value: 'buzz' }]] }
        },
        output: {
            bizz: 'buzz',
            foo: {
                bar : [{ bar: 'fizz' }, {bar: 'buzz'}]
            },
            some: {
                static    : 'body',
                collection: ['this', 'is', 'a', 'fizz'],
                advanced: 'fizz'
            }
        }
    }

};
