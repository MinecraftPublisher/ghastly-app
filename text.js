let ath = '';
let end_text = 'The end';
let playsound = false;
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
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }

/**
 * Writes a message to the screen and returns the dom element of that message.
 * @param {string} sent Wether to send or no. Could be true, false, notice or author.
 * @param {string} input The text.
 * @param {string} author The author for received messages.
 * @returns {HTMLElement} The dom element of the message.
 */
const message = globalThis.message = ((sent, input, author = ath, time = true) => {
    const scroll = (() => document.querySelector('main').scroll({ top: document.querySelector('main').scrollHeight, behavior: "smooth" }));

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
            message(false, 'That pack probably doesn\'t exist.', 'minecraftpublisher');
            setTimeout(() => {
                message(false, 'Press the "back to main menu" button on the bottom of the page to go back.', 'minecraftpublisher');
                setTimeout(() => {
                    message('notice', end_text);
                }, 1000);
            }, 1000);
        }
    });
});