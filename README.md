# InalltwelvekeysUi

## Handy for quick side loading on server
sudo git pull && sudo npm install && sudo npm run deploy

## Package.json Notes

```json
  "webmidi": "^2.5.1",
  "webmidi3": "npm:webmidi@^3.1.6",
```

* My package depends on `webmidi` (^3.1.6)
* My package also depends on `@tonejs/piano` (^0.2.1)
  * ...which itself has a peer dependency on `webmidi` (^2.5.1)


My package depends on a later version of `webmidi` than `@tonejs/piano` says can tolerate.
So I've added `webmidi` twice via an alias.
`@tonejs/piano` uses the ^2.5.1 version.
My code in this project uses the aliased `webmidi3` (^3.1.6) version.

* https://dev.to/icy0307/peer-dependencies-in-depth-1o3b
* https://www.nieknijland.nl/blog/use-multiple-versions-of-an-npm-package-at-the-same-time
