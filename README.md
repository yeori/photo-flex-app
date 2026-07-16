# PhotoFlex

🌐 **Translations**: [English](./README.md) | [한국어](./README.ko.md)

PhotoFlex is a lightweight, high-performance frontend image manipulation (crop/resize/zoom) library designed to run in browser environments.

---

## 🚀 Key Features

- **Ultra-lightweight & High-performance**: Built with TypeScript, with only a single core dependency (`eventemitter3`), making it fast and lightweight.
- **Canvas-based Rendering**: Supports hardware-accelerated rendering optimized via CanvasRenderer.
- **Rich Interactions**: Supports image offset adjustments through mouse drag, zoom in/out via mouse wheel & mobile pinch-to-zoom, and file loading via drag-and-drop by default.

---

## 🛠 Usage

### 1. Initialization

Set the HTML container element and call `PhotoFlex.init()` to mount the editor, aligning with the lifecycle of your target framework.

#### 1) Vanilla JS

```html
<div id="editor-container"></div>

<script>
  import { PhotoFlex } from 'photoflex';
  import 'photoflex/dist/photoflex.css';

  const container = document.getElementById('editor-container');
  const flex = PhotoFlex.init(container, {
    width: '400px',
    height: '400px',
    actions: [
      'file',        // Open files
      'camera',      // Shoot with camera
      'fit-action',  // Change fitting modes
      'zoom',        // Zoom slider
      'resize',      // Viewport size settings
      'capture',     // Viewport image capture (crop)
    ],
  });
</script>
```

#### 2) Svelte

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PhotoFlex } from 'photoflex';
  import 'photoflex/dist/photoflex.css';

  let containerEl: HTMLDivElement;
  let flex: any;

  onMount(() => {
    flex = PhotoFlex.init(containerEl, {
      width: '400px',
      height: '400px',
      actions: [
        'file',
        'camera',
        'fit-action',
        'zoom',
        'resize',
        'capture'
      ]
    });
  });

  onDestroy(() => {
    if (flex && typeof flex.dispose === 'function') {
      flex.dispose();
    }
  });
</script>

<div bind:this={containerEl}></div>
```

#### 3) Vue 3 (Composition API)

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
      width: '400px',
      height: '400px',
      actions: ['file', 'camera', 'fit-action', 'zoom', 'resize', 'capture'],
    });
  }
});

onUnmounted(() => {
  if (flexInstance && typeof flexInstance.dispose === 'function') {
    flexInstance.dispose();
  }
});
</script>
```

#### 4) ReactJS (Hooks)

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
        width: '400px',
        height: '400px',
        actions: ['file', 'camera', 'fit-action', 'zoom', 'resize', 'capture'],
      });
    }

    return () => {
      if (flexRef.current && typeof flexRef.current.dispose === 'function') {
        flexRef.current.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} />;
};
```

#### Key Parameters (`PhotoFlexInitParam`)

- `width` / `height`: The dimensions of the editor canvas. You can specify a CSS length string like `'fluid'` (occupies 100% of container width) or `'300px'`.
- `scale`: Initial zoom scale for loaded images. Pass a `number`, or use scale presets: `'contain'` (fits image to viewport) or `'cover'` (fills viewport with image).
- `actions`: List of features to install on the top toolbar.
  - **Simple String Array**: `['file', 'camera', 'fit-action', 'zoom', 'resize', 'capture']` (Ready to copy-paste)
  - **Detailed Parameter Format**: Pass an object instead of a string to customize icons or specify settings.

    ```typescript
    import { ActionResizeParam, ActionZoomParam } from 'photoflex';

    const customActions = [
      'file',
      'camera',
      'fit-action',
      'capture',

      // Viewport size preset customization (ActionResizeParam)
      {
        id: 'resize',
        label: 'Size Preset',
        options: [
          { width: 200, height: 200 },
          { width: 300, height: 300 },
          { width: 400, height: 400 },
        ],
        useDefaultUI: false, // Set to false to bypass default modal and handle via custom events
      } as ActionResizeParam,

      // Zoom level limit customization (ActionZoomParam)
      {
        id: 'zoom',
        label: 'Zoom Controller',
        options: [{ min: 0.1, max: 5.0, step: 0.05, value: 1.0 }],
      } as ActionZoomParam,
    ];
    ```

- `handler`: Custom handler functions to intercept file loading and action creation pipelines.

---

### 2. Loading Images (Open Images/Blobs)

Load local files or `Blob` binary data instantly into the canvas viewport.

```typescript
// Load images using local File objects (e.g., from FileList)
flex.openImage(filesArray);

// Load images using ArrayBuffer or Blob data
flex.openBlobs([{ name: 'example-image.png', data: imageBlob }]);
```

---

### 3. Event Handling

Use `flex.subscribe(eventName, callback)` to listen for actions or image lifecycle events inside the editor.

#### 1) `"open"` Event

Fired when a new image is successfully opened and rendered on the canvas.

```typescript
flex.subscribe('open', () => {
  console.log('Image has been successfully loaded.');
});
```

#### 2) `"capture"` Event

Fired when the user triggers the "Capture (Crop)" action. Returns the cropped image as a base64 data URL.

```typescript
flex.subscribe('capture', (e: CaptureEvent) => {
  // e.image contains the dataURL of the cropped image
  const img = document.createElement('img');
  img.src = e.image;

  document.querySelector('.output-container')?.appendChild(img);
});
```

#### 3) `"action:resize"` Event

Fired when a resize action configured with `useDefaultUI: false` is clicked. This allows you to update the viewport size manually within your workflow.

```typescript
flex.subscribe('action:resize', (e) => {
  console.log('Resize action clicked:', e.options);

  // Take user input or configure dynamically to resize viewport
  const width = 400;
  const height = 400;
  flex.resizeViewport(width, height);
});
```
