# Modellierung und Programmierung des historischen Biberach im 16. Jahrhundert

Dieses Projekt visualisiert eine historische Stadtszene von Biberach im 16. Jahrhundert mithilfe von Webtechnologien wie Three.js und Vite. Im Folgenden finden Sie eine Anleitung, wie Sie die Entwicklungsumgebung einrichten und das Projekt lokal ausführen können.

## Einrichtung der Umgebung

Bevor Sie starten, stellen Sie sicher, dass **Node.js** auf Ihrem Computer installiert ist. Dies wird benötigt, um die Abhängigkeiten zu verwalten und den lokalen Server zu starten.

**Installation von Node.js:**
Falls Sie Node.js noch nicht installiert haben, können Sie es von der offiziellen Webseite [nodejs.org](https://nodejs.org/) herunterladen. Es wird empfohlen, die **LTS-Version** (Long Term Support) zu wählen, da diese am stabilsten ist. Laden Sie den Installer für Ihr Betriebssystem herunter und folgen Sie den Installationsanweisungen.

Nachdem Sie Node.js installiert und das Projekt heruntergeladen haben, öffnen Sie ein Terminal im Projektordner. Führen Sie den folgenden Befehl aus, um alle notwendigen Bibliotheken und Abhängigkeiten zu installieren:

```bash
npm install
```

## Lokale Entwicklung

Um an dem Projekt zu arbeiten oder es sich anzusehen, können Sie einen lokalen Entwicklungsserver starten. Dieser aktualisiert die Ansicht im Browser automatisch, sobald Sie Änderungen am Code vornehmen. Starten Sie den Server mit:

```bash
npm run dev
```

Nach dem Start zeigt Ihnen das Terminal eine lokale Adresse an, meistens **http://localhost:5173** (wenn nicht belegt). Öffnen Sie diese Adresse in Ihrem Webbrowser, um die Anwendung zu sehen.

## Erstellung für die Veröffentlichung (Build)

Wenn Sie das Projekt fertiggestellt haben und es auf einem Webserver veröffentlichen möchten, müssen Sie eine optimierte Version erstellen. Der folgende Befehl kompiliert den Code und optimiert die Assets für eine bessere Performance:

```bash
npm run build
```

Das Ergebnis dieses Prozesses finden Sie anschließend im Ordner **`dist/`**. Der Inhalt dieses Ordners ist vollständig eigenständig und kann auf jeden beliebigen Webserver hochgeladen werden.
