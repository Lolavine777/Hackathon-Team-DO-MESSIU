"""Giả lập phản hồi của lớp ~160 sinh viên.

MVP không có 160 thiết bị thật, nên mỗi lần mở checkpoint hệ thống sinh sẵn một
lịch trả lời (thời điểm, đáp án, mức chắc chắn). Phản hồi của người thật luôn
được cộng thêm vào lịch này. Khi tích hợp thật, chỉ cần bỏ module này đi.
"""

import random

BOT_POOL = 152  # phần còn lại của lớp dành cho người thật đăng nhập

# Kịch bản độ khó của từng câu — đủ để demo trọn vòng phát hiện → can thiệp → phục hồi.
PROFILES = {
    "q-jtbd-01": {"participation": 0.86, "correct": 0.86, "guess": 0.09, "bias": {}},
    "q-jtbd-01b": {"participation": 0.74, "correct": 0.90, "guess": 0.07, "bias": {}},
    "q-jtbd-02": {"participation": 0.82, "correct": 0.52, "guess": 0.31, "bias": {"B": 3.2}},
    "q-jtbd-02b": {"participation": 0.76, "correct": 0.81, "guess": 0.14, "bias": {}},
    "q-jtbd-03": {"participation": 0.78, "correct": 0.71, "guess": 0.34, "bias": {"A": 1.6}},
    "q-jtbd-03b": {"participation": 0.72, "correct": 0.79, "guess": 0.17, "bias": {}},
}

DEFAULT_PROFILE = {"participation": 0.8, "correct": 0.7, "guess": 0.2, "bias": {}}


def _pick_wrong(rng: random.Random, wrong_keys: list[str], bias: dict[str, float]) -> str:
    weights = [bias.get(k, 1.0) for k in wrong_keys]
    return rng.choices(wrong_keys, weights=weights, k=1)[0]


def _confidence(rng: random.Random, is_correct: bool, guess_rate: float) -> str:
    if is_correct:
        return rng.choices(
            ["sure", "unsure", "guess"],
            weights=[0.66, 0.26, max(0.04, guess_rate * 0.45)],
            k=1,
        )[0]
    return rng.choices(
        ["sure", "unsure", "guess"],
        weights=[0.22, 0.34, max(0.2, guess_rate * 1.6)],
        k=1,
    )[0]


def build_schedule(question: dict, correct_key: str, duration_sec: int, seed: str) -> list[dict]:
    """Sinh danh sách phản hồi giả lập kèm mốc thời gian trong cửa sổ trả lời."""
    rng = random.Random(seed)
    profile = PROFILES.get(question["id"], DEFAULT_PROFILE)
    wrong_keys = [o["key"] for o in question["options"] if o["key"] != correct_key]
    count = int(BOT_POOL * profile["participation"] * rng.uniform(0.94, 1.04))

    schedule = []
    for i in range(count):
        # Phần lớn trả lời trong 60% đầu cửa sổ, đuôi kéo dài tới sát giờ đóng.
        at = round(rng.betavariate(2.1, 3.0) * duration_sec * 0.96, 2)
        is_correct = rng.random() < profile["correct"]
        key = correct_key if is_correct else _pick_wrong(rng, wrong_keys, profile["bias"])
        schedule.append(
            {
                "user_id": f"sim_{i:03d}",
                "option_key": key,
                "confidence": _confidence(rng, is_correct, profile["guess"]),
                "at": at,
                "source": "sim",
            }
        )

    schedule.sort(key=lambda r: r["at"])
    return schedule
