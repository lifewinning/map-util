<script>
import  *  as d3 from 'd3-geo';
import center from "@turf/center"
import { projections, getTiles, sortTileData, tilePromise } from './utils'
export let data, height, width, proj;

let projection, path, tile, tiles;
let arr = []
$: {
  projection = projections(data,width,height).map(p => Object.entries(p)).filter(m => m[0][0] == proj)[0][0][1]
  path = d3.geoPath().projection(projection)
  async function tiles() {
        return tilePromise(getTiles(projection, width, height)).then(t => sortTileData(t, arr))
        }
   tile = tiles()
 }



</script>
<style>
    .map { display:flex; flex-wrap: wrap; flex-direction: row;}
    svg { border: 1px dotted;}

#upload {
  fill: var(--upload-fill, none);
  stroke: var(--upload-stroke, chartreuse);
  stroke-width: 4px;
}

.water,.ocean {
  fill: var(--water-fill, gray);
}
.oceanboundary, .riverbankboundary, .waterboundary {
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
.park,.naturereserve,.wood, .protectedarea, .forest, .wetland, .golfcourse {
  fill: #88D18A;
  stroke: #88D18A;
  stroke-width: 0.5px;
}

.majorroad {
  stroke: rgb(57, 57, 57);
  stroke-width: 1px;
  fill:none;
}

.minorroad {
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

.rail {
  stroke: #ebc1fc;
  stroke-width: 0.5px;
  fill:none;
}
</style>

<svg width = {width} height ={height}>
    {#await tile then t}
    <g id = 'basemap'>
    {#each t as paths}
    <path d = {path(paths.data)} class={paths.class}/>
    {/each}
    </g>
    {/await}
    
    <path d = {path(data)} id="upload"/>
</svg>
