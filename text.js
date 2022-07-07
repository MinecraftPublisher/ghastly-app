let ath = '';
let end_text = 'The end';
let playsound = true;
let sounds = ['/assets/sent.mp3', '/assets/received.mp3'];

function iOS() {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || ("ontouchend" in document)
}

String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

String.prototype.colorify = function () {
    let hash = Math.abs(this.hashCode()).toString();
    if (hash.length < 6) hash = (new Array(20)).join(hash).substring(0, 6);
    return `#${hash.substring(0, 6)}`;
};

const reverse_hex = ((bgColor, lightColor = '#ffffff', darkColor = '#000000') => {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
        darkColor : lightColor;
});

/**
 * Writes a message to the screen and returns the dom element of that message.
 * @param {string} sent Wether to send or no. Could be true, false, notice or author.
 * @param {string} input The text.
 * @param {string} author The author for received messages.
 * @returns {HTMLElement} The dom element of the message.
 */
const message = globalThis.message = ((sent, input, author = ath, time = true, clickd = false) => {
    const scroll = (() => document.querySelector('main').scroll({ top: document.querySelector('main').scrollHeight, behavior: "smooth" }));
    /* yk */ input = input.toLowerCase();

    if (sent === 'notice') {
        const elm = document.createElement('wrapper');
        elm.classList.add('notice');
        const text = document.createElement('text');
        text.innerHTML = input;
        elm.appendChild(text);
        document.querySelector('main').appendChild(elm);
    } else if (sent === 'author') {
        ath = input;
    } else {
        const elm = document.createElement('wrapper');
        elm.classList.add(sent ? 'from' : 'to');
        const data = document.createElement('message');
        elm.appendChild(data);
        const text = document.createElement('text');
        text.innerHTML = input;
        data.appendChild(text);
        const _author = document.createElement('author');
        // add the hour and the minute to the author. the minutes should be two digits.
        _author.innerHTML = (sent ? 'sent' : author) + (time ? ' ' + new Date().getHours() + ':' + (new Date().getMinutes() < 10 ? '0' : '') + new Date().getMinutes() : '');
        data.appendChild(_author);
        if (!sent) {
            let background = author.substring(2).toLowerCase().colorify();
            let foreground = reverse_hex(background);
            background = author.colorify();
            foreground = reverse_hex(background);
            elm.style.background = background;
            elm.style.color = foreground;
            data.style.background = background;
            data.style.color = foreground;
            data.style.border = `2px solid ${foreground}`;
            text.style.background = background;
            text.style.color = foreground;
            _author.style.background = background;
            _author.style.color = foreground;

            if (clickd) {
                data.onmouseover = (() => {
                    // lighten the background color
                    elm.style.background = foreground;
                    data.style.background = foreground;
                    text.style.color = background;
                    _author.style.color = background;
                    text.style.background = foreground;
                    _author.style.background = foreground;
                    data.style.border = `2px solid ${background}`;
                    data.style.transition = 'color 0.2s ease-in-out, background 0.2s ease-in-out, border 0.2s ease-in-out';
                    text.style.transition = 'color 0.2s ease-in-out, background 0.2s ease-in-out';
                    _author.style.transition = 'color 0.2s ease-in-out, background 0.2s ease-in-out';
                });
                data.onmouseout = (() => {
                    // darken the background color
                    elm.style.background = background;
                    data.style.background = background;
                    text.style.color = foreground;
                    _author.style.color = foreground;
                    text.style.background = background;
                    _author.style.background = background;
                    data.style.border = `2px solid ${foreground}`;
                    data.style.transition = 'color 0.2s ease-in-out, background 0.2s ease-in-out, border 0.2s ease-in-out';
                    text.style.transition = 'color 0.2s ease-in-out, background 0.2s ease-in-out';
                    _author.style.transition = 'color 0.2s ease-in-out, background 0.2s ease-in-out';
                });
            }
        }

        document.querySelector('main').appendChild(elm);
        if (playsound && !iOS()) {
            if (sent) {
                let audio = new Audio('/assets/sent.mp3');
                audio.volume = 0.5;
                audio.play();
            } else {
                let audio = new Audio('/assets/received.mp3');
                audio.volume = 0.5;
                audio.play();
            }
        }
        scroll();
        return elm;
    }
    scroll();
});

const pack = ((input) => {
    /**
     * Data format:
     * Setting author:
     * * AUTHOR
     * Sent by the user:
     * . TEXT
     * Sent to the user:
     * , TEXT
     */
    let data = [];
    let disable = false;
    let i = 0;

    if (input === '') {
        message(true, 'That pack probably doesn\'t exist.');
        return;
    }

    for (let line of input.split('\n')) {
        let operator = line[0];
        let text = line.slice(1);
        if(text.startsWith(' ')) text = text.slice(1);

        switch (operator) {
            case '*':
                data.push(['author', text, '']);
                break;
            case '.':
                data.push([true, text]);
                break;
            case ',':
                data.push([false, text]);
                break;
            case '!':
                data.push(['notice', text]);
                break;
        }
    }

    let next = ((bypass = false) => {
        if (!disable) {
            if (data[i]) {
                disable = true;
                setTimeout(() => disable = false, 500);
                const item = data[i];
                if (typeof item === 'string') author = item;
                else message(...item);
                i++;
                return next;
            } else {
                message('notice', end_text);
                disable = true;
            }
        }
    });

    document.querySelector('main').onclick = next;
    document.body.onkeyup = next;

    return next;
});

const load = (() => {
    let name = location.search.split('pack=')[1];
    if (name.indexOf('&') > -1) name = name.split('&')[0];
    let title = location.search.split('title=')[1];
    if (title.indexOf('&') > -1) title = title.split('&')[0];
    let language = location.search.split('language=')[1];
    if (language.indexOf('&') > -1) language = language.split('&')[0];
    if (language === 'persian') {
        end_text = 'پایان';
        document.querySelector('footer').innerHTML = `برای ادامه هر جایی کلیک کنید...
<a href="/">بازگشت به صفحه اصلی</a>`;
        document.body.innerHTML += `<style>* { text-align: right; direction: rtl; }</style>`;
    } else if (language === 'english' || !language) {
        document.body.innerHTML += `<style>* { text-align: left; direction: ltr; }</style>`;
    }
    fetch(name).then(e => {
        if (e.status === 200) {
            message('notice', `<span style="color: red;">${decodeURI(title) + '<br><br>'}</span>`);
            e.text().then(data => pack(data));
        } else {
            message(false, 'That pack probably doesn\'t exist.', 'houston');
            setTimeout(() => {
                message(false, 'Press the "back to main menu" button on the bottom of the page to go back.', 'houston');
                setTimeout(() => {
                    message('notice', end_text);
                }, 1000);
            }, 1000);
        }
    });
});