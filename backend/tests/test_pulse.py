"""Pulse là số phiếu đang giữ, không phải số lần bấm — và mỗi trang đếm riêng.

Chạy từ thư mục `backend`:

    python -m unittest discover -s tests -t tests -v
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.store import LectureSession  # noqa: E402


class PulseVoteTest(unittest.TestCase):
    def setUp(self):
        self.live = LectureSession()

    def test_changing_option_replaces_the_previous_vote(self):
        self.live.send_pulse("understand", "u1", page=3)
        counts = self.live.send_pulse("stuck", "u1", page=3)

        self.assertEqual({"understand": 0, "unclear": 0, "stuck": 1}, counts)

    def test_each_learner_is_counted_once(self):
        self.live.send_pulse("understand", "u1", page=3)
        self.live.send_pulse("unclear", "u2", page=3)
        self.live.send_pulse("unclear", "u2", page=3)

        self.assertEqual({"understand": 1, "unclear": 1, "stuck": 0}, self.live.pulse_for(3))

    def test_votes_without_a_user_id_do_not_overwrite_each_other(self):
        self.live.send_pulse("stuck", None, page=3)
        counts = self.live.send_pulse("stuck", None, page=3)

        self.assertEqual(2, counts["stuck"])

    def test_pages_are_counted_separately(self):
        self.live.send_pulse("understand", "u1", page=3)
        self.live.send_pulse("stuck", "u1", page=4)

        self.assertEqual({"understand": 1, "unclear": 0, "stuck": 0}, self.live.pulse_for(3))
        self.assertEqual({"understand": 0, "unclear": 0, "stuck": 1}, self.live.pulse_for(4))

    def test_page_without_votes_reports_zeroes(self):
        self.assertEqual({"understand": 0, "unclear": 0, "stuck": 0}, self.live.pulse_for(9))

    def test_missing_page_falls_back_to_the_page_the_class_is_on(self):
        self.live.set_page(7)
        self.live.send_pulse("unclear", "u1")

        self.assertEqual(1, self.live.pulse_for(7)["unclear"])

    def test_reset_only_clears_the_page_it_targets(self):
        self.live.send_pulse("understand", "u1", page=3)
        self.live.send_pulse("stuck", "u1", page=4)

        self.live.reset_pulse(3)

        self.assertEqual({"understand": 0, "unclear": 0, "stuck": 0}, self.live.pulse_for(3))
        self.assertEqual(1, self.live.pulse_for(4)["stuck"])

    def test_my_pulses_reports_only_this_learner_votes(self):
        self.live.send_pulse("understand", "u1", page=3)
        self.live.send_pulse("stuck", "u2", page=3)
        self.live.send_pulse("unclear", "u1", page=4)

        self.assertEqual({"3": "understand", "4": "unclear"}, self.live.my_pulses("u1"))
        self.assertEqual({}, self.live.my_pulses(None))

    def test_state_exposes_counts_for_the_class_page_and_every_page(self):
        self.live.set_page(3)
        self.live.send_pulse("understand", "u1", page=3)
        self.live.send_pulse("stuck", "u1", page=4)

        state = self.live.state("learner", "u1")

        self.assertEqual({"understand": 1, "unclear": 0, "stuck": 0}, state["pulse"])
        self.assertEqual({"3", "4"}, set(state["pulses"]))
        self.assertEqual({"3": "understand", "4": "stuck"}, state["myPulses"])


if __name__ == "__main__":
    unittest.main()
