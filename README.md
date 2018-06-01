# Can Store

This is me refactoring https://github.com/mdn/learning-area/blob/master/javascript/apis/fetching-data/can-store/can-script.js to use xhr and promises. Cached category and search term to save bandwidth when applying the same search.

The purpose of this is to practice using xhr to support older browsers while at the same time using Promises to avoid callback hell and improves code readability. My implementation is also less error-prone compared to the original implementation and makes debugging much easier by avoiding sharing function scope variables across multiple inner functions.

This example made me realize that Promises only resolves once, and as a result, they can never ever change their state again. Therefore, the lesson here is not to execute a piece of code from a Promise chain more than once.
