
describe('Interface', function(){
	     function Example() {
	     };
	     Example.prototype.exampleMethod = function(a) {
		 return a;
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
				     .toEqual(123);
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
				expect(new Interface('If')
				       .method('exampleMethod', 
					       new Signature())
				       .check(new Example()))
				.toBeDefined();
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
	     describe('#check', function() {
			  it('may add a context for the checked function', 
			    function() {
				var obj = {
				    method: function() {
					return this.value;
				    },
				    value: 123
				};
				expect(new Signature()
				       .check(obj.method, obj)())
				    .toEqual(123);
			    });
		      });
	 });