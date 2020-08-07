const statusMessage1 = document.getElementById("statusMessage1");
const statusMessage2 = document.getElementById("statusMessage2");
const statusMessage3 = document.getElementById("statusMessage3");

const statusMessages = {0: statusMessage1, 1: statusMessage2, 2: statusMessage3};

const fadeAmt = 0.05;

export class Messages {
    constructor(queueSize = 3) {
        this.messages = [];
        this.size = queueSize;
    }
    addMessage(msg, time) {
        this.messages.unshift(new Message(msg, time));
        while (this.messages.length > this.size) {
            this.messages.pop();
        }
        for (let i = 0; i < this.messages.length; i++) {
            this.messages[i].stopInterval();
            this.messages[i].startFade(i);
        }
    }
}

class Message {
    constructor(msg, rate, hold = 2000) {
        this.msg = msg;
        this.rate = rate;
        this.hold = hold;
        this.opacity = 1;
        this.timeout = undefined;
        this.interval = undefined;
    }
    startFade(i) {
        statusMessages[i].innerHTML = this.msg;
        statusMessages[i].style.opacity = this.opacity;
        let that = this;
        // timeout before fading
        if (this.timeout == undefined) {
            this.timeout = setTimeout(that.startInterval(i), that.hold);
        } else {
            this.startInterval(i);
        }
    }
    stopInterval() {
        clearInterval(this.interval);
    }
    startInterval(i) {
        let that = this;
        that.interval = setInterval(function () {
            if (that.opacity > 0) {
                that.opacity -= fadeAmt;
                statusMessages[i].style.opacity = that.opacity;
            } else {
                that.opacity = 0;
                clearInterval(that.interval);
            }
        }, that.rate);
    }
}