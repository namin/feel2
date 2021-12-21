<script>
  import { onMount } from 'svelte';
  import { say, resetPast, initClient, handleSignoutClick, handlePublicHistoryClick } from '$lib/Google.svelte';
  import Google from '$lib/Google.svelte';
  function updateSigninStatus(isSignedIn) {
    resetPast();
    say('');
    if (isSignedIn) {
      say('signing out for public view')
      handleSignoutClick();
    } else {
      say('signed out for public view')
    }
  }
  onMount(() => {
    gapi.load('client:auth2', initClient(function() {

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }));
  })
</script>

<Google>
<div slot="user-bar">
  <button on:click={handlePublicHistoryClick}>Public History</button>
</div>
</Google>
