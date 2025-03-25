function generateRandomString() {
    localStorage.clear();

    let randomString = '';
    const randomNumber = Math.floor(Math.random() * 10);

    for (let i = 0; i < 20 + randomNumber; i++) {
        randomString += String.fromCharCode(33 + Math.floor(Math.random() * 94));
    }

    return randomString;
}
window.onclose = () => {
    localStorage.clear();
}
window.onload = () => {


    const fragment = new URLSearchParams(window.location.hash.slice(1));

    const [accessToken, tokenType, state] = [fragment.get('access_token'), fragment.get('token_type'), fragment.get('state')];

    if (!accessToken) {
        console.log(fragment.keys())
        const randomString = generateRandomString();
        localStorage.setItem('oauth-state', randomString);

        document.getElementById('login').href += `&state=${encodeURIComponent(btoa(randomString))}`;
        document.getElementById('info').innerText += `Not Logged in.`;
        return document.getElementById('login').style.display = 'block';
    }

    /* Does the same thing as in the index.js file. */
    fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${tokenType} ${accessToken}`,
        },
    })
        .then(result => result.json())
        .then(response => {
            const { username, banner_color } = response;
            const avatar_url = `https://cdn.discordapp.com/avatars/${response.id}/${response.avatar}.png?size=256`
            const imgHTML = `<br><img src=${avatar_url} id="coolImg" alt="Discord Avatar">`
            document.getElementById('info').innerHTML += `<h1>${username}</h1>`;
            document.getElementById('info').style.backgroundColor = banner_color;
            document.getElementById('info').innerHTML += imgHTML;
            document.getElementById('Q2').parentElement.removeChild(document.getElementById('Q2'));

            console.log(response);
        })
        .catch(console.error);
}