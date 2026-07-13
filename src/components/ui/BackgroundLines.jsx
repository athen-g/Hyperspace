/**
 * 5 full-height vertical guide lines.
 * Positions are proportional to a 1440px Figma reference viewport:
 *   Line 1:  50px  →  3.472%
 *   Line 2: 370px  → 25.694%
 *   Line 3: 720px  → 50%
 *   Line 4: 1070px → 74.306%
 *   Line 5: 1390px → 96.528%
 */
const LINE_POSITIONS = [3.472, 25.694, 50, 74.306, 96.528]

export default function BackgroundLines() {
  return (
    <div className="bg-lines" aria-hidden="true">
      {LINE_POSITIONS.map((pos, i) => (
        <span
          key={i}
          className="bg-line"
          style={{ left: `${pos}%` }}
        />
      ))}
    </div>
  )
}
