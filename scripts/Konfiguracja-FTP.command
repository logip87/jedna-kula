#!/bin/zsh
cd "$(dirname "$0")/.." || exit 1
python3 scripts/cal-ftp.py setup
result=$?
echo
if [ "$result" -eq 0 ]; then
  echo "Gotowe. Możesz wrócić do czatu i napisać: hasło zapisane."
else
  echo "Konfiguracja nie powiodła się. Wróć do czatu z komunikatem błędu."
fi
read "?Naciśnij Enter, aby zamknąć. "
exit "$result"
