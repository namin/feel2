<script>
  import { onMount } from 'svelte';
  import Feelings, { currentFeelings, feelingsIds, setFeelings } from './Feelings.svelte';

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
    }, errorFun);
  }

  let email;
  $: signedIn = !!email;
  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    past = [];
    say('');
    if (isSignedIn) {
      var auth2 = gapi.auth2.getAuthInstance();
      var profile = auth2.currentUser.get().getBasicProfile();
      email = profile.getEmail();
      say(email);
    } else {
      email = undefined;
      say('sign in for recording');
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  function pad2(indent, x) {
    var str = ''+x
    if (str.length == 1) {
      str = indent+str;
    }
    return str;
  }

  function formatDate(d) {
    const date = new Date(parseInt(d));
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var s = date.toLocaleDateString(undefined, options);
    const [hour, minutes] = [date.getHours(), date.getMinutes()];
    s += ' '+hour+':'+pad2('0', minutes)
    return s
  }

  function fetchFiles() {
    return gapi.client.drive.files.list({
      q: 'name="feel.json"',
      spaces: 'appDataFolder',
      fields: 'files(id)'
    })
  }

  function fetchSpreadsheetId(fileId) {
    return gapi.client.drive.files.get({
          fileId: fileId,
          alt: 'media'
        })
  }

  var past = [];
  function populateHistory(spreadsheetId) {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1',
    }).then(function(response) {
      var range = response.result;
      past = range.values;
    }, errorFun);
  }

  function handleHistoryClick(event) {
    fetchFiles().then(function (response) {
      if (!response.result.files || response.result.files.length == 0) {
        say('no history');
      } else {
        var fileId = response.result.files[0].id;
        fetchSpreadsheetId(fileId).then(function (response) {
          const spreadsheetId = response.result.spreadsheetId;
          populateHistory(spreadsheetId);
        }, errorFun);
      }
    });
  }

  function handleHistoryDemoClick(event) {
    say('demo')
    const spreadsheetId = '1vA8HisdlQW7msL-cPIkDeZPCltDwcVvbc0j9UIX-Z_M';
    populateHistory(spreadsheetId);
  }

  function handleLineClick(i) {
    return function(event) {
      const line = past[i];
      sayhtml = 'from '+formatDate(line[1]);
      setFeelings(line);
    };
  }

  function createSpreadsheet() {
    return gapi.client.sheets.spreadsheets.create({
      properties: {
        title: "feel.reflective.ink"
      }
    });
  }

  function createAppData(spreadsheetId) {
    return gapi.client.drive.files.create({
      resource: {
        name: 'feel.json',
        parents: ['appDataFolder']
      },
      fields: 'id'
    })
  }

  function storeSpreadsheetId(fileId, spreadsheetId) {
    return gapi.client.request({
      path: '/upload/drive/v3/files/' + fileId,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: JSON.stringify({spreadsheetId: spreadsheetId})
    });
  }

  function handleRecordClick(event) {
    say('recording in progress...');
    fetchFiles().then(function (response) {
      if (!response.result.files || response.result.files.length == 0) {
        createSpreadsheet().then((response) => {
          var spreadsheetId = response.result.spreadsheetId;
          createAppData(spreadsheetId).then(function (response) {
            var fileId = response.result.id;
            storeSpreadsheetId(fileId, spreadsheetId).then(function (response) {
              insertRows(spreadsheetId, [listHeader(), listState()])
            }, errorFun);
          }, errorFun)
        }, errorFun)
      } else {
        var fileId = response.result.files[0].id;
        fetchSpreadsheetId(fileId).then(function (response) {
          var spreadsheetId = response.result.spreadsheetId;
          insertRows(spreadsheetId, [listState()])
        }, errorFun);
      }
    }, errorFun);
  }

  function spreadsheelUrl(spreadsheetId) {
    return 'https://docs.google.com/spreadsheets/d/'+spreadsheetId+'/edit#gid=0';
  }

  function insertRows(spreadsheetId, values) {
    gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS'
    }, {
      range: 'Sheet1',
      majorDimension: 'ROWS',
      values: values
    }).then((response) => {
      say('recorded on '+formatDate(values[values.length-1][1])+' to <a href="'+spreadsheelUrl(spreadsheetId)+'" target="_blank">spreadsheet</a>')
    }, function(response) {
      if (response.result.error.code == 404) {
        log('spreadsheet not found!')
        record();
      } else {
        log('Error: ' + response.result.error.message);
        console.log('insertRow('+spreadsheetId+', ...)');
        console.log(JSON.stringify(response, null, 2));
      }
    });
  }

  function listHeader(spreadsheetId) {
    return ['Date', 'Date', ...feelingsIds];
  }

  function listState(spreadsheetId) {
    return [Date(), Date.now(), ...currentFeelings()];
  }

  function errorFun(response) {
    console.log(JSON.stringify(response, null, 2));
    if (response.status == 404) {
      say('Error: not found');
    } else {
      if (response.result && response.result.error) {
        say('Error: ' + response.result.error.message);
      } else {
        say('Error with Google API');
      }
    }
  }

  let logtext = '';
  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
   */
  function log(message) {
    logtext += message + '\n';
  }

  let sayhtml = '';
  function say(message) {
    sayhtml = message;
  }

  onMount(() => {
    gapi.load('client:auth2', initClient);
  })
</script>

{#if signedIn}
  <button on:click={handleSignoutClick}>Sign out</button>
  <button on:click={handleHistoryClick}>History</button>
  <button on:click={handleRecordClick}>Record</button>
{:else}
  <button on:click={handleAuthClick}>Sign in</button>
  <button on:click={handleHistoryDemoClick}>History (Demo)</button>
{/if}
<div>
  <em>{@html sayhtml}</em>
</div>
<pre>
  {logtext}
</pre>

<div>

<div class="next">
<Feelings/>
</div>

<div class="next">
  <ol>
  {#each past as line, i}
    {#if i>0}
      <li><button class="line" on:click={handleLineClick(i)}>{formatDate(line[1])}</button></li>
    {/if}
  {/each}
  </ol>
</div>

</div>

<style>
  div.next {
    float: left;
  }
  button {
    display: inline-block;
    font-size: 1.1em;
    margin-bottom: 0.5em;
  }
  button.line {
    max-width: max-content;
    min-width: 33ch;
    text-align: left;
  }
  li {
    display: list-item;
    list-style-position: inside;
  }
</style>
