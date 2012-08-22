
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
		      });
	 });