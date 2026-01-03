import re
from typing import List, Dict


def parse_lrc(lrc_text: str) -> List[Dict[str, float | str]]:
    """
    Parse LRC lyrics text.

    Supports:
    - [mm:ss]
    - [mm:ss.xx]
    - [mm:ss.xxx]
    - Multiple timestamps per line

    Returns:
    [
        { "timestamp": float_seconds, "text": str }
    ]
    """

    # Match all timestamps in a line
    timestamp_pattern = re.compile(r"\[(\d+):(\d+(?:\.\d+)?)\]")
    metadata_pattern = re.compile(r"\[(ar|ti|al|by|offset):", re.IGNORECASE)

    results = []

    for raw_line in lrc_text.splitlines():
        raw_line = raw_line.strip()

        # Skip metadata lines
        if metadata_pattern.match(raw_line):
            continue

        timestamps = timestamp_pattern.findall(raw_line)
        if not timestamps:
            continue

        # Remove timestamps to get lyric text
        text = timestamp_pattern.sub("", raw_line).strip()
        if not text:
            continue

        for minutes, seconds in timestamps:
            timestamp = int(minutes) * 60 + float(seconds)
            results.append({
                "timestamp": round(timestamp, 3),
                "text": text
            })

    # Ensure correct order
    results.sort(key=lambda x: x["timestamp"])

    return results
