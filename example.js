
// This is a short introduction to precaution. For details see the spec/test/precaution.js 

describe('Example', function() {
	     
	     // Everything in precaution revolves around interfaces,
	     // signatures, checks and checked object -- everything
	     // here means both runtime checking of contracts and
	     // automatic generation of
	     // correctly formed spy objects for testing.

	     // Interfaces can be constructed with heavily chained
	     // javascript calls. Below we define two interfaces:
	     
	     var ReticulatorArgument = interface()
	     // Interface ReticulatorArgument 
	     // it must have a method `.done`
		 .method('done', signature()
			 // called with atleast one argument having a typeof()
			 // 'number`
			 .argument(check()
				   .hasTypeOf('number')));

	     var Reticulator = interface()
		 .method('reticulate', signature()
			 // first argument must be defined
			 // and is checked to obey the interface
			 // `ReticulatorArgument` defined above
			 .argument(check()
				   .isDefined()
				   .hasInterface(ReticulatorArgument))
			 // the second argument must also be defined
			 // and a function
			 .argument(check()
				   .isDefined() 
				   .hasTypeOf('function')
				  ));
	     var applied;
	     beforeEach(function() {
			    function A() {
			    };
			    A.prototype.reticulate = function(arg, cb) {
				return cb(arg);
			    };

			    A.prototype.hidden = function() {
			    };

			    // After we have defined interfaces we
			    // need to tell that a specific object
			    // needs to obey the interface -- we do
			    // this by calling `.check` which will
			    // return a checked object. Should
			    // precaution decide that it is impossible
			    // for the object to satisfy the interface
			    // from the get go it throws here.
			    applied = Reticulator.check(new A());
			});

	     it('Can check interfaces at runtime', function() {
		    var arg = {
			done: function() {}
		    };
		    // like so
		    applied.reticulate(arg, function() {});

		    // but woe unto us when we stray from the righteous path
		    // by for example passing an argument that does not match
		    // the interface needed for the argument
		    expect(function() {
			       applied.reticulate({}, function() {});
			   }).toThrow();

		    // Only the methods defined in the interface are visible
		    // in the checked object. For `A` this means that `.hidden`
		    // is not visible:
		    expect(applied.hidden).toBeUndefined();

		    // the interfaces are "contagious" in the sense that
		    // an interface can define that some argument must
		    // have an interface also
		    applied.reticulate({ done: function() {}},
				       function(a) { a.done(1); });
		    expect(function() {
			       applied.reticulate({ done: function() {}},
						 function(a) {
						     a.done('needs to be a number');
						 });
			   }).toThrow();
		});

	     it('Can construct correctly formed test spies', function() {
		    applied.reticulate(spy(), function(a) {
					   a.done(1);
				       });
		    // did you see that? The passed spy has a `.done`
		    // method! We didn't need to lift a finger to
		    // supply it.

		    // The spy method interface is of course
		    // checked like any other method.
		    expect(function() {
			       applied.reticulate(spy(), function(a) {
						      a.done('fails');
						  });
			   }).toThrow();
		});
	 });