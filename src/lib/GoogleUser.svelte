<script>
  import { onMount } from 'svelte';
  import { handlePublicLineClick } from '$lib/Feelings.svelte';
  import { say, resetPast,initClient, handleAuthClick, handleSignoutClick, handleHistoryClick, handleRecordClick, handlePublicHistoryClick } from '$lib/Google.svelte';
  import Google from '$lib/Google.svelte';

  let email;
  $: signedIn = !!email;
  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    say('');
    if (isSignedIn) {
      var auth2 = gapi.auth2.getAuthInstance();
      var profile = auth2.currentUser.get().getBasicProfile();
      email = profile.getEmail();
      say(email);
    } else {
      resetPast();
      email = undefined;
      say('sign in for recording');
    }
  }

  onMount(() => {
    gapi.load('client:auth2', initClient(function() {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }));
  })
</script>

<Google>
<div slot="user-bar">
{#if signedIn}
  <button on:click={handleSignoutClick}>Sign out</button>
  <button on:click={handleHistoryClick}>History</button>
  <button on:click={handlePublicLineClick}>Public Line</button>
  <button on:click={handleRecordClick}>Record</button>
{:else}
  <button on:click={handleAuthClick}>Sign in</button>
  <button on:click={handlePublicHistoryClick}>Public History</button>
  <button on:click={handlePublicLineClick}>Public Line</button>
{/if}
</div>
</Google>
