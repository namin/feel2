# [feel.reflective.ink](https://feel.reflective.ink)

An client-side [app](https://feel.reflective.ink) to explore and select feelings.

Please [email me](mailto:namin@alum.mit.edu) if you want to be a beta tester for the recording to your private Google spreadsheet.

## Tech

- Svelte (just [learning](https://svelte.dev/tutorial/)), Svelte kit for routing
- D3.js to draw the wheel, based on [chriseyre2000/FeelingWheel](https://github.com/chriseyre2000/FeelingWheel)
- Google API (all client-side!)
- [Sparklines Typeface Library](https://github.com/aftertheflood/sparks)

To install the app locally:
```
npm install
```

To run the app locally:
```
vite
```

The app is hosted on [Vercel](https://vercel.com/).

### Pain points

- D3.js interactivity doesn't mesh well with Svelte. I had to fallback to JavaScript.
- I am still not using Svelte optimally, as the component hierarchy is poor (`Google` contains `Feelings`), the communication between components is poor, and I am not using reactive values as much as I should.
- I don't yet see the added value of Svelte Kit.
- I haven't avoided the callback hell for the Google API calls.
- I started this version 2, because [version 1](https://github.com/namin/feel) was pure low-level JavaScript and was becoming unwieldly. So I am happy with how more extensible this version is. Stay tuned!
