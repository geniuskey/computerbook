# ComputerBook — 누구나 읽는 인터랙티브 컴퓨터 교과서

0과 1에서 인공지능까지. 컴퓨터 구조를 배운 적 없는 사람도 CPU, 메모리, 운영체제, 네트워크, GPU, 프로그램 실행 원리를
**직접 만지며** 이해하도록 만든 한국어 웹 교과서입니다. 15개 챕터, 54개의 시뮬레이터·인터랙티브 차트, 45개의 개념 그림으로 구성됩니다.

[SensorBook](https://github.com/geniuskey/sensorbook)과 같은 구조와 디자인 시스템을 따르는 시리즈입니다.

## 실행
빌드 과정이 없는 정적 사이트입니다.

```bash
python3 -m http.server 8000   # → http://localhost:8000
```
`index.html`을 브라우저로 바로 열어도 동작합니다. 글꼴만 CDN에서 불러오며, 오프라인이면 시스템 글꼴로 대체됩니다.

## 구성
| 장 | 파일 | 주제 | 주요 시뮬레이터 |
|---|---|---|---|
| 01 | chapters/intro.html | 컴퓨터는 무엇인가 | 메인보드 탐험, 데이터의 여행, 컴퓨터 시간 → 사람 시간 |
| 02 | chapters/bits.html | 0과 1로 모든 것을 | 잡음 속 신호, 8비트 스위치, UTF-8 변환기, RGB, 픽셀, 샘플링 |
| 03 | chapters/logic.html | 트랜지스터와 논리 게이트 | 게이트 놀이터, 4비트 덧셈기, SR 래치, 클럭과 카운터 |
| 04 | chapters/cpu.html | CPU: 명령을 수행하는 두뇌 | 장난감 CPU (어셈블리 직접 작성 가능), 기계어 조립·해독 퍼즐, ADD 한 명령의 미시 단계 |
| 05 | chapters/cpu-perf.html | 더 빠른 CPU의 비밀 | 파이프라인, 분기 예측기 대결, 암달의 법칙 |
| 06 | chapters/memory.html | 메모리와 캐시 | 메모리 사물함, DRAM 리프레시, 캐시 시뮬레이터, 지역성 |
| 07 | chapters/storage.html | 저장장치와 파일 | HDD vs SSD 경주, 플래시 쓰기·지우기, 파일 시스템 |
| 08 | chapters/os.html | 운영체제 | 시스템 콜, CPU 스케줄러, 인터럽트, 경쟁 상태와 잠금 |
| 09 | chapters/vm.html | 가상 메모리 | 주소 변환기, TLB 실험, 스래싱 체험, 페이지 교체 대결 |
| 10 | chapters/network.html | 네트워크의 기초 | 패킷, 캡슐화, 라우팅, TCP 재전송, 빛의 속도 |
| 11 | chapters/web.html | 웹 페이지가 열리기까지 | URL 해부, 로딩 폭포, DNS, HTTPS 도청자 시점, 미니 브라우저 |
| 12 | chapters/gpu.html | GPU: 수천 개의 작은 일꾼 | CPU vs GPU 경주, 래스터화, 셰이더, 행렬 곱셈 |
| 13 | chapters/program.html | 프로그램은 어떻게 실행되는가 | 미니 컴파일러(소스→토큰→트리→기계어→실행), 호출 스택 |
| 14 | chapters/journey.html | 클릭 한 번의 여행 | 메시지 한 통이 모든 계층을 지나는 과정 |
| 15 | chapters/glossary.html | 용어집 & 종합 퀴즈 | 용어 145개 검색, 26문항 종합 퀴즈 |

공통 코드: `css/style.css`(디자인 토큰, 라이트/다크), `js/common.js`(내비게이션, 캔버스·차트 헬퍼, 전역 `CB`).
챕터 작성 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.
챕터를 추가하거나 제목·설명을 바꾼 뒤에는 `python3 tools/seo.py`로 canonical/OG/JSON-LD 태그와 `sitemap.xml`을 다시 만듭니다.

시뮬레이터는 이해를 돕기 위해 단순화한 모델이며, 수치는 대표적인 크기 수준입니다.

## 라이선스

코드는 [MIT](LICENSE-MIT), 교재 콘텐츠는 [CC BY 4.0](LICENSE-CC-BY-4.0)으로 제공됩니다. 자세한 범위는 [라이선스 안내](LICENSE.md)를 참고하세요.
