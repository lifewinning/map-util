<script>
    import { onMount } from 'svelte'; 
    import * as d3 from 'd3';
    let svg;
    export let classNames;
</script>

{#await classNames then cn}
{/await}

<!-- Laser Cutter Palette:
 - 255 0 0 (red): cut (no fills!)
 - 0 0 255 (blue): dark engrave
 - 0 0 0 (black): light engrave
 - lines are 0.1px stroke
 - Pattern fills? 
-->