import center from "@turf/center";
import circle from "@turf/circle";
import * as d3 from "d3";
import * as d3proj from "d3-geo-projection";
import SphericalMercator from "@mapbox/sphericalmercator";

export const projections = (mapData, width, height) => {
const mapCentroid = center(mapData);
let extent;
if (mapData.geometry && mapData.geometry.type == "Point") {
  extent = circle(mapCentroid, .2, {units: "miles"})
  extent.geometry.coordinates = [extent.geometry.coordinates[0].slice().reverse()]
}else if (mapData.geometry && mapData.geometry.type == "Polygon"){
  extent = mapData; 
  extent.geometry.coordinates = [extent.geometry.coordinates[0].slice().reverse()]
} else {
  extent = mapData;
}
const projections =  [  
  {"orthographic" : d3.geoOrthographic().center(mapCentroid.geometry.coordinates).translate([width/4,height/4]) .rotate([-mapCentroid.geometry.coordinates[0], -mapCentroid.geometry.coordinates[1]]).clipExtent([[0, 0],[width,height]]).fitExtent([[width * .05, height * .05],[width-(width * .05), height-(height * .05)]],extent)},

  {"azimuthalEqualArea":  d3.geoAzimuthalEqualArea().center(mapCentroid.geometry.coordinates).translate([width / 4, height / 4]).rotate([-mapCentroid.geometry.coordinates[0], -mapCentroid.geometry.coordinates[1]]).clipExtent([[0, 0],[width, height]]).fitExtent([[width * .05, height * .05],[width - (width * .05), height - (height * .05)]],extent)},

  {"azimuthalEquidistant": d3.geoAzimuthalEquidistant().center(mapCentroid.geometry.coordinates).translate([width / 4, height / 4]).rotate([-mapCentroid.geometry.coordinates[0], -mapCentroid.geometry.coordinates[1]]).clipExtent([[0, 0],[width, height]]).fitExtent([[width * .05, height * .05],[width - (width * .05), height - (height * .05)]],extent)},

  {"conicEqualArea": d3.geoConicEqualArea().center(mapCentroid.geometry.coordinates).translate([width / 4, height / 4]).rotate([-mapCentroid.geometry.coordinates[0], -mapCentroid.geometry.coordinates[1]]).clipExtent([[0, 0],[width, height]]).fitExtent([[width * .05, height * .05],[width - (width * .05), height - (height * .05)]],extent)},

  {"conicEquidistant": d3.geoConicEquidistant().center(mapCentroid.geometry.coordinates).translate([width / 4, height / 4]).rotate([-mapCentroid.geometry.coordinates[0], -mapCentroid.geometry.coordinates[1]]).clipExtent([[0, 0],[width, height]]).fitExtent([[width * .05, height * .05],[width - (width * .05), height - (height * .05)]],extent)},

  {"BakerDinomic": d3proj.geoBaker().center(mapCentroid.geometry.coordinates).translate([width / 4, height / 4]).rotate([-mapCentroid.geometry.coordinates[0], -mapCentroid.geometry.coordinates[1]]).clipExtent([[0, 0],[width, height]]).fitExtent([[width * .05, height * .05],[width - (width * .05), height - (height * .05)]],extent)},

  {"BerghausStar": d3proj.geoBerghaus().center(mapCentroid.geometry.coordinates).translate([width / 4, height / 4]).rotate([-mapCentroid.geometry.coordinates[0], -mapCentroid.geometry.coordinates[1]]).clipExtent([[0, 0],[width, height]]).fitExtent([[width * .05, height * .05],[width - (width * .05), height - (height * .05)]],extent)},

  {"Mollweide": d3proj.geoMollweide().center(mapCentroid.geometry.coordinates).translate([width / 4, height / 4]).rotate([-mapCentroid.geometry.coordinates[0], -mapCentroid.geometry.coordinates[1]]).clipExtent([[0, 0],[width, height]]).fitExtent([[width * .05, height * .05],[width - (width * .05), height - (height * .05)]],extent)}
  // "equirectangular": d3.geoEquirectangular().translate([0, 0]).center(mapCentroid.geometry.coordinates).fitExtent([[width * .05, height * .05],[width - (width * .05), height - (height * .05)]],mapData)
]

return projections;

}

export const getTiles = (projection, width, height) => {
  const tiles = [];
  let z;
  let zoom = (0 | Math.log(projection.scale()) / Math.LN2) - 5
  if (zoom > 18) {
    z = 18
  } else {
    z = zoom
  }
  // this is suboptimal
  let upperbound;
  let lowerbound;
  if (z < 5) {
    upperbound = [-180, 90]
    lowerbound = [180, -180]
  } else {
    upperbound = projection.invert([0, 0])
    lowerbound = projection.invert([width, height])
  }
  const merc = new SphericalMercator({
    size: 256
  })
  const xyz = merc.xyz([upperbound[0], upperbound[1], lowerbound[0], lowerbound[1]], z)
  const rows = d3.range(xyz.minX, xyz.maxX + 1)
  const cols = d3.range(xyz.minY, xyz.maxY + 1)

  cols.forEach(function(c) {
    rows.forEach(function(r) {
      tiles.push({
        x: r,
        y: c,
        z: z
      })
    })
  })

  return tiles;
}
export const tilePromise = t => {
  const mapTiles = Promise.all(t.map(async d => {
    d.data = await d3.json(`https://tile.nextzen.org/tilezen/vector/v1/256/all/${d.z}/${d.x}/${d.y}.json?api_key=ztkh_UPOQRyakWKMjH_Bzg`);
    return d;
  }))
  return mapTiles
}

export const getClass = d => {
  let kind = d.properties.kind || '';
  if (d.properties.boundary)
    kind += 'boundary';
  return `${kind.replace('_','')}`;
}

export const sortTileData = (ti, rawdata) => {
  const tiles = ti.map(tile => {
    const mapTile = zenArray(tile).map(d => ({
      class: d.class,
      group: d.group,
      data: d
    }))
    rawdata.push(mapTile)
   let flat =  mapTile.flat().sort((a, b) => (
      a.data.properties.sort_rank ?
      a.data.properties.sort_rank - b.data.properties.sort_rank :
      0
    ));
    return flat;
  })
  // this.setState({maptiles: tiles.flat()})

  return tiles.flat().sort((a, b) => (
    a.data.properties.sort_rank ?
    a.data.properties.sort_rank - b.data.properties.sort_rank :
    0));

}
export const zenArray = (t) => {
  let features = [];
  // console.log(t)
  let layers; 
  if (t.z <= 5){
    layers = ['earth', 'landuse', 'roads', 'buildings',];
  } else {
    layers = ['water', 'landuse', 'roads', 'buildings',];
  }
  layers.forEach(function(layer) {
    if (t.data[layer]) {
      for (let i in t.data[layer].features) {
        // Don't include any label placement points
        if (t.data[layer].features[i].properties.label_placement) { continue }

         t.data[layer].features[i].group=layer
         t.data[layer].features[i].class=getClass(t.data[layer].features[i])

        features.push(t.data[layer].features[i]);
      }
    }
  });
  return features.sort((a, b) => (
    a.properties.sort_rank ?
    a.properties.sort_rank - b.properties.sort_rank :
    0
  ));
}
export const makeSVG = (svg, classes, width, height,path)=>{
  const styles = classes
  const groups = {}
  let copySVG = document.createElement('svg')

  copySVG.width=width
  copySVG.height=height

  styles.forEach(element => {
    let selected = Array.from(svg.querySelectorAll(`.${element.name}`)).filter(s => s.getAttribute('d') != null)
    if (typeof(selected[0]) != undefined && selected[0] != null){
        let sample = selected[0]
        let className = element.name
        let getStyle = getComputedStyle(sample)
        let groupName = selected[0].dataset.group
        if (groupName != undefined && className != undefined){
        selected.forEach(select =>{
          // console.log(selected[0].dataset.group)
          // console.log(select.dataset.group)
          if (!groups[groupName]){
            groups[groupName] = {};
          } 
          if (!groups[groupName][className]){

          groups[groupName][className] = []
          groups[groupName][className].push(`<path d=${select.getAttribute('d')} fill=${getStyle.fill.replace(/"/g,'')} stroke="${getStyle.stroke}"  stroke-width="${getStyle.strokeWidth}"></path>`)
        
        } else{
          groups[groupName][className].push(`<path d=${select.getAttribute('d')} fill="${getStyle.fill.replace(/"/g,'')}" stroke="${getStyle.stroke}"  stroke-width="${getStyle.strokeWidth}"></path>`)
        }
      })
        }
      
    }
      });

  Object.entries(groups).forEach(g =>{
    console.log(g[1])
    console.log(Object.entries(g[1]))
    copySVG.insertAdjacentHTML('afterbegin', 
    `<g id=${g[0]} inkscape:groupmode="layer" inkscape:label="${g[0]}">

    ${Object.entries(g[1]).map(c => `<g id = ${c[0]}> ${c[1].join(' ')} </g>`)}  
    </g>`)
  })
  let upload = svg.querySelector('.upload')
  let style = getComputedStyle(upload)
  if (typeof(upload) != undefined && upload != null){   
    let uploaded = `<g id ="uploaded" inkscape:groupmode="layer" inkscape:label="uploaded"><path d="${upload.getAttribute('d')}" fill ="${style.fill.replace(/"/g,'')}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"></path></g>` 
    copySVG.insertAdjacentHTML('beforeend', uploaded);
  }
  
  let globe = svg.querySelector('#sphere')
  if (globe){
    const sphere = `<g id ="globe" inkscape:groupmode="layer" inkscape:label="sphere"><path class = "sphere" d="${path({type: "Sphere"})}" fill = "${getComputedStyle(globe).fill.replace(/"/g,'')}" stroke="${getComputedStyle(globe).stroke}" stroke-width="${getComputedStyle(globe).strokeWidth}"/></g>` 
  copySVG.insertAdjacentHTML('afterbegin', sphere);
  }

  let defs= svg.querySelectorAll('defs')
  if (defs !=null){
    defs.forEach(d=>{
      copySVG.insertAdjacentHTML('afterbegin', d.outerHTML);
    }) 
  }
  

  return copySVG.innerHTML
}

export const remove = (svg, className) =>{
  let selected = svg.querySelectorAll(`.${className}`)
  if (selected !=null){
      let palette = document.querySelector(`#${className}Palette`)
      selected.forEach(s => { s.remove();})
      if (palette !=null){
        palette.remove();
      }

  }

 }