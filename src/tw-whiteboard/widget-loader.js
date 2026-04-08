/* eslint-disable @typescript-eslint/no-unsafe-assignment */
(function whiteboardWidgetIIFE() {
  if (!$tw.browser) {
    return;
  }
  // separate the widget from the exports here, so we can skip the require of react code if `!$tw.browser`. Those ts code will error if loaded in the nodejs side.
  try {
    const components = require('$:/plugins/linonetwo/tw-whiteboard/widget.js');
    const { whiteboard } = components;

    exports.whiteboard = whiteboard;
    exports['edit-whiteboard'] = whiteboard;
  } catch (error) {
    console.error('Error loading tw-whiteboard widget', error);
  }
})();
