import Callout from '../ui/Callout.jsx'
import Chip from '../ui/Chip.jsx'
import QuizOption from '../quiz/QuizOption.jsx'

/**
 * Một câu tự kiểm tra. Chọn xong là công bố đáp án ngay — không có đếm ngược,
 * không gửi lên lớp, nên không dùng `QuizHeader` (component đó gắn chặt với `run`).
 */
export default function SelfTestQuestion({ index, question, answer, onAnswer }) {
  const answered = Boolean(answer)
  const isCorrect = Boolean(question.options.find((option) => option.key === answer)?.correct)

  return (
    <div className="mb-3 rounded-2xl border border-line bg-white p-3.5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-[13px] font-bold leading-snug">{question.prompt}</p>
        <Chip tone={answered ? (isCorrect ? 'success' : 'hot') : 'neutral'}>Câu {index + 1}</Chip>
      </div>

      <div className="grid gap-2">
        {question.options.map((option, position) => (
          <QuizOption
            key={option.key}
            index={position}
            optionKey={option.key}
            text={option.text}
            selected={answer === option.key}
            revealed={answered}
            isCorrect={Boolean(option.correct)}
            disabled={answered}
            onClick={() => onAnswer(option.key)}
          />
        ))}
      </div>

      {answered ? (
        <Callout
          tone={isCorrect ? 'success' : 'danger'}
          title={isCorrect ? 'Chính xác!' : 'Chưa đúng.'}
          className="mt-2.5"
        >
          {question.explain}
        </Callout>
      ) : null}
    </div>
  )
}
