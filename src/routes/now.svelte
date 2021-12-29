<script>
  import App from '$lib/App.svelte';
  import Feelings, { handlePublicLineClick } from '$lib/Feelings.svelte';
</script>

<App link='/'>
  <div>
      <button on:click={handlePublicLineClick}>Public Line</button>
  </div>
  <Feelings/>
</App>
