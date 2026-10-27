--[[
  Create a template .aseprite for one hero part slot (GDD section 7.1).

  Run on the Mac, from the repo root:

    aseprite -b --script-param parts=hair.braid,hair.bob \
                --script-param out="$SPRITES/hair/hair.aseprite" \
                --script-param palette=tools/art/aseprite/volta-1bit.gpl \
                --script tools/art/aseprite/new-part-template.lua

  Parameters (--script-param key=value):
    parts     comma-separated part ids, each becomes a layer named with   (required)
              the id: eldrith.slight@medium (a body: <ancestry>.<build>@<tier>),
              head.eldrith, hair.braid, back.cloak, accessory.halo,
              outfit.squire@medium (tier one of small medium tall very_tall).
    out       the .aseprite path to write; its folder names the slot        (required)
              (body/ head/ hair/ outfit/ back/ accessory/ held/)
    palette   path to volta-1bit.gpl (default: next to this script)

  The file is 24x24, indexed colour, with one frame per pose tag
  (idle fight walk rest sleep knocked_out), a hidden _anchors layer and one
  visible layer per part. Nothing is drawn.
]]

local POSES = { 'idle', 'fight', 'walk', 'rest', 'sleep', 'knocked_out' }

local params = app.params or {}
local parts = params.parts
local out = params.out
local palettePath = params.palette

local function fail(message)
  print('new-part-template: ' .. message)
  os.exit(1)
end

if not parts or parts == '' then fail('parts is required, e.g. parts=hair.braid,hair.bob') end
if not out or out == '' then fail('out is required, e.g. out=hair/hair.aseprite') end

if not palettePath or palettePath == '' then
  local scriptDir = debug.getinfo(1, 'S').source:match('^@(.*)[/\\]') or '.'
  palettePath = scriptDir .. '/volta-1bit.gpl'
end

local sprite = Sprite(24, 24, ColorMode.INDEXED)
sprite:setPalette(Palette { fromFile = palettePath })
sprite.transparentColor = 0

-- One frame per pose, tagged.
for i = 2, #POSES do sprite:newEmptyFrame(i) end
for i, pose in ipairs(POSES) do
  local tag = sprite:newTag(i, i)
  tag.name = pose
end

-- The default layer becomes the hidden _anchors layer; option layers go above it.
local anchors = sprite.layers[1]
anchors.name = '_anchors'
anchors.isVisible = false

for id in string.gmatch(parts, '([^,]+)') do
  id = id:gsub('^%s+', ''):gsub('%s+$', '')
  if id ~= '' then
    local layer = sprite:newLayer()
    layer.name = id
  end
end

sprite:saveAs(out)
print('wrote ' .. out)
