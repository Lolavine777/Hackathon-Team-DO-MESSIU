import json
import tempfile
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent
GOLDEN_SET = ROOT / "golden-set.jsonl"
RUNNER = ROOT / "run_eval.py"
RESULTS = ROOT / "results" / "run-01.jsonl"
SUMMARY = ROOT / "results" / "run-01-summary.json"
TRACES = ROOT / "traces" / "run-01"
SPEC = ROOT.parent / "spec.md"


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


class GoldenSetContractTest(unittest.TestCase):
    def test_golden_set_matches_cp3_contract(self):
        self.assertTrue(GOLDEN_SET.is_file(), "eval/golden-set.jsonl must exist")
        cases = load_jsonl(GOLDEN_SET)

        self.assertEqual(20, len(cases))
        self.assertEqual(20, len({case["id"] for case in cases}))

        hard_counts = Counter(
            case["situation_type"]
            for case in cases
            if case["situation_type"]
            in {"missing_source", "ambiguous", "out_of_scope", "high_consequence"}
        )
        for situation_type in (
            "missing_source",
            "ambiguous",
            "out_of_scope",
            "high_consequence",
        ):
            self.assertGreaterEqual(hard_counts[situation_type], 2)

        real_observations = sum(case["source_type"] in {"chatlog", "observed"} for case in cases)
        chatlog_cases = sum(case["source_type"] == "chatlog" for case in cases)
        self.assertGreaterEqual(real_observations, 10)
        self.assertGreaterEqual(chatlog_cases, 10)

        for case in cases:
            self.assertIn("input", case)
            self.assertIn("expected", case)
            self.assertTrue(case["expected"]["behavior"])


class FirstRunIntegrityTest(unittest.TestCase):
    def test_first_run_contains_every_case_and_completed_review(self):
        cases = load_jsonl(GOLDEN_SET)
        results = load_jsonl(RESULTS)
        summary = json.loads(SUMMARY.read_text(encoding="utf-8"))
        trace_files = list(TRACES.glob("*.json"))

        self.assertEqual(20, len(results))
        self.assertEqual({case["id"] for case in cases}, {result["id"] for result in results})
        self.assertEqual(20, len(trace_files))
        self.assertEqual(20, summary["total"])
        self.assertEqual(sum(result["pass"] for result in results), summary["passed"])
        self.assertEqual(3, summary["passed"])
        self.assertTrue(summary["human_review_complete"])

    def test_spec_contains_required_sections_and_frozen_quality_bar(self):
        spec = SPEC.read_text(encoding="utf-8")

        for section in range(1, 10):
            self.assertIn(f"§{section}.", spec)
        self.assertIn("ít nhất 80%", spec)
        self.assertIn("không được bịa kiến thức ngoài nội dung slide", spec)
        self.assertIn("3/20", spec)


class SuggestionScoringTest(unittest.TestCase):
    def setUp(self):
        self.assertTrue(RUNNER.is_file(), "eval/run_eval.py must exist")
        from eval.run_eval import score_suggestion

        self.score_suggestion = score_suggestion
        self.valid = {
            "prompt": "Theo slide, job được hiểu là gì?",
            "options": [
                {"key": "A", "text": "Một tính năng", "correct": False, "misconceptionLabel": "Nhầm tính năng", "hints": ["Xem lại unit of analysis.", "Tách phương tiện khỏi mục tiêu.", "Tìm kết quả người dùng muốn đạt."]},
                {"key": "B", "text": "Tiến bộ cần đạt", "correct": True},
                {"key": "C", "text": "Một thương hiệu", "correct": False, "misconceptionLabel": "Nhầm thương hiệu", "hints": ["Thương hiệu là nhà cung cấp.", "Tập trung điều người dùng muốn làm.", "So sánh với hoàn cảnh sử dụng."]},
                {"key": "D", "text": "Một mức giá", "correct": False, "misconceptionLabel": "Nhầm giá", "hints": ["Giá là thuộc tính giao dịch.", "Tìm mục tiêu ổn định hơn.", "Đối chiếu định nghĩa trên slide."]},
            ],
            "followUp": {
                "prompt": "Khi đổi sản phẩm, phần nào vẫn giữ nguyên?",
                "options": [
                    {"key": "A", "text": "Job", "correct": True},
                    {"key": "B", "text": "Giao diện", "correct": False},
                ],
            },
            "example": {"title": "Ví dụ", "body": "Người dùng đổi công cụ nhưng job vẫn giữ nguyên."},
        }

    def test_valid_suggestion_passes_structural_checks(self):
        result = self.score_suggestion(self.valid)

        self.assertTrue(result["automatic_pass"])
        self.assertTrue(all(result["checks"].values()))

    def test_multiple_correct_answers_fail(self):
        self.valid["options"][0]["correct"] = True

        result = self.score_suggestion(self.valid)

        self.assertFalse(result["automatic_pass"])
        self.assertFalse(result["checks"]["exactly_one_correct"])

    def test_hint_revealing_answer_fails(self):
        self.valid["options"][0]["hints"][0] = "Đáp án là Tiến bộ cần đạt."

        result = self.score_suggestion(self.valid)

        self.assertFalse(result["automatic_pass"])
        self.assertFalse(result["checks"]["hints_do_not_reveal_answer"])


class ReviewIsolationTest(unittest.TestCase):
    def setUp(self):
        import eval.run_eval as runner

        self.runner = runner

    def test_each_new_run_gets_its_own_review_file(self):
        self.assertTrue(hasattr(self.runner, "resolve_review_path"))
        resolve = self.runner.resolve_review_path

        self.assertEqual(ROOT / "human-review.json", resolve("run-01", None, ROOT))
        self.assertEqual(ROOT / "reviews" / "run-02.json", resolve("run-02", None, ROOT))
        explicit = ROOT / "review-by-teammate.json"
        self.assertEqual(explicit, resolve("run-02", explicit, ROOT))

    def test_review_template_contains_only_cases_needing_human_review(self):
        self.assertTrue(hasattr(self.runner, "write_review_template"))
        results = [
            {"id": "N01", "http_status": 200, "suggestion_count": 1},
            {"id": "S01-A", "http_status": 422, "suggestion_count": 0},
        ]

        with tempfile.TemporaryDirectory() as directory:
            review_path = Path(directory) / "reviews" / "run-02.json"
            created = self.runner.write_review_template(review_path, results)
            review = json.loads(review_path.read_text(encoding="utf-8"))

        self.assertTrue(created)
        self.assertEqual(
            {
                "N01": {
                    "grounded": None,
                    "diagnostic": None,
                    "safe": None,
                    "notes": "",
                }
            },
            review,
        )

    def test_review_template_never_overwrites_existing_review(self):
        self.assertTrue(hasattr(self.runner, "write_review_template"))
        results = [{"id": "N01", "http_status": 200, "suggestion_count": 1}]

        with tempfile.TemporaryDirectory() as directory:
            review_path = Path(directory) / "run-02.json"
            review_path.write_text('{"N01": {"grounded": true}}\\n', encoding="utf-8")
            created = self.runner.write_review_template(review_path, results)
            content = review_path.read_text(encoding="utf-8")

        self.assertFalse(created)
        self.assertEqual('{"N01": {"grounded": true}}\\n', content)

    def test_review_is_complete_only_when_all_dimensions_are_filled(self):
        self.assertTrue(hasattr(self.runner, "is_human_review_complete"))
        incomplete = [
            {
                "http_status": 200,
                "suggestion_count": 1,
                "human_review": {"grounded": True, "diagnostic": None, "safe": None},
            }
        ]
        complete = [
            {
                "http_status": 200,
                "suggestion_count": 1,
                "human_review": {"grounded": True, "diagnostic": False, "safe": True},
            }
        ]

        self.assertFalse(self.runner.is_human_review_complete(incomplete))
        self.assertTrue(self.runner.is_human_review_complete(complete))

    def test_existing_run_cannot_be_regenerated_with_stale_review(self):
        self.assertTrue(hasattr(self.runner, "ensure_run_is_writable"))

        with tempfile.TemporaryDirectory() as directory:
            trace_dir = Path(directory) / "run-02"
            trace_dir.mkdir()
            (trace_dir / "N01.json").write_text("{}\n", encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "already has traces"):
                self.runner.ensure_run_is_writable(trace_dir, reuse_traces=False)
            self.runner.ensure_run_is_writable(trace_dir, reuse_traces=True)


if __name__ == "__main__":
    unittest.main()
