const axios = require('axios');
const { Client, Intents } = require('discord.js');
const { token, igns, apikey } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

var users = [];

for (ign of igns) {
    axios.get(`https://api.mojang.com/users/profiles/minecraft/${ign}`)
        .then(res => {
            let currentuser = {
                "name": res.data.name,
                "uuid": res.data.id,
                "lastonline": "n/a",
                "online": false
            };

            users.push(currentuser);
        });
}

function update() {
    console.log('update')
    var usersref = users
    for (user of users) {
        axios.get(`https://api.hypixel.net/status?uuid=${user.uuid}`, {
            headers: {
                'API-Key': apikey
            }
        })
            .then(res => {
                user.online = res.data.session.online;
                console.log(user)
            });
    }

    var refresh = false;
    users.forEach((user, index) => {
        // console.log("prev" + usersref[index].online);
        // console.log("now" + user.online);
        if (user.online != usersref[index].online) {
            console.log('needrefresh')
            refresh = true;
        }
    });

    if (refresh) {
        var embed = {
            title: 'Hypixel Tracking',
            description: ''
        };

        for (user of users) {
            if (user.online == true) {
                embed.description += `\n<:green_circle:936683622688243752> ${user.name} - *online*`;
            } else {
                continue;
            }
        }

        for (user of users) {
            if (user.online == false) {
                embed.description += `\n<:red_circle:936684130895282176> ${user.name} - *offline*`;
            } else {
                continue;
            }
        }

        client.channels.cache.get('936524453582618644').send({ embeds: [embed] });
    }
}

client.once('ready', () => {
	console.log('Ready!');
    var interval = setInterval(update, 10000);
});

client.login(token);