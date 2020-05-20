import { group, groups, benchmark, onBenchmarkEvent, BenchmarkEvent } from './lib/minibench/minibench.js';

const pendingCallbacksByEventName = {};

// Returns a promise that resolves the next time we receive the specified event
function receiveEvent(name) {
  let capturedResolver;
  const resultPromise = new Promise(resolve => {
    capturedResolver = resolve;
  });

  pendingCallbacksByEventName[name] = pendingCallbacksByEventName[name] || [];
  pendingCallbacksByEventName[name].push(capturedResolver);

  return resultPromise;
}

// Listen for messages forwarded from the child frame
window.receiveBenchmarkEvent = function (name) {
  const callbacks = pendingCallbacksByEventName[name];
  delete pendingCallbacksByEventName[name];
  callbacks && callbacks.forEach(callback => callback());
}

group('Rendering grid', () => {
  benchmark('Render 10 items', () => measureRenderGrid(10));
  benchmark('Render 100 items', () => measureRenderGrid(100));
  benchmark('Render 500 items', () => measureRenderGrid(500));
  benchmark('Render 800 items', () => measureRenderGrid(800));
  benchmark('Render 1200 items', () => measureRenderGrid(1200));
  benchmark('Render 3000 items', () => measureRenderGrid(3000));
  benchmark('Render 5000 items', () => measureRenderGrid(5000));

  async function measureRenderGrid(numItems) {
    const numItemsTextbox = document.querySelector('#num-items');
    const refresh = document.querySelector('#refresh');
    setInputValue(numItemsTextbox, numItems.toString());

    let nextRenderCompletion = receiveEvent('Done');
    refresh.click();
    await nextRenderCompletion;
  }

  function setInputValue(inputElement, value) {
    inputElement.value = value;

    const event = document.createEvent('HTMLEvents');
    event.initEvent('change', false, true);
    inputElement.dispatchEvent(event);
  }
});

const scenarioResults = [];

onBenchmarkEvent(async (status, args) => {
  switch (status) {
    case BenchmarkEvent.runStarted:
      scenarioResults.length = 0;
      break;
    case BenchmarkEvent.benchmarkCompleted:
    case BenchmarkEvent.benchmarkError:
      console.log(`Completed benchmark ${args.name}`);
      scenarioResults.push(args);
      break;
    case BenchmarkEvent.runCompleted:
      console.table(scenarioResults);
      break;
    default:
      throw new Error(`Unknown status: ${status}`);
  }
});

(function waitForReady() {
  setTimeout(function () {
      if (!document.querySelector('#ready')) {
        waitForReady();
        return;
      }

      groups.forEach(g => g.runAll());
  }, 1000);
})();
