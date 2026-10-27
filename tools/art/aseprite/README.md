# Hero parts: Aseprite to engine

The layered hero (GDD §3, §7) is drawn in Aseprite as parts, exported as PNGs and imported into
`packages/wardenwatch/src/art/parts/generated/`, where the renderer picks them up. The `.aseprite`
files are the originals; the generated TypeScript is never edited by hand.

## The loop

1. **Draw** in Aseprite with the `volta-1bit.gpl` palette (below).
2. **Export** with `export.sh`.
3. **Import** with `pnpm tsx tools/art/aseprite-import.ts <export-dir>`.
4. **Check** the contact sheet at `<export-dir>/contact-sheet.png`, then commit the generated files.

Everything runs in a terminal from the repo root. `SPRITES` below is the sprites folder from GDD §7.1
(`VOLTA/Assets/Gen/Claude/TRMNL Idle RPG/sprites`); the export can go anywhere, `$SPRITES/export` is the
convention.

### 1. Start a part file

```sh
aseprite -b --script-param parts=hair.braid,hair.bob,hair.crop \
            --script-param out="$SPRITES/hair/hair.aseprite" \
            --script tools/art/aseprite/new-part-template.lua
```

That writes a 24×24 indexed sprite with the palette, one frame per pose tag
(`idle fight walk rest sleep knocked_out`), a hidden `_anchors` layer and one layer per part. Two names
matter:

- **The folder is the slot.** A file lives in `body/`, `head/`, `hair/`, `outfit/`, `back/`, `accessory/`
  or `held/` (GDD §7.1), and that folder tells the export which slot its layers fill.
- **The layer name is the part id**, exactly what the renderer looks up. Ids are lowercase words, digits
  and dots, and they are forever: a new drawing gets a new id.

| Slot | Layer name | Example |
|---|---|---|
| body | `<ancestry>.<build>@<tier>` | `eldrith.slight@medium` |
| head | `head.<ancestry>` | `head.eldrith` |
| hair | `hair.<option>` | `hair.braid` |
| outfit | `outfit.<option>@<tier>` or `tabard.<faction>@<tier>` | `outfit.squire@medium` (the shared tier-0 tabard) |
| back | `back.<option>` | `back.cloak` |
| accessory | `accessory.<option>` | `accessory.halo` |
| held | the gear id | `held.shortsword` |

`@<tier>` is the body tier the drawing fits (`small | medium | tall | very_tall`): every body has one, an
outfit has one per body tier it is drawn for, nothing else carries one. The renderer picks the body's
tier for the other slots and falls back to a tier-less part.

One `.aseprite` per body (`body/<tier>-<ancestry>-<build>.aseprite`), since each body has its own anchors.
Hair, back, accessory and held parts can share a file when they share anchors. Add a layer by hand any
time; only the name matters, and a layer starting with `_` is never a part.

### 2. Draw

- Every frame is the full 24×24 canvas, facing right, feet on row 23 for a standing body. Draw each part
  where it sits on the body: the import keeps the whole canvas, so what lines up in Aseprite lines up on
  the device.
- Use only the six drawing swatches. The engine does the dithering: mid grey becomes a 50% checker, light
  grey a sparse 25% shade, hatch blue horizontal lines.
- A **back** part can leave the lying poses (`rest`, `sleep`, `knocked_out`) empty; every other part draws
  all six.
- Put one pixel per anchor on the `_anchors` layer, per frame, in the anchor colours. Two anchors cannot
  share a pixel.

| Part | On `_anchors` |
|---|---|
| body | `head` (top centre of the skull), `neck`, `hand` (front hand, the weapon grip), `back` (between the shoulders) |
| head | `origin` (the pixel that lands on the body's `head` anchor) and `crown` (where hair hangs; one pixel above the origin works) |
| hair, accessory, held, back | `origin` (lands on `crown`, `neck`, `hand`, `back` respectively) |
| outfit | nothing; it sits on the body's own grid |

Lying poses rotate the anchors with the figure.

| Swatch | Hex | Engine glyph |
|---|---|---|
| index 0 | transparent | space |
| Black | `#000000` | `#` |
| White | `#FFFFFF` | `w` |
| Mid grey | `#808080` | `:` 50% checker |
| Light grey | `#C0C0C0` | `.` 25% shade |
| Hatch blue | `#4060C0` | `=` horizontal hatch |
| head / neck / hand / back / crown / origin | `#FF0000` `#FF8000` `#00FF00` `#0000FF` `#FF00FF` `#00FFFF` | anchors only |

### 3. Export

```sh
tools/art/aseprite/export.sh "$SPRITES/export" "$SPRITES"/body/*.aseprite "$SPRITES"/head/*.aseprite ...
```

`ASEPRITE=/Applications/Aseprite.app/Contents/MacOS/aseprite` in front if `aseprite` is not on `PATH`.

The on-disk convention the importer reads is

```
<export-dir>/<slot>/<layer>/<pose>.png           the drawing
<export-dir>/<slot>/<layer>/<pose>.anchors.png   the _anchors layer for that frame
```

where `<slot>` is the file's folder and `<layer>` its layer name (`body/eldrith.slight@medium/idle.png`,
`hair/hair.braid/walk.png`). The anchors layer is exported once per file and copied beside each of the
file's parts. The script empties a part's directory before writing it, so a removed pose disappears; delete
a part's directory yourself when you retire it.

### 4. Import

```sh
pnpm tsx tools/art/aseprite-import.ts "$SPRITES/export"
```

It fails, listing every problem with file names and pixel coordinates, when

- a pixel is any colour outside the palette (a stray antialiased pixel, an anchor colour on a drawing layer),
- a frame is not 24×24,
- `idle`, `fight` or `walk` is missing, or any pose is missing off the back slot,
- a body lacks `head`, `neck`, `hand` or `back`, a head lacks `crown`, or a hanging part lacks its `origin`,
- a layer name is not an id of the shape above, a body has no `@<tier>`, or something other than a body or
  outfit has one.

Nothing is written then. When everything passes it replaces the slot directories and `index.ts` under
`packages/wardenwatch/src/art/parts/generated/` and writes `<export-dir>/contact-sheet.png` (every part × pose
at 4×, not committed). `--out <dir>` and `--sheet <file>` move those.

Commit the generated files with the usual message; the tests check they match the contract.

## Placeholders

Until the first real parts land, `pnpm tsx tools/art/aseprite/placeholder.ts` writes a placeholder export
(`eldrith.slight@medium`, `head.eldrith`, `hair.crop`, `outfit.squire@medium`) to `tools/art/aseprite/export/`
(ignored by git). Importing it produces the committed parts; the test
`tests/tools/aseprite-import.test.ts` keeps them in step while they are the art.
