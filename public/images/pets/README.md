# Pets — How to add (upcoming)

This folder is reserved for pet images. Not yet used in game — you can start adding now and they will be picked up once pet system lands.

| Filename pattern | Example | Future content.js key |
|---|---|---|
| `<pet_id>.png` | `fire_wolf.png` | `pets[].image = "/images/pets/<pet_id>.png"` |
| JPG also works | `fire_wolf.jpg` | same |

- Format: PNG **or** JPG both work.
- Recommended: 256x256 transparent PNG.
- Missing → no crash, fallback icon will show.
- Naming: use lowercase with underscores (`shadow_cat`, `ember_drake`). Keep filename exactly equal to `pet id`.

To add a pet now:
1. Drop `my_pet.png` here.
2. Add entry in `content.js` (upcoming `pets` array):
```js
{ id: "my_pet", name: "My Pet", image: "/images/pets/my_pet.png", stats: { attack: 5 } }
```
3. Push to Render — image appears automatically, no other code needed.
