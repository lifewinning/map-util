<script>
import { onMount } from 'svelte';
import Palette from './Palette.svelte';
import * as d3 from 'd3';
import { projections, getTiles, sortTileData, tilePromise, makeSVG } from './utils'
export let data, height, width, proj;
let projection, path, tile, svg, z, reCenter, pathed;
let classes=[]


// to do: drag and zoom
// let m = { x: 0, y: 0};
let sphere = ({type: "Sphere"})

async function tiles() {
       return tilePromise(getTiles(projection, width, height)).then(t => sortTileData(t))
    }

let onMountProj

let getClasses = async () => {  
   let classSet = new Set();
    await tiles().then(t => t.map(ti => classSet.add(ti.class)))
    
    let arr = [...classSet].map(c => {
    let el = document.querySelector(`.${c}`)
    if (el){ 
      let style = getComputedStyle(el)
      let obj = ({
      name : c,
      group: el.dataset.group,
      fill: style.fill,
      stroke: style.stroke, 
      strokeWidth: style.strokeWidth
      })
    return obj; 
    }
  })

  if (document.querySelector('#sphere')) {
    let el = document.querySelector(`.ocean`)
    if (el){ 
      let style = getComputedStyle(el)
      let obj = ({
      name : 'ocean',
      group: 'water',
      fill: style.fill,
      stroke: style.stroke, 
      strokeWidth: style.strokeWidth
      })
    arr.push(obj)
    }
  }
  return arr;
}



onMount(async () => {
  projection = projections(data,width,height).map(p => Object.entries(p)).filter(m => m[0][0] == proj)[0][0][1]
  onMountProj = projection
  path = d3.geoPath().projection(projection);
  
  tile = tiles()

  d3.select(svg).call(d3.drag().on('drag', (event) => {
    const rotate = projection.rotate()
    const k = 75/projection.scale()
    projection.rotate([
      rotate[0] + event.dx * k,
      rotate[1] - event.dy * k
    ])
    path = d3.geoPath().projection(projection)
  }).on('end', () => { 
    console.log(projection.invert([width/2, height/2]))
    let thisZ =  getTiles(projection, width, height);
    if (!thisZ.some(r => z.includes(r))){
      tile = tiles()
    } else {
      console.log('doing nothing idk')
    }
    })
    )

  let zoomed = async (transform) => {
      projection.scale(transform.k)
      // console.log(transform.k, transform.x, transform.y)
      path = d3.geoPath().projection(projection)
  }
  
  let zoom = d3.zoom()
  .extent([[0, 0], [width, height]])
  .on("zoom", ({transform}) => zoomed(transform))
  .on("end", () => {
    console.log(projection.invert([width/2, height/2]))
    let newZ = getTiles(projection, width, height);
    if (z[0].z){
    // console.log(z[0].z)
    // console.log(newZ[0].z)
    if (svg.querySelector('#sphere') != null){
          if (newZ[0].z >= 5 ){
          svg.querySelector('#sphere').style.setProperty('display', 'none')
          } else {
          svg.querySelector('#sphere').style.setProperty('display', '')
          // }
          // z = getTiles(projection, width, height);
        }
     } else {
      if (newZ[0].z < 5 ){
        d3.select('#globe').append('path').attr("class","ocean").attr('id','sphere').attr('d', path(sphere))
      }
     }
      if (newZ[0].z != z[0].z){
        tile = tiles()
        classes = getClasses()
    }
  
  }})
  
 
  d3.select(svg).call(zoom.transform, d3.zoomIdentity.translate(width/2, height/2).scale(onMountProj.scale())).call(zoom)
  
})  


const download = (svgFile) => {
      const svgText = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">${svgFile}</svg>`;
      const blob = new Blob([svgText], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'map.svg')
      link.click()
    }


$: {
  projection = projections(data,width,height).map(p => Object.entries(p)).filter(m => m[0][0] == proj)[0][0][1]
  path = d3.geoPath().projection(projection)
  z = getTiles(projection, width, height);
  tile = tiles()
  classes = getClasses()
 
  // console.log(classes.length)
  // console.log(projection.invert([m.x,m.y]))
  // for svg tag => on:mousemove="{e => m = { x: e.clientX, y: e.clientY }}"
}

</script>

<style>
    div { margin: 2px; }
    svg { border: 1px dotted;}
#basemap{
  stroke-width: none;
  fill:none;
}
.upload {
  fill: var(--upload-fill, none);
  stroke: var(--upload-stroke, chartreuse);
  stroke-width: 4px;
}
.building{
  fill:rgb(165, 139, 139);}

.water,.ocean, .riverbank  {
  fill: var(--water-fill, gray);
}
.oceanboundary, .riverbankboundary, .waterboundary{
  fill: none;
  stroke: gray;
  stroke-width: 0.5px;
}

.river, .stream, .canal {
  fill: none;
  stroke: gray;
  stroke-width: 1.5px;
}
.earth, .urbanarea {
  fill: var(--earth-fill, white);
  stroke: var(--earth-stroke, none);
}
.park,.naturereserve,.wood, .protectedarea, .forest, .wetland, .golfcourse, .grasslands, .grassland {
  fill: #88D18A;
  stroke: #88D18A;
  stroke-width: 0.5px;
}

.majorroad {
  stroke: rgb(57, 57, 57);
  stroke-width: 1px;
  fill:none;
}

.minorroad, .path {
  stroke: #999;
  stroke-width: 0.5px;
  fill:none;
}

.highway {
  stroke: black;
  stroke-width: 1.5px;
  fill:none;
}

.pier {
  fill: #fff;
  stroke: #fff;
  stroke-width: 0.5px;
}

.aeroway, .aerodrome {
  fill: pink;
  fill-opacity: 0.2;
}

.military{
    fill: rgb(25, 80, 80);
  fill-opacity: 0.5;
}

.rail, .ferry {
  stroke: #ebc1fc;
  stroke-width: 0.5px;
  fill:none;
}
.cemetery{
  fill: #ccc;
}
.hospital, .university, .recreationground{
  fill: papayawhip;
}
</style>
<div width = {width}>
<svg bind:this={svg} width = {width} height ={height}>
<!-- {#if tile} -->
<g id = "globe">
    {#if z[0]} 
    {#if z[0].z <= 5}
    <path class = "ocean" id= "sphere" d = { path(sphere) }  /> 
    {/if}  
    {/if}
  </g>
    <g id = 'basemap'>
    {#await tile then t}
    {#each t as paths}
    <path d = {path(paths.data)} data-group={paths.group} class={paths.class}/>
    {/each}
    {/await}
    </g>
    <!-- {/await} -->
    <path d = {path(data)} class="upload"/>
  </svg>
<hr>
<button>enable zoom/pan</button>
{#await classes then c}
<button on:click={()=> download(makeSVG(svg, c, width, height,path))}>download SVG</button>
<Palette c={c} svg = {svg}/>
{/await}
<!-- {/if} -->
</div>
