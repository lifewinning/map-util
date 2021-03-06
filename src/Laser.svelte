<script>
    import { remove } from './utils';
    export let svg;
    export let classNames;

    let laserColors = [['red','cut', 'rgb(255,0,0)', 'stroke'], ['blue','dark engrave','rgb(0,0,255)','stroke'], ['black','light engrave','rgb(0,0,0)','stroke'],['black','fill engrave','rgb(0,0,0)','fill']]

    async function laserChange(className, newColor, item){
    let selected = await svg.querySelectorAll(`.${className}`)
    selected.forEach(element => {
        element.style.setProperty('fill','none')
        element.style.setProperty(item, newColor)
        element.style.setProperty('stroke-width', 0.1)
    });
}

</script>
<style>
    .laser {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 2px;
    grid-row-gap: 2px;
 }
</style>
<pre><strong>uploaded data</strong></pre>
<div class='laser'>
    {#each laserColors as laserColor}
    <div>
    <pre>{laserColor[1]}</pre>
    <svg  width=45 height=45>
    <circle cx="25" cy="25" r="20" style="stroke:black; stroke-weight:.5px;" fill={laserColor[2]} on:click={event => {laserChange('upload',laserColor[2],laserColor[3])}}/>  
    </svg>
    </div>
    {/each}
</div>
{#each classNames as c}
<pre><strong>{c.name}</strong></pre>
<div class='laser'>
    {#each laserColors as laserColor}
    <div style="margin:1px;">
    <pre>{laserColor[1]}</pre>
    <svg  width=45 height=45>
    <circle cx="25" cy="25" r="20" style="stroke:black; stroke-weight:.5px;" fill={laserColor[2]} on:click={event => {laserChange(c.name,laserColor[2],laserColor[3])}}/>  
    </svg>
    </div>
    {/each}
     <div><pre>remove layer</pre><button on:click={remove(svg, c.name)}><pre>are you sure??</pre></button></div>
</div> 
{/each}
