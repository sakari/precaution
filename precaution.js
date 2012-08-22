function $$(value) {
    function Contract(value) {
	this._object = value;
    }
    return new Contract(value);
}

function Interface(interfaceName) {
    this._name = interfaceName;
    this._methods = {};
}

Interface.prototype.method = function(name, signature) {
    if (this._methods[name])
	throw new Error('Duplicate method name in interface: ' + name);
    this._methods[name] = signature;
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
	checkedObj[key] = function() {
	    return ob[key].apply(ob, arguments);
	};
    }
    return checkedObj;
};

function Signature() {
    this._arguments = [];    
}

Signature.prototype.argument = function(i) {
    this._arguments.push(i);
    return this;
};

Signature.prototype.returns = function(i) {
    this._returns = i;
    return this;
};

Signature.prototype._checkArguments = function(args) {
    for (var i in this._arguments) {
	this._arguments[i](args[i]);
    }
};

Signature.prototype._checkReturn = function(val) {
    if (this._returns)
	this._returns(val);
    return val;
};

Signature.prototype.check = function(fn, obj) {
    var self = this;
    return function() {
	self._checkArguments(arguments);
	return self._checkReturn(fn.apply(obj || null, arguments));
    };
};




