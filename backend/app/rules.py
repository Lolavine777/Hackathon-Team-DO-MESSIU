"""Aggregation thuần + rule engine.

Tách hẳn khỏi LLM: mọi con số và kết luận trạng thái đều tính ở đây.
LLM (nếu bật) chỉ diễn giải lại `decision` chứ không được tự tính.
"""

from . import content

# Ngưỡng pilot — có thể cấu hình theo course khi tích hợp thật.
THRESHOLDS = {
    "signal_adequate": 75,  # participation % → đủ tín hiệu
    "signal_weak": 60,
    "ready_correct": 80,
    "uncertain_correct": 65,
    "ready_low_confidence_max": 20,  # % chọn "Không chắc" tối đa để coi là Ready
    "low_confidence_flag": 30,
    "misconception_cluster": 25,  # % chọn cùng một đáp án sai
    "recovered_absolute": 80,
    "recovered_delta": 15,
    "partial_delta": 5,
}

STATUS_LABELS = {
    "READY": "Lớp đã sẵn sàng",
    "UNCERTAIN": "Lớp chưa chắc chắn",
    "STRUGGLING": "Cần giải thích thêm",
    "INSUFFICIENT_SIGNAL": "Chưa đủ tín hiệu",
}


def _pct(part: int, whole: int) -> float:
    return round(part / whole * 100, 1) if whole else 0.0


def aggregate(question: dict, responses: list[dict], audience: int) -> dict:
    """Gộp response thô thành chỉ số. Không kết luận gì ở đây."""
    keys = [o["key"] for o in question["options"]]
    correct = content.correct_key(question)

    distribution = {k: 0 for k in keys}
    confidence = {"sure": 0, "unsure": 0, "guess": 0}
    for r in responses:
        if r["option_key"] in distribution:
            distribution[r["option_key"]] += 1
        if r["confidence"] in confidence:
            confidence[r["confidence"]] += 1

    responded = sum(distribution.values())
    correct_count = distribution.get(correct, 0)

    misconceptions = []
    for opt in question["options"]:
        code = opt.get("misconception")
        count = distribution.get(opt["key"], 0)
        if not code or not count:
            continue
        misconceptions.append(
            {
                "code": code,
                "label": content.misconception_label(code),
                "optionKey": opt["key"],
                "count": count,
                "ratio": _pct(count, responded),
            }
        )
    misconceptions.sort(key=lambda m: m["count"], reverse=True)

    return {
        "responded": responded,
        "audience": audience,
        "participation": _pct(responded, audience),
        "distribution": distribution,
        "correctKey": correct,
        "correctCount": correct_count,
        "correctRate": _pct(correct_count, responded),
        "confidence": confidence,
        "lowConfidenceRate": _pct(confidence["guess"], responded),
        "misconceptions": misconceptions,
    }


def signal_level(participation: float) -> str:
    if participation >= THRESHOLDS["signal_adequate"]:
        return "adequate"
    if participation >= THRESHOLDS["signal_weak"]:
        return "weak"
    return "insufficient"


def _confidence_score(agg: dict, status: str) -> float:
    """Độ tin cậy của kết luận: dựa trên cỡ mẫu và khoảng cách tới ngưỡng."""
    if status == "INSUFFICIENT_SIGNAL":
        return round(min(0.5, agg["participation"] / 200), 2)
    sample = min(1.0, agg["participation"] / THRESHOLDS["signal_adequate"])
    edge = min(THRESHOLDS["ready_correct"], THRESHOLDS["uncertain_correct"])
    margin = min(1.0, abs(agg["correctRate"] - edge) / 30)
    return round(min(0.95, 0.45 + 0.35 * sample + 0.2 * margin), 2)


def _evidence(agg: dict) -> list[str]:
    items = [
        f"{agg['responded']}/{agg['audience']} sinh viên tham gia ({agg['participation']}%)",
        f"{agg['correctRate']}% trả lời đúng",
    ]
    if agg["misconceptions"]:
        top = agg["misconceptions"][0]
        items.append(f"{top['ratio']}% chọn {top['optionKey']} — {top['label']}")
    if agg["responded"]:
        items.append(f"{agg['lowConfidenceRate']}% tự đánh giá là không chắc")
    return items


def evaluate(question: dict, agg: dict, has_follow_up: bool) -> dict:
    """Quyết định trạng thái lớp + tối đa 3 action từ catalog đã duyệt."""
    signal = signal_level(agg["participation"])
    cluster = agg["misconceptions"][0] if agg["misconceptions"] else None
    has_cluster = bool(cluster and cluster["ratio"] >= THRESHOLDS["misconception_cluster"])

    if agg["responded"] == 0 or signal == "insufficient":
        status = "INSUFFICIENT_SIGNAL"
        summary = (
            "Chưa đủ phản hồi để kết luận về mức độ hiểu của lớp. "
            f"Mới có {agg['responded']}/{agg['audience']} sinh viên trả lời — "
            "gia hạn thêm hoặc mở lại checkpoint trước khi quyết định."
        )
        actions = []
    elif agg["correctRate"] < THRESHOLDS["uncertain_correct"]:
        status = "STRUGGLING"
        summary = f"Chỉ {agg['correctRate']}% trả lời đúng — phần lớn lớp chưa nắm được ý chính."
        actions = ["RETEACH_3_MIN", "SHOW_APPROVED_EXAMPLE", "RUN_FOLLOW_UP"]
    elif agg["correctRate"] < THRESHOLDS["ready_correct"]:
        status = "UNCERTAIN"
        summary = f"{agg['correctRate']}% trả lời đúng — lớp hiểu phần lớn nhưng chưa chắc."
        actions = ["REINFORCE_1_MIN", "SHOW_APPROVED_EXAMPLE", "RUN_FOLLOW_UP"]
    elif agg["lowConfidenceRate"] > THRESHOLDS["low_confidence_flag"]:
        status = "UNCERTAIN"
        summary = (
            f"{agg['correctRate']}% đúng nhưng {agg['lowConfidenceRate']}% tự nhận là không chắc — "
            "khả năng có phần đoán đúng."
        )
        actions = ["SHOW_APPROVED_EXAMPLE", "RUN_FOLLOW_UP", "DISCUSS_1_MIN"]
    else:
        status = "READY"
        summary = f"{agg['correctRate']}% trả lời đúng, mức chắc chắn cao — có thể tiếp tục."
        actions = ["CONTINUE"]

    if has_cluster and status in ("UNCERTAIN", "STRUGGLING"):
        summary += f" {cluster['ratio']}% cùng chọn {cluster['optionKey']} ({cluster['label']})."
        actions = ["SEND_HINT_GROUP"] + [a for a in actions if a != "SEND_HINT_GROUP"]

    if not has_follow_up:
        actions = [a for a in actions if a != "RUN_FOLLOW_UP"]

    if signal == "weak" and status != "INSUFFICIENT_SIGNAL":
        summary += f" Lưu ý: chỉ {agg['participation']}% lớp trả lời, tín hiệu còn yếu."

    return {
        "status": status,
        "statusLabel": STATUS_LABELS[status],
        "signal": signal,
        "summary": summary,
        "evidence": _evidence(agg),
        "recommendedActions": [
            {"code": code, **content.ACTION_CATALOG[code]} for code in actions[:3]
        ],
        "confidence": _confidence_score(agg, status),
        "cluster": cluster if has_cluster else None,
        "source": "rule-engine",
    }


def classify_recovery(before: dict, after: dict) -> dict:
    """So sánh trước/sau can thiệp trên cùng learning outcome."""
    delta = round(after["correctRate"] - before["correctRate"], 1)
    if after["correctRate"] >= THRESHOLDS["recovered_absolute"] or delta >= THRESHOLDS["recovered_delta"]:
        status, label = "RECOVERED", "Đã phục hồi"
    elif delta >= THRESHOLDS["partial_delta"]:
        status, label = "PARTIAL", "Phục hồi một phần"
    else:
        status, label = "NOT_RECOVERED", "Chưa phục hồi"

    small_sample = after["participation"] < THRESHOLDS["signal_weak"]
    return {
        "status": status,
        "label": label,
        "delta": delta,
        "before": {
            "correctRate": before["correctRate"],
            "lowConfidenceRate": before["lowConfidenceRate"],
            "misconceptionRate": before["misconceptions"][0]["ratio"] if before["misconceptions"] else 0.0,
            "participation": before["participation"],
        },
        "after": {
            "correctRate": after["correctRate"],
            "lowConfidenceRate": after["lowConfidenceRate"],
            "misconceptionRate": after["misconceptions"][0]["ratio"] if after["misconceptions"] else 0.0,
            "participation": after["participation"],
        },
        "note": "Mẫu follow-up nhỏ, cần thận trọng khi kết luận." if small_sample else None,
    }
