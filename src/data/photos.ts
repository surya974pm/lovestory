export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export type Photo = {
  src: string
  caption: string
  alt: string
}

export const aiPhotos: Photo[] = [
  {
    src: asset('ai/moonlight.jpg'),
    caption: 'Our little moonlight 🌙',
    alt: 'Surya and Savitha cuddled under fairy lights and a full moon',
  },
  {
    src: asset('ai/two-hearts.jpg'),
    caption: 'Two hearts, one universe ❤️',
    alt: 'Surya and Savitha love montage with polaroid memories',
  },
  {
    src: asset('ai/little-world.jpg'),
    caption: 'Our favourite little world 🌸',
    alt: 'Mini Surya and Mini Savitha on a flower-covered garden swing',
  },
  {
    src: asset('ai/ice-cream.jpg'),
    caption: 'Ice cream dates forever 🍦',
    alt: 'Surya and Savitha sharing ice cream on a sunset beach',
  },
]

export const realPhotos: Photo[] = [
  { src: asset('memories/07.jpg'), caption: 'The day the saree stole the show', alt: 'Surya and Savitha selfie' },
  { src: asset('memories/04.jpg'), caption: 'That quiet smile we keep coming back to', alt: 'Surya and Savitha together' },
  { src: asset('memories/05.jpg'), caption: 'Hand in hand, always', alt: 'Surya and Savitha holding hands' },
  { src: asset('memories/06.jpg'), caption: 'Our favourite kind of ordinary', alt: 'Surya and Savitha outdoor portrait' },
  { src: asset('memories/08.jpg'), caption: 'Rain-kissed streets, still glowing', alt: 'Surya and Savitha after rain' },
  { src: asset('memories/14.jpg'), caption: 'Lost in the mist, found in each other', alt: 'Surya and Savitha in the hills' },
  { src: asset('memories/01.jpg'), caption: 'Savitha, in every shade of grace', alt: 'Savitha in a cream saree' },
  { src: asset('memories/02.jpg'), caption: 'A little pose, a whole universe', alt: 'Savitha portrait' },
  { src: asset('memories/03.jpg'), caption: 'Soft light, softer heart', alt: 'Savitha smiling' },
  { src: asset('memories/09.jpg'), caption: 'Balcony thoughts and monsoon air', alt: 'Savitha on the balcony' },
  { src: asset('memories/10.jpg'), caption: 'That look. That lipstick. That love.', alt: 'Savitha close-up selfie' },
  { src: asset('memories/11.jpg'), caption: 'A candid we never get tired of', alt: 'Savitha candid' },
  { src: asset('memories/12.jpg'), caption: 'Home feels like this', alt: 'Savitha at home' },
  { src: asset('memories/13.jpg'), caption: 'Every angle is a favourite', alt: 'Savitha portrait selfie' },
  { src: asset('memories/15.jpg'), caption: 'Mirror, mirror — still my favourite view', alt: 'Savitha mirror selfie' },
]
