
function Interface(interfaceName) {
    this._name = interfaceName;
    this._methods = {};
}

Interface.prototype.method = function(name, signature) {
    if (this._methods[name])
	throw new Error('Duplicate method name in interface: ' + name);
    this._methods[name] = signature || new Signature();
    return this;
};

Interface.prototype.check = function(ob) {
    var checkedObj = {
	_object: ob
    };
    for(var key in this._methods) {
	if (!ob[key]) {
	    throw new Error('Required method missing: ' + key);
	}
	checkedObj[key] = this._methods[key]
	    .check(function() {
		       return ob[key].apply(ob, arguments);
		   });
    }
    return checkedObj;
};

function Signature() {
    this._argument = [];
    this._returns = function() {};
}

Signature.prototype.argument = function(i) {
    this._argument.push(i || function() {});
    return this;
};

Signature.prototype.arguments = function(i) {
    this._arguments = i;
    return this;
};

Signature.prototype.returns = function(i) {
    this._returns = i;
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

Signature.prototype._checkReturn = function(val) {
    var r = this._returns.call(this._returns, val);
    return ( r === undefined ? val : r);
};

Signature.prototype.check = function(fn) {
    var self = this;
    return function() {
	return self.
	    _checkReturn(fn.apply(null,
				  self._checkArguments(arguments)));
    };
};




