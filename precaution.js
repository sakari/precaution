
function Interface(interfaceName) {
    this._name = interfaceName;
    this._methods = {};
    this._interfaces = [];
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
    this._interfaces.push(i);
    return this;
};

Interface.prototype.check = function(ob) {
    var checked = checkedObject(ob);
    checked._applyInterface(this);
    for (var i in this._interfaces)
	this._interfaces[i].check(checked);
    return checked;
};

function checkedObject (ob) {
    if (ob.__magic_precaution_checkedObject_flag)
	return ob;
    return new CheckedObject(ob);
};

function CheckedObject (ob) {
    this._object = ob;
    this.__interfaces = {};
    this.__magic_precaution_checkedObject_flag = true;
};

CheckedObject.prototype._interfaces = function (ob) {
    return this.__interfaces;
};

CheckedObject.prototype._applyInterface = function (i) {
    for(var existing in this.__interfaces)
	if (existing === i._name) {
	    if (this.__interfaces[existing] !== i)
		throw new Error('Tried to apply an interface with a name that is already used');
	    return this;
	}
	    

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
		   });
    }
    this.__interfaces[i._name] = i;
    return this;
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

function Check() {
    this._predicates = [];
}

Check.prototype.predicate = function(p) {
    this._predicates.push(p);
    return this;
};

Check.prototype.isDefined = function(i) {
    this.predicate(function(v) {
		       if (v === undefined)
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

Check.prototype.call = function(self, v) {
    for (var p in self._predicates) {
	var n = self._predicates[p](v);
	v = (n === undefined ? v : n);
    }
    return v;
};



