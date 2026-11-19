import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { aiPhotos, realPhotos, type Photo } from './data/photos'
import './App.css'

type Heart = { id: number; x: number; y: number; dx: number; delay: number }
type Preview = { photos: Photo[]; index: number }

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
}

let heartCount = 0

function spawnHearts(x: number, y: number): Heart[] {
  return Array.from({ length: 14 }, (_, i) => ({
    id: ++heartCount,
    x,
    y,
    dx: (Math.random() - 0.5) * 180,
    delay: i * 0.02,
  }))
}

function Polaroid({
  photo,
  rotate,
  onOpen,
}: {
  photo: Photo
  rotate: number
  onOpen: (event: React.MouseEvent) => void
}) {
  return (
    <motion.button
      type="button"
      className="polaroid"
      style={{ rotate }}
      whileHover={{ y: -10, rotate: 0, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
    >
      <img src={photo.src} alt={photo.alt} />
      <span className="polaroid-caption">{photo.caption}</span>
    </motion.button>
  )
}

function App() {
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [hearts, setHearts] = useState<Heart[]>([])
  const rotations = useMemo(
    () => realPhotos.map((_, i) => (i % 2 === 0 ? -2.4 : 2.1) + ((i % 5) - 2) * 0.4),
    [],
  )
  const aiRotations = useMemo(() => [ -3.2, 2.4, -1.6, 3.1 ], [])

  useEffect(() => {
    if (paused || preview) return
    const id = window.setInterval(() => {
      setSlide((current) => (current + 1) % aiPhotos.length)
    }, 4800)
    return () => window.clearInterval(id)
  }, [paused, preview])

  useEffect(() => {
    if (!preview) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreview(null)
      if (event.key === 'ArrowRight') {
        setPreview((current) =>
          current
            ? { ...current, index: (current.index + 1) % current.photos.length }
            : current,
        )
      }
      if (event.key === 'ArrowLeft') {
        setPreview((current) =>
          current
            ? {
                ...current,
                index: (current.index - 1 + current.photos.length) % current.photos.length,
              }
            : current,
        )
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [preview])

  const burst = (event: React.MouseEvent) => {
    setHearts((current) => [
      ...current,
      ...spawnHearts(event.clientX, event.clientY),
    ])
  }

  const openPhoto = (photos: Photo[], index: number, event: React.MouseEvent) => {
    burst(event)
    setPreview({ photos, index })
  }

  const active = aiPhotos[slide]
  const previewPhoto = preview ? preview.photos[preview.index] : null

  return (
    <div className="site">
      <nav className="nav">
        <a className="brand" href="#home">
          Surya ❤️ Savitha
        </a>
        <div className="nav-links">
          <a href="#story">Our story</a>
          <a href="#memories">Real Memories</a>
          <a href="#ai-world">AI World</a>
          <a href="#mini">Mini us</a>
          <a href="#letter">Letter</a>
        </div>
      </nav>

      <header className="hero" id="home">
        <div className="hero-bg" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="kicker">A little universe of two</div>
          <h1>Surya ❤️ Savitha</h1>
          <p>
            Real days, painted dreams, and a love that looks this tender in every world
            we make together.
          </p>
          <div className="cta-row">
            <a className="btn" href="#ai-world">
              Our Little AI World
            </a>
            <a className="btn ghost" href="#memories">
              Real Memories
            </a>
          </div>
        </motion.div>
      </header>

      <section className="section" id="story">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="section-title">Written in two handwritings</h2>
          <p className="section-sub">
            One heart that shows up in photographs. Another that shows up in every
            illustrated sky we imagine.
          </p>
        </motion.div>
        <div className="story-grid">
          <motion.div
            className="story-card"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h3>How this little site holds us</h3>
            <p>
              Real Memories keeps the days that actually happened — sarees, selfies,
              misty hills, and the way Savitha looks at the camera like the whole
              afternoon belongs to her.
            </p>
            <p>
              Our Little AI World is the other half: moonlight couches, ice-cream
              sunsets, Polaroids of a life that feels both invented and completely
              ours.
            </p>
            <p>
              And then there are Mini Surya and Mini Savitha — the softest versions
              of us, swinging in a garden that only love could draw.
            </p>
          </motion.div>
          <motion.div
            className="story-photo"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <img src="/memories/07.jpg" alt="Surya and Savitha" />
          </motion.div>
        </div>
      </section>

      <section className="section" id="memories">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="section-title">Real Memories</h2>
          <p className="section-sub">
            The original photographs — unfiltered, un-generated, and still the
            most beautiful thing in any gallery.
          </p>
        </motion.div>
        <div className="gallery-grid">
          {realPhotos.map((photo, index) => (
            <Polaroid
              key={photo.src}
              photo={photo}
              rotate={rotations[index]}
              onOpen={(event) => openPhoto(realPhotos, index, event)}
            />
          ))}
        </div>
      </section>

      <section className="section ai-world" id="ai-world">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="section-title">Our Little AI World</h2>
          <p className="section-sub">
            Four frames from a universe that never happened — and somehow still
            feels like home.
          </p>
        </motion.div>

        <div
          className="carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="carousel-frame">
            <AnimatePresence mode="wait">
              <motion.img
                key={active.src}
                src={active.src}
                alt={active.alt}
                initial={{ opacity: 0, scale: 1.06, x: 36 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -36 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={(event) => openPhoto(aiPhotos, slide, event)}
              />
            </AnimatePresence>
            <div className="carousel-caption">{active.caption}</div>
            <button
              className="carousel-nav prev"
              type="button"
              aria-label="Previous photograph"
              onClick={() => setSlide((current) => (current - 1 + aiPhotos.length) % aiPhotos.length)}
            >
              ‹
            </button>
            <button
              className="carousel-nav next"
              type="button"
              aria-label="Next photograph"
              onClick={() => setSlide((current) => (current + 1) % aiPhotos.length)}
            >
              ›
            </button>
          </div>
          <div className="dots">
            {aiPhotos.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                className={index === slide ? 'active' : ''}
                aria-label={photo.caption}
                onClick={() => setSlide(index)}
              />
            ))}
          </div>
        </div>

        <div className="gallery-grid">
          {aiPhotos.map((photo, index) => (
            <Polaroid
              key={photo.src}
              photo={photo}
              rotate={aiRotations[index]}
              onOpen={(event) => openPhoto(aiPhotos, index, event)}
            />
          ))}
        </div>

        <div className="mini" id="mini">
          <motion.div
            className="mini-copy"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="kicker">A special corner</div>
            <h3>Mini Surya & Mini Savitha</h3>
            <p>
              Somewhere between golden hour and bougainvillea, two smaller versions
              of us found a wooden swing and decided the world could wait.
            </p>
            <p>
              Mini Surya leans in with that almost-smile. Mini Savitha, glasses
              catching the light, holds his hand like it is the easiest promise
              in the garden. This is our favourite little world — illustrated,
              impossible, and completely true.
            </p>
          </motion.div>
          <motion.button
            type="button"
            className="mini-frame"
            initial={{ opacity: 0, rotate: -8, y: 18 }}
            whileInView={{ opacity: 1, rotate: -2, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ rotate: 0, y: -8 }}
            onClick={(event) => openPhoto(aiPhotos, 2, event)}
          >
            <img src="/ai/little-world.jpg" alt="Mini Surya and Mini Savitha on a garden swing" />
            <span>Mini Surya ❤️ Mini Savitha</span>
          </motion.button>
        </div>
      </section>

      <section className="section" id="letter">
        <motion.div
          className="letter"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h3>A note for later</h3>
          <p>
            If we ever forget how this felt, we can come back here. The real
            photographs will remind us who we were. The painted ones will remind
            us who we kept becoming — two hearts, one universe, ice cream dates
            forever, and a swing that never quite stops moving.
          </p>
        </motion.div>
      </section>

      <footer className="footer">Surya ❤️ Savitha · Real memories & a little AI world</footer>

      <AnimatePresence>
        {previewPhoto && preview && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
          >
            <button className="lightbox-close" type="button" aria-label="Close preview">
              ×
            </button>
            <button
              className="lightbox-nav prev"
              type="button"
              aria-label="Previous"
              onClick={(event) => {
                event.stopPropagation()
                setPreview({
                  ...preview,
                  index: (preview.index - 1 + preview.photos.length) % preview.photos.length,
                })
              }}
            >
              ‹
            </button>
            <button
              className="lightbox-nav next"
              type="button"
              aria-label="Next"
              onClick={(event) => {
                event.stopPropagation()
                setPreview({
                  ...preview,
                  index: (preview.index + 1) % preview.photos.length,
                })
              }}
            >
              ›
            </button>
            <div onClick={(event) => event.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={previewPhoto.src}
                  src={previewPhoto.src}
                  alt={previewPhoto.alt}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35 }}
                  onClick={burst}
                />
              </AnimatePresence>
              <p>{previewPhoto.caption}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.span
            key={heart.id}
            className="burst-heart"
            style={{ left: heart.x, top: heart.y }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
            animate={{
              opacity: 0,
              x: heart.dx,
              y: -150 - (heart.id % 70),
              scale: 1.4,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.15, delay: heart.delay, ease: 'easeOut' }}
            onAnimationComplete={() =>
              setHearts((current) => current.filter((item) => item.id !== heart.id))
            }
          >
            {['❤️', '💗', '💖', '💕'][heart.id % 4]}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default App
