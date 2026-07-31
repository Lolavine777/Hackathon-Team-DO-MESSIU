"""Guardrail của `app.ai` — mỗi test bám một failure cluster của `eval/run-01`.

Chạy từ thư mục `backend`:

    python -m unittest discover -s tests -t tests -v
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import ai  # noqa: E402


def option(text: str, correct: bool = False, hints: list[str] | None = None) -> dict:
    item = {"text": text, "correct": correct}
    if not correct:
        item["misconceptionLabel"] = "Nhầm khái niệm"
        item["hints"] = hints or ["Tầng một.", "Tầng hai.", "Tầng ba."]
    return item


def question(prompt: str = "Theo trang này, job được hiểu là gì?", **overrides) -> dict:
    raw = {
        "prompt": prompt,
        "options": [
            option("Tiến bộ mà người dùng muốn đạt được", correct=True),
            option("Một tính năng của sản phẩm"),
            option("Một thương hiệu quen thuộc"),
            option("Một mức giá bán"),
        ],
        "explain": "Trang này định nghĩa job là tiến bộ người dùng muốn đạt được.",
    }
    raw.update(overrides)
    return raw


def suggestion(**overrides) -> dict:
    raw = question()
    raw.update(
        {
            "title": "Định nghĩa job",
            "learningOutcome": "Xác định được job là tiến bộ người dùng muốn đạt được.",
            "durationSec": 30,
            "followUp": {
                "prompt": "Khi người dùng đổi sang công cụ khác, phần nào không đổi?",
                "options": [
                    option("Điều người dùng muốn đạt được vẫn giữ nguyên", correct=True),
                    option("Giao diện của công cụ"),
                    option("Mức giá của công cụ"),
                    option("Tên nhà cung cấp"),
                ],
                "explain": "Job ổn định kể cả khi giải pháp thay đổi.",
            },
            "example": {"title": "Ví dụ", "body": "Trang này nêu job vẫn giữ nguyên khi đổi công cụ."},
        }
    )
    raw.update(overrides)
    return raw


class OptionSelectionTest(unittest.TestCase):
    """Cluster: follow-up chỉ có 2-3 phương án, hoặc mất đáp án đúng khi cắt bớt."""

    def test_question_needs_exactly_four_options(self):
        raw = question(options=[option("Đúng", correct=True), option("Sai")])

        result, issues = ai._normalize_question(raw)

        self.assertIsNone(result)
        self.assertTrue(any("4 phương án" in issue for issue in issues))

    def test_correct_option_survives_when_model_returns_extra_options(self):
        raw = question(
            options=[
                option("Sai một"),
                option("Sai hai"),
                option("Sai ba"),
                option("Sai bốn"),
                option("Đáp án đúng", correct=True),
            ]
        )

        result, _ = ai._normalize_question(raw)

        self.assertEqual(4, len(result["options"]))
        self.assertEqual(["A", "B", "C", "D"], [item["key"] for item in result["options"]])
        self.assertEqual(1, sum(item["correct"] for item in result["options"]))
        self.assertEqual("Đáp án đúng", next(i["text"] for i in result["options"] if i["correct"]))

    def test_two_correct_options_are_rejected(self):
        raw = question(
            options=[
                option("Đúng một", correct=True),
                option("Đúng hai", correct=True),
                option("Sai một"),
                option("Sai hai"),
            ]
        )

        result, issues = ai._normalize_question(raw)

        self.assertIsNone(result)
        self.assertTrue(any("MỘT phương án" in issue for issue in issues))


class HintLeakTest(unittest.TestCase):
    """Cluster: hint diễn giải gần như nguyên đáp án."""

    def test_hint_repeating_the_answer_is_replaced(self):
        raw = question(
            options=[
                option("Tiến bộ mà người dùng muốn đạt được", correct=True),
                option(
                    "Một tính năng của sản phẩm",
                    hints=["Đáp án là tiến bộ mà người dùng muốn đạt được.", "Tầng hai.", "Tầng ba."],
                ),
                option("Một thương hiệu quen thuộc"),
                option("Một mức giá bán"),
            ]
        )

        result, issues = ai._normalize_question(raw, with_misconceptions=True)

        leaked = result["options"][1]["hints"][0]
        self.assertNotIn("tiến bộ", leaked.lower())
        self.assertTrue(any("nói ra đáp án" in issue for issue in issues))

    def test_paraphrased_hint_is_replaced_too(self):
        raw = question(
            options=[
                option("Tiến bộ mà người dùng muốn đạt được", correct=True),
                option(
                    "Một tính năng của sản phẩm",
                    hints=["Hãy nghĩ tới tiến bộ người dùng đang muốn đạt.", "Tầng hai.", "Tầng ba."],
                ),
                option("Một thương hiệu quen thuộc"),
                option("Một mức giá bán"),
            ]
        )

        result, issues = ai._normalize_question(raw, with_misconceptions=True)

        self.assertNotIn("tiến bộ", result["options"][1]["hints"][0].lower())
        self.assertTrue(issues)

    def test_hint_pointing_at_the_misconception_is_kept(self):
        pointer = "Tính năng là phương tiện — nó trả lời câu hỏi nào?"
        raw = question(
            options=[
                option("Tiến bộ mà người dùng muốn đạt được", correct=True),
                option("Một tính năng của sản phẩm", hints=[pointer, "Tầng hai.", "Tầng ba."]),
                option("Một thương hiệu quen thuộc"),
                option("Một mức giá bán"),
            ]
        )

        result, issues = ai._normalize_question(raw, with_misconceptions=True)

        self.assertEqual(pointer, result["options"][1]["hints"][0])
        self.assertEqual([], issues)


class FollowUpTest(unittest.TestCase):
    """Cluster: follow-up thiếu, hoặc chép lại phương án của câu chính."""

    def test_missing_follow_up_is_reported_but_draft_still_returns(self):
        result, issues = ai._normalize_suggestion(suggestion(followUp=None))

        self.assertIsNotNone(result)
        self.assertIsNone(result["followUp"])
        self.assertTrue(any("Follow-up" in issue for issue in issues))

    def test_follow_up_reusing_a_main_distractor_is_rejected(self):
        raw = suggestion(
            followUp={
                "prompt": "Đâu là cách hiểu tập trung vào giải pháp?",
                "options": [
                    option("Một tính năng của sản phẩm nào đó", correct=True),
                    option("Điều người dùng muốn đạt được"),
                    option("Bối cảnh sử dụng"),
                    option("Tiêu chí đo thành công"),
                ],
            }
        )

        result, issues = ai._normalize_suggestion(raw)

        self.assertIsNone(result["followUp"])
        self.assertTrue(any("chép lại câu chính" in issue for issue in issues))

    def test_follow_up_asking_the_same_outcome_differently_is_kept(self):
        result, issues = ai._normalize_suggestion(suggestion())

        self.assertIsNotNone(result["followUp"])
        self.assertEqual(4, len(result["followUp"]["options"]))
        self.assertEqual([], issues)


class BuildSuggestionsTest(unittest.TestCase):
    def test_invalid_suggestion_is_dropped_and_shortfall_reported(self):
        data = {"suggestions": [suggestion(options=[option("Đúng", correct=True), option("Sai")])]}

        suggestions, issues = ai._build_suggestions(data, page=4, count=1)

        self.assertEqual([], suggestions)
        self.assertTrue(any("Cần 1 đề xuất hợp lệ" in issue for issue in issues))

    def test_valid_suggestion_gets_stable_ids(self):
        suggestions, issues = ai._build_suggestions({"suggestions": [suggestion()]}, page=4, count=1)

        self.assertEqual(["sg-4-1"], [item["id"] for item in suggestions])
        self.assertEqual(4, suggestions[0]["page"])
        self.assertEqual([], issues)

    def test_missing_example_is_reported(self):
        _, issues = ai._build_suggestions({"suggestions": [suggestion(example=None)]}, page=4, count=1)

        self.assertTrue(any("example" in issue for issue in issues))


class RepairMessageTest(unittest.TestCase):
    def test_repair_message_lists_each_issue_once(self):
        text = ai._repair_message("gốc", {"suggestions": []}, ["lỗi A", "lỗi A", "lỗi B"])

        self.assertEqual(1, text.count("- lỗi A"))
        self.assertIn("- lỗi B", text)
        self.assertIn("gốc", text)


if __name__ == "__main__":
    unittest.main()
