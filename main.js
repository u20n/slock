const { Client, MessageEmbed } = require('discord.js');
const fs = require('fs');
const Rcon = require('rcon');
const cron = require('node-cron')

/** pull json */
function pull(t) {
  const s = fs.readFileSync(t, {encoding:"utf8", flag:"r"});
  try {
    const c = JSON.parse(s);
    return c;
  } catch (re) {
    console.log("read err: "+re);
    return -1; // need to make error method
  }
}

/** push json */
function push(c, t) {
  const j = JSON.stringify(c);
  fs.writeFileSync(t, j);
}

/** reset vote */
function _wipe(l) {
  for (var i in l) {
    l[i] = 0;
  }
}

/** copy file */
function _copy(o, d) {
  fs.copyFile(o, d, (e)=>{
    if (e) throw err;
  });
}

/** reload whitelist */
function reload() {
  var c = pull("cfg/server.json");
  conn = new Rcon(c["host"], c["port"], c["pwd"], {tcp: true, challenge: false});
  conn.on('auth', ()=>{
    conn.send('whitelist reload');
  });
  conn.connect();
}

/** toggle open */
function toggle(status) {
  var l = pull("cfg/config.json")["path"];
  if (status) {
    /** rename on-whitelist */
    _copy("./whitelists/open.json", l+"whitelist.json");
    /** schedule off */

  } else {
    /** rename off-whitelist */
    _copy("./whitelists/close.json", l+"whitelist.json");
  }
  /** reload on server */
  reload();
}

function vote(m) {
  const d = pull("cfg/active.json");
  const c = pull("cfg/config.json");

  var l = d["list"];
  const a = m.author;
  const n = new Date().getTime();


  if (l[a.id] != 0) {return;} // also catches non-registered people
  if ((n - d["last"]) < d["expire"]) {
    console.log("continued vote");
  } else {
    console.log("new vote");
    _wipe(l);
  }
  d["last"] = n;
  l[a.id] = 1;

  e = 0;
  for (var i in l) {
    e += i;
  }

  if (Math.floor(Object.values(l).length*c["threshold"]) <= e) {
    m.reply(c["met_message"]);
    _wipe(l);
    /** start */
    toggle(true);
  } else {
    m.reply("("+e+"/"+c["threshold"]+")");
  }
  push(d, "cfg/active.json");
}

function list(m) {
  const d = pull("cfg/active.json");
  var e = new MessageEmbed();
  for (var u in d["list"]) {
    client.users.fetch(u).then((c)=>{
      var s;
      if (d["list"][u] < 1) {
        s = "no";
      } else {s = "yes"};
      e.addField(c.username, "voted: "+s, true);
    }).then(()=> {
        if (e.fields.length == Object.keys(d["list"]).length) {
          m.reply({embeds: [e]});
        }
    });
  }
  var last = new Date(d["last"]).toLocaleString();
  e.setDescription("last vote: "+last.split(", ")[1]);
  e.setTimestamp();
  e.setFooter({text: 'funded by blackpaw industries'});
}

function petition(m) {
  m.reply("request **not** received");
}

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

client.on('ready', ()=>{
  console.log('online');
});

client.on('messageCreate', (m)=>{
  const c = m.content;
  if (c.charAt(0) == "+" && (!m.author.bot)) {
    switch(c.charAt(1)) {
      case "s":
        vote(m);
        break;
      case "w":
        list(m);
        break;
      case "r":
        petition(m);
        break;
    }
  }
})

/** pull token */
function token() {
  /** pull config */
  const t = pull("cfg/config.json")["token"];
  return t;
};

client.login(token());
