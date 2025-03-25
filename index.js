const { request } = require('undici');
const express = require('express');
const { clientId, clientSecret, port } = require('./config.json');
const { coloredConsoleLog } = require("./utilities/color-shell-text");
const Transform = require("stream").Transform
const fs = require("fs");
const { error } = require('console');
const app = express();

const redirect_uri = "https://discord.com/oauth2/authorize?client_id=1161388020700819496&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A53134&scope=email+identify"
const evil_redirect_uri = "https://discord.com/oauth2/authorize?client_id=1161388020700819496&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A53134%2Fevil&scope=identify+email"
try {
    // app.get('/', async ({ query }, response) => {
    //     response.redirect('/login');
    //     // response.sendFile('./test.html', { root: '.' });
    // });


    app.get("/", (req, res) => {
        /* Replace HTML content */
        const replacementTransform = new Transform()
        replacementTransform._transform = function (data, encoding, done) {
            const str = data.toString().replace('#LINK HERE#', redirect_uri).replace('#LINK HERE#', redirect_uri).replace('#EVIL HERE#', evil_redirect_uri)
            this.push(str)
            done()
        }

        res.write('<!-- Begin stream -->\n');
        let stream = fs.createReadStream('./Pages/login.html')
        stream.pipe(replacementTransform)
            .on('end', () => {
                res.write('\n<!-- End stream -->')
            }).pipe(res)
    })

    app.get('/', async ({ query }, response) => {
        /* Essentially the grant. */
        const { code } = query;
        if (code) {
            try {
                const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
                    method: 'POST',
                    body: new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        code,
                        grant_type: 'authorization_code',
                        redirect_uri: `http://localhost:${port}`,
                        /* What kind of stuff do we want? This part is not actually important. */
                        scope: 'identify',
                        // scope: ["identify", "email"],
                        secret: "secret"
                    }).toString(),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                /* We got the token! Proceed with getting data... */
                const oauthData = await tokenResponseData.body.json();

                /* Does the same thing as in the mainPage.js file. */
                const userResult = await request('https://discord.com/api/users/@me', {
                    headers: {
                        authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                    },
                });

                console.log(await userResult.body.json());
            } catch (error) {
                // NOTE: An unauthorized token will not throw an error
                // tokenResponseData.statusCode will be 401
                console.error(error);
            }
        }
        response.sendFile('./Pages/login.html', { root: '.' });
    });
    /* Login successful! */
    app.get('/evil', async ({ query }, response) => {
        response.sendFile('./Pages/evil.html', { root: '.' });
    });


    /* Utilities below */

    app.use('/mystyle', (req, response) => {
        response.sendFile('./Styles/mystyle.css', { root: '.' });
    });
    app.use('/mystyleEvil', (req, response) => {
        response.sendFile('./Styles/mystyleEvil.css', { root: '.' });
    });
    app.use('/duggy_icon', (req, response) => {
        response.sendFile('./duggy_icon.png', { root: '.' });
    });
    app.use('/mainPage', (req, response) => {
        response.sendFile('./Code/login.js', { root: '.' });
    });
    app.use('/evilPage', (req, response) => {
        response.sendFile('./Code/evil.js', { root: '.' });
    });
    // app.use('/homeCode', (req, response) => {
    //     response.sendFile('./Code/home.js', { root: '.' });
    // });

    app.listen(port, () =>
        coloredConsoleLog(`colorGreenWeb Server Success!\n|colorReset App listening at http://localhost:${port}\n`)
    );
} catch (error) {
    console.error(error);
    coloredConsoleLog(`colorRedWeb Server Error!\n|colorReset App is not running.\n`)
}