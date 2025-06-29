# Release Process

This project uses a `release` branch strategy for controlled npm publishing.

## Branch Strategy

- **`master`** - Main development branch, CI runs tests but no publishing
- **`release`** - Release branch, automatically publishes to npm when updated

## Publishing Workflow

### Option 1: Release Branch (Recommended)
```bash
# 1. Ensure master is ready for release
git checkout master
git pull origin master

# 2. Create/update release branch from master
git checkout release || git checkout -b release
git merge master

# 3. Push to release branch - this triggers automatic npm publish
git push origin release
```

### Option 2: Manual Trigger (For hotfixes)
1. Go to GitHub Actions → "Publish to NPM" 
2. Click "Run workflow"
3. Choose version bump type (patch/minor/major)
4. Click "Run workflow"

## What Happens Automatically

When you push to `release` branch:
- ✅ Runs all tests
- ✅ Builds the project  
- ✅ Auto-bumps patch version (3.0.1 → 3.0.2)
- ✅ Creates git tag
- ✅ Publishes to npm with new README
- ✅ Updates package.json in release branch

## Version Strategy

- **Patch** (3.0.1): Bug fixes, documentation updates, small improvements
- **Minor** (3.1.0): New features, significant improvements  
- **Major** (4.0.0): Breaking changes, major rewrites

## Recommended Flow

```bash
# Regular development
git checkout master
# ... make changes, commit, push to master

# Ready to release?
git checkout release
git merge master
git push origin release  # 🚀 Auto-publishes to npm
```

## Benefits

- ✅ **Controlled releases** - Only release when ready
- ✅ **Clean master** - Development doesn't trigger publishing
- ✅ **Automatic versioning** - No manual version management
- ✅ **Safe testing** - CI tests before every publish
- ✅ **Rollback friendly** - Can revert release branch if needed

## Emergency Rollback

If you need to unpublish or rollback:
```bash
# Revert release branch
git checkout release
git revert HEAD
git push origin release

# Or manually unpublish (not recommended)
npm unpublish scaffold-scripts@VERSION
```