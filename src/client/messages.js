const statusMessage1 = document.getElementById("statusMessage1");
const statusMessage2 = document.getElementById("statusMessage2");
const statusMessage3 = document.getElementById("statusMessage3");

const statusMessages = {0: statusMessage1, 1: statusMessage2, 2: statusMessage3};

const fadeAmt = 0.05;

export class Messages {
    constructor() {
        this.messages = [];
    }
    addMessage(msg, time) {
        this.messages.unshift(new Message(msg, time));
        if (this.messages.length > 3) {
            this.messages.pop();
        }
        for (let i = 0; i < this.messages.length; i++) {
            this.messages[i].startFade(i);
        }
    }
}

class Message {
    constructor(msg, rate, hold = 2000) {
        this.msg = msg;
        this.hold = hold;
        this.rate = rate;
        this.opacity = 1;
    }
    startFade(i) {
        if (this.opacity > 0) {
            statusMessages[i].style.display = "block";
            statusMessages[i].innerHTML = this.msg;
            let that = this;
            // timeout before fading
            setTimeout(function () {
                // interval to fade at
                let t = setInterval(function () {
                    if (that.opacity > 0) {
                        that.opacity -= fadeAmt;
                        statusMessages[i].style.opacity = that.opacity;
                    } else {
                        this.msg = "";
                        clearInterval(t);
                    }
                }, that.rate);
            }, that.hold);
        }
    }
}