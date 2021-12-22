<script>
  export let link = '';
</script>

<h1>
  {#if link}
    <a href="{link}">The Feeling Wheel</a>
  {:else}
    The Feeling Wheel
  {/if}
</h1>

<slot></slot>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap');

  :global(body) {
    margin: 0.3em;
    font-family: "Raleway", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
</style>
