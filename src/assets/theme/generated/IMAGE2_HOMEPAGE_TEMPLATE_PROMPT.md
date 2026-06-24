# Image2 Homepage Template Prompt

用于生成首页风格决策图，不是运行时组件图。

目标：

- 先定首页整体气质
- 保证后续可从这张样板继续拆按钮、卡片、提示框
- 避免“整页像一套，组件像另一套”

## Homepage Template V1

```text
Use case: mobile game UI style template.
Create a single portrait homepage UI template mockup for a Chinese xianxia cultivation game.
This is a style decision board for the homepage only.

Overall art direction:
calm refined xianxia interface
muted teal-gray lacquer accents
aged gold linework
ivory parchment panels
very restrained cloud ornaments
soft mist atmosphere
not flashy mobile gacha
not glossy gemstone fantasy
not luxury jade overload
not anime character focused

Layout requirements:
front-facing mobile homepage screen composition, 9:16 portrait
clear top status bar
one large central cultivation action panel
three main action buttons below the hero panel
one horizontal current-event story card
two or three secondary information cards for sect, map destination, and player journey
clean bottom navigation strip
real interface composition, not a collage board

Visual rules:
all text should be minimal or abstracted, avoid readable real text
no characters needed, focus on UI shell and page composition
clean readable center areas inside cards and buttons
ornament only near edges and corners
background should be subtle mist and distant mountains, very light
make it look like an actual playable game homepage, not an illustration poster

Quality:
highly cohesive UI family
consistent button, card, and panel language
Chinese xianxia tone with restrained premium craft
```

## Recommended API Parameters

- `model`: `gpt-image-1`
- `size`: `1024x1536`
- `quality`: `high`

## Output Path

- `src/assets/theme/generated/styleboards/homepage-template-style-v1.png`
