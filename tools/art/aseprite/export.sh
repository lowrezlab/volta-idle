#!/usr/bin/env bash
# Export hero part .aseprite files to the PNG layout tools/art/aseprite-import.ts reads.
#
#   tools/art/aseprite/export.sh <export-dir> <file.aseprite>...
#
# The slot is the folder the file sits in (body/ head/ hair/ outfit/ back/ accessory/ held/, GDD 7.1) and
# each layer is one part, named with the part's id, plus `@<tier>` on body and outfit layers
# (eldrith.slight@medium, head.eldrith, hair.braid, outfit.squire@medium). Each lands in
#
#   <export-dir>/<slot>/<layer>/<pose>.png           the drawing, full 24x24 canvas
#   <export-dir>/<slot>/<layer>/<pose>.anchors.png   the file's hidden _anchors layer for that pose
#
# with <pose> one of idle fight walk rest sleep knocked_out (the file's tags, one frame each). Layers whose
# name starts with _ are not parts. The _anchors layer is shared by every part layer in the file, so it is
# copied beside each one; a part that needs its own anchors goes in its own file. A part's directory is
# emptied before its frames are written, so a removed tag disappears from the export.
#
# Needs the Aseprite CLI on PATH as `aseprite` (or set ASEPRITE to its path, e.g.
# /Applications/Aseprite.app/Contents/MacOS/aseprite).
set -euo pipefail

ASEPRITE="${ASEPRITE:-aseprite}"

if [ "$#" -lt 2 ]; then
  echo "usage: $0 <export-dir> <file.aseprite>..." >&2
  exit 2
fi

export_dir="$1"
shift

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

for file in "$@"; do
  slot="$(basename "$(dirname "$file")")"
  case "$slot" in
    back|body|outfit|head|hair|accessory|held) ;;
    *) echo "$file: its folder '$slot' is not a slot (back body outfit head hair accessory held); skipped" >&2; continue ;;
  esac
  raw="$tmp/$slot-$(basename "$file" .aseprite)"
  mkdir -p "$raw"
  # --all-layers makes the hidden _anchors layer export too. One frame per tag, so each
  # {layer}--{tag} is a single PNG; Aseprite keeps the full canvas unless --trim is passed.
  # --ignore-empty leaves out a pose the layer has nothing drawn in (a back part's lying poses);
  # the importer also treats an all-transparent frame as absent for back parts.
  "$ASEPRITE" -b --all-layers "$file" --split-layers --split-tags --ignore-empty --save-as "$raw/{layer}--{tag}.png" >/dev/null

  options=()
  for png in "$raw"/*.png; do
    name="$(basename "$png" .png)"
    layer="${name%%--*}"
    tag="${name#*--}"
    tag="$(printf '%s' "$tag" | sed -E 's/[0-9]+$//')" # a frame number, if Aseprite appended one
    case "$layer" in
      _*) continue ;; # _anchors and any other helper layer
    esac
    option="$layer"
    dest="$export_dir/$slot/$option"
    if [[ ! " ${options[*]-} " == *" $slot/$option "* ]]; then
      options+=("$slot/$option")
      rm -rf "$dest"
      mkdir -p "$dest"
    fi
    cp "$png" "$dest/$tag.png"
  done

  for png in "$raw"/_anchors--*.png; do
    [ -e "$png" ] || { echo "$file: no _anchors layer; the import will fail without anchors" >&2; break; }
    name="$(basename "$png" .png)"
    tag="$(printf '%s' "${name#*--}" | sed -E 's/[0-9]+$//')"
    for option in "${options[@]-}"; do
      [ -n "$option" ] || continue
      # Only beside a pose the option actually exported (a back part may leave out lying poses).
      [ -e "$export_dir/$option/$tag.png" ] && cp "$png" "$export_dir/$option/$tag.anchors.png"
    done
  done

  echo "$file -> ${options[*]-}"
done
