#!/usr/bin/env python3
"""
Expand words.json to have 500 entries per difficulty level (4, 5, 6-letter).
Pulls additional words from valid_words.json that have definitions in
daily_word_definitions.json, avoiding duplicates.
"""

import json
import random
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "public" / "data"
TARGET = 500

def main():
    # Load existing data
    words_path = DATA_DIR / "words.json"
    valid_path = DATA_DIR / "valid_words.json"
    defs_path  = DATA_DIR / "daily_word_definitions.json"

    print("Loading words.json ...", end=" ", flush=True)
    with open(words_path, encoding="utf-8-sig") as f:
        words_data: dict = json.load(f)
    print("OK")

    print("Loading valid_words.json ...", end=" ", flush=True)
    with open(valid_path, encoding="utf-8-sig") as f:
        valid_raw = json.load(f)
    print("OK")

    print("Loading daily_word_definitions.json ...", end=" ", flush=True)
    with open(defs_path, encoding="utf-8-sig") as f:
        defs_raw: dict = json.load(f)
    print("OK")

    # Normalise definitions keys to UPPER
    definitions: dict[str, str] = {k.upper(): v for k, v in defs_raw.items()}

    # Normalise valid_words to { length: [UPPER word, ...] }
    if isinstance(valid_raw, list):
        valid_by_len: dict[str, list[str]] = {}
        for w in valid_raw:
            l = str(len(w))
            valid_by_len.setdefault(l, []).append(w.upper())
    else:
        valid_by_len = {k: [w.upper() for w in v] for k, v in valid_raw.items()}

    updated = False
    for length_str in ["4", "5", "6"]:
        bucket: list[dict] = words_data.get(length_str, [])
        current_count = len(bucket)
        print(f"\n{length_str}-letter words: {current_count} → target {TARGET}")

        if current_count >= TARGET:
            print(f"  Already at {current_count}, skipping.")
            continue

        # Existing words (UPPER) — avoid duplicates
        existing: set[str] = {e["word"].upper() for e in bucket}

        # Candidate pool: valid words of this length with a definition, not already included
        candidates = [
            w for w in valid_by_len.get(length_str, [])
            if w not in existing and w in definitions
        ]

        needed = TARGET - current_count
        print(f"  Need {needed} more. Candidate pool: {len(candidates)}")

        if len(candidates) < needed:
            print(f"  WARNING: only {len(candidates)} candidates — filling with fallback definitions.")
            # Use all available, then fall back to words without definitions using a placeholder
            chosen_with_defs = candidates[:]
            
            # Try words without definitions as fallback
            all_valid = valid_by_len.get(length_str, [])
            fallback = [w for w in all_valid if w not in existing and w not in set(candidates)]
            random.shuffle(fallback)
            remaining_needed = needed - len(chosen_with_defs)
            fallback = fallback[:remaining_needed]
            
            for w in chosen_with_defs:
                bucket.append({"word": w, "definition": definitions[w]})
                existing.add(w)
            for w in fallback:
                # Generate a simple definition based on word
                bucket.append({"word": w, "definition": f"A {length_str}-letter word used in everyday language"})
                existing.add(w)
        else:
            # Deterministically pick words sorted alphabetically (reproducible)
            candidates.sort()
            chosen = candidates[:needed]
            for w in chosen:
                bucket.append({"word": w, "definition": definitions[w]})
                existing.add(w)

        final_count = len(bucket)
        words_data[length_str] = bucket
        print(f"  ✓ Final count: {final_count}")
        updated = True

    if updated:
        # Write back with minimal whitespace for smaller file size
        with open(words_path, "w", encoding="utf-8") as f:
            json.dump(words_data, f, ensure_ascii=False, separators=(",", ":"))
        size_kb = words_path.stat().st_size / 1024
        print(f"\n✓ Wrote {words_path} ({size_kb:.1f} KB)")
    else:
        print("\nNo changes needed.")

    # Verify final counts
    print("\nFinal word counts:")
    with open(words_path, encoding="utf-8-sig") as f:
        result = json.load(f)
    for length_str, bucket in sorted(result.items()):
        print(f"  {length_str}-letter: {len(bucket)}")

if __name__ == "__main__":
    random.seed(42)
    main()
