
function interface(name) {
    return new Interface(name);  
};

function Interface(interfaceName) {
    this._name = interfaceName || "Unnamed interface";
    this._methods = {};
}

Interface.prototype.method = function(name, signature) {
    if (name.match(/^_/))
	throw new Error('Interfaces may not contain methods starting with "_"');
    if (this._methods[name])
	throw new Error('Duplicate method name in interface: ' + name);
    this._methods[name] = signature || new Signature();
    return this;
};

Interface.prototype.and = function(i) {
    for(var m in i._methods) {
	this._methods[m] = i._methods[m];
    }
    return this;
};

Interface.prototype.check = function(ob) {
    return checkedObject(ob, this);
};

function spyMethod() {
    return new SpyMethod();
}

function SpyMethod() {
    this._funs = [];
    this._expectations= [];
}

SpyMethod.prototype.verify = function() {
    for(var e in this._expectations) {
	if(!this._expectations[e].resolved)
	    return false;
    }
    return true;
};

SpyMethod.prototype.returns = function(v) {
    this.whenCalled(function() { return v; });
    return this;
};

SpyMethod.prototype.mustBeCalled = function(atLeast, atMost) {
    atLeast = (atLeast === undefined ? 1 : atLeast);
    
    var expectation = {};
    this._expectations.push(expectation);
    this.whenCalled(function() {
			if(--atLeast <= 0)
			    expectation.resolved = true;
			if(atMost !== undefined &&
			   --atMost <= 0)
			    throw new Error('Spy method called too many times');
			    
		    });
    return this;
};

SpyMethod.prototype.whenCalled = function(fun) {
    this._funs.push(fun);
    return this;
};

SpyMethod.prototype.apply = function(ctx, args) {
    var r;
    for(var f in this._funs)
	r = this._funs[f].apply(ctx, args);
    return r;
};

function spy() {
    return new Spy();
}

function Spy() {
    this._spyMethods = {};
    this._children = [];
}

Spy.prototype.child = function() {
    var s = spy();
    this._children.push(s);
    return s;
};

Spy.prototype.verify = function() {
    for(var m in this._spyMethods) {
	if(!this._spyMethods[m].verify())
	    throw new Error('Unresolved spy method: ' + m);
    }
    for(var c in this._children) {
	this._children[c].verify();
    }
};

Spy.prototype.method = function(name, fun) {
    var self = this;
    if (!this[name])
	if (fun instanceof SpyMethod)
	    this._spyMethods[name] = fun;
	this[name] = function() {
	    if(fun)
		return fun.apply(self, arguments);
	};
    return this;
};

function checkedObject (ob, i) {
    if (ob instanceof CheckedObject && 
	ob._interface === i
       )
	return ob;
    if (ob instanceof Spy)
	for(var m in i._methods)
	    ob.method(m);
    return new CheckedObject(ob, i);
};

function CheckedObject (ob, i) {
    this._object = ob;
    this._interface = i;
    var self = this;

    for(var key in i._methods) {
	if (!this._object[key]) {
	    throw new Error('Required method missing: ' + key);
	}
	if (!this._object[key].apply) {
	    throw new Error('The interface method must have `.apply`');
	}
	this[key] = i._methods[key]
	    .check(function() {
		       return self._object[key].apply(self._object, arguments);
		   }, this);
    }
    return this;
};

function signature() {
    return new Signature();
}

function Signature() {
    this._argument = [];
    this._returns = [];
}

Signature.prototype.argument = function(i) {
    this._argument.push(i || function() {});
    return this;
};

Signature.prototype.arguments = function(i) {
    this._arguments = i;
    return this;
};

Signature.prototype.returnsSelf = function() {
    this._returns.push(function(i, ctx) {
			   if (i === undefined) {
			       if (ctx instanceof Spy ) {
				   return ctx;
			       }
			   }

			   if(ctx instanceof CheckedObject) {
			       if (i !== ctx._object)
				   throw new Error('Method should return self');
			       return ctx;
			   }
			   if (!i || !ctx)
			       throw new Error('Method should return self'); 
			   if (i !== ctx) {
			       throw new Error('Method should return self');
			   }
		       });
    return this;
};

Signature.prototype.returns = function(i) {
    this._returns.push(i);
    return this;
};

Signature.prototype._checkArguments = function(args) {
    var hackedArgs = [];
    for (var i = 0; i < this._argument.length; i++) {
	var a = this._argument[i].call(this._argument[i], args[i]);
	if (args.length > i)
	    hackedArgs.push(a === undefined ? args[i] : a);
    }
    while(hackedArgs.length < args.length)
	hackedArgs.push(args[i++]);
    console.assert(hackedArgs.length === args.length);

    if (this._arguments)
	this._arguments.call(this._arguments, args);
    return hackedArgs;
};

Signature.prototype._checkReturn = function(val, ctx) {
    var result;
    result = val;
    for (var r in this._returns) {
	result = this._returns[r].call(this._returns[r], val, ctx);
	if (result !== undefined)
	    val = result;
    }
    return val;
};

Signature.prototype.check = function(fn) {
    var self = this;
    if (fn.__precaution_magic_signature_flag === this)
	return fn;
    var result = function() {
	return self.
	    _checkReturn(fn.apply(this,
				  self._checkArguments(arguments)),
			this);
    };
    result.__precaution_magic_signature_flag = this;
    return result;
};

function check() {
    return new Check();
}

function Check() {
    this._predicates = [];
}

Check.prototype.predicate = function(p) {
    this._predicates.push(p);
    return this;
};

Check.prototype.equals = function() {
    var args = arguments;
    this._predicates.push(function(v) {
			      for(var a in args) {
				  if(args[a] === v)
				      return;
			      }
			      throw new Error('Value did not equal any option: ' +
					      v);
			  });
    return this;
};

Check.prototype.either = function() {
    var args = arguments;
    this._predicates.push(function(v) {
			      var r;
			      var holds = 0;
			      for(var p in args) {
				  try {
				      r = args[p].call(args[p], v);
				      holds++;
				  } catch (x) {}
			      }
			      if (holds > 1)
				  throw new Error('More than one check holds');
			      if (holds === 0)
				  throw new Error('None of the checks hold for value');
			      return r;
			  });
    return this;
};

Check.prototype.isDefined = function(i) {
    this.predicate(function(v) {
		       if (v === undefined || v === null)
			   throw new Error('Argument should not be undefined');
		   });
    return this;
};

Check.prototype.hasInterface = function(i) {
    this.predicate(function(v) {
		       return i.check(v);
		   });
    return this;
};

Check.prototype.hasSignature = function(i) {
    this.predicate(function(v) {
		       return i.check(v);
		   });
    return this;
};

Check.prototype.hasTypeOf = function(t) {
    this.predicate(function(v) {
		       if (v === undefined || v === null)
			   return;
		       if (typeof(v) !== t)
			   throw new Error('Argument should have typeof ' +
					  t + ' : ' + v);
		   });
    return this;
};

Check.prototype.call = function(self, v) {
    for (var p in self._predicates) {
	var n = self._predicates[p](v);
	v = (n === undefined ? v : n);
    }
    return v;
};



