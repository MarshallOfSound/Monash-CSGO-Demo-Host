import demofile from 'demofile';
import fs from 'fs';
import md5 from 'md5';
import os from 'os';
import path from 'path';

import Map from './Map';

const safeUser = (player) => ({
  id: player.userId,
  name: player.name,
  health: player.health,
});

class Demo {
  constructor(filePath) {
    this.valid = this._parseFileName(filePath);
    if (fs.existsSync(path.resolve(os.tmpdir(), 'monashcsgo', `${this.id}.json`))) {
      const _saved = JSON.parse(fs.readFileSync(path.resolve(os.tmpdir(), 'monashcsgo', `${this.id}.json`), 'utf8'));
      this.valid = _saved.valid;
      this.rounds = _saved.rounds;
      this.teams = _saved.teams;
      this.deaths = _saved.deaths;
      this._parseFileName(filePath);
      console.info(`Restoring cached demo: ${this.id}`);
      return;
    }
    if (!this.valid) {
      return;
    }

    this.rounds = [];
    this.teams = {};
    this.deaths = [];
    let rI = 0;
    let mI = 0;

    console.log(`Parsing uncached demo: ${this.id} - ${this.fileName}`);
    const data = fs.readFileSync(filePath);
    const demo = new demofile.DemoFile();

    demo.on('start', () => {
      this.map = new Map(demo.header.mapName);
    });

    demo.gameEvents.on('player_death', e => {
      const victim = demo.entities.getByUserId(e.userid);
      const attacker = demo.entities.getByUserId(e.attacker);
      if (victim && attacker) {
        this.deaths.push({
          victim: safeUser(victim),
          attacker: safeUser(attacker),
          weapon: e.weapon,
          round: rI,
        });
      }
    });

    let ignoreKnifeR = true;
    let ignoreKnifeM = true;
    demo.gameEvents.on('round_end', (event) => {
      if (ignoreKnifeR) return (ignoreKnifeR = false);
      if (!this.rounds[rI]) this.rounds[rI] = { number: rI + 1 };
      this.rounds[rI].winner = event.winner;
      rI++;
    });
    demo.gameEvents.on('round_mvp', (event) => {
      if (ignoreKnifeM) return (ignoreKnifeM = false);
      if (!this.rounds[mI]) this.rounds[mI] = { number: mI + 1 };

      this.rounds[mI].mvp = {
        name: demo.entities.getByUserId(event.userid).name,
        id: event.userid,
      };
      mI++;
    });

    const getPlayerTeam = (player) => demo.entities.teams.find(team => team.members.some(member => member.userId === player.userId));

    demo.on('end', () => {
      demo.entities.players.forEach((player) => {
        if (player.isFakePlayer || player.isHltv) return;
        const playerTeam = getPlayerTeam(player);
        const teamName = playerTeam.clanName || `Unknown Team ${playerTeam.teamNumber}`;
        this.teams[teamName] = this.teams[teamName] || {
          players: [],
          id: playerTeam.teamNumber,
          score: playerTeam.score,
        };
        this.teams[teamName].players.push({
          name: player.name,
          id: player.userId,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
        });
      });

      Object.keys(this.teams).forEach((teamName) => {
        if (this.teams[teamName].players.length <= 2) {
          delete this.teams[teamName];
        }
      });

      this.rounds.forEach((round) => {
        const target = Object.keys(this.teams).find(
          (teamName) => this.teams[teamName].id === round.winner
        );
        if (!target) {
          this.valid = false;
          return;
        }
      });

      if (!fs.existsSync(path.resolve(os.tmpdir(), 'monashcsgo'))) {
        fs.mkdirSync(path.resolve(os.tmpdir(), 'monashcsgo'));
      }

      fs.writeFileSync(
        path.resolve(os.tmpdir(), 'monashcsgo', `${this.id}.json`),
        JSON.stringify(Object.assign({}, this))
      );

      console.info('Demo parsed successfully:', this.id);
    });

    try {
      demo.parse(data);
    } catch (e) {
      console.error('Failed to parse Demo', e);
      this.valid = false;
      return;
    }
  }

  _parseFileName(filePath) {
    const metadata = require('../../../demos/metadata.json'); // eslint-disable-line global-require

    this.fileName = path.basename(filePath);
    this.id = md5(this.fileName + fs.readFileSync(__filename, 'utf8'));
    const pattern = (/^([0-9]+)-([0-9]+)-([0-9]+)-([0-9]+)-[0-9]+[a-z]+-([a-z_0-9]+)-([a-zA-Z0-9 ]*)-vs-([a-zA-Z0-9 ]*)\.dem/g).exec(this.fileName);
    if (!pattern) {
      return false;
    }
    this.time = {
      year: parseInt(pattern[1], 10),
      month: parseInt(pattern[2], 10),
      day: parseInt(pattern[3], 10),
      hour: parseInt(pattern[4].slice(0, 2), 10),
      minutes: parseInt(pattern[4].slice(2), 10),
    };
    this.map = new Map(pattern[5]);
    this.CT_teamName = pattern[6];
    this.T_teamName = pattern[7];
    this.time.timestamp = (new Date(this.time.year, this.time.month, this.time.day, this.time.hour, this.time.minutes)).getTime();
    this.download_url = `http${process.env.USERNAME === 'Samuel' ? '' : 's'}://${process.env.USERNAME === 'Samuel' ? 'localhost:3030' : 'monashcsgo.samuel.ninja'}/rest/demos/${this.id}/download`;

    const fName = path.parse(this.fileName).name;
    if (metadata[fName]) {
      const meta = metadata[fName];
      if (meta.t_name) this.T_teamName = meta.t_name;
      if (meta.ct_name) this.CT_teamName = meta.ct_name;
      this.division = meta.division || 1;
      this.round = meta.round || 1;
    }
    return true;
  }
}

module.exports = Demo;
