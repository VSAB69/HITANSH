import re

def parse_lrc(lrc_text: str):
    """
    Parse LRC files with or without milliseconds.
    Returns list of {timestamp_in_seconds, text}
    """
    # Matches: [mm:ss] OR [mm:ss.xx] OR [mm:ss.xxx]
    pattern = re.compile(r"\[(\d+):(\d+(?:\.\d+)?)\](.*)")

    lines = []

    for raw_line in lrc_text.splitlines():
        match = pattern.match(raw_line)
        if not match:
            continue

        minutes = int(match.group(1))
        seconds = float(match.group(2))
        text = match.group(3).strip()

        timestamp = minutes * 60 + seconds

        if text:
            lines.append({
                "timestamp": timestamp,
                "text": text
            })

    return lines


