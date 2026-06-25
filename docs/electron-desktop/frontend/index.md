# Electron Desktop — Frontend Guide

## Overview

The app can be bundled as a desktop application using Electron. The main process, preload script, and renderer integration are documented here.

## Main Process

`electron/main.ts` — creates the BrowserWindow, handles lifecycle events, and registers IPC handlers.

```ts
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)
```

## Preload Script

`electron/preload.ts` — exposes a context bridge to the renderer:

```ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  goBack: () => ipcRenderer.send('navigate-back'),
  goForward: () => ipcRenderer.send('navigate-forward'),

  showNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body })
  },

  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update-available', callback)
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', callback)
  },
  installUpdate: () => ipcRenderer.send('install-update'),
})
```

**Exposed API:**

| Method | Purpose |
|---|---|
| `platform` | OS platform string (darwin/win32/linux) |
| `goBack()` | Navigate browser backward |
| `goForward()` | Navigate browser forward |
| `showNotification(title, body)` | Show desktop notification |
| `onUpdateAvailable(callback)` | Listen for update availability |
| `onUpdateDownloaded(callback)` | Listen for update download completion |
| `installUpdate()` | Trigger update installation |

## Components

### Electron Toolbar

`src/components/electron/electron-toolbar.tsx` — custom title bar for the frameless window:

- Back/forward navigation buttons
- macOS traffic light buttons (close, minimize, maximize)
- Window title display
- Draggable region

### Electron Update Notice

`src/components/electron/electron-update-notice.tsx` — notification when an update is available:

```tsx
export function ElectronUpdateNotice() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    window.electronAPI?.onUpdateAvailable(() => setUpdateAvailable(true))
    window.electronAPI?.onUpdateDownloaded(() => {
      // Show "restart to update" prompt
    })
  }, [])

  if (!updateAvailable) return null

  return (
    <Notice variant="info">
      A new version is available.
      <Button onClick={() => window.electronAPI?.installUpdate()}>
        Restart to Update
      </Button>
    </Notice>
  )
}
```

### Electron Activity Notifications

`src/components/electron/electron-activity-notifications.tsx` — bridges real-time activities to OS-level desktop notifications:

```tsx
export function ElectronActivityNotifications() {
  const { activities } = useNotifications()

  useEffect(() => {
    if (activities.length > 0 && window.electronAPI) {
      const latest = activities[0]
      window.electronAPI.showNotification(
        'New Activity',
        latest.title
      )
    }
  }, [activities])
}
```

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `desktop` | `electron .` | Run in development mode |
| `desktop:build` | Build Vite + Electron | Build for production |
| `dist` | `electron-builder` | Package into distributable |

## Configuration

`electron-builder.yml`:

```yaml
appId: com.hobenakicoffee.app
productName: HobeNakiCoffee
directories:
  output: release

mac:
  target: dmg

win:
  target: nsis

linux:
  target: AppImage
```

## Environment

| Variable | Purpose |
|---|---|
| `VITE_DEV_SERVER_URL` | Used in main process to load dev server during development |
