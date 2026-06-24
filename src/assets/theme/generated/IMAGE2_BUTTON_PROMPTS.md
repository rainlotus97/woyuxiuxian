# Image2 Button Prompts

用于生成当前项目的按钮母版素材。目标是：

- 直接生成透明背景
- 单个按钮壳，不是整板图
- 风格贴近当前修仙首页的青灰描金按钮
- 适合后续固定尺寸使用，或进一步做三段式适配

## Primary Button Master

```text
Use case: ui-mockup
Asset type: reusable game UI button master asset

Input images:
Image 1 is the exact visual reference for the button family: shape, proportion, border treatment, color balance, ornament density, and material style

Primary request:
Create a single reusable horizontal button master asset matching the reference image as closely as possible.
This must be a standalone button shell only, not a screenshot, not a UI mockup board, not a full interface.

Critical background requirement:
transparent background
no white background
no paper backdrop
no mockup board
no frame around the asset
no surrounding canvas decoration
button only

Style match:
match the reference button's overall style:
muted teal-blue lacquer center
warm antique gold trim
soft parchment undertone
small restrained ornamental corner flourishes
slightly aged painted texture
calm premium Chinese xianxia mobile game UI
not glossy gemstone fantasy
not bright jade luxury
not cartoonish

Shape and structure:
one horizontal button only
front-facing orthographic view
symmetrical left and right ends
clean center for dynamic text
small decorative curls near the ends
no large emblem in the center
no icon
no text
no extra badge
no extra border outside the button
silhouette tightly framed

Production constraints:
this is a button master asset for later UI implementation
high edge clarity
minimal empty margin around the button
center area should remain visually calm enough for overlaid text
suitable for later fixed-size or 3-slice adaptation
no cast shadow outside the button
no object underneath
no environment

Variant:
primary action button
deeper teal center
stronger contrast
more decisive visual weight

Avoid:
no screenshot
no interface layout
no panel
no card
no mountains outside the button
no characters
no watermark
no pink tint
no strong glow
no oversized center ornament
```

## Notes

- 透明背景可以直接生成，但仍需人工检查边缘和留白。
- 如果中段纹理过重，不适合直接做三段式，需要进一步约束 `clean stretchable center`。
- 如果后续要生成次按钮或禁用按钮，只调整 `Variant` 和颜色描述，不改整体结构约束。
