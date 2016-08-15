import fs from 'fs';
import jsgo from 'jsgo';
import md5 from 'md5';
import os from 'os';
import path from 'path';

import Map from './Map';

class Demo {
  constructor(filePath) {
    this.valid = this._parseFileName(filePath);
    if (fs.existsSync(path.resolve(os.tmpdir(), 'monashcsgo', `${this.id}.json`))) {
      const _saved = JSON.parse(fs.readFileSync(path.resolve(os.tmpdir(), 'monashcsgo', `${this.id}.json`), 'utf8'));
      this.valid = _saved.valid;
      this.rounds = _saved.rounds;
      this.teams = _saved.teams;
      this._parseFileName(filePath);
      console.info(`Restoring cached demo: ${this.id}`);
      return;
    }
    if (!this.valid) {
      return;
    }

    this.rounds = [];
    this.teams = {};
    let rI = 0;
    let mI = 0;

    console.log(`Parsing uncached demo: ${this.id} - ${this.fileName}`);
    const data = fs.readFileSync(filePath);
    const demo = new jsgo.Demo();

    demo.on('game.round_end', (event) => {
      if (!this.rounds[rI]) this.rounds[rI] = {};
      this.rounds[rI].winner = event.winner;
      rI++;
    });
    demo.on('game.round_mvp', (event) => {
      if (!this.rounds[mI]) this.rounds[mI] = {};
      this.rounds[mI].mvp = {
        name: event.player.getName(),
        id: event.player.getUserId(),
      };
      mI++;
    });
    try {
      demo.parse(data);
    } catch (e) {
      console.error('Failed to parse Demo', e);
      this.valid = false;
      return;
    }

    demo.getPlayers().forEach((player) => {
      if (player.isFakePlayer()) return;
      const playerTeam = player.getTeam(demo);
      const teamName = playerTeam.getClanName() || `Unknown Team ${playerTeam.getTeamNumber()}`;
      this.teams[teamName] = this.teams[teamName] || {
        players: [],
        id: playerTeam.getTeamNumber(),
        score: 0,
      };
      this.teams[teamName].players.push({
        name: player.getName(),
        id: player.getUserId(),
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
      this.teams[target].score++;
    });
    if (!fs.existsSync(path.resolve(os.tmpdir(), 'monashcsgo'))) {
      fs.mkdirSync(path.resolve(os.tmpdir(), 'monashcsgo'));
    }
    fs.writeFileSync(
      path.resolve(os.tmpdir(), 'monashcsgo', `${this.id}.json`),
      JSON.stringify(Object.assign({}, this))
    );
  }

  _parseFileName(filePath) {
    this.fileName = path.basename(filePath);
    this.id = md5(this.fileName);
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
    this.download_url = `https://monashcsgo.samuel.ninja/rest/demo/${this.id}/download`;
    return true;
  }
}

module.exports = Demo;
