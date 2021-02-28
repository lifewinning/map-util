<script>
import Map from './Map.svelte'
let oneMap, manyMaps, selected;
import { projections } from './utils.js'
export let data; 
let height = 400;
let width = 400;
</script>

<input type=number bind:value={height} /> height
<input type=number bind:value={width} /> width

<select bind:value={selected}>
{#each projections(data, width, height) as proj}
<option value = {Object.keys(proj)[0]}> {Object.keys(proj)[0]}</option>
{/each}
</select>

<input id="m1" type="checkbox" name="onemap"  bind:checked={oneMap}/> Map of All Features
<input id="m2" type="checkbox" name="manymaps" bind:checked={manyMaps}/> Map Each Feature

<hr>
{#if oneMap}
    <div class='map' style="display:flex; flex-wrap: wrap; flex-direction: row;">
    <Map data={data} height = {height} width = {width} proj = {selected}/>
    </div>
{/if}
{#if manyMaps}
<div class='map' style="display:flex; flex-wrap: wrap; flex-direction: row;">
{#if data.features}
    {#each data.features as feature}
    <div>
        <Map data = {feature} height = {height} width = {width} proj = {selected}/>
        {#if feature.properties }
        <pre>{JSON.stringify(feature.properties)}</pre>
        {/if}
    </div>
    {/each}
{/if}
</div>
{/if}