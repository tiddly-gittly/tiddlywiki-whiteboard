/* eslint-disable @typescript-eslint/no-unsafe-assignment */
(function whiteboardWidgetIIFE() {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!$tw.browser) {
    return;
  }
  // separate the widget from the exports here, so we can skip the require of react code if `!$tw.browser`. Those ts code will error if loaded in the nodejs side.
  const components = require('$:/plugins/linonetwo/tw-whiteboard/widget.js');
  const { whiteboard } = components;
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  exports.whiteboard = whiteboard;
  exports['edit-whiteboard'] = whiteboard;
})();
