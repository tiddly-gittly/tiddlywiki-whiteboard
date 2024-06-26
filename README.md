# TW WhiteBoard

## Document & Usage

See website [https://tiddly-gittly.github.io/tiddlywiki-whiteboard/](https://tiddly-gittly.github.io/tiddlywiki-whiteboard/) for demo and usage.

## Credits

This project is based on [TLDraw](https://github.com/tldraw/tldraw), and some of its components are inspired by [toeverything/AFFiNE](https://github.com/toeverything/AFFiNE). I choose TLDraw because it is DOM based, which makes integration with tiddlywiki much easier.

If you like excalidraw, and whould like to implement excalidraw as alternative whiteboard enging for this plugin, please create a PR about it (not issue).

## Development

### During development

There are some scripts you can run to boost your development.

After `npm i --legacy-peer-deps`:

- `npm run dev-demo` to setup the demo site locally. Re-run this command and refresh browser to see changes to local code and tiddlers.
- `npm run dev` to pack the plugin in the `dist/` directory.

You will need `--legacy-peer-deps` when `npm i` if you are using latest nodejs. This is a bug in npm.

#### Add a second ts file

Add new file name (without `.ts`) to `package.json`'s `tsFiles` field. And build script will read it and compile files in it.

#### After the plugin is complete

##### Publish

Enable github action in your repo (in your github repo - setting - action - general) if it is not allowed, and when you tagging a new version `vx.x.x` in a git commit and push, it will automatically publish to the github release.

##### Demo

You will get a Github Pages demo site automatically after publish. If it is 404, you may need to manually enable Github Pages in your github repo:

Settings - Pages (on left side) - Source - choose `gh-pages` branch
