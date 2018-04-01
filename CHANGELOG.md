# 1.1.2
- Added `recentlyCompletedStrategy`.

# 1.1.1
- Updated store to maintain previous `data` or `error` value when progress changes to LOADED or
  FAILED.  Without this, the `alreadyLoadedStrategy` won't work as expected due to intermittent
  failures.

# 1.1.0
- Removed "babel-runtime" from compilation to fix errors related to duplicate instances.

# 1.0.1
- Added `.npmignore` to fix published version.

# 1.0.0
- Initial release.
