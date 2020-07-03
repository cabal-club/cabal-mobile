# Patches to `node_modules`

These patches use [`patch-package`](https://www.npmjs.com/package/patch-package)
to update dependencies which have unpublished fixes.

## `metro`

Builds were throwing an error:

```
android/app/src/main/res/raw/package.json: Error: package is not a valid resource name (reserved Java keyword)
```

This was due to mobile code requiring `package.json` (which is used to get
the version number). This fix is pending
https://github.com/facebook/metro/pull/420
