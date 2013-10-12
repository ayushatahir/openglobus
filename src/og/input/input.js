
goog.provide('og.input');
goog.provide('og.input.Input');

og.input.KEY_SPACE = 32;
og.input.KEY_H = 72;
og.input.KEY_C = 67;
og.input.KEY_X = 88;
og.input.KEY_E = 69;
og.input.KEY_Q = 81;
og.input.KEY_W = 87;
og.input.KEY_S = 83;
og.input.KEY_A = 65;
og.input.KEY_D = 68;
og.input.KEY_SHIFT = 16;
og.input.KEY_LEFT = 37;
og.input.KEY_RIGHT = 39;
og.input.KEY_UP = 38;
og.input.KEY_DOWN = 40;
og.input.KEY_F1 = 112;
og.input.MB_LEFT = 0;
og.input.MB_RIGHT = 2;
og.input.MB_MIDDLE = 1;

og.input.Input = function () {
    this.currentlyPressedKeys = {};
    this.pressedKeysCallbacks = {};
    this.charkeysCallbacks = {};

    var that = this;
    document.onkeydown = function (event) { that.handleKeyDown.call(that, event) };
    document.onkeyup = function (event) { that.handleKeyUp.call(that, event) };
};

og.input.Input.prototype.setEvent = function (event, sender, htmlObject, callback, keyCode) {
    var handle = this;
    switch (event) {
        case "onmousewheel": {
            var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

            if (htmlObject.attachEvent) //if IE (and Opera depending on user setting)
                htmlObject.attachEvent("on" + mousewheelevt, function (evt) { callback.call(sender, evt); })
            else if (htmlObject.addEventListener) //WC3 browsers
                htmlObject.addEventListener(mousewheelevt, function (evt) { evt.wheelDelta = evt.detail * (-120); callback.call(sender, evt); }, false)

            //htmlObject.onmousewheel = function (event) { callback.call(sender, event); };
        }
            break;
        case "onmousedown":
            htmlObject.onmousedown = function (event) { callback.call(sender, event); };
            htmlObject.oncontextmenu = function (event) { return false; };
            break;
        case "onmouseup":
            htmlObject.onmouseup = function (event) { callback.call(sender, event); };
            break;
        case "onmousemove":
            htmlObject.onmousemove = function (event) { callback.call(sender, event); };
            break;
        case "onkeypressed":
            this.pressedKeysCallbacks[keyCode] = { callback: callback, sender: sender };
            break;
        case "oncharkeypressed":
            this.charkeysCallbacks[keyCode] = { callback: callback, sender: sender, ch:String.fromCharCode(keyCode) };
            break;
    }
};


og.input.Input.prototype.isKeyPressed = function (keyCode) {
    return this.currentlyPressedKeys[keyCode];
};

og.input.Input.prototype.handleKeyDown = function (event) {
    //DEBUG
    //console.log(event.keyCode);
    //END DEBUG

    this.currentlyPressedKeys[event.keyCode] = true;

    for (var ch in this.charkeysCallbacks) {
        if (String.fromCharCode(event.keyCode) == this.charkeysCallbacks[ch].ch) {
            var ccl = this.charkeysCallbacks[ch];
            ccl.callback.call(ccl.sender);
        }
    }
};

og.input.Input.prototype.handleKeyUp = function (event) {
    this.currentlyPressedKeys[event.keyCode] = false;
};

og.input.Input.prototype.handleEvents = function () {
    for (var pk in this.pressedKeysCallbacks) {
        if (this.currentlyPressedKeys[pk]) {
            var cpk = this.pressedKeysCallbacks[pk];
            cpk.callback.call(cpk.sender);
        }
    }
};