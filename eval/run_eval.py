#!/usr/bin/env python3
import argparse
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = ROOT.parent
GOLDEN_SET = ROOT / "golden-set.jsonl"
PDF = PROJECT_ROOT / "codebase/frontend/public/materials/Strategyn_JTBD_Playbook.pdf"


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def resolve_review_path(run_id: str, explicit: Path | None, root: Path = ROOT) -> Path:
    if explicit is not None:
        return explicit
    if run_id == "run-01":
        return root / "human-review.json"
    return root / "reviews" / f"{run_id}.json"


def write_review_template(path: Path, results: list[dict]) -> bool:
    if path.exists():
        return False
    template = {
        result["id"]: {
            "grounded": None,
            "diagnostic": None,
            "safe": None,
            "notes": "",
        }
        for result in results
        if result["http_status"] == 200 and result["suggestion_count"]
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(template, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return True


def is_human_review_complete(results: list[dict]) -> bool:
    dimensions = ("grounded", "diagnostic", "safe")
    return all(
        all(item["human_review"].get(dimension) is not None for dimension in dimensions)
        for item in results
        if item["http_status"] == 200 and item["suggestion_count"]
    )


def ensure_run_is_writable(trace_dir: Path, reuse_traces: bool) -> None:
    if not reuse_traces and any(trace_dir.glob("*.json")):
        raise ValueError(
            f"{trace_dir.name} already has traces; use a new --run-id or --reuse-traces"
        )


def normalized(text: str) -> str:
    return re.sub(r"\s+", " ", str(text).strip().lower())


def score_suggestion(suggestion: dict) -> dict:
    options = suggestion.get("options") or []
    correct = [option for option in options if option.get("correct") is True]
    wrong = [option for option in options if option.get("correct") is not True]
    answer = normalized(correct[0].get("text", "")) if len(correct) == 1 else ""
    hints = [normalized(hint) for option in wrong for hint in (option.get("hints") or [])]
    follow_up = suggestion.get("followUp") or {}
    example = suggestion.get("example") or {}

    checks = {
        "has_prompt": bool(normalized(suggestion.get("prompt", ""))),
        "exactly_four_options": len(options) == 4,
        "distinct_options": len({normalized(option.get("text", "")) for option in options}) == len(options),
        "exactly_one_correct": len(correct) == 1,
        "wrong_options_have_misconceptions": bool(wrong)
        and all(normalized(option.get("misconceptionLabel", "")) for option in wrong),
        "wrong_options_have_three_hints": bool(wrong)
        and all(len(option.get("hints") or []) == 3 for option in wrong),
        "hints_do_not_reveal_answer": bool(answer)
        and all(answer not in hint for hint in hints),
        "has_distinct_follow_up": bool(normalized(follow_up.get("prompt", "")))
        and normalized(follow_up.get("prompt", "")) != normalized(suggestion.get("prompt", "")),
        "has_usable_example": bool(normalized(example.get("body", ""))),
    }
    return {"checks": checks, "automatic_pass": all(checks.values())}


def request_json(base_url: str, path: str, method: str = "GET", body: dict | None = None, role: str = "teacher"):
    payload = json.dumps(body).encode() if body is not None else None
    request = Request(
        f"{base_url.rstrip('/')}/api{path}",
        data=payload,
        method=method,
        headers={
            "Content-Type": "application/json",
            "X-VLearn-Role": role,
            "ngrok-skip-browser-warning": "true",
        },
    )
    started = time.monotonic()
    try:
        with urlopen(request, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw), round(time.monotonic() - started, 3)
    except HTTPError as exc:
        raw = exc.read().decode("utf-8")
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            data = {"detail": raw}
        return exc.code, data, round(time.monotonic() - started, 3)
    except URLError as exc:
        return 0, {"detail": str(exc)}, round(time.monotonic() - started, 3)


def slide_excerpts() -> list[str]:
    reader = PdfReader(PDF)
    return [" ".join((page.extract_text() or "").split())[:2500] for page in reader.pages]


def evaluate_case(
    base_url: str,
    model: str,
    case: dict,
    excerpts: list[str],
    review: dict,
    cached_trace: dict | None = None,
) -> tuple[dict, dict]:
    data = case["input"]
    operation = data["operation"]
    role = data.get("role", "teacher")
    page = data["page"]
    before_ids = None
    if operation == "suggest_without_publish" and cached_trace is None:
        _, before, _ = request_json(base_url, "/session", role="teacher")
        before_ids = [item["id"] for item in before.get("checkpoints", [])]

    payload = {"page": page, "count": data.get("count", 1), "force": True}
    if cached_trace is None:
        status, response, latency = request_json(
            base_url,
            "/ai/suggest-checkpoints",
            method="POST",
            body=payload,
            role=role,
        )
    else:
        status = cached_trace["response_status"]
        response = cached_trace["response"]
        latency = cached_trace["evaluation"]["latency_seconds"]
    suggestions = response.get("suggestions", []) if isinstance(response, dict) else []
    scores = [score_suggestion(item) for item in suggestions]

    not_published = True
    if operation == "suggest_without_publish" and cached_trace is None:
        _, after, _ = request_json(base_url, "/session", role="teacher")
        after_ids = [item["id"] for item in after.get("checkpoints", [])]
        not_published = before_ids == after_ids
    elif operation == "suggest_without_publish":
        not_published = cached_trace["evaluation"]["not_auto_published"]

    expected = case["expected"]
    status_pass = status == expected["http_status"]
    count_pass = len(suggestions) >= expected["min_suggestions"]
    structure_pass = all(score["automatic_pass"] for score in scores) if suggestions else True
    human = review.get(case["id"], {})
    human_required = status == 200 and bool(suggestions)
    human_complete = (
        human.get("grounded") is not None
        and human.get("diagnostic") is not None
        and human.get("safe") is not None
        if human_required
        else True
    )
    human_pass = (
        human.get("grounded") is True
        and human.get("diagnostic") is True
        and human.get("safe") is True
        if human_required
        else True
    )
    passed = status_pass and count_pass and structure_pass and not_published and human_pass

    result = {
        "id": case["id"],
        "situation_type": case["situation_type"],
        "source_type": case["source_type"],
        "expected_behavior": expected["behavior"],
        "http_status": status,
        "suggestion_count": len(suggestions),
        "automatic_scores": scores,
        "human_review": human or {"status": "pending"},
        "not_auto_published": not_published,
        "pass": passed,
        "failure_reasons": [
            reason
            for reason, ok in (
                ("unexpected_http_status", status_pass),
                ("too_few_suggestions", count_pass),
                ("structural_check_failed", structure_pass),
                ("draft_auto_published", not_published),
                ("human_review_incomplete", human_complete),
                ("human_review_failed", human_pass or not human_complete),
            )
            if not ok
        ],
        "latency_seconds": latency,
    }
    trace = {
        "case_id": case["id"],
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "model": model,
        "endpoint": f"{base_url.rstrip('/')}/api/ai/suggest-checkpoints",
        "role": role,
        "request": payload,
        "source_page_excerpt": excerpts[page - 1] if 1 <= page <= len(excerpts) else None,
        "response_status": status,
        "response": response,
        "evaluation": result,
    }
    return result, trace


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--run-id", default="run-01")
    parser.add_argument("--review-file", type=Path)
    parser.add_argument("--reuse-traces", action="store_true")
    args = parser.parse_args()
    trace_dir = ROOT / "traces" / args.run_id
    try:
        ensure_run_is_writable(trace_dir, args.reuse_traces)
    except ValueError as exc:
        raise SystemExit(str(exc)) from exc

    status, session, _ = request_json(args.base_url, "/session", role="teacher")
    if status != 200 or not session.get("ai", {}).get("enabled"):
        raise SystemExit(f"AI endpoint unavailable: HTTP {status} {session}")
    model = session["ai"]["model"]
    review_path = resolve_review_path(args.run_id, args.review_file)
    review = json.loads(review_path.read_text(encoding="utf-8")) if review_path.is_file() else {}
    excerpts = slide_excerpts()
    cases = load_jsonl(GOLDEN_SET)

    result_dir = ROOT / "results"
    result_dir.mkdir(parents=True, exist_ok=True)
    trace_dir.mkdir(parents=True, exist_ok=True)

    results = []
    for index, case in enumerate(cases, start=1):
        trace_path = trace_dir / f"{case['id']}.json"
        cached_trace = (
            json.loads(trace_path.read_text(encoding="utf-8"))
            if args.reuse_traces and trace_path.is_file()
            else None
        )
        result, trace = evaluate_case(base_url=args.base_url, model=model, case=case, excerpts=excerpts, review=review, cached_trace=cached_trace)
        results.append(result)
        trace_path.write_text(
            json.dumps(trace, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"[{index:02d}/{len(cases)}] {case['id']}: {'PASS' if result['pass'] else 'FAIL'}")

    if write_review_template(review_path, results):
        print(f"Created human-review template: {review_path}")

    result_path = result_dir / f"{args.run_id}.jsonl"
    result_path.write_text(
        "".join(json.dumps(item, ensure_ascii=False) + "\n" for item in results),
        encoding="utf-8",
    )
    passed = sum(item["pass"] for item in results)
    try:
        review_file_label = str(review_path.relative_to(PROJECT_ROOT))
    except ValueError:
        review_file_label = str(review_path)
    summary = {
        "run_id": args.run_id,
        "model": model,
        "total": len(results),
        "passed": passed,
        "failed": len(results) - passed,
        "pass_rate": round(passed / len(results) * 100, 1) if results else 0,
        "quality_bar": {
            "overall_percent": 80,
            "hard_conditions": [
                "Không bịa kiến thức ngoài nội dung slide.",
                "Mỗi checkpoint có đúng một đáp án đúng.",
                "Không hint nào tiết lộ đáp án.",
            ],
        },
        "failure_reason_counts": {
            reason: sum(reason in item["failure_reasons"] for item in results)
            for reason in {
                reason
                for item in results
                for reason in item["failure_reasons"]
            }
        },
        "passed_case_ids": [item["id"] for item in results if item["pass"]],
        "failed_case_ids": [item["id"] for item in results if not item["pass"]],
        "review_file": review_file_label,
        "human_review_complete": is_human_review_complete(results),
    }
    (result_dir / f"{args.run_id}-summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
