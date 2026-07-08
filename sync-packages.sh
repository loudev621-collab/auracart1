#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# AuraCart — Package Sync Script
# sync-packages.sh
#
# Wipes caches, reinstalls from scratch, regenerates package-lock.json, and
# validates the project before commit/push — so localhost, GitHub, and Vercel
# all use the exact same dependency tree with zero version drift.
#
# Tailored specifically to the AuraCart stack:
#   Next.js (App Router) · TypeScript · Tailwind · Supabase · Stripe
#   Scripts used by this project: dev · build · start · lint · type-check
#   (No Jest / Playwright / Turbo — those are intentionally not part of AuraCart.)
#
# USAGE:
#   bash sync-packages.sh              # Full sync (recommended)
#   bash sync-packages.sh --quick      # Skip cache wipe (faster)
#   bash sync-packages.sh --ci-test    # Also simulate a Vercel build (npm ci + next build)
#   bash sync-packages.sh --verify     # Verify-only mode (no changes)
#
# RUN THIS WHENEVER:
#   - You change package.json (add/remove/upgrade a dependency)
#   - Vercel build fails with module-not-found or a version mismatch
#   - "npm ci" fails or you see stubborn peer-dependency warnings
#   - After resolving merge conflicts that touched package*.json
#   - After switching branches with different dependencies
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'

# ─── Parse flags ──────────────────────────────────────────────────────────────
QUICK=false; CI_TEST=false; VERIFY_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --quick)   QUICK=true ;;
    --ci-test) CI_TEST=true ;;
    --verify)  VERIFY_ONLY=true ;;
    --help|-h)
      echo "Usage: bash sync-packages.sh [--quick] [--ci-test] [--verify]"
      echo "  --quick    Skip full cache wipe (faster)"
      echo "  --ci-test  Simulate a Vercel build (npm ci + next build) after sync"
      echo "  --verify   Check current state without making changes"
      exit 0 ;;
    *) echo -e "${RED}Unknown flag: $arg${NC}"; exit 1 ;;
  esac
done

# ─── Header ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  AuraCart — Package Sync${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

step=0
check() { step=$((step + 1)); echo -e "${CYAN}[$step]${NC} $1"; }
pass()  { echo -e "    ${GREEN}✓ $1${NC}"; }
warn()  { echo -e "    ${YELLOW}⚠ $1${NC}"; }
fail()  { echo -e "    ${RED}✗ $1${NC}"; }

# ═══════════════════════════════════════════════════════════════════════════════
# PREREQUISITES
# ═══════════════════════════════════════════════════════════════════════════════
check "Checking prerequisites..."

if [ ! -f "package.json" ]; then
  fail "package.json not found — run this from the auracart project root"; exit 1
fi
pass "package.json found"

if ! node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))" 2>/dev/null; then
  fail "package.json is INVALID JSON — fix syntax errors first"; exit 1
fi
pass "package.json is valid JSON"

# Confirm this really is the AuraCart project (guards against running in the wrong folder)
AURACART_OK=true
for dir in app components lib; do
  [ -d "$dir" ] || AURACART_OK=false
done
if grep -q '"@supabase/supabase-js"' package.json && grep -q '"stripe"' package.json; then :; else AURACART_OK=false; fi
if [ "$AURACART_OK" = true ]; then
  pass "Looks like the AuraCart project (app/, components/, lib/, Supabase + Stripe deps)"
else
  warn "This doesn't look like the AuraCart project — double-check you're in the right folder"
fi

NODE_VERSION=$(node -v | sed 's/v//'); NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then fail "Node $NODE_VERSION — need >= 18"; exit 1; fi
pass "Node $NODE_VERSION"
pass "npm $(npm -v)"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  pass "Git branch: $(git branch --show-current)"
  git diff --name-only | grep -q "package.json" && warn "package.json has uncommitted changes"
else
  warn "Not a git repository — git checks will be skipped"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# VERIFY-ONLY MODE
# ═══════════════════════════════════════════════════════════════════════════════
if [ "$VERIFY_ONLY" = true ]; then
  check "Running verification checks..."

  [ -f "package-lock.json" ] && pass "package-lock.json exists" || { fail "package-lock.json missing — run full sync"; exit 1; }
  [ -d "node_modules" ] && pass "node_modules exists" || { fail "node_modules missing — run full sync"; exit 1; }

  echo -e "    ${DIM}npm ci --dry-run...${NC}"
  npm ci --dry-run 2>/dev/null && pass "package-lock.json is in sync with package.json" || { fail "OUT OF SYNC — run full sync"; exit 1; }

  if [ -f "tsconfig.json" ]; then
    echo -e "    ${DIM}tsc --noEmit...${NC}"
    npx tsc --noEmit 2>/dev/null && pass "TypeScript compiles clean" || warn "TypeScript has errors (may be pre-existing)"
    grep -q '"baseUrl"' tsconfig.json 2>/dev/null && warn "tsconfig still has deprecated 'baseUrl' — remove it (bundler resolution doesn't need it)"
  fi

  # Secret safety — the most important check for AuraCart
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
      fail ".env.local is TRACKED by git — your secret keys may be exposed. Untrack it now."
    else
      pass ".env.local is not tracked by git"
    fi
  fi

  # Binary archives should never be committed
  ARCHIVES=$(find . -maxdepth 3 \( -name "*.7z" -o -name "*.zip" -o -name "*.tar.gz" -o -name "*.rar" \) -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | wc -l)
  [ "$ARCHIVES" -eq 0 ] && pass "No binary archives found (clean)" || warn "$ARCHIVES binary archive(s) found — run full sync to remove"

  echo ""; echo -e "${GREEN}${BOLD}  Verification complete${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"; exit 0
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: STOP DEV SERVER
# ═══════════════════════════════════════════════════════════════════════════════
check "Stopping any running dev server on port 3000..."
if command -v lsof >/dev/null 2>&1 && lsof -i :3000 >/dev/null 2>&1; then
  kill "$(lsof -t -i :3000)" 2>/dev/null || true
  pass "Stopped process on port 3000"
else
  pass "Port 3000 is free"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: WIPE CACHES & GENERATED FILES  (only what AuraCart actually produces)
# ═══════════════════════════════════════════════════════════════════════════════
check "Removing cached/generated files..."

ITEMS_TO_DELETE=(
  "node_modules"            # installed packages
  "package-lock.json"       # lock file (regenerated)
  ".next"                   # Next.js build output
  ".eslintcache"            # ESLint cache
  ".tsbuildinfo"            # TypeScript incremental build
  "tsconfig.tsbuildinfo"    # TypeScript incremental build (alt name)
  "next-env.d.ts"           # regenerated by Next on next run
)

# Delete binary archives that must never be committed (they bloat git history forever)
ARCHIVES_FOUND=0
for ext in "*.7z" "*.zip" "*.tar.gz" "*.tar.bz2" "*.rar"; do
  while IFS= read -r -d '' archive; do
    rm -f "$archive"; pass "Deleted archive: $archive"; ARCHIVES_FOUND=$((ARCHIVES_FOUND + 1))
  done < <(find . -maxdepth 3 -name "$ext" -not -path "./node_modules/*" -not -path "./.git/*" -print0 2>/dev/null)
done
[ "$ARCHIVES_FOUND" -eq 0 ] && pass "No archives found (clean)" || pass "Removed $ARCHIVES_FOUND archive(s)"

if [ "$QUICK" = true ]; then
  ITEMS_TO_DELETE=("node_modules" "package-lock.json")
  warn "Quick mode — removing only node_modules + package-lock.json"
fi

for item in "${ITEMS_TO_DELETE[@]}"; do
  if [ -e "$item" ]; then rm -rf "$item"; pass "Removed $item"; else echo -e "    ${DIM}· $item (not present)${NC}"; fi
done

if [ "$QUICK" = false ]; then
  echo -e "    ${DIM}Clearing npm cache...${NC}"
  npm cache clean --force 2>/dev/null || true
  pass "npm cache cleared"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: FRESH INSTALL
# ═══════════════════════════════════════════════════════════════════════════════
check "Installing packages from scratch (regenerates package-lock.json)..."
echo ""
npm install 2>&1 | tail -5
echo ""
[ -d "node_modules" ] || { fail "npm install FAILED — node_modules not created"; exit 1; }
[ -f "package-lock.json" ] || { fail "npm install FAILED — package-lock.json not created"; exit 1; }
PKG_COUNT=$(ls -1 node_modules | wc -l)
pass "Installed ($PKG_COUNT packages)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: VERIFY npm ci (what Vercel runs)
# ═══════════════════════════════════════════════════════════════════════════════
check "Verifying npm ci compatibility (the exact command Vercel uses)..."
npm ci --dry-run 2>&1 | tail -3 || {
  fail "npm ci --dry-run FAILED — Vercel build would fail"
  echo -e "    ${YELLOW}Try: rm package-lock.json && npm install${NC}"; exit 1
}
pass "npm ci will succeed on Vercel"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: VALIDATE CONFIG FILES  (AuraCart's real config set)
# ═══════════════════════════════════════════════════════════════════════════════
check "Validating AuraCart config files..."

# Next.js config present?
NEXT_CONFIG=""
for f in next.config.ts next.config.js next.config.mjs; do [ -f "$f" ] && NEXT_CONFIG="$f" && break; done
[ -n "$NEXT_CONFIG" ] && pass "$NEXT_CONFIG present" || warn "No next.config.* found"

# Other expected configs
for f in tailwind.config.ts postcss.config.mjs tsconfig.json; do
  [ -f "$f" ] && pass "$f present" || warn "$f not found"
done

# tsconfig: warn about the deprecated baseUrl (bundler resolution doesn't need it)
if [ -f "tsconfig.json" ] && grep -q '"baseUrl"' tsconfig.json 2>/dev/null; then
  warn "tsconfig.json still has deprecated 'baseUrl' — safe to remove (paths work without it)"
fi

# .env.local present locally (needed to run), and .env.example committed
[ -f ".env.local" ] && pass ".env.local present (local secrets)" || warn ".env.local not found — copy from .env.example and add your keys"
[ -f ".env.example" ] && pass ".env.example present" || warn ".env.example not found"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: SMOKE TEST  (type-check + build readiness)
# ═══════════════════════════════════════════════════════════════════════════════
check "Running smoke checks..."

echo -e "    ${DIM}tsc --noEmit (type-check)...${NC}"
npx tsc --noEmit 2>/dev/null && pass "TypeScript compiles clean" || warn "TypeScript has errors — run: npm run type-check"

echo -e "    ${DIM}next info...${NC}"
npx next info >/dev/null 2>&1 && pass "Next.js is functional" || warn "next info check failed (may be non-critical)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7: SIMULATE VERCEL BUILD  (optional, --ci-test)
# ═══════════════════════════════════════════════════════════════════════════════
if [ "$CI_TEST" = true ]; then
  check "Simulating the Vercel build (npm ci + next build)..."
  echo -e "    ${DIM}npm ci (clean install from lock file)...${NC}"
  rm -rf node_modules
  npm ci 2>&1 | tail -3; pass "npm ci succeeded"
  echo -e "    ${DIM}next build...${NC}"
  if npx next build 2>&1 | tail -10; then pass "next build succeeded"; else fail "next build FAILED — fix before pushing"; fi
  echo ""
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 8: SECRET & BINARY SAFETY  (never leak .env.local; never commit archives)
# ═══════════════════════════════════════════════════════════════════════════════
check "Safety checks (secrets + binaries)..."

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then

  # 8a. Delete stray archives from the working tree
  for ext in "*.7z" "*.zip" "*.tar.gz" "*.tar.bz2" "*.rar"; do
    while IFS= read -r -d '' a; do rm -f "$a"; warn "Deleted stray archive: $a"; done \
      < <(find . -maxdepth 3 -name "$ext" -not -path "./node_modules/*" -not -path "./.git/*" -print0 2>/dev/null)
  done

  # 8b. Un-stage anything sensitive that was accidentally git-added
  STAGED_BAD=$(git diff --cached --name-only 2>/dev/null | grep -E '(\.env\.local$|\.env\..*\.local$|\.(7z|zip|tar\.gz|tar\.bz2|rar)$)' || true)
  if [ -n "$STAGED_BAD" ]; then
    echo "$STAGED_BAD" | while read -r f; do git rm --cached "$f" 2>/dev/null || true; warn "Un-staged: $f"; done
  else
    pass "Nothing sensitive staged"
  fi

  # 8c. Ensure .gitignore blocks secrets, build output, and archives
  REQUIRED_RULES=("node_modules" ".next" ".env.local" ".env*.local" "*.7z" "*.zip" "*.tar.gz" "*.rar")
  if [ ! -f ".gitignore" ]; then
    printf "%s\n" "${REQUIRED_RULES[@]}" > .gitignore
    pass "Created .gitignore with the essential rules"
  else
    MISSING=()
    for rule in "${REQUIRED_RULES[@]}"; do grep -qF "$rule" .gitignore 2>/dev/null || MISSING+=("$rule"); done
    if [ ${#MISSING[@]} -gt 0 ]; then
      { echo ""; echo "# Added by sync-packages.sh"; printf "%s\n" "${MISSING[@]}"; } >> .gitignore
      pass "Added ${#MISSING[@]} rule(s) to .gitignore: ${MISSING[*]}"
    else
      pass ".gitignore already blocks secrets, build output, and archives"
    fi
  fi

  # 8d. Final check: .env.local must not be tracked
  if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
    fail ".env.local is TRACKED — run: git rm --cached .env.local  (then commit)"
  else
    pass ".env.local is not tracked (secrets safe)"
  fi
else
  echo -e "    ${DIM}Not a git repo — skip${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 9: GIT COMMIT INSTRUCTIONS
# ═══════════════════════════════════════════════════════════════════════════════
check "Git commit instructions..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
  CHANGED=$(git diff --name-only 2>/dev/null || true)
  FILES_TO_ADD="package.json package-lock.json"
  echo "$CHANGED" | grep -q ".gitignore" && FILES_TO_ADD="$FILES_TO_ADD .gitignore"
  echo -e "    ${BOLD}Run:${NC}"
  echo -e "    ${DIM}git add $FILES_TO_ADD${NC}"
  echo -e "    ${DIM}git commit -m \"chore: sync package-lock.json\"${NC}"
  echo -e "    ${DIM}git push origin $BRANCH${NC}"
else
  echo -e "    ${DIM}Not a git repo — skip${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  ✓ SYNC COMPLETE${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}What was done:${NC}"
echo -e "    1. Wiped node_modules, .next, caches, and the old lock file"
echo -e "    2. Deleted any binary archives (never commit these)"
echo -e "    3. Fresh npm install → new package-lock.json"
echo -e "    4. Verified npm ci works (what Vercel runs)"
echo -e "    5. Validated AuraCart config files"
echo -e "    6. Ensured .gitignore blocks .env.local, build output, and archives"
echo ""
echo -e "  ${BOLD}Then test locally:${NC}"
echo -e "    ${DIM}npm run dev${NC}         → http://localhost:3000"
echo -e "    ${DIM}npm run type-check${NC}  → TypeScript check (no errors expected)"
echo -e "    ${DIM}npm run lint${NC}        → ESLint"
echo -e "    ${DIM}npm run build${NC}       → production build (what Vercel runs)"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
