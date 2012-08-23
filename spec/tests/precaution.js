
describe('Interface', function(){
	     function Example() {
		 this.attribute = 'attribute value';
	     };
	     Example.prototype.exampleMethod = function(a) {
		 return this.attribute;
	     };

	     describe('#check', function() {
			  it('returns a checked object', function() {
				 expect(interface('If')
					.check(new Example()))
				     .toBeDefined();
			     });

			  it('does not apply an already applied interface', 
			     function() {
				 var called = 0;
				 var i = interface('i')
				     .method('foo', signature()
					     .argument(function(v) {
							   called ++;	   
						       }));
				 var obj = { foo: function() {} };
				 obj = i.check(i.check(obj));
				 obj.foo();
				 expect(called).toEqual(1);
			     });
			  it('may narrow existing interface', function() {
				 var i = interface()
				     .method('a')
				     .method('b');
				 var k = interface()
				     .method('a');
				 var obj = k.check(i.check({
							       a: function() {},
							       b: function() {}
							   }));
				 expect(obj.a).toBeDefined();
				 expect(obj.b).toBeUndefined();
			     });
		      });

	     describe('#and', function() {
			  it('combines interfaces', 
			     function() {
				 var p = {
				     'aMethod': function() {},
				     'bMethod': function() {},
				     'cMethod': function() {},
				     'dMethod': function() {}
				 };
				 p = interface()
				     .method('aMethod')
				     .and(interface()
					  .and(interface()
					       .method('bMethod'))
					  .and(interface()
					       .method('cMethod')))
				     .check(p);
				 expect(p.aMethod).toBeDefined();
				 expect(p.bMethod).toBeDefined();
				 expect(p.cMethod).toBeDefined();
				 expect(p.dMethod).toBeUndefined();
			    });
		      });

	     describe('#method', function() {
			  it('defines a method required for the interface', 
			     function() {
				 expect(function() {
					    interface('If')
						.method('missingMethod')
						.check(new Example());
					}).toThrow();
			    });

			  it('does not allow starting underscore', 
			     function() {
				 expect(function() {
					    interface('i')
						.method('_private');
					}).toThrow();
			     });

			  it('requires that the object method has `.apply`',
			     function() {
				 expect(function() {
					    interface('i')
						.method('foo')
						.check({ foo: 'value' });
					}).toThrow();
			     });

			  it('may define a signature for the method', 
			    function() {
				var obj = interface('If')
				    .method('exampleMethod', 
					    signature()
					    .argument(function(a) {
							  if (a < 0)
							      throw new Error();
						      }))
				    .check(new Example());
				expect(obj.exampleMethod(1))
				    .toEqual('attribute value');
				expect(function() {
					   obj.exampleMethod(-1);
				       }).toThrow();
			    });
		      });
	 });

describe('CheckedObject', function() {
	     function Example() {
		 this.attribute = 'attribute value';
	     };
	     Example.prototype.exampleMethod = function(a) {
		 return this.attribute;
	     };

	     it('has methods defined in the interface ', 
		function() {
		    expect(interface('If')
			   .method('exampleMethod')
			   .check(new Example())
			   .exampleMethod(123))
			.toEqual('attribute value');
		});

	     it('does not have methods not in the interface',
		function() {
		    expect(interface('If')
			   .check(new Example())
			   .exampleMethod)
			.toBeUndefined();
		});
	 });


describe('Signature', function() {
	     describe('#check', function() {
			  it('does not reaply the signature immediately again', 
			    function() {
				var called = 0;
				var s = signature()
				    .argument(function() {
						  called++;
					      });
				function test() {};
				s.check(s.check(test))();
				expect(called).toEqual(1);
			    });
		      });

	     describe('#argument', function() {
			  it('may define a verifier fun for the argument', 
			     function() {
				 var fun = (signature()
					    .argument(function(a) {
							  if (a <= 0)
							      throw new Error();
						      })
					    .check(function (a) {
						       return 1;
						   }));
				 expect(function() {
					    fun(0);
					}).toThrow();
				 expect(fun(1)).toEqual(1);
			     });

			  it('may take anything with `.call` as checker', 
			    function() {
				var check = {
				    call: function() {
					if (this.throw)
					    throw new Error();
				    }
				};
				var fun = signature()
				    .argument(check)
				    .check(function() { return 1; });
				expect(fun()).toEqual(1);
				expect(function() {
					   check.throw = true;
					   fun();
				       }).toThrow();
			    });

			  it('may return a value to be used in the checked fun', 
			     function() {
				 var fun = signature()
				     .argument(function() {
						   return 2;
					       })
				     .check(function(a) { return a; });
				 expect(fun(1)).toEqual(2);
			     });

			  it('leaves the argument intact if it returns undefined', 
			     function() {
				 var fun = signature()
				     .argument(function() {
						   return;
					       })
				     .check(function(a) { return a; });
				 expect(fun(1)).toEqual(1);
			     });

		      });
	     describe('#arguments', function() {
			  it('adds a verifier for all arguments', function() {
				var fun = signature()
				     .arguments(function(args) {
						    if (args.length !== 1)
							throw new Error();
						})
				     .check(function() { return 1; });
				 expect(function() { 
					    fun(); 
					}).toThrow();
				 expect(fun(1)).toEqual(1);
			     });
		      });

	     describe('#returns', function() {
			  it('may define a verifier fun for the result', 
			    function() {
				var fun = signature()
				    .returns(function(v) {
						 if (v <= 0)
						     throw new Error();
					     })
				    .check(function(a) { return a; });
				expect(function() {
				       fun(0);
				       }).toThrow();
				expect(fun(1)).toEqual(1);
			    });

			  it('may return a new value to be used as return value', 
			    function() {
				var fun = signature()
				    .returns(function(v) {
						 return 2;
					     })
				    .check(function(a) { return a; });
				expect(fun(1)).toEqual(2);
			    });
		      });
	 });

describe('Check', function() {
	     describe('#predicate', function() {
			  it('checks that the predicate holds', function() {
				 var c = check()
				     .predicate(function(p) {
						    if (p < 0)
							throw new Error();
						});
				 expect(c.call(c, 1)).toEqual(1);
				 expect(function() {
					    c.check(-1);
					}).toThrow();
			     });
			  it('may modify the returned value', function() {
				 var c = check()
				     .predicate(function(p) {
						    return p + 1;
						});
				 expect(c.call(c, 1)).toEqual(2);
			     });

			  it('multiple predicates may be chained', function() {
				 function add(p) {
				     return p + 1;
				 }
				 var c = check()
				     .predicate(add)
				     .predicate(add);
				 expect(c.call(c, 1)).toEqual(3);
			     });
		      });

	     describe('#hasInterface', function() {
			  it('applies an interface to the value', function() {
				 var c = check()
				     .hasInterface(interface('If')
						   .method('foo'));
				 expect(c.call(c, { foo: function() {}}))
				     .toBeDefined();
				 expect(function() {
					c.call(c, {}); 
					}).toThrow();
			     });
		      });

	     describe('#hasSignature', function() {
			 it('applies a signature to the value function', 
			    function() {
				var c = check()
				    .hasSignature(signature()
						  .argument(function(a) {
								return a + 1;
							    }));
				function test(a) {
				    return a;
				}
				expect(c.call(c, test)(1)).toEqual(2);
			    });
		      });

	     describe('#equals', function() {
			  it('fails if value is not === equal to any option',
			    function() {
				var c = check().equals(1, 2);
				expect(function() {
					   c.call(c, 3);
				       }).toThrow();
			    });

			  it('succeeds if value is === to some options', 
			    function() {
				var c = check().equals(1, 'value');
				expect(c.call(c, 1)).toEqual(1);
				expect(c.call(c, 'value')).toEqual('value');
			    });
		      });

	     describe('#either', function() {
			  it('requires that one of the given checks holds',
			    function() {
				var c = check()
				    .either(check().hasTypeOf('boolean'),
					    check().hasTypeOf('number'));
				expect(function() {
				       c.call(c, "fail");
				       }).toThrow();
				expect(c.call(c, 1)).toEqual(1);
				expect(c.call(c, true)).toEqual(true);
			    });

			  it('requires that only one check holds', function() {
				 var c = check()
				    .either(check().hasTypeOf('boolean'),
					    check().hasTypeOf('boolean'));
				 expect(function() {
					    c.call(c, true);
					}).toThrow();
			     });
		      });

	     describe('#isDefined', function() {
			 it('requires that the value is not undefined', 
			    function() {
				var c = check()
				    .isDefined();
				expect(function() {
					   c.call(c, undefined);
				       }).toThrow();
				expect(c.call(c, 1)).toEqual(1);
			    });

			  it('requires that the value is not null', 
			     function() {
				 var c = check()
				     .isDefined();
				 expect(function() {
					    c.call(c, null);
					}).toThrow();
			     });
		      });

	     describe('#hasTypeOf', function() {
			  it('requires that the value has the specified typeof', 
			     function() {
				 var c = check()
				     .hasTypeOf('boolean');
				 expect(function() {
					c.call(c, "abc");
					}).toThrow();
				 expect(c.call(c, true))
				     .toEqual(true);
			    });
			  it('allows undefined and null values', function() {
				 var c = check()
				     .hasTypeOf('boolean');
				 expect(c.call(c, undefined)).toEqual(undefined);
				 expect(c.call(c, null)).toEqual(null);
			     });
		      });
	 });