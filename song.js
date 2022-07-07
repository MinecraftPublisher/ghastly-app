let audio = new Audio('/assets/audio.mp3');
audio.loop = true;
audio.volume = 0.5;
audio.play();
window.onclick = () => {
    audio.play();
};

function addOnBlurListener(onBlurCallback, onFocusCallback) {
    var hidden, visibilityState, visibilityChange; // check the visiblility of the page

    if (typeof document.hidden !== "undefined") {
        hidden = "hidden"; visibilityChange = "visibilitychange"; visibilityState = "visibilityState";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden"; visibilityChange = "mozvisibilitychange"; visibilityState = "mozVisibilityState";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden"; visibilityChange = "msvisibilitychange"; visibilityState = "msVisibilityState";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden"; visibilityChange = "webkitvisibilitychange"; visibilityState = "webkitVisibilityState";
    }


    if (typeof document.addEventListener === "undefined" || typeof hidden === "undefined") {
        // not supported
    } else {
        document.addEventListener(visibilityChange, function () {
            switch (document[visibilityState]) {
                case "visible":
                    if (onFocusCallback) onFocusCallback();
                    break;
                case "hidden":
                    if (onBlurCallback) onBlurCallback();
                    break;
            }
        }, false);
    }
}

addOnBlurListener(() => audio.pause(), () => audio.play());