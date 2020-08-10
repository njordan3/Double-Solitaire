const statusMessage1 = document.getElementById("statusMessage1");
const statusMessage2 = document.getElementById("statusMessage2");
const statusMessage3 = document.getElementById("statusMessage3");

const statusMessages = {0: statusMessage1, 1: statusMessage2, 2: statusMessage3};

const fadeAmt = 0.05;

// FIFO
export class Messages {
    constructor(queueSize = 3) {
        this.messages = [];
        this.size = queueSize;
    }
    addMessage(msg, time) {
        this.messages.unshift(new Message(msg, time));

        // stop all timeouts and intervals and set new html properties before fading starts
        this.stopFades();
        while (this.messages.length > this.size) {
            this.messages.pop();
        }
        this.setMessageHTML();

        this.startFades();
        
    }
    stopFades() {
        for (let i = 0; i < this.messages.length; i++) {
            clearInterval(this.messages[i].interval);
            if (this.messages[i].timeout != undefined) {
                clearTimeout(this.messages[i].timeout);
                this.messages[i].hold = Math.max(this.messages[i].hold - Date.now() - this.messages[i].startTime, 0);
            }
        }
    }
    setMessageHTML() {
        for (let i = 0; i < this.messages.length; i++) {
            statusMessages[i].innerHTML = this.messages[i].msg;
            statusMessages[i].style.opacity = this.messages[i].opacity;
        }
    }
    startFades() {
        for (let i = 0; i < this.messages.length; i++) {
            this.messages[i].startFade(i);
        }
    }
}

class Message {
    constructor(msg, rate, hold = 2000) {
        this.msg = msg;
        this.rate = rate;
        this.startTime = Date.now();
        this.hold = hold;
        this.opacity = 1;
        this.timeout = undefined;
        this.interval = undefined;
    }
    startFade(i) {
        let that = this;
        that.timeout = setTimeout(function() {that.startInterval(i)}, that.hold);
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