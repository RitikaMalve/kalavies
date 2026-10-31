export async function GET() {
  return new Response('google-site-verification: google0cac7971f9d38375.html', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
