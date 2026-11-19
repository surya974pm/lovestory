import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import '../TrollZone.css'

type Language = 'en' | 'mlg' | 'ml'
type Copy = { en: string; mlg: string; ml: string }

function isLanguage(value: string): value is Language {
  return value === 'en' || value === 'mlg' || value === 'ml'
}

const replies: Record<string, Copy[]> = {
  dodge: [
    { en: 'Too slow! My no-button has its own plans 😂', mlg: 'Ayyoo, no button pidikkan pattilla 😂', ml: 'അയ്യോ, ഈ ബട്ടൺ പിടിക്കാനാവില്ല 😂' },
    { en: 'Nice try, boyfriend. Ask sweeter ❤️', mlg: 'Nice try, boyfriend. Korachu sweet aayi chodikko ❤️', ml: 'നല്ല ശ്രമം, ബോയ്ഫ്രണ്ട്. കുറച്ചുകൂടി സ്നേഹത്തോടെ ചോദിക്കൂ ❤️' },
  ],
  love: [
    { en: 'Correct answer: you are my favourite ❤️', mlg: 'Correct answer: nee ente favourite aanu ❤️', ml: 'ശരിയുത്തരം: നീയാണ് എന്റെ പ്രിയപ്പെട്ടവൻ ❤️' },
    { en: 'Plot twist: you still owe me ice cream 🍦', mlg: 'Plot twist: enikku ice cream venam 🍦', ml: 'സർപ്രൈസ്: എനിക്ക് ഐസ്ക്രീം വേണം 🍦' },
  ],
  jealous: [
    { en: 'I am not jealous. I just have excellent taste 😌', mlg: 'Enikku jealousy illa. Njan just observe cheyyuva 😌', ml: 'എനിക്ക് അസൂയയില്ല. ഞാൻ വെറുതെ നോക്കുന്നതാ 😌' },
    { en: 'Your attention has been requested by your favourite person 💗', mlg: 'Ninte favourite aal attention chodikkunnu 💗', ml: 'നിന്റെ പ്രിയപ്പെട്ട ആൾക്ക് നിന്റെ ശ്രദ്ധ വേണം 💗' },
  ],
  sorry: [
    { en: 'Apology received. Cuddle tax still applies 🥺', mlg: 'Sorry accept cheythu. Oru hug koodi venam 🥺', ml: 'സോറി സ്വീകരിച്ചു. ഒരു കെട്ടിപ്പിടിത്തം കൂടി വേണം 🥺' },
    { en: 'Okay… but say it with an ice cream 🍦', mlg: 'Sheri… pakshe ice cream koode venam 🍦', ml: 'ശരി… പക്ഷേ ഐസ്ക്രീം കൂടി വേണം 🍦' },
  ],
  hug: [
    { en: 'Hug delivered! No postage, unlimited love 🤗', mlg: 'Hug ethiyallo! Unlimited love 🤗', ml: 'ആലിംഗനം കിട്ടിയല്ലോ! നിറയെ സ്നേഹം 🤗' },
    { en: 'One more hug? This delivery has no limit 💌', mlg: 'Iniyum oru hug? Limit onnum illa 💌', ml: 'ഇനിയും ഒരു ആലിംഗനം? പരിധിയൊന്നുമില്ല 💌' },
  ],
  laugh: [
    { en: 'My lawyer (Savitha) says: try again 😂', mlg: 'Njan chodikkanathu serious aanu… maybe 😂', ml: 'ഞാൻ കാര്യമായിട്ടാണ് ചോദിക്കുന്നത്… ചിലപ്പോൾ 😂' },
    { en: 'Unexpected answer. Expected boyfriend behaviour 😌', mlg: 'Answer thettanu. Boyfriend behaviour correct aanu 😌', ml: 'ഉത്തരം തെറ്റി. ബോയ്ഫ്രണ്ട് പെരുമാറ്റം ശരിയാണ് 😌' },
  ],
}

type TrollContextValue = {
  language: Language
  sound: boolean
  say: (key: string) => string
  tr: (copy: Copy) => string
  play: () => void
}
const TrollContext = createContext<TrollContextValue | null>(null)
const GameResetContext = createContext<() => void>(() => {})

function useTroll() {
  const context = useContext(TrollContext)
  if (!context) throw new Error('Troll Zone games need to be rendered inside TrollZone.')
  return context
}

function Button({
  children,
  kind = 'pink',
  className = '',
  ...props
}: {
  children?: React.ReactNode
  kind?: 'pink' | 'soft' | 'dark'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  onPointerEnter?: React.PointerEventHandler<HTMLButtonElement>
  'aria-label'?: string
  'aria-pressed'?: boolean
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      className={`tz-button tz-button-${kind} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

function GameCard({
  number,
  title,
  blurb,
  reset,
  children,
}: {
  number: number
  title: string
  blurb: string
  reset: () => void
  children: React.ReactNode
}) {
  return (
    <motion.article
      className="tz-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.35 }}
    >
      <header className="tz-card-head">
        <span className="tz-number">{String(number).padStart(2, '0')}</span>
        <div>
          <h3>{title}</h3>
          <p>{blurb}</p>
        </div>
        <button className="tz-reset" type="button" onClick={reset} aria-label={`Reset ${title}`}>
          ↺
        </button>
      </header>
      <div className="tz-game">{children}</div>
    </motion.article>
  )
}

function MiniGame({
  number,
  title,
  blurb,
  children,
}: {
  number: number
  title: string
  blurb: string
  children: (reset: () => void) => React.ReactNode
}) {
  const reset = useContext(GameResetContext)
  return (
    <GameCard number={number} title={title} blurb={blurb} reset={reset}>
      {children(reset)}
    </GameCard>
  )
}

function ImpossibleNoButton() {
  const { say, play } = useTroll()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [answer, setAnswer] = useState('')
  return (
    <MiniGame number={1} title="Impossible No Button" blurb="Try asking a very important question.">
      {() => (
        <div className="tz-play-area">
          <p className="tz-prompt">“Will you share your snacks?”</p>
          <div className="tz-duet">
            <Button onClick={() => { play(); setAnswer(say('love')) }}>Yes, obviously 💕</Button>
            <div className="tz-dodge-area">
              <motion.button
                type="button"
                className="tz-button tz-button-soft tz-dodge"
                animate={position}
                onPointerEnter={(event) => {
                  const bounds = event.currentTarget.parentElement?.getBoundingClientRect()
                  if (bounds) {
                    setPosition({
                      x: Math.random() * Math.max(12, bounds.width - 105),
                      y: Math.random() * 38 - 12,
                    })
                  }
                }}
                onClick={() => setAnswer(say('dodge'))}
              >
                No 🙃
              </motion.button>
            </div>
          </div>
          {answer && <p className="tz-reply" aria-live="polite">{answer}</p>}
        </div>
      )}
    </MiniGame>
  )
}

function DontTouchMyHeart() {
  const { say, tr, play } = useTroll()
  const [touched, setTouched] = useState(false)
  return (
    <MiniGame number={2} title="Don't Touch My Heart" blurb="It is guarded by cuteness.">
      {() => (
        <div className="tz-center">
          <motion.button
            type="button"
            className="tz-big-emoji tz-heart-button"
            aria-label="Touch my heart"
            animate={touched ? { scale: [1, 1.3, 0.92, 1.15, 1], rotate: [0, -12, 12, 0] } : { scale: 1 }}
            onClick={() => { setTouched(true); play() }}
          >
            {touched ? '💖' : '💗'}
          </motion.button>
          <p className="tz-prompt" aria-live="polite">{touched ? say('love') : tr({ en: 'Tap the heart. Be brave.', mlg: 'Heart-il tap cheyyu. Dhairyam aayittu!', ml: 'ഹൃദയത്തിൽ തൊട്ടുനോക്കൂ. ധൈര്യമായിട്ട്!' })}</p>
          {touched && <Button kind="soft" onClick={() => setTouched(false)}>Put it back 💝</Button>}
        </div>
      )}
    </MiniGame>
  )
}

function CatchMeIfYouCan() {
  const [caught, setCaught] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const { tr, play } = useTroll()
  return (
    <MiniGame number={3} title="Catch Me If You Can" blurb="Mini Surya is very speedy today.">
      {() => (
        <div className="tz-catch-zone">
          <p className="tz-prompt">{caught ? tr({ en: 'Caught! He was waiting for a hug 🤗', mlg: 'Pidichallo! Oru hug-nu wait cheyyuvaayirunnu 🤗', ml: 'പിടിച്ചല്ലോ! ഒരു ആലിംഗനത്തിനായി കാത്തിരിക്കുകയായിരുന്നു 🤗' }) : tr({ en: 'Catch Mini Surya for a hug!', mlg: 'Mini Surya-ne pidichu hug kodukku!', ml: 'മിനി സൂര്യയെ പിടിച്ച് കെട്ടിപ്പിടിക്കൂ!' })}</p>
          <motion.button
            type="button"
            className="tz-catcher"
            animate={caught ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : position}
            onPointerEnter={(event) => {
              const rect = event.currentTarget.parentElement?.getBoundingClientRect()
              if (rect) setPosition({ x: Math.random() * Math.max(0, rect.width - 80), y: Math.random() * 65 })
            }}
            onClick={() => { setCaught(true); play() }}
          >
            {caught ? '🥰' : '🧑🏽‍🦱'}
          </motion.button>
        </div>
      )}
    </MiniGame>
  )
}

function AngryButton() {
  const [presses, setPresses] = useState(0)
  const { say, tr, play } = useTroll()
  return (
    <MiniGame number={4} title="Angry Button" blurb="Press to calm down. Maybe.">
      {() => {
        const angry = presses % 3 !== 0
        return (
          <div className="tz-center">
            <motion.button
              type="button"
              className="tz-big-emoji"
              animate={angry ? { rotate: [-6, 6, -6], scale: [1, 1.06, 1] } : { rotate: 0 }}
              transition={{ repeat: angry ? Infinity : 0, duration: 0.28 }}
              onClick={() => { setPresses((count) => count + 1); play() }}
            >
              {angry ? '😤' : '😌'}
            </motion.button>
            <p className="tz-prompt" aria-live="polite">
              {presses === 0 ? tr({ en: 'Tap me to see what happens.', mlg: 'Entha sambhavikkumennu nokkaan tap cheyyu.', ml: 'എന്താണ് സംഭവിക്കുന്നതെന്ന് കാണാൻ തൊട്ടുനോക്കൂ.' }) : angry ? `${say('laugh')} (${presses})` : tr({ en: 'Peace restored. For about three seconds. ☮️', mlg: 'Samaadhaanam thirichu vannu. Moonnu second-ne! ☮️', ml: 'സമാധാനം തിരിച്ചെത്തി. മൂന്ന് സെക്കൻഡത്തേക്ക്! ☮️' })}
            </p>
          </div>
        )
      }}
    </MiniGame>
  )
}

function FakeLoadingSurprise() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { tr, play } = useTroll()
  useEffect(() => {
    if (!loading) return
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 90) {
          window.clearInterval(timer)
          setLoading(false)
          return 100
        }
        return value + 10
      })
    }, 140)
    return () => window.clearInterval(timer)
  }, [loading])
  return (
    <MiniGame number={5} title="Fake Loading Surprise" blurb="Calculating how much I love you…">
      {() => (
        <div className="tz-center">
          {loading || progress === 100 ? (
            <div className="tz-loading" aria-live="polite">
              <div className="tz-progress"><motion.span animate={{ width: `${progress}%` }} /></div>
              <p aria-live="polite">{progress === 100 ? tr({ en: 'Surprise! One unlimited hug 🤗', mlg: 'Surprise! Oru unlimited hug 🤗', ml: 'സർപ്രൈസ്! തീരാത്തൊരു ആലിംഗനം 🤗' }) : `${tr({ en: 'Calculating', mlg: 'Calculate cheyyunnu', ml: 'കണക്കുകൂട്ടുന്നു' })}… ${progress}%`}</p>
            </div>
          ) : <Button onClick={() => { setProgress(0); setLoading(true); play() }}>Reveal surprise ✨</Button>}
          {progress === 100 && <Button kind="soft" onClick={() => { setProgress(0); setLoading(false) }}>Again? 💞</Button>}
        </div>
      )}
    </MiniGame>
  )
}

function DisappearingGiftBox() {
  const [attempts, setAttempts] = useState(0)
  const [opened, setOpened] = useState(false)
  const [visible, setVisible] = useState(true)
  const timer = useRef<number | null>(null)
  const { tr, play } = useTroll()
  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])
  return (
    <MiniGame number={6} title="Disappearing Gift Box" blurb="There is definitely a present in here.">
      {() => (
        <div className="tz-center tz-gift-area">
          <AnimatePresence mode="wait">
            {visible || opened
              ? <motion.button
                  key={opened ? 'opened' : 'gift'}
                  type="button"
                  className="tz-gift"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, rotate: 25, opacity: 0 }}
                  onPointerEnter={(event) => {
                    if (opened || event.pointerType !== 'mouse') return
                    setAttempts((n) => n + 1)
                    setVisible(false)
                    timer.current = window.setTimeout(() => setVisible(true), 550)
                  }}
                  onClick={() => { setOpened(true); setVisible(true); play() }}
                >
                  {opened ? '💐' : '🎁'}
                </motion.button>
              : <motion.span key="poof" className="tz-big-emoji" initial={{ scale: 0 }} animate={{ scale: 1 }}>💨</motion.span>}
          </AnimatePresence>
          <p className="tz-prompt" aria-live="polite">
            {opened ? tr({ en: 'Surprise! A tiny bouquet and a giant hug 🌷', mlg: 'Surprise! Oru bouquet-um oru valiya hug-um 🌷', ml: 'സർപ്രൈസ്! ഒരു ചെറിയ പൂച്ചെണ്ടും വലിയൊരു ആലിംഗനവും 🌷' }) : attempts > 0 ? tr({ en: 'The gift is shy! Tap where it was 😜', mlg: 'Gift-nu naanam aanu! Avide tap cheyyu 😜', ml: 'ഗിഫ്റ്റിന് നാണമാണ്! അവിടെ തൊട്ടുനോക്കൂ 😜' }) : tr({ en: 'Tap the gift before it vanishes!', mlg: 'Gift pookunnathinu munpu tap cheyyu!', ml: 'ഗിഫ്റ്റ് അപ്രത്യക്ഷമാകുന്നതിന് മുമ്പ് തൊട്ടുനോക്കൂ!' })}
          </p>
        </div>
      )}
    </MiniGame>
  )
}

function AreYouSurePopup() {
  const [step, setStep] = useState(0)
  const { tr } = useTroll()
  return (
    <MiniGame number={7} title="Are You Sure Popup" blurb="A very serious and extremely official question.">
      {() => (
        <div className="tz-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="tz-dialog"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
            >
              <p className="tz-prompt">
                {step === 0 ? tr({ en: 'Are you sure you love me the most? 🥺', mlg: 'Ninne ettavum kooduthal ishtam enikkalle? 🥺', ml: 'നിനക്ക് ഏറ്റവും ഇഷ്ടം എന്നെയാണല്ലോ? 🥺' }) : step === 1 ? tr({ en: 'Think carefully… I brought snacks 🍿', mlg: 'Nannayi aalochichu nokku… snacks undu 🍿', ml: 'ആലോചിച്ചു നോക്കൂ… സ്നാക്ക്സ് കൊണ്ടുവന്നിട്ടുണ്ട് 🍿' }) : tr({ en: 'Excellent choice. Your hug is approved! 💗', mlg: 'Nalla choice! Hug approved! 💗', ml: 'നല്ല തിരഞ്ഞെടുപ്പ്! ആലിംഗനം അനുവദിച്ചു! 💗' })}
              </p>
              {step < 2 && <div className="tz-duet">
                <Button onClick={() => setStep(step + 1)}>{step ? 'I am VERY sure ❤️' : 'Yes! 💞'}</Button>
                <Button kind="soft" onClick={() => setStep(1)}>Wait… 🤔</Button>
              </div>}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </MiniGame>
  )
}

function InfiniteHugButton() {
  const [hugs, setHugs] = useState(0)
  const { say, play } = useTroll()
  return (
    <MiniGame number={8} title="Infinite Hug Button" blurb="Warning: this button never runs out.">
      {() => (
        <div className="tz-center">
          <Button className="tz-hug-button" onClick={() => { setHugs((n) => n + 1); play() }}>
            🤗 Send a hug
          </Button>
          <motion.div key={hugs} className="tz-big-emoji" initial={{ y: 15, scale: 0.5 }} animate={{ y: 0, scale: 1 }}>
            {hugs > 0 ? '🫂💗' : '🫂'}
          </motion.div>
          <p className="tz-prompt" aria-live="polite">{hugs ? `${hugs} hugs sent! ${say('hug')}` : 'Tap for a delivery.'}</p>
        </div>
      )}
    </MiniGame>
  )
}

function WrongAnswerQuiz() {
  const { say, play } = useTroll()
  const [answer, setAnswer] = useState('')
  return (
    <MiniGame number={9} title="Wrong Answer Quiz" blurb="There is only one acceptable answer.">
      {() => (
        <div>
          <p className="tz-prompt">Who is the most adorable boyfriend?</p>
          <div className="tz-choice-list">
            {['Surya 😎', 'Also Surya 😌', 'Definitely Surya 💖'].map((option) => (
              <Button key={option} kind="soft" onClick={() => { setAnswer(option); play() }}>{option}</Button>
            ))}
          </div>
          {answer && <p className="tz-reply" aria-live="polite">{say('laugh')} Your answer: {answer}</p>}
        </div>
      )}
    </MiniGame>
  )
}

function FakeExitButton() {
  const [leaving, setLeaving] = useState(false)
  const { tr } = useTroll()
  return (
    <MiniGame number={10} title="Fake Exit Button" blurb="This page has separation anxiety.">
      {() => (
        <div className="tz-center">
          <AnimatePresence mode="wait">
            <motion.div key={String(leaving)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {leaving
                ? <div className="tz-dialog"><p className="tz-prompt">{tr({ en: 'Wait! You forgot your goodbye hug! 🥺', mlg: 'Nilkku! Goodbye hug marannu poyi! 🥺', ml: 'നിൽക്കൂ! യാത്രപറയാനുള്ള ആലിംഗനം മറന്നുപോയി! 🥺' })}</p><Button onClick={() => setLeaving(false)}>Stay for one more 💗</Button></div>
                : <Button kind="soft" onClick={() => setLeaving(true)}>Exit the love zone 🚪</Button>}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </MiniGame>
  )
}

function SlapSuryaAnimation() {
  const [bonks, setBonks] = useState(0)
  const { tr, play } = useTroll()
  return (
    <MiniGame number={11} title="Slap Surya Animation" blurb="A harmless cartoon bonk. He is made of pixels.">
      {() => (
        <div className="tz-center">
          <motion.div
            className="tz-big-emoji"
            animate={bonks ? { rotate: [0, -28, 22, -14, 0], x: [0, 12, -10, 0] } : {}}
          >
            {bonks ? '😵‍💫✨' : '🧑🏽‍🦱'}
          </motion.div>
          <Button onClick={() => { setBonks((n) => n + 1); play() }}>Gentle bonk 🖐️</Button>
          <p className="tz-prompt" aria-live="polite">{bonks ? `${tr({ en: 'Surya says: “I deserved that” 😂', mlg: 'Surya parayunnu: “Njan athu deserve cheythu” 😂', ml: 'സൂര്യ പറയുന്നു: “അത് ഞാൻ അർഹിച്ചതാണ്” 😂' })} (${bonks})` : tr({ en: 'Tap to start a cartoon reaction.', mlg: 'Cartoon reaction kaanaan tap cheyyu.', ml: 'കാർട്ടൂൺ പ്രതികരണം കാണാൻ തൊട്ടുനോക്കൂ.' })}</p>
        </div>
      )}
    </MiniGame>
  )
}

function FeedMiniSurya() {
  const [snacks, setSnacks] = useState(0)
  const [food, setFood] = useState('🍓')
  const { tr, play } = useTroll()
  return (
    <MiniGame number={12} title="Feed Mini Surya" blurb="Select a snack and feed the tiny boyfriend.">
      {() => (
        <div className="tz-center">
          <motion.div className="tz-big-emoji" key={snacks} initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
            {snacks > 4 ? '😋' : '🧑🏽‍🦱'}
          </motion.div>
          <p className="tz-prompt">{tr({ en: 'His tummy', mlg: 'Avante tummy', ml: 'അവന്റെ വയർ' })}: {snacks > 4 ? tr({ en: 'fully happy!', mlg: 'full happy aanu!', ml: 'നന്നായി നിറഞ്ഞു!' }) : `${snacks}/5`}</p>
          <div className="tz-duet">
            {['🍓', '🍕', '🍦'].map((snack) => (
              <Button key={snack} kind="soft" aria-label={`Feed ${snack}`} onClick={() => { setFood(snack); setSnacks((n) => Math.min(n + 1, 5)); play() }}>{snack}</Button>
            ))}
          </div>
          {snacks > 0 && <p className="tz-reply" aria-live="polite">{tr({ en: 'Nom! Thank you, Savitha', mlg: 'Nom! Thanks, Savitha', ml: 'നന്നായിട്ടുണ്ട്! നന്ദി, സവിത' })} {food} 💕</p>}
        </div>
      )}
    </MiniGame>
  )
}

function KissCounter() {
  const [kisses, setKisses] = useState(0)
  const { tr, play } = useTroll()
  return (
    <MiniGame number={13} title="Kiss Counter" blurb="The counter only goes one direction.">
      {() => (
        <div className="tz-center">
          <motion.button
            type="button"
            className="tz-big-emoji tz-heart-button"
            whileTap={{ scale: 1.45, rotate: -10 }}
            onClick={() => { setKisses((n) => n + 1); play() }}
          >
            💋
          </motion.button>
          <p className="tz-prompt" aria-live="polite">{kisses} {tr({ en: kisses === 1 ? 'kiss sent!' : 'kisses sent!', mlg: kisses === 1 ? 'kiss ayachu!' : 'kisses ayachu!', ml: kisses === 1 ? 'ചുംബനം അയച്ചു!' : 'ചുംബനങ്ങൾ അയച്ചു!' })} 💌</p>
          <p className="tz-small">Tiny taps, infinite smooches.</p>
        </div>
      )}
    </MiniGame>
  )
}

function LoveBomb() {
  const [bombs, setBombs] = useState<{ id: number; emoji: string; x: number }[]>([])
  const [bombCount, setBombCount] = useState(0)
  const nextId = useRef(0)
  const { tr, play } = useTroll()
  return (
    <MiniGame number={14} title="Love Bomb" blurb="Press once. Hearts everywhere.">
      {() => (
        <div className="tz-center tz-bomb-area">
          <Button onClick={() => {
            const batch = Array.from({ length: 10 }, (_, index) => ({
              id: ++nextId.current,
              emoji: ['💖', '💗', '💕', '💘'][index % 4],
              x: Math.random() * 220 - 110,
            }))
            setBombs((current) => [...current, ...batch].slice(-30))
            setBombCount((count) => count + 1)
            play()
          }}>💣 Drop a love bomb</Button>
          <div className="tz-bomb-rain" aria-live="polite">
            <AnimatePresence>
              {bombs.map((bomb) => (
                <motion.span
                  key={bomb.id}
                  initial={{ opacity: 1, y: 0, x: 0, scale: 0.3 }}
                  animate={{ opacity: 0, y: -130, x: bomb.x, scale: 1.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.3 }}
                  onAnimationComplete={() => setBombs((current) => current.filter((item) => item.id !== bomb.id))}
                >
                  {bomb.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          <p className="tz-prompt">{tr({ en: 'Love bombs delivered', mlg: 'Love bombs ayachu', ml: 'പ്രണയ ബോംബുകൾ എത്തിച്ചു' })}: {bombCount} 💞</p>
        </div>
      )}
    </MiniGame>
  )
}

function RandomMoodSwitch() {
  const moods = [
    { emoji: '🥰', mood: { en: 'Cuddle mode: activated.', mlg: 'Cuddle mode on aayi.', ml: 'കെട്ടിപ്പിടിത്തം തുടങ്ങി.' }, className: 'mood-love' },
    { emoji: '😤', mood: { en: 'Pretending to be grumpy. Bring snacks.', mlg: 'Deshyam abhinayikkua. Snacks kondu vaa.', ml: 'പിണക്കം അഭിനയിക്കുകയാണ്. സ്നാക്ക്സ് കൊണ്ടുവാ.' }, className: 'mood-grumpy' },
    { emoji: '😎', mood: { en: 'Cool boyfriend mode. Still needs a hug.', mlg: 'Cool boyfriend mode aanu. Hug venam.', ml: 'കൂൾ ബോയ്ഫ്രണ്ട് മോഡ്. ഒരു ആലിംഗനം വേണം.' }, className: 'mood-cool' },
    { emoji: '🤪', mood: { en: 'Certified silly goose energy!', mlg: 'Full silly mode aanu!', ml: 'കുസൃതിക്ക് ഔദ്യോഗിക അംഗീകാരം!' }, className: 'mood-silly' },
  ]
  const [index, setIndex] = useState(0)
  const { tr, play } = useTroll()
  const switchMood = () => {
    const available = moods.map((_, moodIndex) => moodIndex).filter((moodIndex) => moodIndex !== index)
    setIndex(available[Math.floor(Math.random() * available.length)])
    play()
  }
  return (
    <MiniGame number={15} title="Random Mood Switch" blurb="One tiny click. A whole new boyfriend.">
      {() => (
        <motion.div className={`tz-center tz-mood ${moods[index].className}`} key={index} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <span className="tz-big-emoji">{moods[index].emoji}</span>
          <p className="tz-prompt" aria-live="polite">{tr(moods[index].mood)}</p>
          <Button onClick={switchMood}>Switch my mood 🎛️</Button>
        </motion.div>
      )}
    </MiniGame>
  )
}

function FindHiddenSurya() {
  const [found, setFound] = useState<number | null>(null)
  const hidden = useRef<number | null>(null)
  const { play, tr } = useTroll()
  return (
    <MiniGame number={16} title="Find Hidden Surya" blurb="He is hiding in one of these tiny hearts.">
      {() => (
        <div className="tz-find-grid">
          {Array.from({ length: 12 }, (_, index) => (
            <Button
              key={index}
              kind="soft"
              aria-label={`Reveal heart ${index + 1}`}
              onClick={() => {
                if (found !== null) return
                const target = hidden.current ?? Math.floor(Math.random() * 12)
                hidden.current = target
                if (index === target) { setFound(index); play() }
              }}
            >
              {found === index ? '🧑🏽‍🦱' : found !== null ? '🤍' : '💗'}
            </Button>
          ))}
          <p className="tz-prompt tz-full-row" aria-live="polite">{found !== null ? tr({ en: 'Found him! He was hiding to get your attention 🥰', mlg: 'Kandupidichu! Ninte attention venamennu paranju ollichirunnatha 🥰', ml: 'കണ്ടുപിടിച്ചു! നിന്റെ ശ്രദ്ധ കിട്ടാൻ ഒളിച്ചിരിക്കുകയായിരുന്നു 🥰' }) : tr({ en: 'Pick a heart to uncover him.', mlg: 'Avane kandupidikkan oru heart choose cheyyu.', ml: 'അവനെ കണ്ടെത്താൻ ഒരു ഹൃദയം തിരഞ്ഞെടുക്കൂ.' })}</p>
        </div>
      )}
    </MiniGame>
  )
}

function JealousSurya() {
  const [rival, setRival] = useState('')
  const { say } = useTroll()
  return (
    <MiniGame number={17} title="Jealous Surya" blurb="Choose who stole your attention.">
      {() => (
        <div className="tz-center">
          <p className="tz-prompt">Who are you looking at? 👀</p>
          <div className="tz-duet">
            {['📱 My phone', '🐱 A cat', '🍕 Pizza'].map((choice) => <Button key={choice} kind="soft" onClick={() => setRival(choice)}>{choice}</Button>)}
          </div>
          {rival && <motion.div className="tz-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }} aria-live="polite"><p className="tz-reply">“{rival}?? What about me?” 🥺 {say('jealous')}</p><Button onClick={() => setRival('')}>You're my favourite ❤️</Button></motion.div>}
        </div>
      )}
    </MiniGame>
  )
}

function SecretPasswordGame() {
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const { language, play, tr } = useTroll()
  const placeholder = language === 'ml' ? 'പാസ്‌വേഡ്' : language === 'mlg' ? 'Password type cheyyu' : 'Enter a secret password'
  return (
    <MiniGame number={18} title="Secret Password Game" blurb="Hint: your password has four letters and a lot of love.">
      {() => (
        <form className="tz-center" onSubmit={(event) => {
          event.preventDefault()
          if (['LOVE', 'HUGS', 'SURYA', 'MINE'].includes(password.trim().toUpperCase())) { setUnlocked(true); play() }
          else setUnlocked(false)
        }}>
          <label className="tz-visually-hidden" htmlFor="tz-password">Secret password</label>
          <input id="tz-password" className="tz-input" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={placeholder} autoComplete="off" />
          <Button type="submit">Unlock 💌</Button>
          <p className="tz-prompt" aria-live="polite">{unlocked ? tr({ en: 'Unlocked! Your prize is one very real virtual hug 🤗', mlg: 'Unlock aayi! Oru virtual hug aanu prize 🤗', ml: 'തുറന്നു! നിനക്കൊരു വെർച്വൽ ആലിംഗനം സമ്മാനം 🤗' }) : password ? tr({ en: 'Not quite… try LOVE, HUGS, MINE, or SURYA.', mlg: 'Sheriyalla… LOVE, HUGS, MINE, SURYA try cheyyu.', ml: 'ശരിയായില്ല… LOVE, HUGS, MINE, SURYA പരീക്ഷിക്കൂ.' }) : tr({ en: 'The password is hidden in plain sight.', mlg: 'Password ninte munpil thanne undu.', ml: 'പാസ്‌വേഡ് കൺമുന്നിൽ തന്നെയുണ്ട്.' })}</p>
        </form>
      )}
    </MiniGame>
  )
}

function FakeBreakupButton() {
  const [revealed, setRevealed] = useState(false)
  const { tr } = useTroll()
  return (
    <MiniGame number={19} title="Fake Breakup Button" blurb="A dramatic button with a very undramatic ending.">
      {() => (
        <div className="tz-center">
          {revealed
            ? <motion.div initial={{ scale: 0.7, rotate: -3 }} animate={{ scale: 1, rotate: 0 }} className="tz-dialog">
                <p className="tz-prompt">{tr({ en: 'We are breaking up… the last slice of pizza. You can have it 🍕❤️', mlg: 'Nammal break up aanu… last pizza slice aayittu. Ninakku edutho 🍕❤️', ml: 'നമ്മൾ പിരിയുകയാണ്… പിസ്സയുടെ അവസാന കഷ്ണം. അത് നിനക്കെടുക്കാം 🍕❤️' })}</p>
                <Button onClick={() => setRevealed(false)}>Okay, I forgive the pizza 😌</Button>
              </motion.div>
            : <Button kind="soft" onClick={() => setRevealed(true)}>We need to talk… 😳</Button>}
        </div>
      )}
    </MiniGame>
  )
}

function VirtualHugDelivery() {
  const [delivered, setDelivered] = useState(false)
  const { say, play } = useTroll()
  return (
    <MiniGame number={20} title="Virtual Hug Delivery" blurb="Sending one freshly packed cuddle.">
      {() => (
        <div className="tz-center">
          <AnimatePresence mode="wait">
            <motion.div key={String(delivered)} className="tz-big-emoji" initial={{ x: -45, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 45, opacity: 0 }}>
              {delivered ? '🫂💌' : '📦'}
            </motion.div>
          </AnimatePresence>
          <Button onClick={() => { setDelivered(true); play() }}>{delivered ? 'Send another hug 💞' : 'Deliver my hug 🚚'}</Button>
          <p className="tz-prompt" aria-live="polite">{delivered ? say('hug') : 'Free delivery. No return policy.'}</p>
        </div>
      )}
    </MiniGame>
  )
}

function EnthaMoleConversation() {
  const { language, play } = useTroll()
  const lines: Record<Language, { question: string; answers: string[]; responses: string[] }> = {
    en: { question: '“Hey, what are you doing?”', answers: ['Thinking of you 💭', 'Eating snacks 🍿', 'Nothing at all 😇'], responses: ['Aww, keep going ❤️', 'Save me a bite! 😋', 'Suspiciously cute.'] },
    mlg: { question: '“Entha mole, entha cheyyunne?”', answers: ['Ninne orthu 💭', 'Snacks kazhikkua 🍿', 'Onnum illa 😇'], responses: ['Aww, continue cheyyu ❤️', 'Enikkum oru bite thaa! 😋', 'Ithu alpam suspicious aanu.'] },
    ml: { question: '“എന്താ മോളേ, എന്തു ചെയ്യുന്നു?”', answers: ['നിന്നെ ഓർക്കുന്നു 💭', 'സ്നാക്ക്സ് കഴിക്കുന്നു 🍿', 'ഒന്നുമില്ല 😇'], responses: ['അയ്യോ, തുടർന്നോളൂ ❤️', 'എനിക്കും കുറച്ച് താ! 😋', 'ഇത് കുറച്ച് സംശയാസ്പദമാണ്.'] },
  }
  const [answer, setAnswer] = useState<number | null>(null)
  const copy = lines[language]
  return (
    <MiniGame number={21} title="Entha Mole Conversation" blurb="A tiny choose-your-own-adventure.">
      {() => (
        <div>
          <p className="tz-prompt">Surya: {copy.question}</p>
          <div className="tz-choice-list">{copy.answers.map((choice, index) => <Button key={choice} kind="soft" onClick={() => { setAnswer(index); play() }}>{choice}</Button>)}</div>
          {answer !== null && <p className="tz-reply" aria-live="polite">Savitha: “{copy.responses[answer]}” 💗</p>}
        </div>
      )}
    </MiniGame>
  )
}

function OnnumIllaDetector() {
  const { language } = useTroll()
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!scanning) return
    const timer = window.setTimeout(() => { setScanning(false); setDone(true) }, 1000)
    return () => window.clearTimeout(timer)
  }, [scanning])
  const copy: Record<Language, string> = {
    en: 'Detector result: 100% adorable “nothing” detected.',
    mlg: 'Detector parayunnu: 100% cute aaya “onnum illa.”',
    ml: 'പരിശോധനാ ഫലം: 100% ക്യൂട്ടായ “ഒന്നുമില്ല.”',
  }
  return (
    <MiniGame number={22} title="Onnum Illa Detector" blurb="Run a highly scientific nothing scan.">
      {() => (
        <div className="tz-center">
          <motion.div className="tz-scanner" animate={scanning ? { rotate: 360 } : { rotate: 0 }} transition={scanning ? { repeat: Infinity, duration: 1.2, ease: 'linear' } : { duration: 0.2 }}>{scanning ? '🔎' : done ? '✅' : '📡'}</motion.div>
          {scanning && <div className="tz-progress"><motion.span animate={{ width: ['4%', '95%'] }} transition={{ duration: 0.95 }} /></div>}
          <p className="tz-prompt" aria-live="polite">{scanning ? language === 'ml' ? '“ഒന്നുമില്ല” എന്ന് സ്കാൻ ചെയ്യുന്നു…' : language === 'mlg' ? '“Onnum illa” scan cheyyunnu…' : 'Scanning “nothing”…' : done ? copy[language] : language === 'ml' ? 'സംശയകരമായ “ഒന്നുമില്ല” പരിശോധിക്കൂ.' : language === 'mlg' ? 'Suspicious “onnum illa” check cheyyu.' : 'Inspect the suspicious “nothing.”'}</p>
          <Button onClick={() => { setDone(false); setScanning(true) }}>{scanning ? 'Scanning…' : 'Start detector 🔍'}</Button>
        </div>
      )}
    </MiniGame>
  )
}

function NjanCuteAlleTest() {
  const [value, setValue] = useState(0)
  const [running, setRunning] = useState(false)
  const { language } = useTroll()
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setValue((current) => {
      if (current >= 100) { window.clearInterval(timer); setRunning(false); return 100 }
      return current + 5
    }), 70)
    return () => window.clearInterval(timer)
  }, [running])
  return (
    <MiniGame number={23} title="Njan Cute Alle Test" blurb="Official cuteness science. Extremely peer-reviewed.">
      {() => (
        <div className="tz-center">
          <div className="tz-meter"><motion.span animate={{ width: `${value}%` }} /></div>
          <p className="tz-prompt" aria-live="polite">
            {value === 100
              ? language === 'ml' ? 'ഫലം: 100% ക്യൂട്ട്. ശാസ്ത്രീയ സത്യം! 😍' : language === 'mlg' ? 'Result: 100% cute aanu. Scientific fact! 😍' : 'Result: 100% cute. Scientific fact! 😍'
              : running
                ? `${language === 'ml' ? 'ക്യൂട്ട്നസ് അളക്കുന്നു' : language === 'mlg' ? 'Cuteness measure cheyyunnu' : 'Measuring cuteness'}… ${value}%`
                : language === 'ml' ? 'തയ്യാറാകുമ്പോൾ തുടങ്ങാം!' : language === 'mlg' ? 'Ready aakumbo start cheyyam!' : 'Ready when you are!'}
          </p>
          {value < 100 && <Button onClick={() => { setValue(0); setRunning(true) }}>Test my cuteness 🧪</Button>}
          {value === 100 && <Button kind="soft" onClick={() => { setValue(0); setRunning(false) }}>Retest ↺</Button>}
        </div>
      )}
    </MiniGame>
  )
}

function SorryMoleMachine() {
  const [apologies, setApologies] = useState(0)
  const { language, say, play } = useTroll()
  const prompt: Record<Language, string> = {
    en: 'Apology machine ready. Press for a sincere-ish sorry.',
    mlg: 'Sorry machine ready aanu. Oru sorry adichu nokku.',
    ml: 'സോറി മെഷീൻ റെഡിയാണ്. ഒരു സോറി പരീക്ഷിക്കൂ.',
  }
  return (
    <MiniGame number={24} title="Sorry Mole Machine" blurb="One button, many increasingly dramatic apologies.">
      {() => (
        <div className="tz-center">
          <p className="tz-prompt" aria-live="polite">{apologies ? `${say('sorry')} (${apologies})` : prompt[language]}</p>
          <Button onClick={() => { setApologies((n) => n + 1); play() }}>Sooooory mole 🥺</Button>
          {apologies >= 3 && <motion.span className="tz-big-emoji" initial={{ rotate: -12 }} animate={{ rotate: 12, scale: 1.1 }}>🥺💐</motion.span>}
        </div>
      )}
    </MiniGame>
  )
}

function GirlfriendRemoteControl() {
  const [mode, setMode] = useState('Normal boyfriend')
  const { play } = useTroll()
  return (
    <MiniGame number={25} title="Girlfriend Remote Control" blurb="Works on exactly one Surya. Warranty: hugs only.">
      {() => (
        <div className="tz-center">
          <motion.div key={mode} className="tz-big-emoji" initial={{ rotate: -18, scale: 0.7 }} animate={{ rotate: 0, scale: 1 }}>{mode.includes('Dance') ? '🕺🏽' : mode.includes('Freeze') ? '🧊' : mode.includes('Snack') ? '🍕' : '🧑🏽‍🦱'}</motion.div>
          <p className="tz-prompt" aria-live="polite">Remote: <strong>{mode}</strong></p>
          <div className="tz-choice-list">
            {['Dance mode 💃', 'Freeze mode 🧊', 'Snack mode 🍕', 'Normal boyfriend'].map((choice) => <Button key={choice} kind="soft" onClick={() => { setMode(choice); play() }}>{choice}</Button>)}
          </div>
        </div>
      )}
    </MiniGame>
  )
}

function InteractiveSun() {
  const [sunny, setSunny] = useState(false)
  const { play, tr } = useTroll()
  return (
    <MiniGame number={26} title="Interactive Sun" blurb="Give the sun a tap. It has a message for you.">
      {() => (
        <div className={`tz-center tz-sun-scene ${sunny ? 'is-sunny' : ''}`}>
          <motion.button type="button" className="tz-sun" animate={{ rotate: sunny ? 25 : 0, scale: sunny ? 1.2 : 1 }} onClick={() => { setSunny((value) => !value); play() }} aria-label="Toggle the interactive sun">{sunny ? '🌞' : '🌤️'}</motion.button>
          <p className="tz-prompt" aria-live="polite">{sunny ? tr({ en: 'You are my sunshine, even on Monday ☀️', mlg: 'Monday aanelum nee ente sunshine aanu ☀️', ml: 'തിങ്കളാഴ്ചയായാലും നീയാണ് എന്റെ സൂര്യപ്രകാശം ☀️' }) : tr({ en: 'The clouds are waiting for you.', mlg: 'Clouds ninne wait cheyyunnu.', ml: 'മേഘങ്ങൾ നിനക്കായി കാത്തിരിക്കുന്നു.' })}</p>
        </div>
      )}
    </MiniGame>
  )
}

function HiddenStarMessages() {
  const [revealed, setRevealed] = useState<number[]>([])
  const { language, play } = useTroll()
  const notes: Record<Language, string[]> = {
    en: ['You are my favourite hello 💗', 'Your laugh is my comfort song 🎶', 'Pick me. Every universe. 🌙', 'You make ordinary days sparkle ✨'],
    mlg: ['Nee aanu ente favourite hello 💗', 'Ninte chiriyanu ente comfort song 🎶', 'Ella universe-ilum enne choose cheyyu 🌙', 'Ordinary days polum nee sparkle aakkunnu ✨'],
    ml: ['എന്റെ പ്രിയപ്പെട്ട തുടക്കം നീയാണ് 💗', 'നിന്റെ ചിരിയാണ് എന്റെ ആശ്വാസഗാനം 🎶', 'എല്ലാ പ്രപഞ്ചത്തിലും എന്നെ തിരഞ്ഞെടുക്കൂ 🌙', 'സാധാരണ ദിവസങ്ങൾ പോലും നീ മനോഹരമാക്കുന്നു ✨'],
  }
  return (
    <MiniGame number={27} title="Hidden Star Messages" blurb="Tap the stars to find secret notes.">
      {() => (
        <div className="tz-star-grid">
          {notes[language].map((note, index) => (
            <motion.button
              key={note}
              type="button"
              className={`tz-star-tile ${revealed.includes(index) ? 'is-revealed' : ''}`}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                setRevealed((current) => current.includes(index) ? current : [...current, index])
                play()
              }}
            >
              {revealed.includes(index) ? note : '⭐ Tap me'}
            </motion.button>
          ))}
        </div>
      )}
    </MiniGame>
  )
}

function MiniGirlfriendFlyingKiss() {
  const [kiss, setKiss] = useState(0)
  const { play, tr } = useTroll()
  return (
    <MiniGame number={28} title="Mini Girlfriend Flying Kiss" blurb="Send a kiss across the screen.">
      {() => (
        <div className="tz-center tz-kiss-zone">
          <span className="tz-mini-girl">👩🏽‍🦰</span>
          <motion.span
            key={kiss}
            className="tz-flying-kiss"
            initial={{ x: -24, y: 16, scale: 0.5, opacity: 0 }}
            animate={kiss ? { x: 110, y: -28, scale: 1.5, opacity: [0, 1, 1, 0] } : { opacity: 0 }}
            transition={{ duration: 0.85 }}
          >💋</motion.span>
          <span className="tz-kiss-target">🧑🏽‍🦱</span>
          <Button onClick={() => { setKiss((n) => n + 1); play() }}>Blow a kiss 😘</Button>
          <p className="tz-prompt">{tr({ en: 'Kisses delivered', mlg: 'Kisses ayachu', ml: 'ചുംബനങ്ങൾ എത്തിച്ചു' })}: {kiss}</p>
        </div>
      )}
    </MiniGame>
  )
}

function MiniSuryaReactions() {
  const [reaction, setReaction] = useState('🙂')
  const { language, play } = useTroll()
  return (
    <MiniGame number={29} title="Mini Surya Reactions" blurb="Give Mini Surya a mood.">
      {() => (
        <div className="tz-center">
          <motion.span key={reaction} className="tz-big-emoji" initial={{ rotate: -12, scale: 0.75 }} animate={{ rotate: 0, scale: 1 }}>{reaction}</motion.span>
          <div className="tz-duet">
            {['🥰', '😳', '😂', '🥺', '😎'].map((face) => <Button key={face} kind="soft" aria-label={`Make Mini Surya react ${face}`} onClick={() => { setReaction(face); play() }}>{face}</Button>)}
          </div>
          <p className="tz-prompt">{language === 'ml' ? 'ഇപ്പോഴത്തെ പ്രതികരണം' : language === 'mlg' ? 'Ippozhathe reaction' : 'His current reaction'}: {reaction}</p>
        </div>
      )}
    </MiniGame>
  )
}

function PhoneShakeHeartRain() {
  const [enabled, setEnabled] = useState(false)
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([])
  const lastShake = useRef(0)
  const nextHeart = useRef(0)
  const { language, play } = useTroll()
  const rain = useCallback(() => {
    const burst = Array.from({ length: 12 }, () => ({ id: ++nextHeart.current, x: Math.random() * 260 - 130 }))
    setHearts((current) => [...current, ...burst].slice(-30))
    play()
  }, [play])
  useEffect(() => {
    if (!enabled) return
    const onMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity
      if (acceleration?.x == null || acceleration.y == null) return
      const now = Date.now()
      if (Math.abs(acceleration.x) + Math.abs(acceleration.y) > 24 && now - lastShake.current > 1400) {
        lastShake.current = now
        rain()
      }
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [enabled, rain])
  return (
    <MiniGame number={30} title="Phone Shake Heart Rain" blurb="Shake your phone, or tap the button if you prefer.">
      {() => (
        <div className="tz-center tz-rain-area">
          <div className="tz-rain" aria-live="polite">
            <AnimatePresence>
              {hearts.map((heart) => (
                <motion.span
                  key={heart.id}
                  initial={{ opacity: 1, y: -12, x: 0, rotate: 0 }}
                  animate={{ opacity: 0, y: 125, x: heart.x, rotate: 35 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.7, ease: 'easeIn' }}
                  onAnimationComplete={() => setHearts((current) => current.filter((item) => item.id !== heart.id))}
                >💗</motion.span>
              ))}
            </AnimatePresence>
          </div>
          <Button onClick={rain}>{language === 'ml' ? 'ഹൃദയമഴ പെയ്യിക്കൂ 💕' : language === 'mlg' ? 'Heart rain varatte 💕' : 'Make it rain hearts 💕'}</Button>
          <Button kind="soft" onClick={() => setEnabled((value) => !value)}>{enabled ? language === 'ml' ? 'ഫോൺ ഷേക്ക് ഓഫ് ചെയ്യൂ' : language === 'mlg' ? 'Phone shake off cheyyu' : 'Phone shake is on · tap to turn off' : language === 'ml' ? 'ഫോൺ ഷേക്ക് ഓണാക്കൂ 📱' : language === 'mlg' ? 'Phone shake enable cheyyu 📱' : 'Enable phone shake 📱'}</Button>
          <p className="tz-prompt" aria-live="polite">{enabled ? language === 'ml' ? 'ഫോൺ മെല്ലെ കുലുക്കൂ!' : language === 'mlg' ? 'Phone gentle aayi shake cheyyu!' : 'Give your phone a gentle shake!' : language === 'ml' ? 'ബ്രൗസർ അനുവദിച്ചാൽ ഫോൺ ഷേക്ക് പ്രവർത്തിക്കും.' : language === 'mlg' ? 'Browser support undengil phone shake work aavum.' : 'Mobile shake supported where your browser allows it.'}</p>
        </div>
      )}
    </MiniGame>
  )
}

const games = [
  ImpossibleNoButton,
  DontTouchMyHeart,
  CatchMeIfYouCan,
  AngryButton,
  FakeLoadingSurprise,
  DisappearingGiftBox,
  AreYouSurePopup,
  InfiniteHugButton,
  WrongAnswerQuiz,
  FakeExitButton,
  SlapSuryaAnimation,
  FeedMiniSurya,
  KissCounter,
  LoveBomb,
  RandomMoodSwitch,
  FindHiddenSurya,
  JealousSurya,
  SecretPasswordGame,
  FakeBreakupButton,
  VirtualHugDelivery,
  EnthaMoleConversation,
  OnnumIllaDetector,
  NjanCuteAlleTest,
  SorryMoleMachine,
  GirlfriendRemoteControl,
  InteractiveSun,
  HiddenStarMessages,
  MiniGirlfriendFlyingKiss,
  MiniSuryaReactions,
  PhoneShakeHeartRain,
]

export function TrollZone() {
  const [language, setLanguage] = useState<Language>('en')
  const [sound, setSound] = useState(false)
  const say = useCallback((key: string) => {
    const options = replies[key] ?? replies.love
    const choice = options[Math.floor(Math.random() * options.length)]
    return choice[language]
  }, [language])
  const tr = useCallback((copy: Copy) => copy[language], [language])
  const play = useCallback(() => {
    if (!sound || typeof window === 'undefined' || !window.AudioContext) return
    const audio = new window.AudioContext()
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(660, audio.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(880, audio.currentTime + 0.08)
    gain.gain.setValueAtTime(0.13, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.16)
    oscillator.connect(gain)
    gain.connect(audio.destination)
    oscillator.start()
    oscillator.stop(audio.currentTime + 0.16)
    oscillator.onended = () => { void audio.close() }
  }, [sound])
  const context = { language, sound, say, tr, play }

  return (
    <TrollContext.Provider value={context}>
      <section className="section troll-zone" id="troll-zone">
        <div className="tz-heading">
          <span className="tz-eyebrow">Savitha's highly unserious laboratory</span>
          <h2 className="section-title">TROLL YOUR BOYFRIEND 😂❤️</h2>
          <p className="section-sub">
            Thirty tiny mischiefs, unlimited hugs. Surya, you have been lovingly warned.
          </p>
          <div className="tz-settings">
            <label htmlFor="tz-language">Dialogue</label>
            <select id="tz-language" value={language} onChange={(event) => {
              const nextLanguage = event.currentTarget.value
              if (isLanguage(nextLanguage)) setLanguage(nextLanguage)
            }}>
              <option value="en">English</option>
              <option value="mlg">Manglish</option>
              <option value="ml">മലയാളം</option>
            </select>
            <Button kind="soft" aria-pressed={sound} onClick={() => setSound((value) => !value)}>
              {sound ? '🔊 Sound on' : '🔇 Sound off'}
            </Button>
          </div>
        </div>
        <div className="tz-grid">
          {games.map((Component, index) => <TrollGame key={index} component={Component} />)}
        </div>
        <p className="tz-footer-note">All drama is pretend. All hugs are real. 💌</p>
      </section>
    </TrollContext.Provider>
  )
}

function TrollGame({ component: Component }: { component: React.ComponentType }) {
  const [resetKey, setResetKey] = useState(0)
  return (
    <GameResetContext.Provider value={() => setResetKey((current) => current + 1)}>
      <Component key={resetKey} />
    </GameResetContext.Provider>
  )
}
