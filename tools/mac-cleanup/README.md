# mac-cleanup

Mac 홈 디렉터리에서 안 쓰는 파일을 찾아 보고서로 보여주고, 확인한 것만 골라서 정리하는 스크립트입니다.

이 저장소의 웹사이트 코드와는 무관한 독립 유틸리티입니다.

## 핵심 원칙

1. **기본은 dry-run.** 그냥 실행하면 보고서만 출력하고 파일은 하나도 건드리지 않습니다.
2. **--apply 만으로는 아무 일도 일어나지 않습니다.** `--only` 로 카테고리를 명시해야 합니다.
3. **기본 정리 방식은 삭제가 아니라 격리.** `~/.mac-cleanup/quarantine/<시각>/` 으로 옮기고 `restore.sh` 복구 스크립트를 함께 만듭니다. 며칠 써 보고 문제 없을 때 그 폴더를 지우면 됩니다.

## 용량이 어디에 있는지 먼저 보기

정리 카테고리는 안전을 위해 `~/Library` 를 일부러 피합니다. 그런데 Mac 용량을 실제로 잡아먹는 것은 대개 거기 있습니다 — iOS 백업, Docker 디스크 이미지, iOS 시뮬레이터, 사진 보관함, Time Machine 로컬 스냅숏.

```bash
bash tools/mac-cleanup/mac-cleanup.sh --survey
```

읽기 전용이라 아무것도 지우지 않고, 어디에 몇 GB가 있는지와 각 항목을 어떻게 정리하는지만 알려줍니다. 홈 폴더 전체를 훑으므로 몇 분 걸릴 수 있습니다.

특히 **Time Machine 로컬 스냅숏**은 Finder 에 "확보 가능한 공간"으로만 표시돼서 원인을 찾기 어려운데, 수십 GB 를 차지하는 경우가 흔합니다.

## 빠른 시작

```bash
# 1) 무엇이 정리 대상인지 먼저 확인 (아무것도 변경하지 않음)
bash tools/mac-cleanup/mac-cleanup.sh

# 2) 보고서를 보고 안심되는 것부터
bash tools/mac-cleanup/mac-cleanup.sh --apply --only junk,empty

# 3) 재생성 가능한 캐시류 (보통 가장 많이 확보됨)
bash tools/mac-cleanup/mac-cleanup.sh --apply --only caches,projects

# 4) 오래된 다운로드 — macOS 휴지통으로 보내서 Finder 에서 확인
bash tools/mac-cleanup/mac-cleanup.sh --apply --only downloads,installers --mode trash
```

되돌리려면 실행 후 안내되는 경로의 복구 스크립트를 실행합니다.

```bash
bash ~/.mac-cleanup/quarantine/20260819-002948/restore.sh
```

문제가 없다고 판단되면 그때 완전히 비웁니다.

```bash
rm -rf ~/.mac-cleanup/quarantine/20260819-002948
```

## 카테고리

| 이름 | 대상 | 되돌리기 |
|---|---|---|
| `junk` | `.DS_Store`, `._AppleDouble`, `Thumbs.db`, 받다 만 파일(`.crdownload`, `.part`) | 가능 |
| `empty` | 빈 디렉터리 | 가능 |
| `downloads` | `~/Downloads` 에서 N일(기본 180) 이상 손대지 않은 파일 | 가능 |
| `installers` | N일(기본 30) 이상 지난 `.dmg` / `.pkg` / `.iso` | 가능 |
| `caches` | Xcode DerivedData·Archives, Homebrew/pip/npm/Yarn/Gradle 캐시 등 | 가능하지만 불필요 (재생성됨) |
| `projects` | 프로젝트 안의 `node_modules`, `.venv`, `venv`, `__pycache__` 등 | 가능 (재설치로도 복구됨) |
| `dupes` | 내용이 완전히 같은(SHA-256 일치) 파일. **가장 오래된 1개는 남깁니다** | 가능 |
| `trash` | 휴지통에 N일(기본 30) 이상 있던 항목 | **불가 — 항상 영구 삭제** |

`caches` 는 도구가 알아서 다시 받으므로 가장 안전하면서 확보량이 큽니다.

`dupes` 와 `downloads` 는 의존성 트리(`node_modules`, `.venv`, `site-packages`, `vendor`, `Pods`, `.gradle` 등) 안의 파일을 **건너뜁니다**. 이런 폴더는 파일 하나씩 다루면 안 되기 때문입니다.

- 서로 다른 프로젝트가 같은 라이브러리 파일을 각자 갖고 있는 것은 정상이라 중복이 아닙니다. 하나를 지우면 그쪽 환경이 그대로 깨집니다.
- 오래됐다고 개별 파일만 빼내면 프로젝트가 어정쩡하게 망가집니다.

이런 폴더는 `projects` / `caches` 에서 **통째로** 처리합니다.

`projects` 는 지운 뒤 프로젝트를 다시 쓸 때 재설치가 필요합니다 — `node_modules` 는 `npm install`, `.venv` 는 `pip install -r requirements.txt`. 특히 가상환경은 `requirements.txt` 가 없으면 복원이 번거로우므로, 격리 폴더를 바로 지우지 말고 해당 프로젝트를 한 번 돌려 본 뒤에 비우세요.

`trash` 는 이미 휴지통에 버린 항목을 실제로 비우는 것이므로, `--mode` 와 무관하게 항상 영구 삭제됩니다.

## 건드리지 않는 것

스캔과 정리 양쪽에서 제외됩니다.

- 홈 디렉터리 밖의 모든 경로
- `~/.ssh`, `~/.gnupg`, `~/.aws`, `~/.kube`, `~/.config`
- `~/Library/Keychains`, `~/Library/Mobile Documents`(iCloud Drive), `~/Library/Containers`, `~/Library/Group Containers`, `~/Library/Application Support`, `~/Library/Preferences`
- `~/Applications`, `/Applications`
- `.git` / `.svn` / `.hg` 저장소 내부 — 버전 관리 파일이 중복으로 잡히면 안 되므로 통째로 건너뜁니다
- `.app`, `.bundle`, `.framework`, `.xcodeproj`, `.photoslibrary`, `.musiclibrary`, `.fcpbundle` 등 번들 내부
- 심볼릭 링크
- `.icloud` 스텁 (아직 다운로드되지 않은 iCloud 파일)
- 스캔 루트 폴더 자체와 `~/.mac-cleanup` 자신

## 옵션

```
--survey                용량이 어디에 있는지만 진단 (읽기 전용, ~/Library 포함)
--apply                 실제로 정리 수행 (기본: dry-run)
--only CAT[,CAT...]     처리할 카테고리. --apply 시 필수
--mode MODE             quarantine(기본) | trash | delete
--roots PATH[,PATH...]  스캔할 폴더 (기본: Downloads, Desktop, Documents, Movies)
--days-downloads N      오래된 다운로드 기준 일수 (기본 180)
--days-installers N     오래된 설치 파일 기준 일수 (기본 30)
--days-caches N         미사용 캐시 기준 일수 (기본 30)
--days-trash N          휴지통 항목 기준 일수 (기본 30)
--min-dupe-size BYTES   중복 검사 최소 크기 (기본 1048576 = 1MB)
--top N                 큰 파일 상위 N개 표시 (기본 40)
-y, --yes               확인 프롬프트 생략
-h, --help              도움말
```

`--mode delete` 와 `--only trash` 는 되돌릴 수 없으므로, `--yes` 없이 실행하면 `yes` 가 아니라 `DELETE` 를 정확히 입력해야 진행됩니다.

기본 스캔 범위에 `~/Pictures` 와 `~/Music` 은 들어 있지 않습니다. 사진/음악 라이브러리는 앱이 관리하는 번들이라 직접 건드리면 위험하기 때문입니다. 필요하면 `--roots` 로 명시하세요.

## 보고서

실행할 때마다 전체 목록이 `~/.mac-cleanup/reports/<시각>/` 에 카테고리별 TSV(`<바이트>\t<경로>`)로 저장됩니다. 보고서에는 미리보기 몇 줄만 나오므로, 전부 확인하려면 그 파일들을 보면 됩니다.

보고서 맨 아래 "확보 가능 용량"은 카테고리별 합계를 더한 값이라 겹치는 항목(예: 오래된 `.dmg` 는 `downloads` 와 `installers` 양쪽에 잡힘)이 이중 계산될 수 있습니다. 실제 실행 시에는 중복이 제거된 정확한 수치가 다시 표시됩니다.

## 참고

- macOS 기본 `/bin/bash`(3.2)에서 동작하며, 별도 설치가 필요 없습니다. GNU 환경(Linux)에서도 돌아갑니다.
- 파일이 많으면 첫 스캔에 몇 분 걸릴 수 있습니다. 중복 검사는 같은 크기 파일이 2개 이상일 때만 해시를 계산합니다.
- 경로에 탭이나 개행이 들어 있는 파일은 목록 형식이 깨지므로 자동으로 제외되고, 보고서 하단에 제외 건수가 표시됩니다.
- macOS 저장 공간 화면(  → 시스템 설정 → 일반 → 저장 공간)에서 다루는 iOS 백업, Mail 첨부, Apple TV 캐시 등은 이 스크립트 범위 밖입니다. 그쪽은 시스템 설정에서 정리하세요.
