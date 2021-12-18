<script>
  import { onMount } from 'svelte';

  // Client ID and API key from the Developer Console
  var CLIENT_ID = '45515854863-6imu2cteovr1j804j404auhh70nmlihh.apps.googleusercontent.com';
  var API_KEY = 'AIzaSyCl2kEvCB66YADUGvGi5DFbJ7bPcbbS1aQ';

  // Array of API discovery doc URLs for APIs used
  var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest", "https://sheets.googleapis.com/$discovery/rest?version=v4"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  var SCOPES = "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file";

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function(error) {
      console.log('initClient()')
      console.log(JSON.stringify(error, null, 2));
    });
  }

  let email;
  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      var auth2 = gapi.auth2.getAuthInstance();
      var profile = auth2.currentUser.get().getBasicProfile();
      email = profile.getEmail();
    } else {
      email = undefined;
    }
  }

  onMount(() => {
    gapi.load('client:auth2', initClient);
  })

</script>

<p>...</p>
