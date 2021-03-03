<script>
import Map from './Map.svelte'
let oneMap, manyMaps, projselect;
import { projections } from './utils.js'
export let data; 
let height = 400;
let width = 400;
</script>
<style>
    pre{
        padding: 2px;
        background-color: papayawhip;
        white-space: pre-wrap;
    }
    .feat{
        width: min-content;
        margin:2px;
        padding: 2px;;
    }
</style>

<!-- Actual Settings for Maps -->

<input type=number bind:value={height} /> height
<input type=number bind:value={width} /> width

<select bind:value={projselect}>
{#each projections(data, width, height) as proj}
<option value = {Object.keys(proj)[0]}> {Object.keys(proj)[0]}</option>
{/each}
</select>

<input id="m1" type="checkbox" name="onemap"  bind:checked={oneMap}/> Map of All Features
<input id="m2" type="checkbox" name="manymaps" bind:checked={manyMaps}/> Map Each Feature

<hr>

<!-- Maps Load Here! -->
{#if oneMap}
    <div class='map' style="display:flex; flex-wrap: wrap; flex-direction: row; justify-content: space-evenly;">
    <div class="feat">
    <Map data={data} height = {height} width = {width} proj = {projselect}/>
</div>
    </div>
{/if}
{#if manyMaps}
    <div class='map' style="display:flex; flex-wrap: wrap; flex-direction: row; justify-content: space-evenly;">
    {#if data.features}
        {#each data.features as feature}
        <div class="feat"> 
            {#if feature.properties }
            <pre>{JSON.stringify(feature.properties,null,2)}</pre>
            {/if}
            <Map data = {feature} height = {height} width = {width} proj = {projselect}/>      
        </div>
        {/each}
    {/if}
</div>
{/if}