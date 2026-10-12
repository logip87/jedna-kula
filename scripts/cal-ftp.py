#!/usr/bin/env python3
"""Verified FTPS deployment with local backups; credentials come from CI secrets or Keychain."""
from datetime import datetime, timezone
from pathlib import Path
import ftplib
import getpass
import hashlib
import os
import ssl
import subprocess
import sys
import uuid
import urllib.parse
import urllib.request

HOST = os.environ.get("CAL_FTP_HOST", "jednakula.progtest.pl")
USER = os.environ.get("CAL_FTP_USER", "jednakula@progtest.pl")
SITE_URL = os.environ.get("CAL_SITE_URL", "https://jednakula.progtest.pl")
SERVICE = "jedna-kula-cal-ftps"
PROJECT = Path(__file__).resolve().parent.parent


def upload(ftp):
    dist = PROJECT / "dist"
    for required in ("index.html", "sw.js", ".htaccess", "manifest.webmanifest"):
        if not (dist / required).is_file():
            raise RuntimeError("Brak buildu. Uruchom npm run build.")
    ftp.cwd("/")  # Restricted FTP account root = application's public_html.
    files = sorted(path for path in dist.rglob("*") if path.is_file())
    backup = PROJECT / "release" / ("backup-cal-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ"))
    backup.mkdir(parents=True)
    directories = sorted({path.relative_to(dist).parent.as_posix() for path in files})
    existing = {}
    for directory in directories:
        try:
            existing[directory] = dict(ftp.mlsd(directory))
        except ftplib.error_perm as error:
            if directory != "." and str(error).startswith("550"):
                existing[directory] = {}
            else:
                raise
    # Complete all backups before changing any remote files.
    for path in files:
        relative = path.relative_to(dist)
        if relative.name in existing[relative.parent.as_posix()]:
            target = backup / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("wb") as output:
                ftp.retrbinary("RETR " + relative.as_posix(), output.write)
    print("Kopia zastępowanych plików:", backup, flush=True)
    for directory in directories:
        if directory == ".":
            continue
        current = ""
        for part in directory.split("/"):
            current = (current + "/" + part).lstrip("/")
            try:
                ftp.mkd(current)
            except ftplib.error_perm:
                ftp.cwd("/" + current)  # Must already exist and be accessible.
                ftp.cwd("/")
    # Assets first, entry point and service worker last. Keep old assets.
    last = {".htaccess": 1, "index.html": 2, "sw.js": 3}
    files.sort(key=lambda path: (last.get(path.relative_to(dist).as_posix(), 0), path.as_posix()))
    for path in files:
        relative = path.relative_to(dist).as_posix()
        temporary = relative + ".upload-" + uuid.uuid4().hex
        with path.open("rb") as source:
            ftp.storbinary("STOR " + temporary, source)
        ftp.rename(temporary, relative)
        print("Wysłano:", relative, flush=True)
    print(f"Publikacja zakończona: {len(files)} plików. Zachowano stare zasoby.")


def verify():
    """Compare deployed static files with this build over verified HTTPS."""
    if urllib.parse.urlsplit(SITE_URL).scheme != "https":
        raise RuntimeError("Weryfikacja wymaga HTTPS.")
    dist = PROJECT / "dist"
    if not (dist / "index.html").is_file():
        raise RuntimeError("Brak buildu do porównania.")
    checked = 0
    for path in sorted(dist.rglob("*")):
        # PHP executes on the server; .htaccess must not be publicly readable.
        if not path.is_file() or path.name.startswith(".") or path.suffix == ".php":
            continue
        relative = path.relative_to(dist).as_posix()
        url = SITE_URL.rstrip("/") + "/" + urllib.parse.quote(relative, safe="/")
        request = urllib.request.Request(
            url + "?deploy-check=" + uuid.uuid4().hex,
            headers={"Cache-Control": "no-cache"},
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            deployed = response.read()
        if hashlib.sha256(deployed).digest() != hashlib.sha256(path.read_bytes()).digest():
            raise RuntimeError("Niezgodny plik po wdrożeniu: " + relative)
        checked += 1
    for route in ("/lessons", "/training", "/rules"):
        with urllib.request.urlopen(SITE_URL.rstrip("/") + route, timeout=30) as response:
            if response.read() != (dist / "index.html").read_bytes():
                raise RuntimeError("Nieprawidłowy SPA fallback: " + route)
    print(f"HTTPS: {checked} plików zgodnych z buildem; 3 trasy SPA poprawne.")


def deployment_password():
    if "CAL_FTP_PASSWORD" in os.environ:
        password = os.environ["CAL_FTP_PASSWORD"]
        if not password:
            raise RuntimeError("Pusty sekret CAL_FTP_PASSWORD.")
        return password
    if os.environ.get("CI"):
        raise RuntimeError("Brak sekretu CAL_FTP_PASSWORD w CI.")
    return keychain_password()


def keychain_password():
    result = subprocess.run(
        ["security", "find-generic-password", "-s", SERVICE, "-a", USER, "-w"],
        capture_output=True, text=True,
    )
    if result.returncode:
        raise RuntimeError("Brak hasła w Pęku kluczy. Uruchom najpierw setup.")
    return result.stdout.rstrip("\n")


def connect(password):
    ftp = ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=20)
    try:
        ftp.connect(HOST, 21)
        ftp.auth()
        ftp.login(USER, password)
        ftp.prot_p()
        ftp.set_pasv(True)
        return ftp
    except Exception:
        ftp.close()
        raise


def main():
    action = sys.argv[1] if len(sys.argv) == 2 else ""
    if action not in ("setup", "check", "upload", "verify"):
        print("Użycie: python3 scripts/cal-ftp.py setup|check|upload|verify")
        return 2
    if action == "verify":
        verify()
        return 0
    if action == "setup":
        # Verify TLS before asking for credentials; never bypass checks.
        probe = ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=20)
        try:
            probe.connect(HOST, 21)
            probe.auth()
        finally:
            probe.close()
    if action == "setup":
        password = getpass.getpass(f"Hasło FTP dla {USER} (wpisywanie jest niewidoczne): ")
        if not password:
            raise RuntimeError("Nie podano hasła.")
    else:
        password = deployment_password()
    with connect(password) as ftp:
        print(f"Połączenie FTPS zweryfikowane: {HOST}:21, użytkownik {USER}.")
        if action == "upload":
            upload(ftp)
            return 0
        if action == "setup":
            result = subprocess.run(
                ["security", "add-generic-password", "-U", "-s", SERVICE,
                 "-a", USER, "-w", password],
                capture_output=True, text=True,
            )
            if result.returncode:
                raise RuntimeError("Nie udało się zapisać hasła w Pęku kluczy.")
            print("Hasło zapisane w Pęku kluczy macOS.")
        print("Katalog bieżący:", ftp.pwd())
        print("Katalogi i pliki konta:")
        for name in ftp.nlst():
            print(" ", name)
    print("Nie wysłano ani nie usunięto żadnych plików.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (EOFError, KeyboardInterrupt):
        print("\nPrzerwano konfigurację.", file=sys.stderr)
        sys.exit(1)
    except Exception as error:
        # FTP server messages may contain account information but never print
        # the password or a subprocess command containing it.
        print(f"Błąd: {type(error).__name__}. Sprawdź połączenie, login, hasło i uprawnienia katalogu.", file=sys.stderr)
        sys.exit(1)
