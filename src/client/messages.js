const statusMessage1 = document.getElementById("statusMessage1");
const statusMessage2 = document.getElementById("statusMessage2");
const statusMessage3 = document.getElementById("statusMessage3");

const statusMessages = {0: statusMessage1, 1: statusMessage2, 2: statusMessage3};

const fadeRate = 0.05;

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
    constructor(msg, time) {
        this.msg = msg;
        this.time = time;
        this.opacity = 1;
    }
    startFade(i) {
        statusMessages[i].style.display = "block";
        statusMessages[i].innerHTML = this.msg;
        let that = this;
        let t = setInterval(function () {
            if (that.opacity > 0) {
                that.opacity -= fadeRate;
                statusMessages[i].style.opacity = that.opacity;
            } else {
                //statusMessages[i].style.display = "none";
                clearInterval(t);
            }
        }, that.time);
    }
}