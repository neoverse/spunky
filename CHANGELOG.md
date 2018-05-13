# 1.3.1
- Fixed `withProgress` HOC for batch actions where any associated actions have not had `withCall`
  performed on them previously.

# 1.3.0
- Fixed `withProgress` HOC for batch actions that have not had `withCall` performed on them
  previously.  This fixes a scenario where `withCall` is performed on two or more individual
  actions followed by `withProgress` on a batch action comprised of the previous actions.

# 1.2.1
- Fixed `clean` action not being handled by reducer.

# 1.2.0
- Added support for nested store keys.
- Added `clean` action to completely remove redux state data.

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
