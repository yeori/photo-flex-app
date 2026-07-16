# PhotoFlex

🌐 **Translations**: [English](./README.md) | [한국어](./README.ko.md)

PhotoFlex는 브라우저 환경에서 동작하는 가볍고 성능이 뛰어난 프론트엔드 이미지 조작(크롭/리사이징/줌) 라이브러리입니다.

---

## 1. Introduction

PhotoFlex는 웹 애플리케이션에서 복잡한 백엔드 처리 없이 클라이언트 사이드에서 이미지를 쉽고 빠르게 조작할 수 있도록 돕는 프론트엔드 이미지 편집 엔진입니다. 고성능 캔버스 드로잉 기술을 활용하여, 브라우저 환경에서 매끄러운 줌(Zoom)과 패닝(Panning), 정밀한 크롭(Capture)을 구현합니다.

---

## 2. Features

- **⚡ 하드웨어 가속 캔버스 렌더링**: CanvasRenderer를 이용한 최적화된 렌더링으로 끊김 없는 이미지 가속 처리를 지원합니다.
- **📦 단일 의존성**: 외부 핵심 의존성이 `eventemitter3` 하나에 불과하여 번들 크기를 크게 줄여줍니다.
- **🔄 다양한 제스처 및 인터랙션**: 마우스 드래그를 이용한 오프셋 조정, 마우스 휠 및 모바일 핀치 줌(Pinch-to-zoom)을 기본 지원합니다.
- **📁 드래그 앤 드롭 파일 로드**: 외부 이미지 파일을 에디터 영역에 드롭하여 즉시 편집할 수 있습니다.
- **🛠 강력한 내장 기능(Actions)**:
  - `file`: 로컬 컴퓨터의 이미지 파일 업로드
  - `camera`: 웹캠 디바이스를 통한 직접 촬영 및 로드
  - `fit-action`: 이미지 맞춤 모드(Contain / Cover / Real Size / Custom) 지원
  - `zoom`: 마우스 휠 연동 및 스케일 슬라이더 제어
  - `resize`: 뷰포트 영역의 해상도 프리셋 조절
  - `capture`: 지정 영역 고화질 크롭 이미지 생성 (Base64)

---

## 3. Demo

프로젝트 내의 `./vanilla` 디렉토리에서 실제 동작하는 데모를 바로 실행해 볼 수 있습니다.

```bash
# vanilla 데모 디렉토리로 이동
cd vanilla

# 의존성 설치 및 데모 서버 구동
npm install
npm run dev
```

데모 구동 시 로컬 호스트 포트(기본 `http://localhost:5173`)로 접속하여 툴바의 동작 및 이미지 자르기 이벤트를 테스트할 수 있습니다.

---

## 4. Installation

패키지 매니저를 통해 손쉽게 라이브러리를 설치할 수 있습니다.

```bash
# npm 사용 시
npm install photoflex

# yarn 사용 시
yarn add photoflex

# pnpm 사용 시
pnpm add photoflex
```

---

## 5. Quick Start

에디터를 마운트할 컨테이너를 생성하고, 라이브러리와 필수 스타일시트를 불러온 뒤 초기화합니다.

```html
<!-- HTML -->
<div id="photo-editor"></div>
```

```typescript
// TypeScript / JavaScript
import { PhotoFlex } from 'photoflex';
import 'photoflex/dist/photoflex.css'; // UI 기본 CSS 스타일

const container = document.getElementById('photo-editor');
const flex = PhotoFlex.init(container, {
  width: '100%',
  height: '500px',
  actions: ['zoom', 'capture']
});
```

---

## 6. Basic Usage

다양한 액션을 포함하여 기본 설정으로 PhotoFlex를 구성하는 가장 전형적인 방법입니다.

```typescript
import { PhotoFlex } from 'photoflex';
import 'photoflex/dist/photoflex.css';

const container = document.querySelector('#editor-container');

const flex = PhotoFlex.init(container, {
  width: 'fluid',          // 컨테이너 크기에 유연하게 맞춤
  height: '400px',
  scale: 'contain',        // 초기 이미지를 맞춤 비율로 로드 ('contain' | 'cover' | number)
  actions: [
    'file',
    'camera',
    'fit-action',
    'zoom',
    'resize',
    'capture'
  ]
});
```

---

## 7. API Reference

### `PhotoFlex` (Static Methods)

#### `PhotoFlex.init(container: HTMLElement, param: PhotoFlexInitParam): PhotoFlex`
PhotoFlex 에디터를 초기화하고 인스턴스를 반환합니다.

> [!IMPORTANT]
> - `container`: 에디터 캔버스가 마운트될 DOM 엘리먼트입니다.
> - `param`: 초기화 옵션입니다.
>   - `width` / `height` (string): `'fluid'` 혹은 `'400px'` 등 CSS 단위를 포함한 값.
>   - `scale` (`number | 'contain' | 'cover'`): 초기 스케일. 기본값 `'contain'`.
>   - `actions` (`ActionDefinition[]`): 활성화할 도구 목록.

---

### `PhotoFlex` (Instance Methods)

#### `flex.openImage(files: File[]): Promise<ImageMetaData[]>`
HTML File 객체 리스트를 전달받아 에디터에 이미지를 로드합니다.

#### `flex.openBlobs(blobs: BlobData[]): Promise<void>`
Blob 형식의 이미지 바이너리 배열을 기반으로 이미지를 로드합니다.

#### `flex.resizeViewport(width: number, height: number): void`
에디터 작업 영역(Viewport)의 가로, 세로 크기를 동적으로 다시 설정합니다.

#### `flex.subscribe(event: string, callback: Function): void`
에디터 내부 이벤트를 구독합니다.
- **주요 이벤트**:
  - `'open'`: 새 이미지 로드 완료 시 발생.
  - `'capture'`: 잘라진 이미지의 base64 데이터를 담아 반환 (`{ image: string }`).
  - `'action:resize'`: 해상도 설정 액션 클릭 시 발생 (상세 설정 프리셋 사용 시).

---

## 8. Examples

각 주요 프레임워크 생태계에서 라이프사이클에 맞춰 사용하는 구성 예시입니다.

> [!TIP]
> 컴포넌트가 언마운트될 때 메모리 누수를 방지하기 위해 반드시 `flex.dispose()`를 호출해 주세요.

### Svelte
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PhotoFlex } from 'photoflex';
  import 'photoflex/dist/photoflex.css';

  let containerEl: HTMLDivElement;
  let flex: any;

  onMount(() => {
    flex = PhotoFlex.init(containerEl, {
      width: '100%',
      height: '400px',
      actions: ['file', 'fit-action', 'zoom', 'capture']
    });

    flex.subscribe('capture', (e) => {
      console.log('크롭된 이미지 URL:', e.image);
    });
  });

  onDestroy(() => {
    if (flex) flex.dispose();
  });
</script>

<div bind:this={containerEl}></div>
```

### Vue 3 (Composition API)
```vue
<template>
  <div ref="containerRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { PhotoFlex } from 'photoflex';
import 'photoflex/dist/photoflex.css';

const containerRef = ref<HTMLDivElement | null>(null);
let flexInstance: any = null;

onMounted(() => {
  if (containerRef.value) {
    flexInstance = PhotoFlex.init(containerRef.value, {
      width: '100%',
      height: '450px',
      actions: ['file', 'zoom', 'capture']
    });
  }
});

onUnmounted(() => {
  if (flexInstance) flexInstance.dispose();
});
</script>
```

### React (Hooks)
```tsx
import React, { useEffect, useRef } from 'react';
import { PhotoFlex } from 'photoflex';
import 'photoflex/dist/photoflex.css';

export const PhotoEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flexRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      flexRef.current = PhotoFlex.init(containerRef.current, {
        width: '100%',
        height: '400px',
        actions: ['file', 'zoom', 'fit-action', 'capture']
      });
    }

    return () => {
      if (flexRef.current) flexRef.current.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%' }} />;
};
```

---

## 9. Browser Support

PhotoFlex는 HTML5 Canvas 2D 및 File Reader API를 지원하는 모든 모던 웹 브라우저를 준수합니다.

- Google Chrome (최신 버전)
- Microsoft Edge (최신 버전)
- Mozilla Firefox (최신 버전)
- Apple Safari (최신 버전)
- 모바일 크롬 및 모바일 사파리 (멀티 터치 핀치 줌 완벽 대응)

---

## 10. FAQ

### Q. 이미지가 찌그러지거나 에디터 스타일이 어색하게 깨집니다.
스타일시트가 누락되었을 수 있습니다. 반드시 아래 코드를 통해 스타일을 불러와 주세요.
```typescript
import 'photoflex/dist/photoflex.css';
```

### Q. 모바일 환경에서 핀치 줌(두 손가락 확대/축소) 동작이 반응하지 않습니다.
PhotoFlex는 모바일 멀티 터치를 지원하기 위해 모듈 내부에 포인터 이벤트를 리스닝합니다. 컨테이너 영역에 CSS로 `touch-action: none;` 속성이 정상 적용되어 브라우저 기본 줌 동작을 막았는지 확인하세요.

---

## 11. Changelog

### v0.0.6
- 내부 줌 연산 및 이미지 오프셋 로직 개선.
- `PhotoFlexOp.fitByCustom` 구현을 `PhotoFlex` 본체 코드로 위임 처리하여 렌더링 최적화 진행.
- 라이브러리 타입 정의(`ActionIconRender`)에 대한 상세 JSDoc 및 한/영 문서 추가.

---

## 12. License

This project is licensed under the MIT License - see the LICENSE file for details.
