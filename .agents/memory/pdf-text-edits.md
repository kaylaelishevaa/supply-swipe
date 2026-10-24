---
name: PDF text edits
description: Preserving the organizer PDF templates during narrow text corrections.
---

Do not assume an extracted embedded font can insert new Unicode text. Check its character mapping before using it; a subset may render existing encoded text correctly while lacking Unicode glyph mappings.

**Why:** The organizer declaration's embedded Calibri subset uses a custom encoding with no usable Unicode cmap. Ordinary text insertion with the extracted font cannot reproduce replacement text reliably.

**How to apply:** Use a Unicode-capable, metrically compatible font such as Carlito only in approved replacement regions. Redact text without deleting background images or table graphics. Compare untouched pages and all pixels outside the approved regions against a pre-edit copy; verify inserted text is extractable and visually unclipped.
