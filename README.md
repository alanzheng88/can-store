# Can Store

This is me refactoring https://github.com/mdn/learning-area/blob/master/javascript/apis/fetching-data/can-store/can-script.js to use xhr and promises

This example made me realize that Promises cannot be used in every scenario due to the fact that Promises can only be resolved once, and they can never ever change their state again. Therefore, the lesson here is not to execute a piece of code from a Promise chain more than once.

