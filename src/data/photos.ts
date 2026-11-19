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
  {
    src: asset('ai/coffee-chaos.png'),
    caption: 'Coffee & chaos, always ☕',
    alt: 'Surya and Savitha sharing a cafe selfie with playful doodles',
  },
]

export const realPhotos: Photo[] = [
  { src: asset('memories/IMG_4403.jpg'), caption: 'City lights, just us', alt: 'Surya and Savitha together under city lights' },
  { src: asset('memories/IMG_4392.jpg'), caption: 'A little closer under the trees', alt: 'Surya and Savitha sharing a leafy outdoor selfie' },
  { src: asset('memories/IMG_4352.jpg'), caption: 'Helmet hair, happy hearts', alt: 'Surya and Savitha wearing helmets on a ride' },
  { src: asset('memories/IMG_4368.jpg'), caption: 'Taking the scenic route', alt: 'Surya and Savitha on a ride beneath palm trees' },
  { src: asset('memories/QYCT7473.jpg'), caption: 'A quiet moment together', alt: 'Surya and Savitha sharing an indoor selfie' },
  { src: asset('memories/IMG_3383.jpg'), caption: 'One more selfie, one more memory', alt: 'Surya and Savitha smiling together indoors' },
  { src: asset('memories/IMG_E3381.jpg'), caption: 'Our favourite side-by-side smile', alt: 'Surya and Savitha taking a selfie together' },
  { src: asset('memories/IMG_3329.jpg'), caption: 'Soft smiles in our favourite colours', alt: 'Surya in yellow and Savitha in purple' },
  { src: asset('memories/IMG_0484.jpg'), caption: 'Same day, same favourite person', alt: 'Surya and Savitha sharing a close-up selfie' },
  { src: asset('memories/IMG_E0484.jpg'), caption: 'The little moments feel like forever', alt: 'Surya and Savitha smiling close together' },
]
