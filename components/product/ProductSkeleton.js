export default function ProductSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div
            className="skeleton"
            style={{ aspectRatio: '3/4', marginBottom: '1.2rem' }}
          />
          <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '8px' }} />
          <div className="skeleton" style={{ height: '18px', width: '75%', marginBottom: '8px' }} />
          <div className="skeleton" style={{ height: '16px', width: '30%' }} />
        </div>
      ))}
    </>
  )
}
