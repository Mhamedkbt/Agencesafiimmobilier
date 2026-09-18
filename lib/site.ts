export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'https://Agencesafiimmobilier.vercel.app/').replace(/\/$/, '')
}
