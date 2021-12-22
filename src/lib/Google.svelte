<script context="module">
  export var initClient;
  export var handleAuthClick;
  export var handleSignoutClick;
  export var handleHistoryClick;
  export var handlePublicHistoryClick;
  export var handleLineClick;
  export var handlePublicLineClick;
  export var handleRecordClick;
  export var resetPast;
  export var log;
  export var say;
</script>

<script>
  import Feelings, { currentFeelings, setFeelings, getFeelings } from '$lib/Feelings.svelte';
  import { formatDate } from '$lib/date.ts';

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
  initClient = function(callback) { return function() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(callback, errorFun);
  }; }

  /**
   *  Sign in the user upon button click.
   */
  handleAuthClick = function(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  handleSignoutClick = function(event) {
    gapi.auth2.getAuthInstance().signOut();
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

  export let past = [];
  resetPast = function() {
    past = []
  }
  function populateHistory(spreadsheetId) {
    resetPast();
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1',
    }).then(function(response) {
      var range = response.result;
      past = range.values;
      say('history of '+'<a href="'+spreadsheelUrl(spreadsheetId)+'">spreadsheet</a>');
      location.hash = prefixSheet+spreadsheetId;
      past = past;
    }, errorFun);
  }

  handleHistoryClick = function(event) {
    fetchFiles().then(function (response) {
      if (!response.result.files || response.result.files.length == 0) {
        say('no history');
      } else {
        var fileId = response.result.files[0].id;
        fetchSpreadsheetId(fileId).then(function (response) {
          const spreadsheetId = response.result.spreadsheetId;
          say('fetching history of '+'<a href="'+spreadsheelUrl(spreadsheetId)+'">spreadsheet</a> ...');
          populateHistory(spreadsheetId);
        }, errorFun);
      }
    });
  }

  const prefixSheet = '#spreadsheet-';
  handlePublicHistoryClick = function(event) {
    let spreadsheetId = '1vA8HisdlQW7msL-cPIkDeZPCltDwcVvbc0j9UIX-Z_M';
    let locationHash = location.hash;
    console.log(locationHash)
    if (!locationHash.startsWith(prefixSheet)) {
      spreadsheetId = prompt('public spreadsheet id', spreadsheetId);
    } else {
      spreadsheetId = locationHash.substring(prefixSheet.length)
    }
    if (spreadsheetId == null || spreadsheetId == '') {
      say('cancelled');
    } else {
      say('fetching public history of '+'<a href="'+spreadsheelUrl(spreadsheetId)+'">spreadsheet</a> ...');
      populateHistory(spreadsheetId);
    }
  }

  handleLineClick = function(i) {
    return function(event) {
      const line = past[i];
      sayhtml = 'from '+formatDate(line[1]);
      setFeelings(line);
    };
  }

  const prefixLine = '#line-';
  handlePublicLineClick = function(event) {
    const line = getFeelings();
    const hash = prefixLine+line.join('');
    console.log(hash);
    location.hash = hash;
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

  handleRecordClick = function(event) {
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
  log = function(message) {
    logtext += message + '\n';
  }

  let sayhtml = '';
  say = function(message) {
    sayhtml = message;
  }
</script>

<slot name="user-bar"></slot>

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
    min-width: 30ch;
    text-align: left;
  }
  li {
    display: list-item;
    list-style-position: inside;
  }
</style>
