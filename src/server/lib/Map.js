const mapCodeLinks = {
  de_dust2: {
    name: 'Dust',
    image: 'https://vignette1.wikia.nocookie.net/cswikia/images/6/6f/Csgo-de-dust2.png',
  },
  de_mirage: {
    name: 'Mirage',
    image: 'https://vignette3.wikia.nocookie.net/cswikia/images/a/a8/Csgo-de-mirage.png',
  },
  de_inferno: {
    name: 'Inferno',
    image: 'https://vignette3.wikia.nocookie.net/cswikia/images/0/0f/Csgo-de-inferno.png',
  },
  de_cbble: {
    name: 'Cobblestone',
    image: 'https://vignette3.wikia.nocookie.net/cswikia/images/e/ed/Csgo-de-cbble.png',
  },
  de_cache: {
    name: 'Cache',
    image: 'https://vignette2.wikia.nocookie.net/cswikia/images/4/4e/Csgo-de-cache.png',
  },
  de_nuke: {
    name: 'Nuke',
    image: 'https://vignette3.wikia.nocookie.net/cswikia/images/e/e5/Csgo-nuke-2016feb17.png',
  },
  de_overpass: {
    name: 'Overpass',
    image: 'https://vignette3.wikia.nocookie.net/cswikia/images/6/6e/Csgo-de-overpass.png',
  },
  de_dust: {
    name: 'Dust',
    image: 'https://vignette1.wikia.nocookie.net/cswikia/images/6/6d/Csgo-de-dust.png',
  },
  de_train: {
    name: 'Train',
    image: 'https://vignette1.wikia.nocookie.net/cswikia/images/4/4a/De_train_thumbnail.png',
  },
};

class Map {
  constructor(mapCodeName) {
    const mapObject = mapCodeLinks[mapCodeName] || {};
    this.image = mapObject.image;
    this.name = mapObject.name;
    this.code = mapCodeName;
  }
}

module.exports = Map;
