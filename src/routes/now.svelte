<script>
  import App from '$lib/App.svelte';
  import Feelings, { handlePublicCutClick } from '$lib/Feelings.svelte';
</script>

<App link='/'>
  <div>
      <button on:click={handlePublicCutClick}>Public Cut</button>
  </div>
  <Feelings/>
</App>
