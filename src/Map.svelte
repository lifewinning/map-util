<script>
import { onMount } from 'svelte';
import Palette from './Palette.svelte';
import * as d3 from 'd3';
import { projections, getTiles, sortTileData, tilePromise } from './utils'
export let data, height, width, proj;
let projection, path, tile, svg, getPaths, z;

// to do: "cache" tiles, drag and zoom
let m = { x: 0, y: 0};
let sphere = ({type: "Sphere"})
// onMount(async () => {
//   let pathSet = new Set (Array.from(document.querySelectorAll('path')).map(m => m.getAttribute('class')))
//   getPaths = [...pathSet]
// })


$: {
  let arr = []
  projection = projections(data,width,height).map(p => Object.entries(p)).filter(m => m[0][0] == proj)[0][0][1]
  path = d3.geoPath().projection(projection)
  async function tiles() {
        return tilePromise(getTiles(projection, width, height)).then(t => sortTileData(t, arr))
    }
  tile = tiles()
    z = getTiles(projection, width, height);
  console.log(z[0].z)

}

</script>
<style>
    div { margin: 2px; }
    svg { border: 1px dotted;}

.upload {
  fill: var(--upload-fill, none);
  stroke: var(--upload-stroke, chartreuse);
  stroke-width: 4px;
}

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
<svg bind:this={svg} width = {width} height ={height} on:mousemove="{e => m = { x: e.clientX, y: e.clientY }}" on:>
     {#if z[0].z <= 5}
    <g id = "water">
      <path class = "ocean" d = { path(sphere) }  /> 
    </g>
    {/if}  
    {#await tile then t}
    <g id = 'basemap'>
    {#each t as paths}
    <path d = {path(paths.data)} class={paths.class}/>
    {/each}
    </g>
    {/await}
    <path d = {path(data)} class="upload"/>
</svg>
<hr>

<!-- todo! -->
<Palette width = {width}/>
<!-- <button>svg (axidraw)</button> <button>svg (PW laser)</button><button>svg (print)</button> -->
</div>
