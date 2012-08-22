
describe('Interface', function(){
	     function Example() {
		 this.attribute = 'attribute value';
	     };
	     Example.prototype.exampleMethod = function(a) {
		 return this.attribute;
	     };
	     describe('#check', function() {
			  it('returns a checked object', function() {
				 expect(new Interface('If')
					.check(new Example()))
				     .toBeDefined();
			     });
		      });
	     describe('checked object', function() {
			  it('has methods defined in the interface ', 
			     function() {
				 expect(new Interface('If')
					.method('exampleMethod')
					.check(new Example())
					.exampleMethod(123))
				     .toEqual('attribute value');
			     });

			  it('does not have methods not in the interface',
			    function() {
				expect(new Interface('If')
				       .check(new Example())
				       .exampleMethod)
				    .toBeUndefined();
			    });
		      });
	     describe('#method', function() {
			  it('defines a method required for the interface', 
			     function() {
				 expect(function() {
					    new Interface('If')
						.method('missingMethod')
						.check(new Example());
					}).toThrow();
			    });

			  it('may define a signature for the method', 
			    function() {
				var obj = new Interface('If')
				    .method('exampleMethod', 
					    new Signature()
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

describe('Signature', function() {
	     describe('#argument', function() {
			  it('may define a verifier fun for the argument', 
			     function() {
				 var fun = (new Signature()
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
				var fun = new Signature()
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
				 var fun = new Signature()
				     .argument(function() {
						   return 2;
					       })
				     .check(function(a) { return a; });
				 expect(fun(1)).toEqual(2);
			     });

			  it('leaves the argument intact if it returns undefined', 
			     function() {
				 var fun = new Signature()
				     .argument(function() {
						   return;
					       })
				     .check(function(a) { return a; });
				 expect(fun(1)).toEqual(1);
			     });

		      });
	     describe('#arguments', function() {
			  it('adds a verifier for all arguments', function() {
				var fun = new Signature()
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
				var fun = new Signature()
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
				var fun = new Signature()
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
				 var c = new Check()
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
				 var c = new Check()
				     .predicate(function(p) {
						    return p + 1;
						});
				 expect(c.call(c, 1)).toEqual(2);
			     });

			  it('multiple predicates may be chained', function() {
				 function add(p) {
				     return p + 1;
				 }
				 var c = new Check()
				     .predicate(add)
				     .predicate(add);
				 expect(c.call(c, 1)).toEqual(3);
			     });
		      });

	     describe('#hasInterface', function() {
			  it('applies an interface to the value', function() {
				 var c = new Check()
				     .hasInterface(new Interface('If')
						   .method('foo'));
				 expect(c.call(c, { foo: function() {}}))
				     .toBeDefined();
				 expect(function() {
					c.call(c, {}); 
					}).toThrow();
			     });
		      });

	     describe('#isDefined', function() {
			 it('requires that the value is defined', 
			    function() {
				var c = new Check()
				    .isDefined();
				expect(function() {
					   c.call(c, undefined);
				       }).toThrow();
				expect(c.call(c, 1)).toEqual(1);
			    });
		      });
	 });