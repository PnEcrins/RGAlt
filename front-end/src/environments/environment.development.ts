export const environment = {
  baseMaps: {
    zoom: 7,
    center: [45.5, 6.5],
    zoomTo: 19,
    mainMap: {
      url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      attribution: '<a target="_blank" href="https://ign.fr/">IGN</a>',
    },
    satellitMap: {
      url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      attribution: '<a target="_blank" href="https://ign.fr/">IGN</a>',
    },
  },
};
