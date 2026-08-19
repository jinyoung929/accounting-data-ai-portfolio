#!/bin/bash
#
# mac-cleanup.sh - macOS 파일 정리 도우미
#
# 기본 동작은 "보고서만 출력"(dry-run)입니다. 아무것도 지우거나 옮기지 않습니다.
# --apply 를 줘야만 실제로 움직이고, 그 경우에도 기본은 삭제가 아니라
# 격리 폴더(quarantine)로 이동 + 복구 스크립트 생성입니다.
#
# macOS 기본 /bin/bash(3.2) 및 GNU bash 모두에서 동작하도록 작성했습니다.
#
# 사용법은 --help 참고.

set -u

VERSION="1.0.0"

TAB=$'\t'
NL=$'\n'

# ---------------------------------------------------------------------------
# 기본 설정
# ---------------------------------------------------------------------------

APPLY=0                  # 1이면 실제 실행
ASSUME_YES=0             # 1이면 확인 프롬프트 생략
MODE="quarantine"        # quarantine | trash | delete
DAYS_DOWNLOADS=180       # 이 일수보다 오래된 다운로드를 정리 대상으로
DAYS_INSTALLER=30        # 이 일수보다 오래된 설치 파일(dmg/pkg/iso)
DAYS_CACHE=30            # 이 일수보다 손대지 않은 개발 캐시
DAYS_TRASH=30            # 휴지통에 이 일수 이상 있던 항목
MIN_DUPE_BYTES=$((1024 * 1024))   # 중복 검사 최소 크기 (1MB)
TOP_LARGE=40             # 큰 파일 상위 N개 표시
CATEGORIES=""            # --apply 시 실제로 처리할 카테고리 (콤마 구분)
ROOTS=""                 # 사용자가 지정한 스캔 루트

BASE_DIR="$HOME/.mac-cleanup"

# 스캔 대상 기본 루트
DEFAULT_ROOTS="$HOME/Downloads
$HOME/Desktop
$HOME/Documents
$HOME/Movies"

# 통째로 건너뛸 디렉터리/번들 이름 (내부로 내려가지 않음)
PRUNE_NAMES=(
  '.git' '.svn' '.hg'
  '.Trash' 'Library'
  '*.app' '*.bundle' '*.framework' '*.dSYM' '*.xcodeproj' '*.xcworkspace'
  '*.photoslibrary' '*.musiclibrary' '*.tvlibrary' '*.imovielibrary'
  '*.fcpbundle' '*.aplibrary' '*.theater' '*.lrdata' '*.lrcat-data'
  '*.rtfd' '*.sparsebundle' '*.sparseimage' '*.download'
)

# 어떤 경우에도 손대지 않을 경로 (접두사 일치)
PROTECTED_PREFIXES=(
  "$BASE_DIR"
  "$HOME/.ssh"
  "$HOME/.gnupg"
  "$HOME/.aws"
  "$HOME/.kube"
  "$HOME/.config"
  "$HOME/Library/Keychains"
  "$HOME/Library/Mobile Documents"
  "$HOME/Library/Containers"
  "$HOME/Library/Group Containers"
  "$HOME/Library/Application Support"
  "$HOME/Library/Preferences"
  "$HOME/Applications"
)

# 개발 캐시로 취급할 고정 경로 (존재할 때만)
CACHE_PATHS=(
  "$HOME/Library/Developer/Xcode/DerivedData"
  "$HOME/Library/Developer/Xcode/Archives"
  "$HOME/Library/Developer/CoreSimulator/Caches"
  "$HOME/Library/Caches/Homebrew"
  "$HOME/Library/Caches/pip"
  "$HOME/Library/Caches/Yarn"
  "$HOME/Library/Caches/ms-playwright"
  "$HOME/.npm/_cacache"
  "$HOME/.cache/pip"
  "$HOME/.cache/pnpm"
  "$HOME/.gradle/caches"
  "$HOME/.cargo/registry/cache"
)

# 프로젝트 안에서 재생성 가능한 디렉터리 이름
REGENERABLE_DIRS=( 'node_modules' '__pycache__' '.pytest_cache' '.mypy_cache' '.ruff_cache' '.turbo' )

# ---------------------------------------------------------------------------
# 인자 파싱
# ---------------------------------------------------------------------------

usage() {
  cat <<'EOF'
mac-cleanup.sh - macOS 파일 정리 도우미

  기본은 dry-run 입니다. 보고서만 출력하고 아무 파일도 건드리지 않습니다.

사용법:
  ./mac-cleanup.sh                              # 스캔 후 보고서만 출력
  ./mac-cleanup.sh --apply --only junk          # 확인 후 junk 카테고리만 정리
  ./mac-cleanup.sh --apply --only junk,downloads --mode trash

옵션:
  --apply                 실제로 정리를 수행 (기본: dry-run)
  --only CAT[,CAT...]     --apply 시 처리할 카테고리. 미지정 시 아무것도 안 함.
                          카테고리: junk, empty, downloads, installers,
                                    caches, projects, dupes, trash
  --mode MODE             quarantine(기본) | trash | delete
                            quarantine : ~/.mac-cleanup/quarantine 로 이동 + 복구 스크립트
                            trash      : macOS 휴지통으로 이동
                            delete     : 즉시 영구 삭제 (되돌릴 수 없음)
  --roots PATH[,PATH...]  스캔할 최상위 폴더 목록 (기본: Downloads, Desktop,
                          Documents, Movies)
  --days-downloads N      오래된 다운로드 기준 일수 (기본 180)
  --days-installers N     오래된 설치 파일 기준 일수 (기본 30)
  --days-caches N         미사용 캐시 기준 일수 (기본 30)
  --days-trash N          휴지통 항목 기준 일수 (기본 30)
  --min-dupe-size BYTES   중복 검사 최소 파일 크기 (기본 1048576)
  --top N                 큰 파일 상위 N개 표시 (기본 40)
  -y, --yes               확인 프롬프트 생략
  -h, --help              이 도움말
  --version               버전 출력

카테고리 설명:
  junk        .DS_Store, ._AppleDouble, Thumbs.db, 받다 만 파일(.crdownload/.part)
  empty       빈 디렉터리
  downloads   ~/Downloads 에서 N일 이상 손대지 않은 파일
  installers  오래된 .dmg / .pkg / .iso 설치 파일
  caches      Xcode DerivedData, Homebrew/pip/npm 캐시 등 (재생성 가능)
  projects    프로젝트 안의 node_modules, __pycache__ 등 (재생성 가능)
  dupes       내용이 완전히 같은 중복 파일 (가장 오래된 하나만 남김)
  trash       휴지통에 오래 있던 항목 (이 카테고리는 항상 영구 삭제)
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --apply)            APPLY=1 ;;
    --only)             CATEGORIES="${2:-}"; shift ;;
    --only=*)           CATEGORIES="${1#*=}" ;;
    --mode)             MODE="${2:-}"; shift ;;
    --mode=*)           MODE="${1#*=}" ;;
    --roots)            ROOTS="${2:-}"; shift ;;
    --roots=*)          ROOTS="${1#*=}" ;;
    --days-downloads)   DAYS_DOWNLOADS="${2:-}"; shift ;;
    --days-installers)  DAYS_INSTALLER="${2:-}"; shift ;;
    --days-caches)      DAYS_CACHE="${2:-}"; shift ;;
    --days-trash)       DAYS_TRASH="${2:-}"; shift ;;
    --min-dupe-size)    MIN_DUPE_BYTES="${2:-}"; shift ;;
    --top)              TOP_LARGE="${2:-}"; shift ;;
    -y|--yes)           ASSUME_YES=1 ;;
    -h|--help)          usage; exit 0 ;;
    --version)          echo "mac-cleanup.sh $VERSION"; exit 0 ;;
    *) echo "알 수 없는 옵션: $1" >&2; echo "--help 를 참고하세요." >&2; exit 2 ;;
  esac
  shift
done

case "$MODE" in
  quarantine|trash|delete) ;;
  *) echo "--mode 는 quarantine, trash, delete 중 하나여야 합니다 (받은 값: $MODE)" >&2; exit 2 ;;
esac

check_number() {  # $1=플래그명 $2=값
  case "$2" in
    ''|*[!0-9]*) echo "$1 값은 0 이상의 정수여야 합니다 (받은 값: $2)" >&2; exit 2 ;;
  esac
}
check_number --days-downloads  "$DAYS_DOWNLOADS"
check_number --days-installers "$DAYS_INSTALLER"
check_number --days-caches     "$DAYS_CACHE"
check_number --days-trash      "$DAYS_TRASH"
check_number --min-dupe-size   "$MIN_DUPE_BYTES"
check_number --top             "$TOP_LARGE"

# 카테고리 이름은 오래 걸리는 스캔을 시작하기 전에 검증한다
VALID_CATEGORIES="junk empty downloads installers caches projects dupes trash"
if [ -n "$CATEGORIES" ]; then
  OLDIFS=$IFS; IFS=','
  for c in $CATEGORIES; do
    IFS=$OLDIFS
    c=$(printf '%s' "$c" | sed -e 's/^ *//' -e 's/ *$//')
    if [ -n "$c" ]; then
      case " $VALID_CATEGORIES " in
        *" $c "*) ;;
        *) echo "알 수 없는 카테고리: $c" >&2
           echo "사용 가능: $VALID_CATEGORIES" >&2
           exit 2 ;;
      esac
    fi
    IFS=','
  done
  IFS=$OLDIFS
fi

if [ -n "$CATEGORIES" ] && [ "$APPLY" -eq 0 ]; then
  echo "참고: --only 는 --apply 와 함께 쓸 때만 의미가 있습니다. 지금은 dry-run 으로 전체 보고서만 출력합니다." >&2
  echo
fi

# ---------------------------------------------------------------------------
# 플랫폼 호환 헬퍼 (macOS = BSD, Linux = GNU)
# ---------------------------------------------------------------------------

if stat -f%z / >/dev/null 2>&1; then
  STAT_FLAVOR="bsd"
else
  STAT_FLAVOR="gnu"
fi

fsize() {  # 파일 크기(바이트). 실패 시 0
  if [ "$STAT_FLAVOR" = "bsd" ]; then
    stat -f%z "$1" 2>/dev/null || echo 0
  else
    stat -c%s "$1" 2>/dev/null || echo 0
  fi
}

fmtime() {  # 수정 시각(epoch). 실패 시 0
  if [ "$STAT_FLAVOR" = "bsd" ]; then
    stat -f%m "$1" 2>/dev/null || echo 0
  else
    stat -c%Y "$1" 2>/dev/null || echo 0
  fi
}

dirsize() {  # 디렉터리 크기(바이트)
  local kb
  kb=$(du -sk "$1" 2>/dev/null | awk 'NR==1{print $1}')
  [ -n "${kb:-}" ] || kb=0
  echo $((kb * 1024))
}

if command -v shasum >/dev/null 2>&1; then
  hash_file() { shasum -a 256 "$1" 2>/dev/null | awk 'NR==1{print $1}'; }
elif command -v sha256sum >/dev/null 2>&1; then
  hash_file() { sha256sum "$1" 2>/dev/null | awk 'NR==1{print $1}'; }
else
  hash_file() { echo ""; }
fi

human() {  # 바이트 -> 사람이 읽는 크기
  local b=${1:-0}
  case "$b" in ''|*[!0-9]*) b=0 ;; esac
  if   [ "$b" -ge 1073741824 ]; then printf '%d.%01d GB' $((b / 1073741824)) $(( (b % 1073741824) * 10 / 1073741824 ))
  elif [ "$b" -ge 1048576 ];    then printf '%d.%01d MB' $((b / 1048576))    $(( (b % 1048576)    * 10 / 1048576 ))
  elif [ "$b" -ge 1024 ];       then printf '%d.%01d KB' $((b / 1024))       $(( (b % 1024)       * 10 / 1024 ))
  else                               printf '%d B' "$b"
  fi
}

# ---------------------------------------------------------------------------
# 작업 디렉터리
# ---------------------------------------------------------------------------

TS=$(date +%Y%m%d-%H%M%S)
WORK="$BASE_DIR/reports/$TS"
QUAR="$BASE_DIR/quarantine/$TS"
mkdir -p "$WORK" || { echo "작업 폴더를 만들 수 없습니다: $WORK" >&2; exit 1; }

TMP="$WORK/tmp"
mkdir -p "$TMP"

# ---------------------------------------------------------------------------
# 스캔 루트 결정
# ---------------------------------------------------------------------------

SCAN_ROOTS=()
if [ -n "$ROOTS" ]; then
  OLDIFS=$IFS; IFS=','
  for r in $ROOTS; do
    IFS=$OLDIFS
    # 앞뒤 공백 제거
    r=$(printf '%s' "$r" | sed -e 's/^ *//' -e 's/ *$//')
    [ -n "$r" ] || continue
    case "$r" in "~"/*) r="$HOME/${r#~/}" ;; "~") r="$HOME" ;; esac
    if [ -d "$r" ]; then
      SCAN_ROOTS+=( "$r" )
    else
      echo "경고: 폴더가 없어 건너뜁니다 - $r" >&2
    fi
    IFS=','
  done
  IFS=$OLDIFS
else
  while IFS= read -r r; do
    [ -n "$r" ] || continue
    [ -d "$r" ] && SCAN_ROOTS+=( "$r" )
  done <<EOF
$DEFAULT_ROOTS
EOF
fi

if [ ${#SCAN_ROOTS[@]} -eq 0 ]; then
  echo "스캔할 폴더가 없습니다. --roots 로 지정해 주세요." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# find 용 prune 표현식
# ---------------------------------------------------------------------------

PRUNE_EXPR=( '(' )
_first=1
for n in "${PRUNE_NAMES[@]}"; do
  if [ $_first -eq 1 ]; then _first=0; else PRUNE_EXPR+=( -o ); fi
  PRUNE_EXPR+=( -name "$n" )
done
PRUNE_EXPR+=( ')' -prune )

# ---------------------------------------------------------------------------
# 안전 장치
# ---------------------------------------------------------------------------

SKIPPED_UNSAFE=0

is_protected() {
  local p="$1" pre

  # 홈 디렉터리 밖은 절대 손대지 않는다
  case "$p" in
    "$HOME"/*) ;;
    *) return 0 ;;
  esac

  # 스캔 루트 자체는 대상이 아니다
  local root
  for root in "${SCAN_ROOTS[@]}"; do
    [ "$p" = "$root" ] && return 0
  done
  [ "$p" = "$HOME" ] && return 0

  # 보호 경로
  for pre in "${PROTECTED_PREFIXES[@]}"; do
    case "$p" in
      "$pre"|"$pre"/*) return 0 ;;
    esac
  done

  # 심볼릭 링크는 건드리지 않는다
  [ -L "$p" ] && return 0

  # iCloud 미다운로드 스텁
  case "$p" in
    *.icloud) return 0 ;;
  esac

  return 1
}

# 경로에 탭이나 개행이 있으면 목록 파일(TSV) 형식이 깨지므로 제외한다
path_is_listable() {
  case "$1" in
    *"$TAB"*|*"$NL"*) return 1 ;;
    *) return 0 ;;
  esac
}

# 목록 파일에 한 줄 추가: "<bytes>\t<path>"
add_entry() {
  local list="$1" path="$2" size="$3"
  if is_protected "$path" || ! path_is_listable "$path"; then
    SKIPPED_UNSAFE=$((SKIPPED_UNSAFE + 1))
    return
  fi
  printf '%s\t%s\n' "$size" "$path" >> "$list"
}

list_bytes() {  # 목록 파일의 총 바이트
  [ -s "$1" ] || { echo 0; return; }
  awk -F'\t' '{s+=$1} END{printf "%.0f", s+0}' "$1"
}

list_count() {
  [ -s "$1" ] || { echo 0; return; }
  wc -l < "$1" | tr -d ' '
}

# ---------------------------------------------------------------------------
# 스캔
# ---------------------------------------------------------------------------

echo "mac-cleanup.sh $VERSION"
echo "스캔 중... (파일이 많으면 몇 분 걸릴 수 있습니다)"
echo

L_JUNK="$WORK/junk.list"
L_EMPTY="$WORK/empty.list"
L_DOWNLOADS="$WORK/downloads.list"
L_INSTALLERS="$WORK/installers.list"
L_CACHES="$WORK/caches.list"
L_PROJECTS="$WORK/projects.list"
L_DUPES="$WORK/dupes.list"
L_TRASH="$WORK/trash.list"
L_LARGE="$WORK/large.list"      # 보고 전용
: > "$L_JUNK"; : > "$L_EMPTY"; : > "$L_DOWNLOADS"; : > "$L_INSTALLERS"
: > "$L_CACHES"; : > "$L_PROJECTS"; : > "$L_DUPES"; : > "$L_TRASH"; : > "$L_LARGE"

ALL_FILES="$TMP/all-files.tsv"
: > "$ALL_FILES"

# --- 1) 전체 파일 인벤토리 ------------------------------------------------
# 파일 하나마다 stat 프로세스를 띄우면 너무 느리므로 한 번에 묶어서 처리한다.
inventory_root() {
  local root="$1"
  if [ "$STAT_FLAVOR" = "bsd" ]; then
    find "$root" "${PRUNE_EXPR[@]}" -o -type f ! -name '*.icloud' \
      -exec stat -f "%z${TAB}%N" {} + 2>/dev/null
  else
    find "$root" "${PRUNE_EXPR[@]}" -o -type f ! -name '*.icloud' \
      -printf "%s${TAB}%p${NL}" 2>/dev/null
  fi
}

for root in "${SCAN_ROOTS[@]}"; do
  echo "  스캔: $root"
  # 개행이 든 경로는 TSV 를 깨뜨리므로 "숫자<TAB>/..." 형태만 남긴다
  inventory_root "$root" | grep -E "^[0-9]+${TAB}/" >> "$ALL_FILES"
done
echo

# --- 2) junk ---------------------------------------------------------------
for root in "${SCAN_ROOTS[@]}"; do
  while IFS= read -r -d '' f; do
    [ -L "$f" ] && continue
    add_entry "$L_JUNK" "$f" "$(fsize "$f")"
  done < <(find "$root" "${PRUNE_EXPR[@]}" -o -type f \( \
             -name '.DS_Store' -o -name '._*' -o -name 'Thumbs.db' -o \
             -name '*.crdownload' -o -name '*.part' -o -name '*.partial' \
           \) -print0 2>/dev/null)
done

# --- 3) 빈 디렉터리 --------------------------------------------------------
for root in "${SCAN_ROOTS[@]}"; do
  while IFS= read -r -d '' d; do
    [ "$d" = "$root" ] && continue
    add_entry "$L_EMPTY" "$d" 0
  done < <(find "$root" "${PRUNE_EXPR[@]}" -o -type d -empty -print0 2>/dev/null)
done

# --- 4) 오래된 다운로드 ----------------------------------------------------
if [ -d "$HOME/Downloads" ]; then
  while IFS= read -r -d '' f; do
    [ -L "$f" ] && continue
    case "$f" in *.icloud) continue ;; esac
    add_entry "$L_DOWNLOADS" "$f" "$(fsize "$f")"
  done < <(find "$HOME/Downloads" "${PRUNE_EXPR[@]}" -o -type f -mtime "+$DAYS_DOWNLOADS" -print0 2>/dev/null)
fi

# --- 5) 오래된 설치 파일 ---------------------------------------------------
for root in "${SCAN_ROOTS[@]}"; do
  while IFS= read -r -d '' f; do
    [ -L "$f" ] && continue
    add_entry "$L_INSTALLERS" "$f" "$(fsize "$f")"
  done < <(find "$root" "${PRUNE_EXPR[@]}" -o -type f \( \
             -name '*.dmg' -o -name '*.pkg' -o -name '*.iso' -o -name '*.mpkg' \
           \) -mtime "+$DAYS_INSTALLER" -print0 2>/dev/null)
done

# --- 6) 개발 캐시 (고정 경로) ---------------------------------------------
for c in "${CACHE_PATHS[@]}"; do
  [ -d "$c" ] || continue
  [ -L "$c" ] && continue
  # DerivedData / Archives 는 하위 항목 단위로, 나머지는 통째로
  case "$c" in
    */DerivedData|*/Archives)
      while IFS= read -r -d '' d; do
        [ -L "$d" ] && continue
        if [ -n "$(find "$d" -maxdepth 0 -mtime "+$DAYS_CACHE" -print 2>/dev/null)" ]; then
          add_entry "$L_CACHES" "$d" "$(dirsize "$d")"
        fi
      done < <(find "$c" -mindepth 1 -maxdepth 1 -print0 2>/dev/null)
      ;;
    *)
      add_entry "$L_CACHES" "$c" "$(dirsize "$c")"
      ;;
  esac
done

# --- 7) 프로젝트 재생성 가능 디렉터리 -------------------------------------
for root in "${SCAN_ROOTS[@]}"; do
  for name in "${REGENERABLE_DIRS[@]}"; do
    while IFS= read -r -d '' d; do
      [ -L "$d" ] && continue
      # 다른 재생성 디렉터리 안에 중첩된 건 부모만 다루면 되므로 제외
      case "$d" in
        */node_modules/*) continue ;;
      esac
      if [ -n "$(find "$d" -maxdepth 0 -mtime "+$DAYS_CACHE" -print 2>/dev/null)" ]; then
        add_entry "$L_PROJECTS" "$d" "$(dirsize "$d")"
      fi
    done < <(find "$root" "${PRUNE_EXPR[@]}" -o -type d -name "$name" -print0 2>/dev/null)
  done
done

# --- 8) 휴지통 -------------------------------------------------------------
if [ -d "$HOME/.Trash" ]; then
  while IFS= read -r -d '' p; do
    [ -L "$p" ] && continue
    path_is_listable "$p" || continue
    if [ -d "$p" ]; then sz=$(dirsize "$p"); else sz=$(fsize "$p"); fi
    printf '%s\t%s\n' "$sz" "$p" >> "$L_TRASH"
  done < <(find "$HOME/.Trash" -mindepth 1 -maxdepth 1 -mtime "+$DAYS_TRASH" -print0 2>/dev/null)
fi

# --- 9) 큰 파일 (보고 전용) ------------------------------------------------
if [ -s "$ALL_FILES" ]; then
  sort -t"$TAB" -k1,1nr "$ALL_FILES" 2>/dev/null | head -n "$TOP_LARGE" > "$L_LARGE"
fi

# --- 10) 중복 파일 ---------------------------------------------------------
# 같은 크기끼리 묶은 뒤, 2개 이상인 그룹만 해시한다.
DUPE_CAND="$TMP/dupe-candidates.tsv"
: > "$DUPE_CAND"
if [ -s "$ALL_FILES" ]; then
  awk -F'\t' -v min="$MIN_DUPE_BYTES" '$1 >= min' "$ALL_FILES" \
    | grep -v '/node_modules/' \
    | sort -t"$TAB" -k1,1n > "$TMP/by-size.tsv"

  awk -F'\t' '
    { if ($1 == prevsize) { if (!printed) { print prevline; printed = 1 } print $0 }
      else { prevsize = $1; printed = 0 }
      prevline = $0 }
  ' "$TMP/by-size.tsv" > "$DUPE_CAND"
fi

if [ -s "$DUPE_CAND" ]; then
  ncand=$(wc -l < "$DUPE_CAND" | tr -d ' ')
  echo "  중복 검사: 후보 ${ncand}개 해시 계산 중..."
  HASHED="$TMP/hashed.tsv"
  : > "$HASHED"
  while IFS="$TAB" read -r sz path; do
    [ -n "${path:-}" ] || continue
    [ -r "$path" ] || continue
    h=$(hash_file "$path")
    [ -n "$h" ] || continue
    printf '%s\t%s\t%s\t%s\n' "$h" "$(fmtime "$path")" "$sz" "$path" >> "$HASHED"
  done < "$DUPE_CAND"

  # 해시별로 정렬 후, 각 그룹에서 가장 오래된(mtime 작은) 파일 1개만 남기고 나머지를 목록에
  if [ -s "$HASHED" ]; then
    sort -t"$TAB" -k1,1 -k2,2n "$HASHED" | awk -F'\t' '
      { if ($1 == prev) { printf "%s\t%s\n", $3, $4 } else { prev = $1 } }
    ' > "$TMP/dupes-raw.tsv"

    while IFS="$TAB" read -r sz path; do
      [ -n "${path:-}" ] || continue
      add_entry "$L_DUPES" "$path" "$sz"
    done < "$TMP/dupes-raw.tsv"
  fi
  echo
fi

# ---------------------------------------------------------------------------
# 보고서 출력
# ---------------------------------------------------------------------------

TOTAL_RECLAIM=0

print_section() {
  local title="$1" list="$2" cat="$3" preview="${4:-10}"
  local cnt bytes
  cnt=$(list_count "$list")
  bytes=$(list_bytes "$list")
  printf '── %s  [%s]\n' "$title" "$cat"
  if [ "$cnt" -eq 0 ]; then
    printf '   해당 없음\n\n'
    return
  fi
  printf '   %s개, 약 %s\n' "$cnt" "$(human "$bytes")"
  sort -t"$TAB" -k1,1nr "$list" | head -n "$preview" | \
    while IFS="$TAB" read -r sz p; do
      printf '     %10s  %s\n' "$(human "$sz")" "${p#$HOME/}"
    done
  if [ "$cnt" -gt "$preview" ]; then
    printf '     ... 외 %s개 (전체 목록: %s)\n' "$((cnt - preview))" "$list"
  fi
  printf '\n'
}

echo "════════════════════════════════════════════════════════════════"
echo " 정리 보고서   $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════════════════════════════"
echo
echo "디스크 현황:"
df -h / 2>/dev/null | sed 's/^/  /'
echo
echo "스캔 대상:"
for root in "${SCAN_ROOTS[@]}"; do echo "  - $root"; done
echo "  총 파일 수: $(list_count "$ALL_FILES")개, $(human "$(list_bytes "$ALL_FILES")")"
echo

print_section "정리 가능한 잡파일 (.DS_Store, 받다 만 파일 등)" "$L_JUNK" "junk" 5
print_section "빈 디렉터리" "$L_EMPTY" "empty" 5
print_section "${DAYS_DOWNLOADS}일 이상 손대지 않은 다운로드" "$L_DOWNLOADS" "downloads" 15
print_section "${DAYS_INSTALLER}일 이상 지난 설치 파일 (dmg/pkg/iso)" "$L_INSTALLERS" "installers" 10
print_section "개발 캐시 (재생성 가능)" "$L_CACHES" "caches" 10
print_section "프로젝트 내 재생성 가능 폴더 (node_modules 등)" "$L_PROJECTS" "projects" 10
print_section "중복 파일 (가장 오래된 1개는 남김)" "$L_DUPES" "dupes" 10
print_section "${DAYS_TRASH}일 이상 휴지통에 있던 항목" "$L_TRASH" "trash" 5

for l in "$L_JUNK" "$L_EMPTY" "$L_DOWNLOADS" "$L_INSTALLERS" "$L_CACHES" "$L_PROJECTS" "$L_DUPES" "$L_TRASH"; do
  TOTAL_RECLAIM=$((TOTAL_RECLAIM + $(list_bytes "$l")))
done

echo "── 큰 파일 상위 ${TOP_LARGE}개 (참고용, 자동 정리 대상 아님)"
if [ -s "$L_LARGE" ]; then
  while IFS="$TAB" read -r sz p; do
    printf '     %10s  %s\n' "$(human "$sz")" "${p#$HOME/}"
  done < "$L_LARGE"
else
  echo "     해당 없음"
fi
echo

echo "════════════════════════════════════════════════════════════════"
echo " 확보 가능 용량 (중복 계산 가능성 있음): $(human "$TOTAL_RECLAIM")"
[ "$SKIPPED_UNSAFE" -gt 0 ] && echo " 안전상 제외한 항목: ${SKIPPED_UNSAFE}개"
echo " 전체 목록 파일: $WORK"
echo "════════════════════════════════════════════════════════════════"
echo

# ---------------------------------------------------------------------------
# 실행 (--apply)
# ---------------------------------------------------------------------------

if [ "$APPLY" -eq 0 ]; then
  cat <<EOF
지금은 dry-run 이라 아무것도 변경하지 않았습니다.

위 목록을 확인한 뒤, 원하는 카테고리만 골라 실행하세요:

  $0 --apply --only junk,empty
  $0 --apply --only caches,projects
  $0 --apply --only downloads --mode trash

기본 --mode quarantine 은 삭제가 아니라 $BASE_DIR/quarantine 으로 옮기고
복구 스크립트를 함께 만들어 둡니다. 며칠 써 보고 문제 없으면 그때 지우세요.
EOF
  exit 0
fi

if [ -z "$CATEGORIES" ]; then
  echo "--apply 를 주셨지만 --only 로 카테고리를 지정하지 않았습니다." >&2
  echo "안전을 위해 아무 작업도 하지 않고 종료합니다. 예: --only junk,empty" >&2
  exit 2
fi

# 선택된 카테고리를 목록 파일로 변환
SELECTED_LISTS=()
SELECTED_NAMES=()
OLDIFS=$IFS; IFS=','
for c in $CATEGORIES; do
  IFS=$OLDIFS
  c=$(printf '%s' "$c" | sed -e 's/^ *//' -e 's/ *$//')
  [ -n "$c" ] || { IFS=','; continue; }
  case "$c" in
    junk)       SELECTED_LISTS+=( "$L_JUNK" );       SELECTED_NAMES+=( junk ) ;;
    empty)      SELECTED_LISTS+=( "$L_EMPTY" );      SELECTED_NAMES+=( empty ) ;;
    downloads)  SELECTED_LISTS+=( "$L_DOWNLOADS" );  SELECTED_NAMES+=( downloads ) ;;
    installers) SELECTED_LISTS+=( "$L_INSTALLERS" ); SELECTED_NAMES+=( installers ) ;;
    caches)     SELECTED_LISTS+=( "$L_CACHES" );     SELECTED_NAMES+=( caches ) ;;
    projects)   SELECTED_LISTS+=( "$L_PROJECTS" );   SELECTED_NAMES+=( projects ) ;;
    dupes)      SELECTED_LISTS+=( "$L_DUPES" );      SELECTED_NAMES+=( dupes ) ;;
    trash)      SELECTED_LISTS+=( "$L_TRASH" );      SELECTED_NAMES+=( trash ) ;;
    *) echo "알 수 없는 카테고리: $c" >&2; exit 2 ;;
  esac
  IFS=','
done
IFS=$OLDIFS

# 실행 대상 취합 (중복 경로 제거)
TARGETS="$TMP/targets.tsv"
: > "$TARGETS"
i=0
while [ $i -lt ${#SELECTED_LISTS[@]} ]; do
  cat "${SELECTED_LISTS[$i]}" >> "$TARGETS"
  i=$((i + 1))
done
sort -u "$TARGETS" -o "$TARGETS"

TARGET_COUNT=$(list_count "$TARGETS")
TARGET_BYTES=$(list_bytes "$TARGETS")

if [ "$TARGET_COUNT" -eq 0 ]; then
  echo "선택한 카테고리에 처리할 항목이 없습니다."
  exit 0
fi

echo "실행 계획"
echo "  카테고리 : ${SELECTED_NAMES[*]}"
echo "  항목 수  : $TARGET_COUNT"
echo "  용량     : $(human "$TARGET_BYTES")"
case "$MODE" in
  quarantine) echo "  방식     : $QUAR 로 이동 (복구 가능)" ;;
  trash)      echo "  방식     : macOS 휴지통으로 이동 (복구 가능)" ;;
  delete)     echo "  방식     : 영구 삭제 (복구 불가)" ;;
esac
# trash 카테고리는 이미 휴지통 안이므로 항상 영구 삭제
for n in "${SELECTED_NAMES[@]}"; do
  [ "$n" = "trash" ] && echo "  주의     : 'trash' 카테고리는 휴지통 비우기이므로 항상 영구 삭제됩니다."
done
echo

if [ "$ASSUME_YES" -eq 0 ]; then
  # 되돌릴 수 없는 작업은 더 강한 확인을 요구한다
  confirm_word="yes"
  case "$MODE" in delete) confirm_word="DELETE" ;; esac
  for n in "${SELECTED_NAMES[@]}"; do
    [ "$n" = "trash" ] && confirm_word="DELETE"
  done

  printf '진행할까요? (%s 를 정확히 입력해야 진행됩니다) > ' "$confirm_word"
  read -r answer
  if [ "$answer" != "$confirm_word" ]; then
    echo "취소했습니다. 아무것도 변경하지 않았습니다."
    exit 0
  fi
  echo
fi

MANIFEST="$WORK/manifest.tsv"
: > "$MANIFEST"
[ "$MODE" = "quarantine" ] && mkdir -p "$QUAR"

OK=0
FAIL=0
FREED=0

move_to_trash() {  # macOS 휴지통으로 이동
  local p="$1"
  if [ "$STAT_FLAVOR" != "bsd" ] || ! command -v osascript >/dev/null 2>&1; then
    return 1
  fi
  osascript -e 'on run argv' \
            -e 'tell application "Finder" to delete (POSIX file (item 1 of argv) as alias)' \
            -e 'end run' "$p" >/dev/null 2>&1
}

while IFS="$TAB" read -r sz path; do
  [ -n "${path:-}" ] || continue
  [ -e "$path" ] || continue

  # 실행 직전에 안전 검사를 한 번 더
  if is_protected "$path"; then
    echo "  건너뜀(보호됨): $path" >&2
    FAIL=$((FAIL + 1))
    continue
  fi

  # 휴지통 안의 항목은 이미 "버린" 것이므로 옮겨봐야 용량이 확보되지 않는다.
  # 모드와 관계없이 실제로 비운다.
  item_mode="$MODE"
  case "$path" in
    "$HOME/.Trash/"*) item_mode="delete" ;;
  esac

  case "$item_mode" in
    quarantine)
      rel="${path#$HOME/}"
      dest="$QUAR/$rel"
      mkdir -p "$(dirname "$dest")" 2>/dev/null
      if mv "$path" "$dest" 2>/dev/null; then
        printf '%s\t%s\n' "$path" "$dest" >> "$MANIFEST"
        OK=$((OK + 1)); FREED=$((FREED + sz))
      else
        echo "  실패: $path" >&2; FAIL=$((FAIL + 1))
      fi
      ;;
    trash)
      if move_to_trash "$path"; then
        OK=$((OK + 1)); FREED=$((FREED + sz))
      else
        echo "  실패(휴지통 이동 불가): $path" >&2; FAIL=$((FAIL + 1))
      fi
      ;;
    delete)
      if rm -rf -- "$path" 2>/dev/null; then
        OK=$((OK + 1)); FREED=$((FREED + sz))
      else
        echo "  실패: $path" >&2; FAIL=$((FAIL + 1))
      fi
      ;;
  esac
done < "$TARGETS"

# 격리 모드면 복구 스크립트를 만들어 둔다
if [ "$MODE" = "quarantine" ] && [ -s "$MANIFEST" ]; then
  RESTORE="$QUAR/restore.sh"
  cp "$MANIFEST" "$QUAR/manifest.tsv"
  cat > "$RESTORE" <<'RESTORE_EOF'
#!/bin/bash
# mac-cleanup.sh 가 격리한 항목을 원래 자리로 되돌립니다.
set -u
TAB=$'\t'
HERE=$(cd "$(dirname "$0")" && pwd)
MANIFEST="$HERE/manifest.tsv"
[ -f "$MANIFEST" ] || { echo "manifest.tsv 를 찾을 수 없습니다: $MANIFEST" >&2; exit 1; }
ok=0; fail=0
while IFS="$TAB" read -r orig dest; do
  [ -n "${orig:-}" ] && [ -n "${dest:-}" ] || continue
  [ -e "$dest" ] || continue
  if [ -e "$orig" ]; then
    echo "건너뜀(이미 존재): $orig" >&2; fail=$((fail+1)); continue
  fi
  mkdir -p "$(dirname "$orig")" 2>/dev/null
  if mv "$dest" "$orig" 2>/dev/null; then ok=$((ok+1)); else echo "실패: $orig" >&2; fail=$((fail+1)); fi
done < "$MANIFEST"
echo "복구 완료: ${ok}개, 실패: ${fail}개"
RESTORE_EOF
  chmod +x "$RESTORE"
fi

echo
echo "════════════════════════════════════════════════════════════════"
echo " 처리 완료: ${OK}개 성공, ${FAIL}개 실패"
echo " 확보 용량: $(human "$FREED")"
if [ "$MODE" = "quarantine" ] && [ -s "$MANIFEST" ]; then
  echo
  echo " 격리 위치 : $QUAR"
  echo " 되돌리기  : bash \"$QUAR/restore.sh\""
  echo " 완전 삭제 : rm -rf \"$QUAR\"   (며칠 써 보고 문제 없을 때)"
fi
echo "════════════════════════════════════════════════════════════════"
