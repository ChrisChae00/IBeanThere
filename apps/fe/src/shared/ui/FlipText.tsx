/*
  Letters that turn over on hover, one at a time from the middle out.

  Each character is a box with the same glyph on two faces -- the front, and one
  pre-rotated a quarter turn above it. Hovering turns the box, so the second face
  arrives exactly where the first was. Same glyph both sides, so the word never
  becomes unreadable mid-turn; it reads as the letter flipping, not as text changing.

  Two things it deliberately does not touch:

  - **The underline.** It belongs to the element around this one, so it stays put
    while the letters move. A rule that jumps with its label reads as the control
    moving, and this is a link.
  - **The accessible name, and what you can copy.** The back faces are `aria-hidden`
    so a screen reader does not read every letter twice, and `user-select: none` so a
    selection does not either -- ARIA is invisible to a selection range, and without
    the second guard "Open the map" copies out as "OOppeenn  tthhee  mmaapp".

  CSS, not Framer: this is a hover state, and a stylesheet is already parsed when the
  pointer arrives. `prefers-reduced-motion` gets the word standing still.
*/

/* Turned about the box's own centre, so a wide letter and a narrow one move together. */
const STAGGER_MS = 30;

export default function FlipText({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  const characters = [...children];
  const centre = (characters.length - 1) / 2;

  return (
    <span className={`flip-text ${className}`}>
      {characters.map((character, index) => {
        // From the middle outwards: the centre of the word leads and the ends follow,
        // which reads as one object turning rather than a wave crossing it.
        const delay = Math.round(Math.abs(index - centre) * STAGGER_MS);
        const glyph = character === ' ' ? ' ' : character;

        return (
          <span
            key={`${character}-${index}`}
            className="flip-text__char"
            style={{ ['--flip-delay' as string]: `${delay}ms` }}
          >
            <span className="flip-text__face flip-text__face--front">{glyph}</span>
            <span className="flip-text__face flip-text__face--back" aria-hidden="true">
              {glyph}
            </span>
          </span>
        );
      })}
    </span>
  );
}
