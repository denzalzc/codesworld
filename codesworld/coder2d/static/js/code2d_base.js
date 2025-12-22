pr = console.log



document.addEventListener('DOMContentLoaded', () => {

    const encode_tag = document.getElementById('encode_tag').innerHTML

    const form = document.querySelector('.content-form');
    const textInput = document.getElementById('text-input');
    const resultImage = document.getElementById('result-image');
    const resultInfo = document.getElementById('result-info')


    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitter = e.submitter;
        if (submitter && submitter.classList.contains('encode-btn')) {
            const text = textInput.value;

            fetch(`/2D/api/${encode_tag}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify({
                        text,
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        resultImage.src = `${data.format},${data.image}`;

                        resultImage.addEventListener('click', (e) => {
                            window.open(`${resultImage.src}`).focus()
                        })

                        resultInfo.innerHTML = `<span>Вес файла ${data['file_size']} килобайт</span`
                    } else {
                        console.error('Error:', data.error);
                    }
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