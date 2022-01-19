# slock
discord/spigot integration for session-based smp(s)

### Use
slock updates the server's whitelist to effectively "lock" the server during off hours. It enables voting through discord to start sessions of a predetermined length.

You should create your normal whitelist as one usually does, and then move it to `/whitelists` as `open.json`. You then need to make a blank json file (`{}`), and place that into `/whitelists` as `close.json`, and your server's directory as `whitelist.json`.


### Config

you need to enable; `rcon`, `enforce_whitelist`, and `whitelist` in your server.properties

Provided are example config files.

*All config files are stored under the root dir of this project in `cfg/`.*

config.json:
```
{
  "token": "abc",
  "path": "server_path/",
  "expire": <timeout in milliseconds>,
  "met_message": "Threshold Met, Starting Session",
  "threshold": 0.5 <precentage; e.g. 0.8 for 80%>,
  "session_time": <hour # of each session>
}
```

active.json:
```
{
  "last":0,
  "list":{
    <discord_id>:0
  }
}
```

server.json:
```
{
  "host": "url",
  "port": 1234,
  "pwd": "supersecurepassword"
}
```

### Dependencies
[rcon](https://www.npmjs.com/package/rcon)
[node-cron](https://www.npmjs.com/package/node-cron)
