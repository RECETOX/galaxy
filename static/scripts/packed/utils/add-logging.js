define([],function(){function a(c,b){if(b!==undefined){c._logNamespace=b}["debug","info","warn","error","metric"].forEach(function(d){(c.prototype||c)[d]=function(){if(!this.logger){return undefined}if(this.logger.emit){return this.logger.emit(d,this._logNamespace,arguments)}if(this.logger[d]){return this.logger[d].apply(this.logger,arguments)}return undefined}});return c}return a});