<script>
  import { feelingsIds } from '$lib/Feelings.svelte';
  import { onMount } from 'svelte';
  export let line;

  let sparks = [];
  onMount(async () => {
    let emotions = ['Fearful', 'Angry', 'Disgusted', 'Sad', 'Happy', 'Surprised', 'Bad'];
    let m = {};
    let total = 0;
    for (var j=0; j<feelingsIds.length; j++) {
      if (line[j+2] != "0") {
        const str = feelingsIds[j];
        const key = str.split("-")[0];
        m[key] = (m[key] || 0) + 1;
        total += 1;
      }
    }
    sparks = [];
    for (const emotion of emotions) {
      let count = (m[emotion] || 0);
      let percentage = (total == 0) ? 0 : Math.round(100*count/total);
      sparks.push({'emotion':emotion, 'percentage':percentage});
    }
    sparks = sparks;
  });
</script>

<span class="sparks bar-narrow"><span class="emotion-sparks">
    {#each sparks as spark}
      <span class="color-{spark.emotion}">{spark.percentage},</span>
    {/each}
</span></span>&nbsp;
