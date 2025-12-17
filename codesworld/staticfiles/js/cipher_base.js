pr = console.log


document.addEventListener('DOMContentLoaded', () => {

    const encode_tag = document.getElementById('encode_tag').innerHTML
    const decode_tag = document.getElementById('decode_tag').innerHTML

    const form = document.querySelector('.content-form');
    const textInput = document.getElementById('text-input');
    const keyInput = document.getElementById('key-input');
    const textOutput = document.getElementById('text-output');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitter = e.submitter;
        if (submitter && submitter.classList.contains('encode-btn')) {
            const text = textInput.value;
            const key = keyInput.value;

            fetch(`/ciphers/api/${encode_tag}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify({
                        text,
                        key
                    }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(({
                    result
                }) => {
                    textOutput.value = result;
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Произошла ошибка при кодировании.');
                });
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitter = e.submitter;
        if (submitter && submitter.classList.contains('decode-btn')) {
            const text = textInput.value;
            const key = keyInput.value;

            fetch(`/ciphers/api/${decode_tag}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify({
                        text,
                        key
                    }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(({
                    result
                }) => {
                    textOutput.value = result;
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Произошла ошибка при кодировании.');
                });
        }
    });
});

const getCookie = (name) => {
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const cookie of cookies) {
        const cookieTrimmed = cookie.trim();
        if (cookieTrimmed.startsWith(`${name}=`)) {
            return decodeURIComponent(cookieTrimmed.substring(name.length + 1));
        }
    }
    return null;
};