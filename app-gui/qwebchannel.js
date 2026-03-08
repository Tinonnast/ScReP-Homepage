"use strict";

var QWebChannelMessageTypes = {
    signal: 1,
    propertyUpdate: 2,
    init: 3,
    idle: 4,
    debug: 5,
    reply: 6,
    error: 7,
    invokeMethod: 8,
    connectToSignal: 9,
    disconnectFromSignal: 10,
    setProperty: 11,
    response: 12
};

var QWebChannel = function(transport, initCallback)
{
    if (typeof transport !== "object" || typeof transport.send !== "function") {
        console.error("The QWebChannel requires a valid transport object. This must implement a send method.");
        return;
    }

    var channel = this;
    this.transport = transport;

    this.send = function(data)
    {
        if (typeof data !== "string") {
            data = JSON.stringify(data);
        }
        channel.transport.send(data);
    };

    this.transport.onmessage = function(message)
    {
        var data = message.data;
        if (typeof data === "string") {
            data = JSON.parse(data);
        }
        switch (data.type) {
            case QWebChannelMessageTypes.signal:
                channel.handleSignal(data);
                break;
            case QWebChannelMessageTypes.response:
                channel.handleResponse(data);
                break;
            case QWebChannelMessageTypes.propertyUpdate:
                channel.handlePropertyUpdate(data);
                break;
            default:
                console.error("invalid message type received: ", data.type);
                break;
        }
    };

    this.exec = function(data, callback)
    {
        if (!callback) {
            channel.send(data);
            return;
        }
        var id = channel.nextCallbackId++;
        channel.callbacks[id] = callback;
        data.id = id;
        channel.send(data);
    };

    this.callbacks = {};
    this.nextCallbackId = 0;
    this.objects = {};

    this.handleSignal = function(message)
    {
        var object = channel.objects[message.object];
        if (object) {
            object.signalEmitted(message.signal, message.args);
        } else {
            console.warn("Unhandled signal: " + message.object + "::" + message.signal);
        }
    };

    this.handleResponse = function(message)
    {
        var callback = channel.callbacks[message.id];
        if (callback) {
            callback(message.payload);
            delete channel.callbacks[message.id];
        }
    };

    this.handlePropertyUpdate = function(message)
    {
        for (var i in message.signals) {
            var object = channel.objects[i];
            if (object) {
                object.propertyUpdate(message.signals[i]);
            }
        }
    };

    this.debug = function(message)
    {
        channel.send({type: QWebChannelMessageTypes.debug, data: message});
    };

    channel.exec({type: QWebChannelMessageTypes.init}, function(data) {
        for (var objectName in data) {
            var object = new QObject(objectName, data[objectName], channel);
        }
        for (var objectName in data) {
            var object = channel.objects[objectName];
            for (var i = 0; i < object.__signals__.length; ++i) {
                var signalName = object.__signals__[i];
                object[signalName].connect(object.signalEmitted.bind(object, signalName));
            }
        }

        if (initCallback) {
            initCallback(channel);
        }
        channel.send({type: QWebChannelMessageTypes.idle});
    });
};

function QObject(name, data, webChannel)
{
    this.__id__ = name;
    webChannel.objects[name] = this;
    this.__metaclass__ = data;
    this.__signals__ = [];

    var self = this;

    for (var i = 0; i < data.methods.length; ++i) {
        var method = data.methods[i];
        this[method[0]] = (function(methodName) {
            return function() {
                var args = [];
                var callback;
                for (var j = 0; j < arguments.length; ++j) {
                    if (typeof arguments[j] === 'function') {
                        callback = arguments[j];
                    } else {
                        args.push(arguments[j]);
                    }
                }
                webChannel.exec({
                    type: QWebChannelMessageTypes.invokeMethod,
                    object: self.__id__,
                    method: methodName,
                    args: args
                }, callback);
            };
        })(method[0]);
    }

    this.signalEmitted = function(signalName, args) {
        if (this[signalName]) {
            this[signalName].emit.apply(this[signalName], args);
        }
    };

    this.propertyUpdate = function(signals) {
        for (var signalName in signals) {
            this.signalEmitted(signalName, signals[signalName]);
        }
    };
}
