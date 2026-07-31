export default function BrandMark({ size = 34 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background:
          'linear-gradient(135deg,#1D5A9A 0 48%,transparent 48%),linear-gradient(225deg,#0C3D73 0 48%,transparent 48%)',
        clipPath: 'polygon(50% 100%, 0 45%, 0 0, 50% 46%, 100% 0, 100% 45%)',
        filter: 'drop-shadow(0 5px 7px rgba(19,77,139,.18))',
      }}
    />
  )
}

export function Brand({ size = 34, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <BrandMark size={size} />
      <div className="text-[22px] font-extrabold leading-none text-primary">
        V<span className="text-secondary">Learn</span>
      </div>
    </div>
  )
}
