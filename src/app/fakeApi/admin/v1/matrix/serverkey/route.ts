import { NextResponse } from 'next/server'

const fakeKeys: Record<string, { server_name: string; verify_keys: Record<string, any> }> = {}

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/matrix/serverkey')
  }
  const server_name = 'sogo.example.com'
  if (!fakeKeys[server_name]) {
    fakeKeys[server_name] = {
      server_name,
      verify_keys: {
        'ed25519:fake_pub_key': {
          key: 'MCowBQYDK2VuAyEAAAAQcGFja2VkX2Rlc2NyaXB0aW9uX3NlZWRf',
        },
      },
    }
  }
  return NextResponse.json({ success: true, data: fakeKeys[server_name] })
}
