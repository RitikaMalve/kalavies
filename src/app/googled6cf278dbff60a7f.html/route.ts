export async function GET() {
  return new Response('google-site-verification: googled6cf278dbff60a7f.html', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
