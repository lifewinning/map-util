<script>
    // import { onMount } from 'svelte';
// import Map from './Map.svelte';
import Settings from './Settings.svelte'



	let files, data;
    // let mapCenter = []

    // onMount(() => {
    //     if (files && files[0]) {
    //     let json = files[0];
    //     let reader = new FileReader();
    //     reader.onloadend = function(evt) {
    //         data = JSON.parse(evt.target.result);
    //     }
    //     reader.readAsText(json);
    // }
	// });

// $: {
//     if (files && files[0]) {
//         let json = files[0];
//         let reader = new FileReader();
//         reader.onloadend = function(evt) {
//            data = JSON.parse(evt.target.result);  
//         }
//         reader.readAsText(json);
//     }
// } 
</script>

<main>
	<input type="file" bind:files/>
</main>

{#if files && files[0]}
<p>{files[0].name}</p>
{#await files[0].text() then text}
<Settings data={JSON.parse(text)}/>
{/await}
{/if}

