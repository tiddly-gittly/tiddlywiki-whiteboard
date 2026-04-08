/*\
title: tests/whiteboard-plugin.js
type: application/javascript
tags: [[$:/tags/test-spec]]

Jasmine tests for the tw-whiteboard plugin.
Tests run in the TiddlyWiki Node.js environment (no DOM / tldraw rendering needed).
\*/

describe('tw-whiteboard plugin', function () {

  // ── Plugin registration ──────────────────────────────────────────────────

  describe('plugin info', function () {
    it('should be loaded as a plugin tiddler', function () {
      var plugin = $tw.wiki.getTiddler('$:/plugins/linonetwo/tw-whiteboard');
      expect(plugin).toBeDefined();
    });

    it('should have the correct plugin-type field', function () {
      var plugin = $tw.wiki.getTiddler('$:/plugins/linonetwo/tw-whiteboard');
      expect(plugin.fields['plugin-type']).toBe('plugin');
    });

    it('should declare a version', function () {
      var plugin = $tw.wiki.getTiddler('$:/plugins/linonetwo/tw-whiteboard');
      expect(typeof plugin.fields.version).toBe('string');
      expect(plugin.fields.version.length).toBeGreaterThan(0);
    });
  });

  // ── File-type registration ───────────────────────────────────────────────

  describe('tldr file type', function () {
    it('should register the application/vnd.tldraw+json content type', function () {
      var type = $tw.config.contentTypeInfo['application/vnd.tldraw+json'];
      expect(type).toBeDefined();
    });

    it('should use .tldr as the file extension', function () {
      var type = $tw.config.contentTypeInfo['application/vnd.tldraw+json'];
      expect(type.extension).toBe('.tldr');
    });
  });

  // ── Whiteboard tiddler filter ─────────────────────────────────────────────

  describe('whiteboard tiddler filter', function () {
    var TEST_TITLE = '__test_whiteboard_filter__';

    beforeEach(function () {
      $tw.wiki.addTiddler({
        title: TEST_TITLE,
        type: 'application/vnd.tldraw+json',
        text: '{}'
      });
    });

    afterEach(function () {
      $tw.wiki.deleteTiddler(TEST_TITLE);
    });

    it('should find whiteboard tiddlers via type filter', function () {
      var results = $tw.wiki.filterTiddlers(
        '[all[tiddlers]field:type[application/vnd.tldraw+json]]'
      );
      expect(results.indexOf(TEST_TITLE)).toBeGreaterThanOrEqual(0);
    });
  });

  // ── wikitext-note migration regex ────────────────────────────────────────

  describe('wikitext-note migration', function () {
    function migrateText(text) {
      return text
        .replace(/,\s*"wikitext-note"\s*:\s*\d+/g, '')
        .replace(/"wikitext-note"\s*:\s*\d+\s*,/g, '')
        .replace(/,\s*"com\.tldraw\.shape\.wikitext-note"\s*:\s*\d+/g, '')
        .replace(/"com\.tldraw\.shape\.wikitext-note"\s*:\s*\d+\s*,/g, '')
        .replace(/"wikitext-note"/g, '"note"');
    }

    it('should replace shape type "wikitext-note" with "note"', function () {
      var input = '{"type":"wikitext-note","props":{}}';
      var result = migrateText(input);
      expect(result).toBe('{"type":"note","props":{}}');
    });

    it('should remove trailing "wikitext-note" subtype version entry', function () {
      var input = '{"subTypeVersions":{"geo":1,"wikitext-note":0}}';
      var result = migrateText(input);
      expect(result).toContain('"geo":1');
      expect(result).not.toContain('wikitext-note');
    });

    it('should remove leading "wikitext-note" subtype version entry', function () {
      var input = '{"subTypeVersions":{"wikitext-note":0,"geo":1}}';
      var result = migrateText(input);
      expect(result).not.toContain('wikitext-note');
      expect(result).toContain('"geo":1');
    });

    it('should remove com.tldraw.shape.wikitext-note schema entry', function () {
      var input = '{"com.tldraw.shape.geo":1,"com.tldraw.shape.wikitext-note":0}';
      var result = migrateText(input);
      expect(result).not.toContain('wikitext-note');
      expect(result).toContain('com.tldraw.shape.geo');
    });

    it('should leave non-wikitext-note content untouched', function () {
      var input = '{"type":"geo","props":{"w":100}}';
      var result = migrateText(input);
      expect(result).toBe(input);
    });
  });

  // ── Sidebar state tiddlers ────────────────────────────────────────────────

  describe('sidebar state tiddlers', function () {
    var STATE = '$:/state/Whiteboard/PageLayout/sidebarOpen';
    var MODE  = '$:/state/Whiteboard/PageLayout/sidebarMode';

    afterEach(function () {
      $tw.wiki.deleteTiddler(STATE);
      $tw.wiki.deleteTiddler(MODE);
    });

    it('should allow setting sidebar open state to "yes"', function () {
      $tw.wiki.setText(STATE, 'text', undefined, 'yes');
      expect($tw.wiki.getTiddlerText(STATE)).toBe('yes');
    });

    it('should allow setting sidebar mode to "create"', function () {
      $tw.wiki.setText(MODE, 'text', undefined, 'create');
      expect($tw.wiki.getTiddlerText(MODE)).toBe('create');
    });

    it('should allow setting sidebar mode to "switch"', function () {
      $tw.wiki.setText(MODE, 'text', undefined, 'switch');
      expect($tw.wiki.getTiddlerText(MODE)).toBe('switch');
    });
  });

  // ── Draft tiddler for create flow ────────────────────────────────────────

  describe('create-tiddler draft flow', function () {
    var DRAFT = '$:/state/Whiteboard/PageLayout/create-tiddler';

    afterEach(function () {
      $tw.wiki.deleteTiddler(DRAFT);
    });

    it('should store draft.title on the temp tiddler', function () {
      $tw.wiki.addTiddler({
        title: DRAFT,
        'draft.title': 'My New Board',
        'draft.of': ''
      });
      var t = $tw.wiki.getTiddler(DRAFT);
      expect(t.fields['draft.title']).toBe('My New Board');
    });

    it('should allow creating a real tiddler from draft.title', function () {
      var newTitle = '__test_create_flow_board__';
      $tw.wiki.addTiddler({
        title: DRAFT,
        'draft.title': newTitle,
        'draft.of': ''
      });
      // Simulate the action: create tiddler with type
      $tw.wiki.addTiddler({
        title: newTitle,
        type: 'application/vnd.tldraw+json',
        text: '{}'
      });
      expect($tw.wiki.tiddlerExists(newTitle)).toBe(true);
      $tw.wiki.deleteTiddler(newTitle);
    });
  });

});
